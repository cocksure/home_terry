from django.conf import settings

from .models import ProductCategory


def footer_categories(request):
    return {'footer_categories': ProductCategory.objects.filter(is_active=True)[:6]}


def site_palette(request):
    return {'SITE_PALETTE': settings.SITE_PALETTE}
