
const Features = () => {
    return (
        <section className="bg-transparent py-24 relative z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="font-serif text-3xl font-bold tracking-tight text-secondary dark:text-white sm:text-4xl">
                        How MyRA helps
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
                        Smart tools designed to secure your financial future, powered by
                        advanced algorithms that work while you sleep.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Feature 1 */}
                    <div className="relative group rounded-[2rem] border border-white/10 bg-white/5 p-8 transition-all duration-500 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 dark:bg-slate-900/40 backdrop-blur-xl">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 shadow-inner ring-1 ring-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                            <span className="material-symbols-outlined text-[32px]">map</span>
                        </div>
                        <h3 className="text-xl font-bold leading-7 text-secondary dark:text-white mb-3">
                            Personalized Roadmap
                        </h3>
                        <p className="text-base leading-7 text-slate-600 dark:text-slate-400">
                            Tailored investment strategies that adapt to your life changes and
                            goals. We replan instantly when life happens.
                        </p>
                    </div>
                    {/* Feature 2 */}
                    <div className="relative group rounded-[2rem] border border-white/10 bg-white/5 p-8 transition-all duration-500 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 dark:bg-slate-900/40 backdrop-blur-xl">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 shadow-inner ring-1 ring-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                            <span className="material-symbols-outlined text-[32px]">
                                savings
                            </span>
                        </div>
                        <h3 className="text-xl font-bold leading-7 text-secondary dark:text-white mb-3">
                            Smart Tax Optimization
                        </h3>
                        <p className="text-base leading-7 text-slate-600 dark:text-slate-400">
                            Automated tax-loss harvesting to maximize your returns without the
                            headache. Keep more of what you earn.
                        </p>
                    </div>
                    {/* Feature 3 */}
                    <div className="relative group rounded-[2rem] border border-white/10 bg-white/5 p-8 transition-all duration-500 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 dark:bg-slate-900/40 backdrop-blur-xl">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 shadow-inner ring-1 ring-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                            <span className="material-symbols-outlined text-[32px]">
                                monitoring
                            </span>
                        </div>
                        <h3 className="text-xl font-bold leading-7 text-secondary dark:text-white mb-3">
                            24/7 Market Monitoring
                        </h3>
                        <p className="text-base leading-7 text-slate-600 dark:text-slate-400">
                            Continuous analysis of market trends to keep your portfolio on
                            track. We watch the markets so you don't have to.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
