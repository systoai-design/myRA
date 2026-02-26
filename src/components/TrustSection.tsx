import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const TrustSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    return (
        <section ref={ref} className="py-20 bg-transparent border-b border-white/5 relative z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 gap-12 md:grid-cols-3 text-center"
                >
                    {/* Item 1 */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 p-8 rounded-[2rem] bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:bg-white/10 dark:hover:bg-slate-800/60 hover:border-white/20 transition-all duration-500 shadow-2xl">
                        <div className="rounded-2xl bg-blue-500/10 p-4 text-blue-400 shadow-inner ring-1 ring-blue-500/20">
                            <span className="material-symbols-outlined text-[32px]">psychology</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Planning Logic</h3>
                        <p className="text-base text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                            Built on 15 years of CFP® experience, ensuring every calculation is fiduciary-grade.
                        </p>
                    </motion.div>

                    {/* Item 2 */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 p-8 rounded-[2rem] bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:bg-white/10 dark:hover:bg-slate-800/60 hover:border-white/20 transition-all duration-500 shadow-2xl">
                        <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-400 shadow-inner ring-1 ring-emerald-500/20">
                            <span className="material-symbols-outlined text-[32px]">verified_user</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Unbiased</h3>
                        <p className="text-base text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                            Pure, fiduciary-driven guidance. No hidden fees, no product sales, just math.
                        </p>
                    </motion.div>

                    {/* Item 3 */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 p-8 rounded-[2rem] bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:bg-white/10 dark:hover:bg-slate-800/60 hover:border-white/20 transition-all duration-500 shadow-2xl">
                        <div className="rounded-2xl bg-purple-500/10 p-4 text-purple-400 shadow-inner ring-1 ring-purple-500/20">
                            <span className="material-symbols-outlined text-[32px]">rocket_launch</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Actionable</h3>
                        <p className="text-base text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                            Don't just plan—do. Get concrete steps you can implement today to close your gap.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default TrustSection;
