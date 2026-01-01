# AI Stack FastAPI

> **Production-ready RAG boilerplate with zero vendor lock-in.**
> Built with FastAPI, Next.js 16, and the best AI engineering practices.

## 🚀 Quick Start

The fastest way to get started is using our interactive CLI:

```bash
npx create-ai-stack@latest my-ai-app
```

Or explore the full documentation at **[ai-stack-fastapi.dev](http://localhost:3001)**.

---

## ⚡ Features

- **Zero Vendor Lock-in**: Abstract interfaces for swapping LLMs (OpenAI, Anthropic, Gemini, Ollama) and Vector DBs (Qdrant, Weaviate, pgvector) with one variable.
- **Production RAG Pipeline**: End-to-end ingestion, chunking, embedding, and streaming generation.
- **Dual Authentication**: Modern Clerk auth for frontend + custom JWT for API access.
- **Full-Stack Typesafety**: Pydantic V2 on backend, TypeScript on frontend.
- **Infrastructure Ready**: Docker Compose for local dev, standardized for cloud deployment.

## 📚 Documentation

Detailed documentation is available in the `website` directory or by running the docs site locally:

```bash
cd website
pnpm install
pnpm dev
```

- [Architecture](http://localhost:3001/docs/architecture)
- [LLM Providers](http://localhost:3001/docs/llm-providers)
- [Vector Databases](http://localhost:3001/docs/vector-databases)
- [Deployment](http://localhost:3001/docs/deployment)

## 🛠️ Manual Setup

If you prefer to clone and run manually:

1. **Clone & Install**
   ```bash
   git clone https://github.com/yourusername/ai-stack.git
   cd ai-stack
   npm install -g pnpm uv
   ```

2. **Start Infrastructure**
   ```bash
   docker-compose up -d
   ```

3. **Backend**
   ```bash
   cd apps/backend
   cp .env.example .env
   uv run alembic upgrade head
   uv run uvicorn app.main:app --reload
   ```

4. **Frontend**
   ```bash
   cd apps/frontend
   cp .env.example .env.local
   pnpm install
   pnpm dev
   ```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

MIT © AI Stack Team
