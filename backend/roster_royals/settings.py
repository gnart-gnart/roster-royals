import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') # Development only

# Update allowed hosts
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'rosterroyals.com', 'www.rosterroyals.com']

# To this environment variable based setting
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Add production security settings
if not DEBUG:
    # HTTPS settings
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # CORS settings - restrict to only your domain in production
    CORS_ALLOWED_ORIGINS = [
        "https://rosterroyals.com",
        "https://www.rosterroyals.com",
    ]
    CORS_ALLOW_ALL_ORIGINS = False

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
    'corsheaders',
    'users.apps.UsersConfig',
    'groups.apps.GroupsConfig',
    'django_extensions',
]


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Must come before other middleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Custom user model
AUTH_USER_MODEL = 'users.User'

# Disable default group model
# DJANGO_AUTH_NO_GROUP = True

# Cloudbet API settings
CLOUDBET_API_KEY = os.environ.get('CLOUDBET_API_KEY')
CLOUDBET_API_BASE_URL = 'https://sports-api.cloudbet.com/pub/v2/'  # Include complete path

# Add to your existing settings
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.environ.get('GOOGLE_OAUTH2_CLIENT_ID')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.environ.get('GOOGLE_OAUTH2_CLIENT_SECRET')

