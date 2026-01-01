export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px]" />
                <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800/50 mb-8 backdrop-blur-sm">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm text-slate-300 font-medium">v1.0 Public Beta</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
                    Build AI Apps <br />
                    <span className="text-gradient">Without Limits</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                    The only production-ready boilerplate that lets you swap <br className="hidden md:block" />
                    <span className="text-slate-100 font-medium">LLMs</span>,
                    <span className="text-slate-100 font-medium"> Vector DBs</span>, and
                    <span className="text-slate-100 font-medium"> Auth Providers</span> with one line of code.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="#builder" className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:scale-105 transition duration-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        Start Building
                    </a>
                    <a href="/docs" className="px-8 py-4 bg-slate-900/50 text-white rounded-full font-bold text-lg border border-slate-800 hover:bg-slate-800/50 hover:border-slate-700 transition duration-200">
                        Read Documentation
                    </a>
                </div>

                {/* CLI Preview */}
                <div className="mt-20 max-w-3xl mx-auto perspective-1000">
                    <div className="glass-panel p-4 transform rotate-x-12 scale-95 opacity-80 hover:rotate-0 hover:scale-100 hover:opacity-100 transition duration-700 text-left font-mono text-sm leading-relaxed shadow-2xl">
                        <div className="flex gap-2 mb-4 border-b border-slate-800 pb-4">
                            <div className="w-3 h-3 rounded-full bg-slate-700" />
                            <div className="w-3 h-3 rounded-full bg-slate-700" />
                            <div className="w-3 h-3 rounded-full bg-slate-700" />
                        </div>
                        <div>
                            <span className="text-green-400">➜</span> <span className="text-blue-400">~</span> npx create-ai-stack@latest
                        </div>
                        <div className="mt-2 text-slate-300">
                            <span className="text-green-400">?</span> <span className="font-bold">Select LLM Provider</span>
                            <div className="ml-4 mt-1 text-cyan-400">❯ OpenAI (GPT-4)</div>
                            <div className="ml-4 text-slate-500">  Anthropic (Claude 3)</div>
                            <div className="ml-4 text-slate-500">  Gemini (1.5 Pro)</div>
                            <div className="ml-4 text-slate-500">  Ollama (Local)</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
