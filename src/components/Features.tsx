
const Features = () => {
    return (
        <section className="bg-white py-24 dark:bg-slate-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="font-serif text-3xl font-bold tracking-tight text-secondary dark:text-white sm:text-4xl">
                        How myRA helps
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
                        Smart tools designed to secure your financial future, powered by
                        advanced algorithms that work while you sleep.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Feature 1 */}
                    <div className="relative group rounded-2xl border border-slate-200 bg-slate-50 p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-primary/50">
                        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-slate-900/5 group-hover:bg-primary group-hover:text-white transition-colors dark:bg-slate-700 dark:text-blue-400 dark:ring-white/10">
                            <span className="material-symbols-outlined text-[28px]">map</span>
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
                    <div className="relative group rounded-2xl border border-slate-200 bg-slate-50 p-8 transition-all hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-emerald-500/50">
                        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-900/5 group-hover:bg-emerald-600 group-hover:text-white transition-colors dark:bg-slate-700 dark:text-emerald-400 dark:ring-white/10">
                            <span className="material-symbols-outlined text-[28px]">
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
                    <div className="relative group rounded-2xl border border-slate-200 bg-slate-50 p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-primary/50">
                        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-slate-900/5 group-hover:bg-primary group-hover:text-white transition-colors dark:bg-slate-700 dark:text-blue-400 dark:ring-white/10">
                            <span className="material-symbols-outlined text-[28px]">
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
