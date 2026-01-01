"""
AI Stack - Document Processing
==============================
Document chunking and preprocessing for RAG.
"""

import hashlib
from typing import List
from datetime import datetime, UTC

import structlog
from pydantic import BaseModel

from vector_db import VectorMetadata

logger = structlog.get_logger(__name__)


class DocumentChunk(BaseModel):
    """Processed document chunk."""
    text: str
    chunk_id: int
    total_chunks: int
    source: str
    metadata: dict = {}


class DocumentProcessor:
    """
    Process documents for RAG ingestion.
    
    Features:
    - Semantic chunking (respects sentence boundaries)
    - Overlap for context preservation
    - Metadata extraction
    """
    
    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        logger.info(
            "Document processor initialized",
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
    
    def process_text(
        self,
        text: str,
        source: str,
        metadata: dict | None = None,
    ) -> List[DocumentChunk]:
        """
        Process text into chunks.
        
        Args:
            text: Document text
            source: Source identifier (filename, URL, etc.)
            metadata: Additional metadata
        
        Returns:
            List of document chunks
        """
        logger.debug(
            "Processing document",
            source=source,
            text_length=len(text),
        )
        
        # Split into chunks
        chunks = self._chunk_text(text)
        
        # Create DocumentChunk objects
        processed_chunks = []
        for i, chunk_text in enumerate(chunks):
            processed_chunks.append(DocumentChunk(
                text=chunk_text,
                chunk_id=i,
                total_chunks=len(chunks),
                source=source,
                metadata=metadata or {},
            ))
        
        logger.info(
            "Document processed",
            source=source,
            chunks_created=len(processed_chunks),
        )
        
        return processed_chunks
    
    def chunks_to_metadata(
        self,
        chunks: List[DocumentChunk],
        category: str | None = None,
        tags: list[str] | None = None,
    ) -> List[VectorMetadata]:
        """
        Convert document chunks to VectorMetadata.
        
        Args:
            chunks: Document chunks
            category: Document category
            tags: Document tags
        
        Returns:
            List of VectorMetadata objects
        """
        metadata_list = []
        
        for chunk in chunks:
            metadata_list.append(VectorMetadata(
                text=chunk.text,
                source=chunk.source,
                chunk_id=chunk.chunk_id,
                total_chunks=chunk.total_chunks,
                category=category,
                tags=tags or [],
                extras=chunk.metadata,
            ))
        
        return metadata_list
    
    def generate_chunk_ids(
        self,
        chunks: List[DocumentChunk],
        document_id: str,
    ) -> List[str]:
        """
        Generate unique IDs for chunks.
        
        Format: {document_id}_chunk_{chunk_id}
        """
        return [
            f"{document_id}_chunk_{chunk.chunk_id}"
            for chunk in chunks
        ]
    
    def _chunk_text(self, text: str) -> List[str]:
        """
        Split text into chunks with overlap.
        
        Strategy:
        1. Split on paragraph breaks first
        2. If paragraph > chunk_size, split on sentences
        3. If sentence > chunk_size, split on words
        """
        # Simple implementation: split by character with overlap
        # Production: use semantic chunking (sentence boundaries, etc.)
        
        chunks = []
        start = 0
        
        while start < len(text):
            # Get chunk
            end = start + self.chunk_size
            chunk = text[start:end]
            
            # Try to end at sentence boundary
            if end < len(text):
                # Look for last period, question mark, or exclamation
                last_period = max(
                    chunk.rfind('.'),
                    chunk.rfind('?'),
                    chunk.rfind('!'),
                )
                
                if last_period > self.chunk_size * 0.5:  # Only if past halfway
                    chunk = chunk[:last_period + 1]
                    end = start + last_period + 1
            
            chunks.append(chunk.strip())
            
            # Move start with overlap
            start = end - self.chunk_overlap
            
            # Prevent infinite loop
            if end >= len(text):
                break
        
        return chunks


def create_document_id(source: str, content: str) -> str:
    """
    Create deterministic document ID from source and content.
    
    Uses hash of source + content for idempotency.
    """
    combined = f"{source}:{content[:1000]}"  # First 1000 chars
    hash_obj = hashlib.sha256(combined.encode())
    return f"doc_{hash_obj.hexdigest()[:16]}"
