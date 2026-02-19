import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';

interface UseParallaxScrollOptions {
  /** Speed multiplier: negative = slower than scroll, positive = faster */
  speed?: number;
  /** Scroll range to map from [0, 1] */
  inputRange?: [number, number];
  /** Whether to use window scroll or element scroll */
  target?: 'window' | 'element';
}

interface ParallaxScrollResult {
  ref: React.RefObject<HTMLDivElement>;
  y: MotionValue<number>;
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
}

export const useParallaxScroll = (
  options: UseParallaxScrollOptions = {}
): ParallaxScrollResult => {
  const { speed = 0.3, target = 'element' } = options;

  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll(
    target === 'element' && ref.current
      ? {
          target: ref,
          offset: ['start end', 'end start'],
        }
      : undefined
  );

  // Calculate parallax movement based on speed
  // Speed of 0.3 means element moves at 30% of scroll speed
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  // Opacity: fade in as element enters, fade out as it leaves
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Scale: subtle scale effect
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  return { ref, y, opacity, scale, scrollYProgress };
};

export default useParallaxScroll;
