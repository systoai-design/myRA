import { motion } from "framer-motion";
import CTAButton from "./CTAButton";
import BlurOrb from "./BlurOrb";
import SectionGlow from "./SectionGlow";
import { Sparkles, ArrowRight } from "lucide-react";
const FinalCTASection = () => {
  return <section className="section-padding relative overflow-hidden perspective-container">
      {/* Dark background */}
      <div className="absolute inset-0 gradient-dark" />
      
      {/* Scroll-triggered glows */}
      <SectionGlow color="primary" position="top-left" size="lg" intensity="medium" />
      <SectionGlow color="accent" position="bottom-right" size="md" intensity="medium" />
      
      {/* Animated blur orbs */}
      <BlurOrb className="top-0 left-1/4 w-[400px] h-[400px] animate-float" color="primary" />
      <BlurOrb className="bottom-0 right-1/4 w-[300px] h-[300px] animate-float-delayed" color="accent" />
      <BlurOrb className="top-1/2 right-0 w-[250px] h-[250px] animate-float-slow" color="peach" />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full mb-6" initial={{
        opacity: 0,
        scale: 0.9
      }} whileInView={{
        opacity: 1,
        scale: 1
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5
      }} whileHover={{
        scale: 1.05
      }}>
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary-foreground">Ready to find your venue?</span>
        </motion.div>
        
        <motion.h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-[1.1]" initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.1,
        duration: 0.6
      }}>
          If you're done guessing and ready to find the venue that fits your wedding,
          <br />
          <span className="text-gradient">start your match now.</span>
        </motion.h2>
        
        <motion.p className="text-base md:text-lg text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed" initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.2,
        duration: 0.6
      }}>
          Answer a few questions with Pura and we'll take it from there.
        </motion.p>
        
        <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.3,
        duration: 0.6
      }}>
          <CTAButton size="xl" scrollTo="pura-chat">
            <Sparkles className="w-5 h-5 mr-2" />
            Start My Venue Match
            <ArrowRight className="w-5 h-5 ml-2" />
          </CTAButton>
        </motion.div>

        <motion.p className="mt-6 text-sm text-white/60" initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.4,
        duration: 0.6
      }}>
          Free shortlist • No pressure • Just clarity for your venue decision
        </motion.p>
      </div>
    </section>;
};
export default FinalCTASection;