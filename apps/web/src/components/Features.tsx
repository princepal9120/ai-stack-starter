"use client";

import { FiLock, FiZap, FiShield, FiHeart, FiTrendingUp, FiCode } from "react-icons/fi";
import { FeatureCard } from "./ui/feature-card";


export default function FeaturesSection() {
    const features = [
        {
            icon: <FiLock className="w-6 h-6" />,
            title: "Zero Lock-in",
            description:
                "Swap LLMs or Vector DBs with one environment variable. No code changes required.",
            variant: "blue" as const,
        },
        {
            icon: <FiZap className="w-6 h-6" />,
            title: "Production-Ready",
            description:
                "Built-in auth, error handling, observability, and cost tracking from day one.",
            variant: "purple" as const,
        },
        {
            icon: <FiShield className="w-6 h-6" />,
            title: "Type Safe",
            description:
                "Full TypeScript + Pydantic across the entire stack with strict type checking.",
            variant: "default" as const,
        },
        {
            icon: <FiHeart className="w-6 h-6" />,
            title: "Open Source",
            description:
                "Free and open source forever. MIT licensed for commercial use.",
            variant: "green" as const,
        },
        {
            icon: <FiTrendingUp className="w-6 h-6" />,
            title: "Scalable",
            description:
                "From MVP to enterprise. Horizontal scaling built into the architecture.",
            variant: "purple" as const,
        },
        {
            icon: <FiCode className="w-6 h-6" />,
            title: "Developer First",
            description:
                "Exceptional DX with hot reload, type hints, and comprehensive documentation.",
            variant: "blue" as const,
        },
    ];

    return (
        <section className="py-32 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-20">
                <h2 className="text-3xl lg:text-5xl font-bold mb-6 bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Everything you need to ship
                </h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    Stop wasting weeks on boilerplate. We've handled the hard parts of building production AI applications.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature) => (
                    <FeatureCard key={feature.title} {...feature} />
                ))}
            </div>
        </section>
    );
}
