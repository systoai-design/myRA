import { useAuth } from "@/contexts/AuthContext";
import NewHeader from "@/components/new-design/NewHeader";
import NewHero from "@/components/new-design/NewHero";
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

  if (loading) return null;

  return (
    <div className="myra-landing min-h-screen w-full overflow-x-hidden relative">
      <div className="relative z-10 w-full flex flex-col min-h-screen">
        <NewHeader />
        <main className="flex-grow">
          <NewHero />
          <NewAppMockup />
          <SavingsCalculator />
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
