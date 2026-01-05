# AI Stack TypeScript - Quick Reference

**TypeScript-only boilerplate for production AI applications**

---

## 🎯 What You Get

A CLI tool that scaffolds **complete TypeScript AI applications** in 5 minutes:

```bash
npx create-ai-stack-starter my-rag-app
cd my-rag-app
docker-compose up & pnpm dev
# Visit http://localhost:3000 (fully functional AI app)
```

---

## 📦 Tech Stack (TypeScript Only)

| Component | Technology |
|-----------|------------|
| **Backend Framework** | Hono / Fastify / NestJS (your choice) |
| **Runtime** | Node.js 20+ / Bun 1.0+ |
| **ORM** | Drizzle (recommended) / Prisma |
| **Database** | PostgreSQL 16+ (+ pgvector optional) |
| **Cache** | Redis 7+ / Upstash |
| **Validation** | Zod (type-safe runtime validation) |
| **Testing** | Vitest (5x faster than Jest) |
| **Frontend** | Next.js 15+ (React 19+) |
| **Vector DB** | Qdrant (swappable to Weaviate/Pinecone) |
| **LLM** | OpenAI (swappable to Anthropic/Gemini) |
| **AI Framework** | LangChain.js / Vercel AI SDK |
| **Observability** | Langfuse + OpenTelemetry |
| **CI/CD** | GitHub Actions |

---

## 🏗 Project Structure

```
my-app/
├── apps/
│   ├── backend/          ← Hono/Fastify/NestJS + RAG logic
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

### 2. Production RAG Pipeline (LangChain.js)

```typescript
import { RAGPipeline } from '@ai-stack/ai-core';

const pipeline = new RAGPipeline({
  vectorStore: qdrantClient,
  llm: openaiClient,
  reranker: optionalReranker, // Optional cross-encoder
});

const result = await pipeline.query("What is RAG?");
// Returns: { answer, sources, tokensUsed, cost, latency }
```

### 3. Type-Safe API Endpoints (with Hono)

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono();

const ChatSchema = z.object({
  message: z.string(),
  temperature: z.number().min(0).max(2).optional(),
});

app.post('/api/chat', 
  zValidator('json', ChatSchema),
  async (c) => {
    const { message } = c.req.valid('json');
    const result = await rag.query(message);
    return c.json(result);
  }
);
```

### 4. Built-in Everything

✅ JWT authentication  
✅ RAG pipeline (LangChain.js)  
✅ Vector database integration  
✅ Type-safe validation (Zod)  
✅ Database migrations (Drizzle)  
✅ Structured logging  
✅ OpenTelemetry metrics  
✅ Error handling  
✅ CORS, rate limiting  
✅ Docker setup  
✅ Tests (Vitest)  
✅ CI/CD workflows  
✅ Production-ready security  

---

## 💻 Development Workflow

### Start Development (one command)

```bash
ai-stack dev

# Automatically starts:
# - Docker containers (Postgres, Redis, Qdrant)
# - TypeScript backend (auto-reload with tsx/bun)
# - Next.js frontend (hot reload)

# Outputs:
# Backend:  http://localhost:3001
# Frontend: http://localhost:3000
# API Docs: http://localhost:3001/docs
```

### Make First Query

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is RAG?"}'

# Response:
{
  "answer": "RAG stands for Retrieval-Augmented Generation...",
  "sources": ["doc_1", "doc_2"],
  "tokensUsed": 145,
  "cost": 0.002,
  "latencyMs": 234
}
```

### Add Documents (Indexing)

```typescript
// scripts/index-documents.ts
import { DocumentIndexer } from '@ai-stack/ai-core';

const indexer = new DocumentIndexer({
  vectorStore: qdrant,
  embeddings: openaiEmbeddings,
});

await indexer.indexDirectory('./docs', {
  chunkSize: 1000,
  chunkOverlap: 200,
});
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
# - Updates TypeScript imports
# - Generates migration guide

# 2. Start new vector DB
docker-compose up -d weaviate

# 3. Re-index documents
pnpm run index-documents

# 4. Done! Backend code unchanged
```

---

## 🎯 Real-World Examples

### Example 1: RAG Chatbot (Hono)

```typescript
import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { RAGService } from './services/rag';

const app = new Hono();

app.use('/api/*', jwt({ secret: process.env.JWT_SECRET }));

app.post('/api/chat', async (c) => {
  const user = c.get('jwtPayload');
  const { message } = await c.req.json();
  
  const result = await RAGService.query(message, user.id);
  
  // Save to conversation history
  await db.conversations.create({
    userId: user.id,
    message,
    response: result.answer,
  });
  
  // Log to Langfuse
  langfuse.trace({ 
    input: message, 
    output: result 
  });
  
  return c.json(result);
});
```

### Example 2: Streaming Chat (SSE)

```typescript
import { streamSSE } from 'hono/streaming';

app.post('/api/chat/stream', async (c) => {
  const { message } = await c.req.json();
  
  return streamSSE(c, async (stream) => {
    for await (const token of llm.stream(message)) {
      await stream.writeSSE({
        data: JSON.stringify({ token }),
      });
    }
  });
});
```

### Example 3: Type-Safe Document Indexing

```typescript
import { z } from 'zod';

const DocumentSchema = z.object({
  content: z.string(),
  metadata: z.record(z.any()),
});

app.post('/api/documents/upload', async (c) => {
  const doc = DocumentSchema.parse(await c.req.json());
  
  // Queue for background processing
  await queue.add('index-document', {
    docId: doc.id,
  });
  
  return c.json({ documentId: doc.id });
});
```

---

## 📊 Performance

- **First message latency:** 150-400ms
- **Vector search:** <30ms
- **Streaming first token:** <80ms
- **Concurrent users:** 200+ per instance (Hono/Fastify)
- **Cost per query:** ~$0.001-0.1

---

## 🔐 Security Built-in

✅ JWT authentication with refresh tokens  
✅ Type-safe validation (Zod)  
✅ CORS protection  
✅ Rate limiting (per user)  
✅ SQL injection prevention (ORM)  
✅ Input validation  
✅ Environment variable isolation  
✅ Secrets management  

---

## 📋 CLI Commands

```bash
# Create new project
ai-stack create my-app

# Choose backend framework
ai-stack create my-app --backend hono|fastify|nestjs

# Swap implementations
ai-stack swap llm --to anthropic
ai-stack swap vectordb --to weaviate
ai-stack swap orm --to prisma

# Add features
ai-stack add langfuse
ai-stack add reranking
ai-stack add tools

# Development
ai-stack dev                 # Start everything
ai-stack test                # Run tests
ai-stack build               # Build production
ai-stack deploy --to vercel  # Deploy
```

---

## 🚀 Deployment

### Cloudflare Workers (Hono only)

```bash
npx wrangler deploy
# Done! Serverless AI at the edge
```

### Vercel

```bash
vercel deploy
# Auto-deployed with zero config
```

### Railway

```bash
railway link
railway up
# Done! Auto-deployed
```

### Docker

```bash
docker build -t my-app .
docker run -p 3001:3001 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e DATABASE_URL=$DATABASE_URL \
  my-app
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
✅ Fully functional TypeScript backend
✅ Modern Next.js frontend
✅ RAG pipeline ready to use
✅ JWT authentication
✅ Vector database integration
✅ Type-safe validation (Zod)
✅ Docker Compose setup
✅ OpenTelemetry metrics
✅ Langfuse observability hooks
✅ Test suite (Vitest)
✅ CI/CD with GitHub Actions
✅ Production security checks
✅ Complete documentation
✅ Example projects
✅ Deployment templates
```

**You focus on domain logic. We handle infrastructure.**

---

## 🎯 Why Choose This

| Feature | AI Stack TypeScript | Python Stack |
|---------|---------------------|--------------|
| **Type-safe end-to-end** | ✅ | ⚠️ Runtime only |
| **Vendor-agnostic** | ✅ Swap LLM/DB | ✅ |
| **Production-ready** | ✅ Auth, security, tests | ✅ |
| **Shared types** | ✅ Frontend + Backend | ❌ |
| **Edge deployment** | ✅ Hono on CF Workers | ❌ |
| **Time to demo** | ✅ 5 minutes | ✅ 5 minutes |
| **No lock-in** | ✅ Swap everything | ✅ |

---

## 🎬 Next Steps

1. **Install:** `npx create-ai-stack-starter@latest`
2. **Create:** Choose TypeScript backend
3. **Select Framework:** Hono / Fastify / NestJS
4. **Develop:** `cd my-app && pnpm dev`
5. **Customize:** Add your AI logic
6. **Deploy:** `ai-stack deploy --to vercel`

**That's it.** Complete, production-grade AI app. Ready to ship. 🚀
