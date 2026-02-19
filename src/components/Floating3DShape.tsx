import { motion } from 'framer-motion';

interface Floating3DShapeProps {
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'ring';
  className?: string;
  color?: 'primary' | 'accent' | 'peach';
  size?: number;
  delay?: number;
}

const Floating3DShape = ({
  shape,
  className = '',
  color = 'primary',
  size = 24,
  delay = 0,
}: Floating3DShapeProps) => {
  const colorMap = {
    primary: 'hsl(262 90% 55%)',
    accent: 'hsl(330 80% 60%)',
    peach: 'hsl(20 85% 68%)',
  };

  const renderShape = () => {
    switch (shape) {
      case 'circle':
        return (
          <div
            className="rounded-full"
            style={{
              width: size,
              height: size,
              background: `linear-gradient(135deg, ${colorMap[color]} 0%, transparent 80%)`,
              boxShadow: `0 8px 24px -8px ${colorMap[color]}`,
            }}
          />
        );
      case 'square':
        return (
          <div
            className="rounded-lg"
            style={{
              width: size,
              height: size,
              background: `linear-gradient(135deg, ${colorMap[color]} 0%, transparent 80%)`,
              boxShadow: `0 8px 24px -8px ${colorMap[color]}`,
            }}
          />
        );
      case 'triangle':
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${size / 2}px solid transparent`,
              borderRight: `${size / 2}px solid transparent`,
              borderBottom: `${size}px solid ${colorMap[color]}`,
              filter: `drop-shadow(0 8px 16px ${colorMap[color]})`,
            }}
          />
        );
      case 'star':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={colorMap[color]}
            style={{ filter: `drop-shadow(0 4px 12px ${colorMap[color]})` }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      case 'ring':
        return (
          <div
            className="rounded-full"
            style={{
              width: size,
              height: size,
              border: `3px solid ${colorMap[color]}`,
              boxShadow: `0 0 20px ${colorMap[color]}, inset 0 0 10px ${colorMap[color]}`,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.4, 0.7, 0.4],
        scale: 1,
        y: [0, -20, 0],
        rotate: [0, 360],
      }}
      transition={{
        opacity: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        },
        scale: { duration: 0.5, delay },
        y: {
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        },
        rotate: {
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
          delay,
        },
      }}
    >
      {renderShape()}
    </motion.div>
  );
};

export default Floating3DShape;
