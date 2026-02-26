import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthModal } from "./auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <header
          className={`pointer-events-auto transition-all duration-500 ease-out
            mx-4 w-full max-w-5xl rounded-full border border-slate-200/60 shadow-lg shadow-black/[0.03]
            backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 dark:border-white/10 dark:shadow-black/20
            flex items-center justify-between px-2 py-2 sm:px-3
            animate-in slide-in-from-top-4 fade-in duration-1000
            ${scrolled ? "scale-[0.98] shadow-xl shadow-black/[0.06]" : "scale-100"}
          `}
        >
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 pl-3 sm:pl-4 group">
            <div className="relative">
              <img
                src="/logo.png"
                alt="MyRA Logo"
                className="h-9 w-9 rounded-full shadow-sm ring-2 ring-white/50 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-serif hidden sm:block">
              MyRA
            </span>
          </Link>

          <div className="flex-1" />

          <div className="flex items-center gap-2 pr-1 sm:pr-0">
            {/* Agent Chat */}
            <button
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  document.getElementById('auth-modal-trigger')?.click();
                } else {
                  navigate('/agent-chat');
                }
              }}
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-slate-900/5 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-900/10 dark:text-slate-200 dark:bg-white/10 dark:hover:bg-white/15 transition-all active:scale-[0.97]"
            >
              Agent Chat
            </button>

            <AuthModal />
          </div>
        </header>
      </div>
    </>
  );
};

export default Header;