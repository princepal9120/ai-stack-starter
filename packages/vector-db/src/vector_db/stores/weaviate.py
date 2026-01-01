"""
Vector DB - Weaviate Client
===========================
Weaviate vector database implementation.

Features:
- GraphQL-based queries
- Hybrid search (vector + keyword)
- Multi-tenancy support
- Schema management
"""

import structlog
from typing import Any
import numpy as np

import weaviate
from weaviate.classes.query import MetadataQuery

from vector_db.base import (
    VectorStore,
    VectorDBProvider,
    SearchResult,
    VectorMetadata,
    DistanceMetric,
)

logger = structlog.get_logger(__name__)


class WeaviateStore(VectorStore):
    """
    Weaviate vector database client.
    
    Features:
    - Hybrid search capabilities
    - GraphQL API
    - Automatic schema creation
    """
    
    def __init__(
        self,
        collection_name: str,
        dimension: int,
        distance_metric: DistanceMetric = DistanceMetric.COSINE,
        url: str = "http://localhost:8080",
        api_key: str | None = None,
        **kwargs,
    ):
        super().__init__(collection_name, dimension, distance_metric, **kwargs)
        
        # Initialize Weaviate client
        if api_key:
           self.client = weaviate.connect_to_custom(
                http_host=url.replace("http://", "").replace("https://", ""),
                http_port=8080,
                http_secure=False,
                auth_credentials=weaviate.auth.AuthApiKey(api_key),
            )
        else:
            self.client = weaviate.connect_to_local(host=url.replace("http://", ""))
        
        logger.info(
            "Weaviate client initialized",
            collection=collection_name,
            url=url,
        )
    
    @property
    def provider(self) -> VectorDBProvider:
        return VectorDBProvider.WEAVIATE
    
    async def create_collection(self) -> bool:
        """Create Weaviate collection (class)."""
        try:
            exists = await self.collection_exists()
            if exists:
                logger.info("Collection already exists", collection=self.collection_name)
                return False
            
            # Create collection with properties
            self.client.collections.create(
                name=self.collection_name,
                vectorizer_config=None,  # We provide vectors
                vector_index_config=weaviate.classes.config.Configure.VectorIndex.hnsw(
                    distance_metric=weaviate.classes.config.VectorDistances.COSINE
                ),
                properties=[
                    weaviate.classes.config.Property(
                        name="text",
                        data_type=weaviate.classes.config.DataType.TEXT,
                    ),
                    weaviate.classes.config.Property(
                        name="source",
                        data_type=weaviate.classes.config.DataType.TEXT,
                    ),
                    weaviate.classes.config.Property(
                        name="category",
                        data_type=weaviate.classes.config.DataType.TEXT,
                    ),
                ],
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
        """Delete Weaviate collection."""
        try:
            self.client.collections.delete(self.collection_name)
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
            return self.client.collections.exists(self.collection_name)
        except Exception:
            return False
    
    async def upsert(
        self,
        vectors: list[list[float]] | np.ndarray,
        metadata: list[VectorMetadata],
        ids: list[str],
    ) -> int:
        """Insert or update vectors in Weaviate."""
        if len(vectors) != len(metadata) != len(ids):
            raise ValueError("vectors, metadata, and ids must have the same length")
        
        if isinstance(vectors, np.ndarray):
            vectors = vectors.tolist()
        
        logger.debug(
            "Upserting vectors",
            collection=self.collection_name,
            count=len(vectors),
        )
        
        try:
            collection = self.client.collections.get(self.collection_name)
            
            with collection.batch.dynamic() as batch:
                for idx, vector, meta in zip(ids, vectors, metadata):
                    batch.add_object(
                        properties=meta.to_dict(),
                        vector=vector,
                        uuid=idx,
                    )
            
            logger.info(
                "Vectors upserted",
                collection=self.collection_name,
                count=len(vectors),
            )
            
            return len(vectors)
            
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
        """Search for similar vectors in Weaviate."""
        if isinstance(query_vector, np.ndarray):
            query_vector = query_vector.tolist()
        
        logger.debug(
            "Searching vectors",
            collection=self.collection_name,
            top_k=top_k,
        )
        
        try:
            collection = self.client.collections.get(self.collection_name)
            
            # Execute vector search
            response = collection.query.near_vector(
                near_vector=query_vector,
                limit=top_k,
                return_metadata=MetadataQuery(distance=True),
                include_vector=include_vector,
            )
            
            # Convert to SearchResult
            search_results = []
            for obj in response.objects:
                metadata = VectorMetadata.from_dict(obj.properties)
                
                search_results.append(SearchResult(
                    id=str(obj.uuid),
                    score=1.0 - obj.metadata.distance,  # Convert distance to score
                    text=metadata.text,
                    metadata=metadata,
                    vector=obj.vector.get("default") if include_vector and obj.vector else None,
                    distance=obj.metadata.distance,
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
        """Delete vectors from Weaviate."""
        try:
            collection = self.client.collections.get(self.collection_name)
            
            if ids:
                # Delete by IDs
                for id in ids:
                    collection.data.delete_by_id(id)
                count = len(ids)
            elif filters:
                # Delete by filter
                result = collection.data.delete_many(
                    where=self._build_filter(filters)
                )
                count = result.successful if hasattr(result, 'successful') else 0
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
        """Retrieve vectors by ID from Weaviate."""
        try:
            collection = self.client.collections.get(self.collection_name)
            
            search_results = []
            for id in ids:
                obj = collection.query.fetch_object_by_id(
                    id,
                    include_vector=include_vector,
                )
                
                if obj:
                    metadata = VectorMetadata.from_dict(obj.properties)
                    search_results.append(SearchResult(
                        id=str(obj.uuid),
                        score=1.0,
                        text=metadata.text,
                        metadata=metadata,
                        vector=obj.vector.get("default") if include_vector and obj.vector else None,
                    ))
            
            logger.info(
                "Retrieved vectors",
                collection=self.collection_name,
                found=len(search_results),
            )
            
            return search_results
            
        except Exception as e:
            logger.error(
                "Get failed",
                collection=self.collection_name,
                error=str(e),
            )
            raise
    
    def _build_filter(self, filters: dict[str, Any]):
        """Build Weaviate filter from dict."""
        # Simple equality filter
        # In production, extend this for more complex queries
        return weaviate.classes.query.Filter.by_property(
            list(filters.keys())[0]
        ).equal(list(filters.values())[0])
