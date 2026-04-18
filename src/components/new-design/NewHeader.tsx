import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Menu, X, ShieldAlert, LogOut, User, Settings,
    BookOpen, TrendingUp, Shield, DollarSign, BarChart3,
    ChevronRight, Info, Lock, LayoutDashboard, Wallet
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

const ACCENT = "#00D4AA";

export const NewHeader = () => {
    const navigate = useNavigate();
    const { user, role, testRole, signOut } = useAuth();
    const effectiveRole = testRole || role;

    const [scrolled, setScrolled] = useState(false);
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

    const handleLaunchApp = () => {
        if (user) {
            navigate("/app");
        } else {
            document.getElementById("auth-modal-trigger")?.click();
        }
    };

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 40);
        fn();
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (mainMenuRef.current && !mainMenuRef.current.contains(e.target as Node)) setMainMenuOpen(false);
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

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

    const shellStyle: React.CSSProperties = {
        background: scrolled ? "rgba(10, 10, 10, 0.72)" : "rgba(10, 10, 10, 0.35)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        border: `1px solid ${scrolled ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)"}`,
        transition: "all 0.4s ease",
    };

    const iconBtn: React.CSSProperties = {
        width: 36,
        height: 36,
        borderRadius: 999,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#f5f5f7",
        cursor: "pointer",
        transition: "background 0.2s",
    };

    return (
        <>
            <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
                <header
                    className="rounded-full px-3 sm:px-5 py-2.5 flex items-center justify-between"
                    style={shellStyle}
                >
                    {/* Left: hamburger + wordmark */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div ref={mainMenuRef} className="relative">
                            <button
                                onClick={() => { setMainMenuOpen(v => !v); setUserMenuOpen(false); }}
                                style={iconBtn}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                aria-label="Main menu"
                            >
                                <AnimatePresence mode="wait">
                                    {mainMenuOpen ? (
                                        <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                            <X className="w-4 h-4" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                            <Menu className="w-4 h-4" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>

                            <AnimatePresence>
                                {mainMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-12 left-0 w-72 rounded-2xl overflow-hidden shadow-2xl"
                                        style={{
                                            background: "rgba(15, 15, 18, 0.92)",
                                            backdropFilter: "blur(24px)",
                                            WebkitBackdropFilter: "blur(24px)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                        }}
                                    >
                                        <div className="py-2">
                                            {MENU_ITEMS.map((item) => {
                                                const Icon = menuIcons[item.id] || BookOpen;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => { setActivePanelId(item.id); setMainMenuOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors group"
                                                        style={{ color: "#f5f5f7" }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ACCENT}1a` }}>
                                                            <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                                                        </div>
                                                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                                                        <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-80 transition-opacity shrink-0" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Link to="/" className="flex items-center pl-1">
                            <span
                                style={{
                                    fontFamily: "'Playfair Display', Georgia, serif",
                                    fontStyle: "italic",
                                    fontWeight: 600,
                                    fontSize: 22,
                                    color: ACCENT,
                                    lineHeight: 1,
                                }}
                            >
                                myra
                            </span>
                        </Link>
                    </div>

                    {/* Right: Launch App + Theme + Admin + Avatar */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={handleLaunchApp}
                            className="hidden sm:inline-flex items-center"
                            style={{
                                height: 36,
                                padding: "0 18px",
                                borderRadius: 999,
                                background: "transparent",
                                border: `1px solid ${ACCENT}`,
                                color: ACCENT,
                                fontSize: 13,
                                fontWeight: 500,
                                letterSpacing: "0.01em",
                                fontFamily: "'DM Sans', sans-serif",
                                cursor: "pointer",
                                transition: "all 0.25s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = ACCENT;
                                e.currentTarget.style.color = "#000";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = ACCENT;
                            }}
                        >
                            {user ? "Open App" : "Launch App"}
                        </button>

                        <ThemeToggle />

                        {effectiveRole === "admin" && (
                            <button
                                onClick={() => navigate("/admin")}
                                className="hidden sm:flex items-center gap-1.5"
                                style={{
                                    height: 36,
                                    padding: "0 14px",
                                    borderRadius: 999,
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.10)",
                                    color: "#f5f5f7",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Admin
                            </button>
                        )}

                        <div ref={userMenuRef} className="relative">
                            <button
                                onClick={() => { setUserMenuOpen(v => !v); setMainMenuOpen(false); }}
                                style={iconBtn}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                aria-label="User menu"
                            >
                                <User className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-12 right-0 w-56 rounded-2xl overflow-hidden shadow-2xl"
                                        style={{
                                            background: "rgba(15, 15, 18, 0.92)",
                                            backdropFilter: "blur(24px)",
                                            WebkitBackdropFilter: "blur(24px)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            color: "#f5f5f7",
                                        }}
                                    >
                                        <div className="py-2">
                                            {!user ? (
                                                <>
                                                    <button
                                                        onClick={() => { setUserMenuOpen(false); document.getElementById("auth-modal-trigger")?.click(); }}
                                                        className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors text-sm"
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                                    >
                                                        <User className="w-4 h-4 opacity-50" />
                                                        Login
                                                    </button>
                                                    <div className="mx-4 my-1 border-t border-white/10" />
                                                </>
                                            ) : (
                                                <>
                                                    <div className="px-5 py-3 border-b border-white/10">
                                                        <p className="text-sm font-medium truncate">{user.user_metadata?.first_name || "User"}</p>
                                                        <p className="text-xs opacity-50 truncate">{user.email}</p>
                                                    </div>
                                                    {[
                                                        { icon: LayoutDashboard, label: "Dashboard", path: "/app" },
                                                        { icon: User, label: "Profile", path: "/app/profile" },
                                                        { icon: Wallet, label: "Portfolio", path: "/app/portfolio" },
                                                        { icon: Settings, label: "Settings", path: "/app/settings" },
                                                    ].map(({ icon: Icon, label, path }) => (
                                                        <button
                                                            key={path}
                                                            onClick={() => { setUserMenuOpen(false); navigate(path); }}
                                                            className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors text-sm"
                                                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                                        >
                                                            <Icon className="w-4 h-4 opacity-50" />
                                                            {label}
                                                        </button>
                                                    ))}
                                                    <div className="mx-4 my-1 border-t border-white/10" />
                                                </>
                                            )}

                                            <button
                                                onClick={() => setUserMenuOpen(false)}
                                                className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors text-sm"
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                            >
                                                <Info className="w-4 h-4 opacity-50" />
                                                About (myra LLC)
                                            </button>
                                            <Link
                                                to="/legal/privacy"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors text-sm"
                                                style={{ color: "#f5f5f7" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                            >
                                                <Lock className="w-4 h-4 opacity-50" />
                                                Privacy Policy
                                            </Link>

                                            {user && (
                                                <>
                                                    <div className="mx-4 my-1 border-t border-white/10" />
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors text-sm"
                                                        style={{ color: "#f87171" }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.08)")}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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

                        <div className="hidden">
                            <AuthModal />
                        </div>
                    </div>
                </header>
            </div>

            <AnimatePresence>
                {activePanel && (
                    <MegaMenuPanel item={activePanel} onClose={() => setActivePanelId(null)} />
                )}
            </AnimatePresence>
        </>
    );
};

export default NewHeader;
