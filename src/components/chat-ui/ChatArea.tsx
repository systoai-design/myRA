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
    sendMessage: (eOrString?: React.FormEvent | string) => void;
    isLoading: boolean;
    isTyping: boolean;
    toggleSidebar: () => void;
    showBookingPrompt?: boolean;
    userMemories?: { category: string; fact: string }[];
    isDeveloperMode?: boolean;
}

export default function ChatArea({
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    isTyping,
    toggleSidebar,
    showBookingPrompt = false,
    userMemories = [],
    isDeveloperMode = false
}: ChatAreaProps) {

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [bookingOpen, setBookingOpen] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const prevMessagesLengthRef = useRef(messages.length);

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        const isNewMessage = messages.length > prevMessagesLengthRef.current;
        prevMessagesLengthRef.current = messages.length;

        // If the newest message is from the assistant, scroll to the TOP of that message
        // so the user can begin reading from the very beginning of her response.
        if (isNewMessage && lastMessage?.role === 'assistant') {
            const el = document.getElementById(`msg-${lastMessage.id}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
        }

        // Default behavior (user sending messages, typing indicators, etc.)
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

        // Strip excessive newlines/gaps left behind by hidden tags or AI pacing
        content = content.replace(/\n{3,}/g, '\n\n').trim();

        // Use a strictly dark prose scheme to contrast against the white/70 frosted glass background
        return (
            <div className="prose prose-slate prose-p:leading-relaxed prose-pre:bg-white/50 prose-pre:border prose-pre:border-slate-300 max-w-none text-slate-900 text-[15px] font-medium">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        );
    };

    // Extract prefill data from user memories
    const prefillData = {
        name: userMemories.find(m => m.category === 'legal_name')?.fact || userMemories.find(m => m.category === 'name')?.fact,
        email: userMemories.find(m => m.category === 'email')?.fact,
        phone: userMemories.find(m => m.category === 'phone')?.fact,
        address: userMemories.find(m => m.category === 'mailing_address')?.fact,
        dob: userMemories.find(m => m.category === 'date_of_birth')?.fact,
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white/10 backdrop-blur-[64px] border border-white/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] relative overflow-hidden">

            {/* Top Navigation Bar */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/20 shrink-0 z-10 bg-white/5 backdrop-blur-md sticky top-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 -ml-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-[0.95]"
                    >
                        <PanelLeftOpen className="w-5 h-5" />
                    </button>

                    <div className="flex gap-2.5 font-semibold text-white items-center">
                        <span className="drop-shadow-sm">MyRA</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-blue-500/30">Llama3.3 70B</span>
                    </div>
                </div>

                {/* Developer Mode Banner/Controls */}
                {isDeveloperMode && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-orange-400 font-mono bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                            DEV MODE ACTIVE
                        </span>
                        <button
                            onClick={() => setBookingOpen(true)}
                            className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                        >
                            <Calendar className="w-3 h-3" />
                            Trigger Booking Modal
                        </button>
                    </div>
                )}
            </div>

            {/* Main Scrollable Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                            <span className="font-outfit text-white text-3xl font-bold tracking-tighter">RA</span>
                        </div>
                        <h2 className="text-white text-2xl font-semibold mb-2 text-center drop-shadow-md">Hi, I'm MyRA.</h2>
                        <p className="text-white/80 text-[15px] mb-8 text-center max-w-lg drop-shadow-sm">
                            I'm your virtual retirement strategist. Select a question below to get started, or ask me anything.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl">
                            {[
                                "How much do I need to retire?",
                                "When should I claim Social Security / benefits?",
                                "How should I invest for retirement?",
                                "What withdrawal strategy should I use?",
                                "How much will healthcare and long-term care costs affect me?",
                            ].map((promptTitle, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(promptTitle)}
                                    className={`text-left p-4 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all hover:-translate-y-0.5 shadow-sm active:scale-[0.98] ${i === 4 ? "md:col-span-2 md:max-w-md md:mx-auto w-full" : ""
                                        }`}
                                >
                                    <p className="text-white/90 font-medium text-[15px] leading-snug">{promptTitle}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto w-full pt-8 pb-36 px-4 flex flex-col space-y-6">
                        {messages.map((msg) => {
                            if (msg.role === 'system') return null;

                            const isUser = msg.role === "user";

                            return (
                                <div
                                    id={`msg-${msg.id}`}
                                    key={msg.id}
                                    className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                >
                                    {/* AI Avatar */}
                                    {!isUser && (
                                        <div className="shrink-0 mr-3 mt-1">
                                            <div className="w-8 h-8 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/50 flex items-center justify-center shadow-lg">
                                                <span className="font-outfit text-white text-sm font-bold">RA</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-2'}`}>
                                        {isUser ? (
                                            <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 text-white px-5 py-3.5 rounded-2xl rounded-tr-md text-[15px] leading-relaxed shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                                                {msg.content}
                                            </div>
                                        ) : (
                                            <div className="bg-white/70 backdrop-blur-2xl border border-white/50 text-slate-900 rounded-2xl rounded-tl-md shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden">
                                                <div className="px-5 py-4">
                                                    {renderMessageContent(msg)}
                                                </div>
                                                {/* Action Footer */}
                                                <div className="px-3 py-1.5 bg-white/40 border-t border-white/30 flex gap-1">
                                                    <button
                                                        onClick={() => handleCopy(msg.content)}
                                                        className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-white/50 rounded-md transition-all active:scale-[0.95] flex items-center gap-1 text-xs font-medium"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span>Copy</span>
                                                    </button>
                                                    <div className="w-px h-4 bg-slate-400/30 my-auto mx-0.5" />
                                                    <button className="p-1.5 text-slate-700 hover:text-emerald-600 hover:bg-white/50 rounded-md transition-all active:scale-[0.95]">
                                                        <ThumbsUp className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-1.5 text-slate-700 hover:text-red-600 hover:bg-white/50 rounded-md transition-all active:scale-[0.95]">
                                                        <ThumbsDown className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Avatar */}
                                    {isUser && (
                                        <div className="shrink-0 ml-3 mt-1 order-3">
                                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white font-bold text-xs shadow-md">
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
                                    <div className="w-8 h-8 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/50 flex items-center justify-center shadow-lg">
                                        <span className="font-outfit text-white text-sm font-bold">RA</span>
                                    </div>
                                </div>
                                <div className="bg-white/70 backdrop-blur-2xl border border-white/50 px-5 py-4 rounded-2xl rounded-tl-md shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex gap-1.5 items-center h-[52px]">
                                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area (Floating Bottom Pill) */}
            <div className="absolute bottom-6 left-0 right-0 px-4 sm:px-8 pointer-events-none flex justify-center z-20">
                <div className="max-w-3xl w-full relative pointer-events-auto">
                    <form
                        onSubmit={sendMessage}
                        className="flex items-end bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-1.5 focus-within:ring-4 focus-within:ring-white/30 transition-all font-inter"
                    >
                        <button
                            type="button"
                            className="p-3 text-slate-600 hover:text-slate-900 hover:bg-white/20 rounded-full transition-all active:scale-[0.95] mb-0.5"
                        >
                            <Plus className="w-5 h-5" />
                        </button>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message MyRA..."
                            className="w-full max-h-48 min-h-[50px] bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-700/70 font-medium resize-none py-3.5 px-3 text-[16px] custom-scrollbar outline-none"
                            rows={1}
                        />

                        <div className="flex items-center mb-1 mr-1">
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="w-10 h-10 flex items-center justify-center bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full transition-all active:scale-[0.9] shadow-md ml-1"
                            >
                                <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-3 text-[11.5px] text-white/90 drop-shadow-md font-medium tracking-wide">
                        MyRA provides general education, not personalized financial advice.
                    </div>
                </div>
            </div>

            <BookingModal
                isOpen={bookingOpen || showBookingPrompt}
                onClose={() => setBookingOpen(false)}
                prefillData={prefillData}
                messages={messages}
            />
        </div>
    );
}
