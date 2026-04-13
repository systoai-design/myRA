import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    Bell,
    Calendar,
    Search,
    Loader2,
    ExternalLink,
    DollarSign,
    AlertCircle,
    TrendingUp,
    Wallet,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    XCircle,
    RefreshCw,
} from "lucide-react";

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface Transaction {
    id: string;
    name: string;
    merchant_name: string;
    amount: number;
    date: string;
    category: string;
    category_detailed: string;
    pending: boolean;
    institution_name: string;
    logo_url: string | null;
    payment_channel: string;
}

interface DetectedSubscription {
    merchant: string;
    amount: number;
    frequency: "monthly" | "weekly" | "yearly" | "unknown";
    lastCharge: string;
    nextEstimate: string;
    occurrences: number;
    category: string;
    logo_url: string | null;
}

// ═══════════════════════════════════════════
// SUBSCRIPTION DETECTION
// ═══════════════════════════════════════════

function detectSubscriptions(transactions: Transaction[]): DetectedSubscription[] {
    // Group by merchant
    const merchantMap: Record<string, Transaction[]> = {};
    for (const tx of transactions) {
        if (tx.amount <= 0 || tx.pending) continue;
        const key = tx.merchant_name || tx.name;
        if (!merchantMap[key]) merchantMap[key] = [];
        merchantMap[key].push(tx);
    }

    const subs: DetectedSubscription[] = [];

    for (const [merchant, txs] of Object.entries(merchantMap)) {
        if (txs.length < 2) continue;

        // Sort by date
        const sorted = txs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Check if amounts are consistent (within 10% variance)
        const amounts = sorted.map(t => t.amount);
        const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
        const isConsistent = amounts.every(a => Math.abs(a - avgAmount) / avgAmount < 0.15);

        if (!isConsistent) continue;

        // Detect frequency by average gap
        const gaps: number[] = [];
        for (let i = 1; i < sorted.length; i++) {
            const diff = (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / (1000 * 60 * 60 * 24);
            gaps.push(diff);
        }
        const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;

        let frequency: DetectedSubscription["frequency"] = "unknown";
        if (avgGap >= 25 && avgGap <= 35) frequency = "monthly";
        else if (avgGap >= 5 && avgGap <= 9) frequency = "weekly";
        else if (avgGap >= 350 && avgGap <= 380) frequency = "yearly";
        else if (avgGap >= 13 && avgGap <= 16) frequency = "monthly"; // biweekly patterns can look monthly within 2-month window

        if (frequency === "unknown") continue;

        // Estimate next charge
        const lastDate = new Date(sorted[sorted.length - 1].date);
        const daysToAdd = frequency === "monthly" ? 30 : frequency === "weekly" ? 7 : 365;
        const nextEstimate = new Date(lastDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

        subs.push({
            merchant,
            amount: Math.round(avgAmount * 100) / 100,
            frequency,
            lastCharge: sorted[sorted.length - 1].date,
            nextEstimate: nextEstimate.toISOString().split("T")[0],
            occurrences: sorted.length,
            category: sorted[0].category,
            logo_url: sorted[0].logo_url,
        });
    }

    return subs.sort((a, b) => b.amount - a.amount);
}

// ═══════════════════════════════════════════
// COLOR MAP
// ═══════════════════════════════════════════

const SUB_COLORS = [
    "#3B82F6", "#EC4899", "#10B981", "#F59E0B", "#8B5CF6",
    "#EF4444", "#14B8A6", "#6366F1", "#F97316", "#0EA5E9",
];

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

export default function SubscriptionsPage() {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<DetectedSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [dismissed, setDismissed] = useState<Set<string>>(() => {
        if (typeof window === "undefined") return new Set();
        try {
            const stored = localStorage.getItem("myra_dismissed_subs");
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch { return new Set(); }
    });

    // Calendar month nav
    const [calMonth, setCalMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });

    const calMonthName = new Date(calMonth.year, calMonth.month).toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Fetch 90 days of transactions for better pattern detection
    useEffect(() => {
        if (!user?.id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);

                const res = await fetch("/api/plaid/transactions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: user.id,
                        start_date: start.toISOString().split("T")[0],
                        end_date: now.toISOString().split("T")[0],
                    }),
                });

                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                const detected = detectSubscriptions(data.transactions || []);
                setSubscriptions(detected);
            } catch { } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    // Save dismissed
    const toggleDismiss = (merchant: string) => {
        setDismissed(prev => {
            const next = new Set(prev);
            if (next.has(merchant)) next.delete(merchant);
            else next.add(merchant);
            localStorage.setItem("myra_dismissed_subs", JSON.stringify([...next]));
            return next;
        });
    };

    // ═══════════ Demo data for empty state ═══════════

    const DEMO_SUBS: DetectedSubscription[] = useMemo(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        return [
            { merchant: "Netflix", amount: 15.99, frequency: "monthly", lastCharge: `${y}-${String(m + 1).padStart(2, "0")}-03`, nextEstimate: `${y}-${String(m + 2 > 12 ? 1 : m + 2).padStart(2, "0")}-03`, occurrences: 6, category: "ENTERTAINMENT", logo_url: null },
            { merchant: "Spotify", amount: 9.99, frequency: "monthly", lastCharge: `${y}-${String(m + 1).padStart(2, "0")}-12`, nextEstimate: `${y}-${String(m + 2 > 12 ? 1 : m + 2).padStart(2, "0")}-12`, occurrences: 8, category: "ENTERTAINMENT", logo_url: null },
            { merchant: "iCloud Storage", amount: 2.99, frequency: "monthly", lastCharge: `${y}-${String(m + 1).padStart(2, "0")}-01`, nextEstimate: `${y}-${String(m + 2 > 12 ? 1 : m + 2).padStart(2, "0")}-01`, occurrences: 12, category: "GENERAL_SERVICES", logo_url: null },
            { merchant: "Adobe Creative Cloud", amount: 54.99, frequency: "monthly", lastCharge: `${y}-${String(m + 1).padStart(2, "0")}-17`, nextEstimate: `${y}-${String(m + 2 > 12 ? 1 : m + 2).padStart(2, "0")}-17`, occurrences: 4, category: "GENERAL_SERVICES", logo_url: null },
            { merchant: "ChatGPT Plus", amount: 20.00, frequency: "monthly", lastCharge: `${y}-${String(m + 1).padStart(2, "0")}-22`, nextEstimate: `${y}-${String(m + 2 > 12 ? 1 : m + 2).padStart(2, "0")}-22`, occurrences: 5, category: "GENERAL_SERVICES", logo_url: null },
            { merchant: "YouTube Premium", amount: 13.99, frequency: "monthly", lastCharge: `${y}-${String(m + 1).padStart(2, "0")}-08`, nextEstimate: `${y}-${String(m + 2 > 12 ? 1 : m + 2).padStart(2, "0")}-08`, occurrences: 10, category: "ENTERTAINMENT", logo_url: null },
            { merchant: "Gym Membership", amount: 49.99, frequency: "monthly", lastCharge: `${y}-${String(m + 1).padStart(2, "0")}-01`, nextEstimate: `${y}-${String(m + 2 > 12 ? 1 : m + 2).padStart(2, "0")}-01`, occurrences: 7, category: "PERSONAL_CARE", logo_url: null },
            { merchant: "Car Insurance", amount: 142.00, frequency: "monthly", lastCharge: `${y}-${String(m + 1).padStart(2, "0")}-15`, nextEstimate: `${y}-${String(m + 2 > 12 ? 1 : m + 2).padStart(2, "0")}-15`, occurrences: 6, category: "TRANSPORTATION", logo_url: null },
        ];
    }, []);

    const isDemo = subscriptions.length === 0;
    const displaySubs = isDemo ? DEMO_SUBS : subscriptions;

    // ═══════════ Computed ═══════════

    const activeSubs = useMemo(() => displaySubs.filter(s => !dismissed.has(s.merchant)), [displaySubs, dismissed]);

    const monthlyTotal = useMemo(() => {
        return activeSubs.reduce((sum, s) => {
            if (s.frequency === "monthly") return sum + s.amount;
            if (s.frequency === "weekly") return sum + s.amount * 4.33;
            if (s.frequency === "yearly") return sum + s.amount / 12;
            return sum;
        }, 0);
    }, [activeSubs]);

    const yearlyTotal = monthlyTotal * 12;

    const filtered = useMemo(() => {
        if (!searchQuery) return displaySubs;
        const q = searchQuery.toLowerCase();
        return displaySubs.filter(s => s.merchant.toLowerCase().includes(q));
    }, [displaySubs, searchQuery]);

    // Calendar
    const calendarDays = useMemo(() => {
        const firstDay = new Date(calMonth.year, calMonth.month, 1);
        const lastDay = new Date(calMonth.year, calMonth.month + 1, 0);
        const startPad = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const days: { date: number; key: string; subs: DetectedSubscription[]; isPad: boolean; isToday: boolean }[] = [];

        for (let i = 0; i < startPad; i++) {
            days.push({ date: 0, key: `pad-${i}`, subs: [], isPad: true, isToday: false });
        }

        const today = new Date();
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            // Find subs whose nextEstimate falls on this day (or recurrences in this month)
            const dayDate = new Date(calMonth.year, calMonth.month, d);
            const matchingSubs = activeSubs.filter(s => {
                const next = new Date(s.nextEstimate);
                if (s.frequency === "monthly") {
                    return next.getDate() === d;
                }
                if (s.frequency === "weekly") {
                    return dayDate.getDay() === next.getDay();
                }
                return next.toISOString().split("T")[0] === dateStr;
            });

            days.push({
                date: d,
                key: dateStr,
                subs: matchingSubs,
                isPad: false,
                isToday: today.getDate() === d && today.getMonth() === calMonth.month && today.getFullYear() === calMonth.year,
            });
        }
        return days;
    }, [calMonth, activeSubs]);

    // ═══════════ RENDER ═══════════

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Subscriptions</h1>
                    <p className="text-muted-foreground mt-1">Find, manage, and cancel subscriptions in seconds.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search subscriptions..."
                        className="bg-card border border-border rounded-2xl pl-10 pr-4 py-2.5 text-sm w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {/* Demo Banner */}
                    {isDemo && (
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground">Showing sample data</p>
                                <p className="text-xs text-muted-foreground">Connect a bank account in your <a href="/app/portfolio" className="text-primary underline underline-offset-2 hover:opacity-80">Portfolio</a> to see your real subscriptions.</p>
                            </div>
                        </div>
                    )}

                    {/* ═══════════ STAT CARDS ═══════════ */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                <RefreshCw className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold text-foreground">{activeSubs.length}</p>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Monthly</p>
                                <p className="text-2xl font-bold text-foreground">${monthlyTotal.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Yearly</p>
                                <p className="text-2xl font-bold text-foreground">${yearlyTotal.toFixed(0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════ MAIN CONTENT ═══════════ */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Calendar */}
                        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Upcoming Transactions</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setCalMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 })} className="p-1 hover:bg-muted rounded-lg">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs font-semibold min-w-[120px] text-center">{calMonthName}</span>
                                    <button onClick={() => setCalMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 })} className="p-1 hover:bg-muted rounded-lg">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => (
                                    <div key={d} className="text-[10px] font-bold text-muted-foreground text-center py-1">{d}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map(day => (
                                    <div
                                        key={day.key}
                                        className={`
                                            relative min-h-[80px] flex flex-col p-1.5 rounded-xl text-sm transition-all
                                            ${day.isPad ? "" : "hover:bg-muted/50"}
                                            ${day.isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}
                                            ${day.subs.length > 0 ? "bg-muted/30" : ""}
                                        `}
                                    >
                                        {!day.isPad && (
                                            <>
                                                <span className={`text-xs font-semibold mb-1 ${day.isToday ? "text-primary" : "text-muted-foreground"}`}>
                                                    {day.date}
                                                </span>
                                                {day.subs.map((s, i) => (
                                                    <div
                                                        key={s.merchant}
                                                        className="flex items-center gap-1 mb-0.5"
                                                    >
                                                        <div
                                                            className="w-2 h-2 rounded-full shrink-0"
                                                            style={{ backgroundColor: SUB_COLORS[activeSubs.indexOf(s) % SUB_COLORS.length] }}
                                                        />
                                                        <span className="text-[9px] font-medium text-foreground truncate">${s.amount}</span>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Subscription List */}
                        <div className="bg-card border border-border rounded-3xl p-6">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">All Subscriptions</h3>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                                {filtered.map((sub, i) => {
                                    const isDismissed = dismissed.has(sub.merchant);
                                    return (
                                        <div
                                            key={sub.merchant}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isDismissed ? "opacity-40" : "hover:bg-muted/50"}`}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                                                style={{ backgroundColor: SUB_COLORS[i % SUB_COLORS.length] }}
                                            >
                                                {sub.merchant.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold truncate ${isDismissed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                                    {sub.merchant}
                                                </p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {sub.frequency} · {sub.occurrences} charges
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold text-foreground tabular-nums">${sub.amount}</p>
                                            </div>
                                            <button
                                                onClick={() => toggleDismiss(sub.merchant)}
                                                className={`p-1.5 rounded-lg transition-colors shrink-0 ${isDismissed ? "text-green-500 hover:bg-green-500/10" : "text-red-400 hover:bg-red-500/10"}`}
                                                title={isDismissed ? "Restore" : "Dismiss"}
                                            >
                                                {isDismissed ? <RefreshCw className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
