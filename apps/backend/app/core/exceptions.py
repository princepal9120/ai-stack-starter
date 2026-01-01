"""
AI Stack FastAPI - Custom Exceptions
====================================
Application-specific exception classes for consistent error handling.
"""

from typing import Any


class AIStackException(Exception):
    """Base exception for all AI Stack errors."""
    
    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = 500,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


# =============================================================================
# Authentication Exceptions
# =============================================================================

class AuthenticationError(AIStackException):
    """Raised when authentication fails."""
    
    def __init__(self, message: str = "Authentication failed") -> None:
        super().__init__(
            message=message,
            code="AUTHENTICATION_ERROR",
            status_code=401,
        )


class AuthorizationError(AIStackException):
    """Raised when user lacks required permissions."""
    
    def __init__(self, message: str = "Permission denied") -> None:
        super().__init__(
            message=message,
            code="AUTHORIZATION_ERROR",
            status_code=403,
        )


class TokenExpiredError(AuthenticationError):
    """Raised when JWT token has expired."""
    
    def __init__(self) -> None:
        super().__init__(message="Token has expired")
        self.code = "TOKEN_EXPIRED"


class InvalidTokenError(AuthenticationError):
    """Raised when JWT token is invalid."""
    
    def __init__(self) -> None:
        super().__init__(message="Invalid token")
        self.code = "INVALID_TOKEN"


# =============================================================================
# Resource Exceptions
# =============================================================================

class NotFoundError(AIStackException):
    """Raised when a resource is not found."""
    
    def __init__(self, resource: str, identifier: str | None = None) -> None:
        message = f"{resource} not found"
        if identifier:
            message = f"{resource} with id '{identifier}' not found"
        super().__init__(
            message=message,
            code="NOT_FOUND",
            status_code=404,
            details={"resource": resource, "identifier": identifier},
        )


class AlreadyExistsError(AIStackException):
    """Raised when a resource already exists."""
    
    def __init__(self, resource: str, identifier: str | None = None) -> None:
        message = f"{resource} already exists"
        if identifier:
            message = f"{resource} with id '{identifier}' already exists"
        super().__init__(
            message=message,
            code="ALREADY_EXISTS",
            status_code=409,
            details={"resource": resource, "identifier": identifier},
        )


# =============================================================================
# Validation Exceptions
# =============================================================================

class ValidationError(AIStackException):
    """Raised when input validation fails."""
    
    def __init__(
        self,
        message: str = "Validation error",
        errors: list[dict[str, Any]] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=422,
            details={"errors": errors or []},
        )


# =============================================================================
# LLM Exceptions
# =============================================================================

class LLMError(AIStackException):
    """Base exception for LLM-related errors."""
    
    def __init__(
        self,
        message: str = "LLM error",
        provider: str | None = None,
    ) -> None:
        super().__init__(
            message=message,
            code="LLM_ERROR",
            status_code=502,
            details={"provider": provider},
        )


class LLMRateLimitError(LLMError):
    """Raised when LLM rate limit is exceeded."""
    
    def __init__(self, provider: str, retry_after: int | None = None) -> None:
        super().__init__(
            message=f"Rate limit exceeded for {provider}",
            provider=provider,
        )
        self.code = "LLM_RATE_LIMIT"
        self.status_code = 429
        if retry_after:
            self.details["retry_after"] = retry_after


class LLMProviderError(LLMError):
    """Raised when LLM provider returns an error."""
    
    def __init__(self, provider: str, original_error: str) -> None:
        super().__init__(
            message=f"Error from {provider}: {original_error}",
            provider=provider,
        )
        self.code = "LLM_PROVIDER_ERROR"
        self.details["original_error"] = original_error


# =============================================================================
# Vector Store Exceptions
# =============================================================================

class VectorStoreError(AIStackException):
    """Base exception for vector store errors."""
    
    def __init__(
        self,
        message: str = "Vector store error",
        provider: str | None = None,
    ) -> None:
        super().__init__(
            message=message,
            code="VECTOR_STORE_ERROR",
            status_code=502,
            details={"provider": provider},
        )


class VectorStoreConnectionError(VectorStoreError):
    """Raised when connection to vector store fails."""
    
    def __init__(self, provider: str) -> None:
        super().__init__(
            message=f"Failed to connect to {provider}",
            provider=provider,
        )
        self.code = "VECTOR_STORE_CONNECTION_ERROR"


# =============================================================================
# Rate Limiting Exceptions
# =============================================================================

class RateLimitExceededError(AIStackException):
    """Raised when API rate limit is exceeded."""
    
    def __init__(self, retry_after: int) -> None:
        super().__init__(
            message="Rate limit exceeded. Please try again later.",
            code="RATE_LIMIT_EXCEEDED",
            status_code=429,
            details={"retry_after": retry_after},
        )


# =============================================================================
# File Exceptions
# =============================================================================

class FileUploadError(AIStackException):
    """Raised when file upload fails."""
    
    def __init__(self, message: str = "File upload failed") -> None:
        super().__init__(
            message=message,
            code="FILE_UPLOAD_ERROR",
            status_code=400,
        )


class FileTooLargeError(FileUploadError):
    """Raised when uploaded file exceeds size limit."""
    
    def __init__(self, max_size_mb: int) -> None:
        super().__init__(
            message=f"File exceeds maximum size of {max_size_mb}MB"
        )
        self.code = "FILE_TOO_LARGE"


class UnsupportedFileTypeError(FileUploadError):
    """Raised when file type is not supported."""
    
    def __init__(self, file_type: str, allowed_types: list[str]) -> None:
        super().__init__(
            message=f"File type '{file_type}' is not supported. Allowed: {', '.join(allowed_types)}"
        )
        self.code = "UNSUPPORTED_FILE_TYPE"
        self.details = {"file_type": file_type, "allowed_types": allowed_types}
