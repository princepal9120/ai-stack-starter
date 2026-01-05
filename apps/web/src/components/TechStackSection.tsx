"use client";

import { SiNextdotjs, SiReact, SiPython, SiTypescript, SiPostgresql, SiPrisma } from "react-icons/si";
import { TechCard } from "./ui/tech-card";

export default function TechStackSection() {
    const techStack = [
        {
            icon: <SiNextdotjs />,
            name: "Next.js 15",
            description: "React framework for production",
        },
        {
            icon: <SiReact />,
            name: "React 19",
            description: "Modern UI with Server Components",
        },
        {
            icon: <SiPython />,
            name: "FastAPI",
            description: "High-performance Python backend",
        },
        {
            icon: <SiTypescript />,
            name: "TypeScript",
            description: "Type safety everywhere",
        },
        {
            icon: <SiPostgresql />,
            name: "PostgreSQL",
            description: "Reliable relational database",
        },
        {
            icon: <SiPrisma />,
            name: "Prisma / Drizzle",
            description: "Type-safe database ORM",
        },
    ];

    return (
        <section className="py-20 px-4 border-y border-slate-900 bg-slate-950/30">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                        Powered by the modern stack
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        We've curated the best tools in the ecosystem so you don't have to.
                        Whether you prefer full-stack Next.js or a split Python backend, we have you covered.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {techStack.map((tech) => (
                        <TechCard key={tech.name} {...tech} />
                    ))}
                </div>
            </div>
        </section>
    );
}
