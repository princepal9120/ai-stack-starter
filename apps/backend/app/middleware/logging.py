"""
AI Stack FastAPI - Logging Middleware
=====================================
Request/response logging middleware with timing.
"""

import time
import uuid
from typing import Callable

import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import bind_context, clear_context

logger = structlog.get_logger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging all HTTP requests and responses.
    Adds request ID, timing, and structured context.
    """
    
    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Response],
    ) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        
        # Add request ID to headers for tracing
        request.state.request_id = request_id
        
        # Bind context for structured logging
        bind_context(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            client_ip=request.client.host if request.client else "unknown",
        )
        
        # Start timing
        start_time = time.perf_counter()
        
        # Log request (debug level to avoid noise)
        logger.debug(
            "Request started",
            query_params=str(request.query_params) if request.query_params else None,
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (time.perf_counter() - start_time) * 1000
            
            # Log response
            logger.info(
                "Request completed",
                status_code=response.status_code,
                duration_ms=round(duration_ms, 2),
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            # Calculate duration
            duration_ms = (time.perf_counter() - start_time) * 1000
            
            # Log error
            logger.error(
                "Request failed",
                error=str(e),
                error_type=type(e).__name__,
                duration_ms=round(duration_ms, 2),
            )
            raise
            
        finally:
            # Clear logging context
            clear_context()
