import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ScrollProgressProps {
  children: ReactNode;
  className?: string;
  /** Start scale (when element enters viewport) */
  startScale?: number;
  /** End scale (when element is fully visible) */
  endScale?: number;
  /** Whether to fade in */
  fadeIn?: boolean;
  /** Spring config for smooth animations */
  springConfig?: { stiffness: number; damping: number };
}

const ScrollProgress = ({
  children,
  className = '',
  startScale = 0.85,
  endScale = 1,
  fadeIn = true,
  springConfig = { stiffness: 100, damping: 30 },
}: ScrollProgressProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  // Raw transforms
  const rawScale = useTransform(scrollYProgress, [0, 1], [startScale, endScale]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  // Apply spring for smooth, organic feel
  const scale = useSpring(rawScale, springConfig);
  const opacity = useSpring(rawOpacity, springConfig);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        scale,
        ...(fadeIn ? { opacity } : {}),
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollProgress;
