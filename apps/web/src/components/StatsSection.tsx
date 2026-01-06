"use client";

import { FiGithub, FiDownload, FiUsers, FiTerminal, FiArrowRight } from "react-icons/fi";

export default function StatsSection() {
    const stats = [
        {
            icon: <FiGithub className="w-5 h-5" />,
            value: "2.5K+",
            label: "GitHub Stars",
        },
        {
            icon: <FiDownload className="w-5 h-5" />,
            value: "10K+",
            label: "Downloads",
        },
        {
            icon: <FiUsers className="w-5 h-5" />,
            value: "500+",
            label: "Developers",
        },
        {
            icon: <FiTerminal className="w-5 h-5" />,
            value: "1.2K+",
            label: "Projects Created",
        },
    ];

    return (
        <section className="py-12 border-y border-slate-900 bg-slate-950/50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <div className="text-purple-400">{stat.icon}</div>
                                <div className="text-3xl font-bold text-white">{stat.value}</div>
                            </div>
                            <div className="text-sm text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </div>
                <div className="text-center">
                    <a
                        href="/analytics"
                        className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        View detailed CLI analytics
                        <FiArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </section>
    );
}

