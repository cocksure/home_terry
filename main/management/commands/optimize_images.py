import os

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from main.models import (
    BLOG_MAX_SIDE, CATEGORY_MAX_SIDE, BlogPost, ProductCategory, ProductImage,
    make_thumbnail, process_image, thumb_name,
)


class Command(BaseCommand):
    help = ('Конвертирует старые JPG/PNG категорий и блога в WebP и создаёт превью '
            'для фото товаров. Оригиналы не удаляются.')

    def add_arguments(self, parser):
        parser.add_argument('--force-thumbs', action='store_true',
                            help='Пересоздать превью, даже если они уже есть')

    def handle(self, *args, **options):
        self._convert(ProductCategory.objects.exclude(image=''), CATEGORY_MAX_SIDE)
        self._convert(BlogPost.objects.exclude(image='').exclude(image__isnull=True), BLOG_MAX_SIDE)

        created = 0
        for obj in ProductImage.objects.all():
            if not obj.image or not obj.image.storage.exists(obj.image.name):
                self.stderr.write(f'Нет файла: {obj.image.name} (ProductImage #{obj.pk})')
                continue
            if not options['force_thumbs'] and obj.image.storage.exists(thumb_name(obj.image.name)):
                continue
            make_thumbnail(obj.image)
            created += 1
        self.stdout.write(self.style.SUCCESS(f'Превью товаров создано: {created}'))

    def _convert(self, queryset, max_side):
        model_name = queryset.model.__name__
        for obj in queryset:
            if not obj.image or obj.image.name.lower().endswith('.webp'):
                continue
            if not obj.image.storage.exists(obj.image.name):
                self.stderr.write(f'Нет файла: {obj.image.name} ({model_name} #{obj.pk})')
                continue
            old_name = obj.image.name
            with obj.image.open('rb') as f:
                source = ContentFile(f.read(), name=os.path.basename(old_name))
            name, content = process_image(source, max_side=max_side)
            obj.image.save(name, content, save=False)
            # update(), а не save(): чтобы не запускать повторную обработку и не трогать updated_at
            queryset.model.objects.filter(pk=obj.pk).update(image=obj.image.name)
            self.stdout.write(f'{model_name} #{obj.pk}: {old_name} → {obj.image.name}')
