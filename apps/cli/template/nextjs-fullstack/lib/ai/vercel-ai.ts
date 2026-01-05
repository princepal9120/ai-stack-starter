import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { searchExa } from '@/lib/search/exa';
import { searchReddit } from '@/lib/search/tavily';
import { addMemory, searchMemory } from '@/lib/memory/mem0';
import { getWeather, getFlightInfo, searchMovies, executeCode } from '@/lib/apis/external';

const novita = createOpenAI({
    apiKey: process.env.NOVITA_API_KEY,
    baseURL: 'https://api.novita.ai/v3/openai',
});

// Fallback to OpenAI if Novita is not set
const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Select model provider
const provider = process.env.NOVITA_API_KEY ? novita : openai;
const modelName = process.env.NOVITA_API_KEY ? 'gpt-4-turbo' : 'gpt-4-turbo-preview';
export const aiModel = provider(modelName);

export async function generateChatResponse(messages: any[], userId: string = 'anonymous') {

    // 1. Retrieve relevant memories before chat
    const lastMessage = messages[messages.length - 1];
    let systemContext = "";

    if (lastMessage.role === 'user') {
        const memories = await searchMemory(userId, lastMessage.content);
        if (memories?.length) {
            systemContext = `Relevant context from memory: ${JSON.stringify(memories)}`;
        }
    }

    return await streamText({
        model: aiModel,
        messages: [
            { role: 'system', content: `You are a helpful AI assistant. ${systemContext}` },
            ...messages
        ],
        tools: {
            searchWeb: tool({
                description: 'Search the web for real-time information using Exa.AI',
                parameters: z.object({ query: z.string() }),
                execute: async ({ query }: { query: string }) => await searchExa(query),
            }),
            searchReddit: tool({
                description: 'Search Reddit discussions for grounding using Tavily',
                parameters: z.object({ query: z.string() }),
                execute: async ({ query }: { query: string }) => await searchReddit(query),
            }),
            saveMemory: tool({
                description: 'Save important information to long-term memory',
                parameters: z.object({ content: z.string() }),
                execute: async ({ content }: { content: string }) => {
                    await addMemory(userId, content);
                    return "Memory saved.";
                },
            }),
            getWeather: tool({
                description: 'Get current weather for a location',
                parameters: z.object({ location: z.string() }),
                execute: async ({ location }: { location: string }) => await getWeather(location),
            }),
            findFlight: tool({
                description: 'Get flight information by flight number (IATA)',
                parameters: z.object({ flightNumber: z.string() }),
                execute: async ({ flightNumber }: { flightNumber: string }) => await getFlightInfo(flightNumber),
            }),
            searchMovies: tool({
                description: 'Search for movies or TV shows',
                parameters: z.object({ query: z.string() }),
                execute: async ({ query }: { query: string }) => await searchMovies(query),
            }),
            executeCode: tool({
                description: 'Execute Python code in a sandbox (Daytona)',
                parameters: z.object({ code: z.string() }),
                execute: async ({ code }: { code: string }) => await executeCode(code, 'python'),
            }),
        },
    });
}
