"""
AI Core - LLM Package
=====================
LLM client abstractions and implementations.
"""

from ai_core.llm.base import (
    LLMClient,
    LLMProvider,
    LLMResponse,
    LLMMessage,
    LLMRole,
    LLMUsage,
    LLMStreamChunk,
)
from ai_core.llm.factory import (
    get_llm_client,
    list_available_providers,
    get_provider_info,
)
from ai_core.llm.exceptions import (
    LLMError,
    LLMProviderError,
    LLMRateLimitError,
    LLMAuthenticationError,
    LLMModelNotFoundError,
)

__all__ = [
    # Base classes
    "LLMClient",
    "LLMProvider",
    "LLMResponse",
    "LLMMessage",
    "LLMRole",
    "LLMUsage",
    "LLMStreamChunk",
    # Factory
    "get_llm_client",
    "list_available_providers",
    "get_provider_info",
    # Exceptions
    "LLMError",
    "LLMProviderError",
    "LLMRateLimitError",
    "LLMAuthenticationError",
    "LLMModelNotFoundError",
]
