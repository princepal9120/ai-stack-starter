
import type { StackState, TechCategory } from "./stack-constants";
import { TECH_OPTIONS, ARCHITECTURE_DEFAULTS, getDefaultForArchitecture } from "./stack-constants";

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


    if (adjusted.architecture === "fastapi-nextjs" && adjusted.orm === "drizzle") {
        changes.push({
            category: "orm",
            from: "drizzle",
            to: "sqlalchemy",
            message: "Switched to SQLAlchemy (FastAPI uses Python ORM)",
        });
        adjusted.orm = "sqlalchemy";
    }

    if (adjusted.architecture === "fastapi-nextjs" && adjusted.auth === "better-auth") {
        notes.auth = {
            hasIssue: true,
            notes: ["FastAPI uses JWT or OAuth2 - Better Auth is TypeScript-only. Consider switching to JWT."],
        };
    }

    if (adjusted.addons.includes("celery") && adjusted.architecture !== "fastapi-nextjs") {
        adjusted.addons = adjusted.addons.filter((a) => a !== "celery");
        changes.push({
            category: "addons",
            from: "celery",
            to: "removed",
            message: "Celery removed (only available for FastAPI architecture)",
        });
    }

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

    if (adjusted.memory === "mem0") {
        notes.memory = {
            hasIssue: false,
            notes: ["Mem0 requires API key from mem0.ai - provides persistent conversation memory"],
        };
    }

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

export function shouldShowOption(
    stack: StackState,
    category: keyof typeof TECH_OPTIONS,
    optionId: string
): boolean {
    // Always show "none" options
    if (optionId === "none") return true;

    const isNextJs = stack.architecture === "nextjs-fullstack";
    const isFastAPI = stack.architecture === "fastapi-nextjs";

    // Hide architecture-specific ORMs when wrong architecture is selected
    if (category === "orm") {
        // Drizzle and Prisma are TypeScript ORMs
        if ((optionId === "drizzle" || optionId === "prisma") && !isNextJs) {
            return false;
        }
        // SQLAlchemy is Python ORM
        if (optionId === "sqlalchemy" && !isFastAPI) {
            return false;
        }
    }

    // Hide Python package managers for Next.js only projects
    if (category === "pyPackageManager") {
        return isFastAPI;
    }

    // Hide TypeScript-only auth for FastAPI
    if (category === "auth") {
        // Better Auth is TypeScript only
        if (optionId === "better-auth" && isFastAPI) {
            return false;
        }
        // JWT is primarily for FastAPI, but show for all
    }

    // Hide architecture-specific agentic frameworks
    if (category === "agenticFramework") {
        // Vercel AI SDK is Next.js specific
        if (optionId === "vercel-ai-sdk" && !isNextJs) {
            return false;
        }
        // LangChain/LangGraph/CrewAI are Python focused, show for FastAPI
        if ((optionId === "langchain" || optionId === "langgraph" || optionId === "crewai") && !isFastAPI) {
            return false;
        }
    }

    // Hide Celery for non-FastAPI architectures
    if (category === "addons" && optionId === "celery") {
        return isFastAPI;
    }

    // Hide reranking if no vector DB (keep it simple - it's confusing otherwise)
    if (category === "addons" && optionId === "reranking") {
        return stack.vectorDb !== "none";
    }

    return true;
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

// Apply architecture-specific defaults when switching architectures
// Based on PRD specs:
// - Next.js: Vercel AI SDK, Drizzle, Better Auth, Exa, Mem0 (ai-stack-nextjs-spec.md)
// - FastAPI: LangChain, SQLAlchemy, JWT, Qdrant, Celery (ai-stack-fastapi-spec.md)
export function applyArchitectureDefaults(
    currentStack: StackState,
    newArchitecture: string
): StackState {
    if (currentStack.architecture === newArchitecture) {
        return currentStack;
    }

    const archDefaults = ARCHITECTURE_DEFAULTS[newArchitecture];
    if (!archDefaults) {
        return { ...currentStack, architecture: newArchitecture };
    }

    const newStack: StackState = {
        ...currentStack,
        architecture: newArchitecture,
    };

    // Apply architecture-specific defaults
    if (archDefaults.agenticFramework) {
        newStack.agenticFramework = archDefaults.agenticFramework;
    }
    if (archDefaults.orm) {
        newStack.orm = archDefaults.orm;
    }
    if (archDefaults.auth) {
        newStack.auth = archDefaults.auth;
    }
    if (archDefaults.search) {
        newStack.search = archDefaults.search;
    }
    if (archDefaults.memory) {
        newStack.memory = archDefaults.memory;
    }
    if (archDefaults.observability) {
        newStack.observability = archDefaults.observability;
    }
    if (archDefaults.addons) {
        newStack.addons = [...archDefaults.addons];
    }

    return newStack;
}

// Check if current option is the architecture-specific default
export function isArchitectureDefault(
    architecture: string,
    category: keyof StackState,
    optionId: string
): boolean {
    const defaultValue = getDefaultForArchitecture(architecture, category);
    if (Array.isArray(defaultValue)) {
        return defaultValue.includes(optionId);
    }
    return defaultValue === optionId;
}
