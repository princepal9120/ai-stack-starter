const features = [
    {
        name: 'Zero Vendor Lock-in',
        icon: '🔓',
        color: 'text-purple-400',
        description: 'Swap LLMs (OpenAI, Anthropic, Gemini, Ollama) and Vector DBs (Qdrant, Weaviate, pgvector) with a single environment variable.'
    },
    {
        name: 'Production RAG Pipeline',
        icon: '🔗',
        color: 'text-blue-400',
        description: 'End-to-end ingestion, semantic chunking, embeddings, vector search, and streaming generation. Production-ready from day one.'
    },
    {
        name: 'Dual Authentication',
        icon: '🔐',
        color: 'text-green-400',
        description: 'Modern Clerk auth for frontend users + custom JWT for secure API access. Both work seamlessly together.'
    },
    {
        name: 'Full-Stack Typesafety',
        icon: '🛡️',
        color: 'text-yellow-400',
        description: 'Pydantic V2 models on FastAPI backend, TypeScript throughout the Next.js frontend. Catch errors before runtime.'
    },
    {
        name: 'Infrastructure Ready',
        icon: '🐳',
        color: 'text-cyan-400',
        description: 'Docker Compose for local development with PostgreSQL, Redis, and Qdrant. Ready for cloud deployment.'
    },
    {
        name: 'Modern Stack',
        icon: '⚡',
        color: 'text-red-400',
        description: 'FastAPI async backend, Next.js 15 with App Router, Tailwind CSS, and SQLAlchemy 2.0 with Alembic migrations.'
    }
];

export default function Features() {
    return (
        <section className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-purple-400 text-sm font-medium mb-2">⚡ FEATURES</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Everything you need for{' '}
                        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            production AI
                        </span>
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Stop wiring together AI infrastructure. Start building your product.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <div
                            key={feature.name}
                            className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 hover:bg-slate-800/30 transition-all duration-300"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`text-2xl`}>{feature.icon}</span>
                                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                                    {feature.name}
                                </h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
