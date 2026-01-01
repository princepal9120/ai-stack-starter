"""
AI Core - Ollama Client
=======================
Ollama local LLM client implementation.

Supports:
- Local open-source models (Llama, Mistral, etc.)
- Self-hosted deployment (no API costs)
- Streaming responses
- Custom model loading
"""

import structlog
from typing import AsyncIterator

from ollama import AsyncClient

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


class OllamaClient(LLMClient):
    """
    Ollama local LLM client.
    
    Features:
    - No API costs (self-hosted)
    - Privacy (data stays local)
    - Offline operation
    - Multiple open-source models
    """
    
    def __init__(
        self,
        base_url: str = "http://localhost:11434",
        model: str = "llama3.2",
        **kwargs,
    ):
        super().__init__(api_key=None, model=model, **kwargs)
        
        self.client = AsyncClient(host=base_url)
        self.base_url = base_url
        
        logger.info(
            "Ollama client initialized",
            base_url=base_url,
            model=model,
        )
    
    @property
    def provider(self) -> LLMProvider:
        return LLMProvider.OLLAMA
    
    @property
    def default_model(self) -> str:
        return self.model or "llama3.2"
    
    def _convert_messages(
        self,
        prompt: str | list[LLMMessage],
    ) -> list[dict]:
        """Convert unified messages to Ollama format."""
        if isinstance(prompt, str):
            return [{"role": "user", "content": prompt}]
        
        return [
            {
                "role": msg.role.value,
                "content": msg.content,
            }
            for msg in prompt
        ]
    
    def _parse_usage(
        self,
        response: dict,
        model: str,
    ) -> LLMUsage:
        """
        Parse usage from Ollama response.
        
        Note: Ollama doesn't charge, so cost is always 0.
        """
        # Ollama provides eval_count and prompt_eval_count
        prompt_tokens = response.get("prompt_eval_count", 0)
        completion_tokens = response.get("eval_count", 0)
        
        return LLMUsage(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
            prompt_cost=0.0,  # Local models are free
            completion_cost=0.0,
            total_cost=0.0,
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
        """Generate completion using Ollama."""
        model = model or self.default_model
        messages = self._convert_messages(prompt)
        
        logger.debug(
            "Ollama completion request",
            model=model,
            message_count=len(messages),
        )
        
        try:
            response = await self.client.chat(
                model=model,
                messages=messages,
                options={
                    "temperature": temperature,
                    "num_predict": max_tokens,
                    "stop": stop,
                    **kwargs,
                },
            )
            
            content = response["message"]["content"]
            usage = self._parse_usage(response, model)
            
            logger.info(
                "Ollama completion success",
                model=model,
                tokens=usage.total_tokens,
            )
            
            return LLMResponse(
                content=content,
                model=model,
                provider=self.provider,
                usage=usage,
                finish_reason=response.get("done_reason", "stop"),
                raw_response=response,
            )
            
        except Exception as e:
            logger.error(
                "Ollama completion failed",
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
        messages = self._convert_messages(prompt)
        
        logger.debug("Ollama streaming request", model=model)
        
        try:
            stream = await self.client.chat(
                model=model,
                messages=messages,
                stream=True,
                options={
                    "temperature": temperature,
                    "num_predict": max_tokens,
                    **kwargs,
                },
            )
            
            async for chunk in stream:
                delta = chunk["message"]["content"]
                
                if delta:
                    yield LLMStreamChunk(
                        delta=delta,
                        finish_reason=None,
                    )
                
                # Final chunk
                if chunk.get("done"):
                    usage = self._parse_usage(chunk, model)
                    yield LLMStreamChunk(
                        delta="",
                        finish_reason=chunk.get("done_reason", "stop"),
                        usage=usage,
                    )
            
            logger.info("Ollama streaming complete", model=model)
            
        except Exception as e:
            logger.error(
                "Ollama streaming failed",
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
        """Generate embeddings using Ollama."""
        model = model or self.default_model
        texts = [text] if isinstance(text, str) else text
        
        logger.debug(
            "Ollama embedding request",
            model=model,
            text_count=len(texts),
        )
        
        try:
            embeddings = []
            
            for text_item in texts:
                response = await self.client.embeddings(
                    model=model,
                    prompt=text_item,
                    **kwargs,
                )
                embeddings.append(response["embedding"])
            
            logger.info(
                "Ollama embedding success",
                model=model,
                text_count=len(texts),
                embedding_dim=len(embeddings[0]) if embeddings else 0,
            )
            
            return embeddings
            
        except Exception as e:
            logger.error(
                "Ollama embedding failed",
                model=model,
                error=str(e),
            )
            raise
    
    async def list_models(self) -> list[str]:
        """
        List available models in Ollama.
        
        Returns:
            List of model names
        """
        try:
            response = await self.client.list()
            return [model["name"] for model in response.get("models", [])]
        except Exception as e:
            logger.error("Failed to list Ollama models", error=str(e))
            return []
    
    async def pull_model(self, model: str) -> bool:
        """
        Pull a model from Ollama registry.
        
        Args:
            model: Model name to pull
        
        Returns:
            True if successful
        """
        try:
            logger.info("Pulling Ollama model", model=model)
            await self.client.pull(model)
            logger.info("Model pulled successfully", model=model)
            return True
        except Exception as e:
            logger.error(
                "Failed to pull model",
                model=model,
                error=str(e),
            )
            return False
