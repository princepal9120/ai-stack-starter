/**
 * Shared TypeScript types for the AI application
 */

export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt?: Date;
    toolInvocations?: ToolInvocation[];
}

export interface ToolInvocation {
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
    result?: unknown;
    state: "pending" | "result" | "error";
}

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
}

export interface ApiError {
    error: string;
    message: string;
    statusCode: number;
}

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    publishedDate?: string;
}

export interface WeatherData {
    temp: number;
    condition: string;
    city: string;
}

export interface FlightData {
    airline: string;
    flightNumber: string;
    departure: string;
    arrival: string;
    status: string;
}

export interface MovieResult {
    title: string;
    release_date: string;
    overview: string;
}
