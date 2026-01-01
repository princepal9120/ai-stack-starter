"""
Vector DB - Factory
===================
Factory pattern for creating vector store clients.
"""

import os
from functools import lru_cache
from typing import Literal

import structlog

from vector_db.base import VectorStore, VectorDBProvider, DistanceMetric
from vector_db.stores.qdrant import QdrantStore
from vector_db.stores.weaviate import WeaviateStore
from vector_db.stores.pgvector import PgVectorStore
from vector_db.exceptions import VectorDBError

logger = structlog.get_logger(__name__)

VectorDBProviderType = Literal["qdrant", "weaviate", "pgvector"]


def get_vector_store(
    provider: VectorDBProviderType | None = None,
    collection_name: str | None = None,
    dimension: int | None = None,
    distance_metric: DistanceMetric = DistanceMetric.COSINE,
    **kwargs,
) -> VectorStore:
    """
    Factory function to get the appropriate vector store.
    
    Args:
        provider: Vector DB provider (qdrant, weaviate, pgvector)
                 If None, reads from VECTOR_DB_PROVIDER env var
        collection_name: Collection/index name
                        If None, reads from QDRANT_COLLECTION_NAME or similar
        dimension: Embedding dimension (e.g., 1536 for OpenAI)
                  If None, tries to infer from configuration
        distance_metric: Similarity metric
        **kwargs: Provider-specific configuration
    
    Returns:
        Configured vector store client
    
    Usage:
        # Auto-configured from environment
        store = get_vector_store()
        
        # Explicit provider
        store = get_vector_store(
            provider="qdrant",
            collection_name="documents",
            dimension=1536
        )
    
    Environment Variables:
        VECTOR_DB_PROVIDER: Default provider (qdrant, weaviate, pgvector)
        
        # Qdrant
        QDRANT_URL: Qdrant server URL
        QDRANT_API_KEY: Qdrant API key (optional)
        QDRANT_COLLECTION_NAME: Collection name
        
        # Weaviate
        WEAVIATE_URL: Weaviate server URL
        WEAVIATE_API_KEY: Weaviate API key (optional)
        
        # pgvector
        DATABASE_URL: PostgreSQL connection string
        PGVECTOR_COLLECTION_NAME: Table name
    """
    # Get provider from argument or environment
    provider = provider or os.getenv("VECTOR_DB_PROVIDER", "qdrant")
    
    # Get collection name from argument or environment
    if collection_name is None:
        if provider == "qdrant":
            collection_name = os.getenv("QDRANT_COLLECTION_NAME", "documents")
        elif provider == "weaviate":
            collection_name = os.getenv("WEAVIATE_COLLECTION_NAME", "Documents")
        elif provider == "pgvector":
            collection_name = os.getenv("PGVECTOR_COLLECTION_NAME", "embeddings")
    
    # Get dimension (default to OpenAI's text-embedding-3-large dimension)
    if dimension is None:
        dimension = int(os.getenv("EMBEDDING_DIMENSION", "1536"))
    
    logger.info(
        "Creating vector store",
        provider=provider,
        collection=collection_name,
        dimension=dimension,
    )
    
    if provider == "qdrant":
        url = kwargs.pop("url", os.getenv("QDRANT_URL", "http://localhost:6333"))
        api_key = kwargs.pop("api_key", os.getenv("QDRANT_API_KEY"))
        
        return QdrantStore(
            collection_name=collection_name,
            dimension=dimension,
            distance_metric=distance_metric,
            url=url,
            api_key=api_key,
            **kwargs,
        )
    
    elif provider == "weaviate":
        url = kwargs.pop("url", os.getenv("WEAVIATE_URL", "http://localhost:8080"))
        api_key = kwargs.pop("api_key", os.getenv("WEAVIATE_API_KEY"))
        
        return WeaviateStore(
            collection_name=collection_name,
            dimension=dimension,
            distance_metric=distance_metric,
            url=url,
            api_key=api_key,
            **kwargs,
        )
    
    elif provider == "pgvector":
        connection_string = kwargs.pop(
            "connection_string",
            os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_stack")
        )
        
        return PgVectorStore(
            collection_name=collection_name,
            dimension=dimension,
            distance_metric=distance_metric,
            connection_string=connection_string,
            **kwargs,
        )
    
    else:
        raise VectorDBError(f"Unknown provider: {provider}", provider=provider)


def list_available_providers() -> list[str]:
    """
    List available vector DB providers based on environment configuration.
    
    Returns:
        List of provider names with valid configuration
    """
    available = []
    
    if os.getenv("QDRANT_URL"):
        available.append("qdrant")
    if os.getenv("WEAVIATE_URL"):
        available.append("weaviate")
    if os.getenv("DATABASE_URL"):
        available.append("pgvector")
    
    # If none configured, assume localhost defaults
    if not available:
        available = ["qdrant", "weaviate", "pgvector"]
    
    return available


def get_provider_info() -> dict[str, dict]:
    """
    Get information about configured providers.
    
    Returns:
        Dictionary with provider configuration details
    """
    return {
        "configured_provider": os.getenv("VECTOR_DB_PROVIDER", "qdrant"),
        "available_providers": list_available_providers(),
        "collections": {
            "qdrant": os.getenv("QDRANT_COLLECTION_NAME", "documents"),
            "weaviate": os.getenv("WEAVIATE_COLLECTION_NAME", "Documents"),
            "pgvector": os.getenv("PGVECTOR_COLLECTION_NAME", "embeddings"),
        },
        "dimension": int(os.getenv("EMBEDDING_DIMENSION", "1536")),
    }
