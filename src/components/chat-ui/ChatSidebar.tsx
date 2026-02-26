import { useState } from "react";
import { Plus, MessageSquare, Home, Pencil, Trash2, Check, X, Settings, LogOut } from "lucide-react";
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
    const { user, signOut } = useAuth();

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
            className={`flex-shrink-0 bg-gradient-to-b from-[#0f111a] to-[#0c0e18] border-r border-white/[0.06] h-full flex flex-col transition-all duration-300 ${isOpen ? "w-[260px]" : "w-0 overflow-hidden border-r-0"
                }`}
        >
            <div className="p-3 w-[260px] flex-1 flex flex-col pb-0">
                <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg px-3 py-2.5 font-medium transition-all active:scale-[0.97] w-full mb-3">
                    <Home className="w-5 h-5" />
                    <span className="text-sm">Return to Home</span>
                </Link>

                <button
                    onClick={clearChat}
                    className="flex items-center gap-2 bg-[#2d68ff] hover:bg-[#255ce6] text-white rounded-lg px-3 py-3 font-medium transition-colors w-full mb-6 shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">New Chat</span>
                </button>

                <div className="flex-1 overflow-y-auto w-full custom-scrollbar pr-2">
                    {chatList.length === 0 ? (
                        <div className="px-2 py-6 text-center">
                            <p className="text-xs text-gray-500">No conversations yet.</p>
                            <p className="text-xs text-gray-600 mt-1">Start a new chat to begin!</p>
                        </div>
                    ) : (
                        groupOrder.map(groupLabel => {
                            const items = grouped[groupLabel];
                            if (!items || items.length === 0) return null;

                            return (
                                <div key={groupLabel} className="mb-5 w-full">
                                    <h3 className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wide">
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
                                                        ? "bg-white/10 text-gray-100"
                                                        : "hover:bg-white/5 text-gray-400 hover:text-gray-200"
                                                        }`}
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
                                                                className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#2d68ff]"
                                                            />
                                                            <button onClick={handleConfirmRename} className="p-1 text-emerald-400 hover:text-emerald-300">
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-200">
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : isDeleting ? (
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <span className="text-xs text-red-400 truncate flex-1">Delete this chat?</span>
                                                            <button onClick={() => handleConfirmDelete(chat.id)} className="p-1 text-red-400 hover:text-red-300">
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => setDeletingId(null)} className="p-1 text-gray-400 hover:text-gray-200">
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => switchChat(chat.id)}
                                                                className="flex items-center gap-2 flex-1 min-w-0"
                                                            >
                                                                <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-gray-400" />
                                                                <span className="text-sm truncate">{chat.title || "Untitled"}</span>
                                                            </button>
                                                            <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                                                                <button
                                                                    onClick={e => { e.stopPropagation(); handleStartRename(chat); }}
                                                                    className="p-1 text-gray-500 hover:text-gray-300 rounded transition-colors"
                                                                    title="Rename"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={e => { e.stopPropagation(); setDeletingId(chat.id); }}
                                                                    className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
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

            {showSettings && (
                <div className="w-[260px] border-t border-white/5 bg-[#0d0f18] px-3 py-3 space-y-3">
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Account Settings</h4>

                    {/* First Name */}
                    <div className="space-y-1">
                        <label className="text-[11px] text-gray-500">First Name</label>
                        <div className="flex items-center gap-1.5">
                            <input
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); }}
                                className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#2d68ff] transition-colors"
                                placeholder="Your name"
                            />
                            <button
                                onClick={handleSaveName}
                                disabled={isSavingName || editName.trim() === (userName || "")}
                                className="px-2.5 py-1.5 bg-[#2d68ff] hover:bg-[#255ce6] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] rounded font-medium transition-colors flex-shrink-0"
                            >
                                {isSavingName ? "..." : "Save"}
                            </button>
                        </div>
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-1">
                        <label className="text-[11px] text-gray-500">Email</label>
                        <div className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-gray-400 truncate">
                            {userEmail}
                        </div>
                    </div>

                    {/* Sign Out */}
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-2 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                </div>
            )}

            {/* User profile bar */}
            <div className="p-3 border-t border-white/5 w-[260px]">
                <div className="flex items-center justify-between w-full px-2 py-2 rounded-md hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd8bb] to-[#ffb37b] flex items-center justify-center text-[#9b5110] font-bold text-sm">
                            {userName ? userName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="text-left flex flex-col">
                            <span className="text-sm font-medium text-gray-200">{userName || "Guest"}</span>
                            <span className="text-xs text-gray-500">{chatList.length} conversation{chatList.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-1.5 rounded-md transition-colors ${showSettings
                            ? "text-[#2d68ff] bg-[#2d68ff]/10"
                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                            }`}
                        title="Account Settings"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
