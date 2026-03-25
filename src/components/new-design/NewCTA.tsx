import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const NewCTA = () => {
    return (
        <section className="relative py-48 overflow-hidden bg-[#030508]">
            {/* Massive Origin-style gradient fade originating from the bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-[#030508] to-[#030508]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 mx-auto max-w-4xl px-6 text-center"
            >
                
                <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 text-glow">
                    <span className="italic font-light">Forecast</span> your future.
                </h2>
                
                <p className="text-xl text-white/70 font-sans font-light mb-16 max-w-2xl mx-auto">
                    Take control of your retirement trajectory. Start your free analysis today and see how your money could grow.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <div 
                        onClick={() => window.open('/app', '_blank')}
                        className="animated-border group inline-flex rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                        <div className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#111] px-10 text-base font-semibold text-white transition-colors group-hover:bg-[#1a1a1a]">
                            LAUNCH APP
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                    
                    <button className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 bg-white/5 px-10 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10 hover:border-white/30">
                        LEARN MORE
                    </button>
                </div>
            </motion.div>
            
            {/* Decorative Mockup Horizon line */}
            <motion.div 
                initial={{ opacity: 0 }} whileInView={{ opacity: 0.3 }} viewport={{ once: true }} transition={{ duration: 2 }}
                className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[110%] max-w-7xl h-64 border-t border-white/10 glass-premium rounded-[100%] blur-[1px]" 
            />
        </section>
    );
};

export default NewCTA;
