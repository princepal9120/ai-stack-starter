import { VirtualFileSystem, type VirtualFileTree } from "./virtual-fs";
import type { StackState } from "./stack-constants";

export async function generateVirtualProject(stack: StackState): Promise<VirtualFileTree> {
    const vfs = new VirtualFileSystem();

    // 1. Core Config Files
    vfs.write("package.json", generatePackageJson(stack));
    vfs.write("README.md", generateReadme(stack));
    vfs.write(".env.example", generateEnv(stack));
    vfs.write(".gitignore", generateGitignore(stack));
    vfs.write("tsconfig.json", generateTsConfig(stack));

    // 2. App Structure based on Architecture
    if (stack.architecture === "nextjs-fullstack") {
        // Next.js App Router Structure
        vfs.write("next.config.mjs", `/** @type {import('next').NextConfig} */\nconst nextConfig = {};\n\nexport default nextConfig;`);
        vfs.write("tailwind.config.ts", generateTailwindConfig(stack));
        vfs.write("postcss.config.js", "module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};");

        // App Directory
        vfs.write("app/layout.tsx", generateRootLayout(stack));
        vfs.write("app/page.tsx", generateHomePage(stack));
        vfs.write("app/globals.css", generateGlobalsCss(stack));

        // API Routes
        vfs.write("app/api/chat/route.ts", generateChatRoute(stack));

        // Components
        vfs.write("components/chat-interface.tsx", generateChatComponent(stack));
        vfs.write("components/ui/button.tsx", "// Shadcn Button component\nexport { Button } from './button';");

        // Lib
        vfs.write("lib/utils.ts", "import { clsx, type ClassValue } from 'clsx';\nimport { twMerge } from 'tailwind-merge';\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}");

        if (stack.llmProvider !== "none") {
            vfs.write("lib/ai/config.ts", generateAiConfig(stack));
        }

        if (stack.database !== "none") {
            vfs.write("lib/db/schema.ts", generateDbSchema(stack));
            vfs.write("lib/db/index.ts", generateDbConnect(stack));
            vfs.write("drizzle.config.ts", generateDrizzleConfig(stack));
        }

        if (stack.auth !== "none") {
            vfs.write("lib/auth.ts", generateAuthConfig(stack));
        }

    } else if (stack.architecture === "fastapi-nextjs") {
        // FastAPI + Next.js Monorepo Structure
        vfs.write("turbo.json", JSON.stringify({ pipeline: { build: { outputs: ["dist/**", ".next/**"] } } }, null, 2));

        // Backend (FastAPI)
        const be = "apps/backend";
        vfs.write(`${be}/pyproject.toml`, generatePythonConfig(stack));
        vfs.write(`${be}/app/main.py`, generateFastApiMain(stack));
        vfs.write(`${be}/app/api/v1/chat.py`, generateFastApiChat(stack));
        vfs.write(`${be}/app/core/config.py`, generateFastApiConfig(stack));
        vfs.write(`${be}/Dockerfile`, "FROM python:3.11-slim\nWORKDIR /app\nCOPY . .\nRUN pip install -e .\nCMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\"]");

        // Frontend (Next.js)
        const fe = "apps/frontend";
        vfs.write(`${fe}/package.json`, generatePackageJson({ ...stack, projectName: "frontend" }));
        vfs.write(`${fe}/app/page.tsx`, generateHomePage(stack));
    }

    return vfs.getTree();
}

// --- Generators ---

function generatePackageJson(stack: StackState) {
    const deps: Record<string, string> = {
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "next": "15.1.0",
        "clsx": "^2.1.1",
        "tailwind-merge": "^2.3.0",
        "lucide-react": "^0.378.0",
    };

    if (stack.llmProvider !== "none") deps["ai"] = "^3.1.14";
    if (stack.llmProvider === "openai" || stack.llmProvider === "novita") deps["@ai-sdk/openai"] = "^0.0.14";
    if (stack.llmProvider === "anthropic") deps["@ai-sdk/anthropic"] = "^0.0.15";
    if (stack.llmProvider === "ollama") deps["ollama"] = "^0.5.0";

    if (stack.orm === "drizzle") {
        deps["drizzle-orm"] = "^0.30.10";
        deps["drizzle-kit"] = "^0.20.17";
        deps["postgres"] = "^3.4.4";
    }

    if (stack.auth === "better-auth") {
        deps["better-auth"] = "^0.5.0";
    }

    return JSON.stringify({
        name: stack.projectName,
        version: "0.1.0",
        private: true,
        scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
            lint: "next lint"
        },
        dependencies: deps,
        devDependencies: {
            "typescript": "^5",
            "@types/node": "^20",
            "@types/react": "^19",
            "@types/react-dom": "^19",
            "postcss": "^8",
            "tailwindcss": "^3.4.1"
        }
    }, null, 2);
}

function generateReadme(stack: StackState) {
    return `# ${stack.projectName}

Built with **AI Stack** 🚀

## Stack
- **Architecture**: ${stack.architecture}
- **LLM**: ${stack.llmProvider}
- **Vector DB**: ${stack.vectorDb}
- **Database**: ${stack.database}
- **Auth**: ${stack.auth}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   ${stack.packageManager} install
   \`\`\`

2. Run development server:
   \`\`\`bash
   ${stack.packageManager} run dev
   \`\`\`
`;
}

function generateEnv(stack: StackState) {
    let env = "";
    if (stack.database !== "none") env += "DATABASE_URL=\"postgresql://user:pass@localhost:5432/db\"\n";
    if (stack.llmProvider === "openai") env += "OPENAI_API_KEY=\"sk-...\"\n";
    if (stack.llmProvider === "novita") env += "NOVITA_API_KEY=\"...\"\n"; // Uses OpenAI compatibility
    if (stack.llmProvider === "anthropic") env += "ANTHROPIC_API_KEY=\"sk-ant-...\"\n";
    if (stack.auth !== "none") env += "BETTER_AUTH_SECRET=\"...\"\n";
    if (stack.search === "exa") env += "EXA_API_KEY=\"...\"\n";
    if (stack.search === "tavily") env += "TAVILY_API_KEY=\"...\"\n";
    return env;
}

function generateGitignore(stack: StackState) {
    return `node_modules
.next
.env
dist
build
.DS_Store
`;
}

function generateTsConfig(stack: StackState) {
    return JSON.stringify({
        compilerOptions: {
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            plugins: [{ name: "next" }],
            paths: {
                "@/*": ["./*"]
            }
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"]
    }, null, 2);
}

function generateTailwindConfig(stack: StackState) {
    return `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;`;
}

function generateGlobalsCss(stack: StackState) {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
}`;
}

function generateRootLayout(stack: StackState) {
    return `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "${stack.projectName}",
  description: "Generated by AI Stack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`;
}

function generateHomePage(stack: StackState) {
    return `import { ChatInterface } from "@/components/chat-interface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p>
      </div>

      <div className="relative flex place-items-center">
        <h1 className="text-4xl font-bold tracking-tight">
          ${stack.projectName}
        </h1>
      </div>

      <div className="w-full max-w-2xl mt-8">
        <ChatInterface />
      </div>
    </main>
  );
}`;
}

function generateAiConfig(stack: StackState) {
    const providerImport =
        stack.llmProvider === "openai" ? "createOpenAI" :
            stack.llmProvider === "novita" ? "createOpenAI" :
                stack.llmProvider === "anthropic" ? "createAnthropic" :
                    "createOpenAI";

    const lib =
        stack.llmProvider === "anthropic" ? "@ai-sdk/anthropic" : "@ai-sdk/openai";

    const config =
        stack.llmProvider === "novita"
            ? `  baseURL: "https://api.novita.ai/v3/openai",\n  apiKey: process.env.NOVITA_API_KEY,`
            : `  apiKey: process.env.${stack.llmProvider.toUpperCase()}_API_KEY,`;

    return `import { ${providerImport} } from "${lib}";

export const aiProvider = ${providerImport}({
${config}
});
`;
}

function generateChatRoute(stack: StackState) {
    return `import { aiProvider } from "@/lib/ai/config";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: aiProvider("gpt-4-turbo"),
    messages,
  });

  return result.toAIStreamResponse();
}`;
}

function generateChatComponent(stack: StackState) {
    return `"use client";

import { useChat } from "ai/react";
import { Button } from "./ui/button";

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8 border border-gray-300 rounded shadow-xl">
        <input
          className="w-full p-2"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}`;
}

function generateDbSchema(stack: StackState) {
    return `import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
`;
}

function generateDbConnect(stack: StackState) {
    return `import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);
`;
}

function generateDrizzleConfig(stack: StackState) {
    return `import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;`;
}

function generateAuthConfig(stack: StackState) {
    return `import { betterAuth } from "better-auth";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true
  }
});`;
}

function generatePythonConfig(stack: StackState) {
    return `[project]
name = "${stack.projectName}-backend"
version = "0.1.0"
description = "FastAPI backend for AI Stack"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.110.0",
    "uvicorn>=0.27.0",
    "sqlalchemy>=2.0.27",
    "pydantic>=2.6.1",
    "openai>=1.12.0",
]
`;
}

function generateFastApiMain(stack: StackState) {
    return `from fastapi import FastAPI
from app.api.v1 import chat

app = FastAPI(title="${stack.projectName}")

app.include_router(chat.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to AI Stack API"}
`;
}

function generateFastApiChat(stack: StackState) {
    return `from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat(request: ChatRequest):
    return {"response": f"Echo: {request.message}"}
`;
}

function generateFastApiConfig(stack: StackState) {
    return `from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "${stack.projectName}"
    API_V1_STR: str = "/api/v1"
    
    class Config:
        env_file = ".env"

settings = Settings()
`;
}
