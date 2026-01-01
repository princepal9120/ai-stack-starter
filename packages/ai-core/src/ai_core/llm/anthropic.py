"""
AI Core - Anthropic Client
==========================
Anthropic Claude LLM client implementation.

Supports:
- Claude 3 (Opus, Sonnet, Haiku)
- Streaming responses
- Long context (200k tokens)
- Vision capabilities
"""

import structlog
from typing import AsyncIterator

from anthropic import AsyncAnthropic
from anthropic.types import Message, MessageStreamEvent

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


# Anthropic pricing per 1M tokens (as of Jan 2026)
ANTHROPIC_PRICING = {
    "claude-3-opus-20240229": {"prompt": 15.00, "completion": 75.00},
    "claude-3-sonnet-20240229": {"prompt": 3.00, "completion": 15.00},
    "claude-3-haiku-20240307": {"prompt": 0.25, "completion": 1.25},
    "claude-2.1": {"prompt": 8.00, "completion": 24.00},
    "claude-2.0": {"prompt": 8.00, "completion": 24.00},
}


class AnthropicClient(LLMClient):
    """
    Anthropic Claude client.
    
    Features:
    - Long context windows (up to 200k tokens)
    - Constitutional AI (safer, more helpful)
    - Streaming support
    """
    
    def __init__(
        self,
        api_key: str,
        model: str = "claude-3-opus-20240229",
        **kwargs,
    ):
        super().__init__(api_key=api_key, model=model, **kwargs)
        
        self.client = AsyncAnthropic(api_key=api_key)
        
        logger.info("Anthropic client initialized", model=model)
    
    @property
    def provider(self) -> LLMProvider:
        return LLMProvider.ANTHROPIC
    
    @property
    def default_model(self) -> str:
        return self.model or "claude-3-opus-20240229"
    
    def _convert_messages(
        self,
        prompt: str | list[LLMMessage],
    ) -> tuple[str | None, list[dict]]:
        """
        Convert unified messages to Anthropic format.
        
        Anthropic separates system message from conversation.
        Returns: (system_message, messages)
        """
        if isinstance(prompt, str):
            return None, [{"role": "user", "content": prompt}]
        
        system_message = None
        messages = []
        
        for msg in prompt:
            if msg.role == LLMRole.SYSTEM:
                # Anthropic uses separate system parameter
                system_message = msg.content
            else:
                messages.append({
                    "role": "assistant" if msg.role == LLMRole.ASSISTANT else "user",
                    "content": msg.content,
                })
        
        return system_message, messages
    
    def _parse_usage(
        self,
        usage: dict,
        model: str,
    ) -> LLMUsage:
        """Parse usage and calculate cost."""
        prompt_tokens = usage.get("input_tokens", 0)
        completion_tokens = usage.get("output_tokens", 0)
        
        # Get pricing for model
        pricing = ANTHROPIC_PRICING.get(model, ANTHROPIC_PRICING["claude-3-opus-20240229"])
        
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
        """Generate completion using Claude."""
        model = model or self.default_model
        system, messages = self._convert_messages(prompt)
        
        # Anthropic requires max_tokens
        if max_tokens is None:
            max_tokens = 4096
        
        logger.debug(
            "Anthropic completion request",
            model=model,
            message_count=len(messages),
            has_system=system is not None,
        )
        
        try:
            response: Message = await self.client.messages.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system if system else anthropic.NOT_GIVEN,
                stop_sequences=stop if stop else anthropic.NOT_GIVEN,
                **kwargs,
            )
            
            # Extract text content
            content = ""
            for block in response.content:
                if block.type == "text":
                    content += block.text
            
            usage = self._parse_usage(
                response.usage.model_dump(),
                model=model,
            )
            
            logger.info(
                "Anthropic completion success",
                model=model,
                tokens=usage.total_tokens,
                cost=usage.total_cost,
            )
            
            return LLMResponse(
                content=content,
                model=model,
                provider=self.provider,
                usage=usage,
                finish_reason=response.stop_reason,
                raw_response=response.model_dump(),
            )
            
        except Exception as e:
            logger.error(
                "Anthropic completion failed",
                model=model,
                error=str(e),
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
        system, messages = self._convert_messages(prompt)
        
        if max_tokens is None:
            max_tokens = 4096
        
        logger.debug("Anthropic streaming request", model=model)
        
        try:
            async with self.client.messages.stream(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system if system else anthropic.NOT_GIVEN,
                **kwargs,
            ) as stream:
                async for event in stream:
                    if event.type == "content_block_delta":
                        if hasattr(event.delta, "text"):
                            yield LLMStreamChunk(
                                delta=event.delta.text,
                                finish_reason=None,
                            )
                    
                    elif event.type == "message_stop":
                        # Final message with usage
                        message = await stream.get_final_message()
                        usage = self._parse_usage(
                            message.usage.model_dump(),
                            model=model,
                        )
                        
                        yield LLMStreamChunk(
                            delta="",
                            finish_reason=message.stop_reason,
                            usage=usage,
                        )
            
            logger.info("Anthropic streaming complete", model=model)
            
        except Exception as e:
            logger.error(
                "Anthropic streaming failed",
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
        """
        Anthropic doesn't provide embeddings.
        Raise NotImplementedError.
        """
        raise NotImplementedError(
            "Anthropic does not provide embedding models. "
            "Use OpenAI or another provider for embeddings."
        )
