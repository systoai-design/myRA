import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import puraAvatar from "@/assets/pura-avatar.png";
import PuraChatShared from "./PuraChatShared";

interface FloatingPuraBubbleProps {
  heroRef: React.RefObject<HTMLElement>;
}

export default function FloatingPuraBubble({ heroRef }: FloatingPuraBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hasShownTooltip = useRef(false);

  // Detect when user scrolls past the hero section
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      
      const heroRect = heroRef.current.getBoundingClientRect();
      const heroBottom = heroRect.bottom;
      
      // Show bubble when hero is scrolled past (with some buffer)
      const shouldShow = heroBottom < 100;
      setIsVisible(shouldShow);
      
      // Show tooltip once when bubble first appears
      if (shouldShow && !hasShownTooltip.current) {
        hasShownTooltip.current = true;
        setShowTooltip(true);
        // Hide tooltip after 4 seconds
        setTimeout(() => setShowTooltip(false), 4000);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroRef]);

  // Hide tooltip when bubble is expanded
  useEffect(() => {
    if (isExpanded) {
      setShowTooltip(false);
    }
  }, [isExpanded]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              // Expanded Chat Window
              <motion.div
                key="chat-window"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-[420px] h-[580px] bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
              >
                {/* Close button */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-3 right-3 z-50 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
                
                {/* Chat component */}
                <PuraChatShared className="h-full" />
              </motion.div>
            ) : (
              // Collapsed Bubble
              <motion.div
                key="bubble"
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 50 }}
                transition={{ type: "spring", damping: 20, stiffness: 300, bounce: 0.4 }}
                className="relative"
              >
                {/* Tooltip */}
                <AnimatePresence>
                  {showTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-full right-0 mb-3 whitespace-nowrap"
                    >
                      <div className="relative bg-card px-4 py-2.5 rounded-xl shadow-lg border border-border">
                        <p className="text-sm font-medium text-foreground">I can help you here too! 💬</p>
                        {/* Arrow pointing down */}
                        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r border-b border-border rotate-45" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bubble button */}
                <motion.button
                  onClick={() => setIsExpanded(true)}
                  className="relative w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Pulsing glow ring - using border instead of background to prevent gray circle */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/50"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ willChange: "transform, opacity" }}
                  />
                  
                  {/* Avatar */}
                  <img
                    src={puraAvatar}
                    alt="Chat with Pura"
                    className="w-full h-full rounded-full object-cover ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                  />
                  
                  {/* Online indicator */}
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                  
                  {/* Message icon badge */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <MessageCircle className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
