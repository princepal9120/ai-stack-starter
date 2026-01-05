import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY);

export async function searchExa(query: string) {
    if (!process.env.EXA_API_KEY) {
        console.warn("EXA_API_KEY is not set");
        return [];
    }

    try {
        const result = await exa.searchAndContents(query, {
            type: 'neural',
            useAutoprompt: true,
            numResults: 5,
            text: true,
        });

        return result.results.map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.text.slice(0, 200) + '...',
            publishedDate: r.publishedDate,
        }));
    } catch (error) {
        console.error("Exa search error:", error);
        return [];
    }
}
