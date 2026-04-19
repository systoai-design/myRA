import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import {
    User, Lock, Palette, LogOut, Loader2, Save,
    Moon, Sun, Monitor, AlertTriangle,
    Mail, Bell, Eye, EyeOff,
    ChevronRight, CheckCircle2,
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
    const [showPassword, setShowPassword] = useState(false);

    // Notifications
    const [emailNotifs, setEmailNotifs] = useState(
        user?.user_metadata?.email_notifications !== false
    );

    // Active section (for mobile nav)
    const [activeSection, setActiveSection] = useState("profile");

    // ═══════════ Handlers ═══════════

    const handleSaveName = async () => {
        if (!displayName.trim()) return;
        setSavingName(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { first_name: displayName.trim() }
            });
            if (error) throw error;
            await supabase.auth.getSession(); // refresh sidebar
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

    const handleToggleNotifs = async () => {
        const newVal = !emailNotifs;
        setEmailNotifs(newVal);
        try {
            await supabase.auth.updateUser({
                data: { email_notifications: newVal }
            });
            toast.success(newVal ? "Notifications enabled" : "Notifications muted");
        } catch {
            setEmailNotifs(!newVal);
            toast.error("Failed to update preference");
        }
    };

    const handleSignOut = async () => {
        await signOut();
        toast.success("Signed out successfully");
        navigate("/");
    };

    // ═══════════ Helpers ═══════════

    const themeOptions = [
        { value: "dark" as const, label: "Dark", icon: Moon, desc: "Easy on the eyes" },
        { value: "light" as const, label: "Light", icon: Sun, desc: "Classic and clean" },
        { value: "system" as const, label: "Auto", icon: Monitor, desc: "Match your OS" },
    ];

    const navSections = [
        { id: "profile", label: "Profile", icon: User },
        { id: "appearance", label: "Appearance", icon: Palette },
        { id: "security", label: "Security", icon: Lock },
        { id: "notifications", label: "Notifications", icon: Bell },
    ];

    // ═══════════ RENDER ═══════════

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1 text-sm">Manage your account, appearance, and security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* ═══════════ SIDEBAR NAV ═══════════ */}
                <div className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-3xl p-2 space-y-1 sticky top-8">
                        {navSections.map(s => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setActiveSection(s.id);
                                    document.getElementById(`settings-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                                    activeSection === s.id
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                            >
                                <s.icon className="w-4 h-4" />
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ═══════════ MAIN CONTENT ═══════════ */}
                <div className="lg:col-span-3 space-y-6">

                    {/* ───── PROFILE SECTION ───── */}
                    <section id="settings-profile" className="bg-card border border-border rounded-3xl p-8 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Profile</h3>
                                <p className="text-xs text-muted-foreground">Your public identity on myRA</p>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground -mt-4">
                            Your profile picture and retirement details are managed on the{" "}
                            <button
                                onClick={() => navigate("/app/profile")}
                                className="text-primary hover:underline font-semibold"
                            >
                                Profile page
                            </button>.
                        </p>

                        {/* Display Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Display Name</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); }}
                                    className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                                    placeholder="Your name"
                                />
                                <button 
                                    onClick={handleSaveName}
                                    disabled={savingName || displayName.trim() === (user?.user_metadata?.first_name || "")}
                                    className="px-4 py-3 bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground text-sm font-semibold transition-all disabled:opacity-30 flex items-center gap-2"
                                >
                                    {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* Email (read-only) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                            <div className="flex items-center gap-3 bg-muted/30 border border-border rounded-xl px-4 py-3">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{user?.email}</span>
                                <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-lg">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[10px] font-bold text-emerald-500">Verified</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ───── APPEARANCE SECTION ───── */}
                    <section id="settings-appearance" className="bg-card border border-border rounded-3xl p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                <Palette className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Appearance</h3>
                                <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {themeOptions.map(({ value, label, icon: Icon, desc }) => (
                                <button
                                    key={value}
                                    onClick={() => setTheme(value)}
                                    className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                                        theme === value 
                                            ? "bg-primary/5 border-primary/40 text-foreground shadow-sm" 
                                            : "bg-muted/20 border-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40"
                                    }`}
                                >
                                    {theme === value && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === value ? "bg-primary/10" : "bg-muted/50"}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold">{label}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* ───── SECURITY SECTION ───── */}
                    <section id="settings-security" className="bg-card border border-border rounded-3xl p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Security</h3>
                                <p className="text-xs text-muted-foreground">Update your password</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">New Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        minLength={6}
                                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 pr-10 text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Confirm Password</label>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") handleChangePassword(); }}
                                    placeholder="••••••••"
                                    minLength={6}
                                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Password strength indicator */}
                        {newPassword && (
                            <div className="space-y-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map(i => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-colors ${
                                                newPassword.length >= i * 3
                                                    ? newPassword.length >= 12 ? "bg-emerald-500" : newPassword.length >= 8 ? "bg-amber-500" : "bg-red-500"
                                                    : "bg-muted"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    {newPassword.length < 6 ? "Too short" : newPassword.length < 8 ? "Weak" : newPassword.length < 12 ? "Good" : "Strong"}
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <span className="text-red-400 ml-2">· Passwords don't match</span>
                                    )}
                                    {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                                        <span className="text-emerald-400 ml-2">· Passwords match ✓</span>
                                    )}
                                </p>
                            </div>
                        )}

                        <button 
                            onClick={handleChangePassword}
                            disabled={savingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                            className="px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-semibold rounded-xl transition-all disabled:opacity-30 flex items-center gap-2 text-sm"
                        >
                            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            Update Password
                        </button>
                    </section>

                    {/* ───── NOTIFICATIONS SECTION ───── */}
                    <section id="settings-notifications" className="bg-card border border-border rounded-3xl p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Notifications</h3>
                                <p className="text-xs text-muted-foreground">Manage how myRA communicates with you</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Email toggle */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Email Notifications</p>
                                        <p className="text-xs text-muted-foreground">Receive updates and insights via email</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleToggleNotifs}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${emailNotifs ? "bg-primary" : "bg-muted"}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${emailNotifs ? "left-6" : "left-1"}`} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* ───── SIGN OUT & DANGER ───── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                            onClick={handleSignOut}
                            className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4 hover:border-primary/20 hover:bg-primary/[0.02] transition-all cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                                <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-foreground">Sign Out</p>
                                <p className="text-xs text-muted-foreground">End your current session</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/40 ml-auto" />
                        </button>

                        <button 
                            onClick={() => toast.info("Contact support to delete your account: support@retirewithmyra.com")}
                            className="bg-card border border-red-500/10 rounded-3xl p-6 flex items-center gap-4 hover:border-red-500/20 hover:bg-red-500/[0.02] transition-all cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-400/60 group-hover:text-red-400 transition-colors" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-red-400/80 group-hover:text-red-400 transition-colors">Delete Account</p>
                                <p className="text-xs text-muted-foreground">Permanently remove all data</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/40 ml-auto" />
                        </button>
                    </div>

                    {/* Version */}
                    <div className="text-center py-4">
                        <p className="text-[10px] text-muted-foreground/40 font-medium tracking-widest uppercase">myRA v2.0 · Built by Retirement Architects</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
