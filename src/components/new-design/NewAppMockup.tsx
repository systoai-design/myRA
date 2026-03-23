import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, PieChart, Activity, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, CreditCard, Landmark, Lock } from "lucide-react";

const tabs = [
    { id: "networth", label: "Net Worth", color: "text-blue-400" },
    { id: "cashflow", label: "Cashflow", color: "text-emerald-400" },
    { id: "portfolio", label: "Portfolio", color: "text-purple-400" }
];

const variants = {
    initial: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 1.02, filter: "blur(10px)", transition: { duration: 0.4, ease: "easeInOut" } }
};

// --- Desktop Panels --- //

const NetWorthPanel = () => (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 p-8 flex flex-col gap-6">
        <div className="flex justify-between items-end mb-4">
            <div>
                <h4 className="text-white/50 text-sm font-semibold mb-1">Total Net Worth</h4>
                <div className="text-5xl font-serif text-white tracking-tight">$1,204,500.00</div>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full text-sm font-semibold">
                <TrendingUp className="w-4 h-4" />
                +12.5% All Time
            </div>
        </div>

        {/* Big Chart Area */}
        <div className="flex-1 w-full relative rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden p-6 flex items-end">
            <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-blue-500/20 to-transparent" />
            <svg className="absolute inset-0 w-full h-full text-blue-500 overflow-visible p-6 pb-0" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path d="M0,40 L0,35 C20,32 30,20 50,22 C70,24 80,10 100,5 L100,40 Z" fill="currentColor" fillOpacity="0.1" />
                <path d="M0,35 C20,32 30,20 50,22 C70,24 80,10 100,5" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
        </div>

        {/* Bottom Metrics */}
        <div className="grid grid-cols-3 gap-4 h-24">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-center">
                <div className="text-white/50 text-xs mb-1 flex items-center gap-2"><Landmark className="w-3 h-3" /> Cash</div>
                <div className="text-white font-semibold text-lg">$45,200</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-center">
                <div className="text-white/50 text-xs mb-1 flex items-center gap-2"><PieChart className="w-3 h-3" /> Investments</div>
                <div className="text-white font-semibold text-lg">$850,300</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-center">
                <div className="text-white/50 text-xs mb-1 flex items-center gap-2"><Wallet className="w-3 h-3" /> Real Estate</div>
                <div className="text-white font-semibold text-lg">$309,000</div>
            </div>
        </div>
    </motion.div>
);

const CashflowPanel = () => (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 p-8 flex gap-8">
        {/* Left: Spend summary */}
        <div className="w-1/3 flex flex-col gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1">
                <h4 className="text-white/50 text-sm font-semibold mb-6">Monthly Cashflow</h4>
                <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                        <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset="60" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-serif text-white tracking-tight">+$4.2k</span>
                        <span className="text-xs text-white/50">Surplus</span>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70 flex items-center gap-2"><ArrowDownRight className="w-4 h-4 text-emerald-400" /> Income</span>
                        <span className="text-white font-semibold">$12,400</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70 flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-red-400" /> Expenses</span>
                        <span className="text-white font-semibold">$8,200</span>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Right: Transactions */}
        <div className="w-2/3 flex flex-col gap-3">
            <h4 className="text-white/50 text-sm font-semibold mb-2">Recent Transactions</h4>
            {[
                { name: "Whole Foods Market", cat: "Groceries", amt: "-$142.50", icon: Wallet },
                { name: "Vanguard 401(k) Contribution", cat: "Investing", amt: "-$1,200.00", icon: Activity },
                { name: "Acme Corp Salary", cat: "Income", amt: "+$6,200.00", icon: DollarSign, isIncome: true },
                { name: "Netflix Subscription", cat: "Entertainment", amt: "-$15.99", icon: CreditCard },
                { name: "Equinox Gym", cat: "Health", amt: "-$250.00", icon: CreditCard }
            ].map((tx, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <tx.icon className="w-4 h-4 text-white/80" />
                        </div>
                        <div>
                            <div className="text-white font-semibold text-sm">{tx.name}</div>
                            <div className="text-white/50 text-xs">{tx.cat}</div>
                        </div>
                    </div>
                    <div className={`font-semibold ${tx.isIncome ? 'text-emerald-400' : 'text-white'}`}>
                        {tx.amt}
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
);

const PortfolioPanel = () => (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 p-8 flex flex-col gap-6">
        <h4 className="text-white/50 text-sm font-semibold mb-2">Asset Allocation</h4>
        <div className="flex-1 flex gap-6">
            <div className="w-1/2 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
                <div className="font-serif text-3xl text-white mb-6">$850,300</div>
                
                {/* Custom bar chart replacing pie chart for portfolio */}
                <div className="flex-1 flex flex-col justify-center gap-4">
                    {[
                        { label: "US Equities", pct: "55%", w: "w-[55%]", color: "bg-purple-500" },
                        { label: "Intl Equities", pct: "20%", w: "w-[20%]", color: "bg-blue-500" },
                        { label: "Bonds", pct: "15%", w: "w-[15%]", color: "bg-emerald-500" },
                        { label: "Crypto / Alts", pct: "10%", w: "w-[10%]", color: "bg-orange-500" }
                    ].map((item, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-white/70">{item.label}</span>
                                <span className="text-white font-semibold">{item.pct}</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color} ${item.w} rounded-full`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="w-1/2 flex flex-col gap-3">
                 <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 flex-1 flex flex-col justify-center">
                     <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                         <Activity className="w-4 h-4" /> AI Tax Harvest Found
                     </h3>
                     <p className="text-white/70 text-sm leading-relaxed mb-4">
                         MyRA identified <strong className="text-white">$3,240</strong> in harvestable losses on your AAPL position. Would you like to execute this trade to offset upcoming capital gains?
                     </p>
                     <button className="bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg w-fit text-sm hover:bg-purple-400 transition-colors">
                         Execute Strategy
                     </button>
                 </div>
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-1/3 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                             <TrendingUp className="w-4 h-4" />
                         </div>
                         <div>
                             <div className="text-sm font-semibold text-white">SPY Dividend Reinvested</div>
                             <div className="text-xs text-white/50">Today at 9:30 AM</div>
                         </div>
                     </div>
                     <span className="text-white font-semibold text-sm">+$450.00</span>
                 </div>
            </div>
        </div>
    </motion.div>
);

// --- Mobile Panels --- //

const MobileNetWorth = () => (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 p-4 pt-12 flex flex-col">
        <h4 className="text-white/50 text-[10px] font-semibold text-center mb-1">Total Net Worth</h4>
        <div className="text-2xl font-serif text-white tracking-tight text-center mb-4">$1,204,500</div>
        <div className="flex justify-center mb-6">
             <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 flex-col rounded-full text-[10px] font-semibold">
                +12.5%
            </div>
        </div>
        <div className="flex-1 w-full relative rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-blue-500/20 to-transparent" />
        </div>
    </motion.div>
);

const MobileCashflow = () => (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 p-4 pt-12 flex flex-col items-center">
        <h4 className="text-white/50 text-[10px] font-semibold mb-6">Monthly Cashflow</h4>
        <div className="relative w-24 h-24 mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset="60" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-serif text-white tracking-tight">+$4.2k</span>
            </div>
        </div>
        <div className="w-full space-y-2 mt-auto">
            <div className="bg-white/5 rounded-lg p-2 text-[10px] flex justify-between"><span className="text-white/50">Income</span><span className="text-white">$12,400</span></div>
            <div className="bg-white/5 rounded-lg p-2 text-[10px] flex justify-between"><span className="text-white/50">Expenses</span><span className="text-white">$8,200</span></div>
        </div>
    </motion.div>
);

const MobilePortfolio = () => (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 p-4 pt-12 flex flex-col">
        <h4 className="text-white/50 text-[10px] font-semibold text-center mb-1">Asset Allocation</h4>
        <div className="text-2xl font-serif text-white tracking-tight text-center mb-6">$850,300</div>
        
        <div className="flex-1 flex flex-col gap-3">
            {[
                { label: "US Equities", pct: "55%", w: "w-[55%]", color: "bg-purple-500" },
                { label: "Intl Equities", pct: "20%", w: "w-[20%]", color: "bg-blue-500" },
                { label: "Bonds", pct: "15%", w: "w-[15%]", color: "bg-emerald-500" }
            ].map((item, i) => (
                <div key={i}>
                    <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-white/70">{item.label}</span>
                        <span className="text-white">{item.pct}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} ${item.w} rounded-full`} />
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
);

const NewAppMockup = () => {
    const [activeTab, setActiveTab] = useState(0);

    // Auto-play interval rotates the active tab every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % tabs.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-24 lg:py-40 bg-[#030508] relative overflow-hidden flex flex-col items-center">
             
             {/* Text Animation & Controls (Centered above the app) */}
             <div className="text-center z-20 mb-12 px-4">
                 
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-10 tracking-tight leading-tight flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                    <span>Manage your</span>
                    <span className="relative inline-block overflow-hidden h-[1.3em] w-[260px] md:w-[320px] text-left">
                         <AnimatePresence mode="popLayout">
                             <motion.span
                                 key={tabs[activeTab].id}
                                 initial={{ y: 60, opacity: 0, scale: 0.9 }}
                                 animate={{ y: 0, opacity: 1, scale: 1 }}
                                 exit={{ y: -60, opacity: 0, scale: 1.1 }}
                                 transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                 className={`absolute left-0 right-0 ${tabs[activeTab].color}`}
                             >
                                 {tabs[activeTab].label}
                             </motion.span>
                         </AnimatePresence>
                    </span>
                 </h2>

                 {/* Interactive Pills */}
                 <div className="flex items-center justify-center gap-2 md:gap-4 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-md w-fit mx-auto">
                     {tabs.map((tab, idx) => (
                         <button
                             key={tab.id}
                             onClick={() => setActiveTab(idx)}
                             className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 relative ${
                                 activeTab === idx 
                                 ? "text-black shadow-lg" 
                                 : "text-white/60 hover:text-white hover:bg-white/5"
                             }`}
                         >
                             {activeTab === idx && (
                                 <motion.div 
                                     layoutId="pill-bg"
                                     className="absolute inset-0 bg-white rounded-full z-0"
                                     transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                 />
                             )}
                             <span className="relative z-10">{tab.label}</span>
                         </button>
                     ))}
                 </div>
             </div>

             {/* Massive Web App Mockup */}
             <div className="relative w-[95%] max-w-6xl aspect-[4/5] md:aspect-[16/10] z-10 mx-auto perspective-[2000px]">
                  
                  {/* Huge background glow synced to active tab color */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] blur-[140px] -z-10 rounded-full pointer-events-none transition-colors duration-1000 opacity-30 ${activeTab === 0 ? 'bg-blue-600' : activeTab === 1 ? 'bg-emerald-600' : 'bg-purple-600'}`} />
                  
                  <motion.div 
                      className="w-full h-full relative"
                      animate={{ rotateX: 6, scale: 0.98 }}
                      transition={{ duration: 1 }}
                      style={{ transformStyle: "preserve-3d" }}
                  >
                        {/* Hardware Browser Chrome */}
                        <div className="absolute inset-0 bg-[#0a0a0b] border border-[#222] rounded-[2rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col z-10">
                            
                            {/* Browser Header / Traffic Lights */}
                            <div className="h-12 border-b border-[#222] bg-[#0f0f10] flex items-center px-5 gap-2.5 shrink-0">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                
                                <div className="ml-4 flex-1 h-7 rounded-md bg-white/5 border border-white/5 flex items-center px-3 max-w-sm mx-auto">
                                    <Lock className="w-3 h-3 text-white/30 mr-2" />
                                    <span className="text-[10px] font-sans text-white/30">myra.com/dashboard/{tabs[activeTab].id}</span>
                                </div>
                            </div>
                            
                            {/* Content Area */}
                            <div className="flex-1 relative bg-gradient-to-br from-[#050505] to-[#0a0a0a] overflow-hidden hidden md:block">
                                <AnimatePresence mode="wait">
                                     {activeTab === 0 && <NetWorthPanel key="networth" />}
                                     {activeTab === 1 && <CashflowPanel key="cashflow" />}
                                     {activeTab === 2 && <PortfolioPanel key="portfolio" />}
                                </AnimatePresence>
                            </div>

                            {/* Mobile Fallback View */}
                            <div className="flex-1 flex items-center justify-center p-8 text-center bg-[#050505] md:hidden">
                                <p className="text-white/50 text-sm">Please view on a desktop device to see the full financial dashboard simulation.</p>
                            </div>
                        </div>

                        {/* 3D Extrusion underneath browser for physical device thickness */}
                        <div className="absolute inset-x-4 -bottom-4 h-10 bg-[#000] border border-[#111] rounded-[2rem] -z-10 blur-[2px]" style={{ transform: "translateZ(-10px)" }} />
                  </motion.div>
             </div>
        </section>
    );
};

export default NewAppMockup;
