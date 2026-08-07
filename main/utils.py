def get_client_ip(request):
    """Реальный IP клиента: за nginx REMOTE_ADDR всегда 127.0.0.1,
    настоящий адрес приходит в X-Forwarded-For (см. /etc/nginx/sites-available/hometerry)."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', 'Unknown')