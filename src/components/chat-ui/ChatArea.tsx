import React, { useEffect, useRef } from "react";
import { Copy, ThumbsUp, ThumbsDown, Plus, Mic, ArrowUp, PanelLeftOpen, PanelLeftClose, User } from "lucide-react";
import { ChatMessage } from "@/hooks/useMyRAChat";
import ReactMarkdown from 'react-markdown';

interface ChatAreaProps {
    messages: ChatMessage[];
    input: string;
    setInput: (value: string) => void;
    sendMessage: (e: React.FormEvent) => void;
    isLoading: boolean;
    isTyping: boolean;
    toggleSidebar: () => void;
}

export default function ChatArea({
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    isTyping,
    toggleSidebar
}: ChatAreaProps) {

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Handle Enter key (shift+enter for newline)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // Need to wrap in synthetic event structure to satisfy sendMessage signature
            sendMessage({ preventDefault: () => { } } as React.FormEvent);
        }
    };

    // Helper formatting for AI markdown
    const renderMessageContent = (msg: ChatMessage) => {
        // Strip hidden tags before rendering
        let content = msg.content;
        content = content.replace(/\[\[UPDATE_BUCKET:\s*(\{.*?\})\]\]/g, "");
        content = content.replace(/\[\[SHOW_CHART:\s*(\{.*?\})\]\]/g, "");

        return (
            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#1e1e2f] prose-pre:border prose-pre:border-white/10 max-w-none text-gray-200 text-[15px]">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#1e1e2f] relative">

            {/* Top Navigation Bar */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 shrink-0 z-10 bg-[#1e1e2f]/80 backdrop-blur-sm sticky top-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 -ml-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
                    >
                        <PanelLeftOpen className="w-5 h-5" />
                    </button>

                    <div className="flex gap-2 font-medium text-gray-200 items-center">
                        <span>myRA</span>
                        <span className="text-[10px] bg-[#1e4b8f]/50 text-[#6ea3ff] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-[#2d68ff]/30">Llama3.3 70B</span>
                    </div>
                </div>
            </div>

            {/* Main Scrollable Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                        <div className="w-16 h-16 rounded-2xl bg-[#2d68ff] flex items-center justify-center mb-6 shadow-lg shadow-[#2d68ff]/20">
                            <span className="font-serif text-white text-3xl font-bold tracking-tighter">m</span>
                        </div>
                        <h2 className="text-gray-400 text-lg">Start a new conversation with myRA</h2>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto w-full pt-8 pb-32 px-4 flex flex-col space-y-8">
                        {messages.map((msg, index) => {
                            if (msg.role === 'system') return null;

                            const isUser = msg.role === "user";

                            return (
                                <div key={msg.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>

                                    {/* AI Logo (Left) */}
                                    {!isUser && (
                                        <div className="shrink-0 mr-4 mt-1">
                                            <div className="w-8 h-8 rounded-full bg-[#2d68ff] flex items-center justify-center shadow-sm">
                                                <span className="font-serif text-white text-sm font-bold tracking-tighter">m</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Message Bubble/Card */}
                                    <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-2'}`}>

                                        {/* User visually has a distinct colored bubble */}
                                        {isUser ? (
                                            <div className="bg-[#2d68ff] text-white px-5 py-3 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed shadow-sm">
                                                {msg.content}
                                            </div>
                                        ) : (
                                            // AI visually has dark grey panel with bottom action bar
                                            <div className="bg-[#2a2b36] border border-white/5 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">
                                                <div className="p-5">
                                                    {renderMessageContent(msg)}
                                                </div>

                                                {/* Action Footer for AI msgs */}
                                                <div className="px-3 py-2 bg-[#252630] border-t border-white/5 flex gap-2">
                                                    <button className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors flex items-center gap-1.5 text-xs">
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span>Copy</span>
                                                    </button>
                                                    <div className="w-px h-4 bg-white/10 my-auto mx-1"></div>
                                                    <button className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors">
                                                        <ThumbsUp className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors">
                                                        <ThumbsDown className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Avatar (Right) */}
                                    {isUser && (
                                        <div className="shrink-0 ml-4 mt-1 order-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd8bb] to-[#ffb37b] flex items-center justify-center text-[#9b5110] font-bold text-sm shadow-sm">
                                                KD
                                            </div>
                                        </div>
                                    )}

                                </div>
                            );
                        })}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex w-full justify-start">
                                <div className="shrink-0 mr-4 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-[#2d68ff] flex items-center justify-center shadow-sm">
                                        <span className="font-serif text-white text-sm font-bold tracking-tighter">m</span>
                                    </div>
                                </div>
                                <div className="bg-[#2a2b36] border border-white/5 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area (Sticky Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 pt-10 pb-6 px-4 bg-gradient-to-t from-[#1e1e2f] via-[#1e1e2f]/90 to-transparent">
                <div className="max-w-3xl mx-auto w-full relative">
                    <form
                        onSubmit={sendMessage}
                        className="flex items-end bg-[#2a2b36] border border-white/10 rounded-[24px] shadow-lg p-2 focus-within:ring-1 focus-within:ring-white/20 focus-within:border-white/20 transition-all font-sans"
                    >
                        <button
                            type="button"
                            className="p-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-full transition-colors mb-0.5"
                        >
                            <Plus className="w-5 h-5" />
                        </button>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message myRA..."
                            className="w-full max-h-48 min-h-[44px] bg-transparent border-none focus:ring-0 text-gray-200 resize-none py-3 px-2 text-[15px] placeholder:text-gray-500 custom-scrollbar"
                            rows={1}
                        />

                        <div className="flex items-center mb-1 mr-1">
                            {input.trim() ? (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-9 h-9 flex items-center justify-center bg-[#2d68ff] hover:bg-[#255ce6] disabled:opacity-50 text-white rounded-full transition-colors shadow-sm ml-2"
                                >
                                    <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="p-2 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-full transition-colors ml-2"
                                >
                                    <Mic className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </form>
                    <div className="text-center mt-3 text-xs text-gray-500 font-medium">
                        myRA may display inaccurate info, including about numbers, so double-check its math.
                    </div>
                </div>
            </div>

        </div>
    );
}
