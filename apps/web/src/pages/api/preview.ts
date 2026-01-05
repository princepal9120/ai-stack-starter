import type { APIRoute } from "astro";
import { generateVirtualProject } from "../../lib/generator";
import type { StackState } from "../../lib/stack-constants";

export const prerender = false; // Ensure this route is not pre-rendered

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        console.log("Preview API received request:", JSON.stringify(body).slice(0, 100) + "...");

        const stack = body as StackState;
        console.log("Generating virtual project for:", stack.projectName);

        // Generate the virtual project structure
        const tree = await generateVirtualProject(stack);
        console.log("Generation successful, tree root:", tree.name);

        return new Response(JSON.stringify({ success: true, tree }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Preview generation error:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
};
