"""
AI Core - LLM Exceptions
========================
Custom exceptions for LLM operations.
"""


class LLMError(Exception):
    """Base exception for LLM operations."""
    
    def __init__(
        self,
        message: str,
        provider: str | None = None,
        model: str | None = None,
        **kwargs,
    ):
        super().__init__(message)
        self.message = message
        self.provider = provider
        self.model = model
        self.details = kwargs


class LLMProviderError(LLMError):
    """Provider-specific error (API, network, etc)."""
    pass


class LLMRateLimitError(LLMError):
    """Rate limit exceeded."""
    pass


class LLMQuotaExceededError(LLMError):
    """API quota exceeded."""
    pass


class LLMInvalidRequestError(LLMError):
    """Invalid request parameters."""
    pass


class LLMAuthenticationError(LLMError):
    """Authentication failed (invalid API key)."""
    pass


class LLMModelNotFoundError(LLMError):
    """Requested model doesn't exist."""
    pass


class LLMContextLengthExceededError(LLMError):
    """Input exceeds model's context length."""
    pass


class LLMContentFilterError(LLMError):
    """Content filtered by safety systems."""
    pass
