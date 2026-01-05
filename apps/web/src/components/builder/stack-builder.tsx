import { startTransition, useEffect, useState } from "react";
import { Terminal, FolderTree } from "lucide-react";
import { Toaster, toast } from "sonner";

import { useStackState } from "../../lib/stack-state";
import { CATEGORY_ORDER, DEFAULT_STACK, PRESET_TEMPLATES, type StackState, type TechCategory } from "../../lib/stack-constants";
import { analyzeStackCompatibility, validateProjectName } from "../../lib/stack-utils";
import { cn } from "../../lib/utils";

import { CategorySection } from "./category-section";
import { SidebarSummary } from "./sidebar-summary";
import { PreviewPanel } from "./preview-panel";

export function StackBuilder() {
    const [stack, setStack, viewMode, setViewMode, selectedFile, setSelectedFile] = useStackState();
    const [lastSavedStack, setLastSavedStack] = useState<StackState | null>(null);
    const [lastAppliedAdjustment, setLastAppliedAdjustment] = useState<string>("");

    // Analyze compatibility
    const compatibility = analyzeStackCompatibility(stack);
    const projectNameError = validateProjectName(stack.projectName);

    // Load saved stack on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("aiStackPreference");
            if (saved) {
                try {
                    setLastSavedStack(JSON.parse(saved));
                } catch {
                    localStorage.removeItem("aiStackPreference");
                }
            }
        }
    }, []);

    // Apply compatibility adjustments
    useEffect(() => {
        if (!compatibility.adjustedStack) return;

        const adjustmentKey = JSON.stringify(compatibility.adjustedStack);
        if (adjustmentKey === lastAppliedAdjustment) return;

        startTransition(() => {
            if (compatibility.changes.length > 0) {
                const messages = compatibility.changes.map((c) => c.message);
                toast.info(messages.join(". "), { duration: 4000 });
            }
            if (compatibility.adjustedStack) {
                setStack(compatibility.adjustedStack);
            }
            setLastAppliedAdjustment(adjustmentKey);
        });
    }, [compatibility.adjustedStack, compatibility.changes, lastAppliedAdjustment, setStack]);

    // Handle tech selection
    function handleTechSelect(category: TechCategory, optionId: string) {
        startTransition(() => {
            setStack((prev) => {
                const key = category as keyof StackState;
                const current = prev[key];

                // Handle array categories (addons)
                if (category === "addons") {
                    const currentArr = Array.isArray(current) ? [...current] : [];
                    if (currentArr.includes(optionId)) {
                        // Remove if already selected
                        return { [key]: currentArr.filter((id) => id !== optionId) };
                    } else {
                        // Add
                        return { [key]: [...currentArr.filter((id) => id !== "none"), optionId] };
                    }
                }

                // Handle single-select categories
                if (current === optionId) {
                    // Toggle off (for boolean-like categories)
                    if (category === "git" || category === "install") {
                        return { [key]: current === "true" ? "false" : "true" };
                    }
                    return {};
                }

                return { [key]: optionId };
            });
        });
    }

    // Action handlers
    function handleReset() {
        startTransition(() => {
            setStack(DEFAULT_STACK);
        });
        toast.success("Stack reset to defaults");
    }

    function handleRandom() {
        const categories: TechCategory[] = ["architecture", "database", "orm", "auth", "llmProvider", "vectorDb", "search", "memory", "observability"];
        const randomStack: Partial<StackState> = {};

        for (const cat of categories) {
            const options = require("../../lib/stack-constants").TECH_OPTIONS[cat];
            if (options?.length > 0) {
                const randomIdx = Math.floor(Math.random() * options.length);
                (randomStack as Record<string, string>)[cat] = options[randomIdx].id;
            }
        }

        startTransition(() => {
            setStack({ ...DEFAULT_STACK, ...randomStack });
        });
        toast.success("Random stack generated");
    }

    function handleSave() {
        localStorage.setItem("aiStackPreference", JSON.stringify(stack));
        setLastSavedStack(stack);
        toast.success("Stack configuration saved");
    }

    function handleLoad() {
        if (lastSavedStack) {
            startTransition(() => {
                setStack(lastSavedStack);
            });
            toast.success("Saved configuration loaded");
        }
    }

    function handlePreset(presetId: string) {
        const preset = PRESET_TEMPLATES.find((p) => p.id === presetId);
        if (preset) {
            startTransition(() => {
                setStack(preset.stack);
            });
            toast.success(`Applied preset: ${preset.name}`);
        }
    }

    function handleProjectNameChange(name: string) {
        setStack({ projectName: name });
    }

    return (
        <div className="flex h-full w-full overflow-hidden bg-slate-950 text-white">
            <Toaster position="bottom-right" theme="dark" />

            {/* Sidebar */}
            <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-900/50 lg:flex xl:w-80">
                <SidebarSummary
                    stack={stack}
                    projectNameError={projectNameError}
                    onProjectNameChange={handleProjectNameChange}
                    onReset={handleReset}
                    onRandom={handleRandom}
                    onSave={handleSave}
                    onLoad={handleLoad}
                    onPreset={handlePreset}
                    hasSavedStack={!!lastSavedStack}
                />
            </aside>

            {/* Main content */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {/* Tab bar */}
                <div className="flex items-center border-b border-slate-800 bg-slate-900/30 px-4">
                    <button
                        type="button"
                        onClick={() => setViewMode("configure")}
                        className={cn(
                            "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                            viewMode === "configure"
                                ? "border-purple-500 text-purple-300"
                                : "border-transparent text-slate-400 hover:text-white"
                        )}
                    >
                        <Terminal className="h-4 w-4" />
                        Configure
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("preview")}
                        className={cn(
                            "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                            viewMode === "preview"
                                ? "border-purple-500 text-purple-300"
                                : "border-transparent text-slate-400 hover:text-white"
                        )}
                    >
                        <FolderTree className="h-4 w-4" />
                        Preview
                    </button>
                </div>

                {/* Content area */}
                <div className="flex-1 overflow-auto p-4 lg:p-6">
                    {viewMode === "configure" ? (
                        <div>
                            {CATEGORY_ORDER.map((category) => (
                                <CategorySection
                                    key={category}
                                    category={category}
                                    stack={stack}
                                    note={compatibility.notes[category]}
                                    onSelect={handleTechSelect}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-full">
                            <PreviewPanel
                                stack={stack}
                                selectedFile={selectedFile}
                                onSelectFile={setSelectedFile}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
