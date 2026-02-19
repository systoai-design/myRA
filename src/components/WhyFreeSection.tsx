import { Check, Gift } from "lucide-react";
import { motion } from "framer-motion";
import BlurOrb from "./BlurOrb";
import ScrollReveal from "./ScrollReveal";
import SectionGlow from "./SectionGlow";
const benefits = ["No surprise fees or fine print.", "Your shortlist is yours to keep.", "We only recommend venues that genuinely fit your vision."];
const WhyFreeSection = () => {
  return <section className="section-padding relative overflow-hidden perspective-container">
      <div className="absolute inset-0 gradient-soft opacity-50" />
      <SectionGlow color="accent" position="center" size="lg" intensity="subtle" />
      <BlurOrb className="-right-40 top-0 w-[300px] h-[300px]" color="accent" />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6">
        <ScrollReveal className="text-center space-y-6">
          {/* Free Badge */}
          <motion.div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full" whileHover={{
          scale: 1.05
        }} transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}>
            <Gift className="w-5 h-5 text-primary" />
            <span className="font-heading font-semibold text-primary">100% Free</span>
          </motion.div>

          <h2 className="section-title">
            Your shortlist and match call are <span className="text-gradient">free</span>.
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Our job is to give you clarity — what you do with it is entirely up to you.
          </p>

          {/* Benefits */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-8 pt-4">
            {benefits.map((benefit, index) => <motion.div key={index} className="flex items-center gap-3" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1,
            duration: 0.5
          }}>
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-soft">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="text-foreground font-medium text-sm">{benefit}</span>
              </motion.div>)}
          </div>
        </ScrollReveal>
      </div>
    </section>;
};
export default WhyFreeSection;