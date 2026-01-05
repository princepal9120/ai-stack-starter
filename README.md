<div align="center">

# AI Stack

### The Production-Ready AI Application Framework

**Build AI-powered applications with zero vendor lock-in.**

[![npm version](https://img.shields.io/npm/v/create-ai-stack-starter?style=flat-square&color=blue)](https://www.npmjs.com/package/create-ai-stack-starter)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)

[Get Started](https://ai-stack.dev/docs/quickstart) · [Documentation](https://ai-stack.dev/docs) · [Stack Builder](https://ai-stack.dev/builder) · [GitHub](https://github.com/princepal9120/ai-stack)

</div>

---

## Why AI Stack?

Building production AI applications requires more than just connecting to an LLM. You need authentication, vector databases, RAG pipelines, and infrastructure that scales. **AI Stack gives you all of this out of the box.**

| Challenge | AI Stack Solution |
|-----------|-------------------|
| **Vendor Lock-in** | Swap LLMs or Vector DBs with one environment variable |
| **Production Readiness** | Built-in auth, error handling, observability, and cost tracking |
| **Type Safety** | Full TypeScript + Pydantic across the entire stack |
| **Infrastructure** | Docker Compose dev, Kubernetes prod - ready to deploy |

---

## Quick Start

```bash
npx create-ai-stack-starter@latest my-ai-app
```

You'll be prompted to select:
- **Architecture**: Next.js Fullstack, FastAPI + Next.js, or TypeScript Backend
- **Database**: Neon, Supabase, Turso, or SQLite
- **Auth**: Better Auth, NextAuth, Clerk, or None
- **LLM Provider**: OpenAI, Anthropic, or Novita AI
- **Add-ons**: Tailwind, Biome, PWA, Analytics

---

## Architecture Options

<table>
<tr>
<td width="33%" valign="top">

### 🌐 Next.js Fullstack
**Best for:** Rapid prototyping, Vercel deployment

- Vercel AI SDK
- Drizzle ORM
- Better Auth
- Server Actions

</td>
<td width="33%" valign="top">

### 🐍 FastAPI + Next.js
**Best for:** ML teams, complex AI pipelines

- Async Python backend
- SQLAlchemy 2.0
- Celery for background jobs
- Alembic migrations

</td>
<td width="33%" valign="top">

### 📦 TypeScript Backend
**Best for:** TypeScript teams, edge deployment

- Hono / NestJS / Fastify
- Drizzle or Prisma
- Edge-ready
- tRPC ready

</td>
</tr>
</table>

---

## Core Features

### 🔓 Zero Vendor Lock-in

Abstract interfaces for every integration. Switch providers with one env variable:

```env
# Switch LLM provider
LLM_PROVIDER=openai      # or: anthropic, gemini, ollama

# Switch Vector DB
VECTOR_DB=qdrant         # or: weaviate, pgvector, pinecone
```

### ⚡ Production RAG Pipeline

Complete document ingestion, chunking, embedding, and retrieval:

```typescript
// Ingest documents
await rag.ingest(documents, { chunkSize: 512, overlap: 50 });

// Query with context
const response = await rag.query("What is the refund policy?", {
  topK: 5,
  rerank: true,
});
```

### 🔐 Enterprise Authentication

Multiple auth strategies with unified interface:

- **Better Auth** - Modern, type-safe, self-hosted
- **NextAuth.js** - Flexible OAuth, social logins  
- **Clerk** - Managed auth with great DX
- **JWT** - Service-to-service authentication

### 📊 Built-in Observability

Track everything that matters in production:

- Token usage and cost tracking
- Request latency monitoring
- Error aggregation
- LLM response quality metrics

---

## Use Cases

<table>
<tr>
<td width="50%" valign="top">

### 💬 AI Customer Support
Build intelligent chatbots that understand your product docs and provide accurate answers with citations.

</td>
<td width="50%" valign="top">

### 📚 Document Q&A
Create internal knowledge bases that let employees query company documents naturally.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🔍 Semantic Search
Replace keyword search with AI-powered semantic search across your content.

</td>
<td width="50%" valign="top">

### 🤖 AI Assistants
Build domain-specific AI assistants with memory and tool use.

</td>
</tr>
</table>

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS |
| **Backend** | FastAPI / Hono / NestJS |
| **Database** | PostgreSQL (Neon/Supabase), SQLite (Turso) |
| **Vector DB** | Qdrant, Weaviate, pgvector |
| **ORM** | Drizzle / Prisma / SQLAlchemy |
| **Auth** | Better Auth, NextAuth, Clerk |
| **AI** | OpenAI, Anthropic, Google Gemini, Ollama |
| **Infrastructure** | Docker, Kubernetes, Vercel |

---

## Documentation

| Section | Description |
|---------|-------------|
| [Quick Start](https://ai-stack.dev/docs/quickstart) | Get running in 5 minutes |
| [Architecture](https://ai-stack.dev/docs/architecture) | System design and patterns |
| [LLM Providers](https://ai-stack.dev/docs/llm-providers) | Configure AI providers |
| [Vector Databases](https://ai-stack.dev/docs/vector-databases) | Vector storage options |
| [RAG Pipeline](https://ai-stack.dev/docs/rag-pipeline) | Document ingestion and retrieval |
| [Deployment](https://ai-stack.dev/docs/deployment) | Production deployment guides |
| [Security](https://ai-stack.dev/docs/security) | Security best practices |

---

## Project Structure

```
my-ai-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Protected pages
│   └── api/               # API routes
├── components/            # React components
│   ├── chat/              # Chat UI components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── ai/                # LLM client abstraction
│   ├── auth/              # Auth configuration
│   ├── db/                # Database schema & client
│   └── search/            # Vector search client
└── types/                 # TypeScript types
```

---

## Security

AI Stack is built with security as a first-class concern:

- ✅ **Authentication** - Multiple battle-tested auth providers
- ✅ **Authorization** - Role-based access control ready
- ✅ **Data Encryption** - TLS in transit, encryption at rest
- ✅ **API Security** - Rate limiting, CORS, input validation
- ✅ **Secrets Management** - Environment-based configuration
- ✅ **Audit Logging** - Track all sensitive operations

Read our [Security Documentation](https://ai-stack.dev/docs/security) for details.

---

## Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repo
git clone https://github.com/princepal9120/ai-stack.git

# Install dependencies
pnpm install

# Run development
pnpm dev
```

---

## License

MIT © [AI Stack Team](https://github.com/princepal9120)

---

<div align="center">

**Built with ❤️ for the AI developer community**

[Website](https://ai-stack.dev) · [Documentation](https://ai-stack.dev/docs) · [GitHub](https://github.com/princepal9120/ai-stack) · [Twitter](https://twitter.com/princepal9120)

</div>
