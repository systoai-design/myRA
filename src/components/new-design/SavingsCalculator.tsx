import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, Calculator, ArrowRight } from "lucide-react";

function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
}

const SavingsCalculator = () => {
    const [portfolioSize, setPortfolioSize] = useState(500000);
    const [currentFee, setCurrentFee] = useState(1.0);

    // Option B tiered fee schedule based on portfolio size
    const getMyraFee = (balance: number): number => {
        if (balance <= 100_000) return 0.60;
        if (balance <= 500_000) return 0.50;
        if (balance <= 2_000_000) return 0.40;
        return 0.30;
    };

    const myraFee = getMyraFee(portfolioSize);
    const myraFeeBps = Math.round(myraFee * 100); // basis points for display

    const savings = useMemo(() => {
        const fee = getMyraFee(portfolioSize);
        const currentAnnual = portfolioSize * (currentFee / 100);
        const myraAnnual = portfolioSize * (fee / 100);
        const annualSavings = currentAnnual - myraAnnual;
        const tenYearSavings = annualSavings * 10;
        // Compound savings over 10 years at 7% avg return
        let compoundSavings = 0;
        for (let i = 0; i < 10; i++) {
            compoundSavings = (compoundSavings + annualSavings) * 1.07;
        }
        return {
            currentAnnual,
            myraAnnual,
            annualSavings: Math.max(0, annualSavings),
            tenYearSavings: Math.max(0, tenYearSavings),
            compoundSavings: Math.max(0, compoundSavings),
        };
    }, [portfolioSize, currentFee]);

    return (
        <section className="relative py-24 lg:py-32 bg-background overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-serif text-foreground mb-6">
                        <span className="gradient-text">Calculate</span> how much I can save
                    </h2>
                    <p className="max-w-xl mx-auto text-lg text-muted-foreground font-sans font-light">
                        See how much you could save by switching from a traditional advisor to myra.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="glass-card rounded-[2rem] p-8 lg:p-12"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Input Side */}
                        <div className="space-y-8">
                            {/* Portfolio Size */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">
                                    Portfolio Size
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={portfolioSize.toLocaleString()}
                                        onChange={(e) => {
                                            const val = Number(e.target.value.replace(/[^0-9]/g, ""));
                                            if (!isNaN(val)) setPortfolioSize(val);
                                        }}
                                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-border text-foreground text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                    />
                                </div>
                                <input
                                    type="range"
                                    min={50000}
                                    max={5000000}
                                    step={50000}
                                    value={portfolioSize}
                                    onChange={(e) => setPortfolioSize(Number(e.target.value))}
                                    className="w-full mt-3 accent-emerald-500 h-1.5 bg-border rounded-full appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                    <span>$50K</span>
                                    <span>$5M</span>
                                </div>
                            </div>

                            {/* Current AUM Fee */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">
                                    Current AUM Fee (%)
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min={0.25}
                                        max={2.5}
                                        step={0.05}
                                        value={currentFee}
                                        onChange={(e) => setCurrentFee(Number(e.target.value))}
                                        className="flex-1 accent-blue-500 h-1.5 bg-border rounded-full appearance-none cursor-pointer"
                                    />
                                    <div className="w-20 h-12 rounded-xl bg-black/[0.03] dark:bg-white/5 border border-border flex items-center justify-center">
                                        <span className="text-lg font-bold font-mono text-foreground">{currentFee.toFixed(2)}%</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                    <span>0.25%</span>
                                    <span>2.50%</span>
                                </div>
                            </div>

                            {/* myra rate callout — updates dynamically with portfolio size */}
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <TrendingDown className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold font-mono text-foreground">myra's fee: {myraFee.toFixed(2)}%</p>
                                    <p className="text-xs text-muted-foreground">Based on {myraFeeBps} basis points for portfolios {portfolioSize <= 100_000 ? 'up to $100K' : portfolioSize <= 500_000 ? '$100K–$500K' : portfolioSize <= 2_000_000 ? '$500K–$2M' : 'over $2M'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Results Side */}
                        <div className="flex flex-col justify-center space-y-6">
                            {/* Annual Savings */}
                            <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-border">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Annual Savings</p>
                                <p className="text-4xl font-bold font-mono text-emerald-400 tracking-tight">
                                    {formatCurrency(savings.annualSavings)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatCurrency(savings.currentAnnual)} → {formatCurrency(savings.myraAnnual)} per year
                                </p>
                            </div>

                            {/* 10-Year Compound Savings */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-blue-500/5 dark:from-emerald-500/10 dark:to-blue-500/10 border border-emerald-500/15">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">10-Year Compound Savings</p>
                                <p className="text-5xl font-bold font-mono text-foreground tracking-tight">
                                    {formatCurrency(savings.compoundSavings)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Assuming 7% average annual return on saved fees
                                </p>
                            </div>

                            {/* CTA */}
                            <div 
                                onClick={() => window.open('/offer', '_blank')}
                                className="group inline-flex rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-fit"
                            >
                                <div className="flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-sm font-semibold text-background transition-all hover:opacity-90 shadow-lg">
                                    Start Saving Today
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SavingsCalculator;
