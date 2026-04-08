import { motion } from "framer-motion";
import { Play } from "lucide-react";

const HeroVideo = () => {
    return (
        <section className="relative py-16 lg:py-24 bg-background overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative aspect-video rounded-3xl overflow-hidden glass-card group cursor-pointer"
                >
                    {/* Placeholder gradient background — replace with actual video */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950" />
                    
                    {/* Subtle animated shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-500 shadow-2xl gradient-ring">
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </div>
                        <p className="text-white/60 text-sm font-sans font-medium mt-6 tracking-wide">Watch the myra story</p>
                    </div>

                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-5" />
                </motion.div>
            </div>
        </section>
    );
};

export default HeroVideo;
