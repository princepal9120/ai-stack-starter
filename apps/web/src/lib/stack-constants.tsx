// AI Stack Builder Constants
// Based on actual AI Stack specs - unique features from ai-stack-nextjs-spec.md and ai-stack-fastapi-spec.md

import {
    SiNextdotjs,
    SiFastapi,
    SiOpenai,
    SiAnthropic,
    SiGoogle,
    SiPostgresql,
    SiSupabase,
    SiDrizzle,
    SiPrisma,
    SiSqlalchemy,
    SiRedis,
    SiPrometheus,
    SiDocker,
    SiKubernetes,
    SiPnpm,
    SiNpm,
    SiBun,
    SiGit,
    SiCelery,
    SiJsonwebtokens,
    SiAuth0,
    SiPython,
    SiPoetry,
    SiPypi,
    SiLangchain,
    SiClerk
} from "react-icons/si";
import { Terminal, Database, FileCode, Shield, Search, Brain, BarChart3, Box, Package, Globe, Cpu, Server, Link, Download, Filter, Workflow, Zap, Bot, Sparkles, Settings } from "lucide-react";
import type { IconType } from "react-icons";

export type TechCategory =
    | "architecture"
    | "agenticFramework"
    | "llmProvider"
    | "vectorDb"
    | "database"
    | "orm"
    | "auth"
    | "search"
    | "memory"
    | "observability"
    | "addons"
    | "packageManager"
    | "pyPackageManager"
    | "git"
    | "install";

export type TechOption = {
    id: string;
    name: string;
    description: string;
    icon?: string; // Optional - prefer iconComponent
    iconComponent?: React.ElementType; // React component for the icon
    color: string;
    default?: boolean;
    className?: string;
    badge?: "free" | "api-key" | "local" | "cloud";
};

export const TECH_OPTIONS: Record<TechCategory, TechOption[]> = {
    architecture: [
        {
            id: "nextjs-fullstack",
            name: "Next.js Full-Stack",
            description: "AI Command Center with Vercel AI SDK, single codebase",
            iconComponent: SiNextdotjs,
            color: "from-gray-700 to-black",
            default: true,
        },
        {
            id: "fastapi-nextjs",
            name: "FastAPI + Next.js",
            description: "Python backend with React frontend, RAG-focused monorepo",
            iconComponent: SiFastapi,
            color: "from-teal-500 to-teal-700",
        },
    ],
    agenticFramework: [
        {
            id: "vercel-ai-sdk",
            name: "Vercel AI SDK",
            description: "Streaming UI, tool calling, multi-provider support",
            iconComponent: Zap,
            color: "from-gray-700 to-black",
            default: true,
            badge: "free",
        },
        {
            id: "openai-sdk",
            name: "OpenAI SDK",
            description: "Direct OpenAI API with function calling",
            iconComponent: SiOpenai,
            color: "from-emerald-500 to-emerald-700",
            badge: "api-key",
        },
        {
            id: "langchain",
            name: "LangChain",
            description: "Composable chains for complex AI workflows",
            iconComponent: SiLangchain,
            color: "from-green-500 to-green-700",
            badge: "free",
        },
        {
            id: "langgraph",
            name: "LangGraph",
            description: "Stateful agents with cycles and branching",
            iconComponent: Workflow,
            color: "from-blue-500 to-blue-700",
            badge: "free",
        },
        {
            id: "crewai",
            name: "CrewAI",
            description: "Multi-agent orchestration framework",
            iconComponent: Bot,
            color: "from-purple-500 to-purple-700",
            badge: "free",
        },
    ],
    llmProvider: [
        {
            id: "novita",
            name: "Novita AI",
            description: "Primary provider with GPT-4 Turbo via OpenAI-compatible API",
            iconComponent: Brain, // No simple icon yet
            color: "from-purple-500 to-purple-700",
            default: true,
            badge: "api-key",
        },
        {
            id: "openai",
            name: "OpenAI",
            description: "GPT-4, GPT-3.5-turbo, embeddings",
            iconComponent: SiOpenai,
            color: "from-emerald-500 to-emerald-700",
            badge: "api-key",
        },
        {
            id: "anthropic",
            name: "Anthropic",
            description: "Claude 3.5, Claude 3 with longer context",
            iconComponent: SiAnthropic,
            color: "from-orange-400 to-orange-600",
            badge: "api-key",
        },
        {
            id: "gemini",
            name: "Google Gemini",
            description: "Multimodal AI with vision capabilities",
            iconComponent: SiGoogle,
            color: "from-blue-400 to-blue-600",
            badge: "api-key",
        },
        {
            id: "ollama",
            name: "Ollama",
            description: "Local open-source models, no API key needed",
            iconComponent: Terminal, // No simple icon
            color: "from-gray-500 to-gray-700",
            badge: "local",
        },
    ],
    vectorDb: [
        {
            id: "qdrant",
            name: "Qdrant",
            description: "Self-hosted, production-ready vector search",
            iconComponent: Database, // Fallback
            color: "from-red-400 to-red-600",
            default: true,
            badge: "local",
        },
        {
            id: "weaviate",
            name: "Weaviate",
            description: "Hybrid search with built-in ML models",
            iconComponent: Database, // Fallback
            color: "from-green-400 to-green-600",
            badge: "local",
        },
        {
            id: "pgvector",
            name: "pgvector",
            description: "PostgreSQL extension, simple setup",
            iconComponent: SiPostgresql,
            color: "from-blue-400 to-blue-600",
            badge: "cloud",
        },
        {
            id: "milvus",
            name: "Milvus",
            description: "Distributed, highly scalable for enterprise",
            iconComponent: Server, // Fallback
            color: "from-cyan-400 to-cyan-600",
            badge: "local",
        },
        {
            id: "none",
            name: "No Vector DB",
            description: "Skip vector database (no RAG)",
            icon: "",
            iconComponent: Box,
            color: "from-gray-400 to-gray-600",
        },
    ],
    database: [
        {
            id: "postgresql",
            name: "PostgreSQL",
            description: "Production database with pgvector support",
            iconComponent: SiPostgresql,
            color: "from-blue-500 to-blue-700",
            default: true,
            badge: "local",
        },
        {
            id: "neon",
            name: "Neon",
            description: "Serverless PostgreSQL with autoscaling",
            // iconComponent: SiNeon, // Might not exist in old versions
            iconComponent: Database,
            color: "from-green-400 to-green-600",
            badge: "cloud",
        },
        {
            id: "supabase",
            name: "Supabase",
            description: "PostgreSQL with realtime and auth built-in",
            iconComponent: SiSupabase,
            color: "from-emerald-400 to-emerald-600",
            badge: "cloud",
        },
    ],
    orm: [
        {
            id: "drizzle",
            name: "Drizzle ORM",
            description: "TypeScript-first ORM, lightweight and fast",
            iconComponent: SiDrizzle,
            color: "from-yellow-400 to-yellow-600",
            default: true,
        },
        {
            id: "prisma",
            name: "Prisma",
            description: "Type-safe ORM with schema-first design",
            iconComponent: SiPrisma,
            color: "from-indigo-500 to-indigo-700",
        },
        {
            id: "sqlalchemy",
            name: "SQLAlchemy 2.0",
            description: "Python ORM for FastAPI with Alembic migrations",
            iconComponent: SiSqlalchemy,
            color: "from-blue-500 to-blue-700",
        },
    ],
    auth: [
        {
            id: "better-auth",
            name: "Better Auth",
            description: "Modern TypeScript auth with email, OAuth2, passkeys",
            iconComponent: Shield,
            color: "from-green-400 to-green-600",
            default: true,
            badge: "free",
        },
        {
            id: "clerk",
            name: "Clerk",
            description: "Managed auth for TypeScript and Python",
            iconComponent: SiClerk,
            color: "from-purple-500 to-purple-700",
            badge: "cloud",
        },
        {
            id: "jwt",
            name: "JWT Auth",
            description: "Stateless JWT tokens for FastAPI backend",
            iconComponent: SiJsonwebtokens,
            color: "from-purple-400 to-purple-600",
            badge: "free",
        },
        {
            id: "custom",
            name: "Custom Auth",
            description: "Build your own authentication system",
            iconComponent: Settings,
            color: "from-slate-500 to-slate-700",
            badge: "free",
        },
        {
            id: "none",
            name: "No Auth",
            description: "Skip authentication setup",
            iconComponent: Box,
            color: "from-gray-400 to-gray-600",
        },
    ],
    search: [
        {
            id: "exa",
            name: "Exa.AI",
            description: "Neural web search with AI-powered relevance",
            iconComponent: Search,
            color: "from-blue-500 to-blue-700",
            default: true,
            badge: "api-key",
        },
        {
            id: "tavily",
            name: "Tavily",
            description: "Reddit and web grounding for AI responses",
            iconComponent: Globe,
            color: "from-purple-400 to-purple-600",
            badge: "api-key",
        },
        {
            id: "none",
            name: "No Web Search",
            description: "Skip external search integration",
            icon: "",
            iconComponent: Box,
            color: "from-gray-400 to-gray-600",
        },
    ],
    memory: [
        {
            id: "mem0",
            name: "Mem0",
            description: "Persistent conversation memory across sessions",
            iconComponent: Brain,
            color: "from-pink-500 to-pink-700",
            default: true,
            badge: "api-key",
        },
        {
            id: "redis",
            name: "Redis",
            description: "Session cache and conversation history",
            iconComponent: SiRedis,
            color: "from-red-500 to-red-700",
            badge: "local",
        },
        {
            id: "none",
            name: "No Memory",
            description: "Stateless conversations only",
            icon: "",
            iconComponent: Box,
            color: "from-gray-400 to-gray-600",
        },
    ],
    observability: [
        {
            id: "langfuse",
            name: "Langfuse",
            description: "LLM tracing, prompt logging, cost tracking",
            iconComponent: BarChart3,
            color: "from-indigo-500 to-indigo-700",
            default: true,
            badge: "cloud",
        },
        {
            id: "prometheus",
            name: "Prometheus + Grafana",
            description: "Metrics, CPU, memory, API latency",
            iconComponent: SiPrometheus,
            color: "from-orange-500 to-orange-700",
            badge: "local",
        },
        {
            id: "none",
            name: "No Observability",
            description: "Skip monitoring setup",
            icon: "",
            iconComponent: Box,
            color: "from-gray-400 to-gray-600",
        },
    ],
    addons: [
        {
            id: "daytona",
            name: "Daytona Code Sandbox",
            description: "Secure code execution in isolated environment",
            iconComponent: FileCode,
            color: "from-cyan-400 to-cyan-600",
            badge: "api-key",
        },
        {
            id: "streaming",
            name: "SSE Streaming",
            description: "Real-time token streaming for chat",
            icon: "",
            iconComponent: Cpu,
            color: "from-green-400 to-green-600",
            default: true,
        },
        {
            id: "celery",
            name: "Celery Workers",
            description: "Background jobs for document processing",
            iconComponent: SiCelery,
            color: "from-green-500 to-green-700",
        },
        {
            id: "reranking",
            name: "Cross-Encoder Reranking",
            description: "Improve RAG retrieval accuracy",
            icon: "",
            iconComponent: Filter,
            color: "from-purple-400 to-purple-600",
        },
        {
            id: "docker",
            name: "Docker Compose",
            description: "Local dev with Postgres, Redis, Qdrant",
            iconComponent: SiDocker,
            color: "from-blue-400 to-blue-600",
            default: true,
        },
        {
            id: "kubernetes",
            name: "Kubernetes Manifests",
            description: "Production K8s deployment configs",
            iconComponent: SiKubernetes,
            color: "from-blue-500 to-blue-700",
        },
    ],
    packageManager: [
        {
            id: "pnpm",
            name: "pnpm",
            description: "Fast, disk-efficient package manager",
            iconComponent: SiPnpm,
            color: "from-orange-400 to-orange-600",
            default: true,
        },
        {
            id: "npm",
            name: "npm",
            description: "Default Node.js package manager",
            iconComponent: SiNpm,
            color: "from-red-500 to-red-700",
        },
        {
            id: "bun",
            name: "bun",
            description: "All-in-one JavaScript toolkit",
            iconComponent: SiBun,
            color: "from-amber-400 to-amber-600",
        },
    ],
    pyPackageManager: [
        {
            id: "uv",
            name: "uv",
            description: "Extremely fast Python package manager",
            iconComponent: Zap,
            color: "from-purple-500 to-purple-700",
            default: true,
            badge: "free",
        },
        {
            id: "poetry",
            name: "Poetry",
            description: "Dependency management and packaging",
            iconComponent: SiPoetry,
            color: "from-blue-500 to-blue-700",
            badge: "free",
        },
        {
            id: "pip",
            name: "pip",
            description: "Standard Python package installer",
            iconComponent: SiPypi,
            color: "from-yellow-500 to-yellow-700",
            badge: "free",
        },
    ],
    git: [
        {
            id: "true",
            name: "Initialize Git",
            description: "Create Git repository with .gitignore",
            iconComponent: SiGit,
            color: "from-orange-500 to-orange-700",
            default: true,
        },
        {
            id: "false",
            name: "No Git",
            description: "Skip Git initialization",
            icon: "",
            iconComponent: Box,
            color: "from-gray-400 to-gray-600",
        },
    ],
    install: [
        {
            id: "true",
            name: "Install Dependencies",
            description: "Run package manager install",
            icon: "",
            iconComponent: Download,
            color: "from-green-400 to-green-600",
            default: true,
        },
        {
            id: "false",
            name: "Skip Install",
            description: "Don't install packages automatically",
            icon: "",
            iconComponent: Box,
            color: "from-yellow-400 to-yellow-600",
        },
    ],
};

// Category display order - AI Stack specific flow
export const CATEGORY_ORDER: TechCategory[] = [
    "architecture",
    "agenticFramework",
    "llmProvider",
    "vectorDb",
    "database",
    "orm",
    "auth",
    "search",
    "memory",
    "observability",
    "addons",
    "packageManager",
    "pyPackageManager",
    "git",
    "install",
];

// Category display names
export function getCategoryDisplayName(category: string): string {
    const names: Record<string, string> = {
        architecture: "Architecture",
        agenticFramework: "Agentic Framework",
        llmProvider: "LLM Provider",
        vectorDb: "Vector Database",
        database: "Database",
        orm: "ORM",
        auth: "Authentication",
        search: "Web Search",
        memory: "Memory/Cache",
        observability: "Observability",
        addons: "Add-ons",
        packageManager: "Package Manager",
        pyPackageManager: "Python Package Manager",
        git: "Git",
        install: "Dependencies",
    };
    return names[category] || category;
}

// Stack state type - AI Stack specific
export type StackState = {
    projectName: string;
    architecture: string;
    agenticFramework: string;
    llmProvider: string;
    vectorDb: string;
    database: string;
    orm: string;
    auth: string;
    search: string;
    memory: string;
    observability: string;
    addons: string[];
    packageManager: string;
    pyPackageManager: string;
    git: string;
    install: string;
};

// Default stack - production-ready AI Stack config (Next.js Full-Stack)
export const DEFAULT_STACK: StackState = {
    projectName: "my-ai-app",
    architecture: "nextjs-fullstack",
    agenticFramework: "vercel-ai-sdk",
    llmProvider: "novita",
    vectorDb: "qdrant",
    database: "postgresql",
    orm: "drizzle",
    auth: "better-auth",
    search: "exa",
    memory: "mem0",
    observability: "langfuse",
    addons: ["streaming", "docker"],
    packageManager: "pnpm",
    pyPackageManager: "uv",
    git: "true",
    install: "true",
};

// Architecture-specific defaults based on PRD specs
// Next.js: Vercel AI SDK, Drizzle, Better Auth, Exa, Mem0 (ai-stack-nextjs-spec.md)
// FastAPI: LangChain, SQLAlchemy, JWT, Qdrant, Celery (ai-stack-fastapi-spec.md)
export const ARCHITECTURE_DEFAULTS: Record<string, Partial<StackState>> = {
    "nextjs-fullstack": {
        agenticFramework: "vercel-ai-sdk",
        orm: "drizzle",
        auth: "better-auth",
        search: "exa",
        memory: "mem0",
        observability: "langfuse",
        addons: ["streaming", "docker"],
    },
    "fastapi-nextjs": {
        agenticFramework: "langchain",
        orm: "sqlalchemy",
        auth: "jwt",
        search: "none",
        memory: "redis",
        observability: "langfuse",
        addons: ["streaming", "docker", "celery"],
    },
};

// Get default value for a category based on architecture
export function getDefaultForArchitecture(
    architecture: string,
    category: keyof StackState
): string | string[] | undefined {
    const archDefaults = ARCHITECTURE_DEFAULTS[architecture];
    if (archDefaults && category in archDefaults) {
        return archDefaults[category as keyof typeof archDefaults];
    }
    return undefined;
}

// Preset templates - Real AI Stack use cases
export const PRESET_TEMPLATES = [
    {
        id: "ai-command-center",
        name: "AI Command Center",
        description: "Full-stack Next.js with all integrations (Exa, Tavily, Mem0, Daytona)",
        stack: {
            ...DEFAULT_STACK,
            projectName: "ai-command-center",
            search: "exa",
            addons: ["streaming", "docker", "daytona"],
        },
    },
    {
        id: "rag-chatbot",
        name: "RAG Chatbot",
        description: "FastAPI + Next.js with Qdrant for document Q&A",
        stack: {
            ...DEFAULT_STACK,
            projectName: "rag-chatbot",
            architecture: "fastapi-nextjs",
            orm: "sqlalchemy",
            vectorDb: "qdrant",
            auth: "jwt",
            addons: ["streaming", "docker", "celery", "reranking"],
        },
    },
    {
        id: "local-ai",
        name: "Local AI (No API Keys)",
        description: "Ollama + pgvector for fully local development",
        stack: {
            ...DEFAULT_STACK,
            projectName: "local-ai-app",
            llmProvider: "ollama",
            vectorDb: "pgvector",
            search: "none",
            memory: "redis",
            observability: "prometheus",
            addons: ["streaming", "docker"],
        },
    },
    {
        id: "enterprise",
        name: "Enterprise Production",
        description: "FastAPI + Anthropic + Weaviate with full observability",
        stack: {
            ...DEFAULT_STACK,
            projectName: "enterprise-ai",
            architecture: "fastapi-nextjs",
            llmProvider: "anthropic",
            vectorDb: "weaviate",
            database: "neon",
            orm: "sqlalchemy",
            auth: "oauth2",
            observability: "langfuse",
            addons: ["streaming", "docker", "kubernetes", "celery", "reranking"],
        },
    },
    {
        id: "minimal",
        name: "Minimal Starter",
        description: "Just Next.js + OpenAI, no extras",
        stack: {
            projectName: "minimal-ai",
            architecture: "nextjs-fullstack",
            llmProvider: "openai",
            vectorDb: "none",
            database: "postgresql",
            orm: "drizzle",
            auth: "none",
            search: "none",
            memory: "none",
            observability: "none",
            addons: ["streaming"],
            packageManager: "pnpm",
            git: "true",
            install: "true",
        },
    },
];
