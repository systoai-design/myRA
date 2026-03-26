import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export const NewHeader = () => {
    const navigate = useNavigate();
    const { user, role, testRole, signOut } = useAuth();
    const effectiveRole = testRole || role;

    const handleSignOut = async () => {
        await signOut();
        toast.success("Signed out successfully");
    };

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
            <header className="glass-panel rounded-full px-6 py-3 flex items-center justify-between">
                
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center bg-black/[0.03] dark:bg-white/5 group-hover:bg-black/[0.06] dark:group-hover:bg-white/10 transition-colors">
                            <span className="text-foreground font-serif font-bold text-xs tracking-wider">RA</span>
                        </div>
                        <span className="text-xl font-serif text-foreground tracking-tight">
                            MyRA
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
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
                    <button
                        onClick={() => {
                            if (!user) {
                                document.getElementById('auth-modal-trigger')?.click();
                            } else {
                                navigate("/app");
                            }
                        }}
                        className="h-9 px-5 rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-all hidden sm:block"
                    >
                        Launch App
                    </button>

                    {user ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground hidden md:block">
                                {user.user_metadata?.first_name || "User"}
                            </span>
                            <button
                                onClick={handleSignOut}
                                className="h-9 px-4 rounded-full bg-black/[0.04] dark:bg-white/10 border border-black/[0.06] dark:border-white/10 text-foreground text-xs font-semibold hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-600 dark:hover:text-red-300 transition-colors flex items-center gap-1.5"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <AuthModal />
                    )}
                </div>
            </header>
        </div>
    );
};

export default NewHeader;
