from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.conf import settings
import json
import requests
import re

from .models import Product, ProductCategory, BlogPost


def home(request):
    """Главная страница"""
    featured_products = Product.objects.filter(is_active=True, is_featured=True)[:8]
    categories = ProductCategory.objects.filter(is_active=True)[:6]
    latest_posts = BlogPost.objects.filter(is_published=True)[:3]

    context = {
        'featured_products': featured_products,
        'categories': categories,
        'latest_posts': latest_posts,
    }
    return render(request, 'main/home.html', context)


def catalog(request):
    """Каталог - показываем категории"""
    categories = ProductCategory.objects.filter(is_active=True)

    context = {
        'categories': categories,
    }
    return render(request, 'main/catalog.html', context)


def category_products(request, slug):
    """Товары по категории"""
    category = get_object_or_404(ProductCategory, slug=slug, is_active=True)
    products = Product.objects.filter(category=category, is_active=True)

    # Сортировка
    sort = request.GET.get('sort', '-created_at')
    if sort in ['price', '-price', 'name', '-name']:
        products = products.order_by(sort)

    # Пагинация
    paginator = Paginator(products, 12)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'category': category,
        'page_obj': page_obj,
        'current_sort': sort,
    }
    return render(request, 'main/category_products.html', context)


def product_detail(request, slug):
    """Детальная страница товара"""
    product = get_object_or_404(Product, slug=slug, is_active=True)
    related_products = Product.objects.filter(
        category=product.category,
        is_active=True
    ).exclude(id=product.id)[:4]

    context = {
        'product': product,
        'related_products': related_products,
    }
    return render(request, 'main/product_detail.html', context)


def blog_list(request):
    """Список статей блога"""
    posts = BlogPost.objects.filter(is_published=True)

    # Поиск
    search_query = request.GET.get('q')
    if search_query:
        posts = posts.filter(
            Q(title__icontains=search_query) |
            Q(content__icontains=search_query) |
            Q(excerpt__icontains=search_query)
        )

    # Пагинация
    paginator = Paginator(posts, 9)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'search_query': search_query,
    }
    return render(request, 'main/blog_list.html', context)


def blog_detail(request, slug):
    """Детальная страница статьи"""
    post = get_object_or_404(BlogPost, slug=slug, is_published=True)
    related_posts = BlogPost.objects.filter(
        is_published=True
    ).exclude(id=post.id)[:3]

    context = {
        'post': post,
        'related_posts': related_posts,
    }
    return render(request, 'main/blog_detail.html', context)


def about(request):
    """Страница О нас"""
    return render(request, 'main/about.html')


def contact(request):
    """Страница контактов"""
    return render(request, 'main/contact.html')


@require_POST
def submit_contact_form(request):
    """Обработка контактной формы с отправкой в Telegram"""
    try:
        data = json.loads(request.body)

        # Получаем данные из формы
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip()
        company = data.get('company', '').strip()
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()
        contact_type = data.get('type', 'general')  # general, wholesale, cooperation

        # Улучшенная валидация
        if not all([name, phone, email, subject, message]):
            return JsonResponse({
                'success': False,
                'error': 'Пожалуйста, заполните все обязательные поля'
            }, status=400)

        # Проверка длины данных (защита от переполнения)
        if len(name) > 100 or len(email) > 150 or len(subject) > 200 or len(message) > 500:
            return JsonResponse({
                'success': False,
                'error': 'Одно из полей превышает максимально допустимую длину'
            }, status=400)

        # Проверка формата email
        email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_regex, email):
            return JsonResponse({
                'success': False,
                'error': 'Неправильный формат email адреса'
            }, status=400)

        # Проверка формата телефона
        phone_clean = phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        if not phone_clean.startswith('+998') or len(phone_clean) != 13:
            return JsonResponse({
                'success': False,
                'error': 'Неправильный формат номера телефона'
            }, status=400)

        # Проверяем наличие Telegram настроек
        if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
            return JsonResponse({
                'success': False,
                'error': 'Telegram бот не настроен. Проверьте настройки в .env файле'
            }, status=500)

        # Типы обращений на русском
        type_labels = {
            'general': '❓ Общий вопрос',
            'wholesale': '📦 Оптовый заказ',
            'cooperation': '🤝 Сотрудничество',
        }
        type_label = type_labels.get(contact_type, '❓ Общий вопрос')

        # Формируем красивое сообщение для Telegram с HTML форматированием
        telegram_message = f"""
🆕 <b>Новое сообщение с сайта HomeTerry</b>

📋 <b>Тип обращения:</b> {type_label}
━━━━━━━━━━━━━━━━━━━━

👤 <b>Имя:</b> {name}
📱 <b>Телефон:</b> <code>{phone}</code>
📧 <b>Email:</b> {email}
🏢 <b>Компания:</b> {company if company else 'Не указана'}

📌 <b>Тема:</b> {subject}

💬 <b>Сообщение:</b>
{message}

━━━━━━━━━━━━━━━━━━━━
🌐 IP: {request.META.get('REMOTE_ADDR', 'Unknown')}
"""

        # Отправляем в Telegram через Bot API
        telegram_url = f'https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage'
        telegram_data = {
            'chat_id': settings.TELEGRAM_CHAT_ID,
            'text': telegram_message,
            'parse_mode': 'HTML'
        }

        response = requests.post(telegram_url, data=telegram_data, timeout=10)

        if response.status_code != 200:
            raise Exception(f'Telegram API вернул ошибку: {response.status_code}')

        return JsonResponse({
            'success': True,
            'message': 'Спасибо! Ваше сообщение успешно отправлено.'
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Неверный формат данных'
        }, status=400)
    except requests.exceptions.RequestException as e:
        return JsonResponse({
            'success': False,
            'error': f'Ошибка соединения с Telegram: {str(e)}'
        }, status=500)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Ошибка отправки: {str(e)}'
        }, status=500)
