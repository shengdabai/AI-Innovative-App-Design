"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Sparkles, ChevronLeft, Bot, User } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for class merging
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    type: "text" | "image" | "product_card";
    metadata?: unknown;
    timestamp: Date;
};

const INITIAL_MESSAGES: Message[] = [
    {
        id: "1",
        role: "assistant",
        content: "Hi! I'm Xiao Ai, your personal outfit advisor. I see you just uploaded a new dress. Want me to analyze it for you?",
        type: "text",
        timestamp: new Date(),
    },
];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
            type: "text",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue("");

        // Simulate AI Response
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "That sounds great! For a date night, I'd recommend pairing it with pearl earrings to highlight the V-neck design. Would you like to see some shoe recommendations?",
                type: "text",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="flex-none p-4 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-foreground/80" />
                    </Link>
                    <div className="flex flex-col items-center">
                        <span className="font-semibold text-base">Advisor Xiao Ai</span>
                        <span className="text-[10px] text-green-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Online
                        </span>
                    </div>
                    <button className="p-2 -mr-2 hover:bg-muted rounded-full transition-colors">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="max-w-md mx-auto space-y-6 pb-4">
                    <div className="text-center text-xs text-muted-foreground my-4">
                        Today, 10:30 AM
                    </div>

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full gap-3",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "flex-none w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
                                msg.role === "assistant" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>

                            {/* Bubble */}
                            <div className={cn(
                                "flex flex-col gap-1 max-w-[80%]",
                                msg.role === "user" ? "items-end" : "items-start"
                            )}>
                                <div
                                    className={cn(
                                        "p-3 rounded-2xl text-sm shadow-sm",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-card border border-border/50 text-foreground rounded-tl-sm"
                                    )}
                                >
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-muted-foreground px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-none p-4 bg-background border-t border-border/40 pb-safe">
                <div className="max-w-md mx-auto flex items-end gap-2">
                    <button className="p-3 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground transition-colors flex-none">
                        <ImageIcon className="w-5 h-5" />
                    </button>

                    <div className="flex-1 bg-muted/30 rounded-[20px] border border-border/50 focus-within:border-primary/50 focus-within:bg-background transition-all">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask about your outfit..."
                            className="w-full h-11 px-4 bg-transparent outline-none text-sm placeholder:text-muted-foreground/70"
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="p-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all flex-none"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
