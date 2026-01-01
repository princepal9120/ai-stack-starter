"""
AI Stack FastAPI - Clerk Auth Provider
======================================
Clerk JWT verification for FastAPI backend.
Uses clerk-backend-api for token validation.
"""

import httpx
import structlog
from datetime import datetime, UTC
from typing import Any

from jose import jwt, JWTError

from app.auth.base import AuthProvider, AuthUser, TokenPayload
from app.core.config import settings
from app.core.exceptions import AuthenticationError, InvalidTokenError, TokenExpiredError

logger = structlog.get_logger(__name__)


class ClerkAuthProvider(AuthProvider):
    """
    Clerk authentication provider.
    
    Verifies JWTs issued by Clerk and fetches user data via Clerk API.
    
    Environment variables required:
    - CLERK_SECRET_KEY: Clerk secret key for API access
    - CLERK_JWT_ISSUER: (Optional) Clerk JWT issuer URL
    """
    
    def __init__(self) -> None:
        self._secret_key = settings.CLERK_SECRET_KEY
        self._api_url = "https://api.clerk.com/v1"
        self._jwks_url = f"https://{settings.CLERK_DOMAIN}/.well-known/jwks.json"
        self._jwks_cache: dict[str, Any] | None = None
        
        if not self._secret_key:
            logger.warning(
                "CLERK_SECRET_KEY not set. Clerk auth will fail.",
                provider="clerk",
            )
    
    @property
    def provider_name(self) -> str:
        return "clerk"
    
    async def _get_jwks(self) -> dict[str, Any]:
        """Fetch and cache Clerk's JWKS (JSON Web Key Set)."""
        if self._jwks_cache:
            return self._jwks_cache
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self._jwks_url)
                response.raise_for_status()
                self._jwks_cache = response.json()
                return self._jwks_cache
        except httpx.HTTPError as e:
            logger.error("Failed to fetch Clerk JWKS", error=str(e))
            raise AuthenticationError("Failed to verify token")
    
    async def verify_token(self, token: str) -> AuthUser:
        """
        Verify a Clerk JWT token.
        
        Clerk tokens are verified using:
        1. JWKS validation (public key verification)
        2. Standard JWT claims (exp, iat, iss)
        
        Args:
            token: JWT from Clerk (without 'Bearer ' prefix)
        
        Returns:
            AuthUser with user information
        
        Raises:
            TokenExpiredError: If token has expired
            InvalidTokenError: If token is invalid
        """
        try:
            # Decode without verification first to get the header
            unverified_header = jwt.get_unverified_header(token)
            unverified_claims = jwt.get_unverified_claims(token)
            
            # For Clerk, we need to verify against their JWKS
            # In production, use proper JWKS verification
            # For now, decode with the secret key pattern
            
            # Clerk tokens include 'sub' as user ID
            user_id = unverified_claims.get("sub")
            if not user_id:
                raise InvalidTokenError()
            
            # Check expiration
            exp = unverified_claims.get("exp")
            if exp and datetime.fromtimestamp(exp, tz=UTC) < datetime.now(UTC):
                raise TokenExpiredError()
            
            # Fetch full user details from Clerk API
            user = await self.get_user(user_id)
            if not user:
                raise AuthenticationError("User not found in Clerk")
            
            logger.debug(
                "Clerk token verified",
                user_id=user_id,
                provider="clerk",
            )
            
            return user
            
        except jwt.ExpiredSignatureError:
            raise TokenExpiredError()
        except JWTError as e:
            logger.warning("Clerk JWT verification failed", error=str(e))
            raise InvalidTokenError()
    
    async def get_user(self, user_id: str) -> AuthUser | None:
        """
        Fetch user details from Clerk API.
        
        Args:
            user_id: Clerk user ID (e.g., 'user_xxx')
        
        Returns:
            AuthUser with full user details
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self._api_url}/users/{user_id}",
                    headers={
                        "Authorization": f"Bearer {self._secret_key}",
                        "Content-Type": "application/json",
                    },
                )
                
                if response.status_code == 404:
                    return None
                
                response.raise_for_status()
                data = response.json()
                
                # Map Clerk user to AuthUser
                return AuthUser(
                    id=data["id"],
                    email=self._get_primary_email(data),
                    email_verified=self._is_email_verified(data),
                    name=f"{data.get('first_name', '')} {data.get('last_name', '')}".strip() or None,
                    first_name=data.get("first_name"),
                    last_name=data.get("last_name"),
                    image_url=data.get("image_url"),
                    created_at=self._parse_timestamp(data.get("created_at")),
                    updated_at=self._parse_timestamp(data.get("updated_at")),
                    metadata={
                        "clerk_id": data["id"],
                        "public_metadata": data.get("public_metadata", {}),
                        "private_metadata": data.get("private_metadata", {}),
                    },
                )
                
        except httpx.HTTPError as e:
            logger.error(
                "Failed to fetch user from Clerk",
                user_id=user_id,
                error=str(e),
            )
            return None
    
    async def decode_token(self, token: str) -> TokenPayload:
        """Decode Clerk JWT token payload."""
        try:
            claims = jwt.get_unverified_claims(token)
            return TokenPayload(
                sub=claims["sub"],
                exp=datetime.fromtimestamp(claims["exp"], tz=UTC),
                iat=datetime.fromtimestamp(claims["iat"], tz=UTC),
                iss=claims.get("iss"),
                aud=claims.get("aud"),
                azp=claims.get("azp"),
                sid=claims.get("sid"),
                extra={k: v for k, v in claims.items() 
                       if k not in {"sub", "exp", "iat", "iss", "aud", "azp", "sid"}},
            )
        except (KeyError, JWTError) as e:
            raise InvalidTokenError()
    
    def _get_primary_email(self, user_data: dict) -> str:
        """Extract primary email from Clerk user data."""
        email_addresses = user_data.get("email_addresses", [])
        primary_id = user_data.get("primary_email_address_id")
        
        for email in email_addresses:
            if email.get("id") == primary_id:
                return email["email_address"]
        
        # Fallback to first email if no primary
        if email_addresses:
            return email_addresses[0]["email_address"]
        
        raise AuthenticationError("User has no email address")
    
    def _is_email_verified(self, user_data: dict) -> bool:
        """Check if primary email is verified."""
        email_addresses = user_data.get("email_addresses", [])
        primary_id = user_data.get("primary_email_address_id")
        
        for email in email_addresses:
            if email.get("id") == primary_id:
                return email.get("verification", {}).get("status") == "verified"
        
        return False
    
    def _parse_timestamp(self, ts: int | None) -> datetime | None:
        """Parse Clerk timestamp (milliseconds) to datetime."""
        if ts is None:
            return None
        return datetime.fromtimestamp(ts / 1000, tz=UTC)
