import { useState } from "react";
import { useMyRAChat } from "@/hooks/useMyRAChat";
import ChatSidebar from "@/components/chat-ui/ChatSidebar";
import ChatArea from "@/components/chat-ui/ChatArea";

export default function AgentChat() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const {
        messages, input, setInput, sendMessage, clearChat,
        isLoading, isTyping,
        chatId, chatList, switchChat, renameChat, deleteChat, userName
    } = useMyRAChat();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex h-screen w-full bg-gradient-to-b from-[#1a1b2e] to-[#14152a] text-gray-100 overflow-hidden font-sans">
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
            />
        </div>
    );
}
