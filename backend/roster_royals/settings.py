import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Get environment setting
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') # Development only


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
ALLOWED_HOSTS = ['*']
#ALLOWED_HOSTS = ['165.22.187.23', 'rosterroyals.com']

# Templates configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Database configuration (using default SQLite)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB',),
        'USER': os.environ.get('POSTGRES_USER',),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD',),
        'HOST': os.environ.get('POSTGRES_HOST',),  # Match the service name in docker-compose
        'PORT': os.environ.get('POSTGRES_PORT',),
    }
}


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Static files configuration
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / "static"]  # Optional, used if static files exist in the project folder
STATIC_ROOT = BASE_DIR / "staticfiles"  # WhiteNoise will serve files from here
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Other required settings
ROOT_URLCONF = 'roster_royals.urls'
WSGI_APPLICATION = 'roster_royals.wsgi.application'

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'users.apps.UsersConfig',
    'groups.apps.GroupsConfig',
    'django_extensions',
]


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Must come before other middleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# Comment out all CORS-related settings
# Enhanced CORS settings
# CORS_ALLOW_ALL_ORIGINS = True
# CORS_ALLOW_CREDENTIALS = True
# CORS_ALLOW_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
# CORS_ALLOW_HEADERS = [
#     'accept',
#     'accept-encoding',
#     'authorization',
#     'content-type',
#     'dnt',
#     'origin',
#     'user-agent',
#     'x-csrftoken',
#     'x-requested-with',
#     'access-control-allow-origin',
#     'access-control-allow-methods',
#     'access-control-allow-headers',
# ]

# Specific allowed origins for when CORS_ALLOW_ALL_ORIGINS is set to False
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://localhost",
#     "http://127.0.0.1:3000",
#     "http://127.0.0.1",
# ]

# CORS_EXPOSE_HEADERS = ['Content-Type', 'X-CSRFToken']

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}

# Custom user model
AUTH_USER_MODEL = 'users.User'

# Disable default group model
# DJANGO_AUTH_NO_GROUP = True

# Odds API settings
ODDS_API_KEY = os.environ.get('ODDS_API_KEY')
ODDS_API_BASE_URL = 'https://api.the-odds-api.com'  # Base URL for the Odds API

# Add to your existing settings
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.environ.get('GOOGLE_OAUTH2_CLIENT_ID')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.environ.get('GOOGLE_OAUTH2_CLIENT_SECRET')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'level': 'DEBUG' if DEBUG else 'INFO',
        },
    },
}
