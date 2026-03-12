const TrustSection = () => {
    return (
        <section className="py-24 bg-white dark:bg-background border-b border-slate-50 dark:border-white/5 relative z-10">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                <h2 className="text-xl font-bold text-slate-400 uppercase tracking-[0.2em] mb-12">
                    Powered by trusted financial partners
                </h2>
                <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder for partner logos */}
                    <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" title="Partner 1" />
                    <div className="h-10 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" title="Partner 2" />
                    <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" title="Partner 3" />
                    <div className="h-10 w-44 bg-slate-200 dark:bg-slate-800 rounded-lg" title="Partner 4" />
                    <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" title="Partner 5" />
                </div>
            </div>
        </section>
    );
};

export default TrustSection;

