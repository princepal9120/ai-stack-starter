# AI Stack FastAPI Boilerplate - Complete Specification

**Production-grade FastAPI boilerplate for AI applications with RAG, vector databases, and zero vendor lock-in**

---

## 📋 What You're Building

**AI Stack FastAPI** = Production-ready boilerplate specifically for FastAPI + AI

A CLI-based boilerplate generator that scaffolds complete AI applications with:
- ✅ **FastAPI backend** (async Python, production-grade)
- ✅ **Next.js frontend** (modern React UI with streaming)
- ✅ **RAG pipelines** (retrieval-augmented generation ready)
- ✅ **Vendor-agnostic** (swap vector DBs, LLMs via config)
- ✅ **Built-in observability** (Langfuse, Prometheus)
- ✅ **Zero lock-in** (OpenAI → Anthropic in 1 env var change)
- ✅ **Docker ready** (local dev to production)

---

## 🚀 Quick Start

```bash
# Install CLI
npm install -g ai-stack-fastapi

# Create project (FastAPI + Next.js)
ai-stack create my-rag-app

# Interactive setup (or use defaults)
# ✔ Vector DB: Qdrant / Weaviate / Pgvector / Milvus?
# ✔ LLM: OpenAI / Anthropic / Gemini / Ollama?
# ✔ Auth: JWT / OAuth2 / Supabase?
# ✔ Include observability? (Langfuse + Prometheus)

cd my-rag-app
docker-compose up -d    # Start Postgres, Redis, Qdrant
npm run dev            # Start FastAPI + Next.js

# Immediately functional:
# - Backend: http://localhost:8000
# - Frontend: http://localhost:3000
# - API docs: http://localhost:8000/docs
```

---

## 🏗 Monorepo Structure

```
my-ai-app/
├── apps/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── main.py               # FastAPI app entry
│   │   │   ├── api/
│   │   │   │   ├── v1/
│   │   │   │   │   ├── chat.py       # Chat endpoint (/v1/chat)
│   │   │   │   │   ├── documents.py  # Document upload (/v1/documents)
│   │   │   │   │   ├── embeddings.py # Embeddings endpoint
│   │   │   │   │   └── auth.py       # Auth routes (login, register, refresh)
│   │   │   │   └── deps.py           # Shared dependencies
│   │   │   ├── ai/
│   │   │   │   ├── llm/
│   │   │   │   │   ├── base.py       # Abstract LLMClient
│   │   │   │   │   ├── openai.py     # OpenAI client
│   │   │   │   │   ├── anthropic.py  # Anthropic client
│   │   │   │   │   ├── gemini.py     # Google Gemini client
│   │   │   │   │   └── ollama.py     # Ollama (local models)
│   │   │   │   ├── rag/
│   │   │   │   │   ├── pipeline.py   # Main RAG class
│   │   │   │   │   ├── retriever.py  # Vector search
│   │   │   │   │   ├── reranker.py   # Optional reranking
│   │   │   │   │   └── prompt.py     # Prompt templates
│   │   │   │   ├── agents/
│   │   │   │   │   ├── base.py       # Agent base class
│   │   │   │   │   ├── tools.py      # Tool definitions
│   │   │   │   │   └── executor.py   # Tool execution
│   │   │   │   └── chains/
│   │   │   │       ├── base.py
│   │   │   │       └── streaming.py  # Streaming chains
│   │   │   ├── vectorstore/
│   │   │   │   ├── base.py           # Abstract VectorStore
│   │   │   │   ├── qdrant.py         # Qdrant adapter
│   │   │   │   ├── weaviate.py       # Weaviate adapter
│   │   │   │   ├── pgvector.py       # PostgreSQL pgvector
│   │   │   │   └── milvus.py         # Milvus adapter
│   │   │   ├── models/
│   │   │   │   ├── user.py           # User model
│   │   │   │   ├── document.py       # Document model
│   │   │   │   ├── conversation.py   # Chat history
│   │   │   │   ├── embedding.py      # Embedding metadata
│   │   │   │   └── schemas.py        # Pydantic request/response schemas
│   │   │   ├── services/
│   │   │   │   ├── user_service.py   # User business logic
│   │   │   │   ├── document_service.py
│   │   │   │   ├── chat_service.py   # Chat orchestration
│   │   │   │   └── embedding_service.py
│   │   │   ├── repositories/
│   │   │   │   ├── user_repo.py      # Database access
│   │   │   │   ├── document_repo.py
│   │   │   │   ├── conversation_repo.py
│   │   │   │   └── base.py           # Base repository
│   │   │   ├── core/
│   │   │   │   ├── config.py         # Settings (pydantic-settings)
│   │   │   │   ├── security.py       # JWT, password hashing
│   │   │   │   ├── database.py       # SQLAlchemy setup
│   │   │   │   ├── vectordb.py       # Vector store initialization
│   │   │   │   ├── cache.py          # Redis setup
│   │   │   │   ├── observability.py  # Langfuse, OpenTelemetry
│   │   │   │   ├── logging.py        # Structured logging
│   │   │   │   └── exceptions.py     # Custom exceptions
│   │   │   ├── tasks/
│   │   │   │   ├── celery_app.py     # Celery configuration
│   │   │   │   ├── document_tasks.py # Async document processing
│   │   │   │   ├── embedding_tasks.py # Embedding generation
│   │   │   │   └── cleanup_tasks.py  # Scheduled tasks
│   │   │   ├── middleware/
│   │   │   │   ├── auth.py           # Auth middleware
│   │   │   │   ├── logging.py        # Request logging
│   │   │   │   ├── rate_limit.py     # Rate limiting
│   │   │   │   └── error_handler.py  # Global error handling
│   │   │   └── utils/
│   │   │       ├── tokenizer.py      # Token counting
│   │   │       ├── validators.py     # Input validation
│   │   │       ├── text_splitter.py  # Document chunking
│   │   │       └── helpers.py        # Utility functions
│   │   ├── tests/
│   │   │   ├── conftest.py           # Pytest fixtures
│   │   │   ├── test_api/
│   │   │   │   ├── test_chat.py
│   │   │   │   ├── test_documents.py
│   │   │   │   └── test_auth.py
│   │   │   ├── test_ai/
│   │   │   │   ├── test_rag_pipeline.py
│   │   │   │   ├── test_llm_clients.py
│   │   │   │   └── test_vector_search.py
│   │   │   ├── test_services/
│   │   │   │   └── test_chat_service.py
│   │   │   └── fixtures/
│   │   │       ├── sample_docs.py
│   │   │       └── mock_llm.py
│   │   ├── scripts/
│   │   │   ├── init_db.py            # Initialize database
│   │   │   ├── seed_data.py          # Seed sample data
│   │   │   ├── create_user.py        # CLI script to create user
│   │   │   └── index_documents.py    # Index documents into vector DB
│   │   ├── requirements.txt
│   │   ├── requirements-dev.txt
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── pytest.ini
│   │   ├── .env.example
│   │   └── README.md
│   │
│   └── frontend/
│       ├── app/
│       │   ├── layout.tsx            # Root layout
│       │   ├── page.tsx              # Home page
│       │   ├── chat/
│       │   │   ├── page.tsx          # Chat interface
│       │   │   ├── useChat.ts        # Chat hook
│       │   │   └── ChatInterface.tsx # Chat component
│       │   ├── documents/
│       │   │   ├── page.tsx          # Document management
│       │   │   └── UploadForm.tsx    # Upload component
│       │   ├── api/
│       │   │   └── auth/
│       │   │       └── [...nextauth].ts  # NextAuth config (optional)
│       │   └── (auth)/
│       │       ├── login/
│       │       └── signup/
│       ├── components/
│       │   ├── ChatMessage.tsx
│       │   ├── MessageInput.tsx
│       │   ├── DocumentUpload.tsx
│       │   ├── Navbar.tsx
│       │   └── Loading.tsx
│       ├── hooks/
│       │   ├── useChat.ts
│       │   ├── useAuth.ts
│       │   └── useApi.ts
│       ├── lib/
│       │   ├── api.ts                # API client
│       │   ├── auth.ts               # Auth utilities
│       │   ├── types.ts              # TypeScript types
│       │   └── constants.ts          # Constants
│       ├── styles/
│       │   └── globals.css
│       ├── public/
│       ├── .env.example
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── tsconfig.json
│
├── packages/
│   ├── ai-core/
│   │   ├── src/
│   │   │   ├── llm/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── base.py           # Abstract LLMClient
│   │   │   │   ├── openai.py
│   │   │   │   ├── anthropic.py
│   │   │   │   ├── gemini.py
│   │   │   │   ├── ollama.py
│   │   │   │   └── factory.py        # LLM client factory
│   │   │   ├── rag/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── pipeline.py       # Main RAG class
│   │   │   │   ├── retriever.py      # Search logic
│   │   │   │   ├── reranker.py       # Optional reranking
│   │   │   │   └── prompt.py         # Prompt templates
│   │   │   ├── streaming/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── stream_handler.py # SSE/WebSocket streaming
│   │   │   │   └── response_iterator.py
│   │   │   └── py.typed
│   │   ├── pyproject.toml
│   │   └── README.md
│   │
│   ├── vector-db/
│   │   ├── src/
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # Abstract VectorStore
│   │   │   ├── adapters/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── qdrant.py
│   │   │   │   ├── weaviate.py
│   │   │   │   ├── pgvector.py
│   │   │   │   └── milvus.py
│   │   │   └── factory.py            # Vector store factory
│   │   ├── pyproject.toml
│   │   └── README.md
│   │
│   ├── auth/
│   │   ├── src/
│   │   │   ├── __init__.py
│   │   │   ├── jwt_auth.py
│   │   │   ├── oauth.py
│   │   │   ├── password.py
│   │   │   └── middleware.py
│   │   ├── pyproject.toml
│   │   └── README.md
│   │
│   └── shared-types/
│       ├── src/
│       │   ├── py.typed
│       │   ├── __init__.py
│       │   ├── api.py                # Request/response types
│       │   ├── models.py             # Domain models
│       │   └── config.py             # Config types
│       ├── pyproject.toml
│       └── README.md
│
├── infra/
│   ├── docker-compose.yml            # Local dev (Postgres, Redis, Qdrant)
│   ├── docker-compose.prod.yml       # Production setup
│   ├── Dockerfile                    # FastAPI app Dockerfile
│   ├── Dockerfile.celery             # Celery worker Dockerfile
│   ├── k8s/
│   │   ├── deployment.yaml           # FastAPI deployment
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   └── hpa.yaml                  # Horizontal Pod Autoscaler
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── provider.tf
│   └── scripts/
│       ├── deploy.sh
│       ├── migrate.sh
│       └── health_check.sh
│
├── docs/
│   ├── README.md                     # Project overview
│   ├── QUICKSTART.md                 # 5-minute getting started
│   ├── ARCHITECTURE.md               # System design & data flow
│   ├── SETUP.md                      # Local development guide
│   ├── API.md                        # API endpoints reference
│   ├── RAG_GUIDE.md                  # RAG pipeline tutorial
│   ├── LLM_PROVIDERS.md              # How to switch LLM providers
│   ├── VECTOR_DB.md                  # Vector store configuration
│   ├── DEPLOYMENT.md                 # Production deployment
│   ├── DATABASE.md                   # Database schema & migrations
│   ├── TESTING.md                    # Testing strategy & examples
│   └── TROUBLESHOOTING.md            # Common issues & solutions
│
├── .github/
│   └── workflows/
│       ├── test.yml                  # Run pytest on PR
│       ├── lint.yml                  # Linting checks
│       ├── build.yml                 # Build & push Docker images
│       ├── deploy-staging.yml        # Deploy to staging
│       └── deploy-prod.yml           # Deploy to production
│
├── turbo.json                        # Turborepo config (optional)
├── pyproject.toml                    # Root Python config
├── package.json                      # Root NPM config
├── docker-compose.yml                # Local dev environment
├── .env.example                      # Template for environment variables
├── .gitignore
├── .pre-commit-config.yaml          # Pre-commit hooks (black, isort, ruff)
├── .dockerignore
├── Makefile                          # Convenient commands
├── CONTRIBUTING.md                   # Contribution guidelines
└── README.md                         # Project root README
```

---

## 🛠 Tech Stack (FastAPI Specific)

### Backend Stack
- **Framework:** FastAPI 0.104+ (async Python web framework)
- **ASGI Server:** Uvicorn (production-grade)
- **ORM:** SQLAlchemy 2.0 + Alembic (database & migrations)
- **Database:** PostgreSQL 15+ (with optional pgvector extension)
- **Validation:** Pydantic V2 (type hints & runtime validation)
- **Cache:** Redis 7+ (sessions, caching, job queue)
- **Task Queue:** Celery + Redis (async background jobs)
- **Testing:** pytest + pytest-asyncio + testcontainers
- **Linting:** ruff, black, isort, mypy
- **API Docs:** Auto-generated OpenAPI (Swagger UI, ReDoc)

### AI/ML Stack
- **LLM Clients:** 
  - OpenAI SDK (GPT-4, GPT-3.5-turbo)
  - Anthropic SDK (Claude)
  - Google Generative AI (Gemini)
  - Ollama (local models)
- **Embeddings:** Built-in from LLM providers
- **RAG:** LangChain or custom minimal implementation
- **Vector Databases (swappable):**
  - Qdrant (recommended, best for production)
  - Weaviate (hybrid search features)
  - pgvector (PostgreSQL extension, simple)
  - Milvus (distributed, scalable)
- **Reranking:** Optional cross-encoder (sentence-transformers)

### Frontend Stack
- **Framework:** Next.js 16+ (React 19+)
- **Styling:** Tailwind CSS 4+
- **Components:** shadcn/ui (unstyled, accessible components)
- **State Management:** React hooks + Context API (or SWR for data fetching)
- **API Client:** fetch / axios
- **Forms:** react-hook-form + zod validation
- **UI Components:** Radix UI primitives
- **Type Safety:** TypeScript 5+

### Observability & Monitoring
- **LLM Tracing:** Langfuse (prompt logging, cost tracking)
- **Metrics:** Prometheus + Grafana (CPU, memory, latency, API calls)
- **Distributed Tracing:** OpenTelemetry (optional)
- **Error Tracking:** Sentry (optional)
- **Logging:** Python logging + JSON formatter

### DevOps & Deployment
- **Containerization:** Docker + Docker Compose
- **Orchestration:** Kubernetes (optional, manifests provided)
- **CI/CD:** GitHub Actions (automated tests, builds, deployment)
- **Infrastructure as Code:** Terraform (optional)
- **Hosting Options:**
  - Fly.io (simple deployment)
  - Railway (developer-friendly)
  - Render (serverless)
  - AWS ECS/EKS (enterprise)
  - Self-hosted Docker Swarm

---

## 🎯 Core Abstractions (Vendor-Agnostic)

### 1. LLM Client Interface

```python
# packages/ai-core/llm/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncIterator

@dataclass
class LLMResponse:
    text: str
    tokens_used: int
    model: str
    cost: float = 0.0

class LLMClient(ABC):
    @abstractmethod
    async def complete(
        self, 
        prompt: str, 
        max_tokens: int = 2000,
        temperature: float = 0.7
    ) -> LLMResponse:
        """Generate completion from prompt"""
        pass
    
    @abstractmethod
    async def stream(
        self, 
        prompt: str
    ) -> AsyncIterator[str]:
        """Stream response token-by-token"""
        pass
    
    @abstractmethod
    async def embed(self, text: str) -> list[float]:
        """Generate embedding vector"""
        pass
```

**Usage in FastAPI:**

```python
# apps/backend/app/core/config.py
from packages.ai_core.llm import OpenAIClient, AnthropicClient, OllamaClient

# Select based on env var
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")

llm_clients = {
    "openai": OpenAIClient(api_key=settings.OPENAI_API_KEY),
    "anthropic": AnthropicClient(api_key=settings.ANTHROPIC_API_KEY),
    "ollama": OllamaClient(base_url="http://localhost:11434"),
}

llm = llm_clients[LLM_PROVIDER]
```

**Swap LLM (NO CODE CHANGES):**
```bash
# Change 1 env var
LLM_PROVIDER=openai   # Current
LLM_PROVIDER=anthropic  # Switch to Claude (restart FastAPI)

# FastAPI automatically uses correct client
```

### 2. Vector Store Interface

```python
# packages/vector-db/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

@dataclass
class SearchResult:
    id: str
    text: str
    metadata: dict
    score: float

class VectorStore(ABC):
    @abstractmethod
    async def upsert(
        self, 
        vectors: list[list[float]], 
        metadata: list[dict], 
        ids: list[str]
    ) -> None:
        """Add or update vectors in store"""
        pass
    
    @abstractmethod
    async def search(
        self, 
        query_vector: list[float], 
        top_k: int = 10,
        filters: Optional[dict] = None
    ) -> list[SearchResult]:
        """Search for similar vectors"""
        pass
    
    @abstractmethod
    async def delete(self, ids: list[str]) -> None:
        """Delete vectors by ID"""
        pass
```

**Usage in FastAPI:**

```python
# apps/backend/app/core/vectordb.py
from packages.vector_db import QdrantStore, WeaviateStore, PgVectorStore

vector_db_clients = {
    "qdrant": QdrantStore(url="http://localhost:6333"),
    "weaviate": WeaviateStore(url="http://localhost:8080"),
    "pgvector": PgVectorStore(db_connection=db),
}

vector_store = vector_db_clients[os.getenv("VECTOR_DB_PROVIDER", "qdrant")]
```

**Swap Vector DB (10 minutes, NO CODE REWRITE):**
```bash
# 1. Update .env
VECTOR_DB_PROVIDER=qdrant    # Current
VECTOR_DB_PROVIDER=weaviate  # Swap to Weaviate

# 2. Update docker-compose.yml (remove Qdrant, add Weaviate)

# 3. Restart FastAPI
docker-compose restart backend

# Done! Everything else stays the same
```

### 3. RAG Pipeline (Production-Ready)

```python
# packages/ai-core/rag/pipeline.py
class RAGPipeline:
    def __init__(
        self,
        vector_store: VectorStore,
        llm_client: LLMClient,
        reranker: Optional[Reranker] = None,
        max_context_tokens: int = 2000,
    ):
        self.vector_store = vector_store
        self.llm_client = llm_client
        self.reranker = reranker
        self.max_context_tokens = max_context_tokens
    
    async def query(self, question: str, user_id: str) -> dict:
        """
        Full RAG pipeline:
        1. Embed question
        2. Search vector store
        3. Rerank results
        4. Build context
        5. Generate answer
        6. Track cost & latency
        """
        import time
        start_time = time.time()
        
        # Step 1: Embed question
        query_embedding = await self.llm_client.embed(question)
        
        # Step 2: Search vector store
        search_results = await self.vector_store.search(
            query_embedding, 
            top_k=10
        )
        
        # Step 3: Rerank (optional)
        if self.reranker:
            search_results = await self.reranker.rerank(
                question, 
                search_results
            )
        
        # Step 4: Build context
        context = self._build_context(search_results)
        
        # Step 5: Generate answer
        prompt = self._build_prompt(question, context)
        response = await self.llm_client.complete(prompt)
        
        # Step 6: Track metrics
        latency_ms = (time.time() - start_time) * 1000
        
        return {
            "answer": response.text,
            "sources": [r.id for r in search_results],
            "tokens_used": response.tokens_used,
            "cost": response.cost,
            "latency_ms": latency_ms,
        }
    
    def _build_context(self, results: list[SearchResult]) -> str:
        """Join search results into context"""
        parts = []
        token_count = 0
        
        for result in results:
            text = f"[{result.id}]\n{result.text}"
            tokens = len(text.split())
            
            if token_count + tokens > self.max_context_tokens:
                break
            
            parts.append(text)
            token_count += tokens
        
        return "\n\n---\n\n".join(parts)
    
    def _build_prompt(self, question: str, context: str) -> str:
        """Format prompt with context"""
        return f"""You are a helpful AI assistant. Use the provided context to answer the user's question accurately.

Context:
{context}

User Question: {question}

Answer:"""
```

**Usage in FastAPI endpoint:**

```python
# apps/backend/app/api/v1/chat.py
from fastapi import APIRouter, Depends
from packages.ai_core.rag.pipeline import RAGPipeline

router = APIRouter(prefix="/v1", tags=["chat"])

@router.post("/chat")
async def chat(
    message: str,
    user = Depends(get_current_user),
    rag: RAGPipeline = Depends(get_rag_pipeline)
):
    """Chat endpoint with RAG"""
    result = await rag.query(message, user_id=user.id)
    
    # Log to Langfuse
    langfuse.trace(
        name="rag_chat",
        input={"message": message},
        output=result,
        user_id=user.id,
    )
    
    return result
```

---

## 📦 CLI Commands

### `ai-stack create`

```bash
ai-stack create my-rag-app

✔ Vector Database
  ◯ Qdrant (self-hosted, recommended)
  ◯ Weaviate (hybrid search)
  ◯ PostgreSQL pgvector (simple)
  ◯ Milvus (distributed, scalable)

✔ LLM Provider
  ◯ OpenAI (GPT-4, default)
  ◯ Anthropic (Claude, longer context)
  ◯ Google Gemini (multimodal)
  ◯ Ollama (local, open-source)

✔ Authentication
  ◯ JWT (stateless, recommended)
  ◯ OAuth2 + PKCE (social login)

✔ Additional Features
  ◯ Observability (Langfuse + Prometheus)
  ◯ Background jobs (Celery + Redis)
  ◯ Kubernetes manifests
  ◯ GitHub Actions CI/CD

✨ Creating project...
🐳 Setting up Docker environment...
📦 Installing dependencies...
✅ Done!

Next steps:
  cd my-rag-app
  docker-compose up
  python apps/backend/scripts/init_db.py
  make dev
```

### `ai-stack swap`

```bash
# Swap vector database
ai-stack swap vectordb --to weaviate

# Swap LLM provider
ai-stack swap llm --to anthropic

# Swap auth
ai-stack swap auth --to oauth2

# Swap multiple with preset
ai-stack swap all --preset=gcp-vertex-ai
```

### `ai-stack add`

```bash
ai-stack add langfuse       # Add LLM observability
ai-stack add reranking      # Add cross-encoder reranking
ai-stack add tools          # Add function calling for agents
ai-stack add websockets     # Add WebSocket streaming
ai-stack add kubernetes     # Add K8s manifests
ai-stack add monitoring     # Add Prometheus + Grafana
```

### `ai-stack dev`

```bash
ai-stack dev

# Starts:
# - Docker containers (Postgres, Redis, Qdrant)
# - FastAPI backend (reload on changes)
# - Next.js frontend (with hot reload)
# - Celery worker (for async jobs)

# Output:
✨ Ready to code!
  Backend:  http://localhost:8000
  Frontend: http://localhost:3000
  API Docs: http://localhost:8000/docs
```

---

## 🚀 Example: RAG Chatbot (Complete)

After `ai-stack create my-chatbot`:

**Backend endpoint:**
```python
# apps/backend/app/api/v1/chat.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter(prefix="/v1", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: list[str]
    tokens_used: int

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user = Depends(get_current_user),
    rag: RAGPipeline = Depends(get_rag_pipeline),
    db: Session = Depends(get_db),
):
    """Chat with RAG retrieval"""
    try:
        result = await rag.query(request.message, user.id)
        
        # Save to conversation history
        conversation = await chat_service.save_conversation(
            db=db,
            user_id=user.id,
            conversation_id=request.conversation_id,
            message=request.message,
            response=result["answer"],
            sources=result["sources"],
        )
        
        return ChatResponse(
            response=result["answer"],
            sources=result["sources"],
            tokens_used=result["tokens_used"],
        )
    
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Chat failed")

@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    user = Depends(get_current_user),
    rag: RAGPipeline = Depends(get_rag_pipeline),
):
    """Streaming chat endpoint"""
    async def generate():
        async for token in rag.llm_client.stream(request.message):
            yield f"data: {json.dumps({'token': token})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
```

**Frontend component:**
```typescript
// apps/frontend/app/chat/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-md p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              <p>{msg.content}</p>
              {msg.sources && (
                <div className="mt-2 text-sm opacity-75">
                  Sources: {msg.sources.join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask something..."
          className="flex-1 border rounded px-3 py-2"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
```

---

## ✅ What You Get (Day 1)

```
✅ FastAPI Backend with:
   - 5 REST endpoints (chat, documents, embeddings, auth, health)
   - JWT authentication with refresh tokens
   - Database models (users, documents, conversations)
   - Async/await throughout
   - RAG pipeline ready to use
   - Celery background job support
   - Structured JSON logging
   - Prometheus metrics export

✅ Next.js Frontend with:
   - Chat interface with conversation history
   - Document upload component
   - Authentication pages (login/signup)
   - Responsive Tailwind CSS design
   - TypeScript type safety
   - API client library

✅ Production Infrastructure:
   - Docker Compose (Postgres, Redis, Qdrant)
   - Dockerfile for FastAPI (multi-stage)
   - Docker Dockerfile for Celery worker
   - Health checks & readiness probes
   - Database migrations (Alembic)
   - Environment variable management

✅ Testing & Quality:
   - Unit tests (services, utilities, repositories)
   - Integration tests (database, vector store)
   - API endpoint tests
   - Fixtures & mocking
   - pytest configuration
   - 80%+ code coverage

✅ CI/CD & DevOps:
   - GitHub Actions (test, lint, build)
   - Docker image builds & push
   - Automated deployment options
   - Security scanning
   - Code quality checks

✅ Documentation:
   - Architecture diagram
   - API reference (auto-generated OpenAPI)
   - RAG pipeline guide
   - LLM provider switching guide
   - Deployment instructions
   - Troubleshooting guide

✅ Observability:
   - Langfuse integration (hooks installed)
   - Prometheus metrics (CPU, memory, latency)
   - Structured logging
   - Error tracking hooks
   - Performance monitoring
```

---

## 🔄 Swap Workflows

### Change LLM: OpenAI → Anthropic

```bash
# 1. Update .env
OPENAI_API_KEY=sk_...      # Remove
ANTHROPIC_API_KEY=sk_...   # Add

LLM_PROVIDER=openai        # Change to:
LLM_PROVIDER=anthropic

# 2. Restart FastAPI
docker-compose restart backend

# 3. Done! No code changes, no redeployment of frontend
# All API contracts stay the same
```

### Change Vector DB: Qdrant → Weaviate

```bash
# 1. Update docker-compose.yml
# Remove qdrant service, add weaviate service

# 2. Update .env
VECTOR_DB_PROVIDER=qdrant    # Change to:
VECTOR_DB_PROVIDER=weaviate

QDRANT_URL=http://localhost:6333  # Remove
WEAVIATE_URL=http://localhost:8080  # Add

# 3. Re-index documents
docker-compose up -d weaviate
python apps/backend/scripts/index_documents.py

# 4. Done! FastAPI code unchanged
```

---

## 📋 Installation

```bash
# Global install
npm install -g ai-stack-fastapi

# Create project
ai-stack create my-ai-app

# Or clone and build
git clone https://github.com/ai-stack-team/ai-stack-fastapi
cd ai-stack-fastapi
npm run build
npm run dev -- create test-app
```

---

## 🚢 Deployment Options

### Fly.io (5 minutes)
```bash
flyctl launch
flyctl deploy
```

### Railway (3 minutes)
```bash
railway link
railway up
```

### Docker to any host
```bash
docker build -t my-ai-app .
docker run -p 8000:8000 my-ai-app
```

---

## 📊 Performance Characteristics

- **First message latency:** 200-500ms (depends on LLM)
- **Streaming response time:** <100ms first token
- **Vector search:** <50ms for 100k vectors
- **Throughput:** 100+ concurrent users per instance
- **Cost per query:** ~$0.001-0.1 (depends on LLM)

---

## ✨ What Makes It Special

1. **Zero Vendor Lock-In** - Swap LLMs, vector DBs via 1 env var change
2. **RAG Out-of-Box** - Production-ready retrieval pipeline
3. **Full Type Safety** - Python + TypeScript throughout
4. **Async-First** - Non-blocking I/O, high concurrency
5. **Observable** - Built-in Langfuse, Prometheus hooks
6. **Production-Ready** - Security, testing, CI/CD configured
7. **Easy to Extend** - Clear abstractions for custom logic

---

## 🎯 Roadmap

**Week 1-2:** MVP
- [ ] FastAPI boilerplate
- [ ] Qdrant + OpenAI integration
- [ ] Docker Compose setup
- [ ] Publish CLI to npm

**Week 3-4:** Features
- [ ] Multiple vector DB adapters
- [ ] Multiple LLM providers
- [ ] Swap commands
- [ ] Add Langfuse observability

**Week 5-6:** Polish
- [ ] Example projects
- [ ] Video tutorials
- [ ] Kubernetes manifests
- [ ] Production deployment guide

---

**Everything you need to build production AI apps, today.** 🚀

