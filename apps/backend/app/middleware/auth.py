"""
AI Stack FastAPI - Auth Middleware
==================================
Authentication middleware for request-level auth processing.
"""

import structlog
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.auth.factory import get_auth_provider
from app.core.logging import bind_context

logger = structlog.get_logger(__name__)


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware for processing authentication at the request level.
    
    This middleware:
    1. Extracts JWT from Authorization header (if present)
    2. Attempts to decode and verify the token
    3. Attaches user info to request.state for downstream use
    4. Binds user context for structured logging
    
    Note: This does NOT block requests without auth.
    Use the `get_current_user` dependency for protected routes.
    """
    
    async def dispatch(self, request: Request, call_next):
        # Extract authorization header
        auth_header = request.headers.get("Authorization")
        
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]  # Remove "Bearer " prefix
            
            try:
                # Get auth provider
                auth_provider = get_auth_provider()
                
                # Decode token (light validation)
                payload = await auth_provider.decode_token(token)
                
                # Attach to request state
                request.state.user_id = payload.sub
                request.state.token_payload = payload
                
                # Bind to logging context
                bind_context(user_id=payload.sub)
                
                logger.debug(
                    "Auth middleware: token decoded",
                    user_id=payload.sub,
                )
                
            except Exception as e:
                # Don't block request, just log
                logger.debug(
                    "Auth middleware: token decode failed",
                    error=str(e),
                )
                request.state.user_id = None
                request.state.token_payload = None
        else:
            request.state.user_id = None
            request.state.token_payload = None
        
        response = await call_next(request)
        return response
