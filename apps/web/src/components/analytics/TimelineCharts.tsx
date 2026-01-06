import type { AggregatedAnalyticsData } from "./types";
import { CHART_COLORS, getColor } from "./types";

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

function BarChartSimple({
    data,
    dataKey,
    labelKey,
}: {
    data: Array<Record<string, string | number>>;
    dataKey: string;
    labelKey: string;
}) {
    if (!data || data.length === 0) {
        return <div className="h-[200px] flex items-center justify-center text-slate-500">No data available</div>;
    }

    const maxValue = Math.max(...data.map((d) => Number(d[dataKey]) || 0));

    return (
        <div className="space-y-3 mt-4">
            {data.slice(0, 8).map((item, index) => {
                const value = Number(item[dataKey]) || 0;
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                return (
                    <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-mono truncate max-w-[60%]">{String(item[labelKey])}</span>
                            <span className="text-slate-400">{value.toLocaleString()}</span>
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

function PieChartSimple({ data }: { data: Array<{ name: string; value: number }> }) {
    if (!data || data.length === 0) {
        return <div className="h-[200px] flex items-center justify-center text-slate-500">No data available</div>;
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex flex-wrap gap-2">
                {data.slice(0, 6).map((item, index) => {
                    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                    return (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getColor(index) }}
                            />
                            <span className="text-slate-300">{item.name}</span>
                            <span className="text-slate-500">({percentage}%)</span>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                        {data.slice(0, 6).reduce<Array<{ offset: number; element: React.ReactNode }>>((acc, item, index) => {
                            const percentage = total > 0 ? (item.value / total) * 100 : 0;
                            const offset = acc.length > 0 ? acc[acc.length - 1].offset + (acc.length > 0 ? (data[index - 1]?.value / total) * 100 * 2.51 : 0) : 0;
                            const strokeDasharray = `${percentage * 2.51} ${251 - percentage * 2.51}`;
                            acc.push({
                                offset,
                                element: (
                                    <circle
                                        key={index}
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke={getColor(index)}
                                        strokeWidth="20"
                                        strokeDasharray={strokeDasharray}
                                        strokeDashoffset={-offset}
                                    />
                                ),
                            });
                            return acc;
                        }, []).map(item => item.element)}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TimelineCharts({ data }: { data: AggregatedAnalyticsData }) {
    const { timeSeries, platformDistribution, hourlyDistribution } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <span className="font-bold text-xl text-white">TIMELINE_ANALYSIS</span>
                <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="daily_projects.chart" description="Project creations over time">
                    <BarChartSimple data={timeSeries.slice(-14)} dataKey="count" labelKey="date" />
                </ChartCard>

                <ChartCard title="platform_distribution.pie" description="Operating system usage">
                    <PieChartSimple data={platformDistribution} />
                </ChartCard>

                <ChartCard title="hourly_activity.bar" description="Projects by hour (UTC)">
                    <BarChartSimple data={hourlyDistribution} dataKey="count" labelKey="hour" />
                </ChartCard>
            </div>
        </div>
    );
}
