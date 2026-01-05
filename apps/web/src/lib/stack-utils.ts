// AI Stack Compatibility Engine
// Validates and auto-adjusts stack configurations for AI Stack-specific rules

import type { StackState, TechCategory } from "./stack-constants";
import { TECH_OPTIONS } from "./stack-constants";

export type CompatibilityChange = {
    category: string;
    from: string;
    to: string;
    message: string;
};

export type CompatibilityNote = {
    hasIssue: boolean;
    notes: string[];
};

export type CompatibilityAnalysis = {
    isValid: boolean;
    adjustedStack: StackState | null;
    changes: CompatibilityChange[];
    notes: Record<string, CompatibilityNote>;
};

// Analyze stack and return adjusted version if needed
export function analyzeStackCompatibility(stack: StackState): CompatibilityAnalysis {
    const changes: CompatibilityChange[] = [];
    const notes: Record<string, CompatibilityNote> = {};
    let adjusted = { ...stack, addons: [...stack.addons] };

    // Rule 1: pgvector requires PostgreSQL-compatible database
    if (adjusted.vectorDb === "pgvector") {
        const postgresCompatible = ["postgresql", "neon", "supabase"];
        if (!postgresCompatible.includes(adjusted.database)) {
            changes.push({
                category: "database",
                from: adjusted.database,
                to: "postgresql",
                message: "Switched to PostgreSQL (pgvector requires PostgreSQL)",
            });
            adjusted.database = "postgresql";
        }
        notes.vectorDb = {
            hasIssue: true,
            notes: ["pgvector is a PostgreSQL extension - requires PostgreSQL, Neon, or Supabase"],
        };
    }

    // Rule 2: FastAPI architecture uses SQLAlchemy, not Drizzle
    if (adjusted.architecture === "fastapi-nextjs" && adjusted.orm === "drizzle") {
        changes.push({
            category: "orm",
            from: "drizzle",
            to: "sqlalchemy",
            message: "Switched to SQLAlchemy (FastAPI uses Python ORM)",
        });
        adjusted.orm = "sqlalchemy";
    }

    // Rule 3: FastAPI architecture prefers JWT auth over Better Auth
    if (adjusted.architecture === "fastapi-nextjs" && adjusted.auth === "better-auth") {
        notes.auth = {
            hasIssue: true,
            notes: ["FastAPI uses JWT or OAuth2 - Better Auth is TypeScript-only. Consider switching to JWT."],
        };
    }

    // Rule 4: Celery workers only for FastAPI
    if (adjusted.addons.includes("celery") && adjusted.architecture !== "fastapi-nextjs") {
        adjusted.addons = adjusted.addons.filter((a) => a !== "celery");
        changes.push({
            category: "addons",
            from: "celery",
            to: "removed",
            message: "Celery removed (only available for FastAPI architecture)",
        });
    }

    // Rule 5: Ollama is local-only, requires Docker
    if (adjusted.llmProvider === "ollama") {
        if (!adjusted.addons.includes("docker")) {
            adjusted.addons.push("docker");
            changes.push({
                category: "addons",
                from: "",
                to: "docker",
                message: "Added Docker (Ollama requires local Docker)",
            });
        }
        notes.llmProvider = {
            hasIssue: true,
            notes: ["Ollama runs locally - requires Docker and ~4GB+ RAM for most models"],
        };
    }

    // Rule 6: Mem0 requires API key
    if (adjusted.memory === "mem0") {
        notes.memory = {
            hasIssue: false,
            notes: ["Mem0 requires API key from mem0.ai - provides persistent conversation memory"],
        };
    }

    // Rule 7: Reranking addon adds latency warning
    if (adjusted.addons.includes("reranking")) {
        notes.addons = {
            hasIssue: true,
            notes: ["Cross-encoder reranking improves accuracy but adds 100-200ms latency per query"],
        };
    }

    // Rule 8: No vector DB means no RAG pipeline
    if (adjusted.vectorDb === "none") {
        notes.vectorDb = {
            hasIssue: true,
            notes: ["Without a vector database, RAG document retrieval is disabled"],
        };
        // Remove reranking if no vector DB
        if (adjusted.addons.includes("reranking")) {
            adjusted.addons = adjusted.addons.filter((a) => a !== "reranking");
            changes.push({
                category: "addons",
                from: "reranking",
                to: "removed",
                message: "Reranking removed (requires vector database)",
            });
        }
    }

    // Rule 9: Kubernetes requires Docker
    if (adjusted.addons.includes("kubernetes") && !adjusted.addons.includes("docker")) {
        adjusted.addons.push("docker");
        changes.push({
            category: "addons",
            from: "",
            to: "docker",
            message: "Added Docker (required for Kubernetes deployment)",
        });
    }

    return {
        isValid: changes.length === 0,
        adjustedStack: changes.length > 0 ? adjusted : null,
        changes,
        notes,
    };
}

// Check if a specific option is compatible with current stack
export function isOptionCompatible(
    stack: StackState,
    category: keyof typeof TECH_OPTIONS,
    optionId: string
): boolean {
    // Always allow "none" options
    if (optionId === "none") return true;

    // pgvector only with PostgreSQL-compatible databases
    if (category === "vectorDb" && optionId === "pgvector") {
        const postgresCompatible = ["postgresql", "neon", "supabase"];
        return postgresCompatible.includes(stack.database);
    }

    // SQLAlchemy only for FastAPI
    if (category === "orm" && optionId === "sqlalchemy") {
        return stack.architecture === "fastapi-nextjs";
    }

    // Drizzle only for Next.js
    if (category === "orm" && optionId === "drizzle") {
        return stack.architecture === "nextjs-fullstack";
    }

    // Celery only for FastAPI
    if (category === "addons" && optionId === "celery") {
        return stack.architecture === "fastapi-nextjs";
    }

    // Reranking only if vector DB is selected
    if (category === "addons" && optionId === "reranking") {
        return stack.vectorDb !== "none";
    }

    return true;
}

// Get reason why an option is disabled
export function getDisabledReason(
    stack: StackState,
    category: keyof typeof TECH_OPTIONS,
    optionId: string
): string | null {
    if (isOptionCompatible(stack, category, optionId)) {
        return null;
    }

    if (category === "vectorDb" && optionId === "pgvector") {
        return "pgvector requires PostgreSQL, Neon, or Supabase as database";
    }

    if (category === "orm" && optionId === "sqlalchemy") {
        return "SQLAlchemy is only available for FastAPI architecture";
    }

    if (category === "orm" && optionId === "drizzle") {
        return "Drizzle is only available for Next.js architecture";
    }

    if (category === "addons" && optionId === "celery") {
        return "Celery workers are only available for FastAPI architecture";
    }

    if (category === "addons" && optionId === "reranking") {
        return "Reranking requires a vector database - select one first";
    }

    return "This option is not compatible with your current selection";
}

// Validate project name
export function validateProjectName(name: string): string | null {
    if (!name) return null;

    if (name.length > 214) {
        return "Project name must be less than 214 characters";
    }

    if (/^[._]/.test(name)) {
        return "Project name cannot start with a dot or underscore";
    }

    if (/[<>:"/\\|?*]/.test(name)) {
        return "Project name contains invalid characters";
    }

    if (/\s/.test(name)) {
        return "Project name cannot contain spaces (use hyphens instead)";
    }

    return null;
}
