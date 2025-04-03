"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { Textarea } from "./textarea";
import { cn } from "../../lib/utils";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
} from "lucide-react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface SuggestedPrompt {
    heading: string;
    prompts: string[];
}

interface VercelV0ChatProps {
    messages: Message[];
    isLoading: boolean;
    onSubmit: (input: string) => void;
    suggestedPrompts: SuggestedPrompt[];
    emptyState?: React.ReactNode;
    messageActions?: (message: Message) => React.ReactNode;
    inputOptions?: React.ReactNode;
}

export function VercelV0Chat({
    messages,
    isLoading,
    onSubmit,
    suggestedPrompts,
    emptyState,
    messageActions,
    inputOptions
}: VercelV0ChatProps) {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                onSubmit(value);
                setValue("");
                adjustHeight(true);
            }
        }
    };

    return (
        <div className="flex flex-col w-full h-full">
            {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    {emptyState || (
                        <div className="text-center">
                            <h1 className="text-4xl font-bold mb-4">How can I help you?</h1>
                            <div className="flex flex-wrap justify-center gap-3 mt-8">
                                {suggestedPrompts.map((section) => (
                                    <div key={section.heading} className="w-full max-w-xs">
                                        <h3 className="text-sm font-medium text-foreground/70 mb-2">{section.heading}</h3>
                                        <div className="space-y-2">
                                            {section.prompts.map((prompt) => (
                                                <button
                                                    key={prompt}
                                                    onClick={() => {
                                                        onSubmit(prompt);
                                                        setValue("");
                                                    }}
                                                    className="w-full p-2 text-left text-sm rounded-lg hover:bg-primary/10 transition-colors"
                                                >
                                                    {prompt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-6 p-4">
                    {messages.map((message, i) => (
                        <div
                            key={i}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                                max-w-3xl rounded-lg p-4 
                                ${message.role === 'user' 
                                    ? 'bg-primary text-primary-foreground ml-12' 
                                    : 'glass-panel mr-12'}
                            `}>
                                <div className="prose prose-invert max-w-none">
                                    {message.content}
                                </div>
                                {messageActions?.(message)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="p-4 glass-panel border-t border-border/20">
                {inputOptions}
                <div className="relative">
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question..."
                        className={cn(
                            "w-full p-3",
                            "resize-none",
                            "bg-background/50",
                            "rounded-lg",
                            "border-none",
                            "focus:ring-1 focus:ring-primary",
                            "text-foreground text-sm",
                            "placeholder:text-foreground/50"
                        )}
                        style={{
                            overflow: "hidden",
                        }}
                    />
                    <button
                        onClick={() => {
                            if (value.trim()) {
                                onSubmit(value);
                                setValue("");
                                adjustHeight(true);
                            }
                        }}
                        disabled={isLoading || !value.trim()}
                        className={cn(
                            "absolute right-3 bottom-3",
                            "p-2 rounded-md",
                            "transition-colors",
                            value.trim() && !isLoading
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-foreground/20 text-foreground/50"
                        )}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground/90 rounded-full animate-spin" />
                        ) : (
                            <ArrowUpIcon className="w-5 h-5" />
                        )}
                        <span className="sr-only">Send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    return (
        <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
}


