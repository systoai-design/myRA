import { motion } from 'framer-motion';

interface MorphingBlobProps {
  className?: string;
  color?: 'primary' | 'accent' | 'peach';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const MorphingBlob = ({
  className = '',
  color = 'primary',
  size = 'lg',
}: MorphingBlobProps) => {
  const colorMap = {
    primary: 'hsl(262 90% 55%)',
    accent: 'hsl(330 80% 60%)',
    peach: 'hsl(20 85% 68%)',
  };

  const sizeMap = {
    sm: 300,
    md: 500,
    lg: 700,
    xl: 900,
  };

  const blobSize = sizeMap[size];

  // Define morph paths for smooth blob animation
  const paths = [
    'M44.7,-52.3C57.1,-41.8,65.5,-26.4,68.3,-9.7C71.2,7,68.5,25.1,59.1,38.4C49.7,51.7,33.7,60.2,16.4,64.2C-0.9,68.3,-19.5,67.8,-35.6,60.4C-51.7,53,-65.3,38.6,-70.6,21.6C-75.9,4.6,-72.9,-15,-63.7,-29.9C-54.5,-44.8,-39.1,-55,-23.4,-60.1C-7.7,-65.2,8.3,-65.2,22.8,-60.6C37.3,-56,52.3,-46.8,44.7,-52.3Z',
    'M41.3,-49.1C52.9,-39.5,61.4,-26.3,65.1,-11.2C68.8,3.9,67.7,20.9,59.7,33.8C51.7,46.7,36.8,55.5,20.8,60.1C4.8,64.7,-12.3,65.1,-27.2,59.5C-42.1,53.9,-54.8,42.2,-62.3,27.6C-69.8,13,-72.1,-4.5,-67.2,-19.8C-62.3,-35.1,-50.2,-48.2,-36.5,-57.2C-22.8,-66.2,-7.4,-71.1,5.5,-67.8C18.4,-64.5,29.7,-58.7,41.3,-49.1Z',
    'M38.9,-46.1C49.6,-37.4,56.8,-24.3,60.2,-9.8C63.6,4.7,63.2,20.6,55.9,32.7C48.6,44.8,34.4,53.1,19.1,57.7C3.8,62.3,-12.6,63.2,-26.8,57.8C-41,52.4,-53,40.7,-59.8,26.3C-66.6,11.9,-68.2,-5.2,-63.2,-19.8C-58.2,-34.4,-46.6,-46.5,-33.7,-54.5C-20.8,-62.5,-6.6,-66.4,5.8,-63.2C18.2,-60,28.2,-54.8,38.9,-46.1Z',
  ];

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: blobSize,
        height: blobSize,
        filter: 'blur(80px)',
        opacity: 0.4,
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.4 }}
      transition={{ duration: 1 }}
    >
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <motion.stop
              offset="0%"
              animate={{
                stopColor: [colorMap[color], colorMap.accent, colorMap[color]],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.stop
              offset="100%"
              animate={{
                stopColor: [colorMap.accent, colorMap[color], colorMap.accent],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </linearGradient>
        </defs>
        <motion.path
          fill={`url(#gradient-${color})`}
          transform="translate(100 100)"
          animate={{
            d: paths,
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </motion.div>
  );
};

export default MorphingBlob;
