import { createContext, useContext, ReactNode } from "react";
import { usePuraChat, ChatMessage, SelectionConfig, AvailableSlot, ContactInfo } from "@/hooks/usePuraChat";

interface PuraChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  isReading: boolean;
  error: string | null;
  contactInfo: ContactInfo | null;
  sendMessage: (message: string) => void;
  resetChat: () => void;
  handleContactSubmit: (info: ContactInfo) => void;
  handleSlotSelect: (slot: AvailableSlot) => void;
  handleSeeAllSlots: () => void;
  requiresStrictSelection: boolean;
}

const PuraChatContext = createContext<PuraChatContextType | null>(null);

export function PuraChatProvider({ children }: { children: ReactNode }) {
  const chatState = usePuraChat();
  
  return (
    <PuraChatContext.Provider value={chatState}>
      {children}
    </PuraChatContext.Provider>
  );
}

export function usePuraChatContext() {
  const context = useContext(PuraChatContext);
  if (!context) {
    throw new Error("usePuraChatContext must be used within a PuraChatProvider");
  }
  return context;
}

export type { ChatMessage, SelectionConfig, AvailableSlot, ContactInfo };
