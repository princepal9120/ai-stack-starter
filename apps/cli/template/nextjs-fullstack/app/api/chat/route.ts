import { generateChatResponse } from "@/lib/ai";
import { auth } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(
                JSON.stringify({ error: "Invalid request: messages array required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Get user session for personalization
        let userId = "anonymous";
        try {
            const session = await auth.api.getSession({ headers: req.headers });
            if (session?.user?.id) {
                userId = session.user.id;
            }
        } catch {
            // Continue with anonymous user
        }

        const result = await generateChatResponse(messages, userId);
        return result.toDataStreamResponse();
    } catch (error) {
        console.error("Chat API error:", error);

        const message = error instanceof Error ? error.message : "Internal server error";
        return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
