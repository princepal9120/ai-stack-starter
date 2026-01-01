"""
AI Core - LLM Factory
=====================
Factory pattern for creating LLM clients.

Automatically selects provider based on environment configuration.
"""

import os
from functools import lru_cache
from typing import Literal

import structlog

from ai_core.llm.base import LLMClient, LLMProvider
from ai_core.llm.openai import OpenAIClient
from ai_core.llm.anthropic import AnthropicClient
from ai_core.llm.gemini import GeminiClient
from ai_core.llm.ollama import OllamaClient
from ai_core.llm.exceptions import LLMProviderError, LLMAuthenticationError

logger = structlog.get_logger(__name__)

LLMProviderType = Literal["openai", "anthropic", "gemini", "ollama"]


@lru_cache(maxsize=4)
def _get_cached_client(
    provider: LLMProviderType,
    api_key: str | None,
    model: str | None,
) -> LLMClient:
    """
    Create and cache LLM client.
    
    Cached by (provider, api_key, model) to reuse connections.
    """
    if provider == "openai":
        if not api_key:
            raise LLMAuthenticationError(
                "OPENAI_API_KEY environment variable not set",
                provider="openai",
            )
        return OpenAIClient(api_key=api_key, model=model)
    
    elif provider == "anthropic":
        if not api_key:
            raise LLMAuthenticationError(
                "ANTHROPIC_API_KEY environment variable not set",
                provider="anthropic",
            )
        return AnthropicClient(api_key=api_key, model=model)
    
    elif provider == "gemini":
        if not api_key:
            raise LLMAuthenticationError(
                "GOOGLE_API_KEY environment variable not set",
                provider="gemini",
            )
        return GeminiClient(api_key=api_key, model=model)
    
    elif provider == "ollama":
        # Ollama doesn't need API key
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        return OllamaClient(base_url=base_url, model=model)
    
    else:
        raise LLMProviderError(
            f"Unknown provider: {provider}",
            provider=provider,
        )


def get_llm_client(
    provider: LLMProviderType | None = None,
    api_key: str | None = None,
    model: str | None = None,
    **kwargs,
) -> LLMClient:
    """
    Factory function to get the appropriate LLM client.
    
    Args:
        provider: LLM provider (openai, anthropic, gemini, ollama)
                 If None, reads from LLM_PROVIDER environment variable
        api_key: API key for the provider (if required)
                If None, reads from provider-specific env var
        model: Model to use (if None, uses provider default)
        **kwargs: Provider-specific configuration
    
    Returns:
        Configured LLM client
    
    Usage:
        # Auto-configured from environment
        llm = get_llm_client()
        
        # Explicit provider
        llm = get_llm_client(provider="openai", model="gpt-4")
        
        # Custom configuration
        llm = get_llm_client(
            provider="anthropic",
            api_key="sk-ant-xxx",
            model="claude-3-opus-20240229"
        )
    
    Environment Variables:
        LLM_PROVIDER: Default provider (openai, anthropic, gemini, ollama)
        OPENAI_API_KEY: OpenAI API key
        OPENAI_MODEL: Default OpenAI model
        ANTHROPIC_API_KEY: Anthropic API key
        ANTHROPIC_MODEL: Default Anthropic model
        GOOGLE_API_KEY: Google API key
        GEMINI_MODEL: Default Gemini model
        OLLAMA_BASE_URL: Ollama server URL
        OLLAMA_MODEL: Default Ollama model
    """
    # Get provider from argument or environment
    provider = provider or os.getenv("LLM_PROVIDER", "openai")
    
    # Get API key from argument or environment
    if api_key is None:
        if provider == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
        elif provider == "anthropic":
            api_key = os.getenv("ANTHROPIC_API_KEY")
        elif provider == "gemini":
            api_key = os.getenv("GOOGLE_API_KEY")
        # Ollama doesn't need API key
    
    # Get model from argument or environment
    if model is None:
        if provider == "openai":
            model = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
        elif provider == "anthropic":
            model = os.getenv("ANTHROPIC_MODEL", "claude-3-opus-20240229")
        elif provider == "gemini":
            model = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
        elif provider == "ollama":
            model = os.getenv("OLLAMA_MODEL", "llama3.2")
    
    logger.info(
        "Creating LLM client",
        provider=provider,
        model=model,
        has_api_key=api_key is not None,
    )
    
    # Use cached client if no custom kwargs
    if not kwargs:
        return _get_cached_client(provider, api_key, model)
    
    # Create fresh client with custom kwargs
    if provider == "openai":
        return OpenAIClient(api_key=api_key, model=model, **kwargs)
    elif provider == "anthropic":
        return AnthropicClient(api_key=api_key, model=model, **kwargs)
    elif provider == "gemini":
        return GeminiClient(api_key=api_key, model=model, **kwargs)
    elif provider == "ollama":
        base_url = kwargs.pop("base_url", os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"))
        return OllamaClient(base_url=base_url, model=model, **kwargs)


def list_available_providers() -> list[str]:
    """
    List available LLM providers based on environment configuration.
    
    Returns:
        List of provider names with valid API keys
    """
    available = []
    
    if os.getenv("OPENAI_API_KEY"):
        available.append("openai")
    if os.getenv("ANTHROPIC_API_KEY"):
        available.append("anthropic")
    if os.getenv("GOOGLE_API_KEY"):
        available.append("gemini")
    # Ollama is always available if running locally
    available.append("ollama")
    
    return available


def get_provider_info() -> dict[str, dict]:
    """
    Get information about configured providers.
    
    Returns:
        Dictionary with provider configuration details
    """
    return {
        "configured_provider": os.getenv("LLM_PROVIDER", "openai"),
        "available_providers": list_available_providers(),
        "models": {
            "openai": os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview"),
            "anthropic": os.getenv("ANTHROPIC_MODEL", "claude-3-opus-20240229"),
            "gemini": os.getenv("GEMINI_MODEL", "gemini-1.5-pro"),
            "ollama": os.getenv("OLLAMA_MODEL", "llama3.2"),
        },
    }
