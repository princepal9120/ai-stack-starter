import Link from 'next/link'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-50 mb-6">
                        AI Stack FastAPI
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                        Production-grade RAG-powered chat with vendor-agnostic LLM and Vector DB support.
                    </p>

                    <div className="flex gap-4 justify-center mb-16">
                        <Link
                            href="/chat"
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Start Chatting
                        </Link>
                        <Link
                            href="/documents"
                            className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Upload Documents
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold mb-2">🔒 Dual Authentication</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Clerk (primary) + Custom JWT (fallback) for zero vendor lock-in
                            </p>
                        </div>

                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold mb-2">🤖 Vendor-Agnostic LLM</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                OpenAI, Anthropic, Gemini, Ollama - switch with 1 env var
                            </p>
                        </div>

                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold mb-2">🗄️ Flexible Vector DB</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Qdrant, Weaviate, pgvector - production-ready RAG pipeline
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
