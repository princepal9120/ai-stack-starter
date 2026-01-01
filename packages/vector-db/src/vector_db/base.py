"""
Vector DB - Base Interface
==========================
Abstract base class for vector database implementations.

Following SOLID principles from GEMINI.md:
- Single Responsibility: Each store handles one vector DB
- Open/Closed: Extensible for new vector DBs without modifying existing code
- Liskov Substitution: All stores interchangeable via base interface
- Interface Segregation: Minimal, focused interface
- Dependency Inversion: Depend on abstractions, not concrete implementations
"""

from abc import ABC, abstractmethod
from datetime import datetime, UTC
from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field
import numpy as np


class VectorDBProvider(str, Enum):
    """Supported vector database providers."""
    QDRANT = "qdrant"
    WEAVIATE = "weaviate"
    PGVECTOR = "pgvector"
    MILVUS = "milvus"


class DistanceMetric(str, Enum):
    """Distance metrics for similarity search."""
    COSINE = "cosine"
    EUCLIDEAN = "euclidean"
    DOT_PRODUCT = "dot"
    MANHATTAN = "manhattan"


class VectorMetadata(BaseModel):
    """
    Metadata attached to vectors.
    
    Design principle: Flexible but type-safe
    - Common fields with validation
    - Custom fields in extras dict
    """
    # Document info
    text: str = Field(..., description="Original text content")
    source: str | None = Field(default=None, description="Source file or URL")
    
    # Chunking info
    chunk_id: int | None = None
    total_chunks: int | None = None
    
    # Categorization
    category: str | None = None
    tags: list[str] = Field(default_factory=list)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    
    # Custom metadata
    extras: dict[str, Any] = Field(default_factory=dict)
    
    def to_dict(self) -> dict[str, Any]:
        """Convert to flat dictionary for vector DB storage."""
        data = self.model_dump()
        # Merge extras into top level
        extras = data.pop("extras", {})
        data.update(extras)
        # Convert datetime to ISO string
        data["created_at"] = data["created_at"].isoformat()
        data["updated_at"] = data["updated_at"].isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "VectorMetadata":
        """Create from flat dictionary."""
        # Extract known fields
        known_fields = set(cls.model_fields.keys())
        known_data = {k: v for k, v in data.items() if k in known_fields}
        extras_data = {k: v for k, v in data.items() if k not in known_fields}
        
        # Parse timestamps
        if "created_at" in known_data and isinstance(known_data["created_at"], str):
            known_data["created_at"] = datetime.fromisoformat(known_data["created_at"])
        if "updated_at" in known_data and isinstance(known_data["updated_at"], str):
            known_data["updated_at"] = datetime.fromisoformat(known_data["updated_at"])
        
        known_data["extras"] = extras_data
        return cls(**known_data)


class SearchResult(BaseModel):
    """
    Single result from vector search.
    
    Design principle: Rich metadata for observability
    - Score for ranking
    - Metadata for context
    - Raw data for debugging
    """
    id: str = Field(..., description="Unique vector ID")
    score: float = Field(..., description="Similarity score (higher = more similar)")
    text: str = Field(..., description="Retrieved text content")
    metadata: VectorMetadata = Field(..., description="Associated metadata")
    
    # Optional fields
    vector: list[float] | None = Field(default=None, description="Embedding vector (if requested)")
    distance: float | None = Field(default=None, description="Distance metric value")
    
    class Config:
        arbitrary_types_allowed = True


class VectorStore(ABC):
    """
    Abstract base class for vector database implementations.
    
    All vector stores must implement this interface.
    Ensures consistent API regardless of underlying database.
    
    Design principles:
    - Async-first for non-blocking I/O
    - Type-safe with Pydantic models
    - Observable with rich metadata
    - Scalable with batch operations
    """
    
    def __init__(
        self,
        collection_name: str,
        dimension: int,
        distance_metric: DistanceMetric = DistanceMetric.COSINE,
        **kwargs,
    ):
        """
        Initialize vector store.
        
        Args:
            collection_name: Name of the collection/index
            dimension: Embedding dimension (e.g., 1536 for OpenAI)
            distance_metric: Similarity metric to use
            **kwargs: Provider-specific configuration
        """
        self.collection_name = collection_name
        self.dimension = dimension
        self.distance_metric = distance_metric
        self.config = kwargs
    
    @property
    @abstractmethod
    def provider(self) -> VectorDBProvider:
        """Return the provider identifier."""
        ...
    
    @abstractmethod
    async def create_collection(self) -> bool:
        """
        Create the collection/index if it doesn't exist.
        
        Returns:
            True if created, False if already exists
        """
        ...
    
    @abstractmethod
    async def delete_collection(self) -> bool:
        """
        Delete the collection/index.
        
        Returns:
            True if deleted successfully
        """
        ...
    
    @abstractmethod
    async def collection_exists(self) -> bool:
        """
        Check if collection exists.
        
        Returns:
            True if collection exists
        """
        ...
    
    @abstractmethod
    async def upsert(
        self,
        vectors: list[list[float]] | np.ndarray,
        metadata: list[VectorMetadata],
        ids: list[str],
    ) -> int:
        """
        Insert or update vectors.
        
        Args:
            vectors: List of embedding vectors
            metadata: List of metadata objects (one per vector)
            ids: List of unique IDs (one per vector)
        
        Returns:
            Number of vectors upserted
        
        Raises:
            VectorDBError: If upsert fails
        
        Example:
            count = await store.upsert(
                vectors=[[0.1, 0.2, ...], [0.3, 0.4, ...]],
                metadata=[meta1, meta2],
                ids=["doc1", "doc2"]
            )
        """
        ...
    
    @abstractmethod
    async def search(
        self,
        query_vector: list[float] | np.ndarray,
        top_k: int = 10,
        filters: dict[str, Any] | None = None,
        include_vector: bool = False,
    ) -> list[SearchResult]:
        """
        Search for similar vectors.
        
        Args:
            query_vector: Query embedding vector
            top_k: Number of results to return
            filters: Metadata filters (provider-specific format)
            include_vector: Whether to include vectors in results
        
        Returns:
            List of search results, sorted by score (descending)
        
        Example:
            results = await store.search(
                query_vector=[0.1, 0.2, ...],
                top_k=5,
                filters={"category": "documentation"}
            )
        """
        ...
    
    @abstractmethod
    async def delete(
        self,
        ids: list[str] | None = None,
        filters: dict[str, Any] | None = None,
    ) -> int:
        """
        Delete vectors by ID or filter.
        
        Args:
            ids: List of IDs to delete (if None, uses filters)
            filters: Metadata filters for deletion
        
        Returns:
            Number of vectors deleted
        
        Example:
            # Delete by IDs
            count = await store.delete(ids=["doc1", "doc2"])
            
            # Delete by filter
            count = await store.delete(filters={"source": "old_docs"})
        """
        ...
    
    @abstractmethod
    async def get(
        self,
        ids: list[str],
        include_vector: bool = False,
    ) -> list[SearchResult]:
        """
        Retrieve vectors by ID.
        
        Args:
            ids: List of IDs to retrieve
            include_vector: Whether to include vectors
        
        Returns:
            List of results (may be fewer than requested if IDs not found)
        """
        ...
    
    async def count(self, filters: dict[str, Any] | None = None) -> int:
        """
        Count vectors in collection.
        
        Args:
            filters: Optional filters to count subset
        
        Returns:
            Number of vectors
        """
        raise NotImplementedError(f"{self.provider} does not implement count()")
    
    async def health_check(self) -> bool:
        """
        Check if the vector database is available.
        
        Returns:
            True if service is healthy
        """
        try:
            return await self.collection_exists()
        except Exception:
            return False
