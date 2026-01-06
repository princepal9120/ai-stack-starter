import { isTelemetryEnabled } from "./telemetry";

// =============================================================================
// Types
// =============================================================================

type ProjectConfig = {
    projectName: string;
    backendType: "nextjs" | "fastapi" | "typescript";
    tsFramework?: "hono" | "fastify" | "nestjs";
    database: "neon" | "supabase" | "turso" | "sqlite";
    auth: "better-auth" | "nextauth" | "clerk" | "none";
    llmProvider: "openai" | "anthropic" | "novita";
    addons: string[];
};

type AnalyticsOptions = {
    packageManager: "npm" | "pnpm" | "yarn" | "bun";
    gitInitialized: boolean;
    dependenciesInstalled: boolean;
};

// =============================================================================
// Configuration
// =============================================================================

// Default production URL - can be overridden via env var
const DEFAULT_INGEST_URL = "https://ai-stack.convex.site/api/analytics/ingest";
const CONVEX_INGEST_URL = process.env.CONVEX_INGEST_URL || DEFAULT_INGEST_URL;

// Timeout for analytics requests (don't block CLI)
const ANALYTICS_TIMEOUT_MS = 5000;

// CLI version - should match package.json
const CLI_VERSION = "1.2.0";

// =============================================================================
// Analytics Functions
// =============================================================================

async function sendConvexEvent(payload: Record<string, unknown>): Promise<void> {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ANALYTICS_TIMEOUT_MS);

    try {
        const response = await fetch(CONVEX_INGEST_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": `create-ai-stack-starter/${CLI_VERSION}`,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        // Log non-2xx responses in debug mode
        if (!response.ok && process.env.DEBUG) {
            console.error(`Analytics request failed: ${response.status}`);
        }
    } catch (error) {
        // Log errors in debug mode only
        if (process.env.DEBUG) {
            console.error("Analytics error:", error);
        }
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Track project creation analytics.
 * 
 * @param config - Project configuration selected by user
 * @param options - Additional options like package manager, git, install status
 * @param disableAnalytics - Flag to disable analytics (from CLI flag)
 * 
 * Privacy: Only anonymous stack configuration data is sent.
 * Never sends: project names, file paths, personal information, or IP addresses.
 */
export async function trackProjectCreation(
    config: ProjectConfig,
    options: AnalyticsOptions,
    disableAnalytics = false
): Promise<void> {
    // Respect user preferences
    if (!isTelemetryEnabled() || disableAnalytics) {
        return;
    }

    // Extract only safe, anonymous data - never send project names or paths
    const {
        projectName: _projectName,
        ...safeConfig
    } = config;

    // Build analytics payload
    const payload = {
        // Stack configuration
        architecture: safeConfig.backendType,
        database: safeConfig.database,
        orm: "drizzle", // Currently the default ORM
        auth: safeConfig.auth,
        llmProvider: safeConfig.llmProvider,
        addons: safeConfig.addons,

        // Environment info
        packageManager: options.packageManager,
        git: options.gitInitialized,
        install: options.dependenciesInstalled,

        // Version info
        cli_version: CLI_VERSION,
        node_version: getNodeVersion(),
        platform: getPlatform(),
    };

    // Fire and forget - don't await in case of slow network
    // Use void to explicitly ignore the promise
    void sendConvexEvent(payload).catch(() => {
        // Silently ignore - analytics should never break the CLI
    });
}

/**
 * Get Node.js version safely
 */
function getNodeVersion(): string {
    try {
        return process?.version ?? "";
    } catch {
        return "";
    }
}

/**
 * Get platform safely
 */
function getPlatform(): string {
    try {
        return process?.platform ?? "";
    } catch {
        return "";
    }
}
