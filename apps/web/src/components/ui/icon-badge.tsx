import { cn } from "../../lib/utils";

type IconBadgeProps = {
    icon: React.ReactNode;
    variant?: "primary" | "success" | "warning" | "info" | "purple";
    size?: "sm" | "md" | "lg";
    className?: string;
};

export function IconBadge({
    icon,
    variant = "primary",
    size = "md",
    className,
}: IconBadgeProps) {
    const sizeClasses = {
        sm: "w-8 h-8 text-sm",
        md: "w-12 h-12 text-base",
        lg: "w-16 h-16 text-xl",
    };

    const variantClasses = {
        primary: "bg-blue-500/10 text-blue-400",
        success: "bg-green-500/10 text-green-400",
        warning: "bg-yellow-500/10 text-yellow-400",
        info: "bg-cyan-500/10 text-cyan-400",
        purple: "bg-purple-500/10 text-purple-400",
    };

    return (
        <div
            className={cn(
                "rounded-lg flex items-center justify-center",
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
        >
            {icon}
        </div>
    );
}
