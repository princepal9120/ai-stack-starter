"""
Vector DB - Qdrant Client
=========================
Qdrant vector database implementation.

Features:
- Production-ready vector search
- Metadata filtering
- Hybrid search (dense + sparse)
- High performance (Rust-based)
"""

import structlog
from typing import Any
import numpy as np

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition, 
    MatchValue,
    SearchParams,
)

from vector_db.base import (
    VectorStore,
    VectorDBProvider,
    SearchResult,
    VectorMetadata,
    DistanceMetric,
)

logger = structlog.get_logger(__name__)


# Map our distance metrics to Qdrant's
DISTANCE_MAP = {
    DistanceMetric.COSINE: Distance.COSINE,
    DistanceMetric.EUCLIDEAN: Distance.EUCLID,
    DistanceMetric.DOT_PRODUCT: Distance.DOT,
    DistanceMetric.MANHATTAN: Distance.MANHATTAN,
}


class QdrantStore(VectorStore):
    """
    Qdrant vector database client.
    
    Production features:
    - Async operations
    - Batch upserts
    - Metadata filtering
    - Scalable to billions of vectors
    """
    
    def __init__(
        self,
        collection_name: str,
        dimension: int,
        distance_metric: DistanceMetric = DistanceMetric.COSINE,
        url: str = "http://localhost:6333",
        api_key: str | None = None,
        **kwargs,
    ):
        super().__init__(collection_name, dimension, distance_metric, **kwargs)
        
        self.client = AsyncQdrantClient(
            url=url,
            api_key=api_key,
            **kwargs,
        )
        
        logger.info(
            "Qdrant client initialized",
            collection=collection_name,
            dimension=dimension,
            url=url,
        )
    
    @property
    def provider(self) -> VectorDBProvider:
        return VectorDBProvider.QDRANT
    
    async def create_collection(self) -> bool:
        """Create Qdrant collection with vector configuration."""
        try:
            exists = await self.collection_exists()
            if exists:
                logger.info("Collection already exists", collection=self.collection_name)
                return False
            
            await self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.dimension,
                    distance=DISTANCE_MAP[self.distance_metric],
                ),
            )
            
            logger.info("Collection created", collection=self.collection_name)
            return True
            
        except Exception as e:
            logger.error(
                "Failed to create collection",
                collection=self.collection_name,
                error=str(e),
            )
            raise
    
    async def delete_collection(self) -> bool:
        """Delete Qdrant collection."""
        try:
            await self.client.delete_collection(collection_name=self.collection_name)
            logger.info("Collection deleted", collection=self.collection_name)
            return True
        except Exception as e:
            logger.error(
                "Failed to delete collection",
                collection=self.collection_name,
                error=str(e),
            )
            return False
    
    async def collection_exists(self) -> bool:
        """Check if collection exists."""
        try:
            collections = await self.client.get_collections()
            return any(
                col.name == self.collection_name
                for col in collections.collections
            )
        except Exception:
            return False
    
    async def upsert(
        self,
        vectors: list[list[float]] | np.ndarray,
        metadata: list[VectorMetadata],
        ids: list[str],
    ) -> int:
        """Insert or update vectors in Qdrant."""
        if len(vectors) != len(metadata) != len(ids):
            raise ValueError("vectors, metadata, and ids must have the same length")
        
        # Convert numpy to list if needed
        if isinstance(vectors, np.ndarray):
            vectors = vectors.tolist()
        
        logger.debug(
            "Upserting vectors",
            collection=self.collection_name,
            count=len(vectors),
        )
        
        try:
            # Build points
            points = [
                PointStruct(
                    id=idx,
                    vector=vector,
                    payload=meta.to_dict(),
                )
                for idx, vector, meta in zip(ids, vectors, metadata)
            ]
            
            # Batch upsert
            await self.client.upsert(
                collection_name=self.collection_name,
                points=points,
            )
            
            logger.info(
                "Vectors upserted",
                collection=self.collection_name,
                count=len(points),
            )
            
            return len(points)
            
        except Exception as e:
            logger.error(
                "Failed to upsert vectors",
                collection=self.collection_name,
                error=str(e),
            )
            raise
    
    async def search(
        self,
        query_vector: list[float] | np.ndarray,
        top_k: int = 10,
        filters: dict[str, Any] | None = None,
        include_vector: bool = False,
    ) -> list[SearchResult]:
        """Search for similar vectors in Qdrant."""
        if isinstance(query_vector, np.ndarray):
            query_vector = query_vector.tolist()
        
        logger.debug(
            "Searching vectors",
            collection=self.collection_name,
            top_k=top_k,
            has_filters=filters is not None,
        )
        
        try:
            # Build filter if provided
            qdrant_filter = None
            if filters:
                qdrant_filter = self._build_filter(filters)
            
            # Execute search
            results = await self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=top_k,
                query_filter=qdrant_filter,
                with_payload=True,
                with_vectors=include_vector,
            )
            
            # Convert to SearchResult
            search_results = []
            for result in results:
                metadata = VectorMetadata.from_dict(result.payload)
                
                search_results.append(SearchResult(
                    id=str(result.id),
                    score=result.score,
                    text=metadata.text,
                    metadata=metadata,
                    vector=result.vector if include_vector else None,
                    distance=1.0 - result.score if self.distance_metric == DistanceMetric.COSINE else None,
                ))
            
            logger.info(
                "Search completed",
                collection=self.collection_name,
                results_found=len(search_results),
            )
            
            return search_results
            
        except Exception as e:
            logger.error(
                "Search failed",
                collection=self.collection_name,
                error=str(e),
            )
            raise
    
    async def delete(
        self,
        ids: list[str] | None = None,
        filters: dict[str, Any] | None = None,
    ) -> int:
        """Delete vectors from Qdrant."""
        logger.debug(
            "Deleting vectors",
            collection=self.collection_name,
            by_ids=ids is not None,
            by_filters=filters is not None,
        )
        
        try:
            if ids:
                # Delete by IDs
                await self.client.delete(
                    collection_name=self.collection_name,
                    points_selector=ids,
                )
                count = len(ids)
            elif filters:
                # Delete by filter
                qdrant_filter = self._build_filter(filters)
                result = await self.client.delete(
                    collection_name=self.collection_name,
                    points_selector=qdrant_filter,
                )
                count = result.operation_id if hasattr(result, 'operation_id') else 0
            else:
                raise ValueError("Must provide either ids or filters")
            
            logger.info(
                "Vectors deleted",
                collection=self.collection_name,
                count=count,
            )
            
            return count
            
        except Exception as e:
            logger.error(
                "Delete failed",
                collection=self.collection_name,
                error=str(e),
            )
            raise
    
    async def get(
        self,
        ids: list[str],
        include_vector: bool = False,
    ) -> list[SearchResult]:
        """Retrieve vectors by ID from Qdrant."""
        logger.debug(
            "Getting vectors by ID",
            collection=self.collection_name,
            count=len(ids),
        )
        
        try:
            results = await self.client.retrieve(
                collection_name=self.collection_name,
                ids=ids,
                with_payload=True,
                with_vectors=include_vector,
            )
            
            search_results = []
            for result in results:
                metadata = VectorMetadata.from_dict(result.payload)
                
                search_results.append(SearchResult(
                    id=str(result.id),
                    score=1.0,  # No score for direct retrieval
                    text=metadata.text,
                    metadata=metadata,
                    vector=result.vector if include_vector else None,
                ))
            
            logger.info(
                "Retrieved vectors",
                collection=self.collection_name,
                found=len(search_results),
                requested=len(ids),
            )
            
            return search_results
            
        except Exception as e:
            logger.error(
                "Get failed",
                collection=self.collection_name,
                error=str(e),
            )
            raise
    
    async def count(self, filters: dict[str, Any] | None = None) -> int:
        """Count vectors in Qdrant collection."""
        try:
            result = await self.client.count(
                collection_name=self.collection_name,
                count_filter=self._build_filter(filters) if filters else None,
            )
            return result.count
        except Exception as e:
            logger.error(
                "Count failed",
                collection=self.collection_name,
                error=str(e),
            )
            return 0
    
    def _build_filter(self, filters: dict[str, Any]) -> Filter:
        """
        Build Qdrant filter from simple dict.
        
        Supports:
        - Exact match: {"category": "docs"}
        - List match: {"tags": ["python", "code"]}
        """
        conditions = []
        
        for key, value in filters.items():
            if isinstance(value, list):
                # Match any value in list
                conditions.append(
                    FieldCondition(
                        key=key,
                        match=MatchValue(any=value),
                    )
                )
            else:
                # Exact match
                conditions.append(
                    FieldCondition(
                        key=key,
                        match=MatchValue(value=value),
                    )
                )
        
        return Filter(must=conditions) if conditions else None
