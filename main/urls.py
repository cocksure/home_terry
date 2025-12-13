from django.urls import path
from . import views

app_name = 'main'

urlpatterns = [
    # Главная страница
    path('', views.home, name='home'),

    # Каталог
    path('catalog/', views.catalog, name='catalog'),
    path('category/<slug:slug>/', views.category_products, name='category_detail'),
    path('product/<slug:slug>/', views.product_detail, name='product_detail'),

    # Блог
    path('blog/', views.blog_list, name='blog_list'),
    path('blog/<slug:slug>/', views.blog_detail, name='blog_detail'),

    # Статические страницы
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
]