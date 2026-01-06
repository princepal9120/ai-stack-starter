/**
 * Returns true if telemetry/analytics should be enabled, false otherwise.
 *
 * - If AI_STACK_TELEMETRY_DISABLED is present and "1", disables analytics.
 * - Otherwise, AI_STACK_TELEMETRY: "0" disables, "1" enables (default: enabled).
 */
export function isTelemetryEnabled(): boolean {
    const AI_STACK_TELEMETRY_DISABLED = process.env.AI_STACK_TELEMETRY_DISABLED;
    const AI_STACK_TELEMETRY = process.env.AI_STACK_TELEMETRY;

    if (AI_STACK_TELEMETRY_DISABLED !== undefined) {
        return AI_STACK_TELEMETRY_DISABLED !== "1";
    }
    if (AI_STACK_TELEMETRY !== undefined) {
        return AI_STACK_TELEMETRY === "1";
    }
    // Default: enabled
    return true;
}
