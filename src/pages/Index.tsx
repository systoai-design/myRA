import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import TrustSection from "@/components/TrustSection";

import Scene from "@/components/canvas/Scene";

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased overflow-x-hidden relative">
      <div className="dark block hidden z-0">
        {/* We enforce dark mode on Scene elements to look premium */}
        <Scene />
      </div>
      <div className="relative z-10 w-full flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Hero />
          <TrustSection />
          <Features />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;