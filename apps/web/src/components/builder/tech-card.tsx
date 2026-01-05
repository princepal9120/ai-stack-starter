import { cn } from "../../lib/utils";
import type { TechOption } from "../../lib/stack-constants";

type TechCardProps = {
    tech: TechOption;
    isSelected: boolean;
    isDisabled: boolean;
    disabledReason?: string | null;
    onClick: () => void;
};

export function TechCard({
    tech,
    isSelected,
    isDisabled,
    disabledReason,
    onClick,
}: TechCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            title={disabledReason || undefined}
            className={cn(
                "relative flex w-full cursor-pointer flex-col rounded-lg border p-3 text-left transition-all",
                "hover:scale-[1.02] active:scale-[0.98]",
                isSelected
                    ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/50"
                    : isDisabled
                        ? "border-slate-700 bg-slate-900/50 opacity-50 cursor-not-allowed"
                        : "border-slate-700 bg-slate-900 hover:border-slate-600 hover:bg-slate-800/50"
            )}
        >
            {/* Selected indicator */}
            {isSelected && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500">
                    <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
            )}

            {/* Badge for pricing indicator */}
            {tech.badge && (
                <span
                    className={cn(
                        "absolute left-2 top-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                        tech.badge === "free" && "bg-green-500/20 text-green-400",
                        tech.badge === "api-key" && "bg-yellow-500/20 text-yellow-400",
                        tech.badge === "local" && "bg-blue-500/20 text-blue-400",
                        tech.badge === "cloud" && "bg-purple-500/20 text-purple-400"
                    )}
                >
                    {tech.badge === "api-key" ? "API Key" : tech.badge}
                </span>
            )}

            {/* Content */}
            <div className="mt-4 flex items-center gap-2">
                {tech.icon && (
                    <div className={cn("h-5 w-5 shrink-0", tech.className)}>
                        <img
                            src={tech.icon}
                            alt={tech.name}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    </div>
                )}
                <span
                    className={cn(
                        "font-medium text-sm",
                        isSelected ? "text-purple-300" : "text-white"
                    )}
                >
                    {tech.name}
                </span>
            </div>

            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                {tech.description}
            </p>

            {/* Default badge */}
            {tech.default && !isSelected && (
                <span className="absolute bottom-2 right-2 rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400">
                    Default
                </span>
            )}
        </button>
    );
}
