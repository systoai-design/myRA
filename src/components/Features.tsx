import { useEffect, useState } from "react";

const Features = () => {
    const [count, setCount] = useState(0); // Start at 0 for full effect
    const targetCount = 3289604;

    useEffect(() => {
        let startTimestamp: number | null = null;
        const duration = 2500; // 2.5 seconds

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutExpo for smooth deceleration
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            setCount(Math.floor(easeProgress * targetCount));

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, []);
    return (
        <section className="bg-white dark:bg-background py-24 relative z-10 w-full overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

                {/* Metric Card (Layla Style) */}
                <div className="mb-24 relative overflow-hidden rounded-[2.5rem] p-12 glass dark:glass-dark">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="max-w-md text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                                Your plan in minutes, not weeks.
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                                Professional fiduciary guidance tailored to your specific family needs, generated instantly.
                            </p>
                            <button className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all">
                                Try it now
                            </button>
                        </div>
                        <div className="text-center md:text-right">
                            <div className="text-6xl md:text-8xl font-bold text-blue-600 dark:text-blue-400 mb-2 truncate">
                                {count.toLocaleString()}
                            </div>
                            <div className="text-lg text-slate-500 font-bold uppercase tracking-widest text-center md:text-right"> CLIENTS SERVED</div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                        AI vs. Human Advisor. <br />
                        <span className="text-slate-400">The clear choice.</span>
                    </h2>
                </div>

                {/* 4 Feature Cards */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-16">
                    {/* Feature 1 */}
                    <div className="relative group rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-1 glass dark:glass-dark">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined text-[28px]">schedule</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                            Open 24/7
                        </h3>
                        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                            No PTO, no sick days, and strictly no golf trips. MyRA is always on the clock.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="relative group rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-1 glass dark:glass-dark">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined text-[28px]">savings</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                            Low Overhead
                        </h3>
                        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                            We don't need to fund vacation homes or Rolexes, which means far lower fees for you.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="relative group rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-1 glass dark:glass-dark">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined text-[28px]">balance</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                            No Conflicts of Interest
                        </h3>
                        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                            Absolute fiduciary duty. No sales quotas or favorite products, just objective guidance.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="relative group rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-1 glass dark:glass-dark">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined text-[28px]">psychology</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                            MyRA Knows
                        </h3>
                        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                            Armed with a perfect memory and 15 years of logic. MyRA never guesses or forgets a detail.
                        </p>
                    </div>
                </div>

                {/* Complete Confidentiality Block */}
                <div className="mx-auto max-w-4xl rounded-[2rem] p-8 sm:p-12 text-center relative overflow-hidden group glass dark:glass-dark">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                    <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900/5 dark:bg-white/10 text-slate-900 dark:text-white backdrop-blur-sm mx-auto shadow-inner border border-slate-900/10 dark:border-white/10 group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-4xl">lock</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Complete Confidentiality</h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Your privacy is our highest priority. All conversations and shared financial files are secured with <span className="text-slate-900 dark:text-white font-semibold">bank-level encryption</span>, ensuring your data remains completely private and protected at all times.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Features;
