"""
AI Stack FastAPI - Auth Package
===============================
Vendor-agnostic authentication abstraction.
Supports Clerk and Custom JWT providers.
"""

from app.auth.base import AuthProvider, AuthUser
from app.auth.factory import get_auth_provider

__all__ = ["AuthProvider", "AuthUser", "get_auth_provider"]
