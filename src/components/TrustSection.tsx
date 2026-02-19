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
        <section ref={ref} className="py-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 gap-12 md:grid-cols-3 text-center"
                >
                    {/* Item 1 */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-300">
                        <div className="rounded-full bg-blue-100 p-4 text-primary dark:bg-blue-900/20 shadow-sm">
                            <span className="material-symbols-outlined text-[32px]">psychology</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Planning Logic</h3>
                        <p className="text-base text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                            Built on 15 years of CFP® experience, ensuring every calculation is fiduciary-grade.
                        </p>
                    </motion.div>

                    {/* Item 2 */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 p-6 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors duration-300">
                        <div className="rounded-full bg-emerald-100 p-4 text-emerald-600 dark:bg-emerald-900/20 shadow-sm">
                            <span className="material-symbols-outlined text-[32px]">verified_user</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Unbiased</h3>
                        <p className="text-base text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                            Pure, fiduciary-driven guidance. No hidden fees, no product sales, just math.
                        </p>
                    </motion.div>

                    {/* Item 3 */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 p-6 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors duration-300">
                        <div className="rounded-full bg-purple-100 p-4 text-purple-600 dark:bg-purple-900/20 shadow-sm">
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
