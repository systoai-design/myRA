import { motion } from 'framer-motion';

interface LightRayProps {
  className?: string;
  angle?: number;
  color?: 'primary' | 'accent' | 'peach';
  delay?: number;
}

const LightRay = ({
  className = '',
  angle = -45,
  color = 'primary',
  delay = 0,
}: LightRayProps) => {
  const colorMap = {
    primary: 'hsl(262 90% 55%)',
    accent: 'hsl(330 80% 60%)',
    peach: 'hsl(20 85% 68%)',
  };

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 1 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${angle}deg, ${colorMap[color]} 0%, transparent 60%)`,
          filter: 'blur(60px)',
          transform: `rotate(${angle}deg)`,
          willChange: 'transform, opacity',
        }}
        animate={{
          opacity: [0.08, 0.15, 0.08],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          // All rays sync to the same animation cycle regardless of delay
          delay: 0,
        }}
      />
    </motion.div>
  );
};

export default LightRay;
