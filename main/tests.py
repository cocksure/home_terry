import json
import shutil
import tempfile
from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image

from .models import Product, ProductCategory, ProductImage, thumb_name

TEMP_MEDIA = tempfile.mkdtemp()


def make_upload(name, fmt, size=(3000, 2000)):
    buf = BytesIO()
    Image.new('RGB', size, (200, 120, 40)).save(buf, format=fmt)
    return SimpleUploadedFile(name, buf.getvalue())


@override_settings(MEDIA_ROOT=TEMP_MEDIA)
class ProductImageProcessingTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA, ignore_errors=True)

    def setUp(self):
        category = ProductCategory.objects.create(name='Bath')
        self.product = Product.objects.create(category=category, name='Towel', size='70x140', color='white')

    def test_upload_converted_to_webp_without_downscaling(self):
        obj = ProductImage.objects.create(product=self.product, image=make_upload('photo.jpg', 'JPEG'))
        self.assertTrue(obj.image.name.endswith('.webp'))
        with Image.open(obj.image.path) as img:
            self.assertEqual(img.size, (3000, 2000))

    def test_thumbnail_created(self):
        obj = ProductImage.objects.create(product=self.product, image=make_upload('photo.png', 'PNG'))
        self.assertTrue(obj.image.storage.exists(thumb_name(obj.image.name)))
        self.assertIn('_thumb.webp', obj.thumb_url)

    def test_png_converted_losslessly(self):
        upload = make_upload('photo.png', 'PNG', size=(400, 300))
        with Image.open(BytesIO(upload.read())) as src:
            original_pixels = list(src.convert('RGB').getdata())
        upload.seek(0)
        obj = ProductImage.objects.create(product=self.product, image=upload)
        with Image.open(obj.image.path) as img:
            self.assertEqual(list(img.convert('RGB').getdata()), original_pixels)

    def test_resave_does_not_reencode(self):
        obj = ProductImage.objects.create(product=self.product, image=make_upload('photo.jpg', 'JPEG'))
        name = obj.image.name
        obj.order = 5
        obj.save()
        self.assertEqual(obj.image.name, name)

    def test_webp_kept_byte_for_byte(self):
        upload = make_upload('ready.webp', 'WEBP')
        original = upload.read()
        upload.seek(0)
        obj = ProductImage.objects.create(product=self.product, image=upload)
        with open(obj.image.path, 'rb') as f:
            self.assertEqual(f.read(), original)

    def test_cyrillic_filename_gets_safe_name(self):
        obj = ProductImage.objects.create(product=self.product, image=make_upload('полотенце.jpg', 'JPEG'))
        self.assertRegex(obj.image.name, r'^products/[0-9a-f]{12}(_\w+)?\.webp$')


@override_settings(TELEGRAM_BOT_TOKEN='', TELEGRAM_CHAT_ID='')
class ContactFormPhoneTests(TestCase):
    """Клиенты в основном из-за рубежа: форма должна принимать номер любой страны."""

    def post(self, phone, ip):
        payload = {'name': 'Anna', 'phone': phone, 'email': 'anna@example.com',
                   'subject': 'Price list', 'message': 'Hello'}
        return self.client.post('/api/submit-contact/', data=json.dumps(payload),
                                content_type='application/json', REMOTE_ADDR=ip)

    def assertPhoneAccepted(self, response):
        # Без настроек Telegram валидная заявка доходит до проверки бота (500), а не падает на телефоне (400)
        self.assertNotEqual(response.status_code, 400, response.content)

    def test_foreign_numbers_accepted(self):
        self.assertPhoneAccepted(self.post('+49 30 1234567', '10.0.0.1'))
        self.assertPhoneAccepted(self.post('+1 (555) 123-4567', '10.0.0.2'))
        self.assertPhoneAccepted(self.post('+998 93 723 05 05', '10.0.0.3'))

    def test_garbage_rejected(self):
        self.assertEqual(self.post('call me', '10.0.0.4').status_code, 400)
        self.assertEqual(self.post('+12', '10.0.0.5').status_code, 400)


class PrivacyPageTests(TestCase):
    def test_privacy_page_in_all_languages(self):
        for prefix, marker in (('', 'ООО «HOME TERRY TEXTILE»'), ('/en', 'HOME TERRY TEXTILE LLC'),
                               ('/uz', '"HOME TERRY TEXTILE" MChJ')):
            response = self.client.get(f'{prefix}/privacy/')
            self.assertEqual(response.status_code, 200, prefix)
            self.assertContains(response, marker)
            self.assertContains(response, 'info@hometerry.uz')

    def test_contact_form_links_to_privacy(self):
        self.assertContains(self.client.get('/contact/'), 'href="/privacy/"')
