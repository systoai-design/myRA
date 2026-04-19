import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Baby, X, Loader2, Trash2 } from "lucide-react";

export type FamilyKind = "partner" | "child";

interface Child {
    name: string;
    age: string;
}

interface Props {
    kind: FamilyKind;
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export default function FamilyMemberModal({ kind, open, onClose, onSaved }: Props) {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);

    // Partner fields
    const [partnerName, setPartnerName] = useState("");
    const [partnerAge, setPartnerAge] = useState("");
    const [partnerRetire, setPartnerRetire] = useState("");

    // Children list (min 1 row when editing)
    const [children, setChildren] = useState<Child[]>([{ name: "", age: "" }]);

    // Load existing values when modal opens
    useEffect(() => {
        if (!user || !open) return;
        (async () => {
            const { data } = await supabase
                .from("user_memory")
                .select("category, fact")
                .eq("user_id", user.id)
                .in("category", ["partner_name", "partner_age", "partner_retirement_age", "children"]);
            if (!data) return;
            const map = Object.fromEntries(data.map((m) => [m.category, m.fact]));
            if (kind === "partner") {
                setPartnerName(map.partner_name || "");
                setPartnerAge(map.partner_age || "");
                setPartnerRetire(map.partner_retirement_age || "");
            } else {
                try {
                    const parsed: Child[] = map.children ? JSON.parse(map.children) : [];
                    setChildren(parsed.length ? parsed : [{ name: "", age: "" }]);
                } catch {
                    setChildren([{ name: "", age: "" }]);
                }
            }
        })();
    }, [user, open, kind]);

    if (!open) return null;

    const handleSavePartner = async () => {
        if (!user) return;
        if (!partnerName.trim() && !partnerAge.trim()) {
            toast.error("Add at least a name or age");
            return;
        }
        setSaving(true);
        try {
            const rows: { category: string; fact: string }[] = [];
            if (partnerName.trim()) rows.push({ category: "partner_name", fact: partnerName.trim() });
            if (partnerAge.trim()) rows.push({ category: "partner_age", fact: partnerAge.trim() });
            if (partnerRetire.trim()) rows.push({ category: "partner_retirement_age", fact: partnerRetire.trim() });

            for (const r of rows) {
                await supabase.from("user_memory").upsert({
                    user_id: user.id,
                    category: r.category,
                    fact: r.fact,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "user_id, category" });
            }
            toast.success("Partner saved");
            onSaved();
            onClose();
        } catch {
            toast.error("Failed to save partner");
        } finally {
            setSaving(false);
        }
    };

    const handleRemovePartner = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await supabase.from("user_memory").delete()
                .eq("user_id", user.id)
                .in("category", ["partner_name", "partner_age", "partner_retirement_age"]);
            setPartnerName(""); setPartnerAge(""); setPartnerRetire("");
            toast.success("Partner removed");
            onSaved();
            onClose();
        } catch {
            toast.error("Failed to remove");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveChildren = async () => {
        if (!user) return;
        const filtered = children.filter((c) => c.name.trim() || c.age.trim());
        if (filtered.length === 0) {
            toast.error("Add at least one child");
            return;
        }
        setSaving(true);
        try {
            await supabase.from("user_memory").upsert({
                user_id: user.id,
                category: "children",
                fact: JSON.stringify(filtered),
                updated_at: new Date().toISOString(),
            }, { onConflict: "user_id, category" });
            toast.success(`${filtered.length} ${filtered.length === 1 ? "child" : "children"} saved`);
            onSaved();
            onClose();
        } catch {
            toast.error("Failed to save children");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveChildren = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await supabase.from("user_memory").delete()
                .eq("user_id", user.id)
                .eq("category", "children");
            setChildren([{ name: "", age: "" }]);
            toast.success("Children removed");
            onSaved();
            onClose();
        } catch {
            toast.error("Failed to remove");
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm";
    const labelClass = "text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2 block";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-[#0a0a12] border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-in zoom-in-95 fade-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 via-primary to-purple-500" />

                <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center">
                                {kind === "partner" ? <Users className="w-5 h-5 text-primary" /> : <Baby className="w-5 h-5 text-primary" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-serif text-white">
                                    {kind === "partner" ? "Add Your Partner" : "Add Your Children"}
                                </h3>
                                <p className="text-white/50 text-xs mt-0.5">
                                    {kind === "partner"
                                        ? "Help myra plan jointly for both of you."
                                        : "myra uses this to plan for college, legacy, and tax strategy."}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {kind === "partner" ? (
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Partner's Name</label>
                                <input
                                    type="text"
                                    value={partnerName}
                                    onChange={(e) => setPartnerName(e.target.value)}
                                    placeholder="Jane Doe"
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Age</label>
                                    <input
                                        type="number"
                                        value={partnerAge}
                                        onChange={(e) => setPartnerAge(e.target.value)}
                                        placeholder="e.g. 45"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Retirement Age</label>
                                    <input
                                        type="number"
                                        value={partnerRetire}
                                        onChange={(e) => setPartnerRetire(e.target.value)}
                                        placeholder="e.g. 65"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {children.map((c, i) => (
                                <div key={i} className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <label className={labelClass}>Name</label>
                                        <input
                                            type="text"
                                            value={c.name}
                                            onChange={(e) => {
                                                const copy = [...children];
                                                copy[i] = { ...copy[i], name: e.target.value };
                                                setChildren(copy);
                                            }}
                                            placeholder="Alex"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className={labelClass}>Age</label>
                                        <input
                                            type="number"
                                            value={c.age}
                                            onChange={(e) => {
                                                const copy = [...children];
                                                copy[i] = { ...copy[i], age: e.target.value };
                                                setChildren(copy);
                                            }}
                                            placeholder="12"
                                            className={inputClass}
                                        />
                                    </div>
                                    {children.length > 1 && (
                                        <button
                                            onClick={() => setChildren(children.filter((_, idx) => idx !== i))}
                                            className="h-[46px] w-[46px] flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                            aria-label="Remove child"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => setChildren([...children, { name: "", age: "" }])}
                                className="text-primary hover:text-primary/80 text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                + Add another child
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-2">
                        {((kind === "partner" && (partnerName || partnerAge)) ||
                            (kind === "child" && children.some((c) => c.name || c.age))) ? (
                            <button
                                onClick={kind === "partner" ? handleRemovePartner : handleRemoveChildren}
                                disabled={saving}
                                className="text-xs font-semibold text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <Trash2 className="w-3 h-3" />
                                Remove {kind === "partner" ? "partner" : "all children"}
                            </button>
                        ) : <span />}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 font-semibold text-white/60 hover:text-white transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={kind === "partner" ? handleSavePartner : handleSaveChildren}
                                disabled={saving}
                                className="px-6 py-2.5 bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 transition-opacity rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60 text-sm"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
