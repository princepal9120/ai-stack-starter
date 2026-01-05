"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
    onSubmit: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
}

export function ChatInput({
    onSubmit,
    isLoading,
    placeholder = "Type a message...",
}: ChatInputProps) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        onSubmit(input.trim());
        setInput("");
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={isLoading}
                        rows={1}
                        className="w-full resize-none rounded-xl border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-h-32 disabled:opacity-50"
                    />
                </div>
                <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="rounded-xl h-11 w-11"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </form>
    );
}
