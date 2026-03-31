import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

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

const NewHero = () => {
    const [questionIndex, setQuestionIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setQuestionIndex((prev) => (prev + 1) % rotatingQuestions.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden bg-background pt-20">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                {/* Light mode: soft blue/purple gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50/50 dark:from-transparent dark:via-transparent dark:to-transparent" />
                {/* Dark mode: aurora */}
                <div className="absolute inset-0 aurora-bg opacity-0 dark:opacity-80" />
                
                {/* Gradient fades */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
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
                    className="mb-12 inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/20 bg-black/[0.03] dark:bg-white/5 px-4 py-1.5 backdrop-blur-md"
                >
                    <span className="text-[11px] font-bold tracking-widest uppercase text-foreground/80 font-sans">
                        Fiduciary Standard • AI Powered
                    </span>
                </motion.div>

                {/* Headline — "myra." */}
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-6xl sm:text-7xl md:text-[6rem] leading-[1.1] font-serif text-foreground mb-8 dark:text-glow"
                >
                    myra.
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground font-sans font-light mb-12 leading-relaxed"
                >
                    The modern alternative to the traditional financial advisor experience, without the high management fees, conflicted advice, and inconsistent service. At less than a third of the cost, myra provides the guidance and support you need with 24/7 availability and perfect memory, helping you navigate retirement with confidence.
                </motion.p>

                {/* CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="mb-16 inline-flex rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                    <Link to="/offer" target="_blank" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 text-sm font-semibold text-background transition-all hover:opacity-90 shadow-lg">
                        GET STARTED
                        <ArrowRight className="w-4 h-4 opacity-50 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>

                {/* Glass Chat Input with Rotating Questions */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
                    className="w-full max-w-2xl mx-auto relative group cursor-pointer transition-transform duration-500 hover:scale-[1.01]"
                >
                    <Link to="/offer" target="_blank" className="block relative outline-none focus:outline-none">
                        {/* Static glow outline */}
                        <div className="absolute -inset-[2px] rounded-[2rem] bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-blue-500/20 pointer-events-none" />
                        
                        <div className="relative glass-panel rounded-[2rem] p-2 flex items-center pr-4">
                            <div className="flex-1 py-4 px-6 text-left overflow-hidden h-[60px] flex items-center">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={questionIndex}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="text-muted-foreground text-lg font-sans block"
                                    >
                                        {rotatingQuestions[questionIndex]}
                                    </motion.span>
                                </AnimatePresence>
                                <span className="inline-block w-[2px] h-5 bg-primary dark:bg-white ml-2 animate-pulse align-middle shrink-0" />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-black/[0.04] dark:bg-white/10 flex items-center justify-center transition-colors border border-black/5 dark:border-white/10 shrink-0">
                                <ArrowRight className="w-5 h-5 text-foreground" />
                            </div>
                        </div>
                    </Link>
                </motion.div>
                
                <p className="mt-8 text-muted-foreground/60 text-sm font-sans tracking-wide">
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
                                <svg key={i} className="w-4 h-4 text-foreground" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                        </div>
                        <p className="text-xs font-bold tracking-widest text-foreground mt-2">FIDUCIARY</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-serif text-foreground tracking-tight">BANK LEVEL</p>
                        <p className="text-[10px] font-bold tracking-widest text-foreground mt-1">SECURITY</p>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default NewHero;
