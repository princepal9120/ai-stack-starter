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
    "hsl(0 0% 100%)",         // White
    "hsl(210 40% 80%)",       // Slate 200
    "hsl(210 40% 60%)",       // Slate 400
    "hsl(210 40% 40%)",       // Slate 600
    "hsl(210 40% 30%)",       // Slate 700
    "hsl(210 40% 20%)",       // Slate 800
    "hsl(0 0% 90%)",          // Gray 200
    "hsl(0 0% 70%)",          // Gray 400
];

export function getColor(index: number): string {
    return CHART_COLORS[index % CHART_COLORS.length];
}

export function truncateLabel(label: string, maxLength = 16): string {
    if (label.length <= maxLength) return label;
    return `${label.slice(0, maxLength - 1)}...`;
}
