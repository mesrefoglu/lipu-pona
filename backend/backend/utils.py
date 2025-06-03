from django.conf import settings
from rest_framework.views import exception_handler

import re
import logging

logger = logging.getLogger(__name__)

def log_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None or response.status_code >= 500:
        logger.exception("Unhandled exception", exc_info=exc)
    return response

def frontend_email_activation_url(uid, token):
    return f"{settings.FRONTEND_URL.rstrip('/')}/activate/{uid}/{token}"

def frontend_reset_url(uid, token):
    return f"{settings.FRONTEND_URL.rstrip('/')}/reset-password/{uid}/{token}"

def normalize_whitespace(s: str) -> str:
    s = re.sub(r'\r\n', '\n', s)
    s = re.sub(r'[ \t\u00A0]', ' ', s)
    s = re.sub(r'[ ]+', ' ', s)
    s = re.sub(r'\n ', '\n', s)
    s = re.sub(r' \n', '\n', s)
    s = re.sub(r'\n{3,}', '\n\n', s)
    return s

def normalize_name(s: str) -> str:
    return re.sub(r'[^aeijklmnopstuwAEIJKLMNOPSTUW ]+', '', s)