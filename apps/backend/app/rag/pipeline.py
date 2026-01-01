"""
AI Stack - RAG Pipeline
=======================
Orchestrates retrieval-augmented generation.

Components:
1. Document chunking and preprocessing
2. Embedding generation
3. Vector storage
4. Semantic search
5. Context assembly
6. LLM generation with streaming
"""

from typing import AsyncIterator
import time
from datetime import datetime, UTC

import structlog
from pydantic import BaseModel, Field

# Import our packages
from ai_core import get_llm_client, LLMClient, LLMMessage, LLMRole
from vector_db import get_vector_store, VectorStore, SearchResult, VectorMetadata

logger = structlog.get_logger(__name__)


class RAGConfig(BaseModel):
    """RAG pipeline configuration."""
    max_context_tokens: int = Field(default=4000, description="Max tokens for context")
    top_k: int = Field(default=10, description="Number of chunks to retrieve")
    min_similarity: float = Field(default=0.7, description="Minimum similarity score")
    chunk_size: int = Field(default=1000, description="Chunk size for documents")
    chunk_overlap: int = Field(default=200, description="Overlap between chunks")


class RAGResponse(BaseModel):
    """RAG query response."""
    answer: str
    sources: list[str] = Field(default_factory=list)
    source_texts: list[str] = Field(default_factory=list)
    tokens_used: int = 0
    cost: float = 0.0
    latency_ms: float = 0.0
    context_chunks: int = 0


class RAGPipeline:
    """
    Production-ready RAG pipeline.
    
    Following best practices from GEMINI.md:
    - Modular design (chunking, retrieval, generation separated)
    - Observable (structured logging, metrics)
    - Configurable (all parameters tunable)
    - Cost-aware (tracks tokens and cost)
    """
    
    def __init__(
        self,
        llm_client: LLMClient | None = None,
        vector_store: VectorStore | None = None,
        config: RAGConfig | None = None,
    ):
        """
        Initialize RAG pipeline.
        
        Args:
            llm_client: LLM client (auto-created if None)
            vector_store: Vector store (auto-created if None)
            config: RAG configuration
        """
        self.llm = llm_client or get_llm_client()
        self.vector_store = vector_store or get_vector_store()
        self.config = config or RAGConfig()
        
        logger.info(
            "RAG pipeline initialized",
            llm_provider=self.llm.provider.value,
            vector_provider=self.vector_store.provider.value,
            max_context_tokens=self.config.max_context_tokens,
        )
    
    async def query(
        self,
        question: str,
        user_id: str,
        conversation_history: list[LLMMessage] | None = None,
        filters: dict | None = None,
    ) -> RAGResponse:
        """
        Execute full RAG pipeline for a query.
        
        Steps:
        1. Embed the question
        2. Search vector store
        3. Filter by similarity threshold
        4. Build context from results
        5. Generate answer with LLM
        6. Track metrics
        
        Args:
            question: User's question
            user_id: User ID for logging
            conversation_history: Previous messages in conversation
            filters: Metadata filters for search
        
        Returns:
            RAGResponse with answer and metadata
        """
        start_time = time.perf_counter()
        
        logger.info(
            "RAG query started",
            user_id=user_id,
            question_length=len(question),
        )
        
        try:
            # Step 1: Generate embedding for question
            logger.debug("Generating query embedding")
            query_embedding = await self.llm.embed(question)
            
            # Step 2: Search vector store
            logger.debug(
                "Searching vector store",
                top_k=self.config.top_k,
                has_filters=filters is not None,
            )
            search_results = await self.vector_store.search(
                query_vector=query_embedding[0],  # First embedding
                top_k=self.config.top_k,
                filters=filters,
            )
            
            # Step 3: Filter by similarity threshold
            filtered_results = [
                r for r in search_results
                if r.score >= self.config.min_similarity
            ]
            
            logger.debug(
                "Search completed",
                results_found=len(search_results),
                after_filtering=len(filtered_results),
            )
            
            # Step 4: Build context from results
            context = self._build_context(filtered_results)
            
            # Step 5: Generate answer
            logger.debug("Generating answer with LLM")
            prompt = self._build_prompt(question, context, conversation_history)
            
            llm_response = await self.llm.complete(
                prompt=prompt,
                temperature=0.7,
                max_tokens=2000,
            )
            
            # Step 6: Calculate metrics
            latency_ms = (time.perf_counter() - start_time) * 1000
            
            response = RAGResponse(
                answer=llm_response.content,
                sources=[r.id for r in filtered_results],
                source_texts=[r.text[:200] + "..." for r in filtered_results[:3]],
                tokens_used=llm_response.usage.total_tokens,
                cost=llm_response.usage.total_cost,
                latency_ms=latency_ms,
                context_chunks=len(filtered_results),
            )
            
            logger.info(
                "RAG query completed",
                user_id=user_id,
                sources_used=len(filtered_results),
                tokens=response.tokens_used,
                cost=response.cost,
                latency_ms=round(latency_ms, 2),
            )
            
            return response
            
        except Exception as e:
            logger.error(
                "RAG query failed",
                user_id=user_id,
                error=str(e),
                error_type=type(e).__name__,
            )
            raise
    
    async def query_stream(
        self,
        question: str,
        user_id: str,
        conversation_history: list[LLMMessage] | None = None,
        filters: dict | None = None,
    ) -> AsyncIterator[dict]:
        """
        Execute RAG pipeline with streaming response.
        
        Yields events:
        - {"type": "sources", "sources": [...]}
        - {"type": "token", "content": "..."}
        - {"type": "done", "metadata": {...}}
        """
        start_time = time.perf_counter()
        
        logger.info(
            "RAG streaming query started",
            user_id=user_id,
        )
        
        try:
            # Retrieval phase (same as non-streaming)
            query_embedding = await self.llm.embed(question)
            search_results = await self.vector_store.search(
                query_vector=query_embedding[0],
                top_k=self.config.top_k,
                filters=filters,
            )
            
            filtered_results = [
                r for r in search_results
                if r.score >= self.config.min_similarity
            ]
            
            # Emit sources first
            yield {
                "type": "sources",
                "sources": [
                    {
                        "id": r.id,
                        "text": r.text[:200] + "...",
                        "score": r.score,
                    }
                    for r in filtered_results[:3]
                ],
            }
            
            # Build context and prompt
            context = self._build_context(filtered_results)
            prompt = self._build_prompt(question, context, conversation_history)
            
            # Stream LLM response
            total_tokens = 0
            async for chunk in self.llm.stream(prompt=prompt, temperature=0.7):
                if chunk.delta:
                    yield {
                        "type": "token",
                        "content": chunk.delta,
                    }
                
                if chunk.usage:
                    total_tokens = chunk.usage.total_tokens
            
            # Final metadata
            latency_ms = (time.perf_counter() - start_time) * 1000
            
            yield {
                "type": "done",
                "metadata": {
                    "tokens_used": total_tokens,
                    "latency_ms": round(latency_ms, 2),
                    "sources_count": len(filtered_results),
                },
            }
            
            logger.info(
                "RAG streaming query completed",
                user_id=user_id,
                latency_ms=round(latency_ms, 2),
            )
            
        except Exception as e:
            logger.error(
                "RAG streaming query failed",
                user_id=user_id,
                error=str(e),
            )
            yield {
                "type": "error",
                "error": str(e),
            }
    
    def _build_context(self, results: list[SearchResult]) -> str:
        """
        Build context string from search results.
        
        Respects max_context_tokens limit.
        """
        parts = []
        token_count = 0
        
        for i, result in enumerate(results):
            # Format: [Source {i+1}]\n{text}\n
            text = f"[Source {i+1}]\n{result.text}\n"
            
            # Rough token estimate (4 chars ≈ 1 token)
            tokens = len(text) // 4
            
            if token_count + tokens > self.config.max_context_tokens:
                logger.debug(
                    "Context token limit reached",
                    used_sources=i,
                    total_sources=len(results),
                )
                break
            
            parts.append(text)
            token_count += tokens
        
        return "\n---\n\n".join(parts)
    
    def _build_prompt(
        self,
        question: str,
        context: str,
        conversation_history: list[LLMMessage] | None = None,
    ) -> list[LLMMessage]:
        """Build prompt with context and conversation history."""
        messages = []
        
        # System message
        messages.append(LLMMessage(
            role=LLMRole.SYSTEM,
            content=(
                "You are a helpful AI assistant. Use the provided context to answer "
                "the user's question accurately and concisely. If the context doesn't "
                "contain enough information, say so. Always cite sources using [Source N] notation."
            ),
        ))
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history[-6:])  # Last 3 exchanges
        
        # Add current question with context
        messages.append(LLMMessage(
            role=LLMRole.USER,
            content=f"""Context:
{context}

Question: {question}

Answer:""",
        ))
        
        return messages


# Singleton instance (can be overridden)
_rag_pipeline: RAGPipeline | None = None


def get_rag_pipeline() -> RAGPipeline:
    """Get or create RAG pipeline singleton."""
    global _rag_pipeline
    if _rag_pipeline is None:
        _rag_pipeline = RAGPipeline()
    return _rag_pipeline
