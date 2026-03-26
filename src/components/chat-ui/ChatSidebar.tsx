import { useState } from "react";
import { Plus, MessageSquare, Home, Pencil, Trash2, Check, X, Settings, LogOut, ShieldAlert, Loader2, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { ChatHistoryItem } from "@/hooks/useMyRAChat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChatSidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    clearChat: () => void;
    chatList: ChatHistoryItem[];
    activeChatId: string | null;
    switchChat: (id: string) => void;
    renameChat: (id: string, title: string) => void;
    deleteChat: (id: string) => void;
    userName: string | null;
}

// Group chats by relative time
function groupByTime(chats: ChatHistoryItem[]): Record<string, ChatHistoryItem[]> {
    const groups: Record<string, ChatHistoryItem[]> = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000);

    chats.forEach(chat => {
        const date = new Date(chat.updated_at);
        let label: string;
        if (date >= today) {
            label = "Today";
        } else if (date >= yesterday) {
            label = "Yesterday";
        } else if (date >= sevenDaysAgo) {
            label = "Previous 7 Days";
        } else {
            label = "Older";
        }
        if (!groups[label]) groups[label] = [];
        groups[label].push(chat);
    });

    return groups;
}

// Inline Auth Form for unauthenticated users
function InlineAuthForm() {
    const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                if (error.message.includes("Invalid login credentials")) {
                    toast.error("Invalid email or password");
                } else {
                    toast.error(error.message);
                }
            } else {
                toast.success("Welcome back!");
            }
        } catch {
            toast.error("An error occurred during login");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !firstName) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { first_name: firstName } },
            });
            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Account created! Welcome aboard, " + firstName + "!");
            }
        } catch {
            toast.error("An error occurred during signup");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-[280px] border-t border-border bg-background/90 backdrop-blur-xl px-4 py-4 space-y-3">
            {/* Tab Switcher */}
            <div className="flex rounded-lg bg-black/[0.03] dark:bg-white/5 border border-border p-0.5">
                <button
                    onClick={() => setAuthTab('login')}
                    className={`flex-1 text-[11px] font-bold py-1.5 rounded-md transition-all ${authTab === 'login'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                >
                    Sign In
                </button>
                <button
                    onClick={() => setAuthTab('signup')}
                    className={`flex-1 text-[11px] font-bold py-1.5 rounded-md transition-all ${authTab === 'signup'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                >
                    Sign Up
                </button>
            </div>

            <form onSubmit={authTab === 'login' ? handleLogin : handleSignup} className="space-y-2.5">
                {authTab === 'signup' && (
                    <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">First Name</label>
                        <input
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            placeholder="John"
                            className="w-full bg-black/[0.03] dark:bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/20 transition-all"
                            required
                        />
                    </div>
                )}
                <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-black/[0.03] dark:bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/20 transition-all"
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="â€¢â€¢â€¢â€¢â€¢â€¢"
                        className="w-full bg-black/[0.03] dark:bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/20 transition-all"
                        required
                        minLength={6}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-lg px-3 py-2.5 text-xs font-bold transition-all active:scale-[0.97] shadow-sm mt-1"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <LogIn className="w-3.5 h-3.5" />
                    )}
                    {authTab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
            </form>

            <p className="text-[10px] text-white/30 text-center leading-relaxed">
                {authTab === 'login'
                    ? 'Sign in to save your chats and retirement plan.'
                    : 'Create an account to save your progress.'}
            </p>
        </div>
    );
}

export default function ChatSidebar({
    isOpen, toggleSidebar, clearChat,
    chatList, activeChatId, switchChat, renameChat, deleteChat, userName
}: ChatSidebarProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [editName, setEditName] = useState(userName || "");
    const [isSavingName, setIsSavingName] = useState(false);
    const { user, signOut, role, testRole } = useAuth();
    const effectiveRole = testRole || role;

    const handleStartRename = (chat: ChatHistoryItem) => {
        setEditingId(chat.id);
        setEditTitle(chat.title);
    };

    const handleConfirmRename = async () => {
        if (editingId && editTitle.trim()) {
            await renameChat(editingId, editTitle.trim());
        }
        setEditingId(null);
        setEditTitle("");
    };

    const handleConfirmDelete = async (id: string) => {
        await deleteChat(id);
        setDeletingId(null);
    };

    const handleSaveName = async () => {
        if (!editName.trim()) return;
        setIsSavingName(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { first_name: editName.trim() }
            });
            if (error) {
                toast.error("Failed to update name");
            } else {
                toast.success("Name updated!");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsSavingName(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        toast.success("Signed out successfully");
    };

    const grouped = groupByTime(chatList);
    const groupOrder = ["Today", "Yesterday", "Previous 7 Days", "Older"];
    const userEmail = user?.email || "";

    return (
        <div
            className={`flex-shrink-0 bg-background/60 backdrop-blur-2xl border-r border-border h-full flex flex-col transition-all duration-300 rounded-r-3xl md:rounded-3xl overflow-hidden shadow-2xl ${isOpen ? "w-[280px]" : "w-0 opacity-0 border-none"
                }`}
        >
            <div className="p-4 w-[280px] flex-1 flex flex-col pb-0">
                <a href="/" className="flex items-center gap-2 text-white/80 hover:text-foreground hover:bg-black/[0.04] dark:bg-white/10 rounded-lg px-3 py-2.5 font-medium transition-all active:scale-[0.97] w-full mb-1">
                    <Home className="w-5 h-5" />
                    <span className="text-sm tracking-wide">Return to Home</span>
                </a>

                {effectiveRole === "admin" && (
                    <a href="/admin" className="flex items-center gap-2 text-primary/80 hover:text-primary hover:bg-primary/10 rounded-lg px-3 py-2.5 font-medium transition-all active:scale-[0.97] w-full mb-3">
                        <ShieldAlert className="w-5 h-5" />
                        <span className="text-sm tracking-wide">Admin Dashboard</span>
                    </a>
                )}

                <button
                    onClick={() => {
                        clearChat();
                        // Close sidebar on mobile
                        if (window.innerWidth < 1024) toggleSidebar();
                    }}
                    className="flex items-center gap-2 bg-white hover:bg-white/90 text-black rounded-lg px-3 py-3 font-semibold transition-colors w-full mb-6 shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">New Chat</span>
                </button>

                <div className="flex-1 overflow-y-auto w-full custom-scrollbar pr-2">
                    {chatList.length === 0 ? (
                        <div className="px-2 py-6 text-center">
                            <p className="text-xs text-muted-foreground font-medium">No conversations yet.</p>
                            <p className="text-xs text-foreground font-medium mt-1">Start a new chat to begin!</p>
                        </div>
                    ) : (
                        groupOrder.map(groupLabel => {
                            const items = grouped[groupLabel];
                            if (!items || items.length === 0) return null;

                            return (
                                <div key={groupLabel} className="mb-5 w-full">
                                    <h3 className="text-xs font-bold text-muted-foreground mb-2 px-2 uppercase tracking-wider">
                                        {groupLabel}
                                    </h3>
                                    <div className="space-y-0.5">
                                        {items.map(chat => {
                                            const isActive = chat.id === activeChatId;
                                            const isEditing = editingId === chat.id;
                                            const isDeleting = deletingId === chat.id;

                                            return (
                                                <div
                                                    key={chat.id}
                                                    className={`group flex items-center gap-2 w-full text-left px-2 py-2 rounded-md transition-colors cursor-pointer ${isActive
                                                        ? "bg-black/[0.04] dark:bg-white/10 text-foreground shadow-sm font-semibold border border-border"
                                                        : "text-muted-foreground hover:bg-black/[0.03] dark:bg-white/5 hover:text-foreground font-medium"
                                                        }`}
                                                    onClick={() => {
                                                        if (!isEditing && !isDeleting) {
                                                            switchChat(chat.id);
                                                            if (window.innerWidth < 1024) toggleSidebar();
                                                        }
                                                    }}
                                                >
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-1 flex-1 min-w-0">
                                                            <input
                                                                autoFocus
                                                                value={editTitle}
                                                                onChange={e => setEditTitle(e.target.value)}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') handleConfirmRename();
                                                                    if (e.key === 'Escape') setEditingId(null);
                                                                }}
                                                                className="flex-1 min-w-0 bg-black/[0.03] dark:bg-white/5 border border-white/20 rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-white/30"
                                                            />
                                                            <button onClick={handleConfirmRename} className="p-1 text-emerald-400 hover:text-emerald-300">
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:text-white">
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : isDeleting ? (
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <span className="text-xs text-red-500 font-bold truncate flex-1">Delete this chat?</span>
                                                            <button onClick={() => handleConfirmDelete(chat.id)} className="p-1 text-red-500 hover:text-red-400">
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => setDeletingId(null)} className="p-1 text-muted-foreground hover:text-white">
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => switchChat(chat.id)}
                                                                className="flex items-center gap-2 flex-1 min-w-0"
                                                            >
                                                                <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground group-hover:text-white" />
                                                                <span className="text-sm truncate">{chat.title || "Untitled"}</span>
                                                            </button>
                                                            <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                                                                <button
                                                                    onClick={e => { e.stopPropagation(); handleStartRename(chat); }}
                                                                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:bg-white/10 rounded transition-colors"
                                                                    title="Rename"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={e => { e.stopPropagation(); setDeletingId(chat.id); }}
                                                                    className="p-1 text-muted-foreground hover:text-red-500 hover:bg-black/[0.04] dark:bg-white/10 rounded transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Auth Section: Show inline auth form for guests, or account settings for logged-in users */}
            {!user ? (
                <InlineAuthForm />
            ) : (
                <>
                    {showSettings && (
                        <div className="w-[280px] border-t border-border bg-background/90 backdrop-blur-xl px-4 py-4 space-y-3">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Account Settings</h4>

                            {/* First Name */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-foreground/70">First Name</label>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); }}
                                        className="flex-1 min-w-0 bg-black/[0.03] dark:bg-white/5 border border-white/20 rounded px-2 py-1.5 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors"
                                        placeholder="Your name"
                                    />
                                    <button
                                        onClick={handleSaveName}
                                        disabled={isSavingName || editName.trim() === (userName || "")}
                                        className="px-2.5 py-1.5 bg-white text-black hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] rounded font-semibold transition-colors flex-shrink-0"
                                    >
                                        {isSavingName ? "..." : "Save"}
                                    </button>
                                </div>
                            </div>

                            {/* Email (read-only) */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-foreground/70">Email</label>
                                <div className="bg-black/[0.03] dark:bg-white/5 border border-border rounded px-2 py-1.5 text-xs text-muted-foreground font-medium truncate">
                                    {userEmail}
                                </div>
                            </div>

                            {/* Sign Out */}
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 w-full px-2 py-2 text-xs font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </button>
                        </div>
                    )}

                    <div className="p-3 w-[280px]">
                        <div className="flex items-center justify-between w-full px-2 py-2 rounded-md hover:bg-black/[0.03] dark:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/10 flex items-center justify-center text-foreground font-bold text-sm shadow-sm ring-1 ring-white/20">
                                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div className="text-left flex flex-col">
                                    <span className="text-sm font-bold text-white">{userName || "Guest"}</span>
                                    <span className="text-xs font-medium text-muted-foreground">{chatList.length} conversation{chatList.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className={`p-1.5 rounded-md transition-colors ${showSettings
                                    ? "text-foreground bg-white/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:bg-white/10"
                                    }`}
                                title="Account Settings"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
