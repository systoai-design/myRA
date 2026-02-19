import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
  border?: boolean;
}

const GlassCard = ({
  children,
  className = '',
  blur = 'md',
  border = false,
}: GlassCardProps) => {
  const blurMap = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  };

  return (
    <div
      className={cn(
        'bg-card/70',
        blurMap[blur],
        border && 'border border-border/50',
        'rounded-2xl',
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
