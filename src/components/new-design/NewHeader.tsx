import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    Menu, X, ShieldAlert, LogOut, User, Settings, 
    BookOpen, TrendingUp, Shield, DollarSign, BarChart3,
    ChevronRight, Info, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MENU_ITEMS, MegaMenuPanel } from "./MegaMenuContent";

const menuIcons: Record<string, React.ElementType> = {
    "myra-story": BookOpen,
    "financial-planning": TrendingUp,
    "retirement-planning": Shield,
    "tax-planning": DollarSign,
    "invest-with-myra": BarChart3,
};

export const NewHeader = () => {
    const navigate = useNavigate();
    const { user, role, testRole, signOut } = useAuth();
    const effectiveRole = testRole || role;

    const [mainMenuOpen, setMainMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [activePanelId, setActivePanelId] = useState<string | null>(null);

    const mainMenuRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const handleSignOut = async () => {
        await signOut();
        setUserMenuOpen(false);
        toast.success("Signed out successfully");
    };

    // Close menus on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (mainMenuRef.current && !mainMenuRef.current.contains(e.target as Node)) {
                setMainMenuOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Close menus on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMainMenuOpen(false);
                setUserMenuOpen(false);
                setActivePanelId(null);
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    const activePanel = MENU_ITEMS.find(m => m.id === activePanelId);

    return (
        <>
            {/* Header Bar */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
                <header className="glass-panel rounded-full px-4 sm:px-6 py-3 flex items-center justify-between">
                    
                    {/* Left: Logo + Hamburger */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Hamburger */}
                        <div ref={mainMenuRef} className="relative">
                            <button
                                onClick={() => {
                                    setMainMenuOpen(!mainMenuOpen);
                                    setUserMenuOpen(false);
                                }}
                                className="w-9 h-9 rounded-full bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/20 flex items-center justify-center hover:bg-black/[0.06] dark:hover:bg-white/10 transition-colors"
                                aria-label="Main menu"
                            >
                                <AnimatePresence mode="wait">
                                    {mainMenuOpen ? (
                                        <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                            <X className="w-4 h-4 text-foreground" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                            <Menu className="w-4 h-4 text-foreground" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>

                            {/* Main Menu Dropdown */}
                            <AnimatePresence>
                                {mainMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-12 left-0 w-72 bg-background/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden"
                                    >
                                        <div className="py-2">
                                            {MENU_ITEMS.map((item, idx) => {
                                                const Icon = menuIcons[item.id] || BookOpen;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => {
                                                            setActivePanelId(item.id);
                                                            setMainMenuOpen(false);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-foreground/5 transition-colors group"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                            <Icon className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-sm font-medium text-foreground block">
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-foreground/60 transition-colors shrink-0" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center bg-black/[0.03] dark:bg-white/5 group-hover:bg-black/[0.06] dark:group-hover:bg-white/10 transition-colors">
                                <span className="text-foreground font-serif font-bold text-xs tracking-wider">M.</span>
                            </div>
                            <span className="text-xl font-serif text-foreground tracking-tight hidden sm:inline">
                                myra
                            </span>
                        </Link>
                    </div>

                    {/* Right: Theme + Admin + User Avatar */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <ThemeToggle />

                        {effectiveRole === "admin" && (
                            <button
                                onClick={() => navigate("/admin")}
                                className="h-9 px-4 rounded-full bg-black/[0.04] dark:bg-white/10 border border-black/[0.06] dark:border-white/10 text-foreground text-xs font-semibold hover:bg-black/[0.08] dark:hover:bg-white/20 transition-colors hidden sm:flex items-center gap-1.5"
                            >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Admin
                            </button>
                        )}

                        {/* User Avatar Menu */}
                        <div ref={userMenuRef} className="relative">
                            <button
                                onClick={() => {
                                    setUserMenuOpen(!userMenuOpen);
                                    setMainMenuOpen(false);
                                }}
                                className="w-9 h-9 rounded-full bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/20 flex items-center justify-center hover:bg-black/[0.06] dark:hover:bg-white/10 transition-colors"
                                aria-label="User menu"
                            >
                                <User className="w-4 h-4 text-foreground" />
                            </button>

                            {/* User Dropdown */}
                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-12 right-0 w-56 bg-background/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden"
                                    >
                                        <div className="py-2">
                                            {!user ? (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setUserMenuOpen(false);
                                                            document.getElementById('auth-modal-trigger')?.click();
                                                        }}
                                                        className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-foreground/5 transition-colors text-sm text-foreground"
                                                    >
                                                        <User className="w-4 h-4 text-foreground/50" />
                                                        Login
                                                    </button>
                                                    <div className="mx-4 my-1 border-t border-border/50" />
                                                </>
                                            ) : (
                                                <>
                                                    {/* User info */}
                                                    <div className="px-5 py-3 border-b border-border/50">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {user.user_metadata?.first_name || "User"}
                                                        </p>
                                                        <p className="text-xs text-foreground/40 truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => { setUserMenuOpen(false); navigate("/app/settings"); }}
                                                        className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-foreground/5 transition-colors text-sm text-foreground"
                                                    >
                                                        <Settings className="w-4 h-4 text-foreground/50" />
                                                        Settings
                                                    </button>
                                                    <button
                                                        onClick={() => { setUserMenuOpen(false); navigate("/app"); }}
                                                        className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-foreground/5 transition-colors text-sm text-foreground"
                                                    >
                                                        <User className="w-4 h-4 text-foreground/50" />
                                                        Profile
                                                    </button>
                                                    <div className="mx-4 my-1 border-t border-border/50" />
                                                </>
                                            )}

                                            {/* Always visible */}
                                            <button
                                                onClick={() => { setUserMenuOpen(false); /* TODO: navigate to about page */ }}
                                                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-foreground/5 transition-colors text-sm text-foreground"
                                            >
                                                <Info className="w-4 h-4 text-foreground/50" />
                                                About (myra LLC)
                                            </button>
                                            <Link
                                                to="/legal/privacy"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-foreground/5 transition-colors text-sm text-foreground"
                                            >
                                                <Lock className="w-4 h-4 text-foreground/50" />
                                                Privacy Policy
                                            </Link>

                                            {/* Sign out */}
                                            {user && (
                                                <>
                                                    <div className="mx-4 my-1 border-t border-border/50" />
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-red-500/10 transition-colors text-sm text-red-500"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Sign Out
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Hidden auth modal trigger */}
                        <div className="hidden">
                            <AuthModal />
                        </div>
                    </div>
                </header>
            </div>

            {/* Mega Menu Panel Overlay */}
            <AnimatePresence>
                {activePanel && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
                            onClick={() => setActivePanelId(null)}
                        />
                        {/* Panel */}
                        <MegaMenuPanel
                            item={activePanel}
                            onClose={() => setActivePanelId(null)}
                        />
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default NewHeader;
