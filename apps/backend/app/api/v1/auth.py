"""
AI Stack FastAPI - Auth Endpoints
=================================
Authentication endpoints for custom JWT auth.
Note: When using Clerk, these endpoints are not needed
as Clerk handles auth flow in the frontend.
"""

from datetime import timedelta
from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.base import AuthUser
from app.auth.dependencies import CurrentUser
from app.auth.jwt import JWTAuthProvider
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password

logger = structlog.get_logger(__name__)

router = APIRouter()


# =============================================================================
# Request/Response Models
# =============================================================================

class RegisterRequest(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str
    name: str | None = None


class LoginRequest(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshRequest(BaseModel):
    """Token refresh request."""
    refresh_token: str


class UserResponse(BaseModel):
    """User information response."""
    id: str
    email: str
    name: str | None
    email_verified: bool
    created_at: str | None


# =============================================================================
# Endpoints
# =============================================================================

@router.post("/register", response_model=TokenResponse)
async def register(
    request: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """
    Register a new user (Custom JWT auth only).
    
    Note: When using Clerk, registration is handled by Clerk's
    frontend components. This endpoint is for custom JWT auth.
    """
    if settings.AUTH_PROVIDER != "jwt":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration is handled by Clerk. Use Clerk's SignUp component.",
        )
    
    # Import user model here to avoid circular imports
    from app.models.user import User
    from sqlalchemy import select
    
    # Check if user exists
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )
    
    # Create user
    user = User(
        email=request.email,
        hashed_password=get_password_hash(request.password),
        name=request.name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Generate tokens
    jwt_provider = JWTAuthProvider(db_session=db)
    access_token = jwt_provider.create_access_token(str(user.id))
    refresh_token = jwt_provider.create_refresh_token(str(user.id))
    
    logger.info("User registered", user_id=str(user.id), email=request.email)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """
    Login with email and password (Custom JWT auth only).
    
    Note: When using Clerk, login is handled by Clerk's
    frontend components. This endpoint is for custom JWT auth.
    """
    if settings.AUTH_PROVIDER != "jwt":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Login is handled by Clerk. Use Clerk's SignIn component.",
        )
    
    from app.models.user import User
    from sqlalchemy import select
    
    # Find user
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    
    # Generate tokens
    jwt_provider = JWTAuthProvider(db_session=db)
    access_token = jwt_provider.create_access_token(str(user.id))
    refresh_token = jwt_provider.create_refresh_token(str(user.id))
    
    logger.info("User logged in", user_id=str(user.id))
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """
    Refresh access token using refresh token.
    """
    if settings.AUTH_PROVIDER != "jwt":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token refresh is handled by Clerk.",
        )
    
    jwt_provider = JWTAuthProvider(db_session=db)
    
    try:
        access_token, new_refresh_token = await jwt_provider.refresh_token(
            request.refresh_token
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    user: CurrentUser,
) -> UserResponse:
    """
    Get current authenticated user information.
    Works with both Clerk and custom JWT auth.
    """
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        email_verified=user.email_verified,
        created_at=user.created_at.isoformat() if user.created_at else None,
    )


@router.get("/provider")
async def get_auth_provider() -> dict[str, str]:
    """
    Get current auth provider configuration.
    Useful for frontend to determine auth flow.
    """
    from app.auth.factory import get_provider_info
    return get_provider_info()
