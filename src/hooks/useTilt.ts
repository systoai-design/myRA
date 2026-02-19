import { useRef, useCallback, useState, useEffect } from 'react';

interface TiltValues {
  rotateX: number;
  rotateY: number;
  scale: number;
}

interface UseTiltOptions {
  maxTilt?: number;
  scale?: number;
  perspective?: number;
  speed?: number;
}

export const useTilt = (options: UseTiltOptions = {}) => {
  const {
    maxTilt = 5,
    scale = 1.02,
    perspective = 1000,
    speed = 400,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [tiltValues, setTiltValues] = useState<TiltValues>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateX = (-mouseY / (rect.height / 2)) * maxTilt;
      const rotateY = (mouseX / (rect.width / 2)) * maxTilt;

      setTiltValues({
        rotateX,
        rotateY,
        scale,
      });
    },
    [maxTilt, scale]
  );

  const handleMouseLeave = useCallback(() => {
    setTiltValues({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
    });
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  const style = {
    transform: `perspective(${perspective}px) rotateX(${tiltValues.rotateX}deg) rotateY(${tiltValues.rotateY}deg) scale(${tiltValues.scale})`,
    transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
    transformStyle: 'preserve-3d' as const,
  };

  return { ref, style, tiltValues };
};
