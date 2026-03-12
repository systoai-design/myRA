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

  // Removed forced redirect. Logged in users can now view the landing page.

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
    </div>
  );
};

export default Index;
