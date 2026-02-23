import { Plus, MessageSquare, Menu, Settings } from "lucide-react";

interface ChatSidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

export default function ChatSidebar({ isOpen, toggleSidebar }: ChatSidebarProps) {
    return (
        <div
            className={`flex-shrink-0 bg-[#0f111a] border-r border-white/5 h-full flex flex-col transition-all duration-300 ${isOpen ? "w-[260px]" : "w-0 overflow-hidden border-r-0"
                }`}
        >
            <div className="p-3 w-[260px] flex-1 flex flex-col pb-0">
                <button className="flex items-center gap-2 bg-[#2d68ff] hover:bg-[#255ce6] text-white rounded-lg px-3 py-3 font-medium transition-colors w-full mb-6">
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">New Chat</span>
                </button>

                <div className="flex-1 overflow-y-auto w-full custom-scrollbar pr-2">
                    {/* Mock History Sections for visual fidelity */}
                    <div className="mb-6 w-full">
                        <h3 className="text-xs font-semibold text-gray-500 mb-3 px-2 uppercase tracking-wide">Today</h3>
                        <div className="space-y-1">
                            <button className="flex items-center gap-3 w-full text-left px-2 py-2 rounded-md hover:bg-white/5 bg-white/5 text-gray-200 group">
                                <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                                <span className="text-sm truncate">Retirement Income Gap</span>
                            </button>
                        </div>
                    </div>

                    <div className="mb-6 w-full">
                        <h3 className="text-xs font-semibold text-gray-500 mb-3 px-2 uppercase tracking-wide">Previous 7 Days</h3>
                        <div className="space-y-1">
                            <button className="flex items-center gap-3 w-full text-left px-2 py-2 rounded-md hover:bg-white/5 text-gray-400 hover:text-gray-200 group">
                                <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
                                <span className="text-sm truncate">Asset Bucket Strategy</span>
                            </button>
                            <button className="flex items-center gap-3 w-full text-left px-2 py-2 rounded-md hover:bg-white/5 text-gray-400 hover:text-gray-200 group">
                                <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
                                <span className="text-sm truncate">Social Security Timing</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-3 border-t border-white/5 w-[260px]">
                <button className="flex items-center justify-between w-full px-2 py-3 rounded-md hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd8bb] to-[#ffb37b] flex items-center justify-center text-[#9b5110] font-bold text-sm">
                            KD
                        </div>
                        <div className="text-left flex flex-col">
                            <span className="text-sm font-medium text-gray-200">Kyle Doe</span>
                            <span className="text-xs text-gray-500">Pro Plan</span>
                        </div>
                    </div>
                    <Settings className="w-4 h-4 text-gray-400" />
                </button>
            </div>
        </div>
    );
}
