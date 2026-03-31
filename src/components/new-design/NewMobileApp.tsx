import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Apple } from "lucide-react";

const tabs = [
    { id: "networth", label: "Net Worth" },
    { id: "cashflow", label: "Cashflow" },
    { id: "portfolio", label: "Portfolio" }
];

const variants = {
    initial: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 1.02, filter: "blur(10px)", transition: { duration: 0.4, ease: "easeInOut" } }
};

// --- Mobile Panels --- //

const MobileNetWorth = () => (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 p-4 pt-12 flex flex-col">
        <h4 className="text-white/50 text-xs font-semibold text-center mb-1">Total Net Worth</h4>
        <div className="text-3xl font-serif text-white tracking-tight text-center mb-4">$1,204,500</div>
        <div className="flex justify-center mb-6">
             <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-3 py-1 flex-col rounded-full text-[10px] font-semibold">
                +12.5% All Time
            </div>
        </div>
        <div className="flex-1 w-full relative rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-blue-500/20 to-transparent" />
        </div>
    </motion.div>
);

const MobileCashflow = () => (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 p-4 pt-12 flex flex-col items-center">
        <h4 className="text-white/50 text-xs font-semibold mb-6">Monthly Cashflow</h4>
        <div className="relative w-32 h-32 mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset="60" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-serif text-white tracking-tight">+$4.2k</span>
            </div>
        </div>
        <div className="w-full space-y-2 mt-auto">
            <div className="bg-white/5 border border-white/5 rounded-lg p-3 text-xs flex justify-between"><span className="text-white/50">Income</span><span className="text-white">$12,400</span></div>
            <div className="bg-white/5 border border-white/5 rounded-lg p-3 text-xs flex justify-between"><span className="text-white/50">Expenses</span><span className="text-white">$8,200</span></div>
        </div>
    </motion.div>
);

const MobilePortfolio = () => (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 p-4 pt-12 flex flex-col">
        <h4 className="text-white/50 text-xs font-semibold text-center mb-1">Asset Allocation</h4>
        <div className="text-3xl font-serif text-white tracking-tight text-center mb-8">$850,300</div>
        
        <div className="flex-1 flex flex-col gap-4">
            {[
                { label: "US Equities", pct: "55%", w: "w-[55%]", color: "bg-purple-500" },
                { label: "Intl Equities", pct: "20%", w: "w-[20%]", color: "bg-blue-500" },
                { label: "Bonds", pct: "15%", w: "w-[15%]", color: "bg-emerald-500" }
            ].map((item, i) => (
                <div key={i}>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-white/70">{item.label}</span>
                        <span className="text-white">{item.pct}</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} ${item.w} rounded-full`} />
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
);

const NewMobileApp = () => {
    const [activeTab, setActiveTab] = useState(0);

    // Auto-play interval rotates the active tab every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % tabs.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-24 lg:py-40 w-full bg-background relative overflow-hidden">
            
            {/* Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[140px] -z-10 rounded-full pointer-events-none transition-colors duration-1000 opacity-20 ${activeTab === 0 ? 'bg-blue-600' : activeTab === 1 ? 'bg-emerald-600' : 'bg-purple-600'}`} />

            <div className="flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto px-6 gap-16 lg:gap-24 relative z-20">
                {/* LEFT Col: Header and Text */}
                <div className="w-full lg:w-1/2 text-center lg:text-left z-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-semibold text-muted-foreground">
                        <Apple className="w-4 h-4" />
                        iOS App Coming Soon
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6 tracking-tight leading-tight">
                        Your entire financial life, in your pocket.
                    </h2>
                    
                    <p className="text-lg text-muted-foreground font-light mb-10 max-w-lg mx-auto lg:mx-0">
                        We are currently building the ultimate mobile experience. Soon, you will be able to track your net worth, execute AI tax loss harvesting, and chat with myra directly from your iPhone.
                    </p>

                    {/* Interactive State Indicators */}
                    <div className="flex items-center justify-center lg:justify-start gap-4">
                        {tabs.map((tab, idx) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    activeTab === idx 
                                    ? "w-12 bg-foreground" 
                                    : "w-4 bg-foreground/20 hover:bg-foreground/40"
                                }`}
                                aria-label={`View ${tab.label} mock`}
                            />
                        ))}
                    </div>
                </div>

                {/* RIGHT Col: 3D iPhone Mockup */}
                <div className="w-full lg:w-1/2 flex justify-center perspective-[2000px] z-20 mt-12 lg:mt-0">
                    {/* Colored Orb Behind Phone */}
                    <div 
                        className={`absolute w-[340px] h-[340px] lg:w-[420px] lg:h-[420px] rounded-full blur-[80px] transition-colors duration-1000 pointer-events-none ${
                            activeTab === 0 ? 'bg-blue-500' : activeTab === 1 ? 'bg-emerald-500' : 'bg-purple-500'
                        }`}
                        style={{
                            animation: "orbPulse 6s ease-in-out infinite",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    />
                    <div 
                        className="relative w-[280px] h-[580px] lg:w-[320px] lg:h-[660px]"
                        style={{ 
                            transform: "translateZ(80px) rotateY(-15deg) rotateX(10deg) rotateZ(2deg)",
                            transformStyle: "preserve-3d"
                        }}
                    >
                        {/* iPhone Thickness Layers */}
                        <div className="absolute inset-0 rounded-[3.5rem] bg-[#1a1a1b] shadow-[-20px_40px_100px_rgba(0,0,0,0.8)]" style={{ transform: "translateZ(-15px)" }} />
                        <div className="absolute inset-0 rounded-[3.5rem] bg-[#2a2a2b]" style={{ transform: "translateZ(-8px)" }} />
                        <div className="absolute inset-0 rounded-[3.5rem] bg-[#333]" style={{ transform: "translateZ(-4px)" }} />
                        
                        {/* iPhone Base */}
                        <div className="absolute inset-0 border-[6px] lg:border-[8px] border-[#3a3a3a] rounded-[3.5rem] bg-black overflow-hidden pointer-events-none" style={{ transform: "translateZ(0px)" }}>
                        </div>

                        {/* Dynamic Island */}
                        <div className="absolute top-[16px] lg:top-[20px] left-1/2 -translate-x-1/2 w-[80px] lg:w-[100px] h-[22px] lg:h-[28px] bg-black rounded-full pointer-events-none" style={{ transform: "translateZ(2px)" }} />
                        
                        {/* Screens Container */}
                        <div className="absolute inset-x-[6px] lg:inset-x-[8px] inset-y-[6px] lg:inset-y-[8px] rounded-[3rem] bg-[#050505] overflow-hidden" style={{ transform: "translateZ(1px)" }}>
                            <AnimatePresence mode="wait">
                                {activeTab === 0 && <MobileNetWorth key="networth" />}
                                {activeTab === 1 && <MobileCashflow key="cashflow" />}
                                {activeTab === 2 && <MobilePortfolio key="portfolio" />}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewMobileApp;
