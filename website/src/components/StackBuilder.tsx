import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx'; // Added clsx import

const stackOptions = {
    llm: [
        { id: 'openai', name: 'OpenAI', icon: '🤖', desc: 'GPT-4 & Embeddings' },
        { id: 'anthropic', name: 'Anthropic', icon: '🧠', desc: 'Claude 3 Opus/Sonnet' },
        { id: 'gemini', name: 'Gemini', icon: '✨', desc: 'Multimodal 1.5 Pro' },
        { id: 'ollama', name: 'Ollama', icon: '🦙', desc: 'Local Privacy First' },
    ],
    vector: [
        { id: 'qdrant', name: 'Qdrant', icon: '🚀', desc: 'High Performance' },
        { id: 'weaviate', name: 'Weaviate', icon: '🕸️', desc: 'Hybrid Search' },
        { id: 'pgvector', name: 'pgvector', icon: '🐘', desc: 'PostgreSQL Native' },
    ],
    auth: [
        { id: 'clerk', name: 'Clerk', icon: '🔐', desc: 'Complete Auth UI' },
        { id: 'jwt', name: 'Custom JWT', icon: '🔑', desc: 'Full Control' },
    ]
};

export default function StackBuilder() {
    const [stack, setStack] = useState({
        llm: 'openai',
        vector: 'qdrant',
        auth: 'clerk'
    });
    const [copied, setCopied] = useState(false);

    const command = `npx create-ai-stack@latest my-app`;

    const copyCommand = () => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-20">
            <div className="text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold mb-6"
                >
                    <span className="text-gradient">Roll Your Own Stack</span>
                </motion.h2>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
                    Select your preferred components. We'll generate a type-safe, production-ready boilerplate in seconds.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Visualizer */}
                <div className="glass-panel p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                    </div>

                    <div className="mt-8 font-mono space-y-4">
                        <div className="text-slate-500"># Project Configuration</div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-purple-400">LLM_PROVIDER</span>
                                <span className="text-slate-600">=</span>
                                <span className="text-emerald-400">"{stack.llm}"</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-purple-400">VECTOR_DB</span>
                                <span className="text-slate-600">=</span>
                                <span className="text-emerald-400">"{stack.vector}"</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-purple-400">AUTH_MODE</span>
                                <span className="text-slate-600">=</span>
                                <span className="text-emerald-400">"{stack.auth}"</span>
                            </div>
                        </div>

                        <div className="pt-8 pb-4">
                            <div className="flex items-center justify-between bg-slate-950/50 rounded-lg p-4 border border-slate-800 group-hover:border-slate-700 transition">
                                <code className="text-slate-300">$ {command}</code>
                                <button
                                    onClick={copyCommand}
                                    className="text-sm px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 transition text-slate-300"
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-8">
                    {Object.entries(stackOptions).map(([category, options]) => (
                        <div key={category} className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                {category === 'llm' ? 'AI Model Provider' :
                                    category === 'vector' ? 'Vector Database' : 'Authentication'}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {options.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setStack(s => ({ ...s, [category]: opt.id }))}
                                        className={clsx(
                                            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200",
                                            stack[category as keyof typeof stack] === opt.id
                                                ? "bg-primary-500/10 border-primary-500/50 shadow-[0_0_15px_rgba(14,165,233,0.15)]"
                                                : "bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                                        )}
                                    >
                                        <span className="text-2xl">{opt.icon}</span>
                                        <div>
                                            <div className={clsx(
                                                "font-medium",
                                                stack[category as keyof typeof stack] === opt.id ? "text-primary-400" : "text-slate-200"
                                            )}>
                                                {opt.name}
                                            </div>
                                            <div className="text-xs text-slate-500">{opt.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
