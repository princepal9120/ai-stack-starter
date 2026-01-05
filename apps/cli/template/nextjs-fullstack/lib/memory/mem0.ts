import { MemoryClient } from 'mem0ai';

const memory = process.env.MEM0_API_KEY ? new MemoryClient(process.env.MEM0_API_KEY) : null;

export async function addMemory(userId: string, content: string, metadata?: Record<string, any>) {
    if (!memory) return;

    try {
        await memory.add([{
            content,
            metadata: { ...metadata, timestamp: Date.now() },
        }], {
            user_id: userId,
        });
    } catch (error) {
        console.error("Mem0 add error:", error);
    }
}

export async function searchMemory(userId: string, query: string) {
    if (!memory) return [];

    try {
        const memories = await memory.search(query, {
            user_id: userId,
            limit: 5,
        });
        return memories;
    } catch (error) {
        console.error("Mem0 search error:", error);
        return [];
    }
}
