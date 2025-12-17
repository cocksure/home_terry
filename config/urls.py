from django.conf import settings
from django.conf.urls.i18n import i18n_patterns
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import path, include
from django.views.i18n import set_language
from django.views.generic import TemplateView
from main.urls import api_urlpatterns
from main.sitemaps import (
    StaticViewSitemap,
    ProductCategorySitemap,
    ProductSitemap,
    BlogPostSitemap,
)

# Sitemaps для поисковых систем
sitemaps = {
    'static': StaticViewSitemap,
    'categories': ProductCategorySitemap,
    'products': ProductSitemap,
    'blog': BlogPostSitemap,
}

urlpatterns = [
    path('set-language/', set_language, name='set_language'),

    # Sitemap для поисковых систем (Google, Yandex, Bing)
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),

    # robots.txt
    path('robots.txt', TemplateView.as_view(template_name='robots.txt', content_type='text/plain'), name='robots'),
]

# API endpoints (без языкового префикса)
urlpatterns += api_urlpatterns

# i18n patterns for main content
urlpatterns += i18n_patterns(
    path('admin/', admin.site.urls),
    path('', include('main.urls')),
    prefix_default_language=False,
)


handler404 = 'config.views.custom_404'
handler500 = 'config.views.custom_500'

# Static and media files (outside i18n_patterns)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Serve static files from STATICFILES_DIRS in DEBUG mode
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns
    urlpatterns += staticfiles_urlpatterns()