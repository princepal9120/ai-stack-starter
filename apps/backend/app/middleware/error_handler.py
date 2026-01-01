"""
AI Stack FastAPI - Error Handler Middleware
===========================================
Global error handling for consistent API responses.
"""

from typing import Callable

import structlog
from fastapi import Request, Response
from fastapi.responses import JSONResponse

from app.core.exceptions import AIStackException

logger = structlog.get_logger(__name__)


async def error_handler_middleware(
    request: Request,
    call_next: Callable[[Request], Response],
) -> Response:
    """
    Global error handler middleware.
    Catches all exceptions and returns consistent JSON responses.
    """
    try:
        return await call_next(request)
        
    except AIStackException as e:
        # Handle custom application exceptions
        logger.warning(
            "Application error",
            error_code=e.code,
            error_message=e.message,
            status_code=e.status_code,
        )
        
        return JSONResponse(
            status_code=e.status_code,
            content={
                "error": {
                    "code": e.code,
                    "message": e.message,
                    "details": e.details,
                }
            },
        )
        
    except Exception as e:
        # Handle unexpected exceptions
        logger.exception(
            "Unexpected error",
            error=str(e),
            error_type=type(e).__name__,
        )
        
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred",
                    "details": {},
                }
            },
        )
