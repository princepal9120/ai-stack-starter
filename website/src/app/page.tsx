'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const techStack = {
    llm: [
        { id: 'openai', name: 'OpenAI', subtitle: 'GPT-4, GPT-3.5-turbo', color: 'from-green-400 to-emerald-600' },
        { id: 'anthropic', name: 'Anthropic', subtitle: 'Claude 3, 200k context', color: 'from-orange-400 to-red-600' },
        { id: 'gemini', name: 'Gemini', subtitle: '2M context, multimodal', color: 'from-blue-400 to-purple-600' },
        { id: 'ollama', name: 'Ollama', subtitle: 'Local models, privacy-first', color: 'from-gray-400 to-gray-700' },
    ],
    vectorDb: [
        { id: 'qdrant', name: 'Qdrant', subtitle: 'Production-ready, billions of vectors', color: 'from-rose-400 to-pink-600' },
        { id: 'weaviate', name: 'Weaviate', subtitle: 'Hybrid search, GraphQL API', color: 'from-cyan-400 to-blue-600' },
        { id: 'pgvector', name: 'pgvector', subtitle: 'PostgreSQL, ACID compliance', color: 'from-indigo-400 to-purple-600' },
    ],
    auth: [
        { id: 'clerk', name: 'Clerk', subtitle: 'Modern auth with UI components', color: 'from-purple-400 to-indigo-600' },
        { id: 'jwt', name: 'JWT', subtitle: 'Custom tokens, full control', color: from - yellow - 400 to- orange - 600' },
    ],
}

export default function HomePage() {
    const [selected, setSelected] = useState({
        llm: 'openai',
        vectorDb: 'qdrant',
        auth: 'clerk',
    })

    const generateCommand = () => {
        return `npx create-ai-stack@latest my-ai-app`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                <nav className="relative z-10 flex items-center justify-between px-8 py-6">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        AI STACK
                    </div>
                    <div className="flex gap-6">
                        <a href="/docs" className="text-gray-300 hover:text-white transition-colors">Docs</a>
                        <a href="/showcase" className="text-gray-300 hover:text-white transition-colors">Showcase</a>
                        <a href="https://github.com/yourusername/ai-stack" className="text-gray-300 hover:text-white transition-colors">
                            GitHub
                        </a>
                    </div>
                </nav>

                <div className="relative z-10 max-w-7xl mx-auto px-8 py-24 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-6xl md:text-8xl font-black mb-6 leading-tight"
                    >
                        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            ROLL YOUR OWN
                        </span>
                        <br />
                        <span className="text-white">AI STACK</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
                    >
                        Modern CLI for scaffolding production-ready RAG applications with
                        <br />
                        <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold">
                            FastAPI, Next.js, and zero vendor lock-in
                        </span>
                    </motion.p>

                    {/* Command Box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="max-w-2xl mx-auto mb-16"
                    >
                        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <span className="text-gray-400 text-sm ml-4">Terminal</span>
                            </div>
                            <div className="font-mono text-left">
                                <span className="text-green-400">$</span>
                                <span className="text-gray-300 ml-2">{generateCommand()}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Interactive Stack Builder */}
            <div className="max-w-7xl mx-auto px-8 py-24">
                <h2 className="text-4xl font-bold text-center mb-4 text-white">
                    ...but ONLY the parts you need
                </h2>
                <p className="text-center text-gray-400 mb-16">
                    Pick what you want, nothing extra
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* LLM Provider */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">🤖 LLM Provider</h3>
                        <div className="space-y-3">
                            {techStack.llm.map((tech) => (
                                <button
                                    key={tech.id}
                                    onClick={() => setSelected({ ...selected, llm: tech.id })}
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${selected.llm === tech.id
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                        }`}
                                >
                                    <div className={`text-left ${selected.llm === tech.id ? 'text-white' : 'text-gray-300'}`}>
                                        <div className="font-semibold">{tech.name}</div>
                                        <div className="text-sm text-gray-400">{tech.subtitle}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Vector DB */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">🗄️ Vector Database</h3>
                        <div className="space-y-3">
                            {techStack.vectorDb.map((tech) => (
                                <button
                                    key={tech.id}
                                    onClick={() => setSelected({ ...selected, vectorDb: tech.id })}
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${selected.vectorDb === tech.id
                                            ? 'border-cyan-500 bg-cyan-500/10'
                                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                        }`}
                                >
                                    <div className={`text-left ${selected.vectorDb === tech.id ? 'text-white' : 'text-gray-300'}`}>
                                        <div className="font-semibold">{tech.name}</div>
                                        <div className="text-sm text-gray-400">{tech.subtitle}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Auth */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">🔐 Authentication</h3>
                        <div className="space-y-3">
                            {techStack.auth.map((tech) => (
                                <button
                                    key={tech.id}
                                    onClick={() => setSelected({ ...selected, auth: tech.id })}
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${selected.auth === tech.id
                                            ? 'border-pink-500 bg-pink-500/10'
                                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                        }`}
                                >
                                    <div className={`text-left ${selected.auth === tech.id ? 'text-white' : 'text-gray-300'}`}>
                                        <div className="font-semibold">{tech.name}</div>
                                        <div className="text-sm text-gray-400">{tech.subtitle}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Selected Stack Preview */}
                <div className="mt-12 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-4">Your Stack</h3>
                    <div className="flex flex-wrap gap-4">
                        <span className="px-4 py-2 bg-purple-500/20 border border-purple-500 rounded-lg text-purple-300 font-medium">
                            {techStack.llm.find(t => t.id === selected.llm)?.name}
                        </span>
                        <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-500 rounded-lg text-cyan-300 font-medium">
                            {techStack.vectorDb.find(t => t.id === selected.vectorDb)?.name}
                        </span>
                        <span className="px-4 py-2 bg-pink-500/20 border border-pink-500 rounded-lg text-pink-300 font-medium">
                            {techStack.auth.find(t => t.id === selected.auth)?.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="max-w-7xl mx-auto px-8 py-24">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-gray-800/30 backdrop-blur-xl border border-gray-700 rounded-2xl">
                        <div className="text-4xl mb-4">⚡</div>
                        <h3 className="text-xl font-bold text-white mb-2">Production-Ready RAG</h3>
                        <p className="text-gray-400">
                            Full pipeline: Document → Chunk → Embed → Search → Generate. Streaming included.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-800/30 backdrop-blur-xl border border-gray-700 rounded-2xl">
                        <div className="text-4xl mb-4">🔓</div>
                        <h3 className="text-xl font-bold text-white mb-2">Zero Lock-in</h3>
                        <p className="text-gray-400">
                            Swap LLM or Vector DB with 1 environment variable. No code changes needed.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-800/30 backdrop-blur-xl border border-gray-700 rounded-2xl">
                        <div className="text-4xl mb-4">📦</div>
                        <h3 className="text-xl font-bold text-white mb-2">Full-Stack</h3>
                        <p className="text-gray-400">
                            FastAPI backend + Next.js 16 frontend. Docker ready. Alembic migrations included.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-12">
                <div className="max-w-7xl mx-auto px-8 text-center text-gray-400">
                    <p>Built with ❤️ by the AI Stack community</p>
                    <p className="mt-2 text-sm">MIT License • Open Source Forever</p>
                </div>
            </footer>
        </div>
    )
}
