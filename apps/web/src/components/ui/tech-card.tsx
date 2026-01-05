import { cn } from "../../lib/utils";

type TechCardProps = {
    icon: React.ReactNode;
    name: string;
    badge?: string;
    description?: string;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
};

export function TechCard({
    icon,
    name,
    badge,
    description,
    selected = false,
    onClick,
    className,
}: TechCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "relative p-6 rounded-xl border transition-all duration-300 cursor-pointer",
                selected
                    ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/70",
                onClick && "cursor-pointer",
                className
            )}
        >
            {badge && (
                <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {badge}
                </span>
            )}

            <div className="flex items-center gap-3">
                <div className={cn(
                    "flex-shrink-0 text-2xl",
                    selected ? "text-purple-400" : "text-white"
                )}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={cn(
                        "font-semibold",
                        selected ? "text-purple-300" : "text-slate-200"
                    )}>
                        {name}
                    </h4>
                    {description && (
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {selected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
        </div>
    );
}
