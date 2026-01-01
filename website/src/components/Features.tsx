const features = [
    {
        name: 'FastAPI',
        icon: '⚡',
        color: 'text-green-400',
        description: 'FastAPI is a modern, async Python framework. It\'s fast, type-safe, and generates interactive docs automatically.'
    },
    {
        name: 'TypeScript',
        icon: '📘',
        color: 'text-blue-400',
        description: 'We firmly believe TypeScript will help you be a better developer. Whether you\'re new or seasoned, it leads to smoother building.'
    },
    {
        name: 'RAG Pipeline',
        icon: '🔗',
        color: 'text-purple-400',
        description: 'End-to-end retrieval augmented generation with semantic chunking, embeddings, and vector search. Production-ready from day one.'
    },
    {
        name: 'Qdrant',
        icon: '🚀',
        color: 'text-red-400',
        description: 'Qdrant is a high-performance vector database built in Rust. It provides fast similarity search with rich filtering.'
    },
    {
        name: 'Tailwind CSS',
        icon: '🎨',
        color: 'text-cyan-400',
        description: 'Tailwind CSS is a utility-first CSS framework that helps you build beautiful, responsive designs without any extra configuration.'
    },
    {
        name: 'Clerk Auth',
        icon: '🔐',
        color: 'text-yellow-400',
        description: 'When you need flexible, secure, and scalable auth, Clerk is too notch. It ties into your existing database and provides a simple API.'
    }
];

export default function Features() {
    return (
        <section className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-slate-400 text-sm mb-2">The best of the full stack AI ecosystem...</p>
                    <h2 className="text-3xl md:text-4xl font-bold">
                        ...but <span className="text-purple-400">ONLY</span> the parts you need
                    </h2>
                    <p className="text-slate-400 mt-4">Take what you want and nothing more!</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <div
                            key={feature.name}
                            className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`text-2xl ${feature.color}`}>{feature.icon}</span>
                                <h3 className="text-xl font-bold text-white">{feature.name}</h3>
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
