import { z } from "zod";

/**
 * Environment variable schema with Zod validation
 * Following T3 Stack env pattern for type-safe environment variables
 */
const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

    // AI Providers (at least one required)
    OPENAI_API_KEY: z.string().optional(),
    NOVITA_API_KEY: z.string().optional(),

    // Search APIs
    EXA_API_KEY: z.string().optional(),
    TAVILY_API_KEY: z.string().optional(),

    // Memory
    MEM0_API_KEY: z.string().optional(),

    // External APIs
    OPENWEATHER_API_KEY: z.string().optional(),
    AVIATION_STACK_KEY: z.string().optional(),
    TMDB_API_KEY: z.string().optional(),
    DAYTONA_API_KEY: z.string().optional(),

    // Auth
    BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
    BETTER_AUTH_URL: z.string().url().optional().default("http://localhost:3000"),

    // OAuth (optional)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    // Node environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Validate and export environment variables
 * Will throw at startup if required variables are missing
 */
function validateEnv() {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error("❌ Invalid environment variables:");
        console.error(parsed.error.flatten().fieldErrors);
        throw new Error("Invalid environment variables");
    }

    // Ensure at least one AI provider is configured
    if (!parsed.data.OPENAI_API_KEY && !parsed.data.NOVITA_API_KEY) {
        console.warn("⚠️ No AI provider configured. Set OPENAI_API_KEY or NOVITA_API_KEY");
    }

    return parsed.data;
}

export const env = validateEnv();

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;
