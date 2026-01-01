"""
AI Stack FastAPI - Auth Provider Factory
========================================
Factory pattern for creating auth providers based on configuration.
"""

from functools import lru_cache
from typing import Literal

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.base import AuthProvider
from app.auth.clerk import ClerkAuthProvider
from app.auth.jwt import JWTAuthProvider
from app.core.config import settings

logger = structlog.get_logger(__name__)

AuthProviderType = Literal["clerk", "jwt"]


@lru_cache
def _get_clerk_provider() -> ClerkAuthProvider:
    """Get cached Clerk provider instance."""
    return ClerkAuthProvider()


def get_auth_provider(
    provider: AuthProviderType | None = None,
    db_session: AsyncSession | None = None,
) -> AuthProvider:
    """
    Factory function to get the appropriate auth provider.
    
    Args:
        provider: Override provider type (uses AUTH_PROVIDER env var if None)
        db_session: Database session (required for JWT provider)
    
    Returns:
        Configured AuthProvider instance
    
    Usage:
        # Use configured provider
        auth = get_auth_provider()
        
        # Force specific provider
        auth = get_auth_provider("clerk")
        auth = get_auth_provider("jwt", db_session=session)
    
    Environment:
        AUTH_PROVIDER: "clerk" or "jwt" (default: "clerk")
    """
    provider_type = provider or settings.AUTH_PROVIDER
    
    logger.debug(
        "Creating auth provider",
        provider=provider_type,
    )
    
    if provider_type == "clerk":
        return _get_clerk_provider()
    
    elif provider_type == "jwt":
        return JWTAuthProvider(db_session=db_session)
    
    else:
        logger.warning(
            f"Unknown auth provider '{provider_type}', falling back to 'clerk'",
            configured_provider=provider_type,
        )
        return _get_clerk_provider()


def get_provider_info() -> dict[str, str]:
    """
    Get information about the current auth provider.
    Useful for debugging and health checks.
    """
    return {
        "provider": settings.AUTH_PROVIDER,
        "configured": "clerk" if settings.CLERK_SECRET_KEY else "jwt",
        "fallback_available": "yes" if settings.JWT_SECRET_KEY else "no",
    }
