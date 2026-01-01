export default function CLIPreview() {
    return (
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 font-mono text-sm overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-slate-500 text-xs">create-ai-stack</span>
            </div>

            <div className="space-y-2 text-slate-300">
                <div>
                    <span className="text-green-400">?</span> What will your project be called? <span className="text-cyan-400">my-ai-app</span>
                </div>
                <div>
                    <span className="text-green-400">?</span> Select LLM Provider
                </div>
                <div className="ml-4 space-y-1">
                    <div className="text-cyan-400">❯ OpenAI</div>
                    <div className="text-slate-500">  Anthropic</div>
                    <div className="text-slate-500">  Gemini</div>
                    <div className="text-slate-500">  Ollama</div>
                </div>
                <div className="mt-4 pt-2">
                    <span className="text-green-400">✔</span> Vector DB: <span className="text-purple-400">Qdrant</span>
                </div>
                <div>
                    <span className="text-green-400">✔</span> Auth: <span className="text-purple-400">Clerk</span>
                </div>
            </div>
        </div>
    );
}
