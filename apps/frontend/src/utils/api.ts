// API Client Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ChatRequest {
    message: string;
    conversation_id?: string;
}

interface ChatResponse {
    response: string;
    sources: string[];
    conversation_id: string;
    tokens_used: number;
    latency_ms: number;
}

interface StreamEvent {
    type: 'sources' | 'token' | 'done' | 'error';
    sources?: Array<{ id: string; text: string; score: number }>;
    content?: string;
    metadata?: { tokens_used: number; latency_ms: number; sources_count: number };
    error?: string;
}

export class APIClient {
    private baseURL: string;

    constructor(baseURL: string = API_URL) {
        this.baseURL = baseURL;
    }

    private async getAuthToken(): Promise<string | null> {
        // Get Clerk token if available
        if (typeof window !== 'undefined') {
            const clerk = (window as any).__clerk_clerk;
            if (clerk?.session) {
                try {
                    return await clerk.session.getToken();
                } catch (error) {
                    console.error('Failed to get Clerk token:', error);
                }
            }
        }
        return null;
    }

    private async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const token = await this.getAuthToken();

        const headers: HeadersInit = {
            ...(options.headers || {}),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        return fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers,
        });
    }

    async chat(message: string, conversationId?: string): Promise<ChatResponse> {
        const response = await this.fetch('/api/v1/chat', {
            method: 'POST',
            body: JSON.stringify({ message, conversation_id: conversationId }),
        });

        if (!response.ok) {
            throw new Error(`Chat failed: ${response.statusText}`);
        }

        return response.json();
    }

    async *chatStream(message: string, conversationId?: string): AsyncGenerator<StreamEvent> {
        const response = await this.fetch('/api/v1/chat/stream', {
            method: 'POST',
            body: JSON.stringify({ message, conversation_id: conversationId }),
        });

        if (!response.ok) {
            throw new Error(`Stream failed: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('No response body');
        }

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            yield data as StreamEvent;
                        } catch (error) {
                            console.error('Failed to parse SSE data:', error);
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    async uploadDocument(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await this.fetch('/api/v1/documents', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        return response.json();
    }

    async listDocuments(limit: number = 20, offset: number = 0): Promise<any> {
        const response = await this.fetch(`/api/v1/documents?limit=${limit}&offset=${offset}`);

        if (!response.ok) {
            throw new Error(`List documents failed: ${response.statusText}`);
        }

        return response.json();
    }

    async deleteDocument(documentId: string): Promise<void> {
        const response = await this.fetch(`/api/v1/documents/${documentId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Delete failed: ${response.statusText}`);
        }
    }
}

// Singleton instance
export const apiClient = new APIClient();
