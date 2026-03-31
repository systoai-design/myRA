import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import NewHeader from "@/components/new-design/NewHeader";
import NewHero from "@/components/new-design/NewHero";
import HeroVideo from "@/components/new-design/HeroVideo";
import SavingsCalculator from "@/components/new-design/SavingsCalculator";
import NewAppMockup from "@/components/new-design/NewAppMockup";
import NewMobileApp from "@/components/new-design/NewMobileApp";
import NewFeatures from "@/components/new-design/NewFeatures";
import NewTeam from "@/components/new-design/NewTeam";
import NewFAQ from "@/components/new-design/NewFAQ";
import NewCTA from "@/components/new-design/NewCTA";
import NewFooter from "@/components/new-design/NewFooter";

const Index = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  // Only block render if auth is actually loading
  if (loading) return null;

  return (
    <div className="min-h-screen w-full bg-background text-foreground antialiased overflow-x-hidden relative">
      <div className="relative z-10 w-full flex flex-col min-h-screen">
        <NewHeader />
        <main className="flex-grow">
          <NewHero />
          <HeroVideo />
          <SavingsCalculator />
          <NewAppMockup />
          <NewMobileApp />
          <NewFeatures />
          <NewTeam />
          <NewFAQ />
          <NewCTA />
        </main>
        <NewFooter />
      </div>
    </div>
  );
};

export default Index;
