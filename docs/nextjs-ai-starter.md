# Next.js Full-Stack AI Starter Kit

**One-click command to scaffold your AI Command Center.**

---

## 🚀 Quick Start

Initialize the project with `create-next-app` and add the necessary dependencies.

### 1. Create Project
```bash
npx create-next-app@latest ai-command-center --typescript --tailwind --eslint
cd ai-command-center
```

### 2. Install Dependencies
```bash
# UI & Icons
npm install lucide-react clsx tailwind-merge framer-motion

# Shadcn UI (init first)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card dialog scroll-area avatar dropdown-menu

# AI & Search
npm install ai @ai-sdk/openai exa-js @tavily/core mem0ai

# Database & Auth
npm install better-auth drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# External APIs
npm install @react-google-maps/api axios zod
```

### 3. Folder Structure & Key Files

Create these files to get started immediately.

#### A. Environment Setup (`.env.local`)
```env
# Database (Neon/Postgres)
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# AI & Search
NOVITA_API_KEY=your_novita_key
EXA_API_KEY=your_exa_key
TAVILY_API_KEY=your_tavily_key
MEM0_API_KEY=your_mem0_key

# APIs
OPENWEATHER_API_KEY=your_weather_key
AVIATION_STACK_KEY=your_aviation_key
TMDB_API_KEY=your_tmdb_key
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_maps_key
DAYTONA_API_KEY=your_daytona_key

# Auth (Better Auth)
BETTER_AUTH_SECRET=your_generated_secret
```

#### B. Database Schema (`lib/db/schema.ts`)
```typescript
import { pgTable, text, serial, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const memories = pgTable('memories', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  content: text('content'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

#### C. AI Action (`app/api/chat/route.ts`)
```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { exaSearch } from '@/lib/search/exa';
import { getWeather } from '@/lib/apis/weather';

const novita = createOpenAI({
  apiKey: process.env.NOVITA_API_KEY,
  baseURL: 'https://api.novita.ai/v3/openai',
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: novita('gpt-4-turbo'),
    messages,
    tools: {
      search: tool({
        description: 'Search the web for information',
        parameters: z.object({ query: z.string() }),
        execute: async ({ query }) => exaSearch(query),
      }),
      weather: tool({
        description: 'Get concise weather info',
        parameters: z.object({ location: z.string() }),
        execute: async ({ location }) => getWeather(location),
      }),
    },
  });

  return result.toDataStreamResponse();
}
```

#### D. Main UI (`app/page.tsx`)
```typescript
'use client';

import { useChat } from 'ai/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 bg-background">
      <Card className="flex-1 mb-4 p-4 overflow-hidden border-border/50">
        <ScrollArea className="h-full">
          {messages.map(m => (
            <div key={m.id} className={`mb-4 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-[80%] ${
                m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {m.content}
                {m.toolInvocations?.map(tool => (
                  <div key={tool.toolCallId} className="mt-2 text-xs bg-background/50 p-2 rounded border">
                    🔧 {tool.toolName}: {JSON.stringify(tool.args)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input 
          value={input} 
          onChange={handleInputChange} 
          placeholder="Ask about weather, flights, code..." 
          className="flex-1"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
```

#### E. Utility Libraries (`lib/`)
Create separate files for each API client under `lib/apis/`, `lib/search/`, etc., following the specification document.

---

## 📦 Deployment

1. Push to GitHub
2. Import to Vercel
3. Add Environment Variables
4. Deploy!

You now have a production-ready AI Command Center foundation. 🚀
