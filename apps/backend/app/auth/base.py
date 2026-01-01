"""
AI Stack FastAPI - Auth Base Interface
=======================================
Abstract base class for authentication providers.
Enables vendor-agnostic auth switching.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class AuthUser(BaseModel):
    """
    Unified user representation across auth providers.
    Contains common user attributes from any auth source.
    """
    
    id: str = Field(..., description="Unique user identifier")
    email: EmailStr = Field(..., description="User's email address")
    email_verified: bool = Field(default=False, description="Whether email is verified")
    name: str | None = Field(default=None, description="User's display name")
    first_name: str | None = Field(default=None, description="User's first name")
    last_name: str | None = Field(default=None, description="User's last name")
    image_url: str | None = Field(default=None, description="User's profile image URL")
    created_at: datetime | None = Field(default=None, description="Account creation time")
    updated_at: datetime | None = Field(default=None, description="Last update time")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    @property
    def full_name(self) -> str | None:
        """Get user's full name from first and last name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.name or self.first_name or self.last_name


class TokenPayload(BaseModel):
    """
    Decoded JWT token payload.
    Common fields across auth providers.
    """
    
    sub: str = Field(..., description="Subject (user ID)")
    exp: datetime = Field(..., description="Expiration time")
    iat: datetime = Field(..., description="Issued at time")
    iss: str | None = Field(default=None, description="Issuer")
    aud: str | list[str] | None = Field(default=None, description="Audience")
    azp: str | None = Field(default=None, description="Authorized party")
    
    # Clerk-specific claims
    sid: str | None = Field(default=None, description="Session ID (Clerk)")
    
    # Custom claims
    type: str | None = Field(default=None, description="Token type (access/refresh)")
    extra: dict[str, Any] = Field(default_factory=dict, description="Extra claims")


class AuthProvider(ABC):
    """
    Abstract base class for authentication providers.
    
    Implementations:
    - ClerkAuthProvider: Uses Clerk for auth
    - JWTAuthProvider: Uses custom JWT tokens
    
    Usage:
        provider = get_auth_provider()  # Factory based on AUTH_PROVIDER env
        user = await provider.verify_token(token)
    """
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the provider name (e.g., 'clerk', 'jwt')."""
        ...
    
    @abstractmethod
    async def verify_token(self, token: str) -> AuthUser:
        """
        Verify a JWT token and return the authenticated user.
        
        Args:
            token: JWT bearer token (without 'Bearer ' prefix)
        
        Returns:
            AuthUser with user information
        
        Raises:
            AuthenticationError: If token is invalid or expired
        """
        ...
    
    @abstractmethod
    async def get_user(self, user_id: str) -> AuthUser | None:
        """
        Get user information by ID.
        
        Args:
            user_id: The unique user identifier
        
        Returns:
            AuthUser if found, None otherwise
        """
        ...
    
    async def decode_token(self, token: str) -> TokenPayload:
        """
        Decode a JWT token without full validation.
        Override this for provider-specific decoding.
        
        Args:
            token: JWT token string
        
        Returns:
            Decoded token payload
        """
        raise NotImplementedError("decode_token not implemented for this provider")
    
    async def refresh_token(self, refresh_token: str) -> tuple[str, str]:
        """
        Refresh an access token using a refresh token.
        Not all providers support this.
        
        Args:
            refresh_token: The refresh token
        
        Returns:
            Tuple of (new_access_token, new_refresh_token)
        
        Raises:
            NotImplementedError: If provider doesn't support refresh
        """
        raise NotImplementedError(
            f"{self.provider_name} does not support token refresh"
        )
    
    async def revoke_token(self, token: str) -> bool:
        """
        Revoke a token (logout).
        Not all providers support this.
        
        Args:
            token: Token to revoke
        
        Returns:
            True if revoked successfully
        """
        raise NotImplementedError(
            f"{self.provider_name} does not support token revocation"
        )
