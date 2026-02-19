import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import TrustSection from "@/components/TrustSection";

const Index = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased overflow-x-hidden">
      <Header />
      <main className="flex-grow">
        <Hero />
        <TrustSection />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;