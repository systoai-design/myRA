import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useMyRAChat } from "@/hooks/useMyRAChat";
import { useAuth } from "@/contexts/AuthContext";
import { ChatChart } from "./chat/ChatChart";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
    const { user } = useAuth();
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [seenMsgId, setSeenMsgId] = useState<string | null>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const prevMsgCount = useRef(messages.length);

    const handleStart = useCallback(() => {
        if (!inputValue.trim()) return;
        setShowChat(true);
        sendMessage(inputValue);
        setInputValue("");

        // Scroll to bottom of chat automatically after a short delay
        setTimeout(() => {
            if (chatScrollRef.current) {
                chatScrollRef.current.scrollTo({
                    top: chatScrollRef.current.scrollHeight,
                    behavior: "smooth"
                });
            }
        }, 100);
    }, [inputValue, sendMessage]);

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

    const heroTextRef = useRef<HTMLDivElement>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    // Initial GSAP Entrance Animation
    useEffect(() => {
        if (heroTextRef.current) {
            gsap.fromTo(
                heroTextRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2 }
            );
        }
    }, []);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue("");
        setShowChat(true);
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
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 bg-slate-900">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            >
                <source src="/video_background_seamless.mp4" type="video/mp4" />
            </video>

            {/* Hero Main Content */}
            <div className="relative z-20 w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">

                {/* Headline above Chat intentionally removed per request */}

                {/* Smart Chat Panel */}
                <div
                    ref={heroTextRef}
                    className="opacity-0 w-full bg-white/10 backdrop-blur-[64px] border border-white/20 saturate-150 shadow-[0_32px_64px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col rounded-[2.5rem] p-6 sm:p-10 max-h-[65vh] min-h-[50vh]"
                >
                    {/* Decorative reflection */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                    {/* Chat Area */}
                    <div
                        ref={chatScrollRef}
                        className="relative z-10 flex flex-col flex-1 overflow-y-auto pr-2 custom-scrollbar gap-6 mb-8 max-h-[50vh]"
                    >
                        {/* Initial Greeting */}
                        <div className="flex items-end gap-3 sm:gap-4">
                            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-lg border border-slate-700/50">
                                <span className="text-white font-bold text-sm sm:text-base font-outfit">RA</span>
                            </div>
                            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl rounded-bl-sm p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 max-w-[90%] sm:max-w-[85%]">
                                <p className="text-slate-900 font-inter text-base sm:text-lg leading-relaxed">
                                    {user
                                        ? `Hey ${user.user_metadata?.first_name || 'there'}, welcome back! Want to continue your income plan?`
                                        : <>Hello, I'm MyRA. <br className="hidden sm:block" /> The ultimate <span className="font-bold border-b-2 border-slate-900/30">financial planner.</span></>
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Message History */}
                        {messages.filter(m => m.role !== 'system').map((msg, idx) => (
                            <div key={msg.id} className={`flex items-end gap-3 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                {msg.role === 'assistant' && (
                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-lg border border-slate-700/50">
                                        <span className="text-white font-bold text-sm sm:text-base font-outfit">RA</span>
                                    </div>
                                )}
                                <div className={`px-5 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border backdrop-blur-2xl max-w-[85%] ${msg.role === 'user'
                                    ? 'bg-slate-900/80 text-white rounded-br-sm border-slate-700/50'
                                    : 'bg-white/70 text-slate-900 rounded-bl-sm border-white/50'
                                    }`}>
                                    <div className={`font-inter text-base sm:text-lg leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-slate-900'}`}>
                                        {renderMessageContent(msg.content)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex items-end gap-3 sm:gap-4">
                                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900 flex items-center justify-center shadow-md border border-white/50">
                                    <span className="text-white font-bold text-sm sm:text-base font-outfit">RA</span>
                                </div>
                                <div className="bg-white/95 rounded-2xl rounded-bl-sm px-5 py-4 shadow-lg border border-white/50 flex items-center gap-1.5 h-[52px]">
                                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input Box */}
                    <div className="relative z-10 w-full group">
                        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex items-center bg-white/40 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/40 overflow-hidden p-1.5 sm:p-2 focus-within:ring-4 focus-within:ring-white/30 transition-all duration-300">
                            <input
                                id="chat-input"
                                className="flex-1 bg-transparent border-0 py-3 sm:py-4 pl-6 pr-4 text-base sm:text-lg text-slate-900 placeholder:text-slate-700/70 focus:ring-0 outline-none font-inter font-medium"
                                placeholder="Rotate through financial topics: retirement, investment, tax."
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleStart();
                                }}
                            />
                            <button
                                onClick={handleStart}
                                className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-full hover:bg-slate-800 transition-all active:scale-[0.95] flex items-center justify-center shrink-0 shadow-md"
                                aria-label="Send message"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V6m0 0l-7 7m7-7l7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Quick Reply Tags */}
                    <div className="relative z-10 flex items-center mt-6 gap-2 sm:gap-3 px-2 sm:px-4 py-3 w-full overflow-x-auto custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <span className="text-white/80 drop-shadow-md font-bold mr-2 font-inter hidden sm:inline-block uppercase tracking-wider text-xs whitespace-nowrap">Quick Replies →</span>
                        {["Analyze my income gap", "Optimize my taxes", "Review my asset allocation"].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => {
                                    setInputValue(tag);
                                    setTimeout(() => {
                                        document.getElementById('chat-input')?.focus();
                                    }, 50);
                                }}
                                className="px-5 py-2.5 sm:py-3 bg-white/20 hover:bg-white/40 text-white font-semibold rounded-full border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all active:scale-[0.98] font-inter text-left backdrop-blur-md whitespace-nowrap shrink-0"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="relative mt-8 flex flex-col items-center animate-bounce text-white/90 drop-shadow-md">
                    <span className="text-sm font-medium tracking-wide mb-2">Scroll for more about MyRA</span>
                    <ChevronDown className="w-6 h-6" />
                </div>
            </div>
        </section>
    );
};

export default Hero;
