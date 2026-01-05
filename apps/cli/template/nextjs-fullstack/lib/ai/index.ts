import { streamText } from "ai";
import { getDefaultModel } from "./config";
import { createTools } from "./tools";
import { searchMemory } from "@/lib/memory/mem0";

export { getAIProvider, getDefaultModel } from "./config";
export { createTools } from "./tools";

/**
 * Generate a streaming chat response with AI tools
 */
export async function generateChatResponse(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    userId: string = "anonymous"
) {
    // Build system context from user's memory
    let systemContext = "";
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

    if (lastUserMessage) {
        const memories = await searchMemory(userId, lastUserMessage.content);
        if (memories && memories.length > 0) {
            systemContext = `\n\nRelevant context from memory:\n${JSON.stringify(memories, null, 2)}`;
        }
    }

    const systemMessage = {
        role: "system" as const,
        content: `You are a helpful AI assistant with access to various tools.
You can search the web, check weather, find flights, search movies, execute code, and remember important information.
Always be helpful, accurate, and concise.${systemContext}`,
    };

    return await streamText({
        model: getDefaultModel(),
        messages: [systemMessage, ...messages],
        tools: createTools(userId),
        maxSteps: 5, // Allow multiple tool calls per response
    });
}
