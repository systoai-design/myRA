import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
    User, Calendar, MapPin, ReceiptText, Users, Clock,
    Loader2, CheckCircle2, Camera, Upload, X,
} from 'lucide-react';

type SaveState = "idle" | "saving" | "saved";

const STATES = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
    "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
    "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
    "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const TAX_STATUSES = [
    "Single",
    "Married Filing Jointly",
    "Married Filing Separately",
    "Head of Household",
];

// Map form field -> category stored in user_memory
const FIELD_CATEGORY: Record<string, string> = {
    name: 'legal_name',
    dob: 'date_of_birth',
    state: 'state',
    tax_status: 'marital_status',
    spouse_age: 'spouse_age',
    retirement_age: 'retirement_date',
};

export default function InitialProfileSurvey({ onComplete }: { onComplete: () => void }) {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        state: '',
        tax_status: 'Single',
        spouse_age: '',
        retirement_age: '',
    });
    const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
    const savedTimers = useRef<Record<string, number>>({});
    const lastSaved = useRef<Record<string, string>>({});
    const [ghlSyncing, setGhlSyncing] = useState(false);

    // Avatar
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Load existing memory on mount so returning users see what they already entered
    useEffect(() => {
        if (!user) return;
        (async () => {
            const { data } = await supabase
                .from('user_memory')
                .select('category, fact')
                .eq('user_id', user.id);
            if (!data) return;
            const next: typeof formData = { ...formData };
            data.forEach((m: { category: string; fact: string }) => {
                if (m.category === 'legal_name') next.name = m.fact;
                if (m.category === 'date_of_birth') next.dob = m.fact;
                if (m.category === 'state') next.state = m.fact;
                if (m.category === 'marital_status') next.tax_status = m.fact;
                if (m.category === 'spouse_age') next.spouse_age = m.fact;
                if (m.category === 'retirement_date') next.retirement_age = m.fact;
                lastSaved.current[m.category] = m.fact;
            });
            setFormData(next);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        const timers = savedTimers.current;
        return () => Object.values(timers).forEach((t) => window.clearTimeout(t));
    }, []);

    const saveField = useCallback(async (fieldName: string, value: string) => {
        if (!user) return;
        const category = FIELD_CATEGORY[fieldName];
        if (!category) return;
        const trimmed = value.trim();

        if (trimmed === (lastSaved.current[category] || '').trim()) return;

        if (!trimmed) {
            setSaveStates((s) => ({ ...s, [fieldName]: 'saving' }));
            try {
                await supabase.from('user_memory').delete()
                    .eq('user_id', user.id).eq('category', category);
                lastSaved.current[category] = '';
                setSaveStates((s) => ({ ...s, [fieldName]: 'saved' }));
                savedTimers.current[fieldName] = window.setTimeout(
                    () => setSaveStates((s) => ({ ...s, [fieldName]: 'idle' })),
                    1800
                );
            } catch {
                toast.error("Failed to save");
                setSaveStates((s) => ({ ...s, [fieldName]: 'idle' }));
            }
            return;
        }

        setSaveStates((s) => ({ ...s, [fieldName]: 'saving' }));
        try {
            await supabase.from('user_memory').upsert({
                user_id: user.id,
                category,
                fact: trimmed,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id, category' });
            lastSaved.current[category] = trimmed;
            setSaveStates((s) => ({ ...s, [fieldName]: 'saved' }));
            savedTimers.current[fieldName] = window.setTimeout(
                () => setSaveStates((s) => ({ ...s, [fieldName]: 'idle' })),
                1800
            );
        } catch {
            toast.error("Failed to save");
            setSaveStates((s) => ({ ...s, [fieldName]: 'idle' }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((f) => ({ ...f, [name]: value }));
        // For selects, save immediately on change
        if (e.target.tagName === 'SELECT') {
            saveField(name, value);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        saveField(e.target.name, e.target.value);
    };

    // ═══════════ Avatar handlers ═══════════

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
            toast.success("Profile picture saved");
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

    // ═══════════ GHL sync on Done ═══════════

    const handleDone = async () => {
        if (!user) { onComplete(); return; }
        // Flush any pending blur that might not have fired
        setGhlSyncing(true);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            await supabase.functions.invoke('sync-ghl-contact', {
                body: { userId: user.id },
                headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
            });
        } catch (err) {
            console.error("GHL Sync Error:", err);
            // Don't block user on GHL failure
        } finally {
            setGhlSyncing(false);
            onComplete();
        }
    };

    // ═══════════ Helpers ═══════════

    const savedFieldCount = Object.values(lastSaved.current).filter(Boolean).length
        + (avatarUrl ? 1 : 0);

    const initials = (formData.name || user?.user_metadata?.first_name || user?.email || '?')
        .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    const renderIndicator = (fieldName: string) => {
        const state = saveStates[fieldName];
        if (state === 'saving') {
            return <Loader2 className="w-3 h-3 text-white/40 animate-spin" />;
        }
        if (state === 'saved') {
            return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
        }
        return null;
    };

    const labelClass = "text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 border-none";
    const inputClass = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors";

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold font-serif text-white tracking-tight">Quick Calibration</h3>
                    <p className="text-white/50 text-sm">Each field saves automatically as you type. Skip anything you'd rather set later.</p>
                </div>
                <div className="flex-shrink-0 text-right">
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Saved</div>
                    <div className="text-base font-bold text-emerald-400">{savedFieldCount}/7</div>
                </div>
            </div>

            {/* ───── Avatar ───── */}
            <div className="flex items-center gap-5">
                <div className="relative group">
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
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        className="hidden"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">Profile Picture</p>
                    <p className="text-xs text-white/50 mt-0.5">JPG, PNG or GIF. Max 5MB.</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {avatarPreview ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleAvatarUpload}
                                    disabled={uploadingAvatar}
                                    className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAvatarPreview(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="px-3 py-1.5 border border-white/10 rounded-lg text-xs font-semibold text-white/60 hover:text-white transition-colors flex items-center gap-1.5"
                                >
                                    <X className="w-3 h-3" />
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-3 py-1.5 border border-white/10 rounded-lg text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    {avatarUrl ? "Change" : "Upload"}
                                </button>
                                {avatarUrl && (
                                    <button
                                        type="button"
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

            {/* ───── Fields ───── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className={labelClass}>
                            <User className="w-3.5 h-3.5" /> Full Name
                        </label>
                        {renderIndicator('name')}
                    </div>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                        placeholder="John Doe"
                        className={inputClass}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className={labelClass}>
                            <Calendar className="w-3.5 h-3.5" /> Date of Birth
                        </label>
                        {renderIndicator('dob')}
                    </div>
                    <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={inputClass}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className={labelClass}>
                            <ReceiptText className="w-3.5 h-3.5" /> Tax Filing Status
                        </label>
                        {renderIndicator('tax_status')}
                    </div>
                    <select
                        name="tax_status"
                        value={formData.tax_status}
                        onChange={handleChange}
                        className={`${inputClass} appearance-none`}
                    >
                        {TAX_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {formData.tax_status.includes('Married') && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className={labelClass}>
                                <Users className="w-3.5 h-3.5" /> Spouse's Age
                            </label>
                            {renderIndicator('spouse_age')}
                        </div>
                        <input
                            type="number"
                            name="spouse_age"
                            value={formData.spouse_age}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                            placeholder="e.g. 58"
                            className={inputClass}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className={labelClass}>
                            <MapPin className="w-3.5 h-3.5" /> State of Residence
                        </label>
                        {renderIndicator('state')}
                    </div>
                    <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`${inputClass} appearance-none`}
                    >
                        <option value="" disabled>Select State</option>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className={labelClass}>
                            <Clock className="w-3.5 h-3.5" /> Target Retirement Age
                        </label>
                        {renderIndicator('retirement_age')}
                    </div>
                    <input
                        type="number"
                        name="retirement_age"
                        value={formData.retirement_age}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                        placeholder="e.g. 65"
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={handleDone}
                    disabled={ghlSyncing}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 transition-opacity rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60"
                >
                    {ghlSyncing ? <><Loader2 className="w-4 h-4 animate-spin" /> Finishing…</> : "Done"}
                </button>
            </div>
        </div>
    );
}
