import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CTAButton from "./CTAButton";
import BlurOrb from "./BlurOrb";
import ScrollReveal from "./ScrollReveal";
import SectionGlow from "./SectionGlow";
import Revolving3DCarousel from "./Revolving3DCarousel";
const rotatingWords = ["budget", "vibe", "area", "date range"];
const painPoints = [{
  title: "Hidden pricing",
  description: "Real pricing is scattered, so you're comparing 'starting at' numbers that don't match reality."
}, {
  title: "Date availability",
  description: "Your perfect date may not be available, so you end up falling in love with places you can't have."
}, {
  title: "Inconsistent info",
  description: "Rules, fees, and requirements aren't consistent, so every venue feels like learning a new language."
}, {
  title: "No alignment",
  description: "There's no single place that aligns your budget, guest count, style, and must-haves."
}];
const ProblemSection = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWordIndex(prev => (prev + 1) % rotatingWords.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return <section className="py-12 md:py-16 lg:py-20 min-h-[100vh] bg-card relative overflow-hidden perspective-container">
      <SectionGlow color="primary" position="top-left" size="md" intensity="subtle" />
      <SectionGlow color="accent" position="bottom-right" size="sm" intensity="subtle" />
      
      <BlurOrb className="-left-20 top-0 w-[250px] h-[250px]" color="primary" />
      <BlurOrb className="-right-20 bottom-0 w-[200px] h-[200px]" color="accent" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
        <ScrollReveal className="text-center space-y-8 mb-16">
          {/* Section Label */}
          <span className="section-label">The Real Problem</span>

          {/* Heading with rotating text */}
          <h2 className="section-title">
            Why is it so hard to find a venue in our{" "}
            <span className={`text-gradient inline-block transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
              {rotatingWords[currentWordIndex]}
            </span>
            ?
          </h2>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            If venue searching feels like guesswork, it's because the info you need is scattered, hidden, or missing altogether.
          </p>
        </ScrollReveal>

        {/* 3D Revolving Cards Carousel */}
        <ScrollReveal className="mb-12">
          <Revolving3DCarousel 
            items={painPoints} 
            autoPlayInterval={3500}
          />
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal className="text-center" delay={0.4}>
          <p className="font-heading font-semibold text-xl text-foreground mb-6">Can we show you how easy it could be?</p>
          <CTAButton scrollTo="pura-chat">
            Get Your Venue Match Now
          </CTAButton>
        </ScrollReveal>
      </div>
    </section>;
};
export default ProblemSection;