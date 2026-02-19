import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingIconProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  amplitude?: number;
}

const FloatingIcon = ({
  children,
  className = '',
  delay = 0,
  duration = 6,
  amplitude = 15,
}: FloatingIconProps) => {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -amplitude, 0],
        rotate: [0, 3, -3, 0],
      }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        y: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        },
        rotate: {
          duration: duration * 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        },
      }}
      style={{
        filter: 'drop-shadow(0 8px 16px hsl(262 90% 55% / 0.2))',
      }}
    >
      {children}
    </motion.div>
  );
};

export default FloatingIcon;
