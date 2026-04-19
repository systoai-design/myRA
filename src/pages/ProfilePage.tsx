import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    User, Calendar, MapPin, ReceiptText, Users, Clock,
    Loader2, CheckCircle2, Shield, Camera, Upload, X,
} from "lucide-react";

interface UserMemory {
    category: string;
    fact: string;
}

type FieldType = "text" | "date" | "number" | "select";

interface FieldDef {
    category: string;
    label: string;
    icon: typeof User;
    type: FieldType;
    placeholder: string;
    options?: string[];
}

const STATES = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
    "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
    "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
    "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const TAX_STATUSES = ["Single", "Married Filing Jointly", "Married Filing Separately", "Head of Household"];

const FIELD_CONFIG: FieldDef[] = [
    { category: "legal_name", label: "Full Name", icon: User, type: "text", placeholder: "John Doe" },
    { category: "date_of_birth", label: "Date of Birth", icon: Calendar, type: "date", placeholder: "" },
    { category: "state", label: "State of Residence", icon: MapPin, type: "select", placeholder: "Select State", options: STATES },
    { category: "marital_status", label: "Tax Filing Status", icon: ReceiptText, type: "select", placeholder: "Select status", options: TAX_STATUSES },
    { category: "spouse_age", label: "Spouse's Age", icon: Users, type: "number", placeholder: "e.g. 58" },
    { category: "retirement_date", label: "Target Retirement Age", icon: Clock, type: "number", placeholder: "e.g. 65" },
];

type SaveState = "idle" | "saving" | "saved" | "error";

export default function ProfilePage() {
    const { user } = useAuth();
    const [memories, setMemories] = useState<Record<string, string>>({});
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
    const [loading, setLoading] = useState(true);
    const savedTimers = useRef<Record<string, number>>({});

    // Avatar
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        if (user?.user_metadata?.avatar_url) setAvatarUrl(user.user_metadata.avatar_url);
    }, [user]);

    const fetchMemories = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_memory')
                .select('category, fact')
                .eq('user_id', user.id);

            if (data && !error) {
                const map: Record<string, string> = {};
                data.forEach((m: UserMemory) => { map[m.category] = m.fact; });
                setMemories(map);
                setDrafts(map);
            }
        } catch (err) {
            console.error("Failed to fetch profile data:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchMemories(); }, [fetchMemories]);

    useEffect(() => {
        const timers = savedTimers.current;
        return () => {
            Object.values(timers).forEach((t) => window.clearTimeout(t));
        };
    }, []);

    const saveField = useCallback(async (category: string, value: string) => {
        if (!user) return;
        const trimmed = value.trim();

        // No change — skip
        if (trimmed === (memories[category] || "").trim()) return;

        // Empty — delete any existing row
        if (!trimmed) {
            setSaveStates((s) => ({ ...s, [category]: "saving" }));
            try {
                await supabase.from('user_memory').delete()
                    .eq('user_id', user.id).eq('category', category);
                setMemories((prev) => {
                    const next = { ...prev };
                    delete next[category];
                    return next;
                });
                setSaveStates((s) => ({ ...s, [category]: "saved" }));
                savedTimers.current[category] = window.setTimeout(() => {
                    setSaveStates((s) => ({ ...s, [category]: "idle" }));
                }, 1800);
            } catch {
                setSaveStates((s) => ({ ...s, [category]: "error" }));
                toast.error("Failed to save");
            }
            return;
        }

        setSaveStates((s) => ({ ...s, [category]: "saving" }));
        try {
            await supabase.from('user_memory').upsert({
                user_id: user.id,
                category,
                fact: trimmed,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, category' });

            setMemories((prev) => ({ ...prev, [category]: trimmed }));
            setSaveStates((s) => ({ ...s, [category]: "saved" }));
            savedTimers.current[category] = window.setTimeout(() => {
                setSaveStates((s) => ({ ...s, [category]: "idle" }));
            }, 1800);
        } catch {
            setSaveStates((s) => ({ ...s, [category]: "error" }));
            toast.error("Failed to save");
        }
    }, [user, memories]);

    const updateDraft = (category: string, value: string) => {
        setDrafts((d) => ({ ...d, [category]: value }));
    };

    // Avatar handlers
    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleAvatarUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file || !user) return;

        setUploadingAvatar(true);
        try {
            const compressImage = (f: File): Promise<Blob> =>
                new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        const size = 128;
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext("2d")!;
                        const min = Math.min(img.width, img.height);
                        const sx = (img.width - min) / 2;
                        const sy = (img.height - min) / 2;
                        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
                        canvas.toBlob(
                            (blob) => blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")),
                            "image/jpeg",
                            0.7
                        );
                    };
                    img.onerror = () => reject(new Error("Failed to load image"));
                    img.src = URL.createObjectURL(f);
                });

            const compressed = await compressImage(file);

            const toDataUrl = (blob: Blob): Promise<string> =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(new Error("FileReader failed"));
                    reader.readAsDataURL(blob);
                });

            let savedUrl: string | null = null;
            const fileName = `${user.id}.jpg`;

            try {
                const { error: uploadError } = await supabase.storage
                    .from("avatars")
                    .upload(fileName, compressed, { upsert: true, contentType: "image/jpeg" });

                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from("avatars")
                        .getPublicUrl(fileName);
                    savedUrl = urlData.publicUrl + `?t=${Date.now()}`;
                }
            } catch { /* fallback to data URL */ }

            if (!savedUrl) savedUrl = await toDataUrl(compressed);

            const { error: metaError } = await supabase.auth.updateUser({
                data: { avatar_url: savedUrl }
            });
            if (metaError) throw metaError;

            await supabase.auth.getSession();

            setAvatarUrl(savedUrl);
            setAvatarPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            toast.success("Profile picture updated!");
        } catch (err: any) {
            console.error("Avatar upload error:", err);
            toast.error(err.message || "Failed to upload avatar");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            await supabase.auth.updateUser({ data: { avatar_url: null } });
            await supabase.auth.getSession();
            setAvatarUrl(null);
            setAvatarPreview(null);
            toast.success("Profile picture removed");
        } catch {
            toast.error("Failed to remove avatar");
        }
    };

    const completionCount = FIELD_CONFIG.filter((f) => memories[f.category]?.trim()).length;
    const completionPct = Math.round((completionCount / FIELD_CONFIG.length) * 100);

    const initials = (memories["legal_name"] || user?.user_metadata?.first_name || user?.email || "?")
        .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    const renderSaveIndicator = (state: SaveState | undefined) => {
        if (state === "saving") {
            return <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />;
        }
        if (state === "saved") {
            return (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Saved
                </span>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Your Profile</h2>
                    <p className="text-muted-foreground text-sm font-medium">myra uses this data to personalize your retirement strategy.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-border flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Completion</p>
                            <p className="text-sm font-bold text-foreground">{completionPct}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Avatar + Completion */}
            <div className="glass-premium rounded-[32px] p-6 border border-border bg-black/[0.02] dark:bg-white/[0.02] flex items-center gap-6 flex-wrap">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-muted-foreground">{initials}</span>
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-3xl flex items-center justify-center transition-opacity cursor-pointer"
                    >
                        <Camera className="w-6 h-6 text-white" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        className="hidden"
                    />
                </div>
                <div className="space-y-2 flex-1 min-w-[240px]">
                    <p className="text-sm font-semibold text-foreground">Profile Picture</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 5MB.</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        {avatarPreview ? (
                            <>
                                <button
                                    onClick={handleAvatarUpload}
                                    disabled={uploadingAvatar}
                                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                    Save
                                </button>
                                <button
                                    onClick={() => { setAvatarPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                    className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                                >
                                    <X className="w-3 h-3" />
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                                >
                                    {avatarUrl ? "Change" : "Upload"}
                                </button>
                                {avatarUrl && (
                                    <button
                                        onClick={handleRemoveAvatar}
                                        className="px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-500 transition-colors"
                                    >
                                        Remove
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Completion Progress */}
            <div className="glass-premium rounded-[32px] p-6 border border-border bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Profile Calibration</span>
                    <span className="text-xs font-bold text-muted-foreground">{completionCount}/{FIELD_CONFIG.length} fields</span>
                </div>
                <div className="h-2 w-full bg-black/[0.03] dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${completionPct}%` }}
                    />
                </div>
            </div>

            {/* Profile Fields */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {FIELD_CONFIG.map((field) => {
                        // Hide spouse age if not married
                        if (field.category === "spouse_age" && !memories["marital_status"]?.includes("Married")) {
                            return null;
                        }

                        const value = drafts[field.category] ?? "";
                        const Icon = field.icon;
                        const state = saveStates[field.category];

                        return (
                            <div
                                key={field.category}
                                className="glass-premium rounded-[24px] p-6 border border-border bg-black/[0.02] dark:bg-white/[0.02] hover:border-border transition-all"
                            >
                                <div className="flex items-center justify-between mb-4 h-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Icon className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{field.label}</span>
                                    </div>
                                    {renderSaveIndicator(state)}
                                </div>

                                {field.type === "select" ? (
                                    <select
                                        value={value}
                                        onChange={(e) => {
                                            updateDraft(field.category, e.target.value);
                                            saveField(field.category, e.target.value);
                                        }}
                                        className="w-full bg-muted/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                                    >
                                        <option value="">{field.placeholder}</option>
                                        {field.options?.map((o) => (
                                            <option key={o} value={o}>{o}</option>
                                        ))}
                                    </select>
                                ) : field.type === "date" ? (
                                    <input
                                        type="date"
                                        value={value}
                                        onChange={(e) => updateDraft(field.category, e.target.value)}
                                        onBlur={() => saveField(field.category, value)}
                                        className="w-full bg-muted/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        value={value}
                                        placeholder={field.placeholder}
                                        onChange={(e) => updateDraft(field.category, e.target.value)}
                                        onBlur={() => saveField(field.category, value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                        }}
                                        className="w-full bg-muted/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Security Badge */}
            <div className="glass-premium rounded-[24px] p-6 border border-border bg-black/[0.02] dark:bg-white/[0.02] flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">Your data is encrypted and secure</p>
                    <p className="text-xs text-muted-foreground mt-0.5">All profile information is stored with AES-256 encryption via Supabase.</p>
                </div>
            </div>
        </div>
    );
}
