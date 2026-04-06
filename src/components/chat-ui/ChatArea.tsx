import React, { useState, useEffect, useRef } from "react";
import { Copy, ThumbsUp, ThumbsDown, Plus, ArrowUp, PanelLeftOpen, Calendar, Check, CheckCheck, History, MessageSquare, Pencil, Trash2, X, ClipboardCopy } from "lucide-react";
import { ChatMessage, ChatHistoryItem } from "@/hooks/useMyRAChat";
import ReactMarkdown from 'react-markdown';
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/theme-provider";
import BookingModal from "@/components/BookingModal";
import TrainAIModal from "@/components/chat-ui/TrainAIModal";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ChatAreaProps {
    messages: ChatMessage[];
    input: string;
    setInput: (value: string) => void;
    sendMessage: (eOrString?: React.FormEvent | string) => void;
    isLoading: boolean;
    isTyping: boolean;
    showBookingPrompt?: boolean;
    userMemories?: { category: string; fact: string }[];
    isDeveloperMode?: boolean;
    isAdmin?: boolean;
    chatList: ChatHistoryItem[];
    activeChatId: string | null;
    switchChat: (id: string) => void;
    clearChat: () => void;
    renameChat: (id: string, title: string) => void;
    deleteChat: (id: string) => void;
}

export default function ChatArea({
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    isTyping,
    showBookingPrompt = false,
    userMemories = [],
    isDeveloperMode = false,
    isAdmin = false,
    chatList,
    activeChatId,
    switchChat,
    clearChat,
    renameChat,
    deleteChat
}: ChatAreaProps) {

    const { theme } = useTheme();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [bookingOpen, setBookingOpen] = useState(false);
    const [trainModalOpen, setTrainModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const handleStartRename = (chat: ChatHistoryItem) => {
        setEditingId(chat.id);
        setEditTitle(chat.title);
    };

    const handleConfirmRename = async () => {
        if (editingId && editTitle.trim()) {
            await renameChat(editingId, editTitle.trim());
        }
        setEditingId(null);
        setEditTitle("");
    };

    const handleConfirmDelete = async (id: string) => {
        await deleteChat(id);
        setDeletingId(null);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Check if user is near the bottom of the chat
    const isNearBottom = () => {
        const el = scrollContainerRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    };

    const prevMessagesLengthRef = useRef(messages.length);
    const hasScrolledInitially = useRef(false);

    // Scroll to bottom on initial load (when chat opens with existing messages)
    useEffect(() => {
        if (!hasScrolledInitially.current && messages.length > 0) {
            // Use instant scroll (no animation) for initial load
            requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
            });
            hasScrolledInitially.current = true;
        }
    }, [messages]);

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        const isNewMessage = messages.length > prevMessagesLengthRef.current;
        prevMessagesLengthRef.current = messages.length;

        // If the newest message is from the assistant, scroll to the TOP of that message
        if (isNewMessage && lastMessage?.role === 'assistant') {
            const el = document.getElementById(`msg-${lastMessage.id}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
        }

        // If user sent a new message, always scroll to bottom
        if (isNewMessage && lastMessage?.role === 'user') {
            scrollToBottom();
            return;
        }

        // For typing indicator: only scroll if user is already near the bottom
        if (isTyping && isNearBottom()) {
            scrollToBottom();
        }
    }, [messages, isTyping]);

    // Handle Enter key (shift+enter for newline)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage({ preventDefault: () => { } } as React.FormEvent);
        }
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

        // Force purely dark styling for markdown prose
        return (
            <div className="prose dark:prose-invert max-w-none text-[15px] font-medium font-inter text-foreground/90">
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
        <div className="flex-1 flex flex-col h-full bg-background/60 backdrop-blur-2xl border border-border dark:border-white/5 rounded-3xl shadow-2xl relative overflow-hidden">

            {/* Top Navigation Bar */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-border dark:border-white/5 shrink-0 z-10 bg-background/80 backdrop-blur-md sticky top-0">
                <div className="flex items-center gap-3">
                    <Popover open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                        <PopoverTrigger asChild>
                            <button
                                className="p-2 -ml-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-black/[0.04] dark:bg-white/10 transition-all active:scale-[0.95] flex items-center gap-2 cursor-pointer"
                                title="Chat History"
                            >
                                <History className="w-5 h-5" />
                                <span className="text-xs font-semibold hidden sm:inline">History</span>
                                {chatList.length > 0 && (
                                    <span className="min-w-[18px] h-[18px] rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                                        {chatList.length}
                                    </span>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-2 bg-[#0a0b10]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] ml-4 mt-2" align="start">
                            <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-border dark:border-white/5">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Chat History</span>
                                <button onClick={() => { clearChat(); setIsHistoryOpen(false); }} className="text-xs font-semibold text-primary hover:text-blue-400 transition-colors flex items-center gap-1">
                                    <Plus className="w-3.5 h-3.5" />
                                    New Chat
                                </button>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1">
                                {chatList.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-muted-foreground">No previous conversations.</div>
                                ) : (
                                    chatList.map(chat => {
                                        const isActive = chat.id === activeChatId;
                                        const isEditing = editingId === chat.id;
                                        const isDeleting = deletingId === chat.id;

                                        return (
                                            <div
                                                key={chat.id}
                                                className={`group flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${isActive
                                                    ? "bg-black/[0.04] dark:bg-white/10 text-foreground shadow-sm font-semibold border border-border dark:border-white/5"
                                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground font-medium"
                                                    }`}
                                                onClick={() => {
                                                    if (!isEditing && !isDeleting) {
                                                        switchChat(chat.id);
                                                        setIsHistoryOpen(false);
                                                    }
                                                }}
                                            >
                                                {isEditing ? (
                                                    <div className="flex items-center gap-1 flex-1 min-w-0">
                                                        <input
                                                            autoFocus
                                                            value={editTitle}
                                                            onChange={e => setEditTitle(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') handleConfirmRename();
                                                                if (e.key === 'Escape') setEditingId(null);
                                                            }}
                                                            onClick={e => e.stopPropagation()}
                                                            className="flex-1 min-w-0 bg-white/5 border border-white/20 rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-white/30"
                                                        />
                                                        <button onClick={(e) => { e.stopPropagation(); handleConfirmRename(); }} className="p-1 text-emerald-400 hover:text-emerald-300">
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="p-1 text-muted-foreground hover:text-white">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : isDeleting ? (
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <span className="text-xs text-red-500 font-bold truncate flex-1">Delete?</span>
                                                        <button onClick={(e) => { e.stopPropagation(); handleConfirmDelete(chat.id); }} className="p-1 text-red-500 hover:text-red-400">
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); setDeletingId(null); }} className="p-1 text-muted-foreground hover:text-white">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-white'}`} />
                                                        <span className="text-sm truncate flex-1">{chat.title || "Untitled"}</span>
                                                        <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                                                            <button
                                                                onClick={e => { e.stopPropagation(); handleStartRename(chat); }}
                                                                className="p-1 text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:bg-white/10 rounded transition-colors"
                                                                title="Rename"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={e => { e.stopPropagation(); setDeletingId(chat.id); }}
                                                                className="p-1 text-muted-foreground hover:text-red-500 hover:bg-black/[0.04] dark:bg-white/10 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="flex gap-2.5 font-semibold text-foreground items-center">
                        <span className="drop-shadow-sm">myra</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-blue-500/30">GPT-4o</span>
                    </div>
                </div>

                {/* Developer Mode Banner/Controls */}
                <div className="flex items-center gap-2">
                    {isAdmin && messages.length > 0 && (
                        <button
                            onClick={() => {
                                const transcript = messages
                                    .filter(m => m.role !== 'system')
                                    .map(m => {
                                        const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : '';
                                        const sender = m.role === 'user' ? 'USER' : 'myra';
                                        return `[${time}] ${sender}:\n${m.content}\n`;
                                    })
                                    .join('\n---\n\n');
                                navigator.clipboard.writeText(transcript);
                                toast.success('Transcript copied to clipboard');
                            }}
                            className="text-xs bg-white/5 text-muted-foreground border border-white/10 px-3 py-1.5 rounded-lg hover:bg-black/[0.04] dark:bg-white/10 hover:text-foreground transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <ClipboardCopy className="w-3 h-3" />
                            Copy Transcript
                        </button>
                    )}
                    {isDeveloperMode && (
                        <>
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
                        </>
                    )}
                </div>
            </div>

            {/* Main Scrollable Messages */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full relative z-10">
                        {/* Background decoration */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-primary/10 blur-[100px] rounded-full animate-orb" />
                            <div className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full animate-orb-delayed" />
                        </div>

                        {/* Logo + Welcome */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-2xl border border-white/10 flex items-center justify-center mb-6 shadow-2xl shadow-primary/20 animate-float">
                                <span className="font-serif text-foreground text-4xl font-bold tracking-tighter">RA</span>
                            </div>
                            <h2 className="text-foreground text-4xl font-serif font-semibold mb-3 text-center">
                                Hi, I'm <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">myra</span>.
                            </h2>
                            <p className="text-muted-foreground text-base font-light mb-10 text-center max-w-md leading-relaxed">
                                Your AI retirement strategist. Ask me anything about retirement planning, Social Security, tax optimization, or portfolio strategy.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl relative z-10">
                            {[
                                { prompt: "How much do I need to retire comfortably?", icon: "ðŸ’°" },
                                { prompt: "When should I claim Social Security?", icon: "ðŸ›ï¸" },
                                { prompt: "How should I invest for retirement?", icon: "ðŸ“Š" },
                                { prompt: "What withdrawal strategy should I use?", icon: "ðŸ”„" },
                                { prompt: "How will healthcare costs affect my plan?", icon: "ðŸ¥" },
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(item.prompt)}
                                    className={`text-left p-5 rounded-2xl border border-border dark:border-white/5 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/15 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 shadow-sm active:scale-[0.98] cursor-pointer group ${i === 4 ? "md:col-span-2 md:max-w-md md:mx-auto w-full" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl shrink-0">{item.icon}</span>
                                        <p className="text-foreground/70 font-medium text-[14px] leading-snug group-hover:text-white/90 transition-colors">{item.prompt}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto w-full pt-6 sm:pt-8 pb-40 px-3 sm:px-6 flex flex-col space-y-6 sm:space-y-8">
                        {messages.map((msg) => {
                            if (msg.role === 'system') return null;

                            const isUser = msg.role === "user";

                            return (
                                <div
                                    id={`msg-${msg.id}`}
                                    key={msg.id}
                                    className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 scroll-mt-20`}
                                >
                                    {/* AI Avatar */}
                                    {!isUser && (
                                        <div className="shrink-0 mr-3 mt-1">
                                            <div className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg">
                                                <span className="font-serif text-foreground text-sm font-bold">RA</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className={`sm:max-w-[80%] max-w-[85%] flex flex-col ${isUser ? 'items-end order-1' : 'items-start order-2'}`}>
                                        {isUser ? (
                                            <div className="bg-black/[0.04] dark:bg-white/10 backdrop-blur-2xl border border-white/10 text-foreground px-5 py-3.5 rounded-3xl rounded-tr-md text-[15px] leading-relaxed shadow-lg font-light">
                                                {msg.content}
                                            </div>
                                        ) : (
                                            <div className="bg-gray-100/80 dark:bg-white/[0.04] backdrop-blur-3xl border border-black/5 dark:border-white/10 text-foreground rounded-3xl rounded-tl-md shadow-2xl overflow-hidden glass-premium">
                                                <div className="px-5 py-4">
                                                    {renderMessageContent(msg)}
                                                </div>
                                                {/* Action Footer */}
                                                <div className="px-4 py-2 bg-black/[0.03] dark:bg-black/20 border-t border-border dark:border-white/5 flex gap-1 items-center">
                                                    {isAdmin && (
                                                        <>
                                                            <button
                                                                onClick={() => handleCopy(msg.content)}
                                                                className="p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:bg-white/10 rounded-md transition-all active:scale-[0.95] flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                                <span>Copy</span>
                                                            </button>
                                                            <div className="w-px h-3 bg-black/[0.04] dark:bg-white/10 my-auto mx-1" />
                                                        </>
                                                    )}
                                                    <button className="p-1.5 text-muted-foreground hover:text-emerald-400 hover:bg-black/[0.04] dark:bg-white/10 rounded-md transition-all active:scale-[0.95]">
                                                        <ThumbsUp className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-black/[0.04] dark:bg-white/10 rounded-md transition-all active:scale-[0.95]">
                                                        <ThumbsDown className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Metadata Row */}
                                        <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <span>{formatTime(msg.timestamp)}</span>
                                            {isUser && (
                                                <div className="flex items-center">
                                                    {msg.status === 'read' ? (
                                                        <CheckCheck className="w-3 h-3 text-blue-500" />
                                                    ) : (
                                                        <Check className="w-3 h-3" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* User Avatar */}
                                    {isUser && (
                                        <div className="shrink-0 ml-3 mt-1 order-3">
                                            <div className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-foreground font-bold text-xs shadow-md">
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
                                <div className="bg-background/80 backdrop-blur-2xl border border-emerald-500/20 p-6 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] max-w-md w-full text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none" />

                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                                        <Calendar className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">Ready to take the next step?</h3>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Schedule a free, no-obligation consultation with a licensed professional to review your custom roadmap.
                                    </p>
                                    <button
                                        onClick={() => setBookingOpen(true)}
                                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-2xl transition-all active:scale-[0.97] shadow-lg shadow-emerald-500/20"
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
                                    <div className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                                        <span className="font-serif text-foreground text-sm font-bold">RA</span>
                                    </div>
                                </div>
                                <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-3xl border border-white/10 px-5 py-4 rounded-3xl rounded-tl-md shadow-2xl flex gap-1.5 items-center h-[52px]">
                                    <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
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
                        className="flex items-end bg-[#0a0b10] backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_48px_rgba(0,0,0,0.6)] p-1.5 focus-within:border-white/30 transition-all font-inter"
                    >
                        <button
                            type="button"
                            className="p-3 text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:bg-white/10 rounded-full transition-all active:scale-[0.95] mb-0.5"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                        
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setTrainModalOpen(true)}
                                title="Train myra"
                                className="p-3 text-blue-400 hover:text-blue-300 hover:bg-black/[0.04] dark:bg-white/10 rounded-full transition-all active:scale-[0.95] mb-0.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 16 6 6"/><path d="m22 16-6 6"/><path d="m6 16 1.34-4.66a2 2 0 0 1 1.9-1.34h5.52a2 2 0 0 1 1.9 1.34L18 16"/><path d="M12 10V2"/><path d="M9 4l3-2 3 2"/></svg>
                            </button>
                        )}

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message myra..."
                            className="w-full max-h-48 min-h-[50px] bg-transparent border-none focus:ring-0 text-foreground placeholder:text-white/30 font-light resize-none py-3.5 px-3 text-[16px] custom-scrollbar outline-none"
                            rows={1}
                        />

                        <div className="flex items-center mb-1 mr-1">
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="w-10 h-10 flex items-center justify-center bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed text-black rounded-full transition-all active:scale-[0.9] shadow-md ml-1"
                            >
                                <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-3 text-[11.5px] text-white/30 drop-shadow-sm font-medium tracking-wide">
                        myra provides general education, not personalized financial advice.
                    </div>
                </div>
            </div>

            <BookingModal
                isOpen={bookingOpen || showBookingPrompt}
                onClose={() => setBookingOpen(false)}
                prefillData={prefillData}
                messages={messages}
            />

            <TrainAIModal 
                isOpen={trainModalOpen} 
                onClose={() => setTrainModalOpen(false)} 
            />
        </div>
    );
}
