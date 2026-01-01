# AI Stack FastAPI - Quick Start Guide

Complete AI Stack boilerplate with RAG capabilities, authentication, and vendor-agnostic LLM/Vector DB.

## Prerequisites

- Python 3.12+
- Node.js 18+ with pnpm
- Docker & Docker Compose
- `uv` (Python package manager)

## Local Setup

### 1. Clone & Install Dependencies

```bash
cd ai-stack

# Install backend dependencies
cd apps/backend
uv sync
cd ../..

# Install root dependencies (for Turborepo)
pnpm install
```

### 2. Start Infrastructure

```bash
# Start PostgreSQL, Redis, Qdrant
docker-compose up -d

# Verify services
docker-compose ps
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```bash
# Choose your LLM provider
LLM_PROVIDER=openai          # or: anthropic, gemini, ollama
OPENAI_API_KEY=sk-...        # Your OpenAI API key

# Choose your vector DB
VECTOR_DB_PROVIDER=qdrant    # or: weaviate, pgvector

# Auth (choose one)
AUTH_PROVIDER=clerk          # or: jwt
CLERK_SECRET_KEY=sk_test_... # If using Clerk
```

### 4. Run Backend

```bash
cd apps/backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Access API

- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Quick Test: RAG Pipeline

### Upload a Document

```bash
curl -X POST "http://localhost:8000/api/v1/documents" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.txt"
```

### Query with RAG

```bash
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is this document about?"}'
```

### Stream Response

```bash
curl -X POST "http://localhost:8000/api/v1/chat/stream" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Summarize the key points"}' \
  --no-buffer
```

## Project Structure

```
ai-stack/
├── apps/backend/        # FastAPI backend with RAG
├── packages/
│   ├── ai-core/        # LLM abstractions (OpenAI, Anthropic, Gemini, Ollama)
│   └── vector-db/      # Vector DB abstractions (Qdrant, Weaviate, pgvector)
├── docker-compose.yml  # Local dev services
└── .env               # Configuration
```

## Switch Providers

Change providers with ONE environment variable:

```bash
# Switch LLM
LLM_PROVIDER=anthropic     # Use Claude instead of GPT-4

# Switch Vector DB
VECTOR_DB_PROVIDER=pgvector  # Use PostgreSQL instead of Qdrant
```

No code changes needed! 🎉

## Common Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Run backend
cd apps/backend && uv run uvicorn app.main:app --reload

# Run tests
cd apps/backend && uv run pytest

# Format code
uv run ruff format .
uv run ruff check --fix .
```

## Next Steps

- [ ] Set up Clerk authentication (see docs/auth.md)
- [ ] Deploy to production (see docs/deployment.md)
- [ ] Build frontend with Next.js
- [ ] Add more document types (PDF, DOCX)

## Support

- Docs: `docs/` directory
- Issues: GitHub Issues
- Spec: `ai-stack-fastapi-spec.md`
