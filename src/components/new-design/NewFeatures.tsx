import { motion } from "framer-motion";
import { LineChart, Calendar, Plus, Car, Utensils, Infinity, PieChart, Activity, DollarSign } from "lucide-react";

const NewFeatures = () => {
    return (
        <section className="relative py-32 bg-background overflow-hidden">
            {/* Subtle glow behind features */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] aurora-bg opacity-30 pointer-events-none blur-[100px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                
                {/* Section Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-5xl md:text-6xl font-serif text-foreground mb-6">
                        <span className="italic font-light">Simplify</span> your future
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-sans font-light">
                        Connect all your accounts to see your retirement in one<br className="hidden sm:block" />
                        place—easy to find, easy to understand.
                    </p>
                </motion.div>

                {/* Origin-style 3-Column Image Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[600px]">
                    
                    {/* Card 1: Calendar / Spend */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="glass-premium rounded-[2rem] overflow-hidden relative group flex flex-col"
                    >
                        {/* Pure Glass Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent z-0" />
                        
                        {/* Inner Floating UI Panel */}
                        <div className="relative z-10 mt-8 mx-6 flex-1 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex flex-col shadow-2xl overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
                            
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-bold tracking-[0.2em] text-white/60">SPEND THIS MONTH</span>
                                <div className="flex gap-1">
                                    <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"><LineChart className="w-3.5 h-3.5 text-white/80" /></button>
                                    <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"><Calendar className="w-3.5 h-3.5 text-white/80" /></button>
                                    <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"><Plus className="w-3.5 h-3.5 text-white/80" /></button>
                                </div>
                            </div>
                            
                            <h3 className="text-3xl font-serif text-white mb-6 tracking-tight">$1,586</h3>

                            {/* Calendar Grid Mockup */}
                            <div className="grid grid-cols-7 gap-1 flex-1">
                                {/* Week 1 */}
                                {[{d:1},{d:2,a:'$80',bg:'bg-white/10'},{d:3,a:'$8',bg:'bg-white/5'},{d:4,a:'$1.3k',bg:'bg-white text-black'},{d:5,a:'$64',bg:'bg-white/20'},{d:6,a:'$102',bg:'bg-white/10'},{d:7,a:'$32'}].map((day,i) => (
                                    <div key={i} className={`flex flex-col items-center justify-center rounded-md text-xs py-2 ${day.bg || 'border border-white/5'}`}>
                                        <span className={`font-semibold ${day.bg && day.bg.includes('text-black') ? 'text-black' : 'text-white/60'}`}>{day.d}</span>
                                        <span className={`text-[9px] mt-1 ${day.bg && day.bg.includes('text-black') ? 'text-black/70' : 'text-white/40'}`}>{day.a || '-'}</span>
                                    </div>
                                ))}
                                {/* Blank Weeks */}
                                {[...Array(24)].map((_, i) => (
                                    <div key={`blank-${i}`} className="flex flex-col items-center justify-center rounded-md border border-white/5 text-xs py-2">
                                        <span className="font-semibold text-white/30">{i + 8}</span>
                                        <span className="text-[9px] mt-1 text-white/20">-</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="relative z-10 p-8 pt-6 pb-10">
                            <h4 className="text-xl font-sans font-bold text-foreground mb-2">Monitor your spending</h4>
                            <p className="text-sm font-sans text-muted-foreground">See every transaction, automatically categorized.</p>
                        </div>
                    </motion.div>

                    {/* Card 2: Budget */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="glass-premium rounded-[2rem] overflow-hidden relative group flex flex-col"
                    >
                        {/* Pure Glass Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent z-0" />
                        
                        <div className="relative z-10 mt-8 mx-6 flex-1 bg-[#1a1512]/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl group-hover:-translate-y-2 transition-transform duration-500">
                            
                            <span className="text-[10px] font-bold tracking-[0.2em] text-white/60 mb-6 block">BUDGET</span>
                            
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-sans text-white/90">Total Budget</span>
                                <span className="text-sm font-sans text-white/90">$2,234 of $5,000</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full mb-1 flex overflow-hidden">
                                <div className="h-full bg-white w-[44.7%] border-r-2 border-transparent" />
                                <div className="h-full bg-white/40 w-[10%]" />
                            </div>
                            <div className="text-right text-[10px] text-white/40 mb-8 tracking-widest">44.7%</div>

                            {/* List Elements */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)_inset] flex items-center justify-center">
                                                <Utensils className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-xs font-semibold text-white/80">Food</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <div className="flex-1 h-1 bg-white/10 rounded-full flex overflow-hidden">
                                            <div className="h-full bg-white/60 w-[41.1%]" />
                                            <div className="h-full bg-white/20 w-[15%]" />
                                        </div>
                                        <span className="text-[10px] text-white/40 tracking-widest w-8 text-right">41.1%</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)_inset] flex items-center justify-center">
                                                <Car className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-xs font-semibold text-white/80">Auto & Transport</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <div className="flex-1 h-1 bg-white/10 rounded-full flex overflow-hidden">
                                            <div className="h-full bg-white/60 w-[8.3%]" />
                                        </div>
                                        <span className="text-[10px] text-white/40 tracking-widest w-8 text-right">8.3%</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)_inset] flex items-center justify-center">
                                                <Infinity className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-xs font-semibold text-white/80">Everything Else</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <div className="flex-1 h-1 bg-white/10 rounded-full flex overflow-hidden">
                                            <div className="h-full bg-white/60 w-[47.9%]" />
                                            <div className="h-full bg-white/20 w-[12%]" />
                                        </div>
                                        <span className="text-[10px] text-white/40 tracking-widest w-8 text-right">47.9%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="relative z-10 p-8 pt-6 pb-10">
                            <h4 className="text-xl font-sans font-bold text-foreground mb-2">Build a budget</h4>
                            <p className="text-sm font-sans text-muted-foreground">AI sets up your budget and helps you track progress all month long.</p>
                        </div>
                    </motion.div>

                    {/* Card 3: Upcoming Transactions */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="glass-premium rounded-[2rem] overflow-hidden relative group flex flex-col"
                    >
                        {/* Pure Glass Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent z-0" />
                        
                        <div className="relative z-10 mt-8 mx-6 flex-1 bg-[#0b141d]/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex flex-col shadow-2xl overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
                            
                            <span className="text-[10px] font-bold tracking-[0.2em] text-white/60 mb-6 block uppercase">Upcoming Transactions</span>
                            
                            {/* Schedule View */}
                            <div className="flex-1 border border-white/5 rounded-2xl overflow-hidden flex flex-col bg-white/5">
                                {/* Week Days Header */}
                                <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
                                    {['SUN','MON','TUE','WED','THU','FRI','SAT'].map((day,i) => (
                                        <div key={i} className="text-[9px] font-semibold text-white/50 text-center py-3">{day}</div>
                                    ))}
                                </div>
                                
                                {/* Grid Content */}
                                <div className="grid grid-cols-7 flex-1 relative">
                                    {/* Vertical Dividers */}
                                    <div className="absolute inset-y-0 left-[14.28%] border-l border-white/5" />
                                    <div className="absolute inset-y-0 left-[28.56%] border-l border-white/5" />
                                    <div className="absolute inset-y-0 left-[42.84%] border-l border-white/5" />
                                    <div className="absolute inset-y-0 left-[57.12%] border-l border-white/5" />
                                    <div className="absolute inset-y-0 left-[71.4%] border-l border-white/5" />
                                    <div className="absolute inset-y-0 left-[85.68%] border-l border-white/5" />
                                    
                                    {/* Horizontal Divider */}
                                    <div className="absolute top-1/2 left-0 w-full border-t border-white/5" />

                                    {/* Content Column by Column (Mocked) */}
                                    
                                    {/* SUN */}
                                    <div className="col-start-1 relative">
                                        <span className="absolute top-3 w-full text-center text-xs text-white/50">27</span>
                                        {/* Item bottom half */}
                                        <div className="absolute bottom-6 w-full flex flex-col items-center">
                                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-1">
                                                <PieChart className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-[9px] text-white/70">$144.99</span>
                                        </div>
                                    </div>
                                    
                                    {/* MON */}
                                    <div className="col-start-2 relative bg-white/5">
                                        <div className="absolute top-2 w-full flex justify-center">
                                            <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-xs text-white">28</span>
                                        </div>
                                    </div>
                                    
                                    {/* TUE */}
                                    <div className="col-start-3 relative">
                                        <span className="absolute top-3 w-full text-center text-xs text-white/50">29</span>
                                        <div className="absolute top-12 w-full flex flex-col items-center">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)] mb-1">
                                                <Activity className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-[9px] text-white/70">$2.3k</span>
                                        </div>
                                    </div>
                                    
                                    {/* WED */}
                                    <div className="col-start-4 relative">
                                        <span className="absolute top-3 w-full text-center text-xs text-white/50">30</span>
                                    </div>

                                    {/* THU */}
                                    <div className="col-start-5 relative">
                                        <span className="absolute top-3 w-full text-center text-xs text-white/50">1</span>
                                        <div className="absolute top-10 w-full flex flex-col items-center relative z-10">
                                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.5)] absolute top-0 -translate-y-1 z-0 ring-2 ring-[#0b141d]/60">
                                                <DollarSign className="w-3 h-3 text-white" />
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)] relative z-10 ring-2 ring-[#0b141d]/60 mt-3 mb-1">
                                                <PieChart className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-[9px] text-white/70 mt-1">$21.98</span>
                                        </div>
                                        <div className="absolute bottom-6 w-full flex flex-col items-center">
                                            <div className="w-6 h-6 rounded-full bg-black/40 border border-white/20 flex items-center justify-center mb-1">
                                                <span className="text-white/40 tracking-widest leading-none block -mt-1 font-serif">...</span>
                                            </div>
                                            <span className="text-[9px] text-white/70">$9.99</span>
                                        </div>
                                    </div>

                                    {/* FRI */}
                                    <div className="col-start-6 relative">
                                        <span className="absolute top-3 w-full text-center text-xs text-white/50">2</span>
                                    </div>

                                    {/* SAT */}
                                    <div className="col-start-7 relative">
                                        <span className="absolute top-3 w-full text-center text-xs text-white/50">3</span>
                                        <div className="absolute top-12 w-full flex flex-col items-center">
                                            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.5)] mb-1">
                                                <div className="w-2 h-2 bg-white rounded-sm" />
                                            </div>
                                            <span className="text-[9px] text-white/70">$82.99</span>
                                        </div>
                                    </div>

                                    {/* Second Row Numbers */}
                                    <span className="absolute bottom-[40%] w-full flex text-xs text-white/50">
                                        <span className="flex-1 text-center">4</span>
                                        <span className="flex-1 text-center">5</span>
                                        <span className="flex-1 text-center">6</span>
                                        <span className="flex-1 text-center">7</span>
                                        <span className="flex-1 text-center">8</span>
                                        <span className="flex-1 text-center">9</span>
                                        <span className="flex-1 text-center">10</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="relative z-10 p-8 pt-6 pb-10">
                            <h4 className="text-xl font-sans font-bold text-foreground mb-2">Cancel unwanted subscriptions</h4>
                            <p className="text-sm font-sans text-muted-foreground">Find, manage, and cancel subscriptions in seconds.</p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default NewFeatures;
