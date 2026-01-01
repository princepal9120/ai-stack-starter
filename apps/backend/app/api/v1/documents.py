"""
AI Stack FastAPI - Documents Endpoints
======================================
Document upload and management endpoints.
"""

from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.auth.dependencies import CurrentUser
from app.core.config import settings

logger = structlog.get_logger(__name__)

router = APIRouter()

class DocumentResponse(BaseModel):
    """Document response model."""
    id: str
    filename: str
    content_type: str
    size_bytes: int
    status: str  # pending, processing, indexed, failed
    created_at: str
    chunk_count: int | None = None


class DocumentList(BaseModel):
    """Paginated document list."""
    documents: list[DocumentResponse]
    total: int
    limit: int
    offset: int


# =============================================================================
# Endpoints
# =============================================================================

@router.post("", response_model=DocumentResponse)
async def upload_document(
    user: CurrentUser,
    file: UploadFile = File(...),
) -> DocumentResponse:
    """
    Upload a document for RAG indexing.
    
    The document will be:
    1. Validated (size, type)
    2. Chunked into semantic segments
    3. Embedded using configured LLM
    4. Stored in vector database
    
    Supported formats: PDF, TXT, MD, DOCX, and code files.
    """
    from datetime import datetime, UTC
    from app.rag import DocumentProcessor, create_document_id, get_rag_pipeline
    
    # Validate file extension
    if file.filename:
        ext = file.filename.split(".")[-1].lower()
        if ext not in settings.allowed_extensions_list:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type '{ext}' not supported. Allowed: {settings.ALLOWED_EXTENSIONS}",
            )
    
    # Validate file size
    content = await file.read()
    if len(content) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB}MB",
        )
    
    logger.info(
        "Document upload started",
        user_id=user.id,
        filename=file.filename,
        size=len(content),
    )
    
    try:
        # Decode content (basic text for now)
        try:
            text_content = content.decode('utf-8')
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only UTF-8 text files are currently supported",
            )
        
        # Create document ID
        doc_id = create_document_id(file.filename or "unknown", text_content)
        
        # Process document into chunks
        processor = DocumentProcessor(
            chunk_size=settings.RAG_CHUNK_SIZE,
            chunk_overlap=settings.RAG_CHUNK_OVERLAP,
        )
        
        chunks = processor.process_text(
            text=text_content,
            source=file.filename or "unknown",
            metadata={"user_id": user.id, "content_type": file.content_type},
        )
        
        # Convert to vector metadata
        metadata_list = processor.chunks_to_metadata(
            chunks=chunks,
            category="user_upload",
            tags=[ext],
        )
        
        # Generate chunk IDs
        chunk_ids = processor.generate_chunk_ids(chunks, doc_id)
        
        # Get RAG pipeline
        rag = get_rag_pipeline()
        
        # Generate embeddings for all chunks
        all_texts = [meta.text for meta in metadata_list]
        embeddings = await rag.llm.embed(all_texts)
        
        # Store in vector database
        await rag.vector_store.upsert(
            vectors=embeddings,
            metadata=metadata_list,
            ids=chunk_ids,
        )
        
        logger.info(
            "Document indexed successfully",
            user_id=user.id,
            document_id=doc_id,
            chunks=len(chunks),
        )
        
        return DocumentResponse(
            id=doc_id,
            filename=file.filename or "unknown",
            content_type=file.content_type or "text/plain",
            size_bytes=len(content),
            status="indexed",
            created_at=datetime.now(UTC).isoformat(),
            chunk_count=len(chunks),
        )
        
    except Exception as e:
        logger.error(
            "Document indexing failed",
            user_id=user.id,
            error=str(e),
            error_type=type(e).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to index document: {str(e)}",
        )


@router.get("", response_model=DocumentList)
async def list_documents(
    user: CurrentUser,
    limit: int = 20,
    offset: int = 0,
) -> DocumentList:
    """
    List user's documents.
    """
    logger.info("List documents", user_id=user.id)
    
    # TODO: Implement document listing
    return DocumentList(
        documents=[],
        total=0,
        limit=limit,
        offset=offset,
    )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    user: CurrentUser,
) -> DocumentResponse:
    """
    Get document details.
    """
    logger.info("Get document", user_id=user.id, document_id=document_id)
    
    # TODO: Implement document retrieval
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Document not found",
    )


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    user: CurrentUser,
) -> dict[str, str]:
    """
    Delete a document and its embeddings.
    """
    logger.info("Delete document", user_id=user.id, document_id=document_id)
    
    # TODO: Implement document deletion
    return {"status": "deleted", "document_id": document_id}


@router.post("/{document_id}/reindex")
async def reindex_document(
    document_id: str,
    user: CurrentUser,
) -> dict[str, str]:
    """
    Reindex a document (regenerate embeddings).
    """
    logger.info("Reindex document", user_id=user.id, document_id=document_id)
    
    # TODO: Queue document for reindexing
    return {"status": "queued", "document_id": document_id}
