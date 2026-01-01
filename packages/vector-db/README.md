# Vector DB Package

Production-grade vector database abstractions with **zero vendor lock-in**.

## Features

- ✅ **Vendor-Agnostic**: Unified interface for Qdrant, Weaviate, pgvector
- ✅ **Async Operations**: Non-blocking I/O for all providers
- ✅ **Metadata Filtering**: Rich metadata support with type safety
- ✅ **Batch Operations**: Efficient bulk upserts and queries
- ✅ **Production-Ready**: Structured logging, error handling, connection pooling

## Install

```bash
# In the monorepo
cd packages/vector-db
uv sync
```

## Quick Start

```python
from vector_db import get_vector_store, VectorMetadata

# Auto-configured from environment (VECTOR_DB_PROVIDER, QDRANT_URL, etc.)
store = get_vector_store()

# Create collection
await store.create_collection()

# Upsert vectors with metadata
metadata = [
    VectorMetadata(
        text="FastAPI is a modern Python web framework",
        source="docs.md",
        category="documentation"
    )
]
await store.upsert(
    vectors=[[0.1, 0.2, ...]],
    metadata=metadata,
    ids=["doc1"]
)

# Semantic search
results = await store.search(
    query_vector=[0.15, 0.25, ...],
    top_k=5,
    filters={"category": "documentation"}
)

for result in results:
    print(f"Score: {result.score:.3f} - {result.text[:50]}...")
```

## Configuration

Set environment variables to configure:

```bash
# Provider selection
VECTOR_DB_PROVIDER=qdrant  # or: weaviate, pgvector

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=  # optional
QDRANT_COLLECTION_NAME=documents

# Weaviate
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=  # optional

# pgvector
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db
PGVECTOR_COLLECTION_NAME=embeddings

# Embedding dimension (e.g., 1536 for OpenAI)
EMBEDDING_DIMENSION=1536
```

## Supported Providers

| Provider | Use Case | Scale | Cost |
|----------|----------|-------|------|
| **Qdrant** | Production, high-performance | Millions+ | $$$ |
| **Weaviate** | Hybrid search, GraphQL | Millions+ | $$$ |
| **pgvector** | SQL ecosystem, ACID | 100k-1M | $ |

## Architecture

```python
from abc import ABC, abstractmethod

class VectorStore(ABC):
    async def upsert(vectors, metadata, ids) -> int: ...
    async def search(query_vector, top_k, filters) -> list[SearchResult]: ...
    async def delete(ids) -> int: ...
```

All providers implement this interface → **swap providers with 1 env var**.
