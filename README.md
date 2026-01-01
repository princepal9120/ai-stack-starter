# AI Stack - Production-Ready AI Boilerplate

**A high-performance, vendor-agnostic boilerplate for building production-grade AI applications with FastAPI, Next.js, and RAG.**

---

## 🚀 Overview

AI Stack is a modular, scalable boilerplate designed to accelerate the development of AI-powered applications. It provides a robust foundation with a focus on developer experience, observability, and zero vendor lock-in. Whether you're building a simple chatbot or a complex multi-tenant AI studio, AI Stack has you covered.

## ✨ Core Features

- 🔐 **Dual Authentication:** Seamless integration with **Clerk** for modern auth, with a custom **JWT fallback** to ensure no vendor lock-in.
- 🧠 **RAG Pipeline:** Built-in Retrieval-Augmented Generation pipeline supporting document chunking, embeddings, and vector search.
- 🔄 **Vendor-Agnostic:** Easily swap between LLM providers (OpenAI, Anthropic, Gemini, Ollama) and Vector Databases (Qdrant, Weaviate, Milvus, pgvector) with simple configuration changes.
- 🎨 **AI Studio:** A premium, interactive UI for AI exploration, including features like Mermaid diagrams, documentation generation, and more.
- 🛠 **Monorepo Architecture:** Powered by Turborepo for efficient management of backend, frontend, and shared packages.
- 📈 **Observability:** Integrated with **Langfuse** for LLM tracing and **Prometheus** for system metrics.
- 🐳 **Docker Ready:** Production-ready containerization for easy deployment.

## 🏗 Project Structure

```text
ai-stack/
├── apps/
│   ├── backend/          # FastAPI application (logic, API, services)
│   └── frontend/         # Next.js application (App Router, Tailwind CSS)
├── packages/
│   ├── ai-core/          # Shared AI logic, LLM clients, RAG pipeline
│   ├── vector-db/        # Vector database adapters and factory
│   ├── auth/             # Authentication abstractions and providers
│   └── shared-types/     # Shared Pydantic models and schemas
├── docs/                 # Detailed documentation and architecture
├── infra/                # Infrastructure-as-Code (Terraform, K8s)
└── docker-compose.yml    # Local development environment
```

## 🛠 Tech Stack

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Async Python)
- **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/) 2.0 + [Alembic](https://alembic.sqlalchemy.org/)
- **Database:** PostgreSQL
- **Task Queue:** Celery + Redis
- **Validation:** Pydantic V2

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) 15 (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** shadcn/ui + Radix UI
- **Auth:** [Clerk](https://clerk.com/)

### AI & Infrastructure
- **Vector DB:** Qdrant (default), Weaviate, pgvector
- **LLM:** OpenAI, Anthropic, Gemini, Ollama
- **Observability:** Langfuse, Prometheus
- **Deployment:** Docker, Kubernetes, Terraform

## 🏁 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/ai-stack.git
   cd ai-stack
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Update .env with your API keys (OpenAI, Clerk, etc.)
   ```

3. **Start local environment:**
   ```bash
   docker-compose up -d
   ```

4. **Install dependencies and run:**
   ```bash
   npm install
   npm run dev
   ```

Visit `http://localhost:3000` to see the frontend and `http://localhost:8000/docs` for the API documentation.

## 📚 Documentation

For more in-depth information, please refer to the [docs](file:///Users/prince/Desktop/coding/ai-stack/docs) directory:

- [**Architecture**](file:///Users/prince/Desktop/coding/ai-stack/docs/ARCHITECTURE.md) - Deep dive into system design.
- [**Quick Start Guide**](file:///Users/prince/Desktop/coding/ai-stack/docs/ai-stack-fastapi-quick.md) - Detailed setup instructions.
- [**Full Specification**](file:///Users/prince/Desktop/coding/ai-stack/docs/ai-stack-fastapi-spec.md) - Comprehensive technical details.
