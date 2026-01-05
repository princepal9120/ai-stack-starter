import { cn } from "../../lib/utils";

type FeatureCardProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
    variant?: "default" | "purple" | "blue" | "green";
    className?: string;
};

export function FeatureCard({
    icon,
    title,
    description,
    variant = "default",
    className,
}: FeatureCardProps) {
    const iconColors = {
        default: "bg-slate-500/10 text-slate-400",
        purple: "bg-purple-500/10 text-purple-400",
        blue: "bg-blue-500/10 text-blue-400",
        green: "bg-green-500/10 text-green-400",
    };

    return (
        <div
            className={cn(
                "group p-8 rounded-2xl border border-slate-800 bg-slate-900/20",
                "hover:bg-slate-900/40 hover:border-purple-500/30 transition-all duration-300",
                className
            )}
        >
            <div
                className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                    iconColors[variant]
                )}
            >
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}
