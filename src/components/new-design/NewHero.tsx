import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

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
            // Typing
            if (displayText.length < currentFullText.length) {
                setDisplayText(currentFullText.substring(0, displayText.length + 1));
            } else {
                // Finished typing — pause then start deleting
                setTimeout(() => setIsDeleting(true), pauseTime);
                return;
            }
        } else {
            // Deleting
            if (displayText.length > 0) {
                setDisplayText(currentFullText.substring(0, displayText.length - 1));
            } else {
                // Finished deleting — move to next question
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
                transition={{ duration: 0.8, ease: "easeOut", staggerChildren: 0.2 }}
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

                {/* Headline — "myra." */}
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-6xl sm:text-7xl md:text-[6rem] leading-[1.1] font-serif text-white mb-8 text-glow"
                >
                    myra.
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="max-w-2xl mx-auto text-lg sm:text-xl text-white/60 font-sans font-light mb-12 leading-relaxed"
                >
                    The modern alternative to the traditional financial advisor experience, without the high management fees, conflicted advice, and inconsistent service. At less than a third of the cost, myra provides the guidance and support you need with 24/7 availability and perfect memory, helping you navigate retirement with confidence.
                </motion.p>

                {/* CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="mb-16 inline-flex rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                    <Link to="/offer" target="_blank" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-black transition-all hover:opacity-90 shadow-lg gradient-ring">
                        GET STARTED
                        <ArrowRight className="w-4 h-4 opacity-50 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>

                {/* Glass Chat Input with Typewriter Effect */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
                    className="w-full max-w-2xl mx-auto relative group cursor-pointer transition-transform duration-500 hover:scale-[1.01]"
                >
                    <Link to="/offer" target="_blank" className="block relative outline-none focus:outline-none">
                        {/* Static glow outline */}
                        <div className="absolute -inset-[2px] rounded-[2rem] bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-blue-500/20 pointer-events-none" />
                        
                        <div className="relative glass-panel rounded-[2rem] p-2 flex items-center pr-4">
                            <div className="flex-1 py-4 px-6 text-left overflow-hidden h-[60px] flex items-center">
                                <span className="text-white/50 text-lg font-sans">
                                    {typedQuestion}
                                </span>
                                <span className="inline-block w-[2px] h-5 bg-white ml-0.5 animate-pulse align-middle shrink-0" />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-colors border border-white/10 shrink-0">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </Link>
                </motion.div>
                
                <p className="mt-8 text-white/40 text-sm font-sans tracking-wide">
                    Track everything. Ask anything.
                </p>

                {/* Trust Badges */}
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
                    className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-50 hover:opacity-80 transition-all duration-500"
                >
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                        </div>
                        <p className="text-xs font-bold tracking-widest text-white mt-2">FIDUCIARY</p>
                    </div>

                    {/* CFP Badge */}
                    <div className="flex flex-col items-center gap-2">
                        <svg width="44" height="44" viewBox="0 0 100 100" className="text-white">
                            {/* Starburst */}
                            <polygon 
                                points="50,2 55,18 62,5 63,22 72,10 69,27 80,18 74,33 87,28 78,40 92,38 81,48 95,50 81,52 92,62 78,60 87,72 74,67 80,82 69,73 72,90 63,78 62,95 55,82 50,98 45,82 38,95 37,78 28,90 31,73 20,82 26,67 13,72 22,60 8,62 19,52 5,50 19,48 8,38 22,40 13,28 26,33 20,18 31,27 28,10 37,22 38,5 45,18"
                                fill="currentColor" 
                                opacity="0.15"
                            />
                            {/* Inner circle */}
                            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                            {/* CFP text */}
                            <text x="50" y="48" textAnchor="middle" dominantBaseline="central" fill="currentColor" fontSize="18" fontWeight="700" fontFamily="Lato, sans-serif">CFP</text>
                            {/* ® symbol */}
                            <text x="72" y="36" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="400" fontFamily="Lato, sans-serif">®</text>
                        </svg>
                        <p className="text-xs font-bold tracking-widest text-white">CERTIFIED</p>
                    </div>

                    <div className="text-center">
                        <p className="text-xl font-serif text-white tracking-tight">BANK LEVEL</p>
                        <p className="text-[10px] font-bold tracking-widest text-white mt-1">SECURITY</p>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default NewHero;

