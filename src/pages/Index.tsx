import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import TrustSection from "@/components/TrustSection";
import InvestorsSection from "@/components/InvestorsSection";
import MissionSection from "@/components/MissionSection";
import FAQSection from "@/components/FAQSection";
import QuickHelp from "@/components/QuickHelp";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showExplainer, setShowExplainer] = useState(false);

  // Removed forced redirect. Logged in users can now view the landing page.

  useEffect(() => {
    // If we just finished the splash screen animation, show the explainer video
    const justFinishedSplash = sessionStorage.getItem('myra-just-finished-splash');
    if (justFinishedSplash === 'true' && !user) {
      sessionStorage.removeItem('myra-just-finished-splash');
      setTimeout(() => setShowExplainer(true), 500); // slight delay after splash fades
    }
  }, [user]);

  // Only block render if auth is actually loading
  if (loading) return null;
  return (
    <div className="min-h-screen w-full bg-white dark:bg-background text-slate-900 dark:text-white antialiased overflow-x-hidden relative">
      <div className="relative z-10 w-full flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Hero />
          <TrustSection />
          <Features />
          <InvestorsSection />
          <MissionSection />
          <FAQSection />
          <QuickHelp />
        </main>
        <Footer />
      </div>

      {/* Explainer Video Overlay */}
      {showExplainer && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-500">
          <div className="relative w-full max-w-5xl aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/20">
            <button
              onClick={() => setShowExplainer(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <video
              src="/myra_transparent.webm"
              className="w-full h-full object-cover"
              controls
              autoPlay
              onEnded={() => setShowExplainer(false)}
            >
              {/* Replace src above with a real explainer video later. Using myra_transparent as placeholder if needed, though usually you'd want a real UI walkthrough here. */}
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
