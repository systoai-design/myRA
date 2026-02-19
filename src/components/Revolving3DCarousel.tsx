import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, PanInfo } from "framer-motion";

interface CarouselItem {
  title: string;
  description: string;
}

interface Revolving3DCarouselProps {
  items: CarouselItem[];
  autoPlayInterval?: number;
  className?: string;
}

// TiltCard-style hover effect for the active card
const TiltableCard = ({ 
  children, 
  isActive,
  className = "" 
}: { 
  children: React.ReactNode; 
  isActive: boolean;
  className?: string;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), springConfig);

  // Glare opacity for smooth transitions
  const glareOpacity = useSpring(0, { damping: 20, stiffness: 200 });

  // Move useTransform outside of conditional rendering to respect hooks rules
  const glareX = useTransform(x, [-0.5, 0.5], [25, 75]);
  const glareY = useTransform(y, [-0.5, 0.5], [25, 75]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
    glareOpacity.set(1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    glareOpacity.set(0);
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isActive ? rotateX : 0,
        rotateY: isActive ? rotateY : 0,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
      {/* Glare effect - always rendered but uses opacity for smooth transitions */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden"
        style={{
          opacity: isActive ? glareOpacity : 0,
          background: useTransform(
            [glareX, glareY],
            ([xVal, yVal]) => 
              `radial-gradient(circle at ${xVal}% ${yVal}%, hsl(var(--primary) / 0.12) 0%, transparent 60%)`
          ),
        }}
      />
    </motion.div>
  );
};

const Revolving3DCarousel = ({ 
  items, 
  autoPlayInterval = 1000,
  className = "" 
}: Revolving3DCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Motion value for tracking drag without moving content
  const dragX = useMotionValue(0);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isPaused || isDragging) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);
    
    return () => clearInterval(interval);
  }, [isPaused, isDragging, autoPlayInterval, items.length]);

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const normalizedDiff = ((diff % items.length) + items.length) % items.length;
    
    // Calculate position in the carousel (0 = front, 1 = right, 2 = back, 3 = left)
    const positions: Record<number, { rotateY: number; translateZ: number; translateX: number; opacity: number; scale: number; zIndex: number }> = {
      0: { rotateY: 0, translateZ: 150, translateX: 0, opacity: 1, scale: 1, zIndex: 40 },
      1: { rotateY: 45, translateZ: 50, translateX: 200, opacity: 0.7, scale: 0.85, zIndex: 30 },
      2: { rotateY: 0, translateZ: -100, translateX: 0, opacity: 0.4, scale: 0.7, zIndex: 10 },
      3: { rotateY: -45, translateZ: 50, translateX: -200, opacity: 0.7, scale: 0.85, zIndex: 30 },
    };

    return positions[normalizedDiff] || positions[2];
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  // Handle drag/swipe with momentum
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Trigger haptic feedback on mobile
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10); // Short 10ms vibration
    }
  }, []);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    // Reset drag position
    dragX.set(0);
    
    // Use velocity for momentum-based swiping
    const velocityThreshold = 300; // px/s
    const offsetThreshold = 40; // px
    
    // Velocity takes priority for natural momentum feel
    if (info.velocity.x < -velocityThreshold || info.offset.x < -offsetThreshold) {
      triggerHaptic();
      nextSlide();
    } else if (info.velocity.x > velocityThreshold || info.offset.x > offsetThreshold) {
      triggerHaptic();
      prevSlide();
    }
  };

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 3D Carousel Container */}
      <div 
        className="relative h-[280px] md:h-[320px] perspective-container"
        style={{ perspective: "1200px" }}
      >
        {/* Invisible drag layer - doesn't move cards visually */}
        <motion.div
          className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing touch-pan-y"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          style={{ x: dragX }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="sync">
            {items.map((item, index) => {
              const style = getCardStyle(index);
              const isActive = index === activeIndex;
              
              return (
                <motion.div
                  key={index}
                  className="absolute w-[280px] md:w-[340px]"
                  initial={false}
                  animate={{
                    rotateY: style.rotateY,
                    translateZ: style.translateZ,
                    translateX: style.translateX,
                    opacity: style.opacity,
                    scale: style.scale,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    mass: 1,
                  }}
                  style={{
                    zIndex: style.zIndex,
                    transformStyle: "preserve-3d",
                    willChange: "transform, opacity",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <TiltableCard 
                    isActive={isActive}
                    className="relative"
                  >
                    <div 
                      className="p-6 md:p-8 rounded-3xl glass-card-strong transition-all duration-500"
                      style={{
                        boxShadow: isActive 
                          ? '0 25px 50px -12px hsl(var(--accent) / 0.25), 0 0 40px hsl(var(--primary) / 0.15)'
                          : '0 10px 30px -10px hsl(var(--foreground) / 0.1)',
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className={`
                            w-3 h-3 rounded-full mt-2 flex-shrink-0 
                            transition-all duration-500
                            ${isActive ? 'gradient-accent scale-125' : 'bg-muted-foreground/40'}
                          `} 
                        />
                        <div>
                          <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TiltableCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Glow effect behind active card */}
        <div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ perspective: "1200px" }}
        >
          <motion.div
            className="w-[300px] h-[200px] rounded-full blur-3xl opacity-30"
            animate={{
              background: [
                'radial-gradient(ellipse, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
                'radial-gradient(ellipse, hsl(var(--accent) / 0.4) 0%, transparent 70%)',
                'radial-gradient(ellipse, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-3 mt-8">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`
              w-2.5 h-2.5 rounded-full transition-all duration-300
              ${index === activeIndex 
                ? 'gradient-accent w-8' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }
            `}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Reduced motion fallback */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .perspective-container * {
            animation: none !important;
            transition: opacity 0.3s ease !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Revolving3DCarousel;
