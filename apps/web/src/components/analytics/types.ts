export type Distribution = Array<{ name: string; value: number }>;
export type VersionDistribution = Array<{ version: string; count: number }>;
export type TimeSeriesData = Array<{ date: string; count: number }>;
export type MonthlyData = Array<{ month: string; count: number }>;
export type HourlyData = Array<{ hour: string; count: number }>;

export type AggregatedAnalyticsData = {
    lastUpdated: string | null;
    totalProjects: number;
    avgProjectsPerDay: number;
    timeSeries: TimeSeriesData;
    monthlyTimeSeries: MonthlyData;
    hourlyDistribution: HourlyData;
    platformDistribution: Distribution;
    packageManagerDistribution: Distribution;
    architectureDistribution: Distribution;
    databaseDistribution: Distribution;
    ormDistribution: Distribution;
    authDistribution: Distribution;
    llmProviderDistribution: Distribution;
    addonsDistribution: Distribution;
    nodeVersionDistribution: VersionDistribution;
    cliVersionDistribution: VersionDistribution;
    summary: {
        mostPopularArchitecture: string;
        mostPopularDatabase: string;
        mostPopularAuth: string;
        mostPopularLLM: string;
    };
};

export const CHART_COLORS = [
    "hsl(142 76% 36%)",   // green
    "hsl(221 83% 53%)",   // blue
    "hsl(262 83% 58%)",   // purple
    "hsl(24 95% 53%)",    // orange
    "hsl(47 96% 53%)",    // yellow
    "hsl(339 90% 51%)",   // pink
    "hsl(173 80% 40%)",   // teal
    "hsl(291 64% 42%)",   // violet
    "hsl(210 40% 50%)",   // slate
    "hsl(0 72% 51%)",     // red
];

export function getColor(index: number): string {
    return CHART_COLORS[index % CHART_COLORS.length];
}

export function truncateLabel(label: string, maxLength = 16): string {
    if (label.length <= maxLength) return label;
    return `${label.slice(0, maxLength - 1)}...`;
}
