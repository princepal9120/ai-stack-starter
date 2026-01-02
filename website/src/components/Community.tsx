const communities = [
    {
        name: 'GitHub',
        icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
        ),
        description: 'Star the repo, submit issues, and contribute via pull requests.',
        href: 'https://github.com/princepal9120/ai-stack',
        color: 'bg-slate-500/10 border-slate-500/30 hover:border-slate-500/50',
        cta: 'View on GitHub'
    },
    {
        name: 'Discussions',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        ),
        description: 'Ask questions, share ideas, and discuss features with the community.',
        href: 'https://github.com/princepal9120/ai-stack/discussions',
        color: 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50',
        cta: 'Join Discussions'
    },
    {
        name: 'Contributing',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        description: 'We welcome contributions! Check out our contributing guide to get started.',
        href: 'https://github.com/princepal9120/ai-stack/blob/main/CONTRIBUTING.md',
        color: 'bg-green-500/10 border-green-500/30 hover:border-green-500/50',
        cta: 'Read Guide'
    }
];

export default function Community() {
    return (
        <section className="py-24 px-4 bg-slate-900/30">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-purple-400 text-sm font-medium mb-2">🤝 COMMUNITY</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Open source and{' '}
                        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            community driven
                        </span>
                    </h2>
                    <p className="text-slate-400">MIT Licensed. Built by developers, for developers.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {communities.map((community) => (
                        <a
                            key={community.name}
                            href={community.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group block p-6 rounded-xl border transition-all duration-300 ${community.color}`}
                        >
                            <div className="inline-flex items-center justify-center mb-4 text-white">
                                {community.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{community.name}</h3>
                            <p className="text-slate-400 text-sm mb-4">{community.description}</p>
                            <span className="text-sm font-medium text-purple-400 group-hover:text-purple-300 transition-colors">
                                {community.cta} →
                            </span>
                        </a>
                    ))}
                </div>

                {/* License */}
                <div className="mt-12 text-center">
                    <p className="text-slate-500 text-sm">
                        MIT © AI Stack Team
                    </p>
                </div>
            </div>
        </section>
    );
}
