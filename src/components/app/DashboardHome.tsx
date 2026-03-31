import { useState, useEffect } from "react";
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
    ArrowDownRight,
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
    Building2,
    Home,
    Target,
    Calendar,
    Flame,
} from "lucide-react";

// ═══════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════

const netWorthTrendData = [
    { name: "Jan", value: 980000 },
    { name: "Feb", value: 1010000 },
    { name: "Mar", value: 995000 },
    { name: "Apr", value: 1050000 },
    { name: "May", value: 1080000 },
    { name: "Jun", value: 1120000 },
    { name: "Jul", value: 1100000 },
    { name: "Aug", value: 1150000 },
    { name: "Sep", value: 1180000 },
    { name: "Oct", value: 1204500 },
];

const netWorthBreakdown = [
    { label: "Cash", value: 45200, icon: Wallet, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/10" },
    { label: "Investments", value: 850300, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/10" },
    { label: "Real Estate", value: 309000, icon: Home, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/10" },
];

const cashflowData = [
    { name: "Income", value: 12400 },
    { name: "Expenses", value: 8200 },
];
const CASHFLOW_COLORS = ["#10B981", "#334155"];

const assetAllocation = [
    { name: "US Equities", pct: 55, color: "bg-purple-500" },
    { name: "Intl Equities", pct: 20, color: "bg-blue-500" },
    { name: "Bonds", pct: 15, color: "bg-emerald-500" },
    { name: "Crypto / Alts", pct: 10, color: "bg-amber-500" },
];

const recentTransactions = [
    { name: "Whole Foods Market", category: "Groceries", amount: -142.50, icon: DollarSign, iconColor: "text-orange-400", iconBg: "bg-orange-500/10" },
    { name: "Vanguard 401(k)", category: "Investing", amount: -1200.00, icon: TrendingUp, iconColor: "text-blue-400", iconBg: "bg-blue-500/10" },
    { name: "Acme Corp Salary", category: "Income", amount: 6200.00, icon: DollarSign, iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10" },
    { name: "Netflix", category: "Entertainment", amount: -15.99, icon: Building2, iconColor: "text-red-400", iconBg: "bg-red-500/10" },
    { name: "Equinox Gym", category: "Health", amount: -250.00, icon: Activity, iconColor: "text-violet-400", iconBg: "bg-violet-500/10" },
];

const activityLog = [
    { id: 1, action: "Portfolio rebalanced", time: "2h ago", icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
    { id: 2, action: "Social Security audit complete", time: "5h ago", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { id: 3, action: "Risk profile updated by myra", time: "Yesterday", icon: Zap, color: "text-purple-400", bg: "bg-purple-500/10" },
];

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

export default function DashboardHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string>("Investor");

    useEffect(() => {
        if (!user) return;
        const name = user.user_metadata?.first_name || user.email?.split("@")[0];
        if (name) setUserName(name);
    }, [user]);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    const surplus = cashflowData[0].value - cashflowData[1].value;

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
                            Your retirement plan is being actively monitored by myra.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="glass-card rounded-2xl px-5 py-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Gain</p>
                                <p className="text-lg font-bold text-emerald-400">+12.5%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ───────── Retirement Goal + Quick Stats ───────── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Retirement Countdown */}
                <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Retire By</p>
                        <p className="text-xl font-bold text-foreground">Age 62</p>
                    </div>
                </div>

                {/* Savings Streak */}
                <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Savings Streak</p>
                        <p className="text-xl font-bold text-foreground">18 Months</p>
                    </div>
                </div>

                {/* Monthly Savings */}
                <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly Savings</p>
                        <p className="text-xl font-bold text-foreground">$2,400</p>
                    </div>
                </div>

                {/* Goal Progress */}
                <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Goal Progress</p>
                        <span className="text-xs font-bold text-emerald-400">68%</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000" style={{ width: "68%" }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">$1.2M of $2.4M target</p>
                </div>
            </div>

            {/* ───────── Quick Actions ───────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <button onClick={() => navigate("/app/portfolio")} className="group glass-card rounded-2xl p-5 text-left hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98] hover:border-emerald-500/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-foreground font-bold text-sm">Portfolio Hub</p>
                                <p className="text-muted-foreground text-xs mt-0.5">Track and manage assets</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                </button>

                <button onClick={() => navigate("/app/profile")} className="group glass-card rounded-2xl p-5 text-left hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98] hover:border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-foreground font-bold text-sm">My Profile</p>
                                <p className="text-muted-foreground text-xs mt-0.5">Calibrate your plan</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                    </div>
                </button>
            </div>

            {/* ═══════════ NET WORTH ═══════════ */}
            <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full group-hover:bg-blue-600/10 transition-all duration-700 pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">Total Net Worth</p>
                            <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">{formatCurrencyFull(1204500)}</h2>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-400">+12.5% All Time</span>
                        </div>
                    </div>

                    {/* Net Worth Chart */}
                    <div className="h-[200px] w-full -ml-4 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={netWorthTrendData}>
                                <defs>
                                    <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, rgba(255,255,255,0.05))" />
                                <XAxis 
                                    dataKey="name" axisLine={false} tickLine={false} 
                                    tick={{fill: 'var(--color-muted-foreground, #999)', fontSize: 10, fontWeight: 600}}
                                    dy={10}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#netWorthGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Breakdown Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        {netWorthBreakdown.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className={`rounded-2xl p-4 border ${item.border} bg-black/[0.02] dark:bg-white/[0.02] flex items-center gap-3 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors`}>
                                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                                        <Icon className={`w-4 h-4 ${item.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.label}</p>
                                        <p className="text-base font-bold text-foreground">{formatCurrency(item.value)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ═══════════ CASHFLOW + TRANSACTIONS ═══════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Monthly Cashflow */}
                <div className="lg:col-span-2 glass-card rounded-3xl p-8">
                    <h3 className="text-base font-bold text-foreground mb-6">Monthly Cashflow</h3>
                    
                    <div className="flex flex-col items-center">
                        <div className="relative w-[180px] h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={cashflowData}
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
                                        {cashflowData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={CASHFLOW_COLORS[index]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-emerald-400">+${(surplus / 1000).toFixed(1)}k</span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Surplus</span>
                            </div>
                        </div>

                        <div className="mt-6 w-full space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <span className="text-sm text-muted-foreground font-medium">Income</span>
                                </div>
                                <span className="text-sm font-bold text-foreground">{formatCurrencyFull(12400)}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600" />
                                    <span className="text-sm text-muted-foreground font-medium">Expenses</span>
                                </div>
                                <span className="text-sm font-bold text-foreground">{formatCurrencyFull(8200)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-3 glass-card rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-foreground">Recent Transactions</h3>
                        <button className="text-xs text-primary font-bold hover:underline">View All</button>
                    </div>
                    
                    <div className="space-y-2">
                        {recentTransactions.map((tx, i) => {
                            const Icon = tx.icon;
                            return (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${tx.iconBg} flex items-center justify-center`}>
                                            <Icon className={`w-4 h-4 ${tx.iconColor}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{tx.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{tx.category}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold tabular-nums ${tx.amount >= 0 ? "text-emerald-400" : "text-foreground/70"}`}>
                                        {tx.amount >= 0 ? "+" : "-"}{formatCurrencyFull(Math.abs(tx.amount))}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ═══════════ ASSET ALLOCATION + AI + ACTIVITY ═══════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Asset Allocation */}
                <div className="glass-card rounded-3xl p-8">
                    <h3 className="text-base font-bold text-foreground mb-1">Asset Allocation</h3>
                    <p className="text-3xl font-bold text-foreground mb-8 tracking-tight">{formatCurrency(850300)}</p>
                    
                    <div className="space-y-5">
                        {assetAllocation.map((asset, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground font-medium">{asset.name}</span>
                                    <span className="text-foreground font-bold tabular-nums">{asset.pct}%</span>
                                </div>
                                <div className="h-2 w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${asset.color} transition-all duration-1000`} style={{ width: `${asset.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Insights Column */}
                <div className="space-y-4">
                    {/* AI Tax Harvest */}
                    <div className="relative overflow-hidden rounded-3xl p-7 border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-violet-900/10 dark:from-purple-500/15 dark:via-purple-600/10 dark:to-violet-900/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/15 blur-[60px] rounded-full pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                </div>
                                <span className="text-sm font-bold text-purple-400 dark:text-purple-300">AI Tax Harvest Found</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                                myra identified <span className="text-foreground font-bold">$3,240</span> in harvestable losses on AAPL.
                            </p>
                            <button className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl transition-all cursor-pointer active:scale-[0.97] text-sm shadow-lg shadow-purple-500/20">
                                Execute Strategy
                            </button>
                        </div>
                    </div>

                    {/* Dividend */}
                    <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">SPY Dividend Reinvested</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Today at 9:30 AM</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-400">+$450</span>
                    </div>
                </div>

                {/* Activity + Security Column */}
                <div className="space-y-4">
                    {/* Recent Activity */}
                    <div className="glass-card rounded-3xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
                        </div>
                        <div className="space-y-4">
                            {activityLog.map((log) => (
                                <div key={log.id} className="flex gap-3 items-start">
                                    <div className={`w-9 h-9 rounded-xl ${log.bg} flex items-center justify-center shrink-0`}>
                                        <log.icon className={`w-4 h-4 ${log.color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-foreground leading-snug">{log.action}</p>
                                        <p className="text-[10px] font-medium text-muted-foreground mt-1">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
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
