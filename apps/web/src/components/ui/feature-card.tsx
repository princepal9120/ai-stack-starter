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
        default: "bg-white/5 text-slate-200",
        purple: "bg-white/5 text-slate-200", // Mapped to monochrome
        blue: "bg-white/5 text-slate-200",   // Mapped to monochrome
        green: "bg-white/5 text-slate-200",  // Mapped to monochrome
    };

    return (
        <div
            className={cn(
                "group p-8 rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm",
                "hover:border-white/20 hover:bg-white/[0.02] transition-all duration-300",
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
