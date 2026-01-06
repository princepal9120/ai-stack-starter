import { useState } from "react";
import { ClipboardCopy, Check, Shuffle, RotateCcw, Save, FolderOpen, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import type { StackState, TechOption } from "../../lib/stack-constants";
import { TECH_OPTIONS, CATEGORY_ORDER, PRESET_TEMPLATES } from "../../lib/stack-constants";
import { generateStackCommand, generateStackSharingUrl } from "../../lib/stack-state";

type SidebarSummaryProps = {
    stack: StackState;
    projectNameError: string | null;
    onProjectNameChange: (name: string) => void;
    onReset: () => void;
    onRandom: () => void;
    onSave: () => void;
    onLoad: () => void;
    onPreset: (presetId: string) => void;
    hasSavedStack: boolean;
};

export function SidebarSummary({
    stack,
    projectNameError,
    onProjectNameChange,
    onReset,
    onRandom,
    onSave,
    onLoad,
    onPreset,
    hasSavedStack,
}: SidebarSummaryProps) {
    const [copied, setCopied] = useState(false);
    const [showPresets, setShowPresets] = useState(false);

    const command = generateStackCommand(stack);

    function copyCommand() {
        navigator.clipboard.writeText(command.replace(/\\\n\s+/g, " "));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function copyShareUrl() {
        const url = generateStackSharingUrl(stack);
        navigator.clipboard.writeText(url);
        setCopied(true); // Reuse copied state for feedback
        setTimeout(() => setCopied(false), 2000);
    }

    // Get selected tech badges
    function getBadges() {
        const badges: { category: string; tech: TechOption }[] = [];

        for (const category of CATEGORY_ORDER) {
            const options = TECH_OPTIONS[category];
            const value = stack[category as keyof StackState];

            if (!options) continue;

            if (Array.isArray(value)) {
                for (const id of value) {
                    if (id === "none" || !id) continue;
                    const tech = options.find((o) => o.id === id);
                    if (tech) badges.push({ category, tech });
                }
            } else {
                if (value === "none" || value === "true" || value === "false") continue;
                const tech = options.find((o) => o.id === value);
                if (tech) badges.push({ category, tech });
            }
        }

        return badges;
    }

    const badges = getBadges();

    return (
        <div className="flex h-full flex-col gap-4 p-4">
            {/* Project name input */}
            <div>
                <label className="mb-1 block text-xs text-slate-400">
                    Project Name
                </label>
                <input
                    type="text"
                    value={stack.projectName}
                    onChange={(e) => onProjectNameChange(e.target.value)}
                    placeholder="my-ai-app"
                    className={cn(
                        "w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2",
                        projectNameError
                            ? "border-red-500 focus:ring-red-500/50"
                            : "border-slate-700 focus:ring-purple-500/50"
                    )}
                />
                {projectNameError && (
                    <p className="mt-1 text-xs text-red-400">{projectNameError}</p>
                )}
            </div>

            {/* Command preview */}
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                <div className="flex items-start">
                    <span className="mr-2 select-none text-purple-400">$</span>
                    <code className="flex-1 break-all text-xs text-slate-300 font-mono">
                        {command}
                    </code>
                </div>
                <div className="mt-2 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={copyShareUrl}
                        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                        Share
                    </button>
                    <button
                        type="button"
                        onClick={copyCommand}
                        className={cn(
                            "flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors",
                            copied
                                ? "bg-green-500/20 text-green-400"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        {copied ? (
                            <>
                                <Check className="h-3 w-3" />
                                Copied
                            </>
                        ) : (
                            <>
                                <ClipboardCopy className="h-3 w-3" />
                                Copy
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Selected stack badges */}
            <div>
                <h3 className="mb-2 text-sm font-medium text-white">Selected Stack</h3>
                <div className="flex flex-wrap gap-1.5">
                    {badges.map(({ category, tech }) => {
                        const IconComponent = tech.iconComponent;
                        return (
                            <span
                                key={`${category}-${tech.name}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                            >
                                {IconComponent && (
                                    <IconComponent className="h-3 w-3 shrink-0" />
                                )}
                                {tech.name}
                            </span>
                        );
                    })}
                    {badges.length === 0 && (
                        <span className="text-xs text-slate-500">No options selected</span>
                    )}
                </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Action buttons */}
            <div className="space-y-3 border-t border-slate-700 pt-4">
                {/* Row 1: Reset, Random */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onReset}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={onRandom}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        <Shuffle className="h-3 w-3" />
                        Random
                    </button>
                </div>

                {/* Row 2: Save, Load */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onSave}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        <Save className="h-3 w-3" />
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={onLoad}
                        disabled={!hasSavedStack}
                        className={cn(
                            "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium",
                            hasSavedStack
                                ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                                : "border-slate-800 bg-slate-900/50 text-slate-600 cursor-not-allowed"
                        )}
                    >
                        <FolderOpen className="h-3 w-3" />
                        Load
                    </button>
                </div>

                {/* Presets dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowPresets(!showPresets)}
                        className="flex w-full items-center justify-between rounded-lg border border-purple-500/50 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-300 hover:bg-purple-500/20"
                    >
                        <span>Apply Preset</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", showPresets && "rotate-180")} />
                    </button>

                    {showPresets && (
                        <div className="absolute left-0 right-0 bottom-full z-50 mb-1 rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl">
                            {PRESET_TEMPLATES.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => {
                                        onPreset(preset.id);
                                        setShowPresets(false);
                                    }}
                                    className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-slate-800"
                                >
                                    <span className="text-sm font-medium text-white">{preset.name}</span>
                                    <span className="text-xs text-slate-400">{preset.description}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
