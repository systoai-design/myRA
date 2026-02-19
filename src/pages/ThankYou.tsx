import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Check, Calendar, ArrowRight, Home } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const booked = searchParams.get("booked") === "true";
  const slot = searchParams.get("slot");
  const calendar = searchParams.get("calendar") === "true";

  // Fire Facebook Pixel Lead event on page load
  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Lead");
      console.log("Facebook Pixel: Lead event fired");
    }
  }, []);

  const getContent = () => {
    if (booked && slot) {
      return {
        icon: <Check className="w-16 h-16 text-primary" />,
        headline: "You're All Set!",
        subheadline: `Your Retirement Strategy Session is booked for ${decodeURIComponent(slot)}`,
        description: "Check your email for the calendar invite and meeting details.",
      };
    }

    if (calendar) {
      return {
        icon: <Calendar className="w-16 h-16 text-primary" />,
        headline: "One More Step!",
        subheadline: "Pick a time that works best for you",
        description: "Click below to view all available times and book your free Retirement Strategy Session.",
        showCalendarButton: true,
      };
    }

    return {
      icon: <Check className="w-16 h-16 text-primary" />,
      headline: "Thanks for Sharing!",
      subheadline: "We've got your retirement preferences",
      description: "Our team will be in touch soon to schedule your free Retirement Strategy Session.",
      showBookNowButton: true,
    };
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="w-[400px] h-[400px] absolute left-[20%] top-[30%] opacity-20 rounded-full bg-primary blur-[120px]" />
        <div className="w-[350px] h-[350px] absolute right-[20%] top-[60%] opacity-15 rounded-full bg-accent blur-[120px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6 inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20"
          >
            {content.icon}
          </motion.div>

          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            {content.headline}
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            {content.subheadline}
          </p>

          <p className="text-base text-muted-foreground mb-8">
            {content.description}
          </p>

          <div className="w-16 h-1 bg-primary/30 mx-auto mb-8 rounded-full" />

          {/* What Happens Next */}
          <div className="text-left bg-card/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-border">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4 text-center">
              What Happens Next
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center">
                  1
                </span>
                <span className="text-muted-foreground">
                  Check your email for confirmation and meeting details
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center">
                  2
                </span>
                <span className="text-muted-foreground">
                  We'll review your retirement goals and prepare your personalized plan
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center">
                  3
                </span>
                <span className="text-muted-foreground">
                  On your call, we'll walk through your income gap strategy
                </span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {content.showCalendarButton && (
              <a
                href="https://myra.ai/meet-your-planner"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                View All Time Slots
                <ArrowRight className="w-4 h-4" />
              </a>
            )}

            {content.showBookNowButton && (
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Book Now Instead
                <ArrowRight className="w-4 h-4" />
              </a>
            )}

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-full font-medium hover:bg-primary/10 transition-colors"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
