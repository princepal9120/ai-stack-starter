import type { SearchItem } from "./search";

// Static search index - generated from documentation pages
// This is used by the SearchModal component for fuzzy search
export const searchData: SearchItem[] = [
    // Getting Started
    {
        id: "docs-index",
        title: "Introduction to AI Stack",
        description: "Full-stack AI development boilerplate with Next.js, TypeScript, and modern tooling",
        content: "AI Stack is a production-ready boilerplate for building AI-powered applications. It provides a complete foundation with authentication, database, vector storage, and LLM integrations out of the box.",
        section: "docs",
        url: "/docs",
        headings: ["What is AI Stack?", "Key Features", "Getting Started"],
    },
    {
        id: "docs-quickstart",
        title: "Quick Start",
        description: "Get started with AI Stack in under 5 minutes",
        content: "npx create-ai-stack-starter my-app. Install dependencies. Configure environment variables. Start development server. Create your first AI endpoint.",
        section: "docs",
        url: "/docs/quickstart",
        headings: ["Installation", "Configuration", "First Steps", "Development"],
    },
    {
        id: "docs-installation",
        title: "Installation Guide",
        description: "Detailed installation instructions for AI Stack",
        content: "Prerequisites Node.js 18+ recommended. Package manager npm pnpm yarn. Database PostgreSQL SQLite. Installation steps create project install dependencies configure environment.",
        section: "docs",
        url: "/docs/installation",
        headings: ["Prerequisites", "Installation Steps", "Configuration", "Troubleshooting"],
    },
    {
        id: "docs-architecture",
        title: "Architecture Overview",
        description: "Understanding the AI Stack project architecture",
        content: "Monorepo structure apps packages shared. Frontend Next.js React TypeScript. Backend API routes server actions. Database Drizzle ORM migrations. Authentication Better Auth sessions.",
        section: "docs",
        url: "/docs/architecture",
        headings: ["Monorepo Structure", "Frontend", "Backend", "Database", "Authentication"],
    },
    {
        id: "docs-project-structure",
        title: "Project Structure",
        description: "Explore the file and folder structure of AI Stack projects",
        content: "src app pages layouts components lib utils hooks. Database schema migrations seeds. Configuration eslint prettier tsconfig. Environment variables .env.local .env.example.",
        section: "docs",
        url: "/docs/project-structure",
        headings: ["Directory Layout", "App Router", "Components", "Configuration"],
    },

    // Guides
    {
        id: "guides-index",
        title: "Guides Overview",
        description: "In-depth guides for AI Stack features",
        content: "Learn how to use AI Stack features in depth. LLM providers RAG pipeline vector databases deployment authentication database.",
        section: "guides",
        url: "/docs/guides",
        headings: ["Available Guides", "LLM Integration", "RAG Pipeline", "Deployment"],
    },
    {
        id: "guides-llm-providers",
        title: "LLM Providers",
        description: "Configure and use different LLM providers",
        content: "OpenAI GPT-4 GPT-3.5. Anthropic Claude 3 Opus Sonnet Haiku. Ollama local models Llama Mistral. Streaming responses. Function calling. Embeddings. API keys configuration.",
        section: "guides",
        url: "/docs/guides/llm-providers",
        headings: ["OpenAI", "Anthropic", "Ollama", "Streaming", "Function Calling", "Embeddings"],
    },
    {
        id: "guides-rag-pipeline",
        title: "RAG Pipeline",
        description: "Build retrieval-augmented generation pipelines",
        content: "Document ingestion chunking embeddings. Vector storage Qdrant Pinecone Weaviate. Semantic search similarity. Context retrieval. Prompt engineering. Response generation.",
        section: "guides",
        url: "/docs/guides/rag-pipeline",
        headings: ["Document Ingestion", "Embeddings", "Vector Storage", "Retrieval", "Generation"],
    },
    {
        id: "guides-vector-databases",
        title: "Vector Databases",
        description: "Configure vector storage for semantic search and RAG",
        content: "Qdrant self-hosted production-ready. Pinecone managed cloud solution. Weaviate hybrid search GraphQL. Chroma lightweight development. Setup configuration embedding storage query.",
        section: "guides",
        url: "/docs/guides/vector-databases",
        headings: ["Qdrant", "Pinecone", "Weaviate", "Chroma", "Configuration", "Querying"],
    },
    {
        id: "guides-deployment",
        title: "Deployment Guide",
        description: "Deploy AI Stack to production",
        content: "Vercel deployment nextjs serverless edge. Docker containerization compose kubernetes. Environment variables secrets. Database PostgreSQL Supabase Neon. CI/CD GitHub Actions.",
        section: "guides",
        url: "/docs/guides/deployment",
        headings: ["Vercel", "Docker", "Kubernetes", "Environment Variables", "CI/CD"],
    },

    // CLI Reference
    {
        id: "cli-index",
        title: "CLI Reference",
        description: "Command-line interface documentation for create-ai-stack",
        content: "npx create-ai-stack-starter project-name. Interactive prompts. Command line flags options. Architecture selection Next.js FastAPI. Configuration database auth LLM addons.",
        section: "cli",
        url: "/docs/cli",
        headings: ["Installation", "Usage", "Interactive Mode", "Flags"],
    },
    {
        id: "cli-options",
        title: "CLI Options",
        description: "Available command-line flags and options",
        content: "--next --fastapi architecture. --use-pnpm --use-npm package manager. --skip-install --skip-git. --disable-analytics. Project configuration flags.",
        section: "cli",
        url: "/docs/cli/options",
        headings: ["Architecture Flags", "Package Manager", "Skip Options", "Configuration"],
    },
    {
        id: "cli-prompts",
        title: "CLI Prompts",
        description: "Interactive prompts during project creation",
        content: "Project name validation. Architecture selection Next.js FastAPI TypeScript. Database Neon Supabase Turso SQLite. Authentication Better Auth NextAuth Clerk. LLM provider OpenAI Anthropic.",
        section: "cli",
        url: "/docs/cli/prompts",
        headings: ["Project Name", "Architecture", "Database", "Authentication", "LLM Provider"],
    },

    // Additional docs
    {
        id: "docs-deployment",
        title: "Deployment",
        description: "Deploy your AI Stack application to production",
        content: "Production deployment Vercel Netlify Docker. Environment configuration secrets management. Database hosting Supabase Neon PlanetScale. Performance optimization caching CDN.",
        section: "docs",
        url: "/docs/deployment",
        headings: ["Platforms", "Configuration", "Database", "Performance"],
    },
    {
        id: "docs-security",
        title: "Security",
        description: "Security best practices for AI Stack applications",
        content: "Authentication authorization RBAC. API key management secrets. Input validation sanitization. Rate limiting protection. CORS configuration. Environment variables.",
        section: "docs",
        url: "/docs/security",
        headings: ["Authentication", "API Security", "Input Validation", "Rate Limiting"],
    },
    {
        id: "docs-faq",
        title: "FAQ",
        description: "Frequently asked questions about AI Stack",
        content: "Common questions troubleshooting. Installation issues dependencies. Configuration problems. Database connection. Authentication errors. LLM integration.",
        section: "docs",
        url: "/docs/faq",
        headings: ["Installation", "Configuration", "Database", "Authentication", "Troubleshooting"],
    },
    {
        id: "docs-contributing",
        title: "Contributing",
        description: "How to contribute to AI Stack",
        content: "Open source contribution guidelines. Fork clone pull request. Code style linting formatting. Testing requirements. Documentation updates. Issue reporting.",
        section: "docs",
        url: "/docs/contributing",
        headings: ["Getting Started", "Pull Requests", "Code Style", "Testing", "Documentation"],
    },
    {
        id: "docs-analytics",
        title: "Analytics",
        description: "CLI usage analytics and telemetry",
        content: "Anonymous analytics telemetry. Privacy data collection. Opt-out disable analytics. CLI usage statistics. Dashboard metrics.",
        section: "docs",
        url: "/docs/analytics",
        headings: ["Overview", "Privacy", "Opt-out", "Dashboard"],
    },

    // Builder
    {
        id: "builder",
        title: "Stack Builder",
        description: "Visual stack configuration tool",
        content: "Interactive builder configure AI stack visually. Select architecture database authentication LLM provider. Generate CLI command. Preview project structure.",
        section: "docs",
        url: "/builder",
        headings: ["Configuration", "Preview", "Generate Command"],
    },

    // Showcase
    {
        id: "showcase",
        title: "Showcase",
        description: "Projects built with AI Stack",
        content: "Example projects demonstrations. Real-world applications. Community projects. Use cases implementation patterns.",
        section: "docs",
        url: "/showcase",
        headings: ["Examples", "Community Projects", "Use Cases"],
    },
];

// Export function to get search data (allows for async loading in future)
export function getSearchData(): SearchItem[] {
    return searchData;
}
