import { useState, useEffect } from "react";
import { useMyRAChat } from "@/hooks/useMyRAChat";
import ChatArea from "@/components/chat-ui/ChatArea";
import { useAuth } from "@/contexts/AuthContext";
import InitialProfileSurvey from "@/components/dashboard/InitialProfileSurvey";
import { supabase } from "@/integrations/supabase/client";

export default function MyRAChatPage() {
    const [showSurvey, setShowSurvey] = useState(false);
    const {
        messages, input, setInput, sendMessage, clearChat,
        isLoading, isTyping,
        chatId, chatList, switchChat, renameChat, deleteChat, userName,
        buckets, activeChart,
        isDeveloperMode
    } = useMyRAChat();
    const { user, role, testRole } = useAuth();
    const [profileComplete, setProfileComplete] = useState(false);

    useEffect(() => {
        if (!user) return;
        const checkProfile = async () => {
            const { data } = await supabase
                .from('user_memory')
                .select('category')
                .eq('user_id', user.id)
                .in('category', ['state', 'marital_status']);
            
            if (data && data.length >= 2) {
                setProfileComplete(true);
            }
        };
        checkProfile();
    }, [user]);

    const effectiveRole = testRole || role;

    return (
        <div className="h-full w-full flex flex-col relative min-h-0">
            {/* Profile Survey Modal */}
            {showSurvey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-background border border-border rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 via-primary to-purple-500" />
                        <InitialProfileSurvey onComplete={() => setShowSurvey(false)} />
                    </div>
                </div>
            )}

            {/* Profile Calibration Banner */}
            {!profileComplete && (
                <div className="mb-4 bg-gradient-to-r from-blue-900/40 to-primary/20 border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top duration-500 shrink-0">
                    <div>
                        <h4 className="text-sm font-bold text-white">Action Required: Calibration</h4>
                        <p className="text-xs text-blue-200 mt-1">Complete your profile to unlock custom insights.</p>
                    </div>
                    <button 
                        onClick={() => setShowSurvey(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-foreground text-xs font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/20 cursor-pointer"
                    >
                        Start Survey
                    </button>
                </div>
            )}

            {/* Full-Screen Chat */}
            <div className="flex-1 w-full max-w-5xl mx-auto min-h-0 overflow-hidden">
                <ChatArea
                    messages={messages}
                    input={input}
                    setInput={setInput}
                    sendMessage={sendMessage}
                    isLoading={isLoading}
                    isTyping={isTyping}
                    isDeveloperMode={isDeveloperMode}
                    isAdmin={effectiveRole === 'admin'}
                    chatList={chatList}
                    activeChatId={chatId}
                    switchChat={switchChat}
                    clearChat={clearChat}
                    renameChat={renameChat}
                    deleteChat={deleteChat}
                />
            </div>
        </div>
    );
}
