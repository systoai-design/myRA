import { useState, useRef, useEffect, Fragment } from "react";
import { usePuraChat, ChatMessage, SelectionConfig, AvailableSlot, ContactInfo } from "@/hooks/usePuraChat";
import { Send, RefreshCw, Check, Calendar, ArrowRight } from "lucide-react";
import puraAvatar from "@/assets/pura-avatar.png";

interface PuraChatProps {
  className?: string;
}

export default function PuraChat({ className = "" }: PuraChatProps) {
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
    handleBookLater,
    requiresStrictSelection,
  } = usePuraChat();
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
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
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
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            onQuickReply={handleQuickReply}
            onContactSubmit={handleContactSubmit}
            onSlotSelect={handleSlotSelect}
            onSeeAllSlots={handleSeeAllSlots}
            onBookLater={handleBookLater}
            isLoading={isLoading}
            isLastUserMessage={message.role === "user" && index === messages.length - 1}
            showReadReceipt={message.role === "user" && message.isRead === true}
          />
        ))}

        {/* Typing indicator - only show when actually typing, not reading */}
        {(isTyping || (isLoading && !isReading && messages[messages.length - 1]?.role === "user")) && (
          <div className="flex items-start gap-3">
            <img
              src={puraAvatar}
              alt="Pura"
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
            <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2.5">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-2">
            <p className="text-base text-destructive">{error}</p>
            <button
              onClick={() => sendMessage(messages[messages.length - 1]?.content || "")}
              className="text-sm text-primary hover:underline mt-1"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Input Area - fixed height, never shrinks */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 p-3 border-t border-border bg-card">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={requiresStrictSelection ? "Please select an option above" : "Type a message..."}
            disabled={isLoading || requiresStrictSelection}
            className="flex-1 px-4 py-2.5 bg-muted rounded-full text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
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
  onBookLater: () => void;
  isLoading: boolean;
  isLastUserMessage?: boolean;
  showReadReceipt?: boolean;
}

function MessageBubble({ message, onQuickReply, onContactSubmit, onSlotSelect, onSeeAllSlots, onBookLater, isLoading, showReadReceipt }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <img
          src={puraAvatar}
          alt="Pura"
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        />
      )}
      <div className={`flex flex-col gap-2 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-base leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          }`}
        >
          {renderMessageContent(message.content)}
        </div>
        
        {/* Read receipt for user messages */}
        {isUser && showReadReceipt && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Check className="w-3 h-3" />
            <Check className="w-3 h-3 -ml-2" />
            <span className="text-[10px]">Read</span>
          </div>
        )}

        {/* Contact Form */}
        {message.showContactForm && (
          <ContactForm onSubmit={onContactSubmit} disabled={isLoading} />
        )}

        {/* Slot Selector */}
        {message.showSlotSelector && message.availableSlots && (
          <SlotSelector 
            slots={message.availableSlots} 
            onSelect={onSlotSelect}
            onSeeAllSlots={onSeeAllSlots}
            onBookLater={onBookLater}
            disabled={isLoading} 
          />
        )}

        {/* Selection Options (Setting/Style/Scenery/Extras) */}
        {message.selectionOptions && (
          <SelectionButtons
            config={message.selectionOptions}
            onSubmit={(selected) => onQuickReply(selected.join(", "))}
            disabled={isLoading}
          />
        )}

        {/* Quick Reply Buttons */}
        {message.quickReplies && message.quickReplies.length > 0 && !message.selectionOptions && !message.showContactForm && !message.showSlotSelector && (
          // Special case: Wedding date question with input field
          message.quickReplies.includes("Not sure yet") ? (
            <WeddingDateInput 
              onSubmit={onQuickReply} 
              disabled={isLoading} 
            />
          ) : (
            <div className="flex flex-wrap gap-2 mt-1">
              {message.quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => onQuickReply(reply)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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

// Contact Form Component
interface ContactFormProps {
  onSubmit: (info: ContactInfo) => void;
  disabled: boolean;
}

function ContactForm({ onSubmit, disabled }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) 
      newErrors.email = "Valid email required";
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) 
      newErrors.phone = "Valid phone required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate() && !disabled && !submitted) {
      setSubmitted(true);
      onSubmit({ 
        name: name.trim(), 
        email: email.trim(), 
        phone: phone.trim() 
      });
    }
  };

  if (submitted) {
    return (
      <div className="mt-3 bg-primary/10 border border-primary/30 rounded-xl p-4">
        <div className="flex items-center gap-2 text-primary text-sm font-medium">
          <Check className="w-4 h-4" />
          <span>Contact info submitted</span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
          <p>{name}</p>
          <p>{email}</p>
          <p>{phone}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3 bg-muted/50 rounded-xl p-4 w-full max-w-sm">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          disabled={disabled}
          className="w-full px-3 py-2.5 text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={disabled}
          className="w-full px-3 py-2.5 text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Phone</label>
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="(555) 123-4567"
          disabled={disabled}
          className="w-full px-3 py-2.5 text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>
      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Submit
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Slot Selector Component
interface SlotSelectorProps {
  slots: AvailableSlot[];
  onSelect: (slot: AvailableSlot) => void;
  onSeeAllSlots: () => void;
  onBookLater: () => void;
  disabled: boolean;
}

function SlotSelector({ slots, onSelect, onSeeAllSlots, onBookLater, disabled }: SlotSelectorProps) {
  const [selected, setSelected] = useState<AvailableSlot | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (slot: AvailableSlot) => {
    if (submitted || disabled) return;
    setSelected(slot);
  };

  const handleConfirm = () => {
    if (selected && !disabled && !submitted) {
      setSubmitted(true);
      onSelect(selected);
    }
  };

  const handleSeeAllSlots = () => {
    if (!disabled && !submitted) {
      setSubmitted(true);
      onSeeAllSlots();
    }
  };

  const handleBookLater = () => {
    if (!disabled && !submitted) {
      setSubmitted(true);
      onBookLater();
    }
  };

  if (submitted) {
    return (
      <div className="mt-3 bg-primary/10 border border-primary/30 rounded-xl p-4">
        <div className="flex items-center gap-2 text-primary text-sm font-medium">
          <Calendar className="w-4 h-4" />
          <span>{selected ? selected.display : "Full calendar opened"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3 bg-muted/50 rounded-xl p-4 w-full">
      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Available times
      </p>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <button
            key={slot.datetime}
            onClick={() => handleSelect(slot)}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
              selected?.datetime === slot.datetime
                ? "bg-primary text-primary-foreground border-primary"
                : "border-primary/40 text-primary hover:border-primary hover:bg-primary/10"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {slot.display}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between">
          <button
            onClick={handleSeeAllSlots}
            disabled={disabled}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            See all time slots →
          </button>
          {selected && (
            <button
              onClick={handleConfirm}
              disabled={disabled}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirm
            </button>
          )}
        </div>
        <button
          onClick={handleBookLater}
          disabled={disabled}
          className="text-sm text-muted-foreground hover:text-foreground underline transition-colors disabled:opacity-50 text-center"
        >
          I'll book later
        </button>
      </div>
    </div>
  );
}

// Selection Buttons Component for Setting/Style/Scenery/Extras
interface SelectionButtonsProps {
  config: SelectionConfig;
  onSubmit: (selected: string[]) => void;
  disabled: boolean;
}

function SelectionButtons({ config, onSubmit, disabled }: SelectionButtonsProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const isSelectAll = config.selectAll === true;

  const toggleOption = (label: string) => {
    if (submitted || disabled) return;
    
    if (selected.includes(label)) {
      setSelected(selected.filter(s => s !== label));
    } else if (isSelectAll || selected.length < config.maxSelections) {
      setSelected([...selected, label]);
    }
  };

  const handleSubmit = () => {
    if (selected.length > 0 && !disabled) {
      setSubmitted(true);
      onSubmit(selected);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {selected.map(label => (
          <span
            key={label}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30"
          >
            {label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        {config.options.map(opt => {
          const isSelected = selected.includes(opt.label);
          const isDisabled = disabled || (!isSelectAll && selected.length >= config.maxSelections && !isSelected);
          
          return (
            <button
              key={opt.label}
              onClick={() => toggleOption(opt.label)}
              disabled={isDisabled}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-primary/40 text-primary hover:border-primary hover:bg-primary/10"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isSelected && <Check className="w-3 h-3 inline mr-1" />}
              {opt.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isSelectAll 
            ? `${selected.length} selected` 
            : `${selected.length}/${config.maxSelections} selected`}
        </p>
        {selected.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={disabled}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Confirm
          </button>
        )}
      </div>
    </div>
  );
}

// Wedding Date Input Component (Q0 - with text field + "Not sure yet")
interface WeddingDateInputProps {
  onSubmit: (value: string) => void;
  disabled: boolean;
}

function WeddingDateInput({ onSubmit, disabled }: WeddingDateInputProps) {
  const [dateValue, setDateValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get next year for placeholder
  const nextYear = new Date().getFullYear() + 1;

  // Check if a date is in the past
  const isDateInPast = (input: string): boolean => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const currentDay = now.getDate();

    const cleanInput = input.toLowerCase().trim();
    
    // Pattern 1: "June 2024" or "Jun 2024" (month + year only)
    const monthYearMatch = cleanInput.match(/^([a-z]+)\s*(\d{4})$/);
    if (monthYearMatch) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                          'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIndex = monthNames.findIndex(m => monthYearMatch[1].startsWith(m));
      const year = parseInt(monthYearMatch[2]);
      
      if (monthIndex !== -1) {
        if (year < currentYear) return true;
        if (year === currentYear && monthIndex < currentMonth) return true;
        // Also check if month is current month but we're past it
        if (year === currentYear && monthIndex === currentMonth) return true;
        return false;
      }
    }
    
    // Pattern 2: "June 15, 2024" or "June 15 2024" (full date with month name)
    const fullDateMatch = cleanInput.match(/^([a-z]+)\s*(\d{1,2})[,\s]+(\d{4})$/);
    if (fullDateMatch) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                          'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIndex = monthNames.findIndex(m => fullDateMatch[1].startsWith(m));
      const day = parseInt(fullDateMatch[2]);
      const year = parseInt(fullDateMatch[3]);
      
      if (monthIndex !== -1) {
        const inputDate = new Date(year, monthIndex, day);
        const today = new Date(currentYear, currentMonth, currentDay);
        return inputDate < today;
      }
    }
    
    // Pattern 3: "2024" (just a year)
    const yearOnlyMatch = cleanInput.match(/^(\d{4})$/);
    if (yearOnlyMatch) {
      const year = parseInt(yearOnlyMatch[1]);
      return year < currentYear;
    }
    
    // Pattern 4: "06/2024" or "6/2024" or "06-2024" (month/year)
    const monthSlashYearMatch = cleanInput.match(/^(\d{1,2})[\/-](\d{4})$/);
    if (monthSlashYearMatch) {
      const month = parseInt(monthSlashYearMatch[1]) - 1;
      const year = parseInt(monthSlashYearMatch[2]);
      
      if (year < currentYear) return true;
      if (year === currentYear && month <= currentMonth) return true;
      return false;
    }
    
    // Pattern 5: "06/15/2024" or "6/15/2024" (MM/DD/YYYY)
    const mmddyyyyMatch = cleanInput.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyyMatch) {
      const month = parseInt(mmddyyyyMatch[1]) - 1;
      const day = parseInt(mmddyyyyMatch[2]);
      const year = parseInt(mmddyyyyMatch[3]);
      
      const inputDate = new Date(year, month, day);
      const today = new Date(currentYear, currentMonth, currentDay);
      return inputDate < today;
    }
    
    // Pattern 6: "2024-06-15" (ISO format YYYY-MM-DD)
    const isoMatch = cleanInput.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1]);
      const month = parseInt(isoMatch[2]) - 1;
      const day = parseInt(isoMatch[3]);
      
      const inputDate = new Date(year, month, day);
      const today = new Date(currentYear, currentMonth, currentDay);
      return inputDate < today;
    }
    
    // Pattern 7: "2024 January" or "2024 june" (year + month name)
    const yearMonthMatch = cleanInput.match(/^(\d{4})\s+([a-z]+)$/);
    if (yearMonthMatch) {
      const year = parseInt(yearMonthMatch[1]);
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                          'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIndex = monthNames.findIndex(m => yearMonthMatch[2].startsWith(m));
      
      if (monthIndex !== -1) {
        if (year < currentYear) return true;
        if (year === currentYear && monthIndex <= currentMonth) return true;
        return false;
      }
    }
    
    // Fallback: Try native Date parsing for any other format
    const parsed = Date.parse(input);
    if (!isNaN(parsed)) {
      const inputDate = new Date(parsed);
      const today = new Date(currentYear, currentMonth, currentDay);
      today.setHours(0, 0, 0, 0);
      inputDate.setHours(0, 0, 0, 0);
      return inputDate < today;
    }
    
    // If we truly can't parse it, allow it through (AI will handle)
    return false;
  };

  const handleSubmitDate = () => {
    if (!dateValue.trim() || disabled || submitted) return;
    
    if (isDateInPast(dateValue)) {
      setError("Wedding date must be in the future");
      return;
    }
    
    setError(null);
    setSubmitted(true);
    onSubmit(dateValue.trim());
  };

  const handleNotSure = () => {
    if (!disabled && !submitted) {
      setSubmitted(true);
      onSubmit("Not sure yet");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmitDate();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateValue(e.target.value);
    if (error) setError(null); // Clear error when user types
  };

  if (submitted) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 mt-2">
      {error && (
        <p className="text-sm text-destructive px-1">{error}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={dateValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`e.g., June ${nextYear}`}
            disabled={disabled}
            className={`w-36 px-4 py-2 text-sm bg-muted border-2 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors disabled:opacity-50 ${
              error ? "border-destructive focus:border-destructive" : "border-primary/40 focus:border-primary"
            }`}
          />
          {dateValue.trim() && (
            <button
              onClick={handleSubmitDate}
              disabled={disabled}
              className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleNotSure}
          disabled={disabled}
          className="px-4 py-2 text-sm font-medium border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Not sure yet
        </button>
      </div>
    </div>
  );
}
