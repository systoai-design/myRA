import { useState, useEffect, useCallback } from "react";
import { useMyRAChat } from "@/hooks/useMyRAChat";
import { useAuth } from "@/contexts/AuthContext";
import { usePlaid } from "@/hooks/usePlaid";
import PortfolioOverview from "@/components/dashboard/PortfolioOverview";
import InitialProfileSurvey from "@/components/dashboard/InitialProfileSurvey";
import { supabase } from "@/integrations/supabase/client";
import { 
    MessageSquare, Link2, Plus, Building2, Landmark, 
    PiggyBank, Wallet, ArrowRight, CheckCircle2, Loader2,
    DollarSign, Trash2, RefreshCw, Shield, TrendingUp,
    Unplug, ExternalLink, BanknoteIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CONNECTABLE_APPS = [
    { name: "Fidelity", icon: Building2, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    { name: "Charles Schwab", icon: Landmark, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { name: "Vanguard", icon: PiggyBank, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { name: "401(k) Plan", icon: Wallet, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
];

const ASSET_TYPES = ["Pre-Tax (401k, IRA)", "Post-Tax (Brokerage)", "Tax-Free (Roth)"];

interface SavedAsset {
    category: string;
    name: string;
    value: number;
    type: string;
    rawFact: string;
}

function parseAssetFact(category: string, fact: string): SavedAsset | null {
    const match = fact.match(/^(.+?):\s*\$?([\d,]+(?:\.\d+)?)\s*(?:\((.+)\))?$/);
    if (!match) return null;
    const name = match[1].trim();
    const value = parseFloat(match[2].replace(/,/g, ''));
    const type = match[3]?.trim() || 'Other';
    if (isNaN(value)) return null;
    return { category, name, value, type, rawFact: fact };
}

const TYPE_STYLES: Record<string, { color: string; bg: string; icon: any }> = {
    'Pre-Tax': { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Wallet },
    'Post-Tax': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: TrendingUp },
    'Tax-Free': { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Shield },
    'Other': { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: DollarSign },
};

function getTypeStyle(type: string) {
    const lower = type.toLowerCase();
    if (lower.includes('pre-tax') || lower.includes('401k') || lower.includes('ira') || lower.includes('traditional')) return TYPE_STYLES['Pre-Tax'];
    if (lower.includes('post-tax') || lower.includes('brokerage') || lower.includes('taxable')) return TYPE_STYLES['Post-Tax'];
    if (lower.includes('tax-free') || lower.includes('roth')) return TYPE_STYLES['Tax-Free'];
    return TYPE_STYLES['Other'];
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

// ═══════════ LINKED ACCOUNTS SECTION (Plaid) ═══════════
function LinkedAccountsSection() {
    const { linkedAccounts, linkedInvestments, isLinking, isLoadingAccounts, openPlaidLink, readyToLink, fetchAccounts, removeItem } = usePlaid();
    const [removingId, setRemovingId] = useState<string | null>(null);

    // Group accounts by institution
    const institutions = linkedAccounts.reduce<Record<string, typeof linkedAccounts>>((acc, acct) => {
        const key = acct.plaid_item_id;
        if (!acc[key]) acc[key] = [];
        acc[key].push(acct);
        return acc;
    }, {});

    const totalLinkedBalance = linkedAccounts.reduce((sum, a) => sum + (a.balances.current || 0), 0);

    const handleRemove = async (itemId: string, name: string) => {
        setRemovingId(itemId);
        await removeItem(itemId, name);
        setRemovingId(null);
    };

    const accountTypeIcon = (type: string) => {
        switch (type) {
            case 'investment': return TrendingUp;
            case 'depository': return BanknoteIcon;
            case 'credit': return Wallet;
            default: return DollarSign;
        }
    };

    return (
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-600/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Linked Accounts</h2>
                        <p className="text-muted-foreground text-sm">
                            {linkedAccounts.length > 0
                                ? `${Object.keys(institutions).length} institution${Object.keys(institutions).length !== 1 ? 's' : ''} linked`
                                : "Securely connect your bank and brokerage accounts."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {linkedAccounts.length > 0 && (
                            <button onClick={fetchAccounts} className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer" title="Refresh">
                                <RefreshCw className={`w-4 h-4 ${isLoadingAccounts ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                        <button
                            onClick={() => openPlaidLink()}
                            disabled={isLinking}
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:cursor-not-allowed"
                        >
                            {isLinking ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting...</>
                            ) : !readyToLink ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...</>
                            ) : (
                                <><Link2 className="w-3.5 h-3.5" /> Connect Account</>
                            )}
                        </button>
                    </div>
                </div>

                {isLoadingAccounts && linkedAccounts.length === 0 ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                ) : linkedAccounts.length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(institutions).map(([itemId, accounts]) => {
                            const instName = accounts[0]?.institution_name || 'Unknown Institution';
                            const instTotal = accounts.reduce((s, a) => s + (a.balances.current || 0), 0);
                            return (
                                <div key={itemId} className="rounded-2xl border border-border overflow-hidden">
                                    {/* Institution Header */}
                                    <div className="flex items-center justify-between px-5 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-b border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                <Building2 className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{instName}</p>
                                                <p className="text-[10px] text-muted-foreground tabular-nums">{accounts.length} account{accounts.length !== 1 ? 's' : ''} · {formatCurrency(instTotal)}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(itemId, instName)}
                                            disabled={removingId === itemId}
                                            className="p-2 text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                                            title="Disconnect institution"
                                        >
                                            {removingId === itemId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unplug className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {/* Account List */}
                                    <div className="divide-y divide-border/50">
                                        {accounts.map((acct) => {
                                            const Icon = accountTypeIcon(acct.type);
                                            return (
                                                <div key={acct.account_id} className="flex items-center justify-between px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Icon className="w-4 h-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">{acct.name}</p>
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                                {acct.subtype || acct.type}{acct.mask ? ` · ****${acct.mask}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(acct.balances.current || 0)}</p>
                                                        {acct.balances.available != null && acct.balances.available !== acct.balances.current && (
                                                            <p className="text-[10px] text-muted-foreground tabular-nums">Available: {formatCurrency(acct.balances.available)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Total linked balance */}
                        <div className="flex items-center justify-between px-2 pt-2">
                            <p className="text-xs text-muted-foreground font-medium">Total Linked Balance</p>
                            <p className="text-lg font-bold text-emerald-400 tabular-nums">{formatCurrency(totalLinkedBalance)}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
                            <Link2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-base font-bold text-foreground mb-1">No Accounts Linked</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Click "Connect Account" above to securely link your bank or brokerage. Credentials are handled by Plaid and never touch our servers.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PortfolioPage() {
    const [showSurvey, setShowSurvey] = useState(false);
    const { buckets, activeChart } = useMyRAChat();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profileComplete, setProfileComplete] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualAsset, setManualAsset] = useState({ name: "", type: ASSET_TYPES[0], value: "" });
    const [saving, setSaving] = useState(false);
    const [savedAssets, setSavedAssets] = useState<SavedAsset[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(true);
    const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

    // Load saved assets from user_memory
    const loadAssets = useCallback(async () => {
        if (!user) return;
        setLoadingAssets(true);
        try {
            const { data } = await supabase
                .from('user_memory')
                .select('category, fact')
                .eq('user_id', user.id)
                .like('category', 'asset_%');

            if (data) {
                const parsed = data
                    .map(m => parseAssetFact(m.category, m.fact))
                    .filter((a): a is SavedAsset => a !== null);
                setSavedAssets(parsed);
            }
        } catch (err) {
            console.error("Load assets error:", err);
        } finally {
            setLoadingAssets(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;
        // Check profile completion
        const checkProfile = async () => {
            const { data } = await supabase
                .from('user_memory')
                .select('category')
                .eq('user_id', user.id)
                .in('category', ['state', 'marital_status']);
            
            if (data && data.length >= 2) {
                setProfileComplete(true);
            }
        };
        checkProfile();
        loadAssets();
    }, [user, loadAssets]);

    const handleSaveManualAsset = async () => {
        if (!user || !manualAsset.name.trim() || !manualAsset.value.trim()) {
            toast.error("Please fill in all fields");
            return;
        }
        setSaving(true);
        try {
            const categoryKey = `asset_${manualAsset.name.trim().toLowerCase().replace(/\s+/g, '_')}`;
            const fact = `${manualAsset.name}: $${Number(manualAsset.value).toLocaleString()} (${manualAsset.type})`;
            const { error } = await supabase.from('user_memory').upsert({
                user_id: user.id,
                category: categoryKey,
                fact,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, category' });

            if (error) throw error;
            toast.success(`Added ${manualAsset.name} to your portfolio`);
            setManualAsset({ name: "", type: ASSET_TYPES[0], value: "" });
            setShowManualEntry(false);
            // Reload the assets list immediately
            await loadAssets();
        } catch (err) {
            console.error("Save asset error:", err);
            toast.error("Failed to save asset. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAsset = async (category: string, name: string) => {
        if (!user) return;
        setDeletingCategory(category);
        try {
            const { error } = await supabase
                .from('user_memory')
                .delete()
                .eq('user_id', user.id)
                .eq('category', category);
            
            if (error) throw error;
            toast.success(`Removed ${name} from portfolio`);
            await loadAssets();
        } catch (err) {
            console.error("Delete asset error:", err);
            toast.error("Failed to remove asset.");
        } finally {
            setDeletingCategory(null);
        }
    };

    const totalValue = savedAssets.reduce((sum, a) => sum + a.value, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Profile Survey Modal */}
            {showSurvey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#050810] border border-border rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 via-primary to-purple-500" />
                        <InitialProfileSurvey onComplete={() => setShowSurvey(false)} />
                    </div>
                </div>
            )}

            {/* Profile Calibration Banner */}
            {!profileComplete && (
                <div className="bg-gradient-to-r from-blue-900/40 to-primary/20 border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top duration-500">
                    <div>
                        <h4 className="text-sm font-bold text-foreground">Action Required: Calibration</h4>
                        <p className="text-xs text-blue-200 dark:text-blue-200 mt-1">Complete your profile so myra can generate accurate portfolio analysis.</p>
                    </div>
                    <button 
                        onClick={() => setShowSurvey(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-foreground text-xs font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/20 cursor-pointer"
                    >
                        Start Survey
                    </button>
                </div>
            )}

            {/* ═══════════ YOUR PORTFOLIO ═══════════ */}
            <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Your Portfolio</h2>
                            <p className="text-muted-foreground text-sm">
                                {savedAssets.length > 0 
                                    ? `${savedAssets.length} account${savedAssets.length !== 1 ? 's' : ''} totaling ${formatCurrency(totalValue)}`
                                    : "Add your assets to see them here."}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={loadAssets}
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${loadingAssets ? 'animate-spin' : ''}`} />
                            </button>
                            {savedAssets.length > 0 && (
                                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-lg font-bold tabular-nums">
                                    {formatCurrency(totalValue)}
                                </span>
                            )}
                        </div>
                    </div>

                    {loadingAssets ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : savedAssets.length > 0 ? (
                        <div className="space-y-2">
                            {savedAssets.map((asset) => {
                                const style = getTypeStyle(asset.type);
                                const Icon = style.icon;
                                const pct = totalValue > 0 ? Math.round((asset.value / totalValue) * 100) : 0;
                                return (
                                    <div key={asset.category} className="flex items-center justify-between p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-transparent hover:border-border/50 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-11 h-11 rounded-xl ${style.bg} flex items-center justify-center`}>
                                                <Icon className={`w-5 h-5 ${style.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{asset.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{asset.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-base font-bold text-foreground tabular-nums">{formatCurrency(asset.value)}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold tabular-nums">{pct}% of total</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAsset(asset.category, asset.name)}
                                                disabled={deletingCategory === asset.category}
                                                className="p-2 text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer disabled:opacity-50"
                                                title="Remove asset"
                                            >
                                                {deletingCategory === asset.category ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <Wallet className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">No Assets Yet</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mb-6">
                                Add your retirement accounts manually below, or tell myra about them in chat.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowManualEntry(true)} 
                                    className="px-5 py-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Manually
                                </button>
                                <button
                                    onClick={() => navigate('/app/chat')} 
                                    className="px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" /> Tell myra
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════ LINKED ACCOUNTS (Plaid) ═══════════ */}
            <LinkedAccountsSection />

            {/* Manual Entry Section */}
            <div className="glass-premium rounded-[32px] p-8 border border-border bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold font-serif text-foreground">Add Assets Manually</h3>
                            <p className="text-xs text-muted-foreground">Quick add your accounts and balances.</p>
                        </div>
                    </div>
                    {!showManualEntry && (
                        <button 
                            onClick={() => setShowManualEntry(true)}
                            className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Asset
                        </button>
                    )}
                </div>

                {showManualEntry && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account Name</label>
                                <input 
                                    value={manualAsset.name}
                                    onChange={e => setManualAsset({...manualAsset, name: e.target.value})}
                                    placeholder="e.g. Fidelity 401(k)"
                                    className="w-full bg-black/[0.03] dark:bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account Type</label>
                                <select 
                                    value={manualAsset.type}
                                    onChange={e => setManualAsset({...manualAsset, type: e.target.value})}
                                    className="w-full bg-black/[0.03] dark:bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm appearance-none"
                                >
                                    {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Balance ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                    <input 
                                        type="number"
                                        value={manualAsset.value}
                                        onChange={e => setManualAsset({...manualAsset, value: e.target.value})}
                                        placeholder="250,000"
                                        className="w-full bg-black/[0.03] dark:bg-black/40 border border-border rounded-xl pl-9 pr-4 py-3 text-foreground placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={() => setShowManualEntry(false)}
                                className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm font-medium cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveManualAsset}
                                disabled={saving}
                                className="px-6 py-2.5 bg-primary hover:bg-primary/80 text-foreground font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 text-sm disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Save Asset
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Portfolio Visualization */}
            <div className="min-h-[500px]">
                <PortfolioOverview buckets={buckets} activeChart={activeChart} />
            </div>

            {/* CTA to Chat */}
            <div className="glass-premium rounded-[32px] p-8 border border-border bg-black/[0.02] dark:bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold font-serif text-foreground mb-0.5">Prefer to tell myra?</h3>
                        <p className="text-sm text-muted-foreground">Describe your accounts in chat and she'll update your portfolio automatically.</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/app/chat')}
                    className="px-6 py-3 bg-primary hover:bg-primary/80 text-foreground font-semibold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer active:scale-[0.97] whitespace-nowrap"
                >
                    Open myra Chat
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
