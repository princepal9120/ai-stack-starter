import { useState } from "react";
import type { AggregatedAnalyticsData, Distribution } from "./types";
import { AnalyticsHeader } from "./AnalyticsHeader";
import { MetricsCards } from "./MetricsCards";
import { TimelineCharts } from "./TimelineCharts";
import { StackCharts } from "./StackCharts";

// Mock data for initial render - will be replaced with real Convex data
function getMockData(): AggregatedAnalyticsData {
    return {
        lastUpdated: new Date().toISOString(),
        totalProjects: 1247,
        avgProjectsPerDay: 42.3,
        timeSeries: [
            { date: "2024-12-01", count: 45 },
            { date: "2024-12-02", count: 38 },
            { date: "2024-12-03", count: 52 },
            { date: "2024-12-04", count: 41 },
            { date: "2024-12-05", count: 55 },
            { date: "2024-12-06", count: 48 },
            { date: "2024-12-07", count: 62 },
            { date: "2024-12-08", count: 39 },
            { date: "2024-12-09", count: 44 },
            { date: "2024-12-10", count: 51 },
            { date: "2024-12-11", count: 47 },
            { date: "2024-12-12", count: 58 },
            { date: "2024-12-13", count: 43 },
            { date: "2024-12-14", count: 49 },
        ],
        monthlyTimeSeries: [
            { month: "2024-10", count: 312 },
            { month: "2024-11", count: 487 },
            { month: "2024-12", count: 448 },
        ],
        hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
            hour: `${String(i).padStart(2, "0")}:00`,
            count: Math.floor(Math.random() * 80) + 20,
        })),
        platformDistribution: [
            { name: "darwin", value: 523 },
            { name: "linux", value: 412 },
            { name: "win32", value: 312 },
        ],
        packageManagerDistribution: [
            { name: "npm", value: 687 },
            { name: "pnpm", value: 342 },
            { name: "yarn", value: 218 },
        ],
        architectureDistribution: [
            { name: "nextjs", value: 789 },
            { name: "fastapi", value: 312 },
            { name: "typescript", value: 146 },
        ],
        databaseDistribution: [
            { name: "neon", value: 456 },
            { name: "supabase", value: 389 },
            { name: "turso", value: 234 },
            { name: "sqlite", value: 168 },
        ],
        ormDistribution: [
            { name: "drizzle", value: 1089 },
            { name: "prisma", value: 158 },
        ],
        authDistribution: [
            { name: "better-auth", value: 534 },
            { name: "nextauth", value: 312 },
            { name: "clerk", value: 245 },
            { name: "none", value: 156 },
        ],
        llmProviderDistribution: [
            { name: "openai", value: 678 },
            { name: "anthropic", value: 389 },
            { name: "novita", value: 180 },
        ],
        addonsDistribution: [
            { name: "tailwind", value: 1123 },
            { name: "biome", value: 456 },
            { name: "pwa", value: 234 },
            { name: "analytics", value: 189 },
        ],
        nodeVersionDistribution: [
            { version: "v20", count: 678 },
            { version: "v18", count: 456 },
            { version: "v22", count: 113 },
        ],
        cliVersionDistribution: [
            { version: "1.2.0", count: 534 },
            { version: "1.1.0", count: 412 },
            { version: "1.0.0", count: 301 },
        ],
        summary: {
            mostPopularArchitecture: "nextjs",
            mostPopularDatabase: "neon",
            mostPopularAuth: "better-auth",
            mostPopularLLM: "openai",
        },
    };
}

function recordToDistribution(record: Record<string, number>): Distribution {
    return Object.entries(record)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
}

function getMostPopular(dist: Distribution): string {
    return dist.length > 0 ? dist[0].name : "none";
}

export function AnalyticsPage() {
    const [data] = useState<AggregatedAnalyticsData>(getMockData());

    // Note: To enable real Convex data, you'll need to configure the Convex provider
    // and replace getMockData() with actual Convex queries

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto space-y-12 px-4 py-8 pt-24 max-w-7xl">
                <AnalyticsHeader lastUpdated={data.lastUpdated} />
                <MetricsCards data={data} />
                <TimelineCharts data={data} />
                <StackCharts data={data} />

                <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-sm">
                    <strong className="text-white">Note:</strong> Currently showing demo data. To enable real analytics, deploy the Convex backend
                    and configure the <code className="bg-white/10 px-1 rounded text-white">PUBLIC_CONVEX_URL</code> environment variable.
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPage;
