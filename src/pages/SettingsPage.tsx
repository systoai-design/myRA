import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { 
    User, Lock, Palette, LogOut, Loader2, Save, 
    Moon, Sun, Monitor, AlertTriangle, Trash2
} from "lucide-react";

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    
    // Account
    const [displayName, setDisplayName] = useState(user?.user_metadata?.first_name || "");
    const [savingName, setSavingName] = useState(false);

    // Password
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    const handleSaveName = async () => {
        if (!displayName.trim()) return;
        setSavingName(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { first_name: displayName.trim() }
            });
            if (error) throw error;
            toast.success("Display name updated!");
        } catch (err: any) {
            toast.error(err.message || "Failed to update name");
        } finally {
            setSavingName(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }
        setSavingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success("Password updated successfully!");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            toast.error(err.message || "Failed to update password");
        } finally {
            setSavingPassword(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        toast.success("Signed out successfully");
        navigate("/");
    };

    const themeOptions = [
        { value: "dark" as const, label: "Dark", icon: Moon },
        { value: "light" as const, label: "Light", icon: Sun },
        { value: "system" as const, label: "System", icon: Monitor },
    ];

    return (
        <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Settings</h2>
                <p className="text-muted-foreground text-sm font-medium">Manage your account, appearance, and security.</p>
            </div>

            {/* Account Section */}
            <div className="glass-premium rounded-[32px] p-8 border border-black/5 dark:border-white/5 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-foreground">Account</h3>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Display Name</label>
                    <div className="flex items-center gap-2">
                        <input 
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); }}
                            className="flex-1 bg-black/[0.03] dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                            placeholder="Your name"
                        />
                        <button 
                            onClick={handleSaveName}
                            disabled={savingName || displayName.trim() === (user?.user_metadata?.first_name || "")}
                            className="px-4 py-3 bg-primary hover:bg-primary/80 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-30 cursor-pointer flex items-center gap-2"
                        >
                            {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                        </button>
                    </div>
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email</label>
                    <div className="bg-black/[0.03] dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-muted-foreground text-sm">
                        {user?.email}
                    </div>
                </div>
            </div>

            {/* Appearance Section */}
            <div className="glass-premium rounded-[32px] p-8 border border-black/5 dark:border-white/5 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Palette className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-foreground">Appearance</h3>
                </div>

                <div className="flex gap-3">
                    {themeOptions.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => setTheme(value)}
                            className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer ${
                                theme === value 
                                    ? "bg-primary/10 border-primary/30 text-foreground" 
                                    : "bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-muted-foreground hover:text-foreground hover:border-black/10 dark:hover:border-white/10"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-semibold">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Security Section */}
            <div className="glass-premium rounded-[32px] p-8 border border-black/5 dark:border-white/5 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-foreground">Security</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">New Password</label>
                        <input 
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                            className="w-full bg-black/[0.03] dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Confirm Password</label>
                        <input 
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                            className="w-full bg-black/[0.03] dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                        />
                    </div>
                </div>
                <button 
                    onClick={handleChangePassword}
                    disabled={savingPassword || !newPassword || !confirmPassword}
                    className="px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 font-semibold rounded-xl transition-all disabled:opacity-30 cursor-pointer flex items-center gap-2 text-sm"
                >
                    {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Update Password
                </button>
            </div>

            {/* Sign Out & Danger Zone */}
            <div className="flex flex-col md:flex-row gap-4">
                <button 
                    onClick={handleSignOut}
                    className="flex-1 glass-premium rounded-[24px] p-6 border border-black/5 dark:border-white/5 flex items-center gap-4 hover:border-black/10 dark:hover:border-white/10 transition-all cursor-pointer group"
                >
                    <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/5 flex items-center justify-center group-hover:bg-black/[0.08] dark:group-hover:bg-white/10 transition-all">
                        <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">Sign Out</p>
                        <p className="text-xs text-muted-foreground">End your current session</p>
                    </div>
                </button>

                <button 
                    onClick={() => toast.info("Contact support to delete your account: support@retirementarchitects.com")}
                    className="flex-1 glass-premium rounded-[24px] p-6 border border-red-500/10 bg-red-500/[0.02] flex items-center gap-4 hover:border-red-500/20 transition-all cursor-pointer group"
                >
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400/60" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-red-400/80">Delete Account</p>
                        <p className="text-xs text-muted-foreground">Permanently remove all data</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
