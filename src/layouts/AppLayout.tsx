import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
    LayoutDashboard, 
    MessageSquare, 
    BarChart3, 
    User, 
    Settings, 
    LogOut,
    Menu,
    X,
    ShieldAlert,
    ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, role, testRole, signOut } = useAuth();
    const effectiveRole = testRole || role;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        toast.success("Signed out successfully");
        navigate("/");
    };

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/app", id: "dashboard" },
        { icon: MessageSquare, label: "MyRA Chat", path: "/app/chat", id: "chat" },
        { icon: BarChart3, label: "Portfolio", path: "/app/portfolio", id: "portfolio" },
        { icon: User, label: "Profile", path: "/app/profile", id: "profile" },
    ];

    return (
        <div className="min-h-screen bg-[#030508] text-white flex overflow-hidden font-sans selection:bg-primary/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* Premium Sidebar */}
            <aside 
                className={`relative z-20 flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-500 ease-in-out ${
                    sidebarCollapsed ? "w-20" : "w-64"
                }`}
            >
                {/* Logo Area */}
                <div className="p-6 mb-8">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                                <span className="font-serif text-white text-sm font-bold tracking-tighter">RA</span>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex flex-col animate-in fade-in slide-in-from-left-2">
                                <span className="text-xl font-serif font-bold tracking-tight">MyRA</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold -mt-1">Fiduciary AI</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                                location.pathname === item.path
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${location.pathname === item.path ? "text-primary shadow-sm" : ""}`} />
                            {!sidebarCollapsed && (
                                <span className="font-semibold text-sm tracking-wide animate-in fade-in slide-in-from-left-2">{item.label}</span>
                            )}
                            {location.pathname === item.path && !sidebarCollapsed && (
                                <ChevronRight className="w-4 h-4 ml-auto text-primary/50" />
                            )}
                        </button>
                    ))}

                    <div className="my-8 h-px bg-white/5 mx-4" />

                    {effectiveRole === "admin" && (
                        <button
                            onClick={() => navigate("/admin")}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-amber-400/60 hover:text-amber-400 hover:bg-amber-400/5 transition-all group"
                        >
                            <ShieldAlert className="w-5 h-5 transition-transform group-hover:rotate-12" />
                            {!sidebarCollapsed && (
                                <span className="font-semibold text-sm tracking-wide">Admin Panel</span>
                            )}
                        </button>
                    )}
                </nav>

                {/* User & Settings */}
                <div className="p-4 mt-auto space-y-2 pb-8">
                     <button
                        onClick={() => navigate("/app/settings")}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all rounded-2xl ${
                            location.pathname === "/app/settings" ? "bg-white/5 text-white" : "text-white/40 hover:text-white"
                        }`}
                    >
                        <Settings className="w-5 h-5" />
                        {!sidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
                    </button>

                    <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center gap-3 group hover:border-white/10 transition-all">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/40 to-blue-500/40 flex items-center justify-center border border-white/10 overflow-hidden">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs font-bold">{user?.email?.substring(0, 2).toUpperCase()}</span>
                            )}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0 pr-2">
                                <p className="text-xs font-bold text-white truncate">{user?.user_metadata?.first_name || "Account"}</p>
                                <button 
                                    onClick={handleSignOut}
                                    className="text-[10px] text-white/40 font-bold uppercase tracking-wider hover:text-red-400 transition-colors flex items-center gap-1"
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
                    className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors z-30"
                >
                    <Menu className={`w-3 h-3 transition-transform ${sidebarCollapsed ? "rotate-90" : ""}`} />
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                {/* Minimal Header */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-md relative z-10">
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Workspace</span>
                         <ChevronRight className="w-3 h-3 text-white/20" />
                         <span className="text-sm font-semibold text-white/90">
                            {navItems.find(i => i.path === location.pathname)?.label || "Explore"}
                         </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="h-8 w-px bg-white/5" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Secure Connection</span>
                        </div>
                    </div>
                </header>

                {/* Viewport Rendering */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 custom-scrollbar relative z-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
