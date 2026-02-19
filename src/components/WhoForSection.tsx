import { Check, X, Star } from "lucide-react";
import { motion } from "framer-motion";
import BlurOrb from "./BlurOrb";
import ScrollReveal from "./ScrollReveal";
import TiltCard from "./TiltCard";
import SectionGlow from "./SectionGlow";

const forYou = [
  "You're planning a DC-area wedding.",
  "You have at least a $12,000 wedding budget.",
  "You want a shortlist that reflects your real budget and must-haves.",
  "You're done with guessing, scrolling, and blind tours.",
];

const notForYou = [
  "You're still deciding whether you want a real wedding.",
  "You're looking outside DMV and surrounding areas.",
  "You prefer to research everything manually.",
];

const WhoForSection = () => {
  return (
    <section className="section-padding bg-card relative overflow-hidden perspective-container py-[50px]">
      <SectionGlow color="primary" position="top-right" size="md" intensity="subtle" />
      <BlurOrb className="-right-40 top-0 w-[350px] h-[350px]" color="primary" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-8">
          <span className="section-label">Is This For You?</span>
          <h2 className="section-title mb-4">
            myRA makes sense out of chaos
          </h2>
          <p className="text-xl text-muted-foreground">especially when...</p>
        </ScrollReveal>

        {/* 5-Star Social Proof */}
        <ScrollReveal delay={0.1} className="mb-12">
          <motion.div
            className="flex flex-col items-center gap-3 py-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {/* Stars */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
                >
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </motion.div>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-center max-w-lg">
              <p className="text-lg md:text-xl text-foreground italic font-medium">
                "I had a vision but no direction. The myRA planners gave me that and more."
              </p>
              <cite className="text-sm text-muted-foreground mt-2 block not-italic">
                — Past Bride
              </cite>
            </blockquote>
          </motion.div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8">
          {/* For You - Colorful Gradient Card (Magic) */}
          <ScrollReveal>
            <TiltCard className="h-full" maxTilt={5} scale={1.02}>
              <div className="relative rounded-4xl p-8 md:p-10 h-full overflow-hidden hover-lift">
                {/* Vibrant gradient background - magic and focus */}
                <div className="absolute inset-0 gradient-primary opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />

                {/* Animated glow overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'easeInOut',
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-white">Especially when:</h3>
                  </div>
                  <ul className="space-y-5">
                    {forYou.map((item, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white/95 leading-relaxed font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TiltCard>
          </ScrollReveal>

          {/* Not For You - Grey Card (No Magic) */}
          <ScrollReveal delay={0.15}>
            <TiltCard className="h-full" maxTilt={5} scale={1.02}>
              <div className="relative rounded-4xl p-8 md:p-10 h-full bg-muted/60 border border-border/30 hover-lift">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-muted-foreground/10 flex items-center justify-center">
                    <X className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-muted-foreground">Maybe not if:</h3>
                </div>
                <ul className="space-y-5">
                  {notForYou.map((item, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-muted-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-4 h-4 text-muted-foreground/70" />
                      </div>
                      <span className="text-muted-foreground leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TiltCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default WhoForSection;
