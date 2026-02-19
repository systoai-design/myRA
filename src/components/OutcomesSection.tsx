import { Clock, Sparkles, Shield } from "lucide-react";
import BlurOrb from "./BlurOrb";
import SectionGlow from "./SectionGlow";
import StaggerReveal from "./StaggerReveal";
import ScrollProgress from "./ScrollProgress";

const outcomes = [
  {
    icon: Clock,
    title: "Less busy",
    description: "Cut the hours of research and wasted tours down to a 30 minute call.",
    gradient: "gradient-accent", // Swapped from primary to accent
  },
  {
    icon: Sparkles,
    title: "Confident",
    description: "Clear direction with your ready-to-tour list of venues that match your vibe.",
    gradient: "gradient-primary", // Swapped from accent to primary
  },
  {
    icon: Shield,
    title: "Secure",
    description: "Realistic all-in pricing before you visit, not after you fall in love.",
    gradient: "bg-gradient-to-br from-peach to-accent",
  },
];

const OutcomesSection = () => {
  return (
    <section className="section-padding bg-card relative overflow-hidden mx-0 my-0 perspective-container">
      <SectionGlow color="primary" position="center" size="lg" intensity="subtle" />
      <BlurOrb className="-right-20 top-1/2 -translate-y-1/2 w-[300px] h-[300px]" color="primary" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <ScrollProgress className="text-center mb-16">
          <StaggerReveal staggerDelay={0.1} className="flex flex-col items-center">
            <span className="section-label text-2xl">🙌😌👌😍</span>
            <h2 className="section-title mb-2">
              Our hopes for your feelings
            </h2>
            <p className="text-xl md:text-2xl text-gradient font-medium">
              after we find your perfect venue
            </p>
          </StaggerReveal>
        </ScrollProgress>

        {/* Outcomes Grid with Stagger */}
        <StaggerReveal staggerDelay={0.15} className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {outcomes.map((outcome) => (
            <div key={outcome.title} className="group text-center p-8 md:p-10 rounded-4xl glass-card-strong transition-all duration-300 hover-lift h-full">
              <div
                className={`w-20 h-20 rounded-3xl ${outcome.gradient} mx-auto mb-8 flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform duration-300`}
              >
                <outcome.icon className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                {outcome.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {outcome.description}
              </p>
            </div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
};

export default OutcomesSection;
