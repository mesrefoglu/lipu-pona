from pathlib import Path
from datetime import timedelta
import os
import environ

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env()
env.read_env(os.path.join(BASE_DIR, '.env'))

FRONTEND_URL       = env('FRONTEND_URL', default='https://lipupona.net')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='toki@lipupona.net')
EMAIL_BACKEND      = env(
    'DJANGO_EMAIL_BACKEND',
    default='django.core.mail.backends.smtp.EmailBackend'
)

EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = env('SENDGRID_API_KEY', default='')
EMAIL_PORT = 587
EMAIL_USE_TLS = True

SECRET_KEY = env('DJANGO_SECRET_KEY')

DEBUG = env('DJANGO_DEBUG', default=False)

SENDGRID_API_KEY           = env('SENDGRID_API_KEY', default='')
SENDGRID_SANDBOX_MODE_IN_DEBUG = False
SENDGRID_ECHO_TO_STDOUT    = DEBUG

ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=[])

CSRF_TRUSTED_ORIGINS = env.list('DJANGO_CSRF_TRUSTED_ORIGINS', default=[])

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

AUTH_USER_MODEL = 'base.MyUser'

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'base',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'base.authenticate.CookiesAuthentication',
    ),
    'EXCEPTION_HANDLER': 'backend.utils.log_exception_handler',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.CursorPagination',
    'PAGE_SIZE': 5,

    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon':  '50/hour',
        'user':  '1000/hour',
    },
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = env.list('DJANGO_CORS_ALLOWED_ORIGINS', default=['http://localhost:3000',])

CORS_ALLOW_CREDENTIALS = True

MEDIA_URL = '/api/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
    'default': env.db()
}

AUTH_PASSWORD_VALIDATORS = [
    # {
    #     'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    # },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    # },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    # },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    # },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'EST'

USE_I18N = True

USE_TZ = True


STATIC_URL = 'static/'

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGGING = {
    "disable_existing_loggers": False,
    "version": 1,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
}