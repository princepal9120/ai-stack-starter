"""
AI Stack FastAPI - Custom JWT Auth Provider
===========================================
Self-hosted JWT authentication for no vendor lock-in.
Uses python-jose for token handling and passlib for passwords.
"""

from datetime import datetime, timedelta, UTC
from typing import Any

import structlog
from jose import jwt, JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.base import AuthProvider, AuthUser, TokenPayload
from app.core.config import settings
from app.core.exceptions import AuthenticationError, InvalidTokenError, TokenExpiredError

logger = structlog.get_logger(__name__)


class JWTAuthProvider(AuthProvider):
    """
    Custom JWT authentication provider.
    
    Self-hosted auth with no external dependencies.
    Users are stored in local PostgreSQL database.
    
    Environment variables:
    - JWT_SECRET_KEY: Secret for signing tokens
    - JWT_ALGORITHM: Algorithm (default: HS256)
    - JWT_ACCESS_TOKEN_EXPIRE_MINUTES: Access token lifetime
    - JWT_REFRESH_TOKEN_EXPIRE_DAYS: Refresh token lifetime
    """
    
    def __init__(self, db_session: AsyncSession | None = None) -> None:
        self._secret_key = settings.JWT_SECRET_KEY
        self._algorithm = settings.JWT_ALGORITHM
        self._access_expire = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        self._refresh_expire = timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        self._db = db_session
    
    @property
    def provider_name(self) -> str:
        return "jwt"
    
    async def verify_token(self, token: str) -> AuthUser:
        """
        Verify a custom JWT token.
        
        Args:
            token: JWT token (without 'Bearer ' prefix)
        
        Returns:
            AuthUser with user information
        
        Raises:
            TokenExpiredError: If token has expired
            InvalidTokenError: If token is invalid
        """
        try:
            payload = jwt.decode(
                token,
                self._secret_key,
                algorithms=[self._algorithm],
            )
            
            # Check token type
            token_type = payload.get("type")
            if token_type != "access":
                raise InvalidTokenError()
            
            user_id = payload.get("sub")
            if not user_id:
                raise InvalidTokenError()
            
            # Get user from database
            user = await self.get_user(user_id)
            if not user:
                raise AuthenticationError("User not found")
            
            logger.debug(
                "JWT token verified",
                user_id=user_id,
                provider="jwt",
            )
            
            return user
            
        except jwt.ExpiredSignatureError:
            raise TokenExpiredError()
        except JWTError as e:
            logger.warning("JWT verification failed", error=str(e))
            raise InvalidTokenError()
    
    async def get_user(self, user_id: str) -> AuthUser | None:
        """
        Get user from local database.
        
        Args:
            user_id: User ID (UUID string)
        
        Returns:
            AuthUser if found, None otherwise
        """
        if not self._db:
            logger.warning("No database session provided to JWTAuthProvider")
            return None
        
        try:
            # Import here to avoid circular imports
            from app.models.user import User
            
            result = await self._db.execute(
                select(User).where(User.id == user_id)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                return None
            
            return AuthUser(
                id=str(user.id),
                email=user.email,
                email_verified=user.email_verified,
                name=user.name,
                first_name=user.first_name,
                last_name=user.last_name,
                image_url=user.image_url,
                created_at=user.created_at,
                updated_at=user.updated_at,
                metadata={
                    "provider": "jwt",
                    "is_active": user.is_active,
                },
            )
            
        except Exception as e:
            logger.error("Failed to fetch user from database", error=str(e))
            return None
    
    async def decode_token(self, token: str) -> TokenPayload:
        """Decode JWT token without full validation."""
        try:
            payload = jwt.decode(
                token,
                self._secret_key,
                algorithms=[self._algorithm],
                options={"verify_exp": False},  # Don't verify expiry for decode
            )
            return TokenPayload(
                sub=payload["sub"],
                exp=datetime.fromtimestamp(payload["exp"], tz=UTC),
                iat=datetime.fromtimestamp(payload["iat"], tz=UTC),
                type=payload.get("type"),
                extra={k: v for k, v in payload.items() 
                       if k not in {"sub", "exp", "iat", "type"}},
            )
        except (KeyError, JWTError):
            raise InvalidTokenError()
    
    async def refresh_token(self, refresh_token: str) -> tuple[str, str]:
        """
        Refresh access token using refresh token.
        
        Args:
            refresh_token: Valid refresh token
        
        Returns:
            Tuple of (new_access_token, new_refresh_token)
        """
        try:
            payload = jwt.decode(
                refresh_token,
                self._secret_key,
                algorithms=[self._algorithm],
            )
            
            if payload.get("type") != "refresh":
                raise InvalidTokenError()
            
            user_id = payload.get("sub")
            if not user_id:
                raise InvalidTokenError()
            
            # Generate new tokens
            new_access = self.create_access_token(user_id)
            new_refresh = self.create_refresh_token(user_id)
            
            return new_access, new_refresh
            
        except jwt.ExpiredSignatureError:
            raise TokenExpiredError()
        except JWTError:
            raise InvalidTokenError()
    
    def create_access_token(
        self,
        subject: str | int,
        expires_delta: timedelta | None = None,
        extra_claims: dict[str, Any] | None = None,
    ) -> str:
        """
        Create a new access token.
        
        Args:
            subject: User ID
            expires_delta: Custom expiration time
            extra_claims: Additional claims to include
        
        Returns:
            Encoded JWT access token
        """
        now = datetime.now(UTC)
        expire = now + (expires_delta or self._access_expire)
        
        to_encode = {
            "sub": str(subject),
            "exp": expire,
            "iat": now,
            "type": "access",
        }
        
        if extra_claims:
            to_encode.update(extra_claims)
        
        return jwt.encode(to_encode, self._secret_key, algorithm=self._algorithm)
    
    def create_refresh_token(
        self,
        subject: str | int,
        expires_delta: timedelta | None = None,
    ) -> str:
        """
        Create a new refresh token.
        
        Args:
            subject: User ID
            expires_delta: Custom expiration time
        
        Returns:
            Encoded JWT refresh token
        """
        now = datetime.now(UTC)
        expire = now + (expires_delta or self._refresh_expire)
        
        to_encode = {
            "sub": str(subject),
            "exp": expire,
            "iat": now,
            "type": "refresh",
        }
        
        return jwt.encode(to_encode, self._secret_key, algorithm=self._algorithm)
