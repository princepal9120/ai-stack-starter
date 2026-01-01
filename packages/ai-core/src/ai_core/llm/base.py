"""
AI Core - LLM Base Interface
============================
Abstract base class for LLM clients with vendor-agnostic API.

Following SOLID principles and clean architecture from GEMINI.md:
- Single Responsibility: Each client handles one LLM provider
- Open/Closed: Extensible for new providers without modifying existing code
- Liskov Substitution: All providers interchangeable via base interface
- Interface Segregation: Minimal, focused interface
- Dependency Inversion: Depend on abstractions, not concrete implementations
"""

from abc import ABC, abstractmethod
from datetime import datetime, UTC
from enum import Enum
from typing import AsyncIterator, Literal

from pydantic import BaseModel, Field


class LLMProvider(str, Enum):
    """Supported LLM providers."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GEMINI = "gemini"
    OLLAMA = "ollama"


class LLMRole(str, Enum):
    """Message roles in conversation."""
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    FUNCTION = "function"


class LLMMessage(BaseModel):
    """
    Message in a conversation.
    Normalized across all providers.
    """
    role: LLMRole
    content: str
    name: str | None = None
    function_call: dict | None = None


class LLMUsage(BaseModel):
    """
    Token usage and cost tracking.
    Essential for production AI systems.
    """
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    
    # Cost tracking (USD)
    prompt_cost: float = 0.0
    completion_cost: float = 0.0
    total_cost: float = 0.0
    
    @property
    def cost_per_token(self) -> float:
        """Calculate average cost per token."""
        return self.total_cost / self.total_tokens if self.total_tokens > 0 else 0.0


class LLMResponse(BaseModel):
    """
    Unified response from any LLM provider.
    
    Design principle: Normalization at the boundary
    - Convert provider-specific responses to this format
    - Internal code works with consistent interface
    """
    content: str = Field(..., description="Generated text content")
    model: str = Field(..., description="Model identifier used")
    provider: LLMProvider = Field(..., description="LLM provider")
    
    # Metadata
    usage: LLMUsage = Field(default_factory=LLMUsage)
    finish_reason: str | None = Field(default=None, description="Why generation stopped")
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    
    # Provider-specific data
    raw_response: dict = Field(default_factory=dict, description="Original provider response")
    
    # Function calling
    function_call: dict | None = None
    tool_calls: list[dict] = Field(default_factory=list)


class LLMStreamChunk(BaseModel):
    """
    Chunk from streaming response.
    Emitted progressively as tokens are generated.
    """
    delta: str = Field(..., description="Incremental text content")
    finish_reason: str | None = None
    usage: LLMUsage | None = None


class LLMClient(ABC):
    """
    Abstract base class for LLM clients.
    
    All LLM providers must implement this interface.
    Ensures consistent API regardless of underlying provider.
    
    Design principles:
    - Async-first for non-blocking I/O
    - Type-safe with Pydantic models
    - Observable with structured metadata
    - Cost-aware with token tracking
    """
    
    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        **kwargs,
    ):
        """
        Initialize LLM client.
        
        Args:
            api_key: API key for the provider (if required)
            model: Default model to use
            **kwargs: Provider-specific configuration
        """
        self.api_key = api_key
        self.model = model
        self.config = kwargs
    
    @property
    @abstractmethod
    def provider(self) -> LLMProvider:
        """Return the provider identifier."""
        ...
    
    @property
    @abstractmethod
    def default_model(self) -> str:
        """Return the default model name for this provider."""
        ...
    
    @abstractmethod
    async def complete(
        self,
        prompt: str | list[LLMMessage],
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int | None = None,
        stop: list[str] | None = None,
        **kwargs,
    ) -> LLMResponse:
        """
        Generate a completion from prompt.
        
        Args:
            prompt: Text prompt or conversation messages
            model: Override default model
            temperature: Sampling temperature (0.0-2.0)
            max_tokens: Maximum tokens to generate
            stop: Stop sequences
            **kwargs: Provider-specific parameters
        
        Returns:
            LLMResponse with generated content and metadata
        
        Raises:
            LLMError: If generation fails
        """
        ...
    
    @abstractmethod
    async def stream(
        self,
        prompt: str | list[LLMMessage],
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int | None = None,
        **kwargs,
    ) -> AsyncIterator[LLMStreamChunk]:
        """
        Stream completion token-by-token.
        
        Args:
            prompt: Text prompt or conversation messages
            model: Override default model
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Provider-specific parameters
        
        Yields:
            LLMStreamChunk for each token
        
        Example:
            async for chunk in llm.stream("Hello"):
                print(chunk.delta, end="", flush=True)
        """
        ...
    
    @abstractmethod
    async def embed(
        self,
        text: str | list[str],
        model: str | None = None,
        **kwargs,
    ) -> list[list[float]]:
        """
        Generate embeddings for text.
        
        Args:
            text: Single text or list of texts
            model: Override default embedding model
            **kwargs: Provider-specific parameters
        
        Returns:
            List of embedding vectors (one per input text)
        
        Example:
            embeddings = await llm.embed("Hello world")
            assert len(embeddings) == 1
            assert len(embeddings[0]) == 1536  # OpenAI embedding size
        """
        ...
    
    async def count_tokens(
        self,
        text: str,
        model: str | None = None,
    ) -> int:
        """
        Count tokens in text.
        
        Default implementation (override for accuracy).
        Uses rough approximation: ~4 chars per token.
        
        Args:
            text: Text to count tokens for
            model: Model to use for tokenization
        
        Returns:
            Estimated token count
        """
        # Rough approximation: 4 characters ≈ 1 token
        return len(text) // 4
    
    def calculate_cost(
        self,
        prompt_tokens: int,
        completion_tokens: int,
        model: str | None = None,
    ) -> LLMUsage:
        """
        Calculate cost for token usage.
        
        Override this method for provider-specific pricing.
        
        Args:
            prompt_tokens: Input tokens
            completion_tokens: Output tokens
            model: Model used
        
        Returns:
            LLMUsage with cost breakdown
        """
        return LLMUsage(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
            prompt_cost=0.0,
            completion_cost=0.0,
            total_cost=0.0,
        )
    
    async def health_check(self) -> bool:
        """
        Check if the LLM service is available.
        
        Returns:
            True if service is healthy
        """
        try:
            response = await self.complete(
                prompt="Say 'OK'",
                max_tokens=5,
                temperature=0.0,
            )
            return len(response.content) > 0
        except Exception:
            return False
