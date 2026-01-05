"use client";

import { useRef, useEffect } from "react";
import { ChatBubble } from "./chat-bubble";
import type { Message } from "@/types";

interface ChatMessagesProps {
    messages: Message[];
    isLoading?: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Welcome to AI Command Center</h3>
                    <p className="text-sm">Start a conversation or try one of these:</p>
                    <div className="mt-4 space-y-2 text-sm">
                        <p className="text-primary">"What's the weather in Tokyo?"</p>
                        <p className="text-primary">"Search for recent AI news"</p>
                        <p className="text-primary">"Remember that my favorite color is blue"</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
            ))}

            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
