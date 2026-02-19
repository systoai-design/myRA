import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import BlurOrb from "./BlurOrb";
import SectionGlow from "./SectionGlow";
import StaggerReveal from "./StaggerReveal";
import ScrollProgress from "./ScrollProgress";
const faqs = [{
  question: "Is this really free?",
  answer: "Yes. The shortlist and match call are free. We're confident that if you like how clear this part feels, you'll want us to keep helping."
}, {
  question: "Are you just a directory?",
  answer: "No. We don't list every venue. We focus on matching you to venues that fit your details instead of handing you another giant list."
}, {
  question: "What happens on the call?",
  answer: "A planner walks through your vision, shares 3–5 venues that fit, and helps you decide what to tour first."
}, {
  question: "Do I have to book one of the venues you show me?",
  answer: "No. The goal is clarity. You're free to move forward however you want."
}, {
  question: "How long does this take?",
  answer: "The chat takes a few minutes. Your match call is usually 30 minutes, scheduled when it works for you."
}];
const FAQSection = () => {
  return <section id="faq" className="section-padding bg-card relative overflow-hidden perspective-container py-[50px]">
      <SectionGlow color="peach" position="center" size="lg" intensity="subtle" />
      <BlurOrb className="-left-40 top-1/2 -translate-y-1/2 w-[350px] h-[350px]" color="peach" />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6">
        {/* Section Header */}
        <ScrollProgress className="text-center mb-16">
          <StaggerReveal staggerDelay={0.1} className="flex flex-col items-center">
            <span className="section-label">FAQ</span>
            <h2 className="section-title">
              A few things couples
              <br />
              <span className="text-gradient">usually ask at this point</span>
            </h2>
          </StaggerReveal>
        </ScrollProgress>

        {/* FAQ Accordion - Single wrapper for all items */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`} 
              className="glass-card-strong rounded-2xl px-6 overflow-hidden transition-colors"
            >
              <AccordionTrigger className="text-left font-heading font-semibold text-lg text-foreground hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed text-[15px]">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>;
};
export default FAQSection;