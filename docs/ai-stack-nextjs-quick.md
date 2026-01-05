# AI Stack Next.js - Quick Reference

**Full-stack Next.js boilerplate for production AI applications**

---

## 🎯 What You Get

A CLI tool that scaffolds **complete Next.js AI applications** in 5 minutes:

```bash
npx create-ai-stack-starter my-ai-app
# Select "Next.js Full-Stack" option
cd my-ai-app
npm run dev
# Visit http://localhost:3000 (fully functional AI app)
```

---

## 📦 Tech Stack (Next.js Only)

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 15+ (App Router) |
| **Language** | TypeScript 5.7+ |
| **AI SDK** | Vercel AI SDK (Streaming & Tools) |
| **Database** | PostgreSQL (Neon) + Drizzle ORM |
| **Auth** | Better Auth (Secure & Lightweight) |
| **Memory** | Mem0 (User preferences & history) |
| **Search** | Exa.AI (Neural) + Tavily (Grounding) |
| **Styling** | Tailwind CSS 4.0 + Shadcn/UI |
| **Validation** | Zod (Schema validation) |
| **Deployment** | Vercel (Edge Runtime ready) |
| **Observability** | Vercel Analytics |
| **CI/CD** | GitHub Actions |

---

## 🏗 Project Structure

```
my-app/
├── app/
│   ├── api/              ← AI & Auth endpoints
│   ├── (dashboard)/      ← App interface
│   └── page.tsx          ← Landing page
├── components/           ← Shadcn/UI + Custom
├── lib/
│   ├── ai/               ← Vercel AI SDK config
│   ├── db/               ← Drizzle schema
│   └── auth/             ← Better Auth setup
├── drizzle/              ← Migrations
├── public/               ← Static assets
└── .env.local            ← Environment variables
```

---

## 🚀 Key Features

### 1. Vendor-Agnostic AI

**Change LLM in 1 line:**
```typescript
// lib/ai/config.ts
import { createOpenAI } from '@ai-sdk/openai';

// Switch providers effortlessly
export const ai = createOpenAI({
  baseURL: 'https://api.novita.ai/v3/openai', // or OpenAI/Anthropic URL
  apiKey: process.env.AI_API_KEY,
});
```

### 2. Intelligent Tool Calling

```typescript
// app/api/chat/route.ts
const result = await streamText({
  model: ai('gpt-4-turbo'),
  tools: {
    // Automatically called by LLM
    startFlightSearch: tool({
        description: 'Find flights',
        parameters: flightSchema,
        execute: async ({ from, to }) => findFlights(from, to),
    }),
  },
});
```

### 3. Server Actions (No API Boilerplate)

```typescript
// app/actions.ts
'use server';

export async function saveNote(content: string) {
  const session = await auth.api.getSession();
  await db.insert(notes).values({ 
    userId: session.user.id, 
    content 
  });
}
```

### 4. Built-in Everything

✅ Modern Auth (Better Auth)  
✅ AI Chat with Streaming  
✅ Persistent Memory (Mem0)  
✅ Vector Search Ready  
✅ Type-safe Database (Drizzle)  
✅ Smart Content Search (Exa)  
✅ Weather & Maps Integrations  
✅ Code Sandbox (Daytona)  
✅ Error Handling  
✅ Rate Limiting  
✅ Automatic Dark Mode  
✅ Mobile Responsive  

---

## 💻 Development Workflow

### Start Development (one command)

```bash
npm run dev

# Automatically starts:
# - Next.js dev server
# - Drizzle Studio (optional)
# - Path aliasing & HMR

# Outputs:
# App: http://localhost:3000
```

### Make First AI Call

```bash
curl -X POST http://localhost:3000/api/chat \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

### Database Management

```bash
# Push schema changes
npx drizzle-kit push

# View data
npx drizzle-kit studio
```

---

## 🔄 Migration Workflows

### Switch Database: Postgres → MySQL

```typescript
// lib/db/index.ts
// Change adapter
import { mysql2 } from 'drizzle-orm/mysql2';
export const db = drizzle(connection);
```

### Switch Auth: Better Auth → Clerk

```bash
# 1. Update .env
CLERK_SECRET_KEY=...

# 2. Update Middleware
# Middleware automatically handles protected routes
```

---

## 🎯 Real-World Examples

### Example 1: Chat Interface

```typescript
'use client';
import { useChat } from 'ai/react';

export function Chat() {
  const { messages, input, handleSubmit } = useChat();
  
  return (
    <div className="flex flex-col">
       {messages.map(m => <div key={m.id}>{m.content}</div>)}
       <form onSubmit={handleSubmit}>
         <input value={input} onChange={e => setInput(e.target.value)} />
       </form>
    </div>
  );
}
```

### Example 2: AI Weather Tool

```typescript
// Implicitly handled by Vercel AI SDK
// User: "What's the weather in Tokyo?"
// LLM: Calls getWeather({ location: 'Tokyo' })
// System: Returns "22°C, Clear"
// LLM: "It's currently 22°C and clear in Tokyo."
```

---

## 📊 Performance

- **Cold start:** <300ms (Edge)
- **Time to First Token:** <100ms
- **Database queries:** <20ms
- **Lighthouse Score:** 95+

---

## 🔐 Security Built-in

✅ HttpOnly Cookies  
✅ CSRF Protection  
✅ Zod Validation  
✅ Rate Limiting (Upstash)  
✅ SQL Injection Protection (Drizzle)  
✅ Secure Headers  

---

## 📋 CLI Commands

```bash
# Create new project
npx create-ai-stack-starter my-app

# Run development
npm run dev

# Manage Database
npm run db:push
npm run db:studio

# Build production
npm run build
npm start
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel deploy
# Done! Automatically configured
```

### Docker

```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
```

---

## 📚 Documentation Included

- **QUICKSTART.md** - 5-minute getting started
- **ARCHITECTURE.md** - Application flow
- **AI.md** - Prompt engineering & tools
- **DATABASE.md** - Schema & migrations
- **DEPLOYMENT.md** - Vercel guide

---

## ✅ What You Get (Day 1)

```
✅ Fully functional Next.js App
✅ AI Chat with Tools
✅ Search & Grounding
✅ Authentication System
✅ Database Connections
✅ Server Actions
✅ UI Component Library
✅ TypeScript Config
✅ SEO Optimization
✅ Production Security
✅ Complete Documentation
```

**Zero backend management. Pure React & AI.**

---

## 🎯 Why Choose This

| Feature | Next.js Full-Stack | Traditional Backend |
|---------|-------------------|---------------------|
| **Architecture** | 🚀 Monolith (Simpler) | 🏗️ Microservices |
| **Latency** | ⚡ Zero-hop Calls | 🐢 Network Overhead |
| **Types** | ✅ End-to-end Shared | ⚠️ Duplicated |
| **Deploy** | ✅ Single Command | ❌ Multiple Services |
| **Cost** | 💰 Serverless/Edge | 💸 Always-on VPS |
| **Maintenance** | ✅ Low | ⚠️ High |

---

## 🎬 Next Steps

1. **Create:** `npx create-ai-stack-starter my-app`
2. **Select:** Next.js Full-Stack
3. **Configure:** Add API Keys to `.env.local`
4. **Develop:** `npm run dev`
5. **Deploy:** `vercel deploy`

**That's it.** A unified, high-performance AI application. 🚀
