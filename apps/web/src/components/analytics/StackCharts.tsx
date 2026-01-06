import type { AggregatedAnalyticsData } from "./types";
import { getColor } from "./types";

function ChartCard({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="group rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all hover:border-white/20">
            <div className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs">$</span>
                            <span className="font-semibold font-mono text-sm text-white">{title}</span>
                        </div>
                        <p className="text-slate-400 text-xs">{description}</p>
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}

function DistributionChart({ data }: { data: Array<{ name: string; value: number }> }) {
    if (!data || data.length === 0) {
        return <div className="h-[200px] flex items-center justify-center text-slate-500">No data available</div>;
    }

    const maxValue = Math.max(...data.map((d) => d.value || 0));

    return (
        <div className="space-y-3 mt-4">
            {data.slice(0, 8).map((item, index) => {
                const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                return (
                    <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-mono truncate max-w-[60%]">{item.name}</span>
                            <span className="text-slate-400">{item.value.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: getColor(index),
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function StackCharts({ data }: { data: AggregatedAnalyticsData }) {
    const {
        architectureDistribution,
        databaseDistribution,
        authDistribution,
        llmProviderDistribution,
        addonsDistribution,
    } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <span className="font-bold text-xl text-white">STACK_DISTRIBUTION</span>
                <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="architecture.dist" description="Architecture selection">
                    <DistributionChart data={architectureDistribution} />
                </ChartCard>

                <ChartCard title="database.dist" description="Database selection">
                    <DistributionChart data={databaseDistribution} />
                </ChartCard>

                <ChartCard title="auth.dist" description="Authentication selection">
                    <DistributionChart data={authDistribution} />
                </ChartCard>

                <ChartCard title="llm_provider.dist" description="LLM provider selection">
                    <DistributionChart data={llmProviderDistribution} />
                </ChartCard>

                <ChartCard title="addons.dist" description="Add-ons selected">
                    <DistributionChart data={addonsDistribution} />
                </ChartCard>
            </div>
        </div>
    );
}
