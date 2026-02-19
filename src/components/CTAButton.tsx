import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { openGhlChat } from "@/lib/ghlChat";

interface CTAButtonProps {
  children: React.ReactNode;
  href?: string;
  size?: "default" | "lg" | "xl";
  className?: string;
  external?: boolean;
  scrollTo?: string;
  openChat?: boolean;
}

const CTAButton = ({ children, href = "/", size = "lg", className = "", external = false, scrollTo, openChat = false }: CTAButtonProps) => {
  const sizeClasses = {
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };

  const buttonClasses = `gradient-primary text-primary-foreground font-semibold rounded-full shadow-soft transition-all duration-300 ${sizeClasses[size]} ${className}`;

  const MotionButton = motion(Button);

  // For openChat or scrollTo, render a single button (no nesting)
  if (openChat) {
    return (
      <MotionButton
        type="button"
        className={buttonClasses}
        onClick={() => openGhlChat()}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 0 30px hsl(262 90% 55% / 0.4)"
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {children}
      </MotionButton>
    );
  }

  if (scrollTo) {
    return (
      <MotionButton
        type="button"
        className={buttonClasses}
        onClick={() => {
          const element = document.getElementById(scrollTo);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
          // Open the GHL chat widget with retry logic
          const tryOpen = (attempts = 0) => {
            if (attempts > 5) return;
            setTimeout(() => {
              openGhlChat();
              // Retry if widget not ready
              if (!window.leadConnector?.chatWidget?.open && !window.LC_API?.open_chat_window) {
                tryOpen(attempts + 1);
              }
            }, 400 + attempts * 300);
          };
          tryOpen();
        }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 0 30px hsl(262 90% 55% / 0.4)"
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {children}
      </MotionButton>
    );
  }

  // For links, use Button with asChild
  if (external) {
    return (
      <Button asChild className={buttonClasses}>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      </Button>
    );
  }

  // For regular internal links, wrap with motion
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="inline-block hover-glow rounded-full"
    >
      <Button asChild className={buttonClasses}>
        <Link to={href}>
          {children}
        </Link>
      </Button>
    </motion.div>
  );
};

export default CTAButton;
