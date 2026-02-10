# This file is just Python, with a touch of Django which means
# you can inherit and override settings
from sentry.conf.server import *  # NOQA

import os.path
import sys

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# You'll need to explicitly set SENTRY_ALLOWED_HOSTS if you want Sentry available
# from other hostnames
# SENTRY_ALLOWED_HOSTS = ['sentry.example.com', 'sentry.internal.local']

# Generic configuration
SENTRY_URL_PREFIX = os.environ.get('SENTRY_URL_PREFIX', '')
SENTRY_WEB_HOST = '0.0.0.0'
SENTRY_WEB_PORT = 9000
SENTRY_PUBLIC = False
SENTRY_WEB_OPTIONS = {
    'workers': 3,  # the number of web workers
    'limit_request_line': 0,
    'secure_proxy_ssl_header': True,
    'timeout': 300,
    'bind': '0.0.0.0:9000',
}

# Database / Redis Configuration
SENTRY_DB_NAME = os.environ.get('SENTRY_DB_NAME', 'sentry')
SENTRY_DB_USER = os.environ.get('SENTRY_DB_USER', 'sentry')
SENTRY_DB_PASSWORD = os.environ.get('SENTRY_DB_PASSWORD', '')
SENTRY_DB_HOST = os.environ.get('SENTRY_DB_HOST', 'postgres')
SENTRY_DB_PORT = os.environ.get('SENTRY_DB_PORT', '5432')
SENTRY_POSTGRES_MAX_CONNS = 100

SENTRY_REDIS_HOST = os.environ.get('SENTRY_REDIS_HOST', 'redis')
SENTRY_REDIS_PORT = os.environ.get('SENTRY_REDIS_PORT', '6379')
SENTRY_REDIS_DB = 0

# Cache Backend
SENTRY_CACHE = 'sentry.cache.redis.RedisCache'
SENTRY_CACHE_OPTIONS = {
    'hosts': {
        0: {
            'host': SENTRY_REDIS_HOST,
            'port': int(SENTRY_REDIS_PORT),
        }
    }
}

# Email Configuration
SENTRY_OPTIONS['server.email.host'] = os.environ.get('SENTRY_EMAIL_HOST', 'smtp')
SENTRY_OPTIONS['server.email.port'] = int(os.environ.get('SENTRY_EMAIL_PORT', 25))
SENTRY_OPTIONS['server.email.use-tls'] = False
SENTRY_OPTIONS['mail.from'] = os.environ.get('SENTRY_SERVER_EMAIL', 'sentry@localhost')

# Security Settings
SECRET_KEY = os.environ.get('SENTRY_SECRET_KEY', 'CHANGE_THIS_SECRET_KEY_FOR_PRODUCTION')
SENTRY_OPTIONS['system.secret-key'] = SECRET_KEY

# File Storage
SENTRY_OPTIONS['system.file-store'] = '/var/lib/sentry/files'

# Buffer & Rate Limits
SENTRY_BUFFER = 'sentry.buffer.redis.RedisBuffer'
SENTRY_BUFFER_OPTIONS = {
    'hosts': {
        0: {
            'host': SENTRY_REDIS_HOST,
            'port': int(SENTRY_REDIS_PORT),
        }
    }
}
SENTRY_RATELIMITER = 'sentry.ratelimits.redis.RedisRateLimiter'
SENTRY_RATELIMITER_OPTIONS = {
    'hosts': {
        0: {
            'host': SENTRY_REDIS_HOST,
            'port': int(SENTRY_REDIS_PORT),
        }
    }
}

# Quotas
SENTRY_OPTIONS['system.event-retention-days'] = 90
SENTRY_OPTIONS['system.max-event-size'] = 1000000  # 1MB

# Performance Monitoring
SENTRY_OPTIONS['symbolicator.enabled'] = True
SENTRY_OPTIONS['symbolicator.options'] = {
    'url': 'http://symbolicator:3021',
}
SENTRY_OPTIONS['snuba'] = {
    'api': 'http://snuba:1218',
}

# UI Settings
SENTRY_OPTIONS['system.admin-email'] = os.environ.get('SENTRY_SERVER_EMAIL', 'admin@localhost')

# Session Configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Logging
SENTRY_LOG_LEVEL = os.environ.get('SENTRY_LOG_LEVEL', 'INFO')
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'root': {
        'level': 'WARNING',
        'handlers': ['console'],
    },
    'loggers': {
        'django.security.DisallowedHost': {
            'level': 'ERROR',
            'handlers': ['console'],
            'propagate': False,
        },
        'sentry': {
            'level': SENTRY_LOG_LEVEL,
            'handlers': ['console'],
            'propagate': False,
        },
    },
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
}

# S3 Storage (Optional - for file uploads)
# SENTRY_OPTIONS['system.upload-deployment-buckets'] = {
#     'default': {
#         'region': os.environ.get('AWS_REGION', 'us-east-1'),
#         'bucket_name': os.environ.get('S3_BUCKET_NAME'),
#         'access_key': os.environ.get('AWS_ACCESS_KEY_ID'),
#         'secret_key': os.environ.get('AWS_SECRET_ACCESS_KEY'),
#     }
# }

# Disable Sentry's own error reporting
SENTRY_OPTIONS['system.url-prefix'] = SENTRY_URL_PREFIX
SENTRY_OPTIONS['system.internal-url-prefix'] = SENTRY_URL_PREFIX
