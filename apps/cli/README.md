# create-ai-stack

> The best way to start a full-stack, typesafe AI app

Interactive CLI to scaffold production-ready AI applications with **FastAPI**, **Next.js**, and **RAG pipelines**.

## Quick Start

```bash
npx create-ai-stack@latest my-ai-app
```

## Features

- 🤖 **4 LLM Providers** - OpenAI, Anthropic, Gemini, Ollama
- 🗄️ **3 Vector DBs** - Qdrant, Weaviate, pgvector
- 🔐 **Dual Auth** - Clerk or Custom JWT
- ⚡ **FastAPI Backend** - Async Python with SQLAlchemy
- 🎨 **Next.js Frontend** - TypeScript + Tailwind CSS

## What You Get

```
my-ai-app/
├── apps/
│   ├── backend/      # FastAPI + RAG Pipeline
│   └── frontend/     # Next.js 16 + Clerk
├── packages/         # Shared abstractions
├── docker-compose.yml
└── .env.example
```

## License

MIT
