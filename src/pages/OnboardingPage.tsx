import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    Sparkles, Check, ArrowRight, ArrowLeft, Loader2,
    Camera, Upload, X,
    TrendingUp, Target, Compass, Anchor,
} from "lucide-react";

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

const TAX_STATUSES = [
    "Single",
    "Married Filing Jointly",
    "Married Filing Separately",
    "Head of Household",
];

const LIFE_STAGES = [
    {
        id: "early_career",
        title: "Early Career",
        subtitle: "Growth Seeking",
        desc: "Building a foundation. Focused on income growth, first investments, and setting up retirement accounts.",
        icon: Compass,
        color: "#3b82f6", // blue
    },
    {
        id: "mid_career",
        title: "Mid Career",
        subtitle: "Growth Seeking",
        desc: "Accumulating wealth. Maximizing contributions, optimizing taxes, and planning ahead.",
        icon: TrendingUp,
        color: "#10b981", // emerald
    },
    {
        id: "late_career",
        title: "Late Career",
        subtitle: "Retirement Planning",
        desc: "The final stretch. Preserving capital, locking in income streams, and preparing for the transition.",
        icon: Target,
        color: "#8b5cf6", // purple
    },
    {
        id: "retired",
        title: "Retired",
        subtitle: "Income Seeking & Growth Maintaining",
        desc: "Living the plan. Managing withdrawals, protecting against inflation, and leaving a legacy.",
        icon: Anchor,
        color: "#f59e0b", // amber
    },
];

const TOTAL_STEPS = 4;

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export default function OnboardingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form state
    const [firstName, setFirstName] = useState("");
    const [dob, setDob] = useState("");
    const [taxStatus, setTaxStatus] = useState("Single");
    const [lifeStage, setLifeStage] = useState<string | null>(null);

    // Avatar
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Chat bubble reveal
    const [typing, setTyping] = useState(true);
    useEffect(() => {
        setTyping(true);
        const t = setTimeout(() => setTyping(false), 700);
        return () => clearTimeout(t);
    }, [step]);

    // Load any existing profile to prefill
    useEffect(() => {
        if (!user) return;
        setFirstName(user.user_metadata?.first_name || "");
        (async () => {
            const { data } = await supabase.from("user_memory")
                .select("category, fact").eq("user_id", user.id);
            if (!data) return;
            const map = Object.fromEntries(data.map((m) => [m.category, m.fact]));
            if (map.date_of_birth) setDob(map.date_of_birth);
            if (map.marital_status) setTaxStatus(map.marital_status);
            if (map.life_stage) setLifeStage(map.life_stage);
            if (map.legal_name && !user.user_metadata?.first_name) {
                setFirstName(map.legal_name.split(" ")[0]);
            }
        })();
    }, [user]);

    const saveMemory = useCallback(async (category: string, fact: string) => {
        if (!user || !fact.trim()) return;
        await supabase.from("user_memory").upsert({
            user_id: user.id,
            category,
            fact: fact.trim(),
            updated_at: new Date().toISOString(),
        }, { onConflict: "user_id, category" });
    }, [user]);

    // ─────── Avatar handlers ───────

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleAvatarUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file || !user) return;
        setUploadingAvatar(true);
        try {
            const compressed = await new Promise<Blob>((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const size = 128;
                    canvas.width = size; canvas.height = size;
                    const ctx = canvas.getContext("2d")!;
                    const min = Math.min(img.width, img.height);
                    const sx = (img.width - min) / 2;
                    const sy = (img.height - min) / 2;
                    ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
                    canvas.toBlob((b) => b ? resolve(b) : reject(new Error("canvas")), "image/jpeg", 0.7);
                };
                img.onerror = () => reject(new Error("image load"));
                img.src = URL.createObjectURL(file);
            });

            const dataUrl = await new Promise<string>((resolve, reject) => {
                const r = new FileReader();
                r.onload = () => resolve(r.result as string);
                r.onerror = () => reject(new Error("reader"));
                r.readAsDataURL(compressed);
            });

            let url = dataUrl;
            try {
                const fname = `${user.id}.jpg`;
                const { error: uerr } = await supabase.storage.from("avatars")
                    .upload(fname, compressed, { upsert: true, contentType: "image/jpeg" });
                if (!uerr) {
                    const { data } = supabase.storage.from("avatars").getPublicUrl(fname);
                    url = data.publicUrl + `?t=${Date.now()}`;
                }
            } catch {}

            await supabase.auth.updateUser({ data: { avatar_url: url } });
            await supabase.auth.getSession();
            setAvatarUrl(url);
            setAvatarPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            toast.success("Profile picture saved");
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploadingAvatar(false);
        }
    };

    // ─────── Navigation ───────

    const handleNext = async () => {
        if (!user) return;
        setLoading(true);
        try {
            if (step === 2) {
                if (!dob) { toast.error("Date of birth is required"); setLoading(false); return; }
                if (firstName.trim()) {
                    await supabase.auth.updateUser({ data: { first_name: firstName.trim() } });
                }
                await saveMemory("date_of_birth", dob);
                await saveMemory("marital_status", taxStatus);
            }
            if (step === 3) {
                if (!lifeStage) { toast.error("Pick a life stage"); setLoading(false); return; }
                await saveMemory("life_stage", lifeStage);
                await saveMemory("onboarded", "true");
            }
            if (step < TOTAL_STEPS) {
                setStep(step + 1);
            } else {
                navigate("/app");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSkip = async () => {
        if (step === 4) navigate("/app");
        else setStep(step + 1);
    };

    // Never render emails as names
    const sanitize = (s?: string | null): string | null => {
        if (!s) return null;
        const t = s.trim();
        if (!t || t.includes("@") || t.length > 40) return null;
        return t;
    };
    const displayName =
        sanitize(firstName) ||
        sanitize(user?.user_metadata?.first_name) ||
        "there";
    const initials = (sanitize(firstName) || user?.email || "?").slice(0, 2).toUpperCase();

    // ═══════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════

    return (
        <div className="relative min-h-screen overflow-hidden text-white" style={{ background: "#0a0a12" }}>
            {/* Aurora background — same vibe as AppLayout */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        background: `
                            radial-gradient(ellipse 90% 70% at 10% 0%, rgba(99, 102, 241, 0.8) 0%, transparent 55%),
                            radial-gradient(ellipse 75% 60% at 100% 20%, rgba(217, 70, 239, 0.65) 0%, transparent 60%),
                            radial-gradient(ellipse 110% 80% at 50% 100%, rgba(139, 92, 246, 0.75) 0%, transparent 60%),
                            linear-gradient(135deg, #1e1b4b 0%, #2d1065 45%, #3b0764 100%)
                        `,
                    }}
                />
                <div
                    className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(129, 140, 248, 0.5), transparent 70%)",
                        filter: "blur(90px)",
                        animation: "orb-drift 22s ease-in-out infinite",
                    }}
                />
                <div
                    className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(232, 121, 249, 0.45), transparent 70%)",
                        filter: "blur(90px)",
                        animation: "orb-drift 26s ease-in-out infinite reverse",
                    }}
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* ─────── Header: wordmark + progress ─────── */}
                <header className="flex items-center justify-between px-6 md:px-12 py-6">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center">
                            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: 18 }}>m</span>
                        </div>
                        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 600, fontSize: 22 }}>
                            myra
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                            Step {step} of {TOTAL_STEPS}
                        </span>
                        <div className="w-28 md:w-40 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-pink-400 rounded-full transition-all duration-700"
                                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                            />
                        </div>
                    </div>
                </header>

                {/* ─────── Main content ─────── */}
                <main className="flex-1 flex items-center justify-center px-6 pb-8">
                    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-12 items-start">
                        {/* LEFT: myra avatar + chat bubble */}
                        <div className="flex lg:flex-col gap-4 items-start lg:items-center lg:sticky lg:top-8">
                            <div className="relative flex-shrink-0">
                                <div
                                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary via-blue-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-primary/40"
                                    style={{ animation: "pulse-slow 4s ease-in-out infinite" }}
                                >
                                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                </div>
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: "radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent 70%)",
                                        filter: "blur(20px)",
                                        zIndex: -1,
                                    }}
                                />
                            </div>
                            <div className="text-sm uppercase tracking-[0.18em] text-white/60 font-bold hidden lg:block">myra</div>
                        </div>

                        {/* RIGHT: chat bubble + step content */}
                        <div className="space-y-6 min-w-0">
                            {/* Chat bubble */}
                            <div className="relative bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-3xl rounded-tl-sm p-5 md:p-6 shadow-xl animate-in fade-in slide-in-from-left-4 duration-500">
                                {typing ? (
                                    <div className="flex items-center gap-2 h-6">
                                        {[0, 1, 2].map((i) => (
                                            <span
                                                key={i}
                                                className="w-2 h-2 rounded-full bg-white/70"
                                                style={{ animation: `myra-dot-bounce 1.2s ease-in-out ${i * 0.15}s infinite` }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        {step === 1 && (
                                            <div className="space-y-2 animate-in fade-in duration-500">
                                                <p className="text-lg md:text-xl text-white leading-snug">
                                                    <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                                                        Hi {displayName} — I'm myra.
                                                    </span>
                                                </p>
                                                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                                                    I'm your AI fiduciary advisor. In the next couple of minutes, I'll get to know you well enough to build a plan tailored to exactly where you are in life. No paperwork, no 50-question forms.
                                                </p>
                                            </div>
                                        )}
                                        {step === 2 && (
                                            <div className="space-y-2 animate-in fade-in duration-500">
                                                <p className="text-lg md:text-xl text-white leading-snug">
                                                    <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                                                        Let's get the basics.
                                                    </span>
                                                </p>
                                                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                                                    Just a few things so I can calibrate everything to you. Your date of birth sets the retirement timeline, and your tax status shapes the strategy.
                                                </p>
                                            </div>
                                        )}
                                        {step === 3 && (
                                            <div className="space-y-2 animate-in fade-in duration-500">
                                                <p className="text-lg md:text-xl text-white leading-snug">
                                                    <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                                                        Where are you in your journey?
                                                    </span>
                                                </p>
                                                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                                                    Pick the life stage that fits you best. I'll tune your dashboard, recommendations, and priorities to match.
                                                </p>
                                            </div>
                                        )}
                                        {step === 4 && (
                                            <div className="space-y-2 animate-in fade-in duration-500">
                                                <p className="text-lg md:text-xl text-white leading-snug">
                                                    <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                                                        You're almost there.
                                                    </span>
                                                </p>
                                                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                                                    To give you perfect advice, I need to see the whole board. Next, we'll securely link your accounts with read-only access so I can build your real net worth, balance sheet, and retirement forecast.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Step body */}
                            <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <p className="text-white/70 text-sm">When you're ready, press <span className="text-white font-bold">Begin</span> and I'll walk you through it.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {[
                                                { label: "Takes 2 minutes", sub: "Promise" },
                                                { label: "Fully private", sub: "Bank-level security" },
                                                { label: "No paperwork", sub: "Conversational only" },
                                            ].map((c) => (
                                                <div key={c.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                                    <p className="text-sm font-bold text-white">{c.label}</p>
                                                    <p className="text-[11px] text-white/60 mt-0.5">{c.sub}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-5">
                                        {/* Avatar upload */}
                                        <div className="flex items-center gap-4 pb-5 border-b border-white/10">
                                            <div className="relative group flex-shrink-0">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 bg-black/40 flex items-center justify-center">
                                                    {avatarPreview ? (
                                                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : avatarUrl ? (
                                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xl font-bold text-white/40">{initials}</span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity cursor-pointer"
                                                >
                                                    <Camera className="w-5 h-5 text-white" />
                                                </button>
                                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white">Profile Picture</p>
                                                <p className="text-xs text-white/50 mt-0.5">Optional · You can skip and add later</p>
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    {avatarPreview ? (
                                                        <>
                                                            <button type="button" onClick={handleAvatarUpload} disabled={uploadingAvatar} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5">
                                                                {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                                                Save
                                                            </button>
                                                            <button type="button" onClick={() => { setAvatarPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="px-3 py-1.5 border border-white/10 rounded-lg text-xs font-semibold text-white/60 hover:text-white flex items-center gap-1.5">
                                                                <X className="w-3 h-3" />
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 border border-white/10 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5">
                                                            {avatarUrl ? "Change" : "Upload"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 block">
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    placeholder="Alex"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 block">
                                                    Date of Birth <span className="text-red-400/80">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={dob}
                                                    onChange={(e) => setDob(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 block">
                                                    Tax Filing Status
                                                </label>
                                                <select
                                                    value={taxStatus}
                                                    onChange={(e) => setTaxStatus(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 appearance-none transition-all text-sm"
                                                >
                                                    {TAX_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {LIFE_STAGES.map((s) => {
                                            const Icon = s.icon;
                                            const selected = lifeStage === s.id;
                                            return (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setLifeStage(s.id)}
                                                    className={`group text-left rounded-2xl p-5 border-2 transition-all cursor-pointer ${
                                                        selected
                                                            ? "bg-white/10 border-white shadow-xl"
                                                            : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.08]"
                                                    }`}
                                                    style={selected ? { boxShadow: `0 0 0 3px ${s.color}30, 0 12px 32px rgba(0,0,0,0.4)` } : undefined}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                            style={{ background: `${s.color}22`, border: `1px solid ${s.color}55` }}
                                                        >
                                                            <Icon className="w-5 h-5" style={{ color: s.color }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-base font-bold text-white">{s.title}</p>
                                                                {selected && (
                                                                    <span
                                                                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                                                        style={{ background: s.color }}
                                                                    >
                                                                        <Check className="w-3 h-3 text-white" />
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] uppercase tracking-wider font-bold mt-0.5" style={{ color: s.color }}>
                                                                {s.subtitle}
                                                            </p>
                                                            <p className="text-sm text-white/70 mt-2 leading-snug">
                                                                {s.desc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { label: "🔒", title: "Bank-level encryption", sub: "256-bit AES via Plaid" },
                                                { label: "👀", title: "Read-only", sub: "We can't move money" },
                                                { label: "⚡", title: "Instant setup", sub: "Most users link in 60s" },
                                                { label: "✋", title: "Manual fallback", sub: "Bank not supported? Enter manually." },
                                            ].map((c) => (
                                                <div key={c.title} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                                                    <span className="text-xl flex-shrink-0">{c.label}</span>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{c.title}</p>
                                                        <p className="text-[11px] text-white/60 mt-0.5">{c.sub}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 rounded-2xl p-5">
                                            <p className="text-sm text-white/90 leading-relaxed">
                                                Next up: I'll drop you on your dashboard. From there, click <span className="font-bold text-white">Link Accounts</span> when you're ready — or explore first and come back. Either way, your plan is already tailored to the answers you just gave me.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Nav buttons */}
                            <div className="flex items-center justify-between gap-3 pt-2">
                                <button
                                    onClick={handleBack}
                                    disabled={step === 1}
                                    className="px-4 py-2.5 text-sm font-semibold text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <div className="flex items-center gap-3">
                                    {step < TOTAL_STEPS && step > 1 && (
                                        <button
                                            onClick={handleSkip}
                                            className="text-xs font-semibold text-white/50 hover:text-white transition-colors"
                                        >
                                            Skip for now
                                        </button>
                                    )}
                                    <button
                                        onClick={handleNext}
                                        disabled={loading}
                                        className="px-7 py-3 bg-white text-black hover:bg-white/90 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-2xl disabled:opacity-60"
                                    >
                                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {step === 1 && "Begin"}
                                        {step === 2 && "Continue"}
                                        {step === 3 && "Continue"}
                                        {step === 4 && "Go to Dashboard"}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
