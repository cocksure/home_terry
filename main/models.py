import os
import uuid
from io import BytesIO

from PIL import Image, ImageOps
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.validators import FileExtensionValidator
from django.db import models
from django.urls import reverse
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _


# Махру разглядывают через лупу, поэтому фото сжимаем почти без потерь
# и не уменьшаем обычные снимки с телефона/камеры (до 4096px по длинной стороне).
# PNG конвертируется в WebP без потерь (пиксель в пиксель), JPEG — с качеством 95.
WEBP_QUALITY = 95
THUMB_QUALITY = 90
THUMB_SIZE = 800  # превью для карточек в сетке каталога
PRODUCT_MAX_SIDE = 4096
CATEGORY_MAX_SIDE = 2048
BLOG_MAX_SIDE = 2560


def _encode_webp(img, quality, lossless=False):
    output = BytesIO()
    params = {'format': 'WEBP', 'quality': quality, 'method': 6, 'lossless': lossless}
    if lossless:
        params['quality'] = 100  # в lossless-режиме это сила сжатия, а не качество
    if img.info.get('icc_profile'):
        params['icc_profile'] = img.info['icc_profile']
    img.save(output, **params)
    return output.getvalue()


def process_image(image, max_side=None, quality=WEBP_QUALITY):
    """Конвертирует загруженное фото в WebP. Возвращает (имя файла, ContentFile).

    Уже готовый WebP без поворота и без уменьшения сохраняется байт в байт,
    чтобы не терять качество на повторном сжатии.
    """
    try:
        image.seek(0)
        original_bytes = image.read()
        img = Image.open(BytesIO(original_bytes))
        source_format = img.format

        if source_format not in ('JPEG', 'PNG', 'WEBP'):
            raise ValueError(f"Неподдерживаемый формат: {source_format}")

        orientation = img.getexif().get(0x0112, 1)
        img = ImageOps.exif_transpose(img)
        if img.mode not in ('RGB', 'RGBA'):
            has_alpha = 'A' in img.getbands() or 'transparency' in img.info
            img = img.convert('RGBA' if has_alpha else 'RGB')

        resized = False
        if max_side and max(img.size) > max_side:
            img.thumbnail((max_side, max_side), Image.LANCZOS)
            resized = True

        if source_format == 'WEBP' and not resized and orientation == 1:
            data = original_bytes
        else:
            data = _encode_webp(img, quality, lossless=source_format == 'PNG')

        filename_wo_ext = os.path.splitext(os.path.basename(image.name))[0]
        safe_name = (slugify(filename_wo_ext) or uuid.uuid4().hex[:12]) + '.webp'

        return safe_name, ContentFile(data)

    except Exception as e:
        raise ValueError(f"Ошибка при обработке изображения: {e}")


def thumb_name(name):
    stem, _ = os.path.splitext(name)
    return f'{stem}_thumb.webp'


def make_thumbnail(field_file, size=THUMB_SIZE):
    """Создаёт уменьшенную копию рядом с оригиналом: <имя>_thumb.webp."""
    storage = field_file.storage
    with storage.open(field_file.name) as f:
        img = Image.open(f)
        img.load()
    if img.mode not in ('RGB', 'RGBA'):
        img = img.convert('RGB')
    img.thumbnail((size, size), Image.LANCZOS)

    name = thumb_name(field_file.name)
    if storage.exists(name):
        storage.delete(name)
    storage.save(name, ContentFile(_encode_webp(img, THUMB_QUALITY)))


def is_new_upload(field_file):
    """True только для только что загруженного файла, а не при каждом save()."""
    return bool(field_file) and not field_file._committed


class ProductCategory(models.Model):
    name = models.CharField(_('Название категории'), max_length=200)
    slug = models.SlugField(_('URL'), max_length=200, unique=True, blank=True)
    description = models.TextField(_('Описание'), blank=True)
    image = models.ImageField(
        _('Изображение'),
        upload_to='categories/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])]
    )
    is_active = models.BooleanField(_('Активна'), default=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Категория товаров')
        verbose_name_plural = _('Категории товаров')
        ordering = ['id']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        if is_new_upload(self.image):
            name, content = process_image(self.image, max_side=CATEGORY_MAX_SIDE)
            self.image.save(name, content, save=False)

        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('main:category_detail', kwargs={'slug': self.slug})


class Product(models.Model):
    MATERIAL_CHOICES = [
        ('cotton', _('Хлопок')),
        ('microfiber', _('Микрофибра')),
        ('linen', _('Лен')),
        ('mixed', _('Смешанный')),
    ]

    category = models.ForeignKey(
        ProductCategory,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name=_('Категория')
    )
    name = models.CharField(_('Название товара'), max_length=200)
    slug = models.SlugField(_('URL'), max_length=200, unique=True, blank=True)
    description = models.TextField(_('Описание'), blank=True, null=True)
    material = models.CharField(_('Материал'), max_length=50, choices=MATERIAL_CHOICES, null=True, blank=True)
    size = models.CharField(_('Размер'), max_length=50, help_text=_('Например: 50x90 см'), null=True, blank=True)
    color = models.CharField(_('Цвет'), max_length=100, null=True, blank=True)
    price = models.DecimalField(_('Цена'), max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(_('Количество на складе'), default=0, null=True, blank=True)
    is_active = models.BooleanField(_('Активен'), default=True)
    is_featured = models.BooleanField(_('Рекомендуемый'), default=False)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Товар')
        verbose_name_plural = _('Товары')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.size} - {self.color}"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.name}-{self.size}-{self.color}")
            self.slug = base_slug
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('main:product_detail', kwargs={'slug': self.slug})

    @property
    def main_image(self):
        main = self.images.filter(is_main=True).first()
        if main:
            return main
        return self.images.first()

    @property
    def in_stock(self):
        return self.stock > 0


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name=_('Товар')
    )
    image = models.ImageField(
        _('Изображение'),
        upload_to='products/',
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])]
    )
    is_main = models.BooleanField(_('Главное изображение'), default=False)
    order = models.PositiveIntegerField(_('Порядок'), default=0)
    created_at = models.DateTimeField(_('Дата загрузки'), auto_now_add=True)

    class Meta:
        verbose_name = _('Изображение товара')
        verbose_name_plural = _('Изображения товаров')
        ordering = ['order', '-is_main']

    def __str__(self):
        return f"Изображение для {self.product.name}"

    def save(self, *args, **kwargs):
        if self.is_main:
            ProductImage.objects.filter(product=self.product, is_main=True).update(is_main=False)

        new_upload = is_new_upload(self.image)
        if new_upload:
            name, content = process_image(self.image, max_side=PRODUCT_MAX_SIDE)
            self.image.save(name, content, save=False)

        super().save(*args, **kwargs)

        if new_upload:
            make_thumbnail(self.image)

    @property
    def thumb_url(self):
        """Превью для карточек; если его ещё нет — полноразмерное фото."""
        name = thumb_name(self.image.name)
        if self.image.storage.exists(name):
            return self.image.storage.url(name)
        return self.image.url


class BlogPost(models.Model):
    title = models.CharField(_('Заголовок'), max_length=200)
    slug = models.SlugField(_('URL'), max_length=200, unique=True, blank=True)
    excerpt = models.TextField(_('Краткое описание'), max_length=500, blank=True)
    content = models.TextField(_('Содержание'))
    image = models.ImageField(
        _('Главное изображение'),
        upload_to='blog/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])]
    )
    author = models.CharField(_('Автор'), max_length=100, default='HomeTerry')
    is_published = models.BooleanField(_('Опубликовано'), default=False)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)
    published_at = models.DateTimeField(_('Дата публикации'), blank=True, null=True)

    class Meta:
        verbose_name = _('Статья блога')
        verbose_name_plural = _('Статьи блога')
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)

        if self.is_published and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()

        if is_new_upload(self.image):
            name, content = process_image(self.image, max_side=BLOG_MAX_SIDE)
            self.image.save(name, content, save=False)

        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('main:blog_detail', kwargs={'slug': self.slug})
