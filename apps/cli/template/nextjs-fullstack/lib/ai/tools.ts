import { tool } from "ai";
import { z } from "zod";
import { searchExa } from "@/lib/search/exa";
import { searchReddit } from "@/lib/search/tavily";
import { addMemory, searchMemory } from "@/lib/memory/mem0";
import { getWeather, getFlightInfo, searchMovies, executeCode } from "@/lib/apis/external";

/**
 * AI Tool Definitions
 * These tools are available for the AI model to call
 */
export function createTools(userId: string) {
    return {
        searchWeb: tool({
            description: "Search the web for real-time information using Exa.AI",
            parameters: z.object({ query: z.string().describe("Search query") }),
            execute: async ({ query }) => await searchExa(query),
        }),

        searchReddit: tool({
            description: "Search Reddit discussions for community insights",
            parameters: z.object({ query: z.string().describe("Search query") }),
            execute: async ({ query }) => await searchReddit(query),
        }),

        saveMemory: tool({
            description: "Save important information to long-term memory for future reference",
            parameters: z.object({
                content: z.string().describe("Information to remember")
            }),
            execute: async ({ content }) => {
                await addMemory(userId, content);
                return { success: true, message: "Memory saved successfully" };
            },
        }),

        recallMemory: tool({
            description: "Search user's memory for previously saved information",
            parameters: z.object({
                query: z.string().describe("What to search for in memory")
            }),
            execute: async ({ query }) => await searchMemory(userId, query),
        }),

        getWeather: tool({
            description: "Get current weather for a location",
            parameters: z.object({
                location: z.string().describe("City name, e.g., 'Tokyo' or 'New York'")
            }),
            execute: async ({ location }) => await getWeather(location),
        }),

        findFlight: tool({
            description: "Get real-time flight information by flight number",
            parameters: z.object({
                flightNumber: z.string().describe("IATA flight number, e.g., 'AA123'")
            }),
            execute: async ({ flightNumber }) => await getFlightInfo(flightNumber),
        }),

        searchMovies: tool({
            description: "Search for movies or TV shows",
            parameters: z.object({
                query: z.string().describe("Movie or show title to search")
            }),
            execute: async ({ query }) => await searchMovies(query),
        }),

        executeCode: tool({
            description: "Execute Python code in a secure sandbox environment",
            parameters: z.object({
                code: z.string().describe("Python code to execute")
            }),
            execute: async ({ code }) => await executeCode(code, "python"),
        }),
    };
}
