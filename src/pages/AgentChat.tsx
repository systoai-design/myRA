import { useState } from "react";
import { useMyRAChat } from "@/hooks/useMyRAChat";
import ChatSidebar from "@/components/chat-ui/ChatSidebar";
import ChatArea from "@/components/chat-ui/ChatArea";

export default function AgentChat() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const {
        messages, input, setInput, sendMessage, clearChat,
        isLoading, isTyping,
        chatId, chatList, switchChat, renameChat, deleteChat, userName,
        isDeveloperMode
    } = useMyRAChat();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="relative flex h-screen w-full text-gray-100 overflow-hidden font-sans">
            {/* Background Video (matching Hero) */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900 pointer-events-none">
                <video
                    className="absolute inset-0 w-full h-full object-cover scale-105 pointer-events-none"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                >
                    <source src="/video_background_seamless.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-blue-900/30 pointer-events-none" />
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
                />
            </div>
        </div>
    );
}
