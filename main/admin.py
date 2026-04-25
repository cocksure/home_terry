from django.contrib import admin
from django.utils.html import format_html

from .models import ProductCategory, Product, ProductImage, BlogPost


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'product_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Количество товаров'


class HasImageFilter(admin.SimpleListFilter):
    title = 'Наличие фото'
    parameter_name = 'has_image'

    def lookups(self, request, model_admin):
        return [
            ('yes', 'Есть фото'),
            ('no', 'Нет фото'),
        ]

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(images__isnull=False).distinct()
        if self.value() == 'no':
            return queryset.filter(images__isnull=True)

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'is_main', 'order', 'image_preview']
    readonly_fields = ['image_preview']

    class Media:
        js = ('main/js/admin_image_paste.js',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px;"/>', obj.image.url)
        return '-'
    image_preview.short_description = 'Превью'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'size', 'color', 'material', 'price', 'stock', 'is_active', 'is_featured']
    list_filter = ['category', 'material', 'is_active', 'is_featured', 'created_at', HasImageFilter]
    search_fields = ['name', 'description', 'color']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ProductImageInline]
    list_editable = ['is_active', 'category', 'size', 'material', 'is_featured',]

    fieldsets = (
        ('Основная информация', {
            'fields': ('category', 'name', 'slug', 'description')
        }),
        ('Характеристики', {
            'fields': ('material', 'size', 'color', 'price', 'stock')
        }),
        ('Статус', {
            'fields': ('is_active', 'is_featured')
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'is_main', 'order', 'image_preview', 'created_at']
    list_filter = ['is_main', 'created_at']
    list_editable = ['is_main', 'order']

    def get_queryset(self, request):
        return super().get_queryset(request).exclude(image='')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px;"/>', obj.image.url)
        return '-'
    image_preview.short_description = 'Превью'


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'is_published', 'published_at', 'created_at']
    list_filter = ['is_published', 'created_at', 'published_at']
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at', 'published_at']
    list_editable = ['is_published']

    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'slug', 'author', 'excerpt', 'content')
        }),
        ('Изображение', {
            'fields': ('image',)
        }),
        ('Публикация', {
            'fields': ('is_published', 'published_at')
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
