import { motion } from 'framer-motion';

interface SectionGlowProps {
  color?: 'primary' | 'accent' | 'peach';
  position?: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right';
  size?: 'sm' | 'md' | 'lg';
  intensity?: 'subtle' | 'medium' | 'strong';
}

const SectionGlow = ({
  color = 'primary',
  position = 'center',
  size = 'md',
  intensity = 'subtle',
}: SectionGlowProps) => {
  const colorMap = {
    primary: 'hsl(var(--primary))',
    accent: 'hsl(var(--accent))',
    peach: 'hsl(var(--peach))',
  };

  const positionMap = {
    'top-left': 'top-0 left-0 -translate-x-1/4 -translate-y-1/4',
    'top-right': 'top-0 right-0 translate-x-1/4 -translate-y-1/4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/4 translate-y-1/4',
    'bottom-right': 'bottom-0 right-0 translate-x-1/4 translate-y-1/4',
  };

  const sizeMap = {
    sm: 'w-[300px] h-[300px]',
    md: 'w-[500px] h-[500px]',
    lg: 'w-[700px] h-[700px]',
  };

  const intensityMap = {
    subtle: 0.1,
    medium: 0.2,
    strong: 0.3,
  };

  return (
    <motion.div
      className={`absolute ${positionMap[position]} ${sizeMap[size]} rounded-full pointer-events-none`}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: intensityMap[intensity], scale: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{
        background: `radial-gradient(circle, ${colorMap[color]} 0%, transparent 70%)`,
        filter: 'blur(80px)',
      }}
    />
  );
};

export default SectionGlow;
