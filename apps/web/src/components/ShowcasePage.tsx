"use client";

import { useState } from "react";
import { FiBox, FiExternalLink, FiArrowRight, FiPlus, FiUsers } from "react-icons/fi";
import { SiOpenai, SiAnthropic, SiGoogle, SiDocker, SiKubernetes, SiRedis, SiGithub } from "react-icons/si";
import { Brain, Database, Server, Globe, Code, Shield, Terminal, Filter } from "lucide-react";

type ShowcaseProject = {
    id: string;
    name: string;
    description: string;
    tags: string[];
    tagIcons: Record<string, React.ElementType>;
    color: string;
    category: string;
    sourceUrl?: string;
    liveUrl?: string;
};

const SHOWCASE_PROJECTS: ShowcaseProject[] = [
    {
        id: "enterprise-rag",
        name: "Enterprise RAG Platform",
        description: "Internal knowledge base with 10M+ documents for a Fortune 500 company.",
        tags: ["OpenAI", "Qdrant", "K8s"],
        tagIcons: { OpenAI: SiOpenai, Qdrant: Database, K8s: SiKubernetes },
        color: "bg-purple-500",
        category: "Enterprise",
        sourceUrl: "#",
    },
    {
        id: "legal-analyst",
        name: "Legal Contract Analyst",
        description: "AI-powered contract review system utilizing running Llama 3 locally for privacy.",
        tags: ["Ollama", "pgvector", "Docker"],
        tagIcons: { Ollama: Terminal, pgvector: Database, Docker: SiDocker },
        color: "bg-emerald-500",
        category: "Enterprise",
        sourceUrl: "#",
    },
    {
        id: "medical-assistant",
        name: "Medical Research Assistant",
        description: "Multimodal analysis of medical journals and imaging using Gemini 1.5 Pro.",
        tags: ["Gemini", "Weaviate", "Cloud Run"],
        tagIcons: { Gemini: SiGoogle, Weaviate: Database, "Cloud Run": Globe },
        color: "bg-blue-500",
        category: "Healthcare",
        sourceUrl: "#",
    },
    {
        id: "code-reviewer",
        name: "AI Code Reviewer",
        description: "Automated PR review agent integrating with GitHub Actions and SonarQube.",
        tags: ["Anthropic", "Redis", "Vercel"],
        tagIcons: { Anthropic: SiAnthropic, Redis: SiRedis, Vercel: Globe },
        color: "bg-orange-500",
        category: "DevTools",
        sourceUrl: "#",
    },
    {
        id: "support-bot",
        name: "Customer Support Bot",
        description: "Fine-tuned model for tier-1 support automation with human handoff.",
        tags: ["Fine-tuning", "LangChain", "AWS"],
        tagIcons: { "Fine-tuning": Brain, LangChain: Code, AWS: Server },
        color: "bg-pink-500",
        category: "Enterprise",
        sourceUrl: "#",
    },
    {
        id: "security-analyzer",
        name: "Security Vulnerability Scanner",
        description: "AI agent that analyzes codebases for security vulnerabilities and suggests fixes.",
        tags: ["OpenAI", "GitHub", "Docker"],
        tagIcons: { OpenAI: SiOpenai, GitHub: SiGithub, Docker: SiDocker },
        color: "bg-red-500",
        category: "DevTools",
        sourceUrl: "#",
    },
    {
        id: "doc-generator",
        name: "API Documentation Generator",
        description: "Automatically generates comprehensive API docs from code comments and types.",
        tags: ["Anthropic", "TypeScript", "Vercel"],
        tagIcons: { Anthropic: SiAnthropic, TypeScript: Code, Vercel: Globe },
        color: "bg-cyan-500",
        category: "Open Source",
        sourceUrl: "#",
    },
    {
        id: "clinical-trials",
        name: "Clinical Trials Matcher",
        description: "Matches patients with relevant clinical trials based on medical records and criteria.",
        tags: ["Gemini", "Qdrant", "HIPAA"],
        tagIcons: { Gemini: SiGoogle, Qdrant: Database, HIPAA: Shield },
        color: "bg-teal-500",
        category: "Healthcare",
        sourceUrl: "#",
    },
];

const CATEGORIES = [
    { id: "all", name: "All Projects", count: SHOWCASE_PROJECTS.length },
    { id: "enterprise", name: "Enterprise", count: SHOWCASE_PROJECTS.filter(p => p.category === "Enterprise").length },
    { id: "opensource", name: "Open Source", count: SHOWCASE_PROJECTS.filter(p => p.category === "Open Source").length },
    { id: "healthcare", name: "Healthcare", count: SHOWCASE_PROJECTS.filter(p => p.category === "Healthcare").length },
    { id: "devtools", name: "DevTools", count: SHOWCASE_PROJECTS.filter(p => p.category === "DevTools").length },
];

function ProjectCard({ project }: { project: ShowcaseProject }) {
    return (
        <div className="group relative rounded-xl border border-slate-800 bg-slate-900/50 p-6 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500" />

            <div className="relative z-10">
                {/* Header with icon */}
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${project.color} flex items-center justify-center shadow-lg`}>
                        <FiBox className="w-5 h-5 text-white/90" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{project.name}</h3>
                </div>

                {/* Description */}
                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                    {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => {
                        const TagIcon = project.tagIcons[tag];
                        return (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/50 text-xs font-mono text-slate-300"
                            >
                                {TagIcon && <TagIcon className="w-3 h-3 text-slate-400" />}
                                {tag}
                            </span>
                        );
                    })}
                </div>

                {/* Action link */}
                <a
                    href={project.sourceUrl || "#"}
                    className="inline-flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors group/link"
                >
                    View Source
                    <FiArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                </a>
            </div>
        </div>
    );
}

export function ShowcasePage() {
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredProjects = activeCategory === "all"
        ? SHOWCASE_PROJECTS
        : SHOWCASE_PROJECTS.filter(
            (p) => p.category.toLowerCase().replace(/\s+/g, "") === activeCategory
        );

    return (
        <div className="pt-24 pb-20 px-4 min-h-screen max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <div className="flex-1">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        Built with{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            AI Stack
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Discover production applications built by the community.
                    </p>
                </div>

                {/* Mobile category filter */}
                <div className="lg:hidden mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">Filter by category</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeCategory === cat.id
                                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                        : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white"
                                    }`}
                            >
                                {cat.name} ({cat.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>

                {/* Empty state */}
                {filteredProjects.length === 0 && (
                    <div className="text-center py-16 text-slate-400">
                        <FiBox className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No projects found in this category.</p>
                    </div>
                )}
            </div>

            {/* Right Sidebar */}
            <aside className="w-full lg:w-72 shrink-0 space-y-6">
                {/* Submit CTA */}
                <div className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-purple-900/20 to-slate-900/50 p-6 backdrop-blur-sm">
                    <h3 className="font-bold text-white mb-2">Build something?</h3>
                    <p className="text-sm text-slate-400 mb-6">
                        Submit your project to be featured in our showcase.
                    </p>
                    <a
                        href="https://github.com/princepal9120/ai-stack/issues/new?template=showcase-submission.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors shadow-lg shadow-purple-500/10"
                    >
                        <FiPlus className="w-4 h-4" />
                        Submit Project
                    </a>
                </div>

                {/* Categories Filter (Desktop) */}
                <div className="hidden lg:block">
                    <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-4 px-1">
                        Categories
                    </h3>
                    <nav className="space-y-1">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveCategory(cat.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${activeCategory === cat.id
                                        ? "bg-purple-500/10 text-purple-400 font-medium"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                    }`}
                            >
                                {cat.name}
                                <span
                                    className={`text-xs ${activeCategory === cat.id
                                            ? "text-purple-500"
                                            : "text-slate-600 group-hover:text-slate-500"
                                        }`}
                                >
                                    {cat.count}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Community Section */}
                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/30">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                        <FiUsers className="w-4 h-4 text-purple-400" />
                        Community
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                        Join 5,000+ engineers building functionality not boilerplate.
                    </p>
                    <a
                        href="https://discord.gg/ai-stack"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                    >
                        Join Discord
                        <FiExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </aside>
        </div>
    );
}
