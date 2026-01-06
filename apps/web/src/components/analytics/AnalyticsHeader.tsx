import { ExternalLink, Clock, BarChart3 } from "lucide-react";
import type { AggregatedAnalyticsData } from "./types";

export function AnalyticsHeader({ lastUpdated }: { lastUpdated: string | null }) {
    const formattedDate = lastUpdated
        ? new Date(lastUpdated).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "Loading...";

    return (
        <div className="space-y-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-white" />
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            CLI Analytics
                        </h1>
                    </div>
                    <p className="text-slate-400 max-w-xl">
                        Real-time analytics for AI Stack CLI usage. All data is collected anonymously to help improve
                        the developer experience.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>Updated: {formattedDate}</span>
                    </div>
                    <a
                        href="https://github.com/princepal9120/ai-stack/blob/main/apps/cli/src/utils/analytics.ts"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-white/20 text-slate-300 hover:text-white text-sm transition-all"
                    >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Source</span>
                    </a>
                </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <span className="text-white text-2xl">i</span>
                <p className="text-slate-300 text-sm">
                    <strong className="text-white">Privacy First:</strong> We only collect anonymous stack configuration data.
                    No personal information, project names, or IP addresses are stored.
                    <a href="/docs/analytics" className="text-white hover:text-slate-200 ml-1 underline underline-offset-2">Learn more</a>
                </p>
            </div>
        </div>
    );
}
