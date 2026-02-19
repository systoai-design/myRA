import { useRef, useState, useEffect, useCallback } from "react";
import { useMyRAChat } from "@/hooks/useMyRAChat";
import { ChatChart } from "./chat/ChatChart";
import { motion } from "framer-motion";

// Sound effect utility using Web Audio API (no external files needed)
const playMessageSound = () => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Soft, pleasant notification tone
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
        oscillator.frequency.setValueAtTime(1047, ctx.currentTime + 0.08); // C6
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
        // Silently fail if audio isn't available
    }
};

const Hero = () => {
    const { messages, sendMessage, clearChat, startChat, isLoading, isTyping, isSeen } = useMyRAChat();
    const [inputValue, setInputValue] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [seenMsgId, setSeenMsgId] = useState<string | null>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const prevMsgCount = useRef(messages.length);

    // Auto-open chat if there are partial messages (previous session)
    useEffect(() => {
        if (messages.length > 0) {
            setShowChat(true);
        } else {
            setShowChat(false);
        }
    }, [messages.length]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTo({
                top: chatScrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isTyping, showChat]);

    // Play sound when a new assistant message arrives
    useEffect(() => {
        if (messages.length > prevMsgCount.current) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg?.role === "assistant") {
                playMessageSound();
            }
        }
        prevMsgCount.current = messages.length;
    }, [messages]);

    // Show "Seen" status on user messages briefly before typing starts
    useEffect(() => {
        if (messages.length === 0) return;
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.role === "user") {
            // Show "Seen" after a short delay to simulate reading
            const seenTimer = setTimeout(() => {
                setSeenMsgId(lastMsg.id);
            }, 600);
            return () => clearTimeout(seenTimer);
        } else {
            // Clear seen when assistant responds
            setSeenMsgId(null);
        }
    }, [messages]);

    const handleStart = () => {
        setShowChat(true);
        startChat();
        setTimeout(() => {
            document.getElementById('chat-input')?.focus();
        }, 100);
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue("");
    };

    // Helper to render message content with optional chart
    const renderMessageContent = (content: string) => {
        const chartRegex = /\[\[SHOW_CHART:\s*({.*?})\]\]/;
        const match = content.match(chartRegex);

        if (match) {
            const textPart = content.replace(match[0], "").trim();
            try {
                const chartData = JSON.parse(match[1]);
                return (
                    <div className="flex flex-col gap-4 w-full">
                        <span className="whitespace-pre-wrap">{textPart}</span>
                        <ChatChart
                            type={chartData.type}
                            data={chartData.data}
                            title={chartData.title}
                        />
                    </div>
                );
            } catch (e) {
                console.error("Failed to parse chart data", e);
                return <span className="whitespace-pre-wrap">{content}</span>;
            }
        }

        return <span className="whitespace-pre-wrap">{content}</span>;
    };

    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32 min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            {/* Future Grid Background */}
            <div className="absolute inset-0 bg-grid-slate-900/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-100/5 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

            {/* Ambient Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-emerald-500/10 blur-[100px] rounded-full opacity-30 pointer-events-none" />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-16 item-center">

                {/* Left Column: Text Content */}
                <div className="flex flex-col justify-center text-center lg:text-left z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-6 dark:bg-blue-900/30 dark:text-blue-200">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                            AI-Powered Fiduciary Guidance
                        </span>
                        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 font-serif leading-[1.1]">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400">myRA</span>
                            <br />
                            Clear, confident retirement planning.
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
                            myRA combines 15 years of real-world CFP experience with powerful AI guidance to give you a practical, unbiased path to retirement.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button
                                onClick={handleStart}
                                className="rounded-full bg-slate-900 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-all dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                            >
                                Start Planning Free
                            </button>
                            <a href="#how-it-works" className="rounded-full px-8 py-3.5 text-base font-semibold text-slate-900 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all dark:text-white dark:ring-white/20 dark:hover:bg-white/10">
                                How it works
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Chat Interface (Floating) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative w-full max-w-md mx-auto lg:max-w-full"
                >
                    {/* Levitation Animation Container */}
                    <div className="animate-float">
                        {/* FIXED HEIGHT container - h-[600px] instead of min-h, with flex to constrain children */}
                        <div className="relative rounded-3xl border border-white/50 bg-white/70 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-emerald-900/20 ring-1 ring-black/5 h-[600px] flex flex-col overflow-hidden transition-all duration-500">

                            {!showChat ? (
                                /* START SCREEN Overlay */
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
                                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-2xl flex items-center justify-center mb-6 animate-pulse-slow">
                                        <span className="material-symbols-outlined text-[40px]">smart_toy</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Build Your Roadmap</h3>
                                    <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-xs">
                                        Chat with myRA to analyze your gaps, optimize taxes, and retire with confidence.
                                    </p>
                                    <button
                                        onClick={handleStart}
                                        className="group relative inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:bg-blue-500 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                                    >
                                        Start Chat
                                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </button>
                                </div>
                            ) : (
                                /* ACTIVE CHAT INTERFACE */
                                <>
                                    {/* Interface Header - fixed */}
                                    <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200/50 bg-white/50 px-6 py-4 dark:border-white/5 dark:bg-slate-900/50 backdrop-blur-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/20 ${isTyping || isLoading ? 'animate-pulse' : ''}`}>
                                                    <span className="material-symbols-outlined text-[24px]">
                                                        smart_toy
                                                    </span>
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-emerald-500 dark:border-slate-800"></div>
                                            </div>
                                            <div>
                                                <div className="text-base font-bold text-slate-900 dark:text-white">
                                                    myRA Assistant
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    {isTyping ? "typing..." : "Online"}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={clearChat}
                                            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-all dark:hover:bg-slate-800"
                                            title="Reset Conversation"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                refresh
                                            </span>
                                        </button>
                                    </div>

                                    {/* Chat Messages - SCROLLABLE with fixed height */}
                                    <div
                                        ref={chatScrollRef}
                                        className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/30"
                                        style={{ minHeight: 0 }}
                                    >
                                        {messages.map((msg, index) => (
                                            <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                                <div
                                                    className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                                >
                                                    {msg.role !== 'user' && (
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 mt-1">
                                                            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${msg.role === "user"
                                                            ? "bg-slate-900 text-white dark:bg-emerald-600"
                                                            : "bg-white text-slate-700 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                                                            }`}
                                                    >
                                                        {renderMessageContent(msg.content)}
                                                    </div>
                                                </div>

                                                {/* "Seen" status - shows below user messages */}
                                                {msg.role === 'user' && seenMsgId === msg.id && (
                                                    <div className="flex items-center gap-1 mt-1 mr-1 animate-fade-in">
                                                        <span className="material-symbols-outlined text-[12px] text-blue-500">done_all</span>
                                                        <span className="text-[10px] text-blue-500 font-medium">Seen</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {isTyping && (
                                            <div className="flex gap-3 items-end">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                                                    <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                                                </div>
                                                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm dark:bg-slate-800 dark:border-slate-700">
                                                    <div className="flex gap-1.5">
                                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Input Area - fixed at bottom */}
                                    <div className="flex-shrink-0 p-4 bg-white border-t border-slate-100 dark:bg-slate-900/80 dark:border-slate-800">
                                        <div className="relative flex items-center">
                                            <input
                                                id="chat-input"
                                                className="block w-full rounded-full border-0 bg-slate-100 py-3.5 pl-6 pr-14 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600 transition-all placeholder:text-slate-500 font-medium"
                                                placeholder="Type your answer here..."
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleSend();
                                                }}
                                                disabled={isLoading}
                                            />
                                            <button
                                                onClick={handleSend}
                                                disabled={isLoading || !inputValue.trim()}
                                                className="absolute right-2 top-1.5 p-2 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all duration-300"
                                            >
                                                <span className="material-symbols-outlined text-[20px] leading-none block">arrow_upward</span>
                                            </button>
                                        </div>
                                        <div className="text-center mt-3">
                                            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">lock</span>
                                                Bank-level security • Anonymous & Private
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default Hero;
