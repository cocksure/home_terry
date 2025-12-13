from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.db.models import Q

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
