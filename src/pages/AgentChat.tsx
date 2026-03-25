import { useState } from "react";
import { useMyRAChat } from "@/hooks/useMyRAChat";
import ChatSidebar from "@/components/chat-ui/ChatSidebar";
import ChatArea from "@/components/chat-ui/ChatArea";
import { useAuth } from "@/contexts/AuthContext";

export default function AgentChat() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const {
        messages, input, setInput, sendMessage, clearChat,
        isLoading, isTyping,
        chatId, chatList, switchChat, renameChat, deleteChat, userName,
        isDeveloperMode
    } = useMyRAChat();
    const { role, testRole } = useAuth();
    const effectiveRole = testRole || role;

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="relative flex h-screen w-full text-gray-100 overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 bg-[#030508] pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030508] to-[#030508]" />
            </div>

            <div className="relative z-10 flex h-full w-full gap-4 p-4">
                {/* Sidebar */}
                <ChatSidebar
                    isOpen={sidebarOpen}
                    toggleSidebar={toggleSidebar}
                    clearChat={clearChat}
                    chatList={chatList}
                    activeChatId={chatId}
                    switchChat={switchChat}
                    renameChat={renameChat}
                    deleteChat={deleteChat}
                    userName={userName}
                />

                {/* Main Chat Area */}
                <ChatArea
                    messages={messages}
                    input={input}
                    setInput={setInput}
                    sendMessage={sendMessage}
                    isLoading={isLoading}
                    isTyping={isTyping}
                    toggleSidebar={toggleSidebar}
                    isDeveloperMode={isDeveloperMode}
                    isAdmin={effectiveRole === 'admin'}
                />
            </div>
        </div>
    );
}
