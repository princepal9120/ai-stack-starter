"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/types";

interface ChatBubbleProps {
    message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
    const isUser = message.role === "user";

    return (
        <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5",
                    isUser
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                )}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                </p>

                {message.toolInvocations && message.toolInvocations.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {message.toolInvocations.map((tool) => (
                            <div
                                key={tool.toolCallId}
                                className="text-xs bg-black/10 dark:bg-white/10 rounded px-2 py-1"
                            >
                                <span className="font-medium">Tool: </span>
                                {tool.toolName}
                                {tool.state === "pending" && (
                                    <span className="ml-2 text-yellow-600">⏳ Running...</span>
                                )}
                                {tool.state === "result" && (
                                    <span className="ml-2 text-green-600">✓ Complete</span>
                                )}
                                {tool.state === "error" && (
                                    <span className="ml-2 text-red-600">✗ Failed</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
