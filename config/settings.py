from pathlib import Path
import environ

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environ
env = environ.Env(
    DEBUG=(bool, False)
)

# Read .env file
environ.Env.read_env(BASE_DIR / '.env')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'])


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'main',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'main.middleware.RateLimitMiddleware',  # Rate limiting для защиты от спама
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates']
        ,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


SITE_ID = 1

LANGUAGE_CODE = 'ru'

USE_I18N = True
USE_L10N = True
USE_TZ = True

LANGUAGES = [
    ('ru', 'Русский'),
    ('en', 'English'),
    ('uz', 'O‘zbekcha'),
]

MODELTRANSLATION_DEFAULT_LANGUAGE = 'ru'
MODELTRANSLATION_PREPOPULATE_LANGUAGE = 'en'

LANGUAGE_COOKIE_NAME = 'django_language'

# Locale paths for translations
LOCALE_PATHS = [
    BASE_DIR / 'locale',
]

TIME_ZONE = 'Asia/Tashkent'

DEFAULT_IMAGE = 'default_foto.png'

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static'
]
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

MEDIA_DIRS = [
    BASE_DIR / 'media',
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Telegram Bot configuration
TELEGRAM_BOT_TOKEN = env('TELEGRAM_BOT_TOKEN', default='')
TELEGRAM_CHAT_ID = env('TELEGRAM_CHAT_ID', default='')

# =============================================================================
# SECURITY SETTINGS (для продакшена)
# =============================================================================

# CSRF настройки (должны быть ДО блока if not DEBUG)
CSRF_COOKIE_SAMESITE = 'Lax'  # Изменено с 'Strict' на 'Lax' для работы с формами
CSRF_COOKIE_HTTPONLY = False  # Позволить JavaScript читать CSRF токен
CSRF_USE_SESSIONS = False  # Не использовать сессии для CSRF
CSRF_COOKIE_SECURE = False if DEBUG else True  # HTTP cookies в dev, HTTPS в prod
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=['http://localhost:8000'])

# Дополнительные настройки для PythonAnywhere
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = True

# HTTPS настройки (раскомментировать для продакшена с HTTPS)
if not DEBUG:
    # Перенаправление HTTP на HTTPS
    SECURE_SSL_REDIRECT = True

    # HSTS - браузер будет использовать только HTTPS
    SECURE_HSTS_SECONDS = 31536000  # 1 год
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    # Cookie security
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    # Дополнительные headers безопасности
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'DENY'  # Защита от clickjacking
