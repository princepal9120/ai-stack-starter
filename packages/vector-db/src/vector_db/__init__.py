"""
Vector DB Package
================
Vendor-agnostic vector database abstractions for AI applications.

Provides unified interfaces for:
- Vector storage and retrieval (Qdrant, Weaviate, pgvector, Milvus)
- Semantic search
- Hybrid search (vector + keyword)
- Metadata filtering

Usage:
    from vector_db import get_vector_store
    
    store = get_vector_store()  # Auto-configured from env
    await store.upsert(vectors=embeddings, metadata=docs, ids=doc_ids)
    results = await store.search(query_vector=query_emb, top_k=10)
"""

from vector_db.base import VectorStore, SearchResult, VectorMetadata
from vector_db.factory import get_vector_store

__version__ = "0.1.0"

__all__ = [
    "VectorStore",
    "SearchResult",
    "VectorMetadata",
    "get_vector_store",
]
