import os
from io import BytesIO

from PIL import Image
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.validators import FileExtensionValidator
from django.db import models
from django.urls import reverse
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _


def process_image(image, upload_path, quality=80, max_size=(1024, 1024)):
    try:
        img = Image.open(image)

        # Проверка формата
        if img.format and img.format.lower() not in ['jpg', 'jpeg', 'png', 'webp']:
            raise ValueError(f"Неподдерживаемый формат: {img.format}")

        # Сжатие по размеру
        if img.width > max_size[0] or img.height > max_size[1]:
            img.thumbnail(max_size, Image.LANCZOS)

        # Подготовка к сохранению
        output = BytesIO()
        img.save(output, format='WEBP', quality=quality, optimize=True)
        output.seek(0)

        # Генерация безопасного имени
        filename_wo_ext = os.path.splitext(os.path.basename(image.name))[0]
        safe_name = slugify(filename_wo_ext) + '.webp'

        full_path = os.path.join(upload_path, safe_name)

        return full_path, ContentFile(output.read())

    except Exception as e:
        raise ValueError(f"Ошибка при обработке изображения: {e}")


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
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('category_detail', kwargs={'slug': self.slug})


class Product(models.Model):
    MATERIAL_CHOICES = [
        ('cotton', _('Хлопок')),
        ('microfiber', _('Микрофибра')),
        ('bamboo', _('Бамбук')),
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
        return reverse('product_detail', kwargs={'slug': self.slug})

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

        if self.image:
            upload_path = 'products/'
            full_path, content = process_image(self.image, upload_path, quality=85, max_size=(1200, 1200))
            self.image.save(os.path.basename(full_path), content, save=False)

        super().save(*args, **kwargs)


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

        if self.image:
            upload_path = 'blog/'
            full_path, content = process_image(self.image, upload_path, quality=80, max_size=(1200, 800))
            self.image.save(os.path.basename(full_path), content, save=False)

        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('blog_detail', kwargs={'slug': self.slug})
