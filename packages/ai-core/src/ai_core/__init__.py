"""
AI Core Package
===============
Vendor-agnostic LLM client abstractions for AI applications.

Provides unified interfaces for:
- LLM completions (OpenAI, Anthropic, Gemini, Ollama)
- Embeddings generation
- Streaming responses
- Token counting and cost tracking

Usage:
    from ai_core.llm import get_llm_client
    
    llm = get_llm_client()  # Auto-configured from env
    response = await llm.complete("Hello, world!")
"""

from ai_core.llm.base import LLMClient, LLMResponse, LLMMessage, LLMUsage
from ai_core.llm.factory import get_llm_client

__version__ = "0.1.0"

__all__ = [
    "LLMClient",
    "LLMResponse",
    "LLMMessage",
    "LLMUsage",
    "get_llm_client",
]
