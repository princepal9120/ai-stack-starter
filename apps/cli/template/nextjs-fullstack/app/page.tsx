import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                        <Sparkles className="h-4 w-4" />
                        AI-Powered Application
                    </div>

                    <h1 className="text-5xl font-bold tracking-tight">
                        AI Command Center
                    </h1>

                    <p className="text-xl text-muted-foreground">
                        Your intelligent assistant with web search, memory, weather, flights,
                        movies, and code execution - all in one place.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="gap-2">
                            <Link href="/register">
                                Get Started
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/login">Sign In</Link>
                        </Button>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="p-6 rounded-xl border bg-card">
                        <Zap className="h-10 w-10 text-primary mb-4" />
                        <h3 className="font-semibold mb-2">AI Tools</h3>
                        <p className="text-sm text-muted-foreground">
                            Web search, weather, flights, movies, and code execution built-in.
                        </p>
                    </div>

                    <div className="p-6 rounded-xl border bg-card">
                        <Sparkles className="h-10 w-10 text-primary mb-4" />
                        <h3 className="font-semibold mb-2">Memory</h3>
                        <p className="text-sm text-muted-foreground">
                            AI remembers your preferences and past conversations.
                        </p>
                    </div>

                    <div className="p-6 rounded-xl border bg-card">
                        <Shield className="h-10 w-10 text-primary mb-4" />
                        <h3 className="font-semibold mb-2">Secure</h3>
                        <p className="text-sm text-muted-foreground">
                            Enterprise-grade authentication with Better Auth.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
