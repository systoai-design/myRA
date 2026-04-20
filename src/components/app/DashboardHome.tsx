import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    CartesianGrid, 
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { 
    TrendingUp, 
    ArrowUpRight, 
    Clock,
    Activity,
    CheckCircle2,
    MessageSquare,
    BarChart3,
    User,
    Sparkles,
    Zap,
    ArrowRight,
    Shield,
    DollarSign,
    Wallet,
    Home,
    Target,
    Flame,
    Plus,
    Info,
    Link2,
} from "lucide-react";
import FamilySection from "@/components/dashboard/FamilySection";
import { displayName } from "@/lib/name";

// ═══════════════════════════════════════════
// TYPES & HELPERS
// ═══════════════════════════════════════════

interface ParsedAsset {
    name: string;
    value: number;
    type: string; // "Pre-Tax", "Post-Tax", "Tax-Free", or raw type string
    category: string;
}

interface UserProfile {
    retirementAge: string | null;
    state: string | null;
    maritalStatus: string | null;
    monthlyIncome: string | null;
    monthlyExpenses: string | null;
}

function parseAssetFact(category: string, fact: string): ParsedAsset | null {
    // Format: "Fidelity 401k: $250,000 (Pre-Tax (401k, IRA))"
    const match = fact.match(/^(.+?):\s*\$?([\d,]+(?:\.\d+)?)\s*(?:\((.+)\))?$/);
    if (!match) return null;
    
    const name = match[1].trim();
    const value = parseFloat(match[2].replace(/,/g, ''));
    const rawType = match[3]?.trim() || 'Other';
    
    // Normalize type
    let type = 'Other';
    const lower = rawType.toLowerCase();
    if (lower.includes('pre-tax') || lower.includes('401k') || lower.includes('ira') || lower.includes('traditional')) {
        type = 'Pre-Tax';
    } else if (lower.includes('post-tax') || lower.includes('brokerage') || lower.includes('taxable')) {
        type = 'Post-Tax';
    } else if (lower.includes('tax-free') || lower.includes('roth')) {
        type = 'Tax-Free';
    }
    
    if (isNaN(value)) return null;
    return { name, value, type, category };
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatCurrencyFull(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
}

// ═══════════════════════════════════════════
// CUSTOM TOOLTIP
// ═══════════════════════════════════════════

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card rounded-2xl px-4 py-3 shadow-2xl border border-border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                <p className="text-base font-bold text-foreground">{formatCurrencyFull(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

// ═══════════════════════════════════════════
// ALLOCATION COLORS
// ═══════════════════════════════════════════

const ALLOCATION_COLORS: Record<string, { bar: string; color: string; bg: string; border: string; icon: any }> = {
    'Pre-Tax': { bar: 'bg-blue-500', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/10', icon: Wallet },
    'Post-Tax': { bar: 'bg-emerald-500', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/10', icon: TrendingUp },
    'Tax-Free': { bar: 'bg-purple-500', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/10', icon: Shield },
    'Other': { bar: 'bg-amber-500', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/10', icon: Home },
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function DashboardHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string>("Investor");
    const [assets, setAssets] = useState<ParsedAsset[]>([]);
    const [profile, setProfile] = useState<UserProfile>({
        retirementAge: null,
        state: null,
        maritalStatus: null,
        monthlyIncome: null,
        monthlyExpenses: null,
    });
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setUserName(displayName(user, "Investor"));

        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Fetch all user memories
                const { data: memories } = await supabase
                    .from('user_memory')
                    .select('category, fact')
                    .eq('user_id', user.id);

                if (memories) {
                    // Refine the greeting once we have legal_name loaded
                    const legal = memories.find((m) => m.category === "legal_name")?.fact;
                    setUserName(displayName(user, "Investor", legal));
                    // Parse assets (categories starting with "asset_")
                    const parsedAssets: ParsedAsset[] = [];
                    const profileData: UserProfile = {
                        retirementAge: null,
                        state: null,
                        maritalStatus: null,
                        monthlyIncome: null,
                        monthlyExpenses: null,
                    };

                    memories.forEach(m => {
                        if (m.category.startsWith('asset_')) {
                            const parsed = parseAssetFact(m.category, m.fact);
                            if (parsed) parsedAssets.push(parsed);
                        }
                        // Profile fields
                        if (m.category === 'retirement_age') profileData.retirementAge = m.fact;
                        if (m.category === 'state') profileData.state = m.fact;
                        if (m.category === 'marital_status') profileData.maritalStatus = m.fact;
                        if (m.category === 'monthly_income') profileData.monthlyIncome = m.fact;
                        if (m.category === 'monthly_expenses') profileData.monthlyExpenses = m.fact;
                    });

                    setAssets(parsedAssets);
                    setProfile(profileData);
                }

                // 2. Fetch recent chats for activity feed
                const { data: chats } = await supabase
                    .from('chats')
                    .select('id, title, updated_at, messages')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(5);

                if (chats) setRecentChats(chats);

            } catch (err) {
                console.error("Dashboard data load error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    // ═══════════════════════════════════════════
    // COMPUTED VALUES
    // ═══════════════════════════════════════════

    const totalNetWorth = useMemo(() => assets.reduce((sum, a) => sum + a.value, 0), [assets]);
    const hasAssets = assets.length > 0;

    // Group by type for allocation
    const allocationByType = useMemo(() => {
        const groups: Record<string, number> = {};
        assets.forEach(a => {
            groups[a.type] = (groups[a.type] || 0) + a.value;
        });
        return Object.entries(groups)
            .map(([type, value]) => ({
                type,
                value,
                pct: totalNetWorth > 0 ? Math.round((value / totalNetWorth) * 100) : 0,
                ...ALLOCATION_COLORS[type] || ALLOCATION_COLORS['Other'],
            }))
            .sort((a, b) => b.value - a.value);
    }, [assets, totalNetWorth]);

    // Pie chart data for cashflow or allocation
    const pieData = useMemo(() => {
        if (!hasAssets) return [{ name: 'No Data', value: 1 }];
        return allocationByType.map(a => ({ name: a.type, value: a.value }));
    }, [allocationByType, hasAssets]);

    // Recent activity from chats
    const activityLog = useMemo(() => {
        return recentChats.map(chat => {
            const msgCount = Array.isArray(chat.messages) ? chat.messages.length : 0;
            const updatedAt = new Date(chat.updated_at);
            const now = new Date();
            const diffMs = now.getTime() - updatedAt.getTime();
            const diffH = Math.floor(diffMs / (1000 * 60 * 60));
            const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            let timeAgo = 'Just now';
            if (diffD > 0) timeAgo = `${diffD}d ago`;
            else if (diffH > 0) timeAgo = `${diffH}h ago`;
            else timeAgo = `${Math.max(1, Math.floor(diffMs / (1000 * 60)))}m ago`;

            return {
                id: chat.id,
                action: chat.title || `Chat (${msgCount} messages)`,
                time: timeAgo,
                icon: MessageSquare,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
            };
        });
    }, [recentChats]);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    // ═══════════════════════════════════════════
    // EMPTY STATE COMPONENT
    // ═══════════════════════════════════════════

    const EmptyState = ({ icon: Icon, title, description, ctaLabel, ctaPath, iconColor = "text-primary", iconBg = "bg-primary/10" }: {
        icon: any; title: string; description: string; ctaLabel: string; ctaPath: string; iconColor?: string; iconBg?: string;
    }) => (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">{title}</h4>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs">{description}</p>
            <button
                onClick={() => navigate(ctaPath)}
                className="px-5 py-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            >
                <Plus className="w-3.5 h-3.5" />
                {ctaLabel}
            </button>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700">

            {/* ───────── Hero Welcome ───────── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/10 via-primary/5 to-purple-600/10 dark:from-blue-600/15 dark:via-primary/10 dark:to-purple-600/15 border border-border/50 p-8 lg:p-10">
                <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 dark:bg-primary/15 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-52 h-52 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">{greeting}</span>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2 tracking-tight">
                            Welcome back, <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">{userName}</span>
                        </h2>
                        <p className="text-muted-foreground text-sm font-medium max-w-md">
                            {hasAssets 
                                ? "Your retirement plan is being actively monitored by myra."
                                : "Get started by adding your assets or chatting with myra."
                            }
                        </p>
                    </div>
                    
                    {hasAssets && (
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="glass-card rounded-2xl px-5 py-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Assets</p>
                                    <p className="text-lg font-bold text-foreground">{formatCurrency(totalNetWorth)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ───────── Quick Stats ───────── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Net Worth */}
                <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Net Worth</p>
                        <p className="text-xl font-bold text-foreground">{hasAssets ? formatCurrency(totalNetWorth) : '$0'}</p>
                    </div>
                </div>

                {/* Retirement Age */}
                <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Retire By</p>
                        <p className="text-xl font-bold text-foreground">
                            {profile.retirementAge ? `Age ${profile.retirementAge}` : (
                                <button onClick={() => navigate('/app/profile')} className="text-primary/60 text-base hover:text-primary transition-colors cursor-pointer">Set Goal →</button>
                            )}
                        </p>
                    </div>
                </div>

                {/* Account Count */}
                <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Accounts</p>
                        <p className="text-xl font-bold text-foreground">
                            {hasAssets ? assets.length : (
                                <button onClick={() => navigate('/app/portfolio')} className="text-primary/60 text-base hover:text-primary transition-colors cursor-pointer">Add →</button>
                            )}
                        </p>
                    </div>
                </div>

                {/* Profile Completion */}
                <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Profile</p>
                        {(() => {
                            const fields = [profile.retirementAge, profile.state, profile.maritalStatus];
                            const filled = fields.filter(Boolean).length;
                            const pct = Math.round((filled / fields.length) * 100);
                            return <span className={`text-xs font-bold ${pct === 100 ? 'text-emerald-400' : 'text-primary'}`}>{pct}%</span>;
                        })()}
                    </div>
                    {(() => {
                        const fields = [profile.retirementAge, profile.state, profile.maritalStatus];
                        const filled = fields.filter(Boolean).length;
                        const pct = Math.round((filled / fields.length) * 100);
                        return (
                            <>
                                <div className="h-2.5 w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${pct === 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-primary'}`} style={{ width: `${pct}%` }} />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {pct === 100 ? 'Profile complete ✓' : (
                                        <button onClick={() => navigate('/app/profile')} className="text-primary/70 hover:text-primary cursor-pointer transition-colors">Complete your profile →</button>
                                    )}
                                </p>
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* ───────── Quick Actions ───────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => navigate("/app/chat")} className="group glass-card rounded-2xl p-5 text-left hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98] hover:border-blue-500/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-foreground font-bold text-sm">Talk to myra</p>
                                <p className="text-muted-foreground text-xs mt-0.5">Get personalized advice</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                </button>

                <button onClick={() => navigate("/app/integrations")} className="group glass-card rounded-2xl p-5 text-left hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98] hover:border-emerald-500/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                                <Link2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-foreground font-bold text-sm">Integrations</p>
                                <p className="text-muted-foreground text-xs mt-0.5">Link banks, brokerages & more</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                </button>
            </div>

            {/* ───────── Family Section (Partner / Children) ───────── */}
            <FamilySection />

            {/* ═══════════ NET WORTH + ALLOCATION ═══════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Net Worth Overview */}
                <div className="lg:col-span-3 glass-card rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full group-hover:bg-blue-600/10 transition-all duration-700 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">Total Net Worth</p>
                                <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                                    {hasAssets ? formatCurrency(totalNetWorth) : '$0'}
                                </h2>
                            </div>
                            {hasAssets && (
                                <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-bold text-blue-400">{assets.length} Account{assets.length !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                        </div>

                        {hasAssets ? (
                            <>
                                {/* Asset Breakdown Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {allocationByType.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.type} className={`rounded-2xl p-4 border ${item.border} bg-black/[0.02] dark:bg-white/[0.02] flex items-center gap-3 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors`}>
                                                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                                                    <Icon className={`w-4 h-4 ${item.color}`} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.type}</p>
                                                    <p className="text-base font-bold text-foreground">{formatCurrency(item.value)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Individual Assets List */}
                                <div className="mt-6 space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Your Accounts</p>
                                    {assets.map((asset, i) => (
                                        <div key={asset.category} className="flex items-center justify-between p-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg ${ALLOCATION_COLORS[asset.type]?.bg || 'bg-primary/10'} flex items-center justify-center`}>
                                                    <Wallet className={`w-3.5 h-3.5 ${ALLOCATION_COLORS[asset.type]?.color || 'text-primary'}`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{asset.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{asset.type}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(asset.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <EmptyState
                                icon={Wallet}
                                title="No Assets Added Yet"
                                description="Add your accounts manually or tell myra about them in chat to see your portfolio here."
                                ctaLabel="Add Your First Asset"
                                ctaPath="/app/integrations"
                            />
                        )}
                    </div>
                </div>

                {/* Allocation Donut + AI Insight */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Allocation Donut */}
                    <div className="glass-card rounded-3xl p-8">
                        <h3 className="text-base font-bold text-foreground mb-1">Asset Allocation</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-6">By Tax Category</p>
                        
                        {hasAssets ? (
                            <>
                                <div className="flex justify-center mb-6">
                                    <div className="relative w-[180px] h-[180px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={62}
                                                    outerRadius={85}
                                                    startAngle={90}
                                                    endAngle={-270}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {pieData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-bold text-foreground">{formatCurrency(totalNetWorth)}</span>
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Total</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="space-y-3">
                                    {allocationByType.map((item, i) => (
                                        <div key={item.type} className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                <span className="text-sm text-muted-foreground font-medium">{item.type}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-foreground">{formatCurrency(item.value)}</span>
                                                <span className="text-xs text-muted-foreground font-bold tabular-nums">{item.pct}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <EmptyState
                                icon={BarChart3}
                                title="No Allocation Data"
                                description="Add assets to see your tax-optimized allocation chart."
                                ctaLabel="Connect Accounts"
                                ctaPath="/app/integrations"
                                iconColor="text-emerald-400"
                                iconBg="bg-emerald-500/10"
                            />
                        )}
                    </div>

                    {/* AI Insight */}
                    <div className="relative overflow-hidden rounded-3xl p-7 border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-violet-900/10 dark:from-purple-500/15 dark:via-purple-600/10 dark:to-violet-900/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/15 blur-[60px] rounded-full pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                </div>
                                <span className="text-sm font-bold text-purple-400 dark:text-purple-300">myra Insight</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                                {hasAssets 
                                    ? `You have ${assets.length} account${assets.length !== 1 ? 's' : ''} totaling ${formatCurrency(totalNetWorth)}. Ask myra to analyze your tax diversification strategy.`
                                    : "Start by adding your accounts. myra can help you build a tax-optimized retirement plan."
                                }
                            </p>
                            <button 
                                onClick={() => navigate("/app/chat")}
                                className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl transition-all cursor-pointer active:scale-[0.97] text-sm shadow-lg shadow-purple-500/20"
                            >
                                {hasAssets ? "Analyze with myra" : "Chat with myra"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════ RECENT ACTIVITY + SECURITY ═══════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Activity */}
                <div className="lg:col-span-2 glass-card rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-base font-bold text-foreground">Recent Activity</h3>
                        </div>
                        {recentChats.length > 0 && (
                            <button onClick={() => navigate("/app/chat")} className="text-xs text-primary font-bold hover:underline cursor-pointer">View All</button>
                        )}
                    </div>
                    
                    {activityLog.length > 0 ? (
                        <div className="space-y-2">
                            {activityLog.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${log.bg} flex items-center justify-center`}>
                                            <log.icon className={`w-4 h-4 ${log.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground truncate max-w-xs">{log.action}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{log.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={MessageSquare}
                            title="No Activity Yet"
                            description="Start a conversation with myra to see your activity here."
                            ctaLabel="Start Chatting"
                            ctaPath="/app/chat"
                            iconColor="text-blue-400"
                            iconBg="bg-blue-500/10"
                        />
                    )}
                </div>

                {/* Security + Connect */}
                <div className="space-y-4">
                    {/* Connect CTA */}
                    <div className="glass-card rounded-3xl p-6 border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Link2 className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Connect Accounts</h3>
                                <p className="text-[10px] text-muted-foreground">Link banks, 401(k)s, brokerages</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/app/integrations")}
                            className="w-full px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            Open Integrations
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Security Badge */}
                    <div className="glass-card rounded-2xl p-5 border-emerald-500/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Protected</h3>
                                <p className="text-[10px] text-muted-foreground">Bank-grade encryption active</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {["SOC 2", "AES-256", "HTTPS"].map(badge => (
                                <span key={badge} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
