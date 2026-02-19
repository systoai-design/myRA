import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ParallaxLayerProps {
  children: ReactNode;
  /** Speed multiplier: negative = slower (background), positive = faster (foreground) */
  speed?: number;
  className?: string;
  /** Whether to apply opacity fade based on scroll */
  fade?: boolean;
  /** Whether to apply scale based on scroll */
  scaleEffect?: boolean;
}

const ParallaxLayer = ({
  children,
  speed = -0.3,
  className = '',
  fade = false,
  scaleEffect = false,
}: ParallaxLayerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Parallax Y movement
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  // Optional opacity effect
  const opacity = fade
    ? useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
    : undefined;

  // Optional scale effect
  const scale = scaleEffect
    ? useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.9, 1, 1, 0.9])
    : undefined;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        y,
        ...(opacity ? { opacity } : {}),
        ...(scale ? { scale } : {}),
      }}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxLayer;
