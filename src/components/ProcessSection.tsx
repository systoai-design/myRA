import { MessageCircle, ListChecks, Phone } from "lucide-react";
import { motion } from "framer-motion";
import BlurOrb from "./BlurOrb";
import SectionGlow from "./SectionGlow";
import GlowLine from "./GlowLine";
import Floating3DShape from "./Floating3DShape";
import StaggerReveal from "./StaggerReveal";

const steps = [
  {
    id: "step-1",
    title: "Chat with Pura",
    subtitle: "Answer a few quick questions",
    description: "Your date, guest range, budget, style, and must-haves — Pura gathers what actually matters in minutes.",
    icon: MessageCircle,
    color: "primary",
  },
  {
    id: "step-2",
    title: "Get Your Shortlist",
    subtitle: "We do the heavy lifting",
    description: "Instead of handing you more options, our planners narrow to the 3–5 venues that truly fit. No guessing. No blind tours.",
    icon: ListChecks,
    color: "accent",
  },
  {
    id: "step-3",
    title: "Live Match Call",
    subtitle: "Walk through options together",
    description: "On your Retirement Call, a myRA Planner helps you choose what to focus on first.",
    icon: Phone,
    color: "peach",
  },
];

interface StepCardProps {
  step: typeof steps[0];
  index: number;
}

const StepCard = ({ step, index }: StepCardProps) => {
  const stepNumber = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 40, rotateX: 15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Card */}
      <div className="relative glass-card-strong rounded-4xl p-8 lg:p-10 transition-all duration-300 hover-lift h-full">
        {/* Large Icon Container */}
        <motion.div
          className={`w-20 h-20 rounded-3xl mb-8 flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform duration-300 ${step.color === "primary"
            ? "gradient-primary"
            : step.color === "accent"
              ? "gradient-accent"
              : "bg-gradient-to-br from-peach to-accent"
            }`}
          whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
        >
          <step.icon className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
        </motion.div>

        {/* Step Number Badge */}
        <motion.div
          className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-muted/80 backdrop-blur-sm flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: 10 }}
        >
          <span className="font-heading font-bold text-sm text-muted-foreground">
            {stepNumber}
          </span>
        </motion.div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            {step.subtitle}
          </p>
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            {step.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed text-[15px]">
            {step.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const ProcessSection = () => {
  return (
    <section className="section-padding relative overflow-hidden perspective-container">
      <div className="absolute inset-0 gradient-soft" />
      <SectionGlow color="primary" position="top-left" size="lg" intensity="subtle" />
      <SectionGlow color="peach" position="bottom-right" size="md" intensity="subtle" />

      <BlurOrb className="-left-20 top-1/4 w-[300px] h-[300px]" color="primary" />
      <BlurOrb className="-right-20 bottom-1/4 w-[250px] h-[250px]" color="peach" />

      {/* Floating 3D Shapes */}
      <Floating3DShape shape="star" className="top-[10%] right-[15%]" color="primary" size={12} delay={0} />
      <Floating3DShape shape="circle" className="bottom-[15%] left-[10%]" color="accent" size={10} delay={0.8} />
      <Floating3DShape shape="ring" className="top-[50%] right-[5%]" color="peach" size={14} delay={1.5} />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        {/* Two-column layout for sticky header on desktop */}
        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-16">

          {/* Left Column - Sticky Header (desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <StaggerReveal staggerDelay={0.15}>
                <span className="section-label block">How It Works</span>
                <h2 className="section-title mb-6">
                  Once the noise is removed,
                  <span className="text-gradient block mt-2">the path forward becomes simple.</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  A simple flow that finally makes venue decisions feel doable.
                </p>
              </StaggerReveal>
            </div>
          </div>

          {/* Right Column - Steps */}
          <div>
            {/* Mobile Header (non-sticky) */}
            <div className="lg:hidden text-center mb-16">
              <StaggerReveal staggerDelay={0.12}>
                <span className="section-label block">How It Works</span>
                <h2 className="section-title mb-6">
                  Once the noise is removed,
                  <span className="text-gradient block mt-2">the path forward becomes simple.</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  A simple flow that finally makes venue decisions feel doable.
                </p>
              </StaggerReveal>
            </div>

            {/* Timeline Container */}
            <div className="relative">
              {/* Animated Connection Line - Desktop (vertical now) */}
              <div className="hidden lg:block absolute top-0 left-[60px] bottom-0">
                <GlowLine direction="vertical" />
              </div>

              {/* Steps Grid */}
              <div className="grid grid-cols-1 gap-8 lg:pl-8">
                {steps.map((step, index) => (
                  <StepCard key={step.id} step={step} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
