import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    PieChart,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    DollarSign,
    Target,
    CheckCircle2,
    AlertTriangle,
    X,
    Save,
    Wallet,
} from "lucide-react";

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface CategorySpending {
    total: number;
    count: number;
}

interface BudgetEntry {
    category: string;
    monthly_limit: number;
}

// Category display config
const BUDGET_CATEGORIES: Record<string, { emoji: string; color: string; label: string }> = {
    FOOD_AND_DRINK: { emoji: "🍽️", color: "#F59E0B", label: "Food & Drink" },
    TRANSPORTATION: { emoji: "🚗", color: "#3B82F6", label: "Transportation" },
    SHOPPING: { emoji: "🛍️", color: "#EC4899", label: "Shopping" },
    ENTERTAINMENT: { emoji: "🎬", color: "#8B5CF6", label: "Entertainment" },
    RENT_AND_UTILITIES: { emoji: "🏠", color: "#10B981", label: "Rent & Utilities" },
    PERSONAL_CARE: { emoji: "💇", color: "#F97316", label: "Personal Care" },
    GENERAL_SERVICES: { emoji: "🔧", color: "#6B7280", label: "Services" },
    GENERAL_MERCHANDISE: { emoji: "📦", color: "#14B8A6", label: "Merchandise" },
    TRAVEL: { emoji: "✈️", color: "#0EA5E9", label: "Travel" },
    LOAN_PAYMENTS: { emoji: "🏦", color: "#6366F1", label: "Loan Payments" },
    MEDICAL: { emoji: "🏥", color: "#EF4444", label: "Medical" },
    Other: { emoji: "📝", color: "#9CA3AF", label: "Other" },
};

function getCat(cat: string) {
    return BUDGET_CATEGORIES[cat] || BUDGET_CATEGORIES.Other;
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

export default function BudgetPage() {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Record<string, CategorySpending>>({});
    const [totalSpending, setTotalSpending] = useState(0);
    const [budgets, setBudgets] = useState<BudgetEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [newLimit, setNewLimit] = useState("");

    // Load budgets from localStorage
    useEffect(() => {
        if (!user?.id) return;
        const stored = localStorage.getItem(`myra_budgets_${user.id}`);
        if (stored) {
            try { setBudgets(JSON.parse(stored)); } catch { }
        }
    }, [user?.id]);

    // Save budgets to localStorage
    const saveBudgets = (updated: BudgetEntry[]) => {
        setBudgets(updated);
        if (user?.id) {
            localStorage.setItem(`myra_budgets_${user.id}`, JSON.stringify(updated));
        }
    };

    // Fetch spending data for current month
    useEffect(() => {
        if (!user?.id) return;

        const fetchSpending = async () => {
            setLoading(true);
            try {
                const now = new Date();
                const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
                const endDate = now.toISOString().split("T")[0];

                const res = await fetch("/api/plaid/transactions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: user.id, start_date: startDate, end_date: endDate }),
                });

                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                setCategories(data.categories || {});
                setTotalSpending(data.total_spending || 0);

                // Auto-create budgets for new categories if none exist
                if (budgets.length === 0 && data.categories) {
                    const autoBudgets: BudgetEntry[] = Object.entries(data.categories as Record<string, CategorySpending>)
                        .map(([cat, info]) => ({
                            category: cat,
                            monthly_limit: Math.ceil(info.total * 1.2 / 50) * 50, // Round up to nearest 50, +20% buffer
                        }));
                    saveBudgets(autoBudgets);
                }
            } catch { } finally {
                setLoading(false);
            }
        };

        fetchSpending();
    }, [user?.id]);

    // ═══════════ Computed ═══════════

    const totalBudget = useMemo(() => budgets.reduce((s, b) => s + b.monthly_limit, 0), [budgets]);

    const overallPct = totalBudget > 0 ? Math.min(100, (totalSpending / totalBudget) * 100) : 0;

    const budgetWithSpending = useMemo(() => {
        return budgets.map(b => {
            const spent = categories[b.category]?.total || 0;
            const pct = b.monthly_limit > 0 ? (spent / b.monthly_limit) * 100 : 0;
            return { ...b, spent, pct };
        }).sort((a, b) => b.pct - a.pct);
    }, [budgets, categories]);

    // ═══════════ Actions ═══════════

    const handleSaveEdit = (category: string) => {
        const amt = parseFloat(editAmount);
        if (isNaN(amt) || amt <= 0) return;
        const updated = budgets.map(b => b.category === category ? { ...b, monthly_limit: amt } : b);
        saveBudgets(updated);
        setEditingCategory(null);
    };

    const handleDelete = (category: string) => {
        saveBudgets(budgets.filter(b => b.category !== category));
    };

    const handleAdd = () => {
        if (!newCategory || !newLimit) return;
        const amt = parseFloat(newLimit);
        if (isNaN(amt) || amt <= 0) return;
        saveBudgets([...budgets, { category: newCategory, monthly_limit: amt }]);
        setShowAddModal(false);
        setNewCategory("");
        setNewLimit("");
    };

    // ═══════════ RENDER ═══════════

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Budget</h1>
                    <p className="text-muted-foreground mt-1">AI sets up your budget and helps you track progress all month long.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : totalSpending === 0 && budgets.length === 0 ? (
                <div className="text-center py-32">
                    <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No spending data yet</h3>
                    <p className="text-sm text-muted-foreground">Connect a bank account in your Portfolio to auto-generate your budget.</p>
                </div>
            ) : (
                <>
                    {/* ═══════════ TOTAL BUDGET CARD ═══════════ */}
                    <div className="bg-card border border-border rounded-3xl p-8">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Total Budget</h3>
                            <span className="text-sm font-bold text-foreground tabular-nums">
                                ${totalSpending.toLocaleString("en-US", { minimumFractionDigits: 2 })} of ${totalBudget.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                            </span>
                        </div>
                        <div className="h-4 bg-muted rounded-full overflow-hidden mb-2">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${overallPct > 90 ? "bg-red-500" : overallPct > 70 ? "bg-amber-500" : "bg-primary"}`}
                                style={{ width: `${Math.min(100, overallPct)}%` }}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground text-right tabular-nums">{overallPct.toFixed(1)}%</p>
                    </div>

                    {/* ═══════════ CATEGORY BUDGETS ═══════════ */}
                    <div className="space-y-3">
                        {budgetWithSpending.map(item => {
                            const conf = getCat(item.category);
                            const isOver = item.pct > 100;
                            const isWarning = item.pct > 80;
                            const isEditing = editingCategory === item.category;

                            return (
                                <div key={item.category} className="bg-card border border-border rounded-3xl p-5 transition-all hover:border-border/80">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-xl">{conf.emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-foreground">{conf.label}</span>
                                                {isOver && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                                {!isOver && item.pct > 0 && !isWarning && <CheckCircle2 className="w-4 h-4 text-green-500 opacity-50" />}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isEditing ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-muted-foreground text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={editAmount}
                                                        onChange={e => setEditAmount(e.target.value)}
                                                        className="w-20 bg-muted border border-border rounded-lg px-2 py-1 text-sm tabular-nums"
                                                        autoFocus
                                                        onKeyDown={e => e.key === "Enter" && handleSaveEdit(item.category)}
                                                    />
                                                    <button onClick={() => handleSaveEdit(item.category)} className="p-1 text-green-500 hover:bg-green-500/10 rounded-lg">
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setEditingCategory(null)} className="p-1 text-muted-foreground hover:bg-muted rounded-lg">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-sm font-bold text-foreground tabular-nums">
                                                        ${item.spent.toFixed(0)} / ${item.monthly_limit.toFixed(0)}
                                                    </span>
                                                    <button
                                                        onClick={() => { setEditingCategory(item.category); setEditAmount(String(item.monthly_limit)); }}
                                                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.category)}
                                                        className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-red-500" : isWarning ? "bg-amber-500" : ""}`}
                                            style={{
                                                width: `${Math.min(100, item.pct)}%`,
                                                backgroundColor: !isOver && !isWarning ? conf.color : undefined,
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1.5 tabular-nums">{item.pct.toFixed(1)}%</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ═══════════ ADD BUDGET MODAL ═══════════ */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
                    <div className="bg-card border border-border rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-foreground mb-6">Add Budget Category</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Category</label>
                                <select
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm"
                                >
                                    <option value="">Select category...</option>
                                    {Object.entries(BUDGET_CATEGORIES)
                                        .filter(([key]) => !budgets.some(b => b.category === key))
                                        .map(([key, val]) => (
                                            <option key={key} value={key}>{val.emoji} {val.label}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Monthly Limit</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">$</span>
                                    <input
                                        type="number"
                                        value={newLimit}
                                        onChange={e => setNewLimit(e.target.value)}
                                        placeholder="500"
                                        className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm tabular-nums"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 rounded-2xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={!newCategory || !newLimit}
                                className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                Add Budget
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
