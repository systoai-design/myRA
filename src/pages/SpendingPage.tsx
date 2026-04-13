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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

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
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [user?.id, currentMonth]);

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
                amount: dailySpending[dateStr] || 0,
                isToday: today.getDate() === d && today.getMonth() === currentMonth.month && today.getFullYear() === currentMonth.year,
                isPad: false,
            });
        }
        return days;
    }, [currentMonth, dailySpending]);

    // Max daily spend for heat-map intensity
    const maxDailySpend = useMemo(() => {
        return Math.max(1, ...Object.values(dailySpending));
    }, [dailySpending]);

    // Sorted categories
    const sortedCategories = useMemo(() => {
        return Object.entries(categories)
            .sort(([, a], [, b]) => b.total - a.total);
    }, [categories]);

    // Recent transactions (last 10)
    const recentTransactions = useMemo(() => {
        return [...transactions]
            .filter(tx => !tx.pending)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 15);
    }, [transactions]);

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
            ) : error ? (
                <div className="text-center py-32 text-destructive">
                    <p className="font-semibold">Failed to load transactions</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-32">
                    <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No transactions yet</h3>
                    <p className="text-sm text-muted-foreground">Connect a bank account in your Portfolio to see spending data.</p>
                </div>
            ) : (
                <>
                    {/* ═══════════ STAT CARDS ═══════════ */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Total Spent */}
                        <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                                <TrendingDown className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Spent this month</p>
                                <p className="text-2xl font-bold text-foreground">${totalSpending.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                        {/* Transactions */}
                        <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Transactions</p>
                                <p className="text-2xl font-bold text-foreground">{transactions.filter(t => t.amount > 0 && !t.pending).length}</p>
                            </div>
                        </div>
                        {/* Categories */}
                        <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</p>
                                <p className="text-2xl font-bold text-foreground">{Object.keys(categories).length}</p>
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
                                                className={`
                                                    relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all
                                                    ${day.isPad ? "" : "hover:bg-muted/50 cursor-default"}
                                                    ${day.isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}
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
                                    const pct = totalSpending > 0 ? (data.total / totalSpending) * 100 : 0;
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
