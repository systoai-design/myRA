import { useState, useRef, useEffect, Fragment } from "react";
import { usePuraChatContext, ChatMessage, ContactInfo, AvailableSlot, SelectionConfig } from "@/contexts/PuraChatContext";
import { Send, RefreshCw, Check, Calendar, ArrowRight } from "lucide-react";
import puraAvatar from "@/assets/pura-avatar.png";

interface PuraChatSharedProps {
  className?: string;
}

export default function PuraChatShared({ className = "" }: PuraChatSharedProps) {
  const { 
    messages, 
    isLoading,
    isTyping,
    isReading,
    error, 
    sendMessage, 
    resetChat,
    handleContactSubmit,
    handleSlotSelect,
    handleSeeAllSlots,
    requiresStrictSelection,
  } = usePuraChatContext();
  const [input, setInput] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const didInitialScrollRef = useRef(false);

  // Auto-scroll INSIDE the chat only (never scroll the page)
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const behavior: ScrollBehavior = didInitialScrollRef.current ? "smooth" : "auto";
    didInitialScrollRef.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleQuickReply = (reply: string) => {
    if (isLoading) return;
    sendMessage(reply);
  };

  return (
    <div className={`flex flex-col h-full bg-background overflow-hidden ${className}`}>
      {/* Chat Header - fixed height, never shrinks */}
      <div className="flex-shrink-0 flex items-center gap-3 p-3 border-b border-border bg-card">
        <div className="relative">
          <img
            src={puraAvatar}
            alt="Pura"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base">Pura</h3>
          <p className="text-sm text-muted-foreground">Your venue matching guide</p>
        </div>
        <button
          onClick={resetChat}
          className="flex-shrink-0 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Start over"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onQuickReply={handleQuickReply}
            onContactSubmit={handleContactSubmit}
            onSlotSelect={handleSlotSelect}
            onSeeAllSlots={handleSeeAllSlots}
            isLoading={isLoading}
            showReadReceipt={message.role === "user" && message.isRead === true}
          />
        ))}

        {/* Typing indicator */}
        {(isTyping || (isLoading && !isReading && messages[messages.length - 1]?.role === "user")) && (
          <div className="flex items-start gap-2.5">
            <img
              src={puraAvatar}
              alt="Pura"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-2">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 p-3 border-t border-border bg-card">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={requiresStrictSelection ? "Please select an option above" : "Type a message..."}
            disabled={isLoading || requiresStrictSelection}
            className="flex-1 px-3 py-2 bg-muted rounded-full text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || requiresStrictSelection}
            className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

// Render message content with clickable links
function renderMessageContent(content: string) {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlPattern);
  
  return parts.map((part, index) => {
    if (part.match(urlPattern)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80"
        >
          {part}
        </a>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

interface MessageBubbleProps {
  message: ChatMessage;
  onQuickReply: (reply: string) => void;
  onContactSubmit: (info: ContactInfo) => void;
  onSlotSelect: (slot: AvailableSlot) => void;
  onSeeAllSlots: () => void;
  isLoading: boolean;
  showReadReceipt?: boolean;
}

function MessageBubble({ message, onQuickReply, onContactSubmit, onSlotSelect, onSeeAllSlots, isLoading, showReadReceipt }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <img
          src={puraAvatar}
          alt="Pura"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      )}
      <div className={`flex flex-col gap-1.5 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-3 py-2 rounded-2xl text-base leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          }`}
        >
          {renderMessageContent(message.content)}
        </div>
        
        {/* Read receipt */}
        {isUser && showReadReceipt && (
          <div className="flex items-center gap-0.5 text-sm text-muted-foreground">
            <Check className="w-3 h-3" />
            <Check className="w-3 h-3 -ml-1.5" />
            <span className="text-xs">Read</span>
          </div>
        )}

        {/* Contact Form */}
        {message.showContactForm && (
          <ContactFormCompact onSubmit={onContactSubmit} disabled={isLoading} />
        )}

        {/* Slot Selector */}
        {message.showSlotSelector && message.availableSlots && (
          <SlotSelectorCompact 
            slots={message.availableSlots} 
            onSelect={onSlotSelect}
            onSeeAllSlots={onSeeAllSlots}
            disabled={isLoading} 
          />
        )}

        {/* Selection Options */}
        {message.selectionOptions && (
          <SelectionButtonsCompact
            config={message.selectionOptions}
            onSubmit={(selected) => onQuickReply(selected.join(", "))}
            disabled={isLoading}
          />
        )}

        {/* Quick Replies */}
        {message.quickReplies && message.quickReplies.length > 0 && !message.selectionOptions && !message.showContactForm && !message.showSlotSelector && (
          message.quickReplies.includes("Not sure yet") ? (
            <WeddingDateInputCompact onSubmit={onQuickReply} disabled={isLoading} />
          ) : (
          <div className="flex flex-wrap gap-1.5 mt-1">
              {message.quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => onQuickReply(reply)}
                  disabled={isLoading}
                  className="px-2.5 py-1 text-sm font-medium border border-primary text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Compact Contact Form for floating bubble
function ContactFormCompact({ onSubmit, disabled }: { onSubmit: (info: ContactInfo) => void; disabled: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleSubmit = () => {
    if (name && email && phone && !submitted) {
      setSubmitted(true);
      onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    }
  };

  if (submitted) {
    return (
      <div className="mt-2 bg-primary/10 border border-primary/30 rounded-lg p-3">
        <div className="flex items-center gap-2 text-primary text-xs font-medium">
          <Check className="w-3 h-3" />
          <span>Contact submitted</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 bg-muted/50 rounded-lg p-3 w-full">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        disabled={disabled}
        className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={disabled}
        className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(formatPhone(e.target.value))}
        placeholder="Phone"
        disabled={disabled}
        className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !name || !email || !phone}
        className="w-full py-2 text-sm bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1"
      >
        Submit <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

// Compact Slot Selector
function SlotSelectorCompact({ slots, onSelect, onSeeAllSlots, disabled }: { slots: AvailableSlot[]; onSelect: (slot: AvailableSlot) => void; onSeeAllSlots: () => void; disabled: boolean }) {
  const [selected, setSelected] = useState<AvailableSlot | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleConfirm = () => {
    if (selected && !submitted) {
      setSubmitted(true);
      onSelect(selected);
    }
  };

  const handleSeeAllSlots = () => {
    if (!submitted) {
      setSubmitted(true);
      onSeeAllSlots();
    }
  };

  if (submitted) {
    return (
      <div className="mt-2 bg-primary/10 border border-primary/30 rounded-lg p-3">
        <div className="flex items-center gap-2 text-primary text-xs font-medium">
          <Calendar className="w-3 h-3" />
          <span>{selected?.display || "Full calendar opened"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 bg-muted/50 rounded-lg p-3 w-full">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Calendar className="w-3 h-3" /> Available times
      </p>
      <div className="flex flex-wrap gap-1.5">
        {slots.map((slot) => (
          <button
            key={slot.datetime}
            onClick={() => setSelected(slot)}
            disabled={disabled}
            className={`px-2 py-1 text-xs font-medium rounded border transition-all ${
              selected?.datetime === slot.datetime
                ? "bg-primary text-primary-foreground border-primary"
                : "border-primary/40 text-primary hover:border-primary"
            }`}
          >
            {slot.display}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1">
        <button onClick={handleSeeAllSlots} disabled={disabled} className="text-xs text-muted-foreground hover:text-foreground">
          See all time slots →
        </button>
        {selected && (
          <button onClick={handleConfirm} disabled={disabled} className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-full font-medium flex items-center gap-1">
            <Check className="w-3 h-3" /> Confirm
          </button>
        )}
      </div>
    </div>
  );
}

// Compact Selection Buttons
function SelectionButtonsCompact({ config, onSubmit, disabled }: { config: SelectionConfig; onSubmit: (selected: string[]) => void; disabled: boolean }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleOption = (label: string) => {
    if (submitted) return;
    if (selected.includes(label)) {
      setSelected(selected.filter(s => s !== label));
    } else if (config.selectAll || selected.length < config.maxSelections) {
      setSelected([...selected, label]);
    }
  };

  const handleSubmit = () => {
    if (selected.length > 0 && !submitted) {
      setSubmitted(true);
      onSubmit(selected);
    }
  };

  if (submitted) {
    return (
      <div className="mt-2 bg-primary/10 border border-primary/30 rounded-lg p-3">
        <p className="text-xs text-primary font-medium">{selected.join(", ")}</p>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 bg-muted/50 rounded-lg p-3 w-full">
      <p className="text-xs text-muted-foreground">
        {config.selectAll ? "Select all that apply" : `Select up to ${config.maxSelections}`}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {config.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => toggleOption(opt.label)}
            disabled={disabled}
            className={`px-2 py-1 text-xs font-medium rounded-full border transition-all ${
              selected.includes(opt.label)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-foreground hover:border-primary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <button onClick={handleSubmit} disabled={disabled} className="w-full py-1.5 text-sm bg-primary text-primary-foreground rounded-full font-medium">
          Continue →
        </button>
      )}
    </div>
  );
}

// Compact Wedding Date Input
function WeddingDateInputCompact({ onSubmit, disabled }: { onSubmit: (value: string) => void; disabled: boolean }) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get next year for placeholder
  const nextYear = new Date().getFullYear() + 1;

  // Check if a date is in the past
  const isDateInPast = (input: string): boolean => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const cleanInput = input.toLowerCase().trim();
    
    // Pattern: "June 2024" or "Jun 2024"
    const monthYearMatch = cleanInput.match(/^([a-z]+)\s*(\d{4})$/);
    if (monthYearMatch) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                          'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIndex = monthNames.findIndex(m => monthYearMatch[1].startsWith(m));
      const year = parseInt(monthYearMatch[2]);
      
      if (monthIndex !== -1) {
        if (year < currentYear) return true;
        if (year === currentYear && monthIndex <= currentMonth) return true;
        return false;
      }
    }
    
    // Fallback: Try native Date parsing
    const parsed = Date.parse(input);
    if (!isNaN(parsed)) {
      const inputDate = new Date(parsed);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      inputDate.setHours(0, 0, 0, 0);
      return inputDate < today;
    }
    
    return false;
  };

  const handleSubmit = () => {
    if (value && !submitted) {
      if (isDateInPast(value)) {
        setError("Wedding date must be in the future");
        return;
      }
      setError(null);
      setSubmitted(true);
      onSubmit(value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (error) setError(null);
  };

  if (submitted) {
    return (
      <div className="mt-2 bg-primary/10 border border-primary/30 rounded-lg p-2">
        <p className="text-xs text-primary font-medium">{value}</p>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2 w-full">
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={`e.g., June ${nextYear}`}
          disabled={disabled}
          className={`flex-1 px-2.5 py-1.5 text-sm bg-muted border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 ${
            error ? "border-destructive" : "border-border"
          }`}
        />
        <button onClick={handleSubmit} disabled={disabled || !value} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50">
          Send
        </button>
      </div>
      <button onClick={() => { setSubmitted(true); onSubmit("Not sure yet"); }} disabled={disabled} className="text-sm text-primary hover:underline self-start">
        Not sure yet
      </button>
    </div>
  );
}
