export default function Hero() {
    return (
        <section className="relative pt-24 pb-16 px-4">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-slate-950 to-slate-950 pointer-events-none" />

            <div className="max-w-5xl mx-auto text-center relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-slate-800/50 border border-slate-700 rounded-full text-sm">
                    <span className="text-green-400">●</span>
                    <span className="text-slate-300">Production-ready RAG boilerplate</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                    Build AI apps with<br />
                    <span className="bg-gradient-to-r from-[#DE1D8D] via-[#A855F7] to-[#38BDF8] bg-clip-text text-transparent">
                        zero vendor lock-in
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                    Full-stack FastAPI + Next.js boilerplate with swappable LLMs, vector databases,
                    and production-ready RAG pipeline. Built for real-world AI applications.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                    <a
                        href="/docs/quickstart"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-full transition-all shadow-lg shadow-purple-500/20"
                    >
                        Get Started →
                    </a>
                    <a
                        href="https://github.com/princepal9120/ai-stack"
                        className="px-6 py-3 bg-transparent hover:bg-slate-800/50 text-white font-semibold rounded-full border border-slate-700 transition-colors"
                    >
                        GitHub ↗
                    </a>
                </div>

                {/* CLI Command Box */}
                <div className="inline-flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-full px-6 py-3 font-mono text-sm">
                    <span className="text-slate-500">$</span>
                    <span className="text-slate-300">npx create-ai-stack@latest my-ai-app</span>
                    <button
                        onClick={() => navigator.clipboard.writeText('npx create-ai-stack@latest my-ai-app')}
                        className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                        title="Copy command"
                    >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
                    {['FastAPI', 'Next.js 15', 'OpenAI', 'Anthropic', 'Qdrant', 'PostgreSQL'].map((tech) => (
                        <span
                            key={tech}
                            className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-xs text-slate-400"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
