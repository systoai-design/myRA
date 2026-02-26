import React, { useState, useEffect, useRef } from "react";
import { Copy, ThumbsUp, ThumbsDown, Plus, ArrowUp, PanelLeftOpen, Calendar } from "lucide-react";
import { ChatMessage } from "@/hooks/useMyRAChat";
import ReactMarkdown from 'react-markdown';
import BookingModal from "@/components/BookingModal";
import { toast } from "sonner";

interface ChatAreaProps {
    messages: ChatMessage[];
    input: string;
    setInput: (value: string) => void;
    sendMessage: (e: React.FormEvent) => void;
    isLoading: boolean;
    isTyping: boolean;
    toggleSidebar: () => void;
    showBookingPrompt?: boolean;
}

export default function ChatArea({
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    isTyping,
    toggleSidebar,
    showBookingPrompt = false
}: ChatAreaProps) {

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [bookingOpen, setBookingOpen] = useState(false);

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
            sendMessage({ preventDefault: () => { } } as React.FormEvent);
        }
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard");
    };

    // Helper formatting for AI markdown
    const renderMessageContent = (msg: ChatMessage) => {
        let content = msg.content;
        content = content.replace(/\[\[UPDATE_BUCKET:\s*(\{.*?\})\]\]/g, "");
        content = content.replace(/\[\[SHOW_CHART:\s*(\{.*?\})\]\]/g, "");
        content = content.replace(/\[\[LEARN:\s*(\{.*?\})\]\]/g, "");
        content = content.replace(/\[\[TRIGGER_BOOKING\]\]/g, "");

        return (
            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#1a1b2e] prose-pre:border prose-pre:border-white/10 max-w-none text-gray-200 text-[15px]">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#1a1b2e] to-[#16172a] relative">

            {/* Top Navigation Bar */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0 z-10 bg-[#1a1b2e]/90 backdrop-blur-md sticky top-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all active:scale-[0.95]"
                    >
                        <PanelLeftOpen className="w-5 h-5" />
                    </button>

                    <div className="flex gap-2.5 font-semibold text-gray-200 items-center">
                        <span>MyRA</span>
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-blue-500/20">Llama3.3 70B</span>
                    </div>
                </div>
            </div>

            {/* Main Scrollable Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20">
                            <span className="font-serif text-white text-3xl font-bold tracking-tighter">m</span>
                        </div>
                        <h2 className="text-gray-300 text-lg font-medium mb-1">Start a new conversation</h2>
                        <p className="text-gray-500 text-sm">Ask MyRA anything about retirement planning</p>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto w-full pt-8 pb-36 px-4 flex flex-col space-y-6">
                        {messages.map((msg) => {
                            if (msg.role === 'system') return null;

                            const isUser = msg.role === "user";

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                >
                                    {/* AI Avatar */}
                                    {!isUser && (
                                        <div className="shrink-0 mr-3 mt-1">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-600/15">
                                                <span className="font-serif text-white text-sm font-bold">m</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-2'}`}>
                                        {isUser ? (
                                            <div className="bg-[#2d68ff] text-white px-5 py-3.5 rounded-2xl rounded-tr-md text-[15px] leading-relaxed shadow-md shadow-blue-600/15">
                                                {msg.content}
                                            </div>
                                        ) : (
                                            <div className="bg-[#22233a] border border-white/[0.06] rounded-2xl rounded-tl-md shadow-md overflow-hidden">
                                                <div className="px-5 py-4">
                                                    {renderMessageContent(msg)}
                                                </div>
                                                {/* Action Footer */}
                                                <div className="px-3 py-1.5 bg-white/[0.02] border-t border-white/[0.04] flex gap-1">
                                                    <button
                                                        onClick={() => handleCopy(msg.content)}
                                                        className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-md transition-all active:scale-[0.95] flex items-center gap-1 text-xs"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span>Copy</span>
                                                    </button>
                                                    <div className="w-px h-4 bg-white/[0.06] my-auto mx-0.5" />
                                                    <button className="p-1.5 text-gray-500 hover:text-emerald-400 hover:bg-white/5 rounded-md transition-all active:scale-[0.95]">
                                                        <ThumbsUp className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-md transition-all active:scale-[0.95]">
                                                        <ThumbsDown className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Avatar */}
                                    {isUser && (
                                        <div className="shrink-0 ml-3 mt-1 order-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd8bb] to-[#ffb37b] flex items-center justify-center text-[#9b5110] font-bold text-xs shadow-md">
                                                U
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Inline Booking Card (Only shown when triggered) */}
                        {showBookingPrompt && (
                            <div className="flex w-full justify-center pt-4 pb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-gradient-to-br from-[#1a2333] to-[#121826] border border-emerald-500/20 p-6 rounded-2xl shadow-xl shadow-emerald-900/10 max-w-md w-full text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />

                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                        <Calendar className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Ready to take the next step?</h3>
                                    <p className="text-sm text-gray-400 mb-6">
                                        Schedule a free, no-obligation consultation with a licensed professional to review your custom roadmap.
                                    </p>
                                    <button
                                        onClick={() => setBookingOpen(true)}
                                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all active:scale-[0.97] shadow-lg shadow-emerald-500/20"
                                    >
                                        Schedule Free Consultation
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex w-full justify-start animate-in fade-in duration-300">
                                <div className="shrink-0 mr-3 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-600/15 animate-pulse">
                                        <span className="font-serif text-white text-sm font-bold">m</span>
                                    </div>
                                </div>
                                <div className="bg-[#22233a] border border-white/[0.06] px-5 py-4 rounded-2xl rounded-tl-md shadow-md flex gap-1.5 items-center">
                                    <span className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area (Floating Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 pt-12 pb-5 px-4 bg-gradient-to-t from-[#16172a] via-[#16172a]/95 to-transparent pointer-events-none">
                <div className="max-w-3xl mx-auto w-full relative pointer-events-auto">
                    <form
                        onSubmit={sendMessage}
                        className="flex items-end bg-[#22233a] border border-white/[0.08] rounded-2xl shadow-xl shadow-black/20 p-1.5 focus-within:ring-1 focus-within:ring-blue-500/30 focus-within:border-white/15 transition-all"
                    >
                        <button
                            type="button"
                            className="p-2.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-all active:scale-[0.95] mb-0.5"
                        >
                            <Plus className="w-5 h-5" />
                        </button>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message MyRA..."
                            className="w-full max-h-48 min-h-[44px] bg-transparent border-none focus:ring-0 text-gray-200 resize-none py-3 px-2 text-[15px] placeholder:text-gray-500 custom-scrollbar outline-none"
                            rows={1}
                        />

                        <div className="flex items-center mb-1 mr-1">
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="w-9 h-9 flex items-center justify-center bg-[#2d68ff] hover:bg-[#255ce6] disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-all active:scale-[0.9] shadow-md shadow-blue-600/20 ml-1"
                            >
                                <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-2.5 text-[11px] text-gray-600">
                        MyRA provides general education, not personalized financial advice.
                    </div>
                </div>
            </div>

            <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
        </div>
    );
}
