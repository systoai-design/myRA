import { useState, useEffect } from "react";
import { useMyRAChat } from "@/hooks/useMyRAChat";
import { useAuth } from "@/contexts/AuthContext";
import PortfolioOverview from "@/components/dashboard/PortfolioOverview";
import InitialProfileSurvey from "@/components/dashboard/InitialProfileSurvey";
import { supabase } from "@/integrations/supabase/client";
import { 
    MessageSquare, Link2, Plus, Building2, Landmark, 
    PiggyBank, Wallet, ArrowRight, CheckCircle2, Loader2,
    DollarSign
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

export default function PortfolioPage() {
    const [showSurvey, setShowSurvey] = useState(false);
    const { buckets, activeChart } = useMyRAChat();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profileComplete, setProfileComplete] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualAsset, setManualAsset] = useState({ name: "", type: ASSET_TYPES[0], value: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
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
    }, [user]);

    const handleSaveManualAsset = async () => {
        if (!user || !manualAsset.name.trim() || !manualAsset.value.trim()) {
            toast.error("Please fill in all fields");
            return;
        }
        setSaving(true);
        try {
            // Use a unique category key per asset based on normalized name
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
        } catch (err) {
            console.error("Save asset error:", err);
            toast.error("Failed to save asset. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Profile Survey Modal */}
            {showSurvey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#050810] border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 via-primary to-purple-500" />
                        <InitialProfileSurvey onComplete={() => setShowSurvey(false)} />
                    </div>
                </div>
            )}

            {/* Profile Calibration Banner */}
            {!profileComplete && (
                <div className="bg-gradient-to-r from-blue-900/40 to-primary/20 border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top duration-500">
                    <div>
                        <h4 className="text-sm font-bold text-white">Action Required: Calibration</h4>
                        <p className="text-xs text-blue-200 mt-1">Complete your profile so MyRA can generate accurate portfolio analysis.</p>
                    </div>
                    <button 
                        onClick={() => setShowSurvey(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/20 cursor-pointer"
                    >
                        Start Survey
                    </button>
                </div>
            )}

            {/* Connect Your Accounts */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-white mb-1">Connect Your Accounts</h2>
                        <p className="text-white/40 text-sm">Link your financial institutions for automatic portfolio tracking.</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                        Coming Soon
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {CONNECTABLE_APPS.map((app) => {
                        const Icon = app.icon;
                        return (
                            <button
                                key={app.name}
                                onClick={() => toast.info(`${app.name} integration coming soon! For now, tell MyRA about your ${app.name} assets in chat.`)}
                                className={`glass-premium rounded-[24px] p-6 border ${app.border} ${app.bg} flex flex-col items-center gap-4 hover:scale-[1.02] transition-all cursor-pointer group`}
                            >
                                <div className={`w-14 h-14 rounded-2xl ${app.bg} flex items-center justify-center`}>
                                    <Icon className={`w-7 h-7 ${app.color}`} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-white">{app.name}</p>
                                    <p className="text-[10px] text-white/30 mt-1 flex items-center gap-1 justify-center">
                                        <Link2 className="w-3 h-3" /> Connect
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Manual Entry Section */}
            <div className="glass-premium rounded-[32px] p-8 border border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold font-serif text-white">Add Assets Manually</h3>
                            <p className="text-xs text-white/40">Quick add your accounts and balances.</p>
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
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Account Name</label>
                                <input 
                                    value={manualAsset.name}
                                    onChange={e => setManualAsset({...manualAsset, name: e.target.value})}
                                    placeholder="e.g. Fidelity 401(k)"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Account Type</label>
                                <select 
                                    value={manualAsset.type}
                                    onChange={e => setManualAsset({...manualAsset, type: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors text-sm appearance-none"
                                >
                                    {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Balance ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input 
                                        type="number"
                                        value={manualAsset.value}
                                        onChange={e => setManualAsset({...manualAsset, value: e.target.value})}
                                        placeholder="250,000"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={() => setShowManualEntry(false)}
                                className="px-4 py-2 text-white/50 hover:text-white text-sm font-medium cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveManualAsset}
                                disabled={saving}
                                className="px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 text-sm disabled:opacity-50"
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
            <div className="glass-premium rounded-[32px] p-8 border border-white/5 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold font-serif text-white mb-0.5">Prefer to tell MyRA?</h3>
                        <p className="text-sm text-white/40">Describe your accounts in chat and she'll update your portfolio automatically.</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/app/chat')}
                    className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer active:scale-[0.97] whitespace-nowrap"
                >
                    Open MyRA Chat
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
