"""
Sitemaps для индексации сайта поисковыми системами
"""
from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Product, ProductCategory, BlogPost


class StaticViewSitemap(Sitemap):
    """Статические страницы"""
    priority = 0.8
    changefreq = 'weekly'
    i18n = True  # Поддержка многоязычности

    def items(self):
        return ['main:home', 'main:catalog', 'main:about', 'main:contact', 'main:blog_list']

    def location(self, item):
        return reverse(item)


class ProductCategorySitemap(Sitemap):
    """Категории товаров"""
    changefreq = 'weekly'
    priority = 0.7
    i18n = True

    def items(self):
        return ProductCategory.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at


class ProductSitemap(Sitemap):
    """Товары"""
    changefreq = 'daily'
    priority = 0.9
    i18n = True

    def items(self):
        return Product.objects.filter(is_active=True).select_related('category')

    def lastmod(self, obj):
        return obj.updated_at


class BlogPostSitemap(Sitemap):
    """Блог"""
    changefreq = 'weekly'
    priority = 0.6
    i18n = True

    def items(self):
        return BlogPost.objects.filter(is_published=True).order_by('-published_at')

    def lastmod(self, obj):
        return obj.updated_at