import { useState } from "react";
import { useMyRAChat } from "@/hooks/useMyRAChat";
import ChatSidebar from "@/components/chat-ui/ChatSidebar";
import ChatArea from "@/components/chat-ui/ChatArea";

export default function AgentChat() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { messages, input, setInput, sendMessage, isLoading, isTyping } = useMyRAChat();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex h-screen w-full bg-[#1e1e2f] text-gray-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <ChatSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

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
