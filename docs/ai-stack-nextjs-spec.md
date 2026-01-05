# Next.js Full-Stack AI Application - Complete Specification

**Production-grade AI-powered application with Next.js, Vercel AI SDK, and 15+ integrations**

---

## 🎯 What You're Building

**AI Command Center** - A unified full-stack AI application that combines:
- 🤖 **AI Chat** (Vercel AI SDK + Novita AI)
- 🔍 **Intelligent Search** (Exa.AI + Tavily)
- 🌦️ **Weather Intelligence**
- ✈️ **Flight Tracking**
- 🎬 **Entertainment Discovery** (TMDB)
- 🗺️ **Location Services** (Google Maps)
- 💻 **Code Execution** (Daytona sandbox)
- 🧠 **Persistent Memory** (Mem0)
- 🔐 **Secure Auth** (Better Auth)
- 💾 **Type-safe Database** (Drizzle ORM)

**All in a single Next.js application** - No separate backend required.

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Next.js App                        │
│  (Frontend + Backend in one codebase)               │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────┐  ┌────────────────┐            │
│  │  React Pages   │  │  API Routes    │            │
│  │  (App Router)  │  │  /api/chat     │            │
│  │                │  │  /api/search   │            │
│  │  • Chat UI     │  │  /api/weather  │            │
│  │  • Dashboard   │  │  /api/flights  │            │
│  │  • Search      │  │  /api/code     │            │
│  └────────────────┘  └────────────────┘            │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │         Server Components / Actions           │  │
│  │  • Database queries (Drizzle)                │  │
│  │  • Auth checks (Better Auth)                 │  │
│  │  • Memory management (Mem0)                  │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
           │              │              │
           ▼              ▼              ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐
    │ PostgreSQL│  │   Redis   │  │  Vercel   │
    │ (Drizzle) │  │  (Cache)  │  │   Edge    │
    └───────────┘  └───────────┘  └───────────┘
           │
           ▼
    External APIs:
    • Vercel AI SDK (LLMs)
    • Exa.AI (Search)
    • Tavily (Grounding)
    • OpenWeather
    • Aviation Stack
    • TMDB
    • Google Maps
    • Daytona
    • Mem0
    • Novita AI
```

---

## 📦 Complete Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15+ (App Router, React 19) |
| **Language** | TypeScript 5.7+ |
| **Styling** | Tailwind CSS 4.0 |
| **UI Components** | Shadcn/UI (Radix UI primitives) |
| **AI Integration** | Vercel AI SDK 4.0 |
| **AI Inference** | Novita AI + OpenAI (fallback) |
| **Search** | Exa.AI (web search), Tavily (Reddit grounding) |
| **Memory** | Mem0 (conversation memory) |
| **Database** | PostgreSQL 16 + Drizzle ORM |
| **Auth** | Better Auth (email, OAuth2, passkeys) |
| **Cache** | Redis (Upstash) |
| **Weather** | OpenWeather API |
| **Flights** | Aviation Stack API |
| **Movies/TV** | TMDB API |
| **Maps** | Google Maps JavaScript API |
| **Code Sandbox** | Daytona |
| **Deployment** | Vercel (Edge Runtime) |
| **Monitoring** | Vercel Analytics + Sentry |

---

## 🗂 Project Structure

```
ai-command-center/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx                # Auth layout
│   ├── (dashboard)/
│   │   ├── page.tsx                  # Main dashboard
│   │   ├── chat/
│   │   │   └── page.tsx              # AI chat interface
│   │   ├── search/
│   │   │   └── page.tsx              # Intelligent search
│   │   ├── weather/
│   │   │   └── page.tsx              # Weather dashboard
│   │   ├── flights/
│   │   │   └── page.tsx              # Flight tracker
│   │   ├── movies/
│   │   │   └── page.tsx              # TMDB explorer
│   │   ├── code/
│   │   │   └── page.tsx              # Code sandbox
│   │   └── layout.tsx                # Dashboard layout
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts              # AI chat endpoint (SSE)
│   │   ├── search/
│   │   │   ├── exa/route.ts          # Exa.AI search
│   │   │   └── tavily/route.ts       # Tavily Reddit search
│   │   ├── weather/
│   │   │   └── route.ts              # OpenWeather proxy
│   │   ├── flights/
│   │   │   └── route.ts              # Aviation Stack proxy
│   │   ├── movies/
│   │   │   └── route.ts              # TMDB proxy
│   │   ├── code/
│   │   │   └── execute/route.ts      # Daytona execution
│   │   ├── memory/
│   │   │   ├── add/route.ts          # Add to Mem0
│   │   │   └── search/route.ts       # Search Mem0
│   │   └── auth/
│   │       └── [...all]/route.ts     # Better Auth routes
│   ├── globals.css
│   └── layout.tsx                    # Root layout
│
├── components/
│   ├── ui/                            # Shadcn/UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── chat/
│   │   ├── chat-interface.tsx        # Main chat UI
│   │   ├── message-list.tsx
│   │   ├── message-bubble.tsx
│   │   └── input-box.tsx
│   ├── search/
│   │   ├── search-bar.tsx
│   │   ├── search-results.tsx
│   │   └── result-card.tsx
│   ├── weather/
│   │   ├── weather-card.tsx
│   │   ├── forecast-chart.tsx
│   │   └── location-selector.tsx
│   ├── flights/
│   │   ├── flight-card.tsx
│   │   └── flight-tracker.tsx
│   ├── movies/
│   │   ├── movie-card.tsx
│   │   └── movie-details.tsx
│   ├── code/
│   │   ├── code-editor.tsx
│   │   └── execution-result.tsx
│   └── shared/
│       ├── navbar.tsx
│       ├── sidebar.tsx
│       └── loading.tsx
│
├── lib/
│   ├── ai/
│   │   ├── vercel-ai.ts              # Vercel AI SDK config
│   │   ├── novita.ts                 # Novita AI client
│   │   ├── prompt-templates.ts
│   │   └── tools.ts                  # AI function tools
│   ├── search/
│   │   ├── exa.ts                    # Exa.AI client
│   │   └── tavily.ts                 # Tavily client
│   ├── memory/
│   │   └── mem0.ts                   # Mem0 client
│   ├── apis/
│   │   ├── weather.ts                # OpenWeather client
│   │   ├── aviation.ts               # Aviation Stack client
│   │   ├── tmdb.ts                   # TMDB client
│   │   ├── maps.ts                   # Google Maps client
│   │   └── daytona.ts                # Daytona client
│   ├── db/
│   │   ├── index.ts                  # Drizzle instance
│   │   ├── schema.ts                 # Database schema
│   │   └── migrations/
│   ├── auth/
│   │   └── better-auth.ts            # Better Auth config
│   ├── redis.ts                      # Redis client (Upstash)
│   └── utils.ts                      # Utility functions
│
├── drizzle/
│   ├── migrations/
│   └── schema.sql
│
├── public/
│   └── assets/
│
├── .env.local
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── components.json                   # Shadcn/UI config
├── drizzle.config.ts
└── next.config.mjs
```

---

## 🔌 Integration Details

### 1. Vercel AI SDK + Novita AI

**Purpose**: Core AI chat functionality with streaming responses

```typescript
// lib/ai/vercel-ai.ts
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const novita = createOpenAI({
  apiKey: process.env.NOVITA_API_KEY,
  baseURL: 'https://api.novita.ai/v3/openai',
});

export async function generateChatResponse(messages: Message[]) {
  const result = await streamText({
    model: novita('gpt-4-turbo'),
    messages,
    tools: {
      searchWeb: {
        description: 'Search the web using Exa.AI',
        parameters: z.object({ query: z.string() }),
        execute: async ({ query }) => searchExa(query),
      },
      getWeather: {
        description: 'Get current weather',
        parameters: z.object({ location: z.string() }),
        execute: async ({ location }) => getWeather(location),
      },
      // ... more tools
    },
  });

  return result.toAIStreamResponse();
}
```

**API Route**:
```typescript
// app/api/chat/route.ts
import { generateChatResponse } from '@/lib/ai/vercel-ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  return generateChatResponse(messages);
}
```

**Frontend**:
```typescript
// components/chat/chat-interface.tsx
'use client';
import { useChat } from 'ai/react';

export function ChatInterface() {
  const { messages, input, handleSubmit, handleInputChange } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col h-screen">
      <MessageList messages={messages} />
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

---

### 2. Exa.AI - Web Search

**Purpose**: Intelligent web search with AI-powered relevance

```typescript
// lib/search/exa.ts
import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY);

export async function searchExa(query: string) {
  const result = await exa.searchAndContents(query, {
    type: 'neural',
    useAutoprompt: true,
    numResults: 10,
    text: true,
  });

  return result.results.map(r => ({
    title: r.title,
    url: r.url,
    snippet: r.text,
    publishedDate: r.publishedDate,
  }));
}
```

---

### 3. Tavily - Reddit Search Grounding

**Purpose**: Ground AI responses with Reddit discussions

```typescript
// lib/search/tavily.ts
import { tavily } from '@tavily/core';

const client = tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function searchReddit(query: string) {
  const response = await client.search(query, {
    searchDepth: 'advanced',
    includeRawContent: true,
    includeDomains: ['reddit.com'],
  });

  return response.results;
}
```

---

### 4. Mem0 - Memory Management

**Purpose**: Persistent conversation memory across sessions

```typescript
// lib/memory/mem0.ts
import { MemoryClient } from 'mem0ai';

const memory = new MemoryClient(process.env.MEM0_API_KEY);

export async function addMemory(userId: string, messages: Message[]) {
  await memory.add(messages, {
    user_id: userId,
    metadata: { timestamp: Date.now() },
  });
}

export async function searchMemory(userId: string, query: string) {
  const memories = await memory.search(query, {
    user_id: userId,
    limit: 5,
  });

  return memories;
}
```

---

### 5. Better Auth - Authentication

**Purpose**: Secure, modern authentication

```typescript
// lib/auth/better-auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      client Secret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

---

### 6. Drizzle ORM - Database

**Purpose**: Type-safe database operations

```typescript
// lib/db/schema.ts
import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  title: text('title'),
  messages: jsonb('messages').$type<Message[]>(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const searches = pgTable('searches', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  query: text('query').notNull(),
  results: jsonb('results'),
  source: text('source'), // 'exa' | 'tavily'
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Usage**:
```typescript
// Server action
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema';

export async function saveConversation(userId: number, messages: Message[]) {
  await db.insert(conversations).values({
    userId,
    title: messages[0].content.slice(0, 50),
    messages,
  });
}
```

---

### 7. OpenWeather API

```typescript
// lib/apis/weather.ts
export async function getWeather(location: string) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
  );

  const data = await response.json();

  return {
    temp: data.main.temp,
    humidity: data.main.humidity,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
  };
}
```

---

### 8. Aviation Stack - Flight Tracking

```typescript
// lib/apis/aviation.ts
export async function getFlightInfo(flightNumber: string) {
  const response = await fetch(
    `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATION_STACK_KEY}&flight_iata=${flightNumber}`
  );

  const data = await response.json();

  return data.data[0]; // Flight details
}
```

---

### 9. TMDB - Movies/TV

```typescript
// lib/apis/tmdb.ts
export async function searchMovies(query: string) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}`
  );

  const data = await response.json();

  return data.results;
}
```

---

### 10. Google Maps

```typescript
// components/shared/map.tsx
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

export function Map({ lat, lng }: { lat: number; lng: number }) {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!}>
      <GoogleMap
        center={{ lat, lng }}
        zoom={12}
        mapContainerStyle={{ width: '100%', height: '400px' }}
      >
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </LoadScript>
  );
}
```

---

### 11. Daytona - Code Execution

```typescript
// lib/apis/daytona.ts
export async function executeCode(code: string, language: string) {
  const response = await fetch('https://api.daytona.io/workspaces/execute', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DAYTONA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, language }),
  });

  const result = await response.json();

  return {
    output: result.stdout,
    error: result.stderr,
    executionTime: result.time,
  };
}
```

---

## 🎨 Key Features

### 1. AI Chat Dashboard
- Streaming responses with Vercel AI SDK
- Function calling (weather, search, flights, etc.)
- Persistent memory with Mem0
- Code execution inline

### 2. Intelligent Search
- Web search (Exa.AI)
- Reddit grounding (Tavily)
- Search history saved to database

### 3. Weather Intelligence
- Current weather + 7-day forecast
- Location-based with Google Maps
- Weather alerts

### 4. Flight Tracker
- Real-time flight status
- Flight route visualization
- Delay predictions

### 5. Entertainment Discovery
- Movie/TV search (TMDB)
- AI-powered recommendations
- Watch history

### 6. Code Sandbox
- Multi-language support
- Secure execution (Daytona)
- Syntax highlighting

---

## 🚀 Implementation Plan

### Phase 1: Foundation (Week 1)
- [x] Next.js 15 setup with App Router
- [ ] Tailwind CSS + Shadcn/UI installation
- [ ] Better Auth setup
- [ ] Drizzle ORM + PostgreSQL
- [ ] Environment variables configuration

### Phase 2: Core AI (Week 2)
- [ ] Vercel AI SDK integration
- [ ] Novita AI setup
- [ ] Chat interface (streaming)
- [ ] Mem0 memory integration

### Phase 3: Search & Discovery (Week 3)
- [ ] Exa.AI integration
- [ ] Tavily Reddit search
- [ ] Search results UI
- [ ] TMDB movie search

### Phase 4: External APIs (Week 4)
- [ ] OpenWeather integration
- [ ] Aviation Stack flights
- [ ] Google Maps
- [ ] Daytona code execution

### Phase 5: Polish & Deploy (Week 5)
- [ ] Dashboard UI
- [ ] Analytics
- [ ] Error handling
- [ ] Deploy to Vercel

---

## 📝 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
BETTER_AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# AI
NOVITA_API_KEY=...
OPENAI_API_KEY=...  # Fallback
MEM0_API_KEY=...

# Search
EXA_API_KEY=...
TAVILY_API_KEY=...

# External APIs
OPENWEATHER_API_KEY=...
AVIATION_STACK_KEY=...
TMDB_API_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_KEY=...
DAYTONA_API_KEY=...
```

---

## ✅ Advantages of Next.js Full-Stack

| Benefit | Description |
|---------|-------------|
| **Unified Codebase** | Frontend + backend in one repo |
| **Type Safety** | Shared types between client/server |
| **Edge Runtime** | Deploy API routes to Vercel Edge |
| **Server Components** | Zero client JS for static content |
| **Server Actions** | Type-safe mutations |
| **Optimal Performance** | Automatic code splitting, ISR, SSR |
| **Developer Experience** | Hot reload for both frontend + backend |

---

## 🎬 Next Steps

1. Initialize Next.js project
2. Install all dependencies
3. Set up database schema
4. Implement authentication
5. Build AI chat (core feature)
6. Add integrations one by one
7. Deploy to Vercel

**This is a complete, production-ready full-stack AI application in a single Next.js codebase. 🚀**
