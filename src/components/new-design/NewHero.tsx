import { ArrowRight, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

const rotatingQuestions = [
    "How much do I need to retire comfortably?",
    "Should I convert to a Roth IRA?",
    "What's the best age to start Social Security?",
    "How much will I pay in taxes this year?",
    "Can I afford to retire early?",
    "How should I invest my 401(k)?",
    "Will I outlive my savings?",
    "How do I reduce my tax burden in retirement?",
];

const useTypewriter = (texts: string[], typingSpeed = 45, deletingSpeed = 25, pauseTime = 2200) => {
    const [displayText, setDisplayText] = useState("");
    const [textIndex, setTextIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const tick = useCallback(() => {
        const currentFullText = texts[textIndex];

        if (!isDeleting) {
            if (displayText.length < currentFullText.length) {
                setDisplayText(currentFullText.substring(0, displayText.length + 1));
            } else {
                setTimeout(() => setIsDeleting(true), pauseTime);
                return;
            }
        } else {
            if (displayText.length > 0) {
                setDisplayText(currentFullText.substring(0, displayText.length - 1));
            } else {
                setIsDeleting(false);
                setTextIndex((prev) => (prev + 1) % texts.length);
                return;
            }
        }
    }, [displayText, textIndex, isDeleting, texts, pauseTime]);

    useEffect(() => {
        const speed = isDeleting ? deletingSpeed : typingSpeed;
        const timer = setTimeout(tick, speed);
        return () => clearTimeout(timer);
    }, [tick, isDeleting, typingSpeed, deletingSpeed]);

    return displayText;
};

const NewHero = () => {
    const typedQuestion = useTypewriter(rotatingQuestions);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleChatClick = () => {
        if (user) {
            navigate("/app/chat");
        } else {
            document.getElementById('auth-modal-trigger')?.click();
        }
    };

    return (
        <section className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden bg-black pt-20">
            {/* Background Video */}
            <div className="absolute inset-0 z-0">
                <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                >
                    <source src="/hero-bg.mp4" type="video/mp4" />
                </video>
                
                {/* Black fade — top */}
                <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black via-black/80 to-transparent" />
                {/* Black fade — bottom */}
                <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-black via-black/80 to-transparent" />
                {/* Left/right vignette */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center mt-12 mb-24"
            >
                {/* Badge */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="mb-12 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 backdrop-blur-md"
                >
                    <span className="text-[11px] font-bold tracking-widest uppercase text-white/80 font-sans">
                        Fiduciary Standard • AI Powered
                    </span>
                </motion.div>

                {/* Headline — "Hello, I'm myra" */}
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-5xl sm:text-6xl md:text-[5.5rem] leading-[1.1] font-serif text-white mb-8 text-glow"
                >
                    Hello, I'm <span className="italic">myra</span>
                    <span className="inline-block ml-3 text-4xl sm:text-5xl md:text-6xl">👋</span>
                </motion.h1>

                {/* New subtext */}
                <motion.p 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="max-w-2xl mx-auto text-lg sm:text-xl text-white/60 font-sans font-light mb-12 leading-relaxed"
                >
                    Your modern supplement (or alternative) to a traditional financial advisor. Skip the drive and meet with me here. I'll help you keep more of your money while we map your best financial path forward together.
                </motion.p>

                {/* "Why myra?" CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="mb-12 inline-flex rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                    <Link 
                        to="/offer" 
                        target="_blank" 
                        className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-8 text-sm font-semibold text-black transition-all hover:opacity-90 shadow-lg gradient-ring"
                    >
                        <Play className="w-4 h-4 fill-black" />
                        Why myra?
                        <ArrowRight className="w-4 h-4 opacity-50" />
                    </Link>
                </motion.div>

                {/* Glass Chat Input with Typewriter Effect */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
                    className="w-full max-w-2xl mx-auto relative group cursor-pointer transition-transform duration-500 hover:scale-[1.01]"
                >
                    <div onClick={handleChatClick} className="block relative outline-none focus:outline-none">
                        {/* Static glow outline */}
                        <div className="absolute -inset-[2px] rounded-[2rem] bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-blue-500/20 pointer-events-none" />
                        
                        <div className="relative glass-panel rounded-[2rem] p-2 flex items-center pr-4">
                            <div className="flex-1 py-4 px-6 text-left overflow-hidden h-[60px] flex items-center">
                                <span className="text-white/40 text-base sm:text-lg font-sans">Chat...</span>
                                <span className="text-white/50 text-base sm:text-lg font-sans ml-1">
                                    {typedQuestion}
                                </span>
                                <span className="inline-block w-[2px] h-5 bg-white ml-0.5 animate-pulse align-middle shrink-0" />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-colors border border-white/10 shrink-0 hover:bg-white/20">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Trust Badges — Plaid, CFP®, Secured */}
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
                    className="mt-20 flex flex-wrap items-center justify-center gap-x-16 gap-y-8 opacity-50 hover:opacity-80 transition-all duration-500"
                >
                    {/* Plaid Badge */}
                    <div className="flex flex-col items-center gap-2">
                        <svg width="36" height="36" viewBox="0 0 100 100" className="text-white">
                            <rect x="10" y="10" width="35" height="35" rx="4" fill="currentColor" opacity="0.3" />
                            <rect x="55" y="10" width="35" height="35" rx="4" fill="currentColor" opacity="0.2" />
                            <rect x="10" y="55" width="35" height="35" rx="4" fill="currentColor" opacity="0.2" />
                            <rect x="55" y="55" width="35" height="35" rx="4" fill="currentColor" opacity="0.3" />
                        </svg>
                        <p className="text-xs font-bold tracking-widest text-white">PLAID</p>
                    </div>

                    {/* CFP Badge */}
                    <div className="flex flex-col items-center gap-2">
                        <svg width="44" height="44" viewBox="0 0 100 100" className="text-white">
                            <polygon 
                                points="50,2 55,18 62,5 63,22 72,10 69,27 80,18 74,33 87,28 78,40 92,38 81,48 95,50 81,52 92,62 78,60 87,72 74,67 80,82 69,73 72,90 63,78 62,95 55,82 50,98 45,82 38,95 37,78 28,90 31,73 20,82 26,67 13,72 22,60 8,62 19,52 5,50 19,48 8,38 22,40 13,28 26,33 20,18 31,27 28,10 37,22 38,5 45,18"
                                fill="currentColor" 
                                opacity="0.15"
                            />
                            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                            <text x="50" y="48" textAnchor="middle" dominantBaseline="central" fill="currentColor" fontSize="18" fontWeight="700" fontFamily="Lato, sans-serif">CFP</text>
                            <text x="72" y="36" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="400" fontFamily="Lato, sans-serif">®</text>
                        </svg>
                        <p className="text-xs font-bold tracking-widest text-white">CERTIFIED</p>
                    </div>

                    {/* Secured Badge */}
                    <div className="flex flex-col items-center gap-2">
                        <svg width="36" height="36" viewBox="0 0 100 100" className="text-white">
                            <path d="M50 5 L90 25 V55 C90 78 68 95 50 100 C32 95 10 78 10 55 V25 Z" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.3" />
                            <path d="M35 50 L45 60 L65 40" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                        </svg>
                        <p className="text-xs font-bold tracking-widest text-white">SECURED</p>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default NewHero;
