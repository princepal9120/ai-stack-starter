"""
AI Stack FastAPI - Auth Dependencies
====================================
FastAPI dependencies for authentication.
Provides get_current_user and related utilities.
"""

from typing import Annotated

import structlog
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.base import AuthUser
from app.auth.factory import get_auth_provider
from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import AuthenticationError, InvalidTokenError, TokenExpiredError

logger = structlog.get_logger(__name__)

# HTTP Bearer token extractor
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthUser:
    """
    FastAPI dependency to get the current authenticated user.
    
    Extracts JWT from Authorization header and verifies it using
    the configured auth provider (Clerk or custom JWT).
    
    Usage:
        @router.get("/me")
        async def get_me(user: AuthUser = Depends(get_current_user)):
            return user
    
    Returns:
        AuthUser with user information
    
    Raises:
        HTTPException 401: If not authenticated or token invalid
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    try:
        # Get auth provider based on configuration
        auth_provider = get_auth_provider(db_session=db)
        
        # Verify token and get user
        user = await auth_provider.verify_token(token)
        
        logger.debug(
            "User authenticated",
            user_id=user.id,
            provider=auth_provider.provider_name,
        )
        
        return user
        
    except TokenExpiredError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthUser | None:
    """
    FastAPI dependency to optionally get the current user.
    Returns None if no token provided (instead of raising error).
    
    Usage:
        @router.get("/items")
        async def get_items(user: AuthUser | None = Depends(get_current_user_optional)):
            if user:
                # Show user-specific items
            else:
                # Show public items
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


async def get_current_active_user(
    user: Annotated[AuthUser, Depends(get_current_user)],
) -> AuthUser:
    """
    FastAPI dependency to get current user and verify they are active.
    
    Usage:
        @router.post("/action")
        async def do_action(user: AuthUser = Depends(get_current_active_user)):
            # Only active users reach here
    """
    # For Clerk users, we assume active if verified
    # For JWT users, check is_active in metadata
    is_active = user.metadata.get("is_active", True)
    
    if not is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    
    return user


async def get_verified_user(
    user: Annotated[AuthUser, Depends(get_current_user)],
) -> AuthUser:
    """
    FastAPI dependency to get current user with verified email.
    
    Usage:
        @router.post("/sensitive")
        async def sensitive_action(user: AuthUser = Depends(get_verified_user)):
            # Only email-verified users reach here
    """
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required",
        )
    
    return user


# Type aliases for cleaner endpoint signatures
CurrentUser = Annotated[AuthUser, Depends(get_current_user)]
OptionalUser = Annotated[AuthUser | None, Depends(get_current_user_optional)]
ActiveUser = Annotated[AuthUser, Depends(get_current_active_user)]
VerifiedUser = Annotated[AuthUser, Depends(get_verified_user)]
