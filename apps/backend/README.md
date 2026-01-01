# AI Stack FastAPI - Backend README

Production-grade FastAPI backend with RAG capabilities and vendor-agnostic LLM/Vector DB.

## Features

✅ **Dual Authentication**: Clerk (primary) + Custom JWT (fallback)  
✅ **RAG Pipeline**: Document chunking, embedding, semantic search, LLM generation  
✅ **Vendor-Agnostic**: Swap LLM/Vector providers with 1 env var  
✅ **Streaming**: Server-Sent Events for real-time responses  
✅ **Observable**: Structured logging, cost tracking, metrics  
✅ **Production-Ready**: Error handling, validation, async operations  

## Quick Start

```bash
# Install dependencies
uv sync

# Start infrastructure (from root)
docker-compose up -d

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run backend
uv run uvicorn app.main:app --reload
```

## API Endpoints

### Health
- `GET /health` - Service health
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### Authentication
- `POST /api/v1/auth/register` - Register (JWT mode)
- `POST /api/v1/auth/login` - Login (JWT mode)
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Current user

### Chat (RAG)
- `POST /api/v1/chat` - Chat with document context
- `POST /api/v1/chat/stream` - Streaming chat (SSE)
- `GET /api/v1/chat/conversations` - List conversations

### Documents
- `POST /api/v1/documents` - Upload & index document
- `GET /api/v1/documents` - List documents
- `DELETE /api/v1/documents/{id}` - Delete document

## Architecture

```
app/
├── main.py              # FastAPI entry
├── api/v1/              # REST endpoints
├── auth/                # Dual auth (Clerk + JWT)
├── rag/                 # RAG pipeline
│   ├── pipeline.py      # Query orchestration
│   └── document_processor.py  
├── core/                # Settings, DB, logging
├── middleware/          # Auth, logging, errors
└── models/              # SQLAlchemy models
```

## Configuration

```bash
# LLM Provider
LLM_PROVIDER=openai        # openai, anthropic, gemini, ollama
OPENAI_API_KEY=sk-...

# Vector Database
VECTOR_DB_PROVIDER=qdrant  # qdrant, weaviate, pgvector
QDRANT_URL=http://localhost:6333

# Authentication
AUTH_PROVIDER=clerk        # clerk, jwt
CLERK_SECRET_KEY=sk_test_...

# RAG Settings
RAG_CHUNK_SIZE=1000
RAG_CHUNK_OVERLAP=200
RAG_TOP_K=10
```

## Development

```bash
# Format
uv run ruff format .

# Lint
uv run ruff check --fix .

# Type check
uv run mypy app

# Test
uv run pytest
```

## Deployment

See `docs/deployment.md` for production deployment guide.
