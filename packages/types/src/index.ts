// AI Stack Shared Types

// Architecture types
export type Architecture = 'nextjs' | 'fastapi' | 'typescript';

// Database types
export type Database = 'neon' | 'supabase' | 'turso' | 'sqlite';

// ORM types
export type ORM = 'drizzle' | 'prisma';

// Auth types
export type Auth = 'better-auth' | 'nextauth' | 'clerk' | 'none';

// LLM Provider types
export type LLMProvider = 'openai' | 'anthropic' | 'novita' | 'ollama';

// Vector Database types
export type VectorDB = 'qdrant' | 'weaviate' | 'pgvector' | 'pinecone' | 'none';

// Backend types (for TypeScript architecture)
export type Backend = 'hono' | 'nestjs' | 'fastify';

// Add-on types
export type Addon = 'tailwind' | 'biome' | 'pwa' | 'analytics' | 'docker';

// Project configuration
export type ProjectConfig = {
    name: string;
    architecture: Architecture;
    backend?: Backend;
    database: Database;
    orm?: ORM;
    auth: Auth;
    llm: LLMProvider;
    vector?: VectorDB;
    addons?: Addon[];
    git?: boolean;
    install?: boolean;
};

// CLI Options
export type CLIOptions = Partial<ProjectConfig> & {
    yes?: boolean;
};

// Create result
export type CreateResult = {
    projectPath: string;
    config: ProjectConfig;
};
