import { useState, forwardRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import CTAButton from "./CTAButton";
import BlurOrb from "./BlurOrb";
import PuraChatShared from "./PuraChatShared";
import ParallaxLayer from "./ParallaxLayer";
import { Drawer, DrawerContent, DrawerClose } from "./ui/drawer";
import { usePuraChatContext } from "@/contexts/PuraChatContext";

const HeroSection = forwardRef<HTMLElement>((_, ref) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { messages, isLoading, isTyping } = usePuraChatContext();
  
  // Stop floating when user interacts with chat (more than initial messages)
  const isUserInteracting = messages.length > 2 || isLoading || isTyping;

  return (
    <>
    <section ref={ref} id="pura-chat" className="relative flex items-start lg:items-center overflow-hidden pt-16 sm:pt-20 pb-8 lg:py-12 bg-background perspective-container h-full min-h-screen">
      {/* Background mesh gradient - covers entire section with noise to prevent banding */}
      <div className="absolute inset-0 gradient-mesh gradient-noise pointer-events-none" />
      <div className="absolute inset-0 gradient-hero pointer-events-none" />
      
      {/* Animated blur orbs - synchronized animation to prevent banding */}
      <ParallaxLayer speed={-0.4} className="absolute inset-0 pointer-events-none">
        <BlurOrb className="absolute top-10 -left-20 w-[300px] h-[300px] opacity-30" color="primary" />
        <BlurOrb className="absolute bottom-10 -right-20 w-[250px] h-[250px] opacity-30" color="accent" />
        <BlurOrb className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-15" color="peach" />
      </ParallaxLayer>

      {/* Content - Two Column Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column - Text & CTA */}
          <motion.div 
            className="text-left preserve-3d"
            initial={{ opacity: 0, y: 40, z: -50 }}
            animate={{ opacity: 1, y: 0, z: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full mb-8"
              initial={{ opacity: 0, scale: 0.9, rotateX: -20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-foreground">2 DMV planners online ready to help</span>
            </motion.div>

            <motion.h1 
              className="font-heading text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold leading-[1.2] mb-8 text-foreground tracking-tight"
              initial={{ opacity: 0, y: 30, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              The hard part isn't finding venues.
              <span className="block mt-3 text-gradient py-2">It's knowing which ones to ignore.</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              We help you filter the noise quickly and surface the few venues worth touring.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <CTAButton size="xl" scrollTo="pura-chat-phone" className="w-full sm:w-auto text-sm sm:text-base">
                <span className="whitespace-nowrap">Chat to find venues worth touring →</span>
              </CTAButton>
            </motion.div>
          </motion.div>

          {/* Right Column - iPad Mockup (hidden on mobile) + Mobile CTA */}
          
          {/* Mobile: Show "Start Chat" button */}
          <motion.div 
            className="lg:hidden flex justify-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-3 px-6 py-4 bg-card border-2 border-primary/30 rounded-2xl shadow-soft hover:shadow-glow hover:border-primary/50 transition-all duration-300"
            >
              <div className="relative">
                <img
                  src="/lovable-uploads/pura-avatar.png"
                  alt="Pura"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                  onError={(e) => {
                    // Fallback to a placeholder if image doesn't load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Chat with Pura</p>
                <p className="text-sm text-muted-foreground">Start your venue match</p>
              </div>
              <MessageCircle className="w-5 h-5 text-primary ml-2" />
            </button>
          </motion.div>

          {/* Desktop: iPad Mockup with Chat + Breathing Animation */}
          <motion.div 
            id="pura-chat-phone" 
            className="hidden lg:flex justify-center lg:justify-end mt-10 lg:mt-0 scroll-mt-24 preserve-3d"
            initial={{ opacity: 0, y: 60, rotateX: 15, z: -100 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, z: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* iPad Frame with Breathing Animation */}
            <motion.div 
              className={`relative w-[352px] sm:w-[420px] lg:w-[462px] animate-float-smooth ${isUserInteracting ? 'paused' : ''}`}
              style={{
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
              }}
            >
              {/* iPad outer shell - light silver color */}
              <div 
                className="relative bg-gradient-to-b from-lavender via-secondary/60 to-muted rounded-[26px] sm:rounded-[30px] p-2.5 sm:p-3 shadow-2xl ring-1 ring-black/5 glass-card-strong"
              >
                {/* Subtle metallic edge effect */}
                <div className="absolute inset-0 rounded-[26px] sm:rounded-[30px] bg-gradient-to-tr from-white/60 via-transparent to-white/40 pointer-events-none" />
                
                {/* iPad inner bezel - light theme */}
                <div className="relative bg-white rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-inner" style={{ isolation: 'isolate' }}>
                  
                  
                  {/* Custom Pura Chat */}
                  <div className="relative h-[440px] sm:h-[530px] lg:h-[572px]">
                    <PuraChatShared className="h-full" />
                  </div>
                </div>
              </div>
              
              {/* Enhanced Ambient glow behind iPad - pulsing with breathing */}
              <motion.div 
                className="absolute -inset-10 sm:-inset-12 bg-gradient-to-r from-primary/15 via-accent/10 to-peach/15 blur-3xl rounded-full -z-10"
                animate={{
                  opacity: [0.15, 0.25, 0.15],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>

        </div>
      </div>

    </section>

    {/* Mobile Chat Drawer */}
    <Drawer open={isChatOpen} onOpenChange={setIsChatOpen}>
      <DrawerContent className="h-[95dvh] max-h-[95dvh]">
        <div className="relative flex flex-col h-full">
          {/* Close button */}
          <DrawerClose className="absolute top-3 right-3 z-50 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </DrawerClose>
          
          {/* Chat fills the drawer */}
          <PuraChatShared className="flex-1" />
        </div>
      </DrawerContent>
    </Drawer>
    </>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
