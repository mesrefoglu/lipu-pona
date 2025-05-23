import logging
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)

def log_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None or response.status_code >= 500:
        logger.exception("Unhandled exception", exc_info=exc)
    return response