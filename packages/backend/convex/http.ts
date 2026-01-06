import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// =============================================================================
// Analytics Ingestion Endpoint
// =============================================================================

http.route({
    path: "/api/analytics/ingest",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        // Validate content type
        const contentType = req.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
            return new Response("Content-Type must be application/json", {
                status: 415,
                headers: corsHeaders(),
            });
        }

        // Parse body with size limit check (Convex handles this, but being explicit)
        let body: Record<string, unknown>;
        try {
            body = await req.json();
        } catch {
            return new Response("Invalid JSON body", {
                status: 400,
                headers: corsHeaders(),
            });
        }

        if (!body || typeof body !== "object") {
            return new Response("Request body must be an object", {
                status: 400,
                headers: corsHeaders(),
            });
        }

        // Call internal mutation to ingest event
        const ingest = internal.analytics?.ingestEvent;
        if (ingest) {
            try {
                await ctx.runMutation(ingest, {
                    architecture: typeof body.architecture === "string" ? body.architecture : undefined,
                    database: typeof body.database === "string" ? body.database : undefined,
                    orm: typeof body.orm === "string" ? body.orm : undefined,
                    auth: typeof body.auth === "string" ? body.auth : undefined,
                    llmProvider: typeof body.llmProvider === "string" ? body.llmProvider : undefined,
                    addons: Array.isArray(body.addons) ? body.addons.filter((a): a is string => typeof a === "string") : undefined,
                    packageManager: typeof body.packageManager === "string" ? body.packageManager : undefined,
                    git: typeof body.git === "boolean" ? body.git : undefined,
                    install: typeof body.install === "boolean" ? body.install : undefined,
                    cli_version: typeof body.cli_version === "string" ? body.cli_version : undefined,
                    node_version: typeof body.node_version === "string" ? body.node_version : undefined,
                    platform: typeof body.platform === "string" ? body.platform : undefined,
                });
            } catch (error) {
                console.error("Failed to ingest analytics:", error);
                return new Response("Internal Server Error", {
                    status: 500,
                    headers: corsHeaders(),
                });
            }
        }

        return new Response("ok", {
            status: 200,
            headers: corsHeaders(),
        });
    }),
});

// Handle CORS preflight requests
http.route({
    path: "/api/analytics/ingest",
    method: "OPTIONS",
    handler: httpAction(async () => {
        return new Response(null, {
            status: 204,
            headers: corsHeaders(),
        });
    }),
});

// CORS headers for cross-origin requests from CLI
function corsHeaders(): HeadersInit {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
    };
}

export default http;
