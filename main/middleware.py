"""
Middleware для защиты от спама и rate limiting
"""
from django.core.cache import cache
from django.http import JsonResponse
import time


class RateLimitMiddleware:
    """
    Простая защита от спама для контактной формы
    Ограничение: максимум 3 запроса в 60 секунд с одного IP
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Применяем только к API контактной формы
        if request.path == '/api/submit-contact/' and request.method == 'POST':
            # Получаем IP пользователя
            ip_address = self.get_client_ip(request)

            # Ключ для кэша
            cache_key = f'rate_limit_contact_{ip_address}'

            # Получаем историю запросов
            request_history = cache.get(cache_key, [])
            current_time = time.time()

            # Очищаем старые запросы (старше 60 секунд)
            request_history = [t for t in request_history if current_time - t < 60]

            # Проверяем лимит
            if len(request_history) >= 3:
                return JsonResponse({
                    'success': False,
                    'error': '⚠️ Слишком много запросов. Пожалуйста, подождите минуту перед следующей отправкой.'
                }, status=429)

            # Добавляем текущий запрос
            request_history.append(current_time)

            # Сохраняем в кэш на 60 секунд
            cache.set(cache_key, request_history, 60)

        response = self.get_response(request)
        return response

    def get_client_ip(self, request):
        """Получение реального IP адреса клиента"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip