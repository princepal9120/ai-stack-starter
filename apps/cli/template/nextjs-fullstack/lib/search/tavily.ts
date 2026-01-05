import { tavily } from '@tavily/core';

const client = process.env.TAVILY_API_KEY ? tavily({ apiKey: process.env.TAVILY_API_KEY }) : null;

export async function searchReddit(query: string) {
    if (!client) {
        console.warn("TAVILY_API_KEY is not set");
        return [];
    }

    try {
        const response = await client.search(query, {
            searchDepth: 'advanced',
            includeRawContent: true,
            includeDomains: ['reddit.com'],
        });

        return response.results.map((r: any) => ({
            title: r.title,
            url: r.url,
            content: r.rawContent?.slice(0, 300) + '...',
            score: r.score
        }));
    } catch (error) {
        console.error("Tavily search error:", error);
        return [];
    }
}
