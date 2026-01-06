export type ProjectConfig = {
    projectName: string;
    backendType: "nextjs" | "fastapi" | "typescript";
    tsFramework?: "hono" | "fastify" | "nestjs";
    database: "neon" | "supabase" | "turso" | "sqlite";
    auth: "better-auth" | "nextauth" | "clerk" | "none";
    llmProvider: "openai" | "anthropic" | "novita";
    addons: string[];
};
