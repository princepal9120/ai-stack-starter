import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/lib/env";

/**
 * AI Model Configuration
 * Supports Novita AI (primary) and OpenAI (fallback)
 */

// Novita AI - Primary provider (cheaper, uncensored)
const novita = createOpenAI({
    apiKey: env.NOVITA_API_KEY || "",
    baseURL: "https://api.novita.ai/v3/openai",
});

// OpenAI - Fallback provider
const openai = createOpenAI({
    apiKey: env.OPENAI_API_KEY || "",
});

/**
 * Select the appropriate AI provider based on available API keys
 */
export function getAIProvider() {
    if (env.NOVITA_API_KEY) {
        return novita;
    }
    if (env.OPENAI_API_KEY) {
        return openai;
    }
    throw new Error("No AI provider configured. Set NOVITA_API_KEY or OPENAI_API_KEY");
}

/**
 * Get the default model for the current provider
 */
export function getDefaultModel() {
    const provider = getAIProvider();
    const modelName = env.NOVITA_API_KEY ? "gpt-4-turbo" : "gpt-4-turbo-preview";
    return provider(modelName);
}

export { novita, openai };
