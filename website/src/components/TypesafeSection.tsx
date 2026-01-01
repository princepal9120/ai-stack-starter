import CLIPreview from './CLIPreview';

export default function TypesafeSection() {
    return (
        <section className="py-24 px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Typesafe From The Start</h2>
                    <p className="text-slate-400 leading-relaxed mb-6">
                        We made create-ai-stack to do one thing: Streamline the setup of a typesafe AI apps WITHOUT compromising modularity.
                    </p>
                    <p className="text-slate-400 leading-relaxed mb-6">
                        After countless projects and many years on this tech, we have lots of opinions and insights. We've done our best to encode them into this CLI.
                    </p>
                    <p className="text-slate-400 leading-relaxed mb-6">
                        This is <strong className="text-white">NOT</strong> an all-inclusive template. <strong className="text-white">We expect you to bring your own libraries</strong>. Check out{' '}
                        <a href="/docs" className="text-purple-400 hover:underline">our other recommendations</a> for things like state management and deployment.
                    </p>
                </div>

                {/* CLI Preview */}
                <div className="lg:pl-8">
                    <CLIPreview />
                </div>
            </div>
        </section>
    );
}
