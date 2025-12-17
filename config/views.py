from django.shortcuts import render


def custom_404(request, exception):
    """Кастомная страница 404"""
    return render(request, '404.html', status=404)


def custom_500(request):
    """Кастомная страница 500"""
    return render(request, '500.html', status=500)
