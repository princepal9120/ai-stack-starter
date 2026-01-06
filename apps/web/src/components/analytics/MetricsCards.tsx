import { Terminal, TrendingUp, Server, Database, Shield, Cpu } from "lucide-react";
import type { AggregatedAnalyticsData } from "./types";

type MetricCardProps = {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    highlight?: boolean;
};

function MetricCard({ title, value, subtitle, icon, highlight }: MetricCardProps) {
    return (
        <div className="group cursor-default rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-slate-800/50">
            <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-mono text-slate-400 text-xs uppercase tracking-wide">
                        {icon}
                        {title}
                    </span>
                </div>

                <div
                    className={`truncate font-bold font-mono text-2xl ${highlight ? "text-white" : "text-white"}`}
                >
                    {typeof value === "number" ? value.toLocaleString() : value}
                </div>

                <div className="border-slate-800 border-t pt-3">
                    <p className="truncate font-mono text-slate-500 text-xs">{subtitle}</p>
                </div>
            </div>
        </div>
    );
}

export function MetricsCards({ data }: { data: AggregatedAnalyticsData }) {
    const { summary, totalProjects, avgProjectsPerDay } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <span className="font-bold text-xl text-white">KEY_METRICS</span>
                <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="TOTAL_PROJECTS"
                    value={totalProjects}
                    subtitle="Projects created with CLI"
                    icon={<Terminal className="h-4 w-4" />}
                    highlight
                />
                <MetricCard
                    title="AVG_PER_DAY"
                    value={Number(avgProjectsPerDay.toFixed(1))}
                    subtitle="Average daily creations"
                    icon={<TrendingUp className="h-4 w-4" />}
                    highlight
                />
                <MetricCard
                    title="TOP_ARCHITECTURE"
                    value={summary.mostPopularArchitecture}
                    subtitle="Most selected architecture"
                    icon={<Server className="h-4 w-4" />}
                />
                <MetricCard
                    title="TOP_DATABASE"
                    value={summary.mostPopularDatabase}
                    subtitle="Most selected database"
                    icon={<Database className="h-4 w-4" />}
                />
                <MetricCard
                    title="TOP_AUTH"
                    value={summary.mostPopularAuth}
                    subtitle="Most selected auth"
                    icon={<Shield className="h-4 w-4" />}
                />
                <MetricCard
                    title="TOP_LLM"
                    value={summary.mostPopularLLM}
                    subtitle="Most selected LLM provider"
                    icon={<Cpu className="h-4 w-4" />}
                />
            </div>
        </div>
    );
}
