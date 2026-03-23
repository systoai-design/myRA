import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthModal } from "./auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, role, testRole } = useAuth();
  const navigate = useNavigate();
  const effectiveRole = testRole || role;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 dark:backdrop-blur-md
          flex items-center justify-between px-4 py-3 sm:px-8
          ${scrolled ? "shadow-md" : "shadow-sm"}
        `}
      >
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src="/logo.png"
              alt="MyRA Logo"
              className="h-9 w-9 rounded-full shadow-sm ring-2 ring-slate-100 group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
            MyRA
          </span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          {effectiveRole === "admin" && (
            <button
              onClick={() => navigate('/admin')}
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 px-4 py-2 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all active:scale-[0.97]"
            >
              Admin
            </button>
          )}
          
          <ThemeToggle className="mr-1" />

          <button
            onClick={() => navigate('/new-design')}
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:from-purple-500 hover:to-purple-400 transition-all active:scale-[0.97] shadow-sm"
          >
            New Design
          </button>
          
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
            className="inline-flex items-center justify-center rounded-full bg-slate-900 dark:bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:hover:bg-blue-500 transition-all active:scale-[0.97] shadow-sm border border-transparent dark:border-white/10"
          >
            Agent Chat
          </button>

          <AuthModal />
        </div>
      </header>
    </>
  );
};

export default Header;