import { Link, useNavigate } from "react-router-dom";
import { Sun, ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { toast } from "sonner";

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
            <header className="glass-premium rounded-full px-6 py-3 flex items-center justify-between border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
                            <span className="text-white font-serif font-bold text-xs tracking-wider">RA</span>
                        </div>
                        <span className="text-xl font-serif text-white tracking-tight">
                            MyRA
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {effectiveRole === "admin" && (
                        <button
                            onClick={() => navigate("/admin")}
                            className="h-9 px-4 rounded-full bg-white/10 border border-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors hidden sm:flex items-center gap-1.5"
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
                        className="h-9 px-5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors hidden sm:block"
                    >
                        Launch App
                    </button>

                    {user ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white/70 hidden md:block">
                                {user.user_metadata?.first_name || "User"}
                            </span>
                            <button
                                onClick={handleSignOut}
                                className="h-9 px-4 rounded-full bg-white/10 border border-white/10 text-white text-xs font-semibold hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 transition-colors flex items-center gap-1.5"
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

