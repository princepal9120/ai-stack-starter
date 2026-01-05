"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { DEFAULT_STACK, type StackState } from "./stack-constants";

// Serialize stack state to URL params
function stackToParams(stack: StackState): URLSearchParams {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(stack)) {
        if (key === "projectName") {
            if (value !== DEFAULT_STACK.projectName) {
                params.set("name", value);
            }
            continue;
        }

        const defaultValue = DEFAULT_STACK[key as keyof StackState];

        if (Array.isArray(value)) {
            const sorted = [...value].sort();
            const defaultSorted = [...(defaultValue as string[])].sort();
            if (JSON.stringify(sorted) !== JSON.stringify(defaultSorted)) {
                params.set(key, value.join(","));
            }
        } else if (value !== defaultValue) {
            params.set(key, value);
        }
    }

    return params;
}

// Parse URL params to stack state
function paramsToStack(params: URLSearchParams): StackState {
    const stack: StackState = { ...DEFAULT_STACK, addons: [...DEFAULT_STACK.addons] };

    const name = params.get("name");
    if (name) stack.projectName = name;

    const singleKeys: (keyof StackState)[] = [
        "architecture",
        "llmProvider",
        "vectorDb",
        "database",
        "orm",
        "auth",
        "search",
        "memory",
        "observability",
        "packageManager",
        "git",
        "install",
    ];

    for (const key of singleKeys) {
        const value = params.get(key);
        if (value) {
            (stack[key] as string) = value;
        }
    }

    const addons = params.get("addons");
    if (addons) {
        stack.addons = addons.split(",").filter(Boolean);
    }

    return stack;
}

type ViewMode = "configure" | "preview";

export function useStackState() {
    const [stack, setStackInternal] = useState<StackState>(DEFAULT_STACK);
    const [viewMode, setViewModeInternal] = useState<ViewMode>("configure");
    const [selectedFile, setSelectedFileInternal] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize from URL on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const initialStack = paramsToStack(params);
            setStackInternal(initialStack);

            const view = params.get("view") as ViewMode;
            if (view === "configure" || view === "preview") {
                setViewModeInternal(view);
            }

            const file = params.get("file");
            if (file) {
                setSelectedFileInternal(file);
            }
            setIsInitialized(true);
        }
    }, []);

    // Sync URL when stack changes
    useEffect(() => {
        if (!isInitialized || typeof window === "undefined") return;

        const params = stackToParams(stack);

        // Preserve view mode and selected file
        if (viewMode !== "configure") {
            params.set("view", viewMode);
        }
        if (selectedFile) {
            params.set("file", selectedFile);
        }

        const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
        window.history.replaceState(null, "", newUrl);
    }, [stack, viewMode, selectedFile, isInitialized]);

    // Update stack with partial changes
    const setStack = useCallback((update: Partial<StackState> | ((prev: StackState) => Partial<StackState>)) => {
        setStackInternal((prev) => {
            const changes = typeof update === "function" ? update(prev) : update;
            if (Object.keys(changes).length === 0) return prev;

            // Handle addons array properly
            if (changes.addons) {
                return { ...prev, ...changes, addons: [...changes.addons] };
            }
            return { ...prev, ...changes };
        });
    }, []);

    const setViewMode = useCallback((mode: ViewMode) => {
        setViewModeInternal(mode);
    }, []);

    const setSelectedFile = useCallback((file: string | null) => {
        setSelectedFileInternal(file);
    }, []);

    return [
        stack,
        setStack,
        viewMode,
        setViewMode,
        selectedFile,
        setSelectedFile,
    ] as const;
}

// Generate CLI command from stack state
export function generateStackCommand(stack: StackState): string {
    const parts = ["npx create-ai-stack@latest"];

    if (stack.projectName && stack.projectName !== "my-ai-app") {
        parts.push(stack.projectName);
    }

    if (stack.architecture !== DEFAULT_STACK.architecture) {
        parts.push(`--architecture ${stack.architecture}`);
    }

    if (stack.llmProvider !== DEFAULT_STACK.llmProvider) {
        parts.push(`--llm ${stack.llmProvider}`);
    }

    if (stack.vectorDb !== DEFAULT_STACK.vectorDb) {
        parts.push(`--vector-db ${stack.vectorDb}`);
    }

    if (stack.database !== DEFAULT_STACK.database) {
        parts.push(`--database ${stack.database}`);
    }

    if (stack.orm !== DEFAULT_STACK.orm) {
        parts.push(`--orm ${stack.orm}`);
    }

    if (stack.auth !== DEFAULT_STACK.auth) {
        parts.push(`--auth ${stack.auth}`);
    }

    if (stack.search !== DEFAULT_STACK.search) {
        parts.push(`--search ${stack.search}`);
    }

    if (stack.memory !== DEFAULT_STACK.memory) {
        parts.push(`--memory ${stack.memory}`);
    }

    if (stack.observability !== DEFAULT_STACK.observability) {
        parts.push(`--observability ${stack.observability}`);
    }

    const defaultAddons = [...DEFAULT_STACK.addons].sort();
    const currentAddons = [...stack.addons].sort();
    if (JSON.stringify(currentAddons) !== JSON.stringify(defaultAddons) && stack.addons.length > 0) {
        parts.push(`--addons ${stack.addons.join(",")}`);
    }

    if (stack.packageManager !== DEFAULT_STACK.packageManager) {
        parts.push(`--package-manager ${stack.packageManager}`);
    }

    if (stack.git !== DEFAULT_STACK.git) {
        parts.push(stack.git === "true" ? "--git" : "--no-git");
    }

    if (stack.install !== DEFAULT_STACK.install) {
        parts.push(stack.install === "true" ? "--install" : "--no-install");
    }

    return parts.join(" \\\n  ");
}

// Generate shareable URL
export function generateStackSharingUrl(stack: StackState): string {
    const params = stackToParams(stack);
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://ai-stack.dev";
    return `${baseUrl}/builder?${params.toString()}`;
}
