import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const distributionValidator = v.record(v.string(), v.number());

export default defineSchema({
    analyticsEvents: defineTable({
        architecture: v.optional(v.string()),
        database: v.optional(v.string()),
        orm: v.optional(v.string()),
        auth: v.optional(v.string()),
        llmProvider: v.optional(v.string()),
        addons: v.optional(v.array(v.string())),
        packageManager: v.optional(v.string()),
        git: v.optional(v.boolean()),
        install: v.optional(v.boolean()),
        cli_version: v.optional(v.string()),
        node_version: v.optional(v.string()),
        platform: v.optional(v.string()),
    }),

    analyticsStats: defineTable({
        totalProjects: v.number(),
        lastEventTime: v.number(),
        architecture: distributionValidator,
        database: distributionValidator,
        orm: distributionValidator,
        auth: distributionValidator,
        llmProvider: distributionValidator,
        addons: distributionValidator,
        packageManager: distributionValidator,
        platform: distributionValidator,
        git: distributionValidator,
        install: distributionValidator,
        nodeVersion: distributionValidator,
        cliVersion: distributionValidator,
        hourlyDistribution: v.optional(distributionValidator),
    }),

    analyticsDailyStats: defineTable({
        date: v.string(),
        count: v.number(),
    }).index("by_date", ["date"]),
});
