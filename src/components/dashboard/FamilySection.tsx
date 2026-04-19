import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Baby, UserPlus, Check, Pencil } from "lucide-react";
import FamilyMemberModal, { FamilyKind } from "./FamilyMemberModal";

interface Child { name: string; age: string; }

interface FamilyState {
    partnerName: string;
    partnerAge: string;
    children: Child[];
}

const BENEFITS = [
    "See spend across your household",
    "Plan joint retirement timelines",
    "Optimize taxes for the whole family",
    "Coordinate legacy & 529 plans",
];

export default function FamilySection() {
    const { user } = useAuth();
    const [state, setState] = useState<FamilyState>({ partnerName: "", partnerAge: "", children: [] });
    const [modalKind, setModalKind] = useState<FamilyKind | null>(null);

    const load = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from("user_memory")
            .select("category, fact")
            .eq("user_id", user.id)
            .in("category", ["partner_name", "partner_age", "children"]);
        if (!data) return;
        const map = Object.fromEntries(data.map((m) => [m.category, m.fact]));
        let children: Child[] = [];
        try {
            children = map.children ? JSON.parse(map.children) : [];
        } catch {
            children = [];
        }
        setState({
            partnerName: map.partner_name || "",
            partnerAge: map.partner_age || "",
            children,
        });
    }, [user]);

    useEffect(() => { load(); }, [load]);

    const hasPartner = !!state.partnerName || !!state.partnerAge;
    const hasChildren = state.children.length > 0;

    const partnerLabel = hasPartner
        ? `${state.partnerName || "Partner"}${state.partnerAge ? `, ${state.partnerAge}` : ""}`
        : null;

    const childrenLabel = hasChildren
        ? `${state.children.length} ${state.children.length === 1 ? "child" : "children"}`
        : null;

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 rounded-3xl overflow-hidden border border-border">
                {/* ─────── LEFT: prompt + CTAs ─────── */}
                <div className="bg-background/60 backdrop-blur-xl p-8 flex flex-col justify-between gap-6">
                    <div className="space-y-2">
                        <h3
                            className="text-3xl font-serif font-bold text-foreground tracking-tight"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            Add your family to myra.
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                            Get the full picture of your household finances. myra plans for the people you plan for.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        {/* Partner row */}
                        <button
                            onClick={() => setModalKind("partner")}
                            className="group flex items-center justify-between gap-4 bg-white/90 hover:bg-white dark:bg-white dark:hover:bg-white/90 text-black rounded-xl px-4 py-3 transition-all active:scale-[0.98] shadow-sm"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center flex-shrink-0">
                                    {hasPartner ? <Check className="w-4 h-4 text-emerald-600" /> : <Users className="w-4 h-4" />}
                                </div>
                                <div className="text-left min-w-0">
                                    <p className="text-sm font-bold">
                                        {hasPartner ? "Partner added" : "Add Partner"}
                                    </p>
                                    {partnerLabel && (
                                        <p className="text-xs text-black/60 truncate">{partnerLabel}</p>
                                    )}
                                </div>
                            </div>
                            {hasPartner ? (
                                <Pencil className="w-4 h-4 text-black/50 group-hover:text-black flex-shrink-0" />
                            ) : (
                                <UserPlus className="w-4 h-4 text-black/50 flex-shrink-0" />
                            )}
                        </button>

                        {/* Children row */}
                        <button
                            onClick={() => setModalKind("child")}
                            className="group flex items-center justify-between gap-4 bg-white/10 hover:bg-white/15 border border-white/10 text-foreground rounded-xl px-4 py-3 transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                    {hasChildren ? <Check className="w-4 h-4 text-emerald-400" /> : <Baby className="w-4 h-4" />}
                                </div>
                                <div className="text-left min-w-0">
                                    <p className="text-sm font-bold">
                                        {hasChildren ? "Children added" : "Add Children"}
                                    </p>
                                    {childrenLabel && (
                                        <p className="text-xs text-muted-foreground truncate">
                                            {childrenLabel}
                                            {state.children.length > 0 && state.children[0].name && ` · ${state.children.map((c) => c.name).filter(Boolean).join(", ")}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {hasChildren ? (
                                <Pencil className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                            ) : (
                                <UserPlus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                        </button>
                    </div>
                </div>

                {/* ─────── RIGHT: benefits card ─────── */}
                <div
                    className="relative p-8 flex flex-col justify-between gap-5 overflow-hidden"
                    style={{
                        background: "linear-gradient(135deg, #065f46 0%, #047857 55%, #0f766e 100%)",
                    }}
                >
                    <div
                        aria-hidden
                        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
                        style={{ background: "rgba(16, 185, 129, 0.4)" }}
                    />
                    <div
                        aria-hidden
                        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
                        style={{ background: "rgba(6, 182, 212, 0.25)" }}
                    />

                    <div className="relative flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-white">Manage your money as a family</h4>
                    </div>

                    <div className="relative h-px bg-white/20" />

                    <ul className="relative grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        {BENEFITS.map((b) => (
                            <li key={b} className="flex items-start gap-2 text-sm text-white/95 leading-snug">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 flex-shrink-0" />
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <FamilyMemberModal
                kind={modalKind ?? "partner"}
                open={modalKind !== null}
                onClose={() => setModalKind(null)}
                onSaved={load}
            />
        </>
    );
}
