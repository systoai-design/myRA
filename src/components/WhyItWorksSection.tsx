import { Users, DollarSign, CheckCircle } from "lucide-react";
import BlurOrb from "./BlurOrb";
import ScrollReveal from "./ScrollReveal";
import SectionGlow from "./SectionGlow";
const reasons = [{
  icon: Users,
  title: "Human-curated",
  text: "Curated by humans who know DMV area venues, supported by smart tools."
}, {
  icon: DollarSign,
  title: "Total budget focus",
  text: "Built around your total budget, not just the venue budget."
}, {
  icon: CheckCircle,
  title: "Real data only",
  text: "Grounded in what's real — no guesses or outdated blogs."
}];
const WhyItWorksSection = () => {
  return <section id="how-it-works" className="section-padding relative overflow-hidden perspective-container">
    <div className="absolute inset-0 gradient-soft opacity-50" />
    <SectionGlow color="peach" position="bottom-left" size="md" intensity="subtle" />
    <BlurOrb className="-left-20 bottom-0 w-[250px] h-[250px]" color="peach" />

    <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
      {/* Section Header */}
      <ScrollReveal className="text-center mb-16">
        <span className="section-label">Why We're Different</span>
        <h2 className="section-title mb-6">
          Most tools show you every venue.
          <br />
          <span className="text-gradient">MyRA does the opposite.</span>
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          We take your full picture — budget, date, guest count, style, must-haves — and filter out everything that doesn't fit. Then our planners layer in real pricing, policies, and availability to build a must-tour list that actually makes sense.
        </p>
      </ScrollReveal>

      {/* Reasons Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {reasons.map((reason, index) => <ScrollReveal key={index} delay={index * 0.15}>
          <div className="group p-8 rounded-3xl glass-card-strong transition-all duration-300 hover-lift h-full">
            <div className="w-14 h-14 rounded-2xl bg-lavender/80 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
              <reason.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-xl text-foreground mb-3">{reason.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{reason.text}</p>
          </div>
        </ScrollReveal>)}
      </div>
    </div>
  </section>;
};
export default WhyItWorksSection;