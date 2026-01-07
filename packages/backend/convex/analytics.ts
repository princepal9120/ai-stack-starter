import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

// =============================================================================
// Helper Functions
// =============================================================================

function incrementKey(
    dist: Record<string, number>,
    key: string | undefined
): Record<string, number> {
    if (!key) return dist;
    // Sanitize key to prevent injection
    const safeKey = String(key).slice(0, 50).replace(/[^\w\-_.]/g, "_");
    return { ...dist, [safeKey]: (dist[safeKey] || 0) + 1 };
}

function incrementKeys(
    dist: Record<string, number>,
    keys: string[] | undefined
): Record<string, number> {
    if (!keys || !Array.isArray(keys)) return dist;
    const result = { ...dist };
    for (const key of keys.slice(0, 20)) { // Limit array size
        const safeKey = String(key).slice(0, 50).replace(/[^\w\-_.]/g, "_");
        result[safeKey] = (result[safeKey] || 0) + 1;
    }
    return result;
}

function incrementBool(
    dist: Record<string, number>,
    val: boolean | undefined
): Record<string, number> {
    if (val === undefined) return dist;
    const key = val ? "Yes" : "No";
    return { ...dist, [key]: (dist[key] || 0) + 1 };
}

function getMajorVersion(version: string | undefined): string | undefined {
    if (!version) return undefined;
    const clean = version.startsWith("v") ? version.slice(1) : version;
    const major = clean.split(".")[0];
    // Validate it's a number
    if (!/^\d+$/.test(major)) return undefined;
    return `v${major}`;
}

// Validate string fields for allowed values (prevents garbage data)
const ALLOWED_VALUES = {
    architecture: ["nextjs", "fastapi", "typescript"],
    database: ["neon", "supabase", "turso", "sqlite", "postgres", "mysql"],
    orm: ["drizzle", "prisma", "typeorm", "none"],
    auth: ["better-auth", "nextauth", "clerk", "lucia", "custom", "none"],
    llmProvider: ["openai", "anthropic", "novita", "ollama", "together", "groq", "custom"],
    packageManager: ["npm", "pnpm", "yarn", "bun"],
    platform: ["darwin", "linux", "win32", "freebsd"],
} as const;

function validateField(field: string | undefined, allowedValues: readonly string[]): string | undefined {
    if (!field) return undefined;
    const normalized = String(field).toLowerCase().trim();
    return allowedValues.includes(normalized as never) ? normalized : "other";
}

// =============================================================================
// Ingest Event - Internal mutation called by HTTP handler
// =============================================================================

export const ingestEvent = internalMutation({
    args: {
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
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        // Validate and sanitize input
        const sanitizedArgs = {
            architecture: validateField(args.architecture, ALLOWED_VALUES.architecture),
            database: validateField(args.database, ALLOWED_VALUES.database),
            orm: validateField(args.orm, ALLOWED_VALUES.orm),
            auth: validateField(args.auth, ALLOWED_VALUES.auth),
            llmProvider: validateField(args.llmProvider, ALLOWED_VALUES.llmProvider),
            addons: args.addons?.slice(0, 20).map(a => String(a).slice(0, 50)),
            packageManager: validateField(args.packageManager, ALLOWED_VALUES.packageManager),
            git: args.git,
            install: args.install,
            cli_version: args.cli_version?.slice(0, 20),
            node_version: args.node_version?.slice(0, 20),
            platform: validateField(args.platform, ALLOWED_VALUES.platform),
        };

        // Insert raw event for historical data
        const id = await ctx.db.insert("analyticsEvents", sanitizedArgs);
        const event = await ctx.db.get(id);
        const now = event!._creationTime;

        const hourKey = String(new Date(now).getUTCHours()).padStart(2, "0");

        // Calculate Combination Keys
        const arch = sanitizedArgs.architecture || "none";
        // Since we don't have explicit frontend/backend splitting in this schema like better-t-stack,
        // we use architecture as the main "stack" differentiator.
        const stackKey = arch;

        const db = sanitizedArgs.database || "none";
        const o = sanitizedArgs.orm || "none";
        const dbOrmKey = `${db} + ${o}`;

        // Update aggregated stats atomically
        const existingStats = await ctx.db.query("analyticsStats").first();

        if (existingStats) {
            await ctx.db.patch(existingStats._id, {
                totalProjects: existingStats.totalProjects + 1,
                lastEventTime: now,
                architecture: incrementKey(existingStats.architecture, sanitizedArgs.architecture),
                database: incrementKey(existingStats.database, sanitizedArgs.database),
                orm: incrementKey(existingStats.orm, sanitizedArgs.orm),
                auth: incrementKey(existingStats.auth, sanitizedArgs.auth),
                llmProvider: incrementKey(existingStats.llmProvider, sanitizedArgs.llmProvider),
                addons: incrementKeys(existingStats.addons, sanitizedArgs.addons),
                packageManager: incrementKey(existingStats.packageManager, sanitizedArgs.packageManager),
                platform: incrementKey(existingStats.platform, sanitizedArgs.platform),
                git: incrementBool(existingStats.git, sanitizedArgs.git),
                install: incrementBool(existingStats.install, sanitizedArgs.install),
                nodeVersion: incrementKey(existingStats.nodeVersion, getMajorVersion(sanitizedArgs.node_version)),
                cliVersion: incrementKey(existingStats.cliVersion, sanitizedArgs.cli_version),
                hourlyDistribution: incrementKey(existingStats.hourlyDistribution || {}, hourKey),
                stackCombinations: incrementKey(existingStats.stackCombinations || {}, stackKey),
                dbOrmCombinations: incrementKey(existingStats.dbOrmCombinations || {}, dbOrmKey),
            });
        } else {
            const emptyDist: Record<string, number> = {};
            await ctx.db.insert("analyticsStats", {
                totalProjects: 1,
                lastEventTime: now,
                architecture: incrementKey(emptyDist, sanitizedArgs.architecture),
                database: incrementKey(emptyDist, sanitizedArgs.database),
                orm: incrementKey(emptyDist, sanitizedArgs.orm),
                auth: incrementKey(emptyDist, sanitizedArgs.auth),
                llmProvider: incrementKey(emptyDist, sanitizedArgs.llmProvider),
                addons: incrementKeys(emptyDist, sanitizedArgs.addons),
                packageManager: incrementKey(emptyDist, sanitizedArgs.packageManager),
                platform: incrementKey(emptyDist, sanitizedArgs.platform),
                git: incrementBool(emptyDist, sanitizedArgs.git),
                install: incrementBool(emptyDist, sanitizedArgs.install),
                nodeVersion: incrementKey(emptyDist, getMajorVersion(sanitizedArgs.node_version)),
                cliVersion: incrementKey(emptyDist, sanitizedArgs.cli_version),
                hourlyDistribution: incrementKey(emptyDist, hourKey),
                stackCombinations: incrementKey(emptyDist, stackKey),
                dbOrmCombinations: incrementKey(emptyDist, dbOrmKey),
            });
        }

        // Update daily stats
        const today = new Date(now).toISOString().slice(0, 10);
        const dailyStats = await ctx.db
            .query("analyticsDailyStats")
            .withIndex("by_date", (q) => q.eq("date", today))
            .first();

        if (dailyStats) {
            await ctx.db.patch(dailyStats._id, { count: dailyStats.count + 1 });
        } else {
            await ctx.db.insert("analyticsDailyStats", { date: today, count: 1 });
        }

        return null;
    },
});

// =============================================================================
// Queries - Public read-only access
// =============================================================================

const distributionValidator = v.record(v.string(), v.number());

export const getStats = query({
    args: {},
    returns: v.union(
        v.object({
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
            hourlyDistribution: distributionValidator,
            stackCombinations: distributionValidator,
            dbOrmCombinations: distributionValidator,
        }),
        v.null()
    ),
    handler: async (ctx) => {
        const stats = await ctx.db.query("analyticsStats").first();
        if (!stats) return null;
        return {
            totalProjects: stats.totalProjects,
            lastEventTime: stats.lastEventTime,
            architecture: stats.architecture,
            database: stats.database,
            orm: stats.orm,
            auth: stats.auth,
            llmProvider: stats.llmProvider,
            addons: stats.addons,
            packageManager: stats.packageManager,
            platform: stats.platform,
            git: stats.git,
            install: stats.install,
            nodeVersion: stats.nodeVersion,
            cliVersion: stats.cliVersion,
            hourlyDistribution: stats.hourlyDistribution || {},
            stackCombinations: stats.stackCombinations || {},
            dbOrmCombinations: stats.dbOrmCombinations || {},
        };
    },
});

export const getDailyStats = query({
    args: {
        days: v.optional(v.number()),
    },
    returns: v.array(
        v.object({
            date: v.string(),
            count: v.number(),
        })
    ),
    handler: async (ctx, args) => {
        // Limit to max 365 days to prevent abuse
        const days = Math.min(Math.max(args.days ?? 30, 1), 365);
        const now = Date.now();
        const today = new Date(now).toISOString().slice(0, 10);
        const cutoffDate = new Date(now - (days - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        const allDaily = await ctx.db
            .query("analyticsDailyStats")
            .withIndex("by_date")
            .order("asc")
            .collect();

        return allDaily
            .filter((d) => d.date >= cutoffDate && d.date <= today)
            .map((d) => ({ date: d.date, count: d.count }));
    },
});

export const getRecentEvents = query({
    args: {
        minutes: v.optional(v.number()),
    },
    returns: v.array(
        v.object({
            _id: v.id("analyticsEvents"),
            _creationTime: v.number(),
            architecture: v.optional(v.string()),
            database: v.optional(v.string()),
            orm: v.optional(v.string()),
            auth: v.optional(v.string()),
            llmProvider: v.optional(v.string()),
            platform: v.optional(v.string()),
        })
    ),
    handler: async (ctx, args) => {
        // Limit to max 60 minutes to prevent abuse
        const minutes = Math.min(Math.max(args.minutes ?? 30, 1), 60);
        const cutoff = Date.now() - minutes * 60 * 1000;

        const events = await ctx.db
            .query("analyticsEvents")
            .order("desc")
            .filter((q) => q.gte(q.field("_creationTime"), cutoff))
            .take(100); // Limit results

        // Return only safe fields for live display
        return events.map((e) => ({
            _id: e._id,
            _creationTime: e._creationTime,
            architecture: e.architecture,
            database: e.database,
            orm: e.orm,
            auth: e.auth,
            llmProvider: e.llmProvider,
            platform: e.platform,
        }));
    },
});

// =============================================================================
// Admin Mutations - For maintenance operations
// =============================================================================

export const backfillStats = mutation({
    args: {},
    returns: v.object({
        totalProcessed: v.number(),
        dailyDates: v.number(),
    }),
    handler: async (ctx) => {
        // Clear existing aggregated stats
        const existing = await ctx.db.query("analyticsStats").first();
        if (existing) {
            await ctx.db.delete(existing._id);
        }

        const existingDaily = await ctx.db.query("analyticsDailyStats").collect();
        for (const d of existingDaily) {
            await ctx.db.delete(d._id);
        }

        // Rebuild from raw events
        const events = await ctx.db.query("analyticsEvents").collect();

        const emptyDist: Record<string, number> = {};
        const stats = {
            totalProjects: 0,
            lastEventTime: 0,
            architecture: { ...emptyDist },
            database: { ...emptyDist },
            orm: { ...emptyDist },
            auth: { ...emptyDist },
            llmProvider: { ...emptyDist },
            addons: { ...emptyDist },
            packageManager: { ...emptyDist },
            platform: { ...emptyDist },
            git: { ...emptyDist },
            install: { ...emptyDist },
            nodeVersion: { ...emptyDist },
            cliVersion: { ...emptyDist },
            hourlyDistribution: { ...emptyDist },
            stackCombinations: { ...emptyDist },
            dbOrmCombinations: { ...emptyDist },
        };

        const dailyCounts = new Map<string, number>();

        for (const ev of events) {
            stats.totalProjects++;
            if (ev._creationTime > stats.lastEventTime) {
                stats.lastEventTime = ev._creationTime;
            }

            const hourKey = String(new Date(ev._creationTime).getUTCHours()).padStart(2, "0");
            const arch = ev.architecture || "none";
            const stackKey = arch;
            const db = ev.database || "none";
            const o = ev.orm || "none";
            const dbOrmKey = `${db} + ${o}`;


            stats.architecture = incrementKey(stats.architecture, ev.architecture);
            stats.database = incrementKey(stats.database, ev.database);
            stats.orm = incrementKey(stats.orm, ev.orm);
            stats.auth = incrementKey(stats.auth, ev.auth);
            stats.llmProvider = incrementKey(stats.llmProvider, ev.llmProvider);
            stats.addons = incrementKeys(stats.addons, ev.addons);
            stats.packageManager = incrementKey(stats.packageManager, ev.packageManager);
            stats.platform = incrementKey(stats.platform, ev.platform);
            stats.git = incrementBool(stats.git, ev.git);
            stats.install = incrementBool(stats.install, ev.install);
            stats.nodeVersion = incrementKey(stats.nodeVersion, getMajorVersion(ev.node_version));
            stats.cliVersion = incrementKey(stats.cliVersion, ev.cli_version);
            stats.hourlyDistribution = incrementKey(stats.hourlyDistribution, hourKey);
            stats.stackCombinations = incrementKey(stats.stackCombinations, stackKey);
            stats.dbOrmCombinations = incrementKey(stats.dbOrmCombinations, dbOrmKey);

            const date = new Date(ev._creationTime).toISOString().slice(0, 10);
            dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
        }

        if (stats.totalProjects > 0) {
            await ctx.db.insert("analyticsStats", stats);
        }

        for (const [date, count] of dailyCounts) {
            await ctx.db.insert("analyticsDailyStats", { date, count });
        }

        return {
            totalProcessed: stats.totalProjects,
            dailyDates: dailyCounts.size,
        };
    },
});
