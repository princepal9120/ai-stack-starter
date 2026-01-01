"""
AI Stack FastAPI - Chat Endpoints
=================================
Chat and RAG endpoints with streaming support.
"""

from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.auth.dependencies import CurrentUser

logger = structlog.get_logger(__name__)

router = APIRouter()


# =============================================================================
# Request/Response Models
# =============================================================================

class ChatRequest(BaseModel):
    """Chat request model."""
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: str | None = None
    stream: bool = False


class ChatResponse(BaseModel):
    """Chat response model."""
    response: str
    sources: list[str] = []
    conversation_id: str
    tokens_used: int
    latency_ms: float


class ConversationResponse(BaseModel):
    """Conversation list response."""
    id: str
    title: str
    created_at: str
    message_count: int


# =============================================================================
# Endpoints
# =============================================================================

@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user: CurrentUser,
) -> ChatResponse:
    """
    Send a chat message and get a RAG-powered response.
    
    The message is:
    1. Embedded using the configured LLM provider
    2. Used to search the vector database for relevant documents
    3. Combined with context to generate a response
    
    Returns the response along with source citations.
    """
    from app.rag import get_rag_pipeline
    
    logger.info(
        "Chat request received",
        user_id=user.id,
        message_length=len(request.message),
    )
    
    try:
        # Get RAG pipeline
        rag = get_rag_pipeline()
        
        # Execute RAG query
        result = await rag.query(
            question=request.message,
            user_id=user.id,
            filters=None,  # TODO: Add user-specific filters
        )
        
        return ChatResponse(
            response=result.answer,
            sources=result.sources,
            conversation_id=request.conversation_id or "new-conversation",
            tokens_used=result.tokens_used,
            latency_ms=result.latency_ms,
        )
        
    except Exception as e:
        logger.error(
            "Chat request failed",
            user_id=user.id,
            error=str(e),
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate response: {str(e)}",
        )


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    user: CurrentUser,
) -> StreamingResponse:
    """
    Send a chat message and stream the response.
    
    Returns Server-Sent Events (SSE) with:
    - Token chunks as they're generated
    - Source citations at the end
    - Metadata (tokens, latency)
    """
    import json
    from app.rag import get_rag_pipeline
    
    async def generate():
        """Generate SSE events."""
        try:
            rag = get_rag_pipeline()
            
            # Stream RAG response
            async for event in rag.query_stream(
                question=request.message,
                user_id=user.id,
                filters=None,
            ):
                # Convert event to SSE format
                yield f"data: {json.dumps(event)}\n\n"
                
        except Exception as e:
            logger.error(
                "Chat stream failed",
                user_id=user.id,
                error=str(e),
            )
            error_event = {"type": "error", "error": str(e)}
            yield f"data: {json.dumps(error_event)}\n\n"
    
    logger.info(
        "Chat stream request",
        user_id=user.id,
        message_length=len(request.message),
    )
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    user: CurrentUser,
    limit: int = 20,
    offset: int = 0,
) -> list[ConversationResponse]:
    """
    List user's conversations.
    """
    # TODO: Implement conversation listing
    logger.info("List conversations", user_id=user.id)
    return []


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    user: CurrentUser,
) -> dict:
    """
    Get a specific conversation with messages.
    """
    # TODO: Implement conversation retrieval
    logger.info("Get conversation", user_id=user.id, conversation_id=conversation_id)
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Conversation not found",
    )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user: CurrentUser,
) -> dict[str, str]:
    """
    Delete a conversation.
    """
    # TODO: Implement conversation deletion
    logger.info("Delete conversation", user_id=user.id, conversation_id=conversation_id)
    return {"status": "deleted"}
