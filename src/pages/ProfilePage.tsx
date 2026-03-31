import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
    User, Calendar, MapPin, ReceiptText, Users, Clock, 
    Loader2, Save, CheckCircle2, Shield, Edit3
} from "lucide-react";

interface UserMemory {
    category: string;
    fact: string;
}

const FIELD_CONFIG = [
    { category: "legal_name", label: "Full Name", icon: User, type: "text", placeholder: "John Doe" },
    { category: "date_of_birth", label: "Date of Birth", icon: Calendar, type: "date", placeholder: "" },
    { category: "state", label: "State of Residence", icon: MapPin, type: "select", placeholder: "Select State" },
    { category: "marital_status", label: "Tax Filing Status", icon: ReceiptText, type: "select", placeholder: "" },
    { category: "spouse_age", label: "Spouse's Age", icon: Users, type: "number", placeholder: "e.g. 58" },
    { category: "retirement_date", label: "Target Retirement Age", icon: Clock, type: "number", placeholder: "e.g. 65" },
];

const STATES = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
    "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
    "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
    "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const TAX_STATUSES = ["Single", "Married Filing Jointly", "Married Filing Separately", "Head of Household"];

export default function ProfilePage() {
    const { user } = useAuth();
    const [memories, setMemories] = useState<Record<string, string>>({});
    const [editing, setEditing] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

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
            }
        } catch (err) {
            console.error("Failed to fetch profile data:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMemories();
    }, [fetchMemories]);

    const handleSave = async (category: string) => {
        if (!user || !editValue.trim()) return;
        setSaving(true);
        try {
            await supabase.from('user_memory').upsert({
                user_id: user.id,
                category,
                fact: editValue.trim(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, category' });
            
            setMemories(prev => ({ ...prev, [category]: editValue.trim() }));
            setEditing(null);
            setEditValue("");
            toast.success("Updated successfully");
        } catch {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const startEditing = (category: string) => {
        setEditing(category);
        setEditValue(memories[category] || "");
    };

    const completionCount = FIELD_CONFIG.filter(f => memories[f.category]?.trim()).length;
    const completionPct = Math.round((completionCount / FIELD_CONFIG.length) * 100);

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
                        const isEditing = editing === field.category;
                        const value = memories[field.category];
                        const Icon = field.icon;

                        // Hide spouse age if not married
                        if (field.category === "spouse_age" && !memories["marital_status"]?.includes("Married")) {
                            return null;
                        }

                        return (
                            <div 
                                key={field.category}
                                className="glass-premium rounded-[24px] p-6 border border-border bg-black/[0.02] dark:bg-white/[0.02] group relative hover:border-border transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Icon className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{field.label}</span>
                                    </div>
                                    {!isEditing && (
                                        <button 
                                            onClick={() => startEditing(field.category)}
                                            className="p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-black/[0.04] dark:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        {field.type === "select" && field.category === "state" ? (
                                            <select 
                                                value={editValue} 
                                                onChange={e => setEditValue(e.target.value)}
                                                className="flex-1 bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none text-sm"
                                            >
                                                <option value="" disabled>Select State</option>
                                                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        ) : field.type === "select" && field.category === "marital_status" ? (
                                            <select 
                                                value={editValue} 
                                                onChange={e => setEditValue(e.target.value)}
                                                className="flex-1 bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none text-sm"
                                            >
                                                {TAX_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        ) : (
                                            <input 
                                                type={field.type}
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') handleSave(field.category); }}
                                                placeholder={field.placeholder}
                                                className="flex-1 bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                                autoFocus
                                            />
                                        )}
                                        <button 
                                            onClick={() => handleSave(field.category)}
                                            disabled={saving}
                                            className="p-3 bg-primary hover:bg-primary/80 rounded-xl text-foreground transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => startEditing(field.category)}
                                        className="w-full text-left cursor-pointer"
                                    >
                                        {value ? (
                                            <p className="text-lg font-semibold text-foreground">{value}</p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground/50 italic">Click to add...</p>
                                        )}
                                    </button>
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
