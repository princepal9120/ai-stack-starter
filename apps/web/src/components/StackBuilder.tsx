'use client';

import { useState, useMemo } from 'react';

interface StackOption {
    id: string;
    title: string;
    description: string;
    icon: string;
}

const STACK_OPTIONS = {
    architecture: [
        { id: 'nextjs', title: 'Next.js Fullstack', description: 'App Router, Vercel AI SDK, Drizzle', icon: '🌐' },
        { id: 'fastapi', title: 'FastAPI (Python)', description: 'Async Python + Next.js Frontend', icon: '🐍' },
        { id: 'typescript', title: 'TypeScript Backend', description: 'Hono/NestJS + Next.js', icon: '📦' },
    ],
    database: [
        { id: 'neon', title: 'Neon', description: 'Serverless PostgreSQL', icon: '🐘' },
        { id: 'supabase', title: 'Supabase', description: 'Postgres + Auth + Realtime', icon: '🔥' },
        { id: 'turso', title: 'Turso', description: 'Edge SQLite', icon: '🪶' },
        { id: 'sqlite', title: 'Local SQLite', description: 'Dev only', icon: '📦' },
    ],
    auth: [
        { id: 'better-auth', title: 'Better Auth', description: 'Modern, type-safe', icon: '🔐' },
        { id: 'nextauth', title: 'NextAuth.js', description: 'Popular, flexible', icon: '🔑' },
        { id: 'clerk', title: 'Clerk', description: 'Managed auth', icon: '🎫' },
        { id: 'none', title: 'None', description: 'Skip auth', icon: '🚫' },
    ],
    llm: [
        { id: 'openai', title: 'OpenAI', description: 'GPT-4 Turbo', icon: '🤖' },
        { id: 'anthropic', title: 'Anthropic', description: 'Claude 3.5 Sonnet', icon: '🧠' },
        { id: 'novita', title: 'Novita AI', description: 'Cheaper, uncensored', icon: '💰' },
    ],
    addons: [
        { id: 'tailwind', title: 'Tailwind CSS', description: 'Utility-first CSS', icon: '🎨' },
        { id: 'biome', title: 'Biome', description: 'Fast linter', icon: '🧹' },
        { id: 'pwa', title: 'PWA', description: 'Installable app', icon: '📱' },
        { id: 'analytics', title: 'Analytics', description: 'Vercel Analytics', icon: '📊' },
    ],
};

function OptionCard({
    option,
    selected,
    onClick,
    multi = false,
}: {
    option: StackOption;
    selected: boolean;
    onClick: () => void;
    multi?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`
                relative p-4 rounded-xl border-2 text-left transition-all duration-200
                ${selected
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                }
            `}
        >
            <div className="flex items-start gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div>
                    <h4 className="font-semibold text-white">{option.title}</h4>
                    <p className="text-sm text-slate-400">{option.description}</p>
                </div>
            </div>
            {selected && (
                <div className="absolute top-2 right-2">
                    <span className="text-purple-400">{multi ? '☑' : '●'}</span>
                </div>
            )}
        </button>
    );
}

export default function StackBuilder() {
    const [architecture, setArchitecture] = useState('nextjs');
    const [database, setDatabase] = useState('neon');
    const [auth, setAuth] = useState('better-auth');
    const [llm, setLlm] = useState('openai');
    const [addons, setAddons] = useState<string[]>(['tailwind']);
    const [copied, setCopied] = useState(false);

    const command = useMemo(() => {
        const parts = ['npx create-ai-stack-starter@latest my-app'];

        if (architecture === 'nextjs') {
            parts.push('--next');
        } else if (architecture === 'fastapi') {
            parts.push('--fastapi');
        }

        return parts.join(' ');
    }, [architecture]);

    const fullCommand = `${command}\n\n# Then select: ${database} database, ${auth} auth, ${llm} LLM`;

    const toggleAddon = (id: string) => {
        setAddons(prev =>
            prev.includes(id)
                ? prev.filter(a => a !== id)
                : [...prev, id]
        );
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Architecture */}
            <section className="mb-10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-purple-400">1.</span> Architecture
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {STACK_OPTIONS.architecture.map(option => (
                        <OptionCard
                            key={option.id}
                            option={option}
                            selected={architecture === option.id}
                            onClick={() => setArchitecture(option.id)}
                        />
                    ))}
                </div>
            </section>

            {/* Only show these for Next.js */}
            {architecture === 'nextjs' && (
                <>
                    {/* Database */}
                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-purple-400">2.</span> Database
                        </h2>
                        <div className="grid md:grid-cols-4 gap-4">
                            {STACK_OPTIONS.database.map(option => (
                                <OptionCard
                                    key={option.id}
                                    option={option}
                                    selected={database === option.id}
                                    onClick={() => setDatabase(option.id)}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Auth */}
                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-purple-400">3.</span> Authentication
                        </h2>
                        <div className="grid md:grid-cols-4 gap-4">
                            {STACK_OPTIONS.auth.map(option => (
                                <OptionCard
                                    key={option.id}
                                    option={option}
                                    selected={auth === option.id}
                                    onClick={() => setAuth(option.id)}
                                />
                            ))}
                        </div>
                    </section>
                </>
            )}

            {/* LLM */}
            <section className="mb-10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-purple-400">{architecture === 'nextjs' ? '4.' : '2.'}</span> LLM Provider
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {STACK_OPTIONS.llm.map(option => (
                        <OptionCard
                            key={option.id}
                            option={option}
                            selected={llm === option.id}
                            onClick={() => setLlm(option.id)}
                        />
                    ))}
                </div>
            </section>

            {/* Add-ons */}
            <section className="mb-10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-purple-400">{architecture === 'nextjs' ? '5.' : '3.'}</span> Add-ons
                    <span className="text-sm font-normal text-slate-400">(optional)</span>
                </h2>
                <div className="grid md:grid-cols-4 gap-4">
                    {STACK_OPTIONS.addons.map(option => (
                        <OptionCard
                            key={option.id}
                            option={option}
                            selected={addons.includes(option.id)}
                            onClick={() => toggleAddon(option.id)}
                            multi
                        />
                    ))}
                </div>
            </section>

            {/* Command Output */}
            <section className="sticky bottom-4 mt-8">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Your Command</h3>
                        <button
                            onClick={copyToClipboard}
                            className={`
                                px-4 py-2 rounded-lg font-medium transition-all
                                ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                                }
                            `}
                        >
                            {copied ? '✓ Copied!' : 'Copy Command'}
                        </button>
                    </div>
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm">
                        <span className="text-slate-500">$</span>{' '}
                        <span className="text-green-400">{command}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-3">
                        Run this command, then select: <strong>{database}</strong> database, <strong>{auth}</strong> auth, <strong>{llm}</strong> LLM
                        {addons.length > 0 && <>, and <strong>{addons.join(', ')}</strong> add-ons</>}
                    </p>
                </div>
            </section>
        </div>
    );
}
