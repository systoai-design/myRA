import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const NewHero = () => {
    return (
        <section className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden bg-[#030508] pt-20">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                {/* Fallback massive radial gradient if no image */}
                <div className="absolute inset-0 aurora-bg opacity-80" />
                
                {/* Simulated Origin Cloud Background */}
                <div 
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-30 mix-blend-overlay"
                />
                
                {/* Gradient fades for seamless blending */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030508] via-transparent to-[#030508]/50" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#030508] via-transparent to-[#030508]" />
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
                    <span className="text-[11px] font-bold tracking-widest uppercase text-white/90 font-sans">
                        Fiduciary Standard • AI Powered
                    </span>
                </motion.div>

                {/* Massive Serif Headline */}
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-6xl sm:text-7xl md:text-[6rem] leading-[1.1] font-serif text-white mb-6 text-glow"
                >
                    <span className="italic font-light">Own</span> your retirement.
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="max-w-xl mx-auto text-lg sm:text-xl text-white/70 font-sans font-light mb-12 leading-relaxed"
                >
                    MyRA is your personal AI Fiduciary Advisor. <br className="hidden sm:block" />
                    Track your wealth, plan for taxes, and optimize your financial future—all in one place.
                </motion.p>

                {/* Primary CTA button with animated glowing border */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="animated-border group mb-16 inline-flex rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                    <div className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#111] px-8 text-sm font-semibold text-white transition-colors group-hover:bg-[#1a1a1a]">
                        GET STARTED
                        <ArrowRight className="w-4 h-4 text-white/50 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                    </div>
                </motion.div>

                {/* Glassmorphism Chat Input Simulation */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
                    className="w-full max-w-2xl mx-auto relative group cursor-pointer transition-transform duration-500 hover:scale-[1.01]"
                >
                    {/* Outer glow */}
                    <div className="absolute -inset-1 bg-white/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                    
                    <div className="relative glass-premium rounded-[2rem] p-2 flex items-center pr-4">
                        <div className="flex-1 py-4 px-6 text-left">
                            <span className="text-white/50 text-lg font-sans">How should I invest for...</span>
                            <span className="inline-block w-[2px] h-5 bg-white ml-2 animate-pulse align-middle" />
                        </div>
                        <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10">
                            <ArrowRight className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </motion.div>
                
                <p className="mt-8 text-white/40 text-sm font-sans tracking-wide">
                    Track everything. Ask anything.
                </p>

                {/* Logos/Trust */}
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
                    className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
                >
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                        </div>
                        <p className="text-xs font-bold tracking-widest text-white mt-2">FIDUCIARY</p>
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
