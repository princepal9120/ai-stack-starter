"""
AI Core - Google Gemini Client
===============================
Google Gemini LLM client implementation.

Supports:
- Gemini 1.5 Pro (multimodal, 2M token context)
- Gemini 1.0 Pro
- Streaming responses
- Vision, audio, video inputs
"""

import structlog
from typing import AsyncIterator

import google.generativeai as genai
from google.generativeai.types import GenerateContentResponse, ContentDict

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


# Gemini pricing per 1M tokens (as of Jan 2026)
GEMINI_PRICING = {
    "gemini-1.5-pro": {"prompt": 1.25, "completion": 5.00},
    "gemini-1.5-flash": {"prompt": 0.075, "completion": 0.30},
    "gemini-1.0-pro": {"prompt": 0.50, "completion": 1.50},
}


class GeminiClient(LLMClient):
    """
    Google Gemini client.
    
    Features:
    - Ultra-long context (up to 2M tokens)
    - Multimodal (text, images, video, audio)
    - Fast inference (Gemini Flash)
    """
    
    def __init__(
        self,
        api_key: str,
        model: str = "gemini-1.5-pro",
        **kwargs,
    ):
        super().__init__(api_key=api_key, model=model, **kwargs)
        
        genai.configure(api_key=api_key)
        self.client = genai.GenerativeModel(model or self.default_model)
        
        logger.info("Gemini client initialized", model=model)
    
    @property
    def provider(self) -> LLMProvider:
        return LLMProvider.GEMINI
    
    @property
    def default_model(self) -> str:
        return self.model or "gemini-1.5-pro"
    
    def _convert_messages(
        self,
        prompt: str | list[LLMMessage],
    ) -> list[ContentDict]:
        """Convert unified messages to Gemini format."""
        if isinstance(prompt, str):
            return [{"role": "user", "parts": [prompt]}]
        
        messages = []
        for msg in prompt:
            # Gemini uses "user" and "model" roles
            role = "model" if msg.role == LLMRole.ASSISTANT else "user"
            
            # Skip system messages (add them to user context instead)
            if msg.role == LLMRole.SYSTEM:
                # Prepend system message to first user message
                if messages and messages[0]["role"] == "user":
                    messages[0]["parts"].insert(0, f"Instructions: {msg.content}\n\n")
                else:
                    messages.insert(0, {
                        "role": "user",
                        "parts": [f"Instructions: {msg.content}\n\n"]
                    })
            else:
                messages.append({
                    "role": role,
                    "parts": [msg.content],
                })
        
        return messages
    
    def _parse_usage(
        self,
        response: GenerateContentResponse,
        model: str,
    ) -> LLMUsage:
        """Parse usage and calculate cost."""
        usage_metadata = response.usage_metadata
        
        prompt_tokens = usage_metadata.prompt_token_count if usage_metadata else 0
        completion_tokens = usage_metadata.candidates_token_count if usage_metadata else 0
        
        # Get pricing for model
        pricing = GEMINI_PRICING.get(model, GEMINI_PRICING["gemini-1.5-pro"])
        
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
        """Generate completion using Gemini."""
        model = model or self.default_model
        
        # Create model if different from initialized
        if model != self.client.model_name:
            client = genai.GenerativeModel(model)
        else:
            client = self.client
        
        messages = self._convert_messages(prompt)
        
        logger.debug(
            "Gemini completion request",
            model=model,
            message_count=len(messages),
        )
        
        try:
            # Build generation config
            generation_config = {
                "temperature": temperature,
                "max_output_tokens": max_tokens,
                "stop_sequences": stop,
            }
            
            # Remove None values
            generation_config = {k: v for k, v in generation_config.items() if v is not None}
            
            response = await client.generate_content_async(
                contents=messages,
                generation_config=generation_config if generation_config else None,
                **kwargs,
            )
            
            content = response.text
            usage = self._parse_usage(response, model)
            
            logger.info(
                "Gemini completion success",
                model=model,
                tokens=usage.total_tokens,
                cost=usage.total_cost,
            )
            
            return LLMResponse(
                content=content,
                model=model,
                provider=self.provider,
                usage=usage,
                finish_reason=response.candidates[0].finish_reason.name if response.candidates else None,
                raw_response={"candidates": [c.to_dict() for c in response.candidates]},
            )
            
        except Exception as e:
            logger.error(
                "Gemini completion failed",
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
        
        if model != self.client.model_name:
            client = genai.GenerativeModel(model)
        else:
            client = self.client
        
        messages = self._convert_messages(prompt)
        
        logger.debug("Gemini streaming request", model=model)
        
        try:
            generation_config = {
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            }
            generation_config = {k: v for k, v in generation_config.items() if v is not None}
            
            response = await client.generate_content_async(
                contents=messages,
                generation_config=generation_config if generation_config else None,
                stream=True,
                **kwargs,
            )
            
            async for chunk in response:
                if chunk.text:
                    yield LLMStreamChunk(
                        delta=chunk.text,
                        finish_reason=None,
                    )
            
            # TODO: Gemini doesn't provide usage in stream yet
            # Final chunk would include usage when available
            yield LLMStreamChunk(
                delta="",
                finish_reason="stop",
                usage=None,
            )
            
            logger.info("Gemini streaming complete", model=model)
            
        except Exception as e:
            logger.error(
                "Gemini streaming failed",
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
        Generate embeddings using Gemini.
        
        Note: Gemini embeddings use a different model (embedding-001).
        """
        model = model or "models/embedding-001"
        texts = [text] if isinstance(text, str) else text
        
        logger.debug(
            "Gemini embedding request",
            model=model,
            text_count=len(texts),
        )
        
        try:
            embeddings = []
            
            for text_item in texts:
                result = genai.embed_content(
                    model=model,
                    content=text_item,
                    task_type="retrieval_document",
                    **kwargs,
                )
                embeddings.append(result["embedding"])
            
            logger.info(
                "Gemini embedding success",
                model=model,
                text_count=len(texts),
                embedding_dim=len(embeddings[0]) if embeddings else 0,
            )
            
            return embeddings
            
        except Exception as e:
            logger.error(
                "Gemini embedding failed",
                model=model,
                error=str(e),
            )
            raise
