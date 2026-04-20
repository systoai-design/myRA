import { useState } from "react";
import { usePlaid } from "@/hooks/usePlaid";
import {
    Link2, Loader2, Building2, Unplug, RefreshCw,
    TrendingUp, BanknoteIcon, Wallet, DollarSign,
} from "lucide-react";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

const accountTypeIcon = (type: string) => {
    switch (type) {
        case "investment": return TrendingUp;
        case "depository": return BanknoteIcon;
        case "credit": return Wallet;
        default: return DollarSign;
    }
};

/**
 * Plaid "Linked Accounts" card. Handles Link-token flow, institution
 * grouping, account list, disconnect, and refresh. Lifted out of the
 * old PortfolioPage so it can live on the Integrations page.
 */
export default function LinkedAccountsCard() {
    const {
        linkedAccounts, isLinking, isLoadingAccounts,
        openPlaidLink, readyToLink, fetchAccounts, removeItem,
    } = usePlaid();
    const [removingId, setRemovingId] = useState<string | null>(null);

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

    return (
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-600/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Linked Accounts</h2>
                        <p className="text-muted-foreground text-sm">
                            {linkedAccounts.length > 0
                                ? `${Object.keys(institutions).length} institution${Object.keys(institutions).length !== 1 ? "s" : ""} linked`
                                : "Securely connect your bank and brokerage accounts."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {linkedAccounts.length > 0 && (
                            <button
                                onClick={fetchAccounts}
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoadingAccounts ? "animate-spin" : ""}`} />
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
                            const instName = accounts[0]?.institution_name || "Unknown Institution";
                            const instTotal = accounts.reduce((s, a) => s + (a.balances.current || 0), 0);
                            return (
                                <div key={itemId} className="rounded-2xl border border-border overflow-hidden">
                                    <div className="flex items-center justify-between px-5 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-b border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                <Building2 className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{instName}</p>
                                                <p className="text-[10px] text-muted-foreground tabular-nums">
                                                    {accounts.length} account{accounts.length !== 1 ? "s" : ""} · {formatCurrency(instTotal)}
                                                </p>
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
                                                                {acct.subtype || acct.type}{acct.mask ? ` · ****${acct.mask}` : ""}
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
