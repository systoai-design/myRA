import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
    LayoutDashboard,
    MessageSquare,
    User,
    Settings,
    LogOut,
    Menu,
    ShieldAlert,
    ChevronRight,
    DollarSign,
    PieChart,
    Bell,
    Plug,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { displayName } from "@/lib/name";

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, role, testRole, signOut } = useAuth();
    const effectiveRole = testRole || role;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Redirect new users to onboarding if they haven't completed it
    useEffect(() => {
        if (!user) return;
        if (location.pathname.startsWith("/app/onboarding")) return;
        // Skip redirect if user dismissed via query string (?skipOnboarding=1)
        if (new URLSearchParams(location.search).get("skipOnboarding") === "1") return;
        // Check localStorage for a "dismissed" flag so we don't loop
        if (localStorage.getItem(`onboarding-dismissed-${user.id}`) === "true") return;

        let cancelled = false;
        (async () => {
            const { data } = await supabase
                .from("user_memory")
                .select("category, fact")
                .eq("user_id", user.id)
                .in("category", ["onboarded", "date_of_birth", "life_stage"]);
            if (cancelled) return;
            const hasOnboarded = data?.some((m) => m.category === "onboarded" && m.fact === "true");
            const hasBasics = data?.some((m) => m.category === "date_of_birth" && m.fact)
                && data?.some((m) => m.category === "life_stage" && m.fact);
            if (!hasOnboarded && !hasBasics) {
                navigate("/app/onboarding", { replace: true });
            }
        })();
        return () => { cancelled = true; };
    }, [user, location.pathname, location.search, navigate]);

    const handleSignOut = async () => {
        await signOut();
        toast.success("Signed out successfully");
        navigate("/");
    };

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/app", id: "dashboard" },
        { icon: MessageSquare, label: "myra Chat", path: "/app/chat", id: "chat" },
        { icon: User, label: "Profile", path: "/app/profile", id: "profile" },
    ];

    const toolItems = [
        { icon: DollarSign, label: "Spending", path: "/app/spending", id: "spending" },
        { icon: PieChart, label: "Budget", path: "/app/budget", id: "budget" },
        { icon: Bell, label: "Subscriptions", path: "/app/subscriptions", id: "subscriptions" },
    ];

    const connectItems = [
        { icon: Plug, label: "Integrations", path: "/app/integrations", id: "integrations" },
    ];

    return (
        <div className="h-screen bg-background text-foreground flex overflow-hidden font-sans selection:bg-primary/30">
            {/* Background Effects — matches landing page (dark with subtle aurora accents) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Light mode: soft gradient wash */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-transparent to-purple-50/40 dark:opacity-0" />

                {/* Dark mode: pure black base with tiny atmospheric whispers (matches landing) */}
                <div
                    className="absolute inset-0 hidden dark:block"
                    style={{
                        background: `
                            radial-gradient(ellipse 70% 50% at 12% 0%, rgba(0, 212, 170, 0.08) 0%, transparent 60%),
                            radial-gradient(ellipse 60% 45% at 95% 30%, rgba(110, 86, 207, 0.08) 0%, transparent 60%),
                            radial-gradient(ellipse 85% 60% at 55% 110%, rgba(79, 70, 229, 0.06) 0%, transparent 65%),
                            #000000
                        `,
                    }}
                />

                {/* Drifting orbs — very subtle, only faint color hints against pure black */}
                <div
                    className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full hidden dark:block"
                    style={{
                        background: "radial-gradient(circle, rgba(0, 212, 170, 0.10), transparent 70%)",
                        filter: "blur(120px)",
                        animation: "orb-drift 22s ease-in-out infinite",
                    }}
                />
                <div
                    className="absolute top-[20%] right-[-15%] w-[45%] h-[45%] rounded-full hidden dark:block"
                    style={{
                        background: "radial-gradient(circle, rgba(110, 86, 207, 0.10), transparent 70%)",
                        filter: "blur(120px)",
                        animation: "orb-drift 26s ease-in-out infinite reverse",
                    }}
                />
                <div
                    className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full hidden dark:block"
                    style={{
                        background: "radial-gradient(circle, rgba(129, 140, 248, 0.08), transparent 70%)",
                        filter: "blur(130px)",
                        animation: "orb-drift 30s ease-in-out infinite",
                        animationDelay: "-10s",
                    }}
                />

                {/* Subtle grain */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] dark:opacity-[0.04] mix-blend-overlay" />
            </div>

            {/* Glass Sidebar */}
            <aside 
                className={`relative z-20 flex flex-col glass-sidebar transition-all duration-500 ease-in-out ${
                    sidebarCollapsed ? "w-20" : "w-64"
                }`}
            >
                {/* Logo */}
                <div className="p-6 mb-8">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                            <span
                                style={{
                                    fontFamily: "'Playfair Display', Georgia, serif",
                                    fontStyle: "italic",
                                    fontWeight: 700,
                                    fontSize: 20,
                                    color: "#fff",
                                    lineHeight: 1,
                                }}
                            >
                                m
                            </span>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex flex-col animate-in fade-in slide-in-from-left-2">
                                <span
                                    style={{
                                        fontFamily: "'Playfair Display', Georgia, serif",
                                        fontStyle: "italic",
                                        fontWeight: 600,
                                        fontSize: 22,
                                        lineHeight: 1,
                                    }}
                                    className="text-foreground"
                                >
                                    myra
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mt-1">Fiduciary AI</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1.5">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                                location.pathname === item.path
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/5"
                            }`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${location.pathname === item.path ? "text-primary" : ""}`} />
                            {!sidebarCollapsed && (
                                <span className="font-semibold text-sm tracking-wide animate-in fade-in slide-in-from-left-2">{item.label}</span>
                            )}
                            {location.pathname === item.path && !sidebarCollapsed && (
                                <ChevronRight className="w-4 h-4 ml-auto text-primary/50" />
                            )}
                        </button>
                    ))}

                    {/* Tools section */}
                    <div className="my-4 mx-4">
                        {!sidebarCollapsed && (
                            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50 px-4">Tools</span>
                        )}
                        <div className="h-px bg-border mt-2" />
                    </div>

                    {toolItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                                location.pathname === item.path
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/5"
                            }`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${location.pathname === item.path ? "text-primary" : ""}`} />
                            {!sidebarCollapsed && (
                                <span className="font-semibold text-sm tracking-wide animate-in fade-in slide-in-from-left-2">{item.label}</span>
                            )}
                            {location.pathname === item.path && !sidebarCollapsed && (
                                <ChevronRight className="w-4 h-4 ml-auto text-primary/50" />
                            )}
                        </button>
                    ))}

                    {/* Connect section */}
                    <div className="my-4 mx-4">
                        {!sidebarCollapsed && (
                            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50 px-4">Connect</span>
                        )}
                        <div className="h-px bg-border mt-2" />
                    </div>

                    {connectItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                                location.pathname === item.path
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/5"
                            }`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${location.pathname === item.path ? "text-emerald-400" : ""}`} />
                            {!sidebarCollapsed && (
                                <span className="font-semibold text-sm tracking-wide animate-in fade-in slide-in-from-left-2">{item.label}</span>
                            )}
                            {location.pathname === item.path && !sidebarCollapsed && (
                                <ChevronRight className="w-4 h-4 ml-auto text-emerald-400/50" />
                            )}
                        </button>
                    ))}

                    <div className="my-8 h-px bg-border mx-4" />

                    {effectiveRole === "admin" && (
                        <button
                            onClick={() => navigate("/admin")}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-amber-600/60 dark:text-amber-400/60 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/5 transition-all group"
                        >
                            <ShieldAlert className="w-5 h-5 transition-transform group-hover:rotate-12" />
                            {!sidebarCollapsed && (
                                <span className="font-semibold text-sm tracking-wide">Admin Panel</span>
                            )}
                        </button>
                    )}
                </nav>

                {/* User + Settings */}
                <div className="p-4 mt-auto space-y-2 pb-8">
                    <button
                        onClick={() => navigate("/app/settings")}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all rounded-2xl ${
                            location.pathname === "/app/settings" 
                                ? "bg-black/[0.04] dark:bg-white/5 text-foreground" 
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Settings className="w-5 h-5" />
                        {!sidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
                    </button>

                    <div className="p-4 rounded-[24px] glass-card flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/40 to-blue-500/40 flex items-center justify-center border border-black/5 dark:border-white/10 overflow-hidden">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs font-bold text-foreground">{user?.email?.substring(0, 2).toUpperCase()}</span>
                            )}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0 pr-2">
                                <p className="text-xs font-bold text-foreground truncate">{displayName(user, "Account")}</p>
                                <button 
                                    onClick={handleSignOut}
                                    className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider hover:text-red-500 transition-colors flex items-center gap-1"
                                >
                                    <LogOut className="w-3 h-3" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapse Toggle */}
                <button 
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-background border border-border backdrop-blur-md flex items-center justify-center hover:bg-secondary transition-colors z-30 shadow-sm"
                >
                    <Menu className={`w-3 h-3 text-foreground transition-transform ${sidebarCollapsed ? "rotate-90" : ""}`} />
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                {/* Glass Header */}
                <header className="h-16 flex items-center justify-between px-8 glass-header relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Workspace</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                        <span className="text-sm font-semibold text-foreground">
                            {[...navItems, ...toolItems].find(i => i.path === location.pathname)?.label || "Explore"}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="h-8 w-px bg-border" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Secure</span>
                        </div>
                    </div>
                </header>

                {/* Viewport */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 custom-scrollbar relative z-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
