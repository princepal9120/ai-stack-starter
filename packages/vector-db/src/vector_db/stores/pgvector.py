"""
Vector DB - pgvector Client
===========================
PostgreSQL pgvector extension implementation.

Features:
- SQL-based vector search
- ACID compliance
- Familiar PostgreSQL ecosystem
- Cost-effective for small-medium datasets
"""

import structlog
from typing import Any
import numpy as np

from sqlalchemy import create_engine, Column, String, Text, Integer, ARRAY, Float, DateTime, JSON
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import select, delete as sql_delete, func
from pgvector.sqlalchemy import Vector

from vector_db.base import (
    VectorStore,
    VectorDBProvider,
    SearchResult,
    VectorMetadata,
    DistanceMetric,
)

logger = structlog.get_logger(__name__)

Base = declarative_base()


class PgVectorStore(VectorStore):
    """
    PostgreSQL pgvector client.
    
    Features:
    - SQL-based operations
    - ACID transactions
    - Cost-effective storage
    """
    
    def __init__(
        self,
        collection_name: str,
        dimension: int,
        distance_metric: DistanceMetric = DistanceMetric.COSINE,
        connection_string: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_stack",
        **kwargs,
    ):
        super().__init__(collection_name, dimension, distance_metric, **kwargs)
        
        self.engine = create_async_engine(connection_string)
        self.async_session = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
        
        # Create dynamic model for this collection
        self.model = self._create_model()
        
        logger.info(
            "pgvector client initialized",
            collection=collection_name,
            dimension=dimension,
        )
    
    @property
    def provider(self) -> VectorDBProvider:
        return VectorDBProvider.PGVECTOR
    
    def _create_model(self):
        """Create SQLAlchemy model for this collection."""
        
        class VectorDocument(Base):
            __tablename__ = self.collection_name
            
            id = Column(String, primary_key=True)
            vector = Column(Vector(self.dimension))
            text = Column(Text, nullable=False)
            source = Column(String, nullable=True)
            category = Column(String, nullable=True)
            metadata = Column(JSON, nullable=False, default={})
            created_at = Column(DateTime, nullable=False)
        
        return VectorDocument
    
    async def create_collection(self) -> bool:
        """Create pgvector table."""
        try:
            async with self.engine.begin() as conn:
                # Install pgvector extension
                await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
                
                # Create table
                await conn.run_sync(Base.metadata.create_all)
                
                # Create index for vector similarity
                if self.distance_metric == DistanceMetric.COSINE:
                    operator = "vector_cosine_ops"
                else:
                    operator = "vector_l2_ops"
                
                await conn.execute(
                    f"CREATE INDEX IF NOT EXISTS {self.collection_name}_vector_idx "
                    f"ON {self.collection_name} USING ivfflat (vector {operator})"
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
        """Delete pgvector table."""
        try:
            async with self.engine.begin() as conn:
                await conn.run_sync(Base.metadata.drop_all)
            
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
        """Check if table exists."""
        try:
            async with self.async_session() as session:
                result = await session.execute(
                    "SELECT EXISTS (SELECT FROM information_schema.tables "
                    f"WHERE table_name = '{self.collection_name}')"
                )
                return result.scalar()
        except Exception:
            return False
    
    async def upsert(
        self,
        vectors: list[list[float]] | np.ndarray,
        metadata: list[VectorMetadata],
        ids: list[str],
    ) -> int:
        """Insert or update vectors in pgvector."""
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
            async with self.async_session() as session:
                for idx, vector, meta in zip(ids, vectors, metadata):
                    doc = self.model(
                        id=idx,
                        vector=vector,
                        text=meta.text,
                        source=meta.source,
                        category=meta.category,
                        metadata=meta.to_dict(),
                        created_at=meta.created_at,
                    )
                    await session.merge(doc)
                
                await session.commit()
            
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
        """Search for similar vectors in pgvector."""
        if isinstance(query_vector, np.ndarray):
            query_vector = query_vector.tolist()
        
        logger.debug(
            "Searching vectors",
            collection=self.collection_name,
            top_k=top_k,
        )
        
        try:
            async with self.async_session() as session:
                # Build query with distance calculation
                if self.distance_metric == DistanceMetric.COSINE:
                    distance = self.model.vector.cosine_distance(query_vector)
                else:
                    distance = self.model.vector.l2_distance(query_vector)
                
                query = select(
                    self.model,
                    distance.label("distance")
                ).order_by(distance).limit(top_k)
                
                # Apply filters
                if filters:
                    for key, value in filters.items():
                        if hasattr(self.model, key):
                            query = query.where(getattr(self.model, key) == value)
                
                result = await session.execute(query)
                rows = result.all()
                
                # Convert to SearchResult
                search_results = []
                for row in rows:
                    doc, dist = row
                    metadata = VectorMetadata.from_dict(doc.metadata)
                    
                    search_results.append(SearchResult(
                        id=doc.id,
                        score=1.0 - dist,  # Convert distance to similarity score
                        text=doc.text,
                        metadata=metadata,
                        vector=doc.vector if include_vector else None,
                        distance=dist,
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
        """Delete vectors from pgvector."""
        try:
            async with self.async_session() as session:
                if ids:
                    query = sql_delete(self.model).where(self.model.id.in_(ids))
                elif filters:
                    query = sql_delete(self.model)
                    for key, value in filters.items():
                        if hasattr(self.model, key):
                            query = query.where(getattr(self.model, key) == value)
                else:
                    raise ValueError("Must provide either ids or filters")
                
                result = await session.execute(query)
                await session.commit()
                count = result.rowcount
                
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
        """Retrieve vectors by ID from pgvector."""
        try:
            async with self.async_session() as session:
                query = select(self.model).where(self.model.id.in_(ids))
                result = await session.execute(query)
                docs = result.scalars().all()
                
                search_results = []
                for doc in docs:
                    metadata = VectorMetadata.from_dict(doc.metadata)
                    search_results.append(SearchResult(
                        id=doc.id,
                        score=1.0,
                        text=doc.text,
                        metadata=metadata,
                        vector=doc.vector if include_vector else None,
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
    
    async def count(self, filters: dict[str, Any] | None = None) -> int:
        """Count vectors in pgvector collection."""
        try:
            async with self.async_session() as session:
                query = select(func.count()).select_from(self.model)
                
                if filters:
                    for key, value in filters.items():
                        if hasattr(self.model, key):
                            query = query.where(getattr(self.model, key) == value)
                
                result = await session.execute(query)
                return result.scalar()
        except Exception as e:
            logger.error(
                "Count failed",
                collection=self.collection_name,
                error=str(e),
            )
            return 0
