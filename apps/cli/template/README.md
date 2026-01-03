# AI Stack FastAPI Project

Production-ready AI application with RAG pipelines and zero vendor lock-in.

## Quick Start

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Install backend dependencies
cd apps/backend && uv sync

# 3. Run migrations
uv run alembic upgrade head

# 4. Start backend
uv run uvicorn app.main:app --reload

# 5. Start frontend (new terminal)
cd apps/frontend && pnpm install && pnpm dev
```

## Project Structure

```
├── apps/
│   ├── backend/          # FastAPI + RAG Pipeline
│   │   ├── app/
│   │   │   ├── api/      # API routes
│   │   │   ├── core/     # Config, security
│   │   │   ├── llm/      # LLM adapters
│   │   │   ├── rag/      # RAG pipeline
│   │   │   └── models/   # SQLAlchemy models
│   │   └── alembic/      # Migrations
│   └── frontend/         # Next.js + Tailwind
├── docker-compose.yml
└── .env.example
```

## Environment Variables

Copy the `.env.example` files and fill in your API keys:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```

## Documentation

Visit [ai-stack-fastapi.dev](https://ai-stack-fastapi.dev) for full documentation.

## License

MIT
