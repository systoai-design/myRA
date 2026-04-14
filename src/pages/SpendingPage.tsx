import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    BarChart3,
    Calendar,
    TrendingDown,
    TrendingUp,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    Wallet,
    AlertCircle,
    X,
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

interface CategorySummary {
    total: number;
    count: number;
}

// ═══════════════════════════════════════════
// CATEGORY ICONS & COLORS
// ═══════════════════════════════════════════

const CATEGORY_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
    FOOD_AND_DRINK: { emoji: "🍽️", color: "#F59E0B", label: "Food & Drink" },
    TRANSPORTATION: { emoji: "🚗", color: "#3B82F6", label: "Transportation" },
    SHOPPING: { emoji: "🛍️", color: "#EC4899", label: "Shopping" },
    ENTERTAINMENT: { emoji: "🎬", color: "#8B5CF6", label: "Entertainment" },
    RENT_AND_UTILITIES: { emoji: "🏠", color: "#10B981", label: "Rent & Utilities" },
    PERSONAL_CARE: { emoji: "💇", color: "#F97316", label: "Personal Care" },
    GENERAL_SERVICES: { emoji: "🔧", color: "#6B7280", label: "Services" },
    GENERAL_MERCHANDISE: { emoji: "📦", color: "#14B8A6", label: "Merchandise" },
    TRAVEL: { emoji: "✈️", color: "#0EA5E9", label: "Travel" },
    TRANSFER_OUT: { emoji: "💸", color: "#EF4444", label: "Transfers Out" },
    TRANSFER_IN: { emoji: "💰", color: "#22C55E", label: "Transfers In" },
    INCOME: { emoji: "💵", color: "#22C55E", label: "Income" },
    LOAN_PAYMENTS: { emoji: "🏦", color: "#6366F1", label: "Loan Payments" },
    MEDICAL: { emoji: "🏥", color: "#EF4444", label: "Medical" },
    GOVERNMENT_AND_NON_PROFIT: { emoji: "🏛️", color: "#64748B", label: "Government" },
    Other: { emoji: "📝", color: "#9CA3AF", label: "Other" },
};

function getCategoryConfig(cat: string) {
    return CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.Other;
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

export default function SpendingPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Record<string, CategorySummary>>({});
    const [dailySpending, setDailySpending] = useState<Record<string, number>>({});
    const [totalSpending, setTotalSpending] = useState(0);
    const [linkedAccountCount, setLinkedAccountCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Month navigation
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });

    const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    // Fetch transactions
    useEffect(() => {
        if (!user?.id) return;

        const fetchTransactions = async () => {
            setLoading(true);
            setError(null);
            try {
                const startDate = new Date(currentMonth.year, currentMonth.month, 1)
                    .toISOString().split("T")[0];
                const endDate = new Date(currentMonth.year, currentMonth.month + 1, 0)
                    .toISOString().split("T")[0];

                const res = await fetch("/api/plaid/transactions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: user.id,
                        start_date: startDate,
                        end_date: endDate,
                    }),
                });

                if (!res.ok) throw new Error("Failed to fetch transactions");
                const data = await res.json();

                setTransactions(data.transactions || []);
                setCategories(data.categories || {});
                setDailySpending(data.daily_spending || {});
                setTotalSpending(data.total_spending || 0);
                setLinkedAccountCount(data.linked_accounts ?? 0);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [user?.id, currentMonth]);

    // ═══════════ Demo data ═══════════
    // Show demo only when no accounts are linked (not when linked but empty)
    const isDemo = linkedAccountCount === 0 || (linkedAccountCount === null && transactions.length === 0);

    const demoData = useMemo(() => {
        const now = new Date();
        const y = currentMonth.year;
        const m = currentMonth.month;
        const pad = (n: number) => String(n).padStart(2, "0");
        const mo = pad(m + 1);

        const demoTx: Transaction[] = [
            { id: "d1", name: "Whole Foods", merchant_name: "Whole Foods", amount: 87.32, date: `${y}-${mo}-02`, category: "FOOD_AND_DRINK", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "in store" },
            { id: "d2", name: "Shell Gas", merchant_name: "Shell", amount: 52.10, date: `${y}-${mo}-03`, category: "TRANSPORTATION", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "in store" },
            { id: "d3", name: "Amazon", merchant_name: "Amazon", amount: 34.99, date: `${y}-${mo}-04`, category: "SHOPPING", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "online" },
            { id: "d4", name: "Netflix", merchant_name: "Netflix", amount: 15.99, date: `${y}-${mo}-05`, category: "ENTERTAINMENT", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "online" },
            { id: "d5", name: "Uber Eats", merchant_name: "Uber Eats", amount: 28.50, date: `${y}-${mo}-06`, category: "FOOD_AND_DRINK", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "online" },
            { id: "d6", name: "Target", merchant_name: "Target", amount: 126.43, date: `${y}-${mo}-08`, category: "GENERAL_MERCHANDISE", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "in store" },
            { id: "d7", name: "Starbucks", merchant_name: "Starbucks", amount: 6.75, date: `${y}-${mo}-09`, category: "FOOD_AND_DRINK", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "in store" },
            { id: "d8", name: "Con Edison", merchant_name: "Con Edison", amount: 142.00, date: `${y}-${mo}-10`, category: "RENT_AND_UTILITIES", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "online" },
            { id: "d9", name: "Spotify", merchant_name: "Spotify", amount: 9.99, date: `${y}-${mo}-12`, category: "ENTERTAINMENT", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "online" },
            { id: "d10", name: "Trader Joe's", merchant_name: "Trader Joe's", amount: 64.21, date: `${y}-${mo}-14`, category: "FOOD_AND_DRINK", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "in store" },
            { id: "d11", name: "AT&T", merchant_name: "AT&T", amount: 85.00, date: `${y}-${mo}-15`, category: "RENT_AND_UTILITIES", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "online" },
            { id: "d12", name: "CVS Pharmacy", merchant_name: "CVS", amount: 22.49, date: `${y}-${mo}-17`, category: "MEDICAL", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "in store" },
            { id: "d13", name: "Chevron", merchant_name: "Chevron", amount: 48.30, date: `${y}-${mo}-19`, category: "TRANSPORTATION", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "in store" },
            { id: "d14", name: "Chipotle", merchant_name: "Chipotle", amount: 14.25, date: `${y}-${mo}-20`, category: "FOOD_AND_DRINK", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "in store" },
            { id: "d15", name: "Home Depot", merchant_name: "Home Depot", amount: 189.99, date: `${y}-${mo}-22`, category: "GENERAL_MERCHANDISE", category_detailed: "", pending: false, institution_name: "Chase", logo_url: null, payment_channel: "in store" },
        ];

        const demoCats: Record<string, CategorySummary> = {};
        const demoDaily: Record<string, number> = {};
        let demoTotal = 0;
        for (const tx of demoTx) {
            demoTotal += tx.amount;
            if (!demoCats[tx.category]) demoCats[tx.category] = { total: 0, count: 0 };
            demoCats[tx.category].total += tx.amount;
            demoCats[tx.category].count += 1;
            demoDaily[tx.date] = (demoDaily[tx.date] || 0) + tx.amount;
        }
        return { transactions: demoTx, categories: demoCats, dailySpending: demoDaily, totalSpending: Math.round(demoTotal * 100) / 100 };
    }, [currentMonth]);

    const displayTx = isDemo ? demoData.transactions : transactions;
    const displayCats = isDemo ? demoData.categories : categories;
    const displayDaily = isDemo ? demoData.dailySpending : dailySpending;
    const displayTotal = isDemo ? demoData.totalSpending : totalSpending;

    // ═══════════ Calendar grid ═══════════
    const calendarDays = useMemo(() => {
        const firstDay = new Date(currentMonth.year, currentMonth.month, 1);
        const lastDay = new Date(currentMonth.year, currentMonth.month + 1, 0);
        const startPad = firstDay.getDay(); // 0=Sun
        const totalDays = lastDay.getDate();

        const days: { date: number; key: string; amount: number; isToday: boolean; isPad: boolean }[] = [];

        // Padding days
        for (let i = 0; i < startPad; i++) {
            days.push({ date: 0, key: `pad-${i}`, amount: 0, isToday: false, isPad: true });
        }

        const today = new Date();
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            days.push({
                date: d,
                key: dateStr,
                amount: displayDaily[dateStr] || 0,
                isToday: today.getDate() === d && today.getMonth() === currentMonth.month && today.getFullYear() === currentMonth.year,
                isPad: false,
            });
        }
        return days;
    }, [currentMonth, displayDaily]);

    // Max daily spend for heat-map intensity
    const maxDailySpend = useMemo(() => {
        return Math.max(1, ...Object.values(displayDaily));
    }, [displayDaily]);

    // Sorted categories
    const sortedCategories = useMemo(() => {
        return Object.entries(displayCats)
            .sort(([, a], [, b]) => b.total - a.total);
    }, [displayCats]);

    // Recent transactions (last 15)
    const recentTransactions = useMemo(() => {
        return [...displayTx]
            .filter(tx => !tx.pending)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 15);
    }, [displayTx]);

    // Transactions for selected day
    const selectedDayTx = useMemo(() => {
        if (!selectedDate) return [];
        return displayTx
            .filter(tx => tx.date === selectedDate && !tx.pending)
            .sort((a, b) => b.amount - a.amount);
    }, [selectedDate, displayTx]);

    const selectedDayTotal = useMemo(() => {
        return selectedDayTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    }, [selectedDayTx]);

    const selectedDateFormatted = selectedDate
        ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
        : "";

    const goToPrevMonth = () => {
        setCurrentMonth(prev => {
            const m = prev.month - 1;
            return m < 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: m };
        });
    };

    const goToNextMonth = () => {
        setCurrentMonth(prev => {
            const m = prev.month + 1;
            return m > 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: m };
        });
    };

    // ═══════════ RENDER ═══════════

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Spending</h1>
                    <p className="text-muted-foreground mt-1">See every transaction, automatically categorized.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Month Nav */}
                    <div className="flex items-center gap-2 bg-card border border-border rounded-2xl px-4 py-2">
                        <button onClick={goToPrevMonth} className="p-1 hover:bg-muted rounded-lg transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold min-w-[140px] text-center">{monthName}</span>
                        <button onClick={goToNextMonth} className="p-1 hover:bg-muted rounded-lg transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    {/* View Toggle */}
                    <div className="flex items-center bg-card border border-border rounded-2xl p-1 gap-0.5">
                        <button
                            onClick={() => setViewMode("calendar")}
                            className={`p-2 rounded-xl transition-all ${viewMode === "calendar" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Calendar className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <BarChart3 className="w-4 h-4" />
                        </button>
                    </div>
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
                                <p className="text-xs text-muted-foreground">Connect a bank account in your <a href="/app/portfolio" className="text-primary underline underline-offset-2 hover:opacity-80">Portfolio</a> to see your real spending.</p>
                            </div>
                        </div>
                    )}

                    {/* ═══════════ STAT CARDS ═══════════ */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Total Spent */}
                        <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                                <TrendingDown className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Spent this month</p>
                                <p className="text-2xl font-bold text-foreground">${displayTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                        {/* Transactions */}
                        <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Transactions</p>
                                <p className="text-2xl font-bold text-foreground">{displayTx.filter(t => t.amount > 0 && !t.pending).length}</p>
                            </div>
                        </div>
                        {/* Categories */}
                        <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</p>
                                <p className="text-2xl font-bold text-foreground">{Object.keys(displayCats).length}</p>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════ MAIN CONTENT ═══════════ */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Calendar / List View */}
                        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                    {viewMode === "calendar" ? "Spend This Month" : "Recent Transactions"}
                                </h3>
                            </div>

                            {viewMode === "calendar" ? (
                                <>
                                    {/* Day headers */}
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => (
                                            <div key={d} className="text-[10px] font-bold text-muted-foreground text-center py-1">{d}</div>
                                        ))}
                                    </div>
                                    {/* Calendar grid */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {calendarDays.map((day) => (
                                            <div
                                                key={day.key}
                                                onClick={() => !day.isPad && setSelectedDate(day.key === selectedDate ? null : day.key)}
                                                className={`
                                                    relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all
                                                    ${day.isPad ? "" : "hover:bg-muted/50 cursor-pointer"}
                                                    ${day.isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}
                                                    ${day.key === selectedDate ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-card" : ""}
                                                `}
                                                style={
                                                    !day.isPad && day.amount > 0
                                                        ? { backgroundColor: `rgba(239,68,68,${Math.min(0.4, (day.amount / maxDailySpend) * 0.4 + 0.05)})` }
                                                        : undefined
                                                }
                                            >
                                                {!day.isPad && (
                                                    <>
                                                        <span className={`font-semibold ${day.isToday ? "text-primary" : "text-foreground"}`}>{day.date}</span>
                                                        {day.amount > 0 && (
                                                            <span className="text-[9px] font-bold text-red-400 mt-0.5">
                                                                ${day.amount >= 1000 ? `${(day.amount / 1000).toFixed(1)}k` : Math.round(day.amount)}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* ═══ Selected Day Detail Panel ═══ */}
                                    {selectedDate && selectedDayTx.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-border animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="text-sm font-bold text-foreground">{selectedDateFormatted}</h4>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {selectedDayTx.length} transaction{selectedDayTx.length !== 1 ? "s" : ""} · ${selectedDayTotal.toFixed(2)} spent
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedDate(null)}
                                                    className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-1">
                                                {selectedDayTx.map(tx => {
                                                    const conf = getCategoryConfig(tx.category);
                                                    return (
                                                        <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                                                            <span className="text-base shrink-0">{conf.emoji}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-foreground truncate">{tx.merchant_name}</p>
                                                                <p className="text-xs text-muted-foreground">{conf.label}</p>
                                                            </div>
                                                            <span className={`text-sm font-bold tabular-nums ${tx.amount > 0 ? "text-red-400" : "text-green-400"}`}>
                                                                {tx.amount > 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {selectedDate && selectedDayTx.length === 0 && (
                                        <div className="mt-6 pt-6 border-t border-border text-center py-6">
                                            <p className="text-sm text-muted-foreground">No transactions on {selectedDateFormatted}</p>
                                            <button
                                                onClick={() => setSelectedDate(null)}
                                                className="text-xs text-primary mt-2 hover:underline"
                                            >
                                                Clear selection
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* List View */
                                <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {recentTransactions.map(tx => {
                                        const conf = getCategoryConfig(tx.category);
                                        return (
                                            <div key={tx.id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors">
                                                <span className="text-lg shrink-0">{conf.emoji}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-foreground truncate">{tx.merchant_name}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {conf.label}</p>
                                                </div>
                                                <span className={`text-sm font-bold tabular-nums ${tx.amount > 0 ? "text-red-400" : "text-green-400"}`}>
                                                    {tx.amount > 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Category Breakdown */}
                        <div className="bg-card border border-border rounded-3xl p-6">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">By Category</h3>
                            <div className="space-y-4">
                                {sortedCategories.map(([cat, data]) => {
                                    const conf = getCategoryConfig(cat);
                                    const pct = displayTotal > 0 ? (data.total / displayTotal) * 100 : 0;
                                    return (
                                        <div key={cat} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">{conf.emoji}</span>
                                                    <span className="text-sm font-medium text-foreground">{conf.label}</span>
                                                </div>
                                                <span className="text-sm font-bold text-muted-foreground tabular-nums">{pct.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%`, backgroundColor: conf.color }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                ${data.total.toFixed(2)} · {data.count} transaction{data.count !== 1 ? "s" : ""}
                                            </p>
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
