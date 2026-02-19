import { motion } from 'framer-motion';

interface GlowLineProps {
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

const GlowLine = ({
  className = '',
  direction = 'horizontal',
}: GlowLineProps) => {
  const isHorizontal = direction === 'horizontal';

  return (
    <div className={`relative ${className}`}>
      {/* Base line */}
      <div
        className={`${isHorizontal ? 'h-1 w-full' : 'w-1 h-full'} bg-gradient-to-r from-primary via-accent to-peach rounded-full opacity-30`}
      />
      
      {/* Animated glow pulse */}
      <motion.div
        className={`absolute ${isHorizontal ? 'h-3 w-24 -top-1' : 'w-3 h-24 -left-1'} bg-gradient-to-r from-primary via-accent to-peach rounded-full blur-sm`}
        animate={isHorizontal ? {
          left: ['0%', '100%', '0%'],
        } : {
          top: ['0%', '100%', '0%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          opacity: 0.6,
        }}
      />
    </div>
  );
};

export default GlowLine;
