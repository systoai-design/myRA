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
    Bell,
    DollarSign,
    Wallet,
    Building2,
    Home,
    TrendingDown,
} from "lucide-react";

// ═══════════════════════════════════════════
// MOCK DATA — matching user reference screenshots
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
    { label: "Cash", value: 45200, icon: Wallet, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Investments", value: 850300, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Real Estate", value: 309000, icon: Home, color: "text-purple-400", bg: "bg-purple-500/10" },
];

const cashflowData = [
    { name: "Income", value: 12400 },
    { name: "Expenses", value: 8200 },
];
const CASHFLOW_COLORS = ["#10B981", "#1e293b"];

const assetAllocation = [
    { name: "US Equities", pct: 55, color: "bg-purple-500" },
    { name: "Intl Equities", pct: 20, color: "bg-blue-500" },
    { name: "Bonds", pct: 15, color: "bg-emerald-500" },
    { name: "Crypto / Alts", pct: 10, color: "bg-amber-500" },
];

const recentTransactions = [
    { name: "Whole Foods Market", category: "Groceries", amount: -142.50, icon: DollarSign, color: "text-white/60 bg-white/5" },
    { name: "Vanguard 401(k) Contribution", category: "Investing", amount: -1200.00, icon: TrendingUp, color: "text-blue-400 bg-blue-500/10" },
    { name: "Acme Corp Salary", category: "Income", amount: 6200.00, icon: DollarSign, color: "text-emerald-400 bg-emerald-500/10" },
    { name: "Netflix Subscription", category: "Entertainment", amount: -15.99, icon: Building2, color: "text-white/60 bg-white/5" },
    { name: "Equinox Gym", category: "Health", amount: -250.00, icon: Activity, color: "text-white/60 bg-white/5" },
];

const activityLog = [
    { id: 1, action: "Portfolio rebalanced", time: "2h ago", icon: Activity, color: "text-blue-400 bg-blue-500/10" },
    { id: 2, action: "Social Security audit complete", time: "5h ago", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10" },
    { id: 3, action: "Risk profile updated by MyRA", time: "Yesterday", icon: Zap, color: "text-purple-400 bg-purple-500/10" },
];

const quickActions = [
    { 
        label: "Talk to MyRA", 
        description: "Get personalized retirement advice", 
        icon: MessageSquare, 
        path: "/app/chat", 
        gradient: "from-blue-500/20 to-primary/20",
        border: "border-blue-500/20",
        iconColor: "text-blue-400"
    },
    { 
        label: "Portfolio Hub", 
        description: "Track and manage your assets", 
        icon: BarChart3, 
        path: "/app/portfolio", 
        gradient: "from-emerald-500/20 to-teal-500/20",
        border: "border-emerald-500/20",
        iconColor: "text-emerald-400"
    },
    { 
        label: "My Profile", 
        description: "Calibrate your retirement plan", 
        icon: User, 
        path: "/app/profile", 
        gradient: "from-purple-500/20 to-pink-500/20",
        border: "border-purple-500/20",
        iconColor: "text-purple-400"
    },
];

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
}

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
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* ───────── Hero Welcome ───────── */}
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary/10 via-blue-600/5 to-purple-600/10 border border-white/5 p-8 lg:p-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 blur-[100px] rounded-full pointer-events-none animate-orb" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none animate-orb-delayed" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">{greeting}</span>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-2">
                            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{userName}</span>
                        </h2>
                        <p className="text-white/40 text-sm font-medium tracking-wide max-w-lg">
                            Your retirement plan is being actively monitored. Here's your financial overview.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="px-5 py-3 rounded-2xl bg-black/30 backdrop-blur-xl border border-emerald-500/20 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Total Gain</p>
                                <p className="text-lg font-bold text-emerald-400">+12.5%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ───────── Quick Actions ───────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className={`group relative overflow-hidden glass-premium rounded-[20px] p-5 border ${action.border} bg-gradient-to-br ${action.gradient} text-left hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]`}
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <Icon className={`w-5 h-5 ${action.iconColor}`} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">{action.label}</p>
                                        <p className="text-white/40 text-xs mt-0.5">{action.description}</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ═══════════ TOTAL NET WORTH ═══════════ */}
            <div className="glass-premium rounded-[28px] p-8 border border-white/5 bg-white/[0.02] relative overflow-hidden group">
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full group-hover:bg-blue-600/10 transition-all duration-700" />
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">Total Net Worth</p>
                            <h2 className="text-5xl font-bold text-white tracking-tight">{formatCurrency(1204500)}</h2>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-400">+12.5% All Time</span>
                        </div>
                    </div>

                    {/* Net Worth Chart */}
                    <div className="h-[220px] w-full -ml-6 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={netWorthTrendData}>
                                <defs>
                                    <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis 
                                    dataKey="name" axisLine={false} tickLine={false} 
                                    tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700}}
                                    dy={10}
                                />
                                <Tooltip 
                                    formatter={(value: number) => [formatCurrency(value), "Net Worth"]}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#netWorthGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Breakdown Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        {netWorthBreakdown.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center`}>
                                        <Icon className={`w-4 h-4 ${item.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{item.label}</p>
                                        <p className="text-lg font-bold text-white">{formatCurrency(item.value)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ═══════════ CASHFLOW + TRANSACTIONS ROW ═══════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Monthly Cashflow — Donut */}
                <div className="lg:col-span-2 glass-premium rounded-[28px] p-8 border border-white/5 bg-white/[0.02]">
                    <h3 className="text-lg font-bold text-white mb-6">Monthly Cashflow</h3>
                    
                    <div className="flex flex-col items-center">
                        <div className="relative w-[180px] h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={cashflowData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        startAngle={90}
                                        endAngle={-270}
                                        paddingAngle={3}
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
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Surplus</span>
                            </div>
                        </div>

                        <div className="mt-6 w-full space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-sm text-white/60 font-medium">Income</span>
                                </div>
                                <span className="text-sm font-bold text-white">{formatCurrency(12400)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                                    <span className="text-sm text-white/60 font-medium">Expenses</span>
                                </div>
                                <span className="text-sm font-bold text-white">{formatCurrency(8200)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-3 glass-premium rounded-[28px] p-8 border border-white/5 bg-white/[0.02]">
                    <h3 className="text-lg font-bold text-white mb-6">Recent Transactions</h3>
                    
                    <div className="space-y-3">
                        {recentTransactions.map((tx, i) => {
                            const Icon = tx.icon;
                            return (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${tx.color} flex items-center justify-center`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{tx.name}</p>
                                            <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">{tx.category}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold ${tx.amount >= 0 ? "text-emerald-400" : "text-white/70"}`}>
                                        {tx.amount >= 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ═══════════ ASSET ALLOCATION + AI INSIGHTS + ACTIVITY ═══════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Asset Allocation */}
                <div className="glass-premium rounded-[28px] p-8 border border-white/5 bg-white/[0.02]">
                    <h3 className="text-lg font-bold text-white mb-2">Asset Allocation</h3>
                    <p className="text-4xl font-bold text-white mb-8">{formatCurrency(850300)}</p>
                    
                    <div className="space-y-5">
                        {assetAllocation.map((asset, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/60 font-medium">{asset.name}</span>
                                    <span className="text-white font-bold">{asset.pct}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${asset.color} transition-all duration-1000`} style={{ width: `${asset.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Tax Harvest + Dividend */}
                <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-[28px] p-8 border border-purple-500/20 bg-gradient-to-br from-purple-500/15 to-purple-900/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-bold text-purple-300">AI Tax Harvest Found</span>
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed mb-5">
                                MyRA identified <span className="text-white font-bold">$3,240</span> in harvestable losses on your AAPL position. Execute this trade to offset upcoming capital gains.
                            </p>
                            <button className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl transition-all cursor-pointer active:scale-[0.97] text-sm">
                                Execute Strategy
                            </button>
                        </div>
                    </div>

                    <div className="glass-premium rounded-[28px] p-6 border border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">SPY Dividend Reinvested</p>
                                <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">Today at 9:30 AM</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-400">+$450.00</span>
                    </div>
                </div>

                {/* Activity + Security */}
                <div className="space-y-6">
                    <div className="glass-premium rounded-[28px] p-6 border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-white/30" />
                                <h3 className="text-sm font-bold text-white">Recent Activity</h3>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {activityLog.map((log) => (
                                <div key={log.id} className="flex gap-3 items-start">
                                    <div className={`w-9 h-9 rounded-xl ${log.color} flex items-center justify-center shrink-0`}>
                                        <log.icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-white/80 leading-snug">{log.action}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-premium rounded-[28px] p-6 border border-emerald-500/10 bg-emerald-500/[0.02]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Protected</h3>
                                <p className="text-[10px] text-white/30">Bank-grade encryption active</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {["SOC 2", "AES-256", "HTTPS"].map(badge => (
                                <span key={badge} className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400/80 text-[9px] font-bold uppercase tracking-widest">
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
