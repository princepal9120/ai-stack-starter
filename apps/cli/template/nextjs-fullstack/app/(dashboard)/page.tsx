"use client";

import { useChat } from "ai/react";
import { ChatMessages, ChatInput } from "@/components/chat";
import { signOut, useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
    const { data: session } = useSession();
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
    });

    function onSubmit(message: string) {
        handleInputChange({ target: { value: message } } as React.ChangeEvent<HTMLInputElement>);
        handleSubmit(new Event("submit") as unknown as React.FormEvent);
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="border-b px-4 py-3 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold">AI Command Center</h1>
                    {session?.user?.email && (
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="text-muted-foreground"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </Button>
            </header>

            {/* Chat Area */}
            <ChatMessages
                messages={messages.map((m) => ({
                    id: m.id,
                    role: m.role as "user" | "assistant",
                    content: m.content,
                    toolInvocations: m.toolInvocations?.map((t) => ({
                        toolCallId: t.toolCallId,
                        toolName: t.toolName,
                        args: t.args as Record<string, unknown>,
                        result: "result" in t ? t.result : undefined,
                        state: t.state as "pending" | "result" | "error",
                    })),
                }))}
                isLoading={isLoading}
            />

            {/* Input */}
            <ChatInput onSubmit={onSubmit} isLoading={isLoading} />
        </div>
    );
}
