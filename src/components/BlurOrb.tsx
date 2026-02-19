interface BlurOrbProps {
  className?: string;
  color?: "primary" | "accent" | "peach";
}

const BlurOrb = ({ className = "", color = "primary" }: BlurOrbProps) => {
  // Using larger blur radius and smoother gradients to prevent visible banding
  const colorStyles = {
    primary: "bg-[radial-gradient(circle,hsl(262_90%_55%/0.35)_0%,hsl(262_90%_55%/0.15)_30%,hsl(262_90%_55%/0.05)_50%,transparent_70%)]",
    accent: "bg-[radial-gradient(circle,hsl(330_80%_60%/0.35)_0%,hsl(330_80%_60%/0.15)_30%,hsl(330_80%_60%/0.05)_50%,transparent_70%)]",
    peach: "bg-[radial-gradient(circle,hsl(20_85%_68%/0.35)_0%,hsl(20_85%_68%/0.15)_30%,hsl(20_85%_68%/0.05)_50%,transparent_70%)]",
  };

  return (
    <div
      className={`absolute pointer-events-none blur-[120px] ${colorStyles[color]} ${className}`}
      style={{ willChange: 'transform' }}
      aria-hidden="true"
    />
  );
};

export default BlurOrb;
