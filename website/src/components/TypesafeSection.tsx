export default function TypesafeSection() {
    return (
        <section className="py-24 px-4 border-y border-slate-800">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left - Text */}
                    <div>
                        <p className="text-purple-400 text-sm font-medium mb-2">📚 DOCUMENTATION</p>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Comprehensive guides for{' '}
                            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                every step
                            </span>
                        </h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            From quick start to production deployment. Learn how to configure LLM providers,
                            set up vector databases, and deploy your AI application to the cloud.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <a href="/docs/architecture" className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-purple-500/50 transition-colors">
                                <span className="text-2xl">🏗️</span>
                                <div>
                                    <h4 className="font-semibold text-white">Architecture</h4>
                                    <p className="text-xs text-slate-500">System design & structure</p>
                                </div>
                            </a>
                            <a href="/docs/llm-providers" className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-purple-500/50 transition-colors">
                                <span className="text-2xl">🧠</span>
                                <div>
                                    <h4 className="font-semibold text-white">LLM Providers</h4>
                                    <p className="text-xs text-slate-500">OpenAI, Anthropic, Gemini</p>
                                </div>
                            </a>
                            <a href="/docs/vector-databases" className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-purple-500/50 transition-colors">
                                <span className="text-2xl">🗄️</span>
                                <div>
                                    <h4 className="font-semibold text-white">Vector Databases</h4>
                                    <p className="text-xs text-slate-500">Qdrant, Weaviate, pgvector</p>
                                </div>
                            </a>
                            <a href="/docs/deployment" className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-purple-500/50 transition-colors">
                                <span className="text-2xl">🚀</span>
                                <div>
                                    <h4 className="font-semibold text-white">Deployment</h4>
                                    <p className="text-xs text-slate-500">Docker & Kubernetes</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Right - Code Preview */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-800/50">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <span className="text-xs text-slate-500 ml-2">example.py</span>
                        </div>
                        <pre className="p-4 text-sm overflow-x-auto">
                            <code className="text-slate-300">
                                {`from app.llm import get_llm_client
from app.rag import get_rag_pipeline

# Auto-configured from LLM_PROVIDER env
llm = get_llm_client()

# Query your documents
pipeline = get_rag_pipeline()

async for chunk in pipeline.query_stream(
    "What is RAG?"
):
    print(chunk["content"], end="")`}
                            </code>
                        </pre>
                    </div>
                </div>
            </div>
        </section>
    );
}
