import { motion } from "framer-motion";
import {
    Terminal,
    Info,
    Layers,
    Sparkles,
    Database,
    Table,
    Shield,
    Search,
    Brain,
    BarChart3,
    Puzzle,
    Package,
    GitBranch,
    Download
} from "lucide-react";
import { TechCard } from "./tech-card";
import type { TechOption, StackState, TechCategory } from "../../lib/stack-constants";
import { TECH_OPTIONS, getCategoryDisplayName } from "../../lib/stack-constants";
import { isOptionCompatible, getDisabledReason, type CompatibilityNote } from "../../lib/stack-utils";

type CategorySectionProps = {
    category: TechCategory;
    stack: StackState;
    note?: CompatibilityNote;
    onSelect: (category: TechCategory, optionId: string) => void;
};

export function CategorySection({
    category,
    stack,
    note,
    onSelect,
}: CategorySectionProps) {
    const options = TECH_OPTIONS[category] || [];
    const displayName = getCategoryDisplayName(category);

    const CategoryIcon = {
        architecture: Layers,
        llmProvider: Sparkles,
        vectorDb: Database,
        database: Database,
        orm: Table,
        auth: Shield,
        search: Search,
        memory: Brain,
        observability: BarChart3,
        addons: Puzzle,
        packageManager: Package,
        git: GitBranch,
        install: Download
    }[category] || Terminal;

    // Get current selection(s) for this category
    function isSelected(optionId: string): boolean {
        const value = stack[category as keyof StackState];
        if (Array.isArray(value)) {
            return value.includes(optionId);
        }
        return value === optionId;
    }

    // Skip rendering if no options (shouldn't happen)
    if (options.length === 0) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="mb-8 scroll-mt-4"
        >
            {/* Category header */}
            <div className="mb-3 flex items-center border-b border-slate-700 pb-2">
                <CategoryIcon className="mr-2 h-4 w-4 text-slate-400" />
                <h2 className="font-mono font-semibold text-sm text-white">
                    {displayName}
                </h2>

                {/* Compatibility note indicator */}
                {note?.hasIssue && (
                    <div className="group relative ml-2">
                        <Info className="h-4 w-4 cursor-help text-yellow-400" />
                        <div className="absolute left-0 top-6 z-50 hidden w-64 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl group-hover:block pointer-events-none">
                            <ul className="list-disc space-y-1 pl-4 text-xs text-slate-300">
                                {note.notes.map((noteText, i) => (
                                    <li key={i}>{noteText}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {options.map((tech, index) => {
                    const selected = isSelected(tech.id);
                    const compatible = isOptionCompatible(stack, category, tech.id);
                    const reason = !compatible
                        ? getDisabledReason(stack, category, tech.id)
                        : null;

                    return (
                        <motion.div
                            key={tech.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <TechCard
                                tech={tech}
                                isSelected={selected}
                                isDisabled={!compatible}
                                disabledReason={reason}
                                onClick={() => onSelect(category, tech.id)}
                            />
                        </motion.div>
                    );
                })}
            </div>
        </motion.section>
    );
}
