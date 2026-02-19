import { Play, Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import BlurOrb from "./BlurOrb";
import ScrollReveal from "./ScrollReveal";
import SectionGlow from "./SectionGlow";
import StaggerReveal from "./StaggerReveal";
const testimonials = [{
  quote: "We finally understood which venues made sense for our budget. The call saved us weeks of guessing.",
  name: "Jessica & Mark",
  location: "Alexandria, VA",
  rating: 5
}, {
  quote: "Our shortlist was spot on. We toured two places and booked one — no stress, no second-guessing.",
  name: "Sarah & David",
  location: "Bethesda, MD",
  rating: 5
}, {
  quote: "I went from 50 open tabs to 3 perfect venues in one call. Life-changing.",
  name: "Emily & James",
  location: "Washington, DC",
  rating: 5
}];
const TestimonialsSection = () => {
  return <section className="section-padding relative overflow-hidden perspective-container">
      <div className="absolute inset-0 gradient-soft opacity-50" />
      <SectionGlow color="accent" position="top-right" size="lg" intensity="subtle" />
      <SectionGlow color="primary" position="bottom-left" size="md" intensity="subtle" />
      
      <BlurOrb className="-right-40 top-1/2 -translate-y-1/2 w-[350px] h-[350px]" color="accent" />
      <BlurOrb className="-left-40 bottom-0 w-[250px] h-[250px]" color="primary" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-10">
          <span className="section-label">Real Couples, Real Results</span>
          <h2 className="section-title mb-4">
            What Couples Say
            <br />
            <span className="text-gradient">After Their Match</span>
          </h2>
        </ScrollReveal>

        {/* Featured Quote */}
        <ScrollReveal>
          <div className="max-w-4xl mx-auto mb-10">
            <div className="relative p-8 md:p-10 glass-card-strong bg-card/70 backdrop-blur-md shadow-lg rounded-[30px]">
              <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/20" />
              <blockquote className="relative z-10 text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground leading-snug text-center">
                "We went from 50 open tabs to 3 perfect venues in one call. Life-changing."
              </blockquote>
              <footer className="mt-6 flex flex-col items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-peach fill-peach" />)}
                </div>
                <p className="text-muted-foreground text-sm">— Emily & James, Washington DC</p>
              </footer>
            </div>
          </div>
        </ScrollReveal>

        {/* Testimonial Cards Grid with Stagger */}
        <StaggerReveal staggerDelay={0.15} className="grid md:grid-cols-3 gap-5">
          {testimonials.map((testimonial, index) => (
              <div key={index} className="group relative glass-card-strong rounded-2xl overflow-hidden transition-all duration-300 hover-lift h-full">
                {/* Video Placeholder - 9:16 aspect ratio */}
                <div className="aspect-[9/16] bg-gradient-to-br from-lavender via-secondary to-muted flex items-center justify-center relative overflow-hidden">
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/20 blur-2xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-accent/20 blur-2xl" />
                  </div>
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow cursor-pointer" whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.95
                }} transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}>
                      <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                    </motion.div>
                  </div>
                  
                  {/* Coming soon badge */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-card/90 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                      <p className="text-xs font-medium text-muted-foreground">Video coming soon</p>
                    </div>
                  </div>
                </div>

                {/* Quote section */}
                <div className="p-5">
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-peach fill-peach" />)}
                  </div>
                  <p className="text-foreground text-sm leading-relaxed mb-3">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-semibold text-foreground text-sm">{testimonial.name}</span>
                    <span className="text-xs text-muted-foreground">{testimonial.location}</span>
                  </div>
                </div>
              </div>
            ))}
        </StaggerReveal>

        {/* Stats */}
        <ScrollReveal delay={0.3}>
          <div className="mt-10 flex flex-wrap justify-center gap-6 md:gap-12">
            {[{
            value: "200+",
            label: "Couples Matched"
          }, {
            value: "4.9",
            label: "Average Rating"
          }, {
            value: "30min",
            label: "Average Call Time"
          }].map((stat, index) => <motion.div key={stat.label} className="text-center" initial={{
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
                <p className="font-heading text-3xl md:text-4xl font-bold text-gradient">{stat.value}</p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </motion.div>)}
          </div>
        </ScrollReveal>
      </div>
    </section>;
};
export default TestimonialsSection;