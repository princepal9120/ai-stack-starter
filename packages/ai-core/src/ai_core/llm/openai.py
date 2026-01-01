"""
AI Core - OpenAI Client
=======================
OpenAI LLM client implementation.

Supports:
- GPT-4, GPT-3.5-turbo, GPT-4-turbo
- Streaming responses
- Function calling
- Vision (GPT-4V)
- Embeddings (text-embedding-3)
"""

import structlog
from typing import AsyncIterator

from openai import AsyncOpenAI
from openai.types.chat import ChatCompletion, ChatCompletionChunk
from openai.types import CreateEmbeddingResponse

from ai_core.llm.base import (
    LLMClient,
    LLMProvider,
    LLMResponse,
    LLMMessage,
    LLMRole,
    LLMUsage,
    LLMStreamChunk,
)

logger = structlog.get_logger(__name__)


# OpenAI pricing per 1M tokens (as of Jan 2026)
OPENAI_PRICING = {
    "gpt-4-turbo-preview": {"prompt": 10.00, "completion": 30.00},
    "gpt-4": {"prompt": 30.00, "completion": 60.00},
    "gpt-4-32k": {"prompt": 60.00, "completion": 120.00},
    "gpt-3.5-turbo": {"prompt": 0.50, "completion": 1.50},
    "gpt-3.5-turbo-16k": {"prompt": 3.00, "completion": 4.00},
    "text-embedding-3-large": {"prompt": 0.13, "completion": 0.0},
    "text-embedding-3-small": {"prompt": 0.02, "completion": 0.0},
    "text-embedding-ada-002": {"prompt": 0.10, "completion": 0.0},
}


class OpenAIClient(LLMClient):
    """
    OpenAI LLM client.
    
    Production-ready implementation with:
    - Automatic retries
    - Rate limit handling
    - Cost tracking
    - Structured logging
    """
    
    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4-turbo-preview",
        base_url: str | None = None,
        organization: str | None = None,
        **kwargs,
    ):
        super().__init__(api_key=api_key, model=model, **kwargs)
        
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            organization=organization,
        )
        
        logger.info(
            "OpenAI client initialized",
            model=model,
            has_organization=organization is not None,
        )
    
    @property
    def provider(self) -> LLMProvider:
        return LLMProvider.OPENAI
    
    @property
    def default_model(self) -> str:
        return self.model or "gpt-4-turbo-preview"
    
    def _convert_messages(
        self,
        prompt: str | list[LLMMessage],
    ) -> list[dict]:
        """Convert unified messages to OpenAI format."""
        if isinstance(prompt, str):
            return [{"role": "user", "content": prompt}]
        
        return [
            {
                "role": msg.role.value,
                "content": msg.content,
                **({"name": msg.name} if msg.name else {}),
                **({"function_call": msg.function_call} if msg.function_call else {}),
            }
            for msg in prompt
        ]
    
    def _parse_usage(
        self,
        usage: dict,
        model: str,
    ) -> LLMUsage:
        """Parse usage and calculate cost."""
        prompt_tokens = usage.get("prompt_tokens", 0)
        completion_tokens = usage.get("completion_tokens", 0)
        
        # Get pricing for model (fallback to gpt-4-turbo)
        pricing = OPENAI_PRICING.get(model, OPENAI_PRICING["gpt-4-turbo-preview"])
        
        # Calculate cost (pricing is per 1M tokens)
        prompt_cost = (prompt_tokens / 1_000_000) * pricing["prompt"]
        completion_cost = (completion_tokens / 1_000_000) * pricing["completion"]
        
        return LLMUsage(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
            prompt_cost=prompt_cost,
            completion_cost=completion_cost,
            total_cost=prompt_cost + completion_cost,
        )
    
    async def complete(
        self,
        prompt: str | list[LLMMessage],
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int | None = None,
        stop: list[str] | None = None,
        **kwargs,
    ) -> LLMResponse:
        """Generate completion using OpenAI."""
        model = model or self.default_model
        messages = self._convert_messages(prompt)
        
        logger.debug(
            "OpenAI completion request",
            model=model,
            message_count=len(messages),
            temperature=temperature,
        )
        
        try:
            response: ChatCompletion = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stop=stop,
                **kwargs,
            )
            
            choice = response.choices[0]
            content = choice.message.content or ""
            
            usage = self._parse_usage(
                response.usage.model_dump() if response.usage else {},
                model=model,
            )
            
            logger.info(
                "OpenAI completion success",
                model=model,
                tokens=usage.total_tokens,
                cost=usage.total_cost,
            )
            
            return LLMResponse(
                content=content,
                model=model,
                provider=self.provider,
                usage=usage,
                finish_reason=choice.finish_reason,
                raw_response=response.model_dump(),
                function_call=choice.message.function_call.model_dump() if choice.message.function_call else None,
                tool_calls=[tc.model_dump() for tc in choice.message.tool_calls] if choice.message.tool_calls else [],
            )
            
        except Exception as e:
            logger.error(
                "OpenAI completion failed",
                model=model,
                error=str(e),
                error_type=type(e).__name__,
            )
            raise
    
    async def stream(
        self,
        prompt: str | list[LLMMessage],
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int | None = None,
        **kwargs,
    ) -> AsyncIterator[LLMStreamChunk]:
        """Stream completion token-by-token."""
        model = model or self.default_model
        messages = self._convert_messages(prompt)
        
        logger.debug(
            "OpenAI streaming request",
            model=model,
            message_count=len(messages),
        )
        
        try:
            stream = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
                **kwargs,
            )
            
            async for chunk in stream:
                if not chunk.choices:
                    continue
                
                choice = chunk.choices[0]
                delta = choice.delta.content or ""
                
                if delta:
                    yield LLMStreamChunk(
                        delta=delta,
                        finish_reason=choice.finish_reason,
                    )
                
                # Last chunk includes usage (if available)
                if choice.finish_reason:
                    usage = None
                    if hasattr(chunk, "usage") and chunk.usage:
                        usage = self._parse_usage(
                            chunk.usage.model_dump(),
                            model=model,
                        )
                    
                    yield LLMStreamChunk(
                        delta="",
                        finish_reason=choice.finish_reason,
                        usage=usage,
                    )
            
            logger.info("OpenAI streaming complete", model=model)
            
        except Exception as e:
            logger.error(
                "OpenAI streaming failed",
                model=model,
                error=str(e),
            )
            raise
    
    async def embed(
        self,
        text: str | list[str],
        model: str | None = None,
        **kwargs,
    ) -> list[list[float]]:
        """Generate embeddings using OpenAI."""
        model = model or "text-embedding-3-large"
        texts = [text] if isinstance(text, str) else text
        
        logger.debug(
            "OpenAI embedding request",
            model=model,
            text_count=len(texts),
        )
        
        try:
            response: CreateEmbeddingResponse = await self.client.embeddings.create(
                model=model,
                input=texts,
                **kwargs,
            )
            
            embeddings = [item.embedding for item in response.data]
            
            # Calculate cost
            usage = self._parse_usage(
                {"prompt_tokens": response.usage.prompt_tokens, "completion_tokens": 0},
                model=model,
            )
            
            logger.info(
                "OpenAI embedding success",
                model=model,
                text_count=len(texts),
                embedding_dim=len(embeddings[0]) if embeddings else 0,
                cost=usage.total_cost,
            )
            
            return embeddings
            
        except Exception as e:
            logger.error(
                "OpenAI embedding failed",
                model=model,
                error=str(e),
            )
            raise
    
    async def count_tokens(
        self,
        text: str,
        model: str | None = None,
    ) -> int:
        """Count tokens using tiktoken."""
        try:
            import tiktoken
            
            model = model or self.default_model
            
            # Get encoding for model
            try:
                encoding = tiktoken.encoding_for_model(model)
            except KeyError:
                # Fallback to cl100k_base (used by GPT-4, GPT-3.5-turbo)
                encoding = tiktoken.get_encoding("cl100k_base")
            
            return len(encoding.encode(text))
            
        except ImportError:
            # Fallback to rough approximation
            return await super().count_tokens(text, model)
