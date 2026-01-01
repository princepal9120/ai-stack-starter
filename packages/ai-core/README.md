# AI Core Package

Production-grade LLM client abstractions with **zero vendor lock-in**.

## Features

- ✅ **Vendor-Agnostic**: Unified interface for OpenAI, Anthropic, Gemini, Ollama
- ✅ **Streaming Support**: Token-by-token streaming for all providers
- ✅ **Cost Tracking**: Automatic token counting and cost calculation
- ✅ **Type-Safe**: Full Pydantic models for requests/responses
- ✅ **Production-Ready**: Structured logging, error handling, retries

## Install

```bash
# In the monorepo
cd packages/ai-core
uv sync
```

## Quick Start

```python
from ai_core import get_llm_client

# Auto-configured from environment (LLM_PROVIDER, OPENAI_API_KEY, etc.)
llm = get_llm_client()

# Generate completion
response = await llm.complete("Explain quantum computing")
print(response.content)
print(f"Cost: ${response.usage.total_cost:.4f}")

# Stream response
async for chunk in llm.stream("Write a poem about code"):
    print(chunk.delta, end="", flush=True)

# Generate embeddings
embeddings = await llm.embed("Hello world")
print(f"Embedding dimension: {len(embeddings[0])}")
```

## Configuration

Set environment variables to configure:

```bash
# Provider selection
LLM_PROVIDER=openai  # or: anthropic, gemini, ollama

# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Models (optional)
OPENAI_MODEL=gpt-4-turbo-preview
ANTHROPIC_MODEL=claude-3-opus-20240229
GEMINI_MODEL=gemini-1.5-pro
OLLAMA_MODEL=llama3.2
```

## Supported Providers

| Provider | Models | Streaming | Embeddings | Cost |
|----------|--------|-----------|-----------|------|
| **OpenAI** | GPT-4, GPT-3.5 | ✅ | ✅ | $$ |
| **Anthropic** | Claude 3 | ✅ | ❌ | $$ |
| **Gemini** | Gemini 1.5 | ✅ | ✅ | $ |
| **Ollama** | Llama, Mistral | ✅ | ✅ | Free |

## Architecture

```python
from abc import ABC, abstractmethod

class LLMClient(ABC):
    async def complete(prompt, **kwargs) -> LLMResponse: ...
    async def stream(prompt, **kwargs) -> AsyncIterator[LLMStreamChunk]: ...
    async def embed(text) -> list[list[float]]: ...
```

All providers implement this interface → **swap providers with 1 env var**.
