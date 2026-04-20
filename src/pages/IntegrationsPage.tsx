import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePlaid } from "@/hooks/usePlaid";
import { toast } from "sonner";
import {
    Link2, Plus, FileSpreadsheet, Check, Loader2,
    ArrowRight, DollarSign, Upload,
} from "lucide-react";
import LinkedAccountsCard from "@/components/dashboard/LinkedAccountsCard";

type IntegrationKind = "plaid" | "manual" | "csv";

const ASSET_TYPES = ["Pre-Tax (401k, IRA)", "Post-Tax (Brokerage)", "Tax-Free (Roth)"];

// ═══════════ INTEGRATION CARD ═══════════

interface AccentStyle {
    iconWrap: string;
    iconText: string;
    ctaText: string;
}

const ACCENTS: Record<string, AccentStyle> = {
    emerald: {
        iconWrap: "bg-emerald-500/10 border border-emerald-500/20",
        iconText: "text-emerald-400",
        ctaText: "text-emerald-400",
    },
    blue: {
        iconWrap: "bg-blue-500/10 border border-blue-500/20",
        iconText: "text-blue-400",
        ctaText: "text-blue-400",
    },
    amber: {
        iconWrap: "bg-amber-500/10 border border-amber-500/20",
        iconText: "text-amber-400",
        ctaText: "text-amber-400",
    },
};

interface IntegrationCardProps {
    id: IntegrationKind;
    title: string;
    subtitle: string;
    Icon: React.ElementType;
    accent: keyof typeof ACCENTS;
    connected: boolean;
    status?: string;
    cta: string;
    onClick: () => void;
    isActive: boolean;
}

function IntegrationCard({
    title, subtitle, Icon, accent, connected, status, cta, onClick, isActive,
}: IntegrationCardProps) {
    const a = ACCENTS[accent];
    return (
        <button
            onClick={onClick}
            className={`group relative text-left glass-card rounded-3xl p-6 transition-all duration-300 cursor-pointer active:scale-[0.98] hover:scale-[1.02] ${
                isActive ? "ring-2 ring-primary/40" : ""
            }`}
        >
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.iconWrap}`}>
                    <Icon className={`w-6 h-6 ${a.iconText}`} />
                </div>
                {connected && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        <Check className="w-3 h-3" /> Connected
                    </span>
                )}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-snug">{subtitle}</p>
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <span className="text-xs text-muted-foreground/80">{status}</span>
                <span className={`text-xs font-bold ${a.ctaText} flex items-center gap-1 group-hover:translate-x-0.5 transition-transform`}>
                    {cta}
                    <ArrowRight className="w-3 h-3" />
                </span>
            </div>
        </button>
    );
}

// ═══════════ MANUAL ENTRY PANEL ═══════════

function ManualEntryPanel({ onClose }: { onClose: () => void }) {
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [type, setType] = useState(ASSET_TYPES[0]);
    const [value, setValue] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!user || !name.trim() || !value.trim()) {
            toast.error("Fill in all fields");
            return;
        }
        setSaving(true);
        try {
            const categoryKey = `asset_${name.trim().toLowerCase().replace(/\s+/g, "_")}`;
            const fact = `${name}: $${Number(value).toLocaleString()} (${type})`;
            const { error } = await supabase.from("user_memory").upsert({
                user_id: user.id,
                category: categoryKey,
                fact,
                updated_at: new Date().toISOString(),
            }, { onConflict: "user_id, category" });
            if (error) throw error;
            toast.success(`Added ${name} to your portfolio`);
            setName(""); setValue(""); setType(ASSET_TYPES[0]);
            onClose();
        } catch {
            toast.error("Failed to save asset");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="glass-card rounded-3xl p-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-bold font-serif text-foreground">Add Asset Manually</h3>
                    <p className="text-xs text-muted-foreground">Enter any account that's not covered by Plaid.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Fidelity 401(k)"
                        className="w-full bg-black/[0.03] dark:bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary/50 text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-black/[0.03] dark:bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 text-sm appearance-none"
                    >
                        {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Balance ($)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="250000"
                            className="w-full bg-black/[0.03] dark:bg-black/40 border border-border rounded-xl pl-9 pr-4 py-3 text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary/50 text-sm"
                        />
                    </div>
                </div>
            </div>
            <div className="flex gap-3 justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm font-medium"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-xl transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Asset
                </button>
            </div>
        </div>
    );
}

// ═══════════ CSV UPLOAD PANEL (stub) ═══════════

function CsvUploadPanel({ onClose }: { onClose: () => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="glass-card rounded-3xl p-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold font-serif text-foreground">CSV Upload</h3>
                    <p className="text-xs text-muted-foreground">Upload a statement export to bulk-import holdings.</p>
                </div>
            </div>
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
            >
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-semibold text-foreground">Drop CSV here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supports most broker statement formats. (Coming soon.)</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={() => toast.info("CSV import is on the roadmap — tell myra about your accounts in chat for now.")}
                />
            </div>
            <div className="flex justify-end mt-4">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm font-medium"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

// ═══════════ PAGE ═══════════

export default function IntegrationsPage() {
    const { linkedAccounts } = usePlaid();
    const [activePanel, setActivePanel] = useState<IntegrationKind | null>(null);

    const plaidConnected = linkedAccounts.length > 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Integrations</h1>
                <p className="text-muted-foreground text-sm font-medium">
                    Connect your accounts, import data, and plug myra into the tools you already use.
                </p>
            </div>

            {/* Integration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <IntegrationCard
                    id="plaid"
                    title="Plaid"
                    subtitle="Securely link banks, brokerages, and 401(k) plans. Balances sync automatically."
                    Icon={Link2}
                    accent="emerald"
                    connected={plaidConnected}
                    status={plaidConnected
                        ? `${linkedAccounts.length} account${linkedAccounts.length !== 1 ? "s" : ""} synced`
                        : "Not connected"}
                    cta={plaidConnected ? "Manage" : "Connect"}
                    onClick={() => setActivePanel(activePanel === "plaid" ? null : "plaid")}
                    isActive={activePanel === "plaid"}
                />
                <IntegrationCard
                    id="manual"
                    title="Manual Entry"
                    subtitle="Add accounts that aren't covered by Plaid. Useful for crypto, real estate, private holdings."
                    Icon={Plus}
                    accent="blue"
                    connected={false}
                    status="Always available"
                    cta="Add Asset"
                    onClick={() => setActivePanel(activePanel === "manual" ? null : "manual")}
                    isActive={activePanel === "manual"}
                />
                <IntegrationCard
                    id="csv"
                    title="CSV Import"
                    subtitle="Bulk import your holdings from a broker statement export. Great for one-time migrations."
                    Icon={FileSpreadsheet}
                    accent="amber"
                    connected={false}
                    status="Coming soon"
                    cta="Upload"
                    onClick={() => setActivePanel(activePanel === "csv" ? null : "csv")}
                    isActive={activePanel === "csv"}
                />
            </div>

            {/* Active panel */}
            {activePanel === "plaid" && <LinkedAccountsCard />}
            {activePanel === "manual" && <ManualEntryPanel onClose={() => setActivePanel(null)} />}
            {activePanel === "csv" && <CsvUploadPanel onClose={() => setActivePanel(null)} />}

            {/* Roadmap hint */}
            <div className="glass-premium rounded-[32px] p-6 border border-border flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">More integrations on the roadmap</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Tax software, insurance providers, payroll, estate planning — all coming. Have one you want added? Tell myra.
                    </p>
                </div>
            </div>
        </div>
    );
}
