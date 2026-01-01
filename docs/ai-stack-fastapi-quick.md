# AI Stack FastAPI - Quick Reference

**FastAPI-only boilerplate for production AI applications**

---

## 🎯 What You Get

A CLI tool that scaffolds **complete FastAPI AI applications** in 5 minutes:

```bash
npm install -g ai-stack-fastapi
ai-stack create my-rag-app
cd my-rag-app
docker-compose up & npm run dev
# Visit http://localhost:3000 (fully functional AI app)
```

---

## 📦 Tech Stack (FastAPI Only)

| Component | Technology |
|-----------|------------|
| **Backend Framework** | FastAPI 0.104+ (async Python) |
| **Server** | Uvicorn (production-grade ASGI) |
| **ORM** | SQLAlchemy 2.0 + Alembic |
| **Database** | PostgreSQL 15+ (+ pgvector optional) |
| **Cache** | Redis 7+ |
| **Task Queue** | Celery + Redis |
| **Validation** | Pydantic V2 |
| **Testing** | pytest + testcontainers |
| **Frontend** | Next.js 14+ (React 18+) |
| **Vector DB** | Qdrant (swappable to Weaviate/Pgvector/Milvus) |
| **LLM** | OpenAI (swappable to Anthropic/Gemini/Ollama) |
| **Observability** | Langfuse + Prometheus |
| **CI/CD** | GitHub Actions |

---

## 🏗 Project Structure

```
my-app/
├── apps/
│   ├── backend/          ← FastAPI + RAG logic
│   └── frontend/         ← Next.js UI
├── packages/
│   ├── ai-core/          ← RAG pipeline, LLM abstractions
│   ├── vector-db/        ← Vector store adapters
│   ├── auth/             ← JWT utilities
│   └── shared-types/     ← Shared TypeScript types
├── infra/                ← Docker, K8s, Terraform
├── docs/                 ← Complete documentation
└── .github/workflows/    ← CI/CD pipelines
```

---

## 🚀 Key Features

### 1. Vendor-Agnostic Abstractions

**Change LLM in 1 line:**
```bash
# OpenAI (default)
LLM_PROVIDER=openai

# Switch to Anthropic (no code changes, just restart)
LLM_PROVIDER=anthropic
```

**Change Vector DB in 1 command:**
```bash
ai-stack swap vectordb --to weaviate
```

### 2. Production RAG Pipeline

```python
# Ready-to-use class
pipeline = RAGPipeline(
    vector_store=vector_db,
    llm_client=llm,
    reranker=optional_reranker  # Optional cross-encoder
)

result = await pipeline.query("What is RAG?")
# Returns: answer, sources, tokens_used, cost, latency
```

### 3. FastAPI Endpoints (Pre-built)

- `POST /api/v1/chat` - Chat with RAG
- `POST /api/v1/chat/stream` - Streaming responses
- `POST /api/v1/documents/upload` - Upload documents
- `POST /api/v1/embeddings` - Generate embeddings
- `POST /auth/login` - User authentication
- `POST /auth/register` - Create account
- `GET /health` - Health check

### 4. Built-in Everything

✅ JWT authentication  
✅ RAG pipeline  
✅ Vector database integration  
✅ Async background jobs (Celery)  
✅ Database migrations  
✅ Type safety (Python type hints)  
✅ Structured logging  
✅ Prometheus metrics  
✅ Error handling  
✅ CORS, rate limiting  
✅ Docker setup  
✅ Tests (80%+ coverage)  
✅ CI/CD workflows  
✅ Production-ready security  

---

## 💻 Development Workflow

### Start Development (one command)

```bash
ai-stack dev

# Automatically starts:
# - Docker containers (Postgres, Redis, Qdrant)
# - FastAPI backend (auto-reload)
# - Next.js frontend (hot reload)
# - Celery worker (for async jobs)

# Outputs:
# Backend:  http://localhost:8000
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### Make First Query

```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is RAG?"}'

# Response:
{
  "response": "RAG stands for Retrieval-Augmented Generation...",
  "sources": ["doc_1", "doc_2"],
  "tokens_used": 145,
  "cost": 0.002,
  "latency_ms": 234
}
```

### Add Documents (Indexing)

```bash
python apps/backend/scripts/index_documents.py \
  --folder ./docs \
  --vector-db qdrant

# Automatically:
# 1. Reads all documents
# 2. Chunks them (with overlap)
# 3. Generates embeddings
# 4. Stores in vector DB
# 5. Indexes for semantic search
```

---

## 🔄 Migration Workflows

### Switch LLM: OpenAI → Anthropic

```bash
# 1. Update .env
OPENAI_API_KEY=sk_...        # ← Remove
ANTHROPIC_API_KEY=sk_...     # ← Add
LLM_PROVIDER=openai          # ← Change
LLM_PROVIDER=anthropic       # ← To this

# 2. Restart backend
docker-compose restart backend

# 3. Done! No code changes
# All API contracts stay the same
# Frontend never changes
```

### Switch Vector DB: Qdrant → Weaviate

```bash
# 1. Run CLI command
ai-stack swap vectordb --to weaviate

# This automatically:
# - Updates docker-compose.yml
# - Updates .env
# - Updates Python imports
# - Generates migration guide

# 2. Start new vector DB
docker-compose up -d weaviate

# 3. Re-index documents
python apps/backend/scripts/index_documents.py

# 4. Done! FastAPI code unchanged
```

### Add Feature: Observability

```bash
# Add Langfuse integration
ai-stack add langfuse

# This installs:
# - Langfuse Python SDK
# - Observability middleware
# - Environment variables (.env)
# - Example prompts in Langfuse dashboard

# Just set env vars and done:
LANGFUSE_PUBLIC_KEY=pk_...
LANGFUSE_SECRET_KEY=sk_...
```

---

## 🎯 Real-World Examples

### Example 1: RAG Chatbot

```python
# apps/backend/app/api/v1/chat.py
@router.post("/chat")
async def chat(
    message: str,
    user = Depends(get_current_user),
    rag = Depends(get_rag_pipeline)
):
    result = await rag.query(message)
    
    # Save to conversation history
    await save_conversation(user.id, message, result["answer"])
    
    # Log to Langfuse
    langfuse.trace(input=message, output=result)
    
    return result
```

### Example 2: Streaming Chat

```python
@router.post("/chat/stream")
async def stream_chat(
    message: str,
    rag = Depends(get_rag_pipeline)
):
    async def generate():
        async for token in rag.llm_client.stream(message):
            yield f"data: {json.dumps({'token': token})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
```

### Example 3: Async Document Indexing

```python
# apps/backend/app/tasks/document_tasks.py
@celery_app.task
def index_document(doc_id: str):
    """Background job to index document"""
    # 1. Read document
    doc = db.query(Document).filter(Document.id == doc_id).first()
    
    # 2. Split into chunks
    chunks = text_splitter.split(doc.content)
    
    # 3. Generate embeddings
    embeddings = [llm.embed(chunk) for chunk in chunks]
    
    # 4. Store in vector DB
    vector_store.upsert(embeddings, metadata, chunk_ids)
    
    # 5. Mark as indexed
    doc.indexed = True
    db.commit()

# Trigger from endpoint
@router.post("/documents/upload")
async def upload(file: UploadFile, user = Depends(get_current_user)):
    doc = await save_document(file, user.id)
    index_document.delay(doc.id)  # Async task
    return {"document_id": doc.id}
```

---

## 📊 Performance

- **First message latency:** 200-500ms
- **Vector search:** <50ms
- **Streaming first token:** <100ms
- **Concurrent users:** 100+ per instance
- **Cost per query:** ~$0.001-0.1

---

## 🔐 Security Built-in

✅ JWT authentication with refresh tokens  
✅ Password hashing (bcrypt)  
✅ CORS protection  
✅ Rate limiting (per user)  
✅ SQL injection prevention (SQLAlchemy)  
✅ Input validation (Pydantic)  
✅ Environment variable isolation  
✅ Secrets management  

---

## 📋 CLI Commands

```bash
# Create new project
ai-stack create my-app

# Swap implementations
ai-stack swap llm --to anthropic
ai-stack swap vectordb --to weaviate
ai-stack swap auth --to oauth2

# Add features
ai-stack add langfuse
ai-stack add reranking
ai-stack add tools
ai-stack add websockets

# Development
ai-stack dev                 # Start everything
ai-stack test                # Run tests
ai-stack build               # Build production
ai-stack deploy --to fly.io  # Deploy to Fly.io
```

---

## 🚀 Deployment

### Fly.io (recommended)

```bash
flyctl launch
flyctl deploy
# Done! App is live
```

### Railway

```bash
railway link
railway up
# Done! Auto-deployed
```

### Self-hosted Docker

```bash
docker build -t my-app .
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e DATABASE_URL=$DATABASE_URL \
  my-app
```

### Kubernetes

```bash
# Manifests provided
kubectl apply -f infra/k8s/

# Auto-scales based on load
# Health checks configured
# Logging & monitoring integrated
```

---

## 📚 Documentation Included

- **QUICKSTART.md** - 5-minute getting started
- **ARCHITECTURE.md** - System design & data flow
- **API.md** - Auto-generated OpenAPI docs
- **RAG_GUIDE.md** - How RAG works & tuning
- **LLM_PROVIDERS.md** - How to add new LLM
- **VECTOR_DB.md** - Vector database configuration
- **DEPLOYMENT.md** - Production deployment steps
- **TROUBLESHOOTING.md** - Common issues

---

## ✅ What You Get (Day 1)

```
✅ Fully functional FastAPI backend
✅ Modern Next.js frontend
✅ RAG pipeline ready to use
✅ JWT authentication
✅ Vector database integration
✅ Async background jobs
✅ Docker Compose setup
✅ Prometheus metrics
✅ Langfuse observability hooks
✅ Test suite (80%+ coverage)
✅ CI/CD with GitHub Actions
✅ Production security checks
✅ Complete documentation
✅ Example projects
✅ Deployment templates
```

**You focus on domain logic. We handle infrastructure.**

---

## 🎯 Why Choose This

| Feature | AI Stack FastAPI | Competitors |
|---------|------------------|-------------|
| **Ready-to-use RAG** | ✅ | ❌ Build from scratch |
| **Vendor-agnostic** | ✅ Swap LLM/DB | ❌ Locked in |
| **Production-ready** | ✅ Auth, security, tests | ❌ Missing pieces |
| **Type-safe** | ✅ Python + TypeScript | ❌ Loose typing |
| **Observable** | ✅ Langfuse integrated | ❌ Manual setup |
| **Time to demo** | ✅ 5 minutes | ❌ 30+ minutes |
| **No lock-in** | ✅ Swap everything | ❌ Tied to providers |

---

## 📞 Support & Community

- **GitHub Issues:** Report bugs
- **Discussions:** Ask questions
- **Documentation:** Full reference
- **Examples:** Real-world projects
- **YouTube:** Video tutorials
- **Discord:** Live community chat

---

## 🎬 Next Steps

1. **Install:** `npm install -g ai-stack-fastapi`
2. **Create:** `ai-stack create my-app`
3. **Develop:** `cd my-app && ai-stack dev`
4. **Customize:** Add your AI logic
5. **Deploy:** `ai-stack deploy --to fly.io`

**That's it.** Complete, production-grade AI app. Ready to ship. 🚀

