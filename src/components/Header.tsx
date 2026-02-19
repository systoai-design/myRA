
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthModal } from "./auth/AuthModal";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <header
        className={`pointer-events-auto transition-all duration-500 ease-in-out transform
          mx-4 w-full max-w-5xl rounded-full border border-white/20 shadow-xl shadow-black/5
          backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 dark:border-white/10
          flex items-center justify-between px-2 py-2 sm:px-3
          animate-in slide-in-from-top-4 fade-in duration-1000
          ${scrolled ? "scale-[0.98] bg-white/80 dark:bg-slate-900/80" : "scale-100"}
        `}
      >
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 pl-3 sm:pl-4 group">
          <div className="relative">
            <img
              src="/logo.png"
              alt="myRA Logo"
              className="h-9 w-9 rounded-full shadow-sm ring-2 ring-white/50 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 rounded-full bg-white/20 group-hover:bg-transparent transition-colors"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-secondary dark:text-white font-serif hidden sm:block">
            myRA
          </span>
        </Link>

        {/* Navigation - Removed as per user request */}
        <div className="flex-1" />

        <div className="flex items-center gap-3 pr-1 sm:pr-0">
          <AuthModal />
        </div>
      </header>
    </div>
  );
};

export default Header;