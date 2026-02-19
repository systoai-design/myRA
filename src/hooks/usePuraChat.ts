import { useState, useCallback, useRef, useEffect, useMemo } from "react";

export interface SelectionOption {
  label: string;
}

export interface SelectionConfig {
  type: "setting" | "style" | "scenery" | "extras";
  options: SelectionOption[];
  maxSelections: number;
  selectAll?: boolean; // for "select all that apply"
}

export interface AvailableSlot {
  date: string;      // "2025-01-13"
  time: string;      // "10:00"
  datetime: string;  // ISO string for booking
  display: string;   // "Mon, Jan 13 @ 10:00 AM"
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  quickReplies?: string[];
  selectionOptions?: SelectionConfig;
  showContactForm?: boolean;
  showSlotSelector?: boolean;
  availableSlots?: AvailableSlot[];
  isRead?: boolean; // For read receipts on user messages
}

interface ScriptedMessage {
  content: string;
  delay: number;
  quickReplies?: string[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pura-chat`;
const SYNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-to-ghl`;
const BOOKING_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/book-ghl-appointment`;
const SLOTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-available-slots`;

// Session persistence
const STORAGE_KEY = "pura-chat-session";
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Initial messages when chat opens
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "intro-1",
    role: "assistant",
    content: "Hey, I'm Pura. You made the right click. I'm here to turn all those open tabs into the venues that actually fit your vibe.",
  },
  {
    id: "intro-2",
    role: "assistant",
    content: "I'm ready when you are. Want to get this started?",
    quickReplies: ["I'm ready", "Tell me more first"],
  },
];

// Scripted flows for specific quick replies (bypass AI)
// Delays are: typing indicator shows first, then message appears after delay
const SCRIPTED_FLOWS: Record<string, ScriptedMessage[]> = {
  "Tell me more first": [
    {
      content: "I match your wedding vision to the venues that actually fit—your date, budget, guest count, style, etc.",
      delay: 1200
    },
    {
      content: "You'll get a clear projection for your retirement. You will be able to walk through the options live with MyRA all for free.",
      delay: 1500
    },
    {
      content: "Ready to start your match?",
      quickReplies: ["Let's do it", "Why is it free?"],
      delay: 1000
    },
  ],
  "Why is it free?": [
    {
      content: "We offer the shortlist free because it's the fastest way to show you the level of clarity we deliver.",
      delay: 1200
    },
    {
      content: "If you ever want deeper planning support, our programs start at $99/month—but there's zero pressure. If all you need is venue clarity and a solid shortlist, we're glad we made your planning easier.",
      delay: 1800
    },
    {
      content: "Want me to start your short-list now?",
      quickReplies: ["Yes please!"],
      delay: 1000
    },
  ],
  "I'm ready": [
    {
      content: "Great. I'll guide you through a few quick questions so our planners can build your short-list and walk you through the best matches live.",
      delay: 1400,
    },
    {
      content: "When are you planning the wedding? Month and year is fine.",
      delay: 1200,
      quickReplies: ["Not sure yet"],
    },
  ],
  "Let's do it": [
    {
      content: "Great. I'll guide you through a few quick questions so our planners can build your short-list and walk you through the best matches live.",
      delay: 1400,
    },
    {
      content: "When are you planning the wedding? Month and year is fine.",
      delay: 1200,
      quickReplies: ["Not sure yet"],
    },
  ],
  "Yes please!": [
    {
      content: "Great. I'll guide you through a few quick questions so our planners can build your short-list and walk you through the best matches live.",
      delay: 1400,
    },
    {
      content: "When are you planning the wedding? Month and year is fine.",
      delay: 1200,
      quickReplies: ["Not sure yet"],
    },
  ],
};

// Q3 Budget options (quick buttons)
const BUDGET_OPTIONS = [
  "< $15,000",
  "$15,000 - $20,000",
  "$20,000 - $30,000",
  "$30,000 - $40,000",
  "$40,000 - $50,000",
  "$50,000 - $75,000",
  "$75,000 - $100,000",
  "$100,000+"
];

// Q4 Setting options (selection buttons, top 3)
const SETTING_OPTIONS = [
  "Ballroom", "Barn", "Beach House", "Castle", "Chalet", "Courthouse",
  "Country Club", "Estate", "Greenhouse", "Historic Building", "Hotel",
  "Industrial Space", "Lodge", "Mansion", "Museum", "Open Space",
  "Pavilion", "Restaurant", "Rooftop", "Ship/Boat", "Tent", "Terrace", "Vineyard"
];

// Q5 Style options (selection buttons, top 3)
const STYLE_OPTIONS = [
  "Artistic", "Boho", "Casual", "Chic", "Classic", "Cozy", "Eclectic",
  "Elegant", "Glamorous", "Grand", "Industrial", "Luxury", "Minimalist",
  "Modern", "Playful", "Romantic", "Rustic", "Traditional", "Vintage", "Whimsical"
];

// Q6 Scenery options (selection buttons, top 3)
const SCENERY_OPTIONS = [
  "Beach", "Cityscape", "Cliffside", "Countryside", "Desert", "Fields",
  "Forest", "Garden", "Lakeside", "Marsh", "Meadow", "Mountain", "Park",
  "Rolling Hills", "Tropics", "Urban", "Valley", "Vineyard", "Waterfall", "Waterfront"
];

// Q7 Celebration type options (quick buttons)
const CELEBRATION_OPTIONS = [
  "Full Wedding (Ceremony + Reception)",
  "Full Wedding Weekend / Multi-Day",
  "Ceremony Only",
  "Reception Only",
  "Elopement",
  "Micro-Wedding",
  "Rehearsal Dinner",
  "Vow Renewal",
  "Engagement Party"
];

// Q8 Required Spaces (selection buttons, all that apply)
const SPACES_OPTIONS = [
  "Bridal Suite",
  "Groom Suite",
  "Indoor Ceremony Space",
  "Outdoor Ceremony Space",
  "Indoor Reception Space",
  "Outdoor Reception Space",
  "On-site Accommodations"
];

// Q9 Pets (Yes/No quick buttons)
const PET_OPTIONS = [
  "Yes, we need pet-friendly",
  "No pets"
];

// Q10 Accessibility (Yes/No quick buttons)
const ACCESSIBILITY_OPTIONS = [
  "Yes, wheelchair accessibility needed",
  "No, not needed"
];

// Q11 Vendor handling (quick buttons)
const VENDOR_OPTIONS = [
  "All-Inclusive: venue provides food & drinks",
  "Flexible: I want to pick my own caterer",
  "DIY: blank canvas, bring everything myself"
];

// Q12 Coordination (Yes/No quick buttons)
const COORDINATION_OPTIONS = [
  "Yes, coordination included",
  "No, I have my own planner"
];

const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const generateConversationId = () => `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Load stored session on initialization
const loadStoredSession = (): { messages: ChatMessage[]; conversationId: string; contactInfo?: ContactInfo } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.messages && Array.isArray(parsed.messages) && parsed.timestamp) {
        // Only restore if session is less than 24 hours old
        if (Date.now() - parsed.timestamp < SESSION_EXPIRY) {
          return {
            messages: parsed.messages,
            conversationId: parsed.conversationId || generateConversationId(),
            contactInfo: parsed.contactInfo,
          };
        }
      }
    }
  } catch (e) {
    console.error("Failed to load chat session:", e);
  }
  return {
    messages: INITIAL_MESSAGES,
    conversationId: generateConversationId(),
  };
};

export function usePuraChat() {
  // Track if intro messages have been staged
  const introStagedRef = useRef(false);

  // Use lazy initialization to only load session once
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = loadStoredSession();
    // If we have a stored session with more than initial messages, use it
    if (stored.messages.length > INITIAL_MESSAGES.length) {
      introStagedRef.current = true;
      return stored.messages;
    }
    // Otherwise start with empty and stage intro messages
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isReading, setIsReading] = useState(false);

  // Helper: Random reading delay (1-2 seconds)
  const getReadingDelay = () => Math.floor(Math.random() * 1000) + 1000;

  // Helper: Calculate typing delay (1-5 seconds for natural feel)
  const getTypingDelay = (message: string) => {
    const minDelay = 1000;
    const maxDelay = 5000;
    // Random base between 1-5 seconds
    const baseRandom = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
    // Slightly favor longer delays for longer messages
    const lengthBonus = Math.min(message.length * 5, 1000);
    return Math.min(Math.floor(baseRandom + lengthBonus * 0.3), maxDelay);
  };

  // Mark the last user message as read
  const markLastUserMessageAsRead = useCallback(() => {
    setMessages(prev => {
      const lastUserIndex = [...prev].reverse().findIndex(m => m.role === "user");
      if (lastUserIndex === -1) return prev;
      const actualIndex = prev.length - 1 - lastUserIndex;
      return prev.map((m, i) =>
        i === actualIndex && m.role === "user" ? { ...m, isRead: true } : m
      );
    });
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(() => loadStoredSession().contactInfo || null);
  const hasSyncedRef = useRef(false);
  const hasBookedRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);
  const isSubmittingRef = useRef(false); // Guard to prevent double submission

  // Initialize conversationId lazily
  if (conversationIdRef.current === null) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        conversationIdRef.current = parsed.conversationId || generateConversationId();
      } catch {
        conversationIdRef.current = generateConversationId();
      }
    } else {
      conversationIdRef.current = generateConversationId();
    }
  }

  // Stage intro messages with delays on first mount
  useEffect(() => {
    if (introStagedRef.current) return;
    introStagedRef.current = true;

    // First message after 800ms
    const timer1 = setTimeout(() => {
      setIsTyping(true);
    }, 300);

    const timer2 = setTimeout(() => {
      setIsTyping(false);
      setMessages([INITIAL_MESSAGES[0]]);
    }, 800);

    // Second message after 2000ms (total from start)
    const timer3 = setTimeout(() => {
      setIsTyping(true);
    }, 1200);

    const timer4 = setTimeout(() => {
      setIsTyping(false);
      setMessages(INITIAL_MESSAGES);
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Save to localStorage when messages or contactInfo change
  useEffect(() => {
    // Only persist if we have more than initial messages
    if (messages.length > INITIAL_MESSAGES.length || contactInfo) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        messages,
        timestamp: Date.now(),
        conversationId: conversationIdRef.current,
        contactInfo,
      }));
    }
  }, [messages, contactInfo]);

  // Fetch available slots from GHL
  const fetchAvailableSlots = useCallback(async (): Promise<AvailableSlot[]> => {
    try {
      console.log("Fetching available slots...");
      const response = await fetch(SLOTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ days: 14 }),
      });

      const data = await response.json();

      if (data.success && data.slots) {
        console.log("Fetched", data.slots.length, "available slots");
        return data.slots;
      }

      console.error("Failed to fetch slots:", data.error);
      return [];
    } catch (err) {
      console.error("Slots fetch error:", err);
      return [];
    }
  }, []);

  // Book appointment via GHL
  const bookAppointment = useCallback(async (
    contact: ContactInfo,
    slot: AvailableSlot
  ) => {
    if (hasBookedRef.current) return null;

    try {
      console.log("Booking appointment via GHL...", slot);

      const response = await fetch(BOOKING_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          contactName: contact.name,
          contactEmail: contact.email,
          contactPhone: contact.phone,
          preferredDate: slot.date,
          preferredTime: slot.time,
        }),
      });

      const data = await response.json();

      if (data.success) {
        hasBookedRef.current = true;
        console.log("Appointment booked successfully:", data.message);
        return { success: true, message: data.message };
      } else {
        console.error("Booking failed:", data.error);
        return { success: false, error: data.error, bookingLink: data.bookingLink };
      }
    } catch (err) {
      console.error("Booking error:", err);
      return {
        success: false,
        error: "Unable to complete booking",
        bookingLink: "https://myra.com/meet-your-planner"
      };
    }
  }, []);

  // Sync conversation to GHL
  const syncToGHL = useCallback(async (allMessages: ChatMessage[]) => {
    if (hasSyncedRef.current) return;

    try {
      console.log("Syncing conversation to GHL...");
      hasSyncedRef.current = true;

      const apiMessages = allMessages.map(({ role, content }) => ({
        role,
        content,
      }));

      const response = await fetch(SYNC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          conversationId: conversationIdRef.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("GHL sync failed:", errorData);
      } else {
        console.log("Successfully synced to GHL");
      }
    } catch (err) {
      console.error("GHL sync error:", err);
    }
  }, []);

  // Handle contact form submission
  const handleContactSubmit = useCallback(async (info: ContactInfo) => {
    setContactInfo(info);

    // Add user message with their info
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: `My name is ${info.name}, email is ${info.email}, and phone is ${info.phone}`,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // NOTE: We no longer sync here - sync happens AFTER recap confirmation
    // when all questions (Q0-Q8) have been answered

    // Check if this is early contact collection (before recap)
    // If we haven't seen budget discussion yet, continue to Q3 (budget)
    const allMessagesForCheck = [...messages, userMessage];
    const conversationText = allMessagesForCheck.map(m => m.content.toLowerCase()).join(" ");
    const hasAskedBudget = conversationText.includes("budget");

    if (!hasAskedBudget) {
      // Early contact collection - continue with Q3 (budget)
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsTyping(false);

      const continueMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "Great. Now let's get into the details.\n\nWhat's your overall budget for the wedding—not just venue.",
        quickReplies: BUDGET_OPTIONS,
      };

      setMessages(prev => [...prev, continueMessage]);
      setIsLoading(false);
    } else {
      // Late contact collection (after recap) - show slot selector
      const slots = await fetchAvailableSlots();

      const slotMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: slots.length > 0
          ? "Great. Let me pull up some available times for your Venue Match Call."
          : "Great. Let's get your Venue Match Call on the calendar.",
        showSlotSelector: slots.length > 0,
        availableSlots: slots.length > 0 ? slots : undefined,
      };

      setMessages(prev => [...prev, slotMessage]);
      setIsLoading(false);
    }
  }, [messages, syncToGHL, fetchAvailableSlots]);

  // Handle slot selection
  const handleSlotSelect = useCallback(async (slot: AvailableSlot) => {
    if (!contactInfo) return;

    setIsLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: `I'll take ${slot.display}`,
    };
    setMessages(prev => [...prev, userMessage]);

    // Book the appointment
    const result = await bookAppointment(contactInfo, slot);

    // Add result message
    const resultMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: result?.success
        ? `${result.message}\n\nYou made a smart move starting here. Excited to help you find the places that actually fit your wedding.`
        : `I couldn't complete the booking automatically. No worries - book here: https://myra.com/meet-your-planner\n\nYou made a smart move starting here. Excited to help you find the retirement plan that actually fits your life.`,
    };

    setMessages(prev => [...prev, resultMessage]);
    setIsLoading(false);

    // Redirect to thank you page after showing confirmation
    setTimeout(() => {
      const slotDisplay = encodeURIComponent(slot.display);
      window.location.href = `/thank-you?booked=true&slot=${slotDisplay}`;
    }, 1500);
  }, [contactInfo, bookAppointment]);

  // Handle "see all time slots" option
  const handleSeeAllSlots = useCallback(() => {
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: "Show me all available times",
    };

    const responseMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "Here's the full calendar with all available times: https://myra.com/meet-your-planner\n\nYou made a smart move starting here. Excited to help you find the retirement plan that actually fits your life.",
    };

    setMessages(prev => [...prev, userMessage, responseMessage]);

    // Redirect to thank you page after showing message
    setTimeout(() => {
      window.location.href = `/thank-you?booked=false&calendar=true`;
    }, 2000);
  }, []);

  // Handle "book later" option
  const handleBookLater = useCallback(() => {
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: "I'll book later",
    };

    const responseMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "No problem! We'll be in touch soon.\n\nYou made a smart move starting here. Excited to help you find the places that actually fit your wedding.",
    };

    setMessages(prev => [...prev, userMessage, responseMessage]);

    // Redirect to thank you page
    setTimeout(() => {
      window.location.href = `/thank-you?booked=false`;
    }, 1500);
  }, []);

  // Play scripted flow messages with delays, reading phase, and typing indicator
  const playScriptedFlow = useCallback(async (flow: ScriptedMessage[]) => {
    for (let i = 0; i < flow.length; i++) {
      const message = flow[i];

      // First message: add reading delay before typing
      if (i === 0) {
        setIsReading(true);
        await new Promise(resolve => setTimeout(resolve, getReadingDelay()));
        setIsReading(false);

        // Add delay before showing "Read" indicator (500-1000ms)
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 500) + 500));
        markLastUserMessageAsRead();
      }

      // Show typing indicator
      setIsTyping(true);

      // Dynamic typing delay based on message length
      const typingDelay = getTypingDelay(message.content);
      await new Promise(resolve => setTimeout(resolve, typingDelay));

      // Hide typing and show message
      setIsTyping(false);

      const msgId = generateId();
      const newMessage: ChatMessage = {
        id: msgId,
        role: "assistant",
        content: message.content,
        quickReplies: message.quickReplies,
      };

      setMessages(prev => [...prev, newMessage]);

      // Small pause between messages for natural feel
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }, [markLastUserMessageAsRead]);


  const sendMessage = useCallback(async (input: string) => {
    // Prevent double submission
    if (isSubmittingRef.current) {
      console.log("Ignoring duplicate submission");
      return;
    }
    isSubmittingRef.current = true;

    try {
      setError(null);
      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: input,
      };

      // Check if this is a scripted flow trigger BEFORE updating state
      const scriptedFlow = SCRIPTED_FLOWS[input];
      if (scriptedFlow) {
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        await playScriptedFlow(scriptedFlow);
        setIsLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      // Add user message and capture updated state
      const currentMessages = await new Promise<ChatMessage[]>((resolve) => {
        setMessages((prev) => {
          const updated = [...prev, userMessage];
          resolve(updated);
          return updated;
        });
      });

      // Reading phase before responding
      setIsReading(true);
      await new Promise(resolve => setTimeout(resolve, getReadingDelay()));
      setIsReading(false);

      // Add delay before showing "Read" indicator (500-1000ms)
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 500) + 500));
      markLastUserMessageAsRead();

      // Show typing indicator while preparing AI response (natural feel)
      setIsTyping(true);

      // Add natural typing delay before AI starts responding (1.5-3s)
      const typingDelay = Math.floor(Math.random() * 1500) + 1500;
      await new Promise(resolve => setTimeout(resolve, typingDelay));

      setIsLoading(true);

      // Build conversation history for API - send ALL messages for full context
      const apiMessages = currentMessages.map(({ role, content }) => ({
        role,
        content,
      }));

      console.log("Sending to Pura API:", {
        totalMessages: currentMessages.length,
        messages: apiMessages.map(m => `${m.role}: ${m.content.substring(0, 40)}...`),
      });

      let assistantContent = "";
      const assistantId = generateId();
      const STREAM_TIMEOUT = 60000; // 60 seconds timeout

      // Helper to make API call with streaming
      const makeStreamRequest = async (attempt: number = 0): Promise<string> => {
        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!response.ok || !response.body) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to connect to Pura");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let streamDone = false;
        let streamContent = "";

        // Timeout protection
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Response timeout - please try again")), STREAM_TIMEOUT);
        });

        const streamReadPromise = (async () => {
          while (!streamDone) {
            const { done, value } = await reader.read();
            if (done) break;

            textBuffer += decoder.decode(value, { stream: true });

            let newlineIndex: number;
            while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
              let line = textBuffer.slice(0, newlineIndex);
              textBuffer = textBuffer.slice(newlineIndex + 1);

              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (line.startsWith(":") || line.trim() === "") continue;
              if (!line.startsWith("data: ")) continue;

              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") {
                streamDone = true;
                break;
              }

              try {
                const parsed = JSON.parse(jsonStr);

                // Check for error in stream response
                if (parsed.error) {
                  const errorMsg = parsed.error.message || "AI service error";
                  console.error("Stream error detected:", parsed.error);
                  throw new Error(errorMsg);
                }

                const content = parsed.choices?.[0]?.delta?.content as string | undefined;
                if (content) {
                  streamContent += content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: streamContent } : m
                    )
                  );
                }
              } catch (parseErr) {
                // If it's our thrown error, re-throw it
                if (parseErr instanceof Error && parseErr.message !== "Unexpected token") {
                  throw parseErr;
                }
                // Otherwise it's a parse error, buffer for next iteration
                textBuffer = line + "\n" + textBuffer;
                break;
              }
            }
          }

          // Final flush
          if (textBuffer.trim()) {
            for (let raw of textBuffer.split("\n")) {
              if (!raw) continue;
              if (raw.endsWith("\r")) raw = raw.slice(0, -1);
              if (raw.startsWith(":") || raw.trim() === "") continue;
              if (!raw.startsWith("data: ")) continue;
              const jsonStr = raw.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);

                // Check for error in final flush
                if (parsed.error) {
                  throw new Error(parsed.error.message || "AI service error");
                }

                const content = parsed.choices?.[0]?.delta?.content as string | undefined;
                if (content) {
                  streamContent += content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: streamContent } : m
                    )
                  );
                }
              } catch {
                /* ignore partial leftovers */
              }
            }
          }

          return streamContent;
        })();

        // Race between stream reading and timeout
        return await Promise.race([streamReadPromise, timeoutPromise]);
      };

      // Create initial assistant message
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      // Hide typing indicator now that streaming starts
      setIsTyping(false);

      // Attempt with 1 automatic retry on transient errors
      try {
        assistantContent = await makeStreamRequest(0);
      } catch (streamErr) {
        console.warn("Stream attempt 1 failed, retrying...", streamErr);
        // Wait briefly before retry
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Reset message for retry
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: "" } : m
          )
        );

        // Second attempt - if this fails, let it throw to outer catch
        assistantContent = await makeStreamRequest(1);
      }

      // Detect context and add quick replies or selection options
      const finalContent = assistantContent.toLowerCase();
      let quickReplies: string[] | undefined;
      let selectionOptions: SelectionConfig | undefined;
      let showContactForm = false;

      // Detect if asking about readiness
      if (
        finalContent.includes("ready to start") ||
        finalContent.includes("want me to start") ||
        finalContent.includes("start your match")
      ) {
        quickReplies = ["Let's do it", "Why is it free?"];
      } else if (
        finalContent.includes("start your short-list") ||
        finalContent.includes("start your shortlist")
      ) {
        quickReplies = ["Yes please!"];
      }

      // Q0 - Wedding date question
      if (
        finalContent.includes("planning the wedding") ||
        finalContent.includes("month and year")
      ) {
        quickReplies = ["Not sure yet"];
      }

      // Detect recap confirmation (triggers slot selector after confirmation)
      const isRecapMessage =
        finalContent.includes("sound right") ||
        finalContent.includes("anything i should tweak") ||
        (finalContent.includes("wedding snapshot") && finalContent.includes("recap"));

      // Detect post-recap slot selector trigger (user confirmed recap)
      if (
        finalContent.includes("venue match call") ||
        finalContent.includes("pull up some times") ||
        finalContent.includes("walk through your shortlist")
      ) {
        // SYNC TO GHL NOW - All questions answered, user confirmed recap
        // Get all messages including the current assistant message with final content
        const allMessagesForSync = await new Promise<ChatMessage[]>((resolve) => {
          setMessages((prev) => {
            const updatedMessages = prev.map((m) =>
              m.id === assistantId ? { ...m, content: assistantContent } : m
            );
            resolve(updatedMessages);
            return updatedMessages;
          });
        });

        if (!hasSyncedRef.current) {
          console.log("Syncing to GHL after recap confirmation with", allMessagesForSync.length, "messages");
          await syncToGHL(allMessagesForSync);
        }

        // Trigger slot selector after recap confirmation
        const slots = await fetchAvailableSlots();
        if (slots.length > 0) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, showSlotSelector: true, availableSlots: slots } : m
            )
          );
        }
      }

      // Q3 - Budget question (exclude recap messages that mention budget)
      if (
        finalContent.includes("budget") &&
        (finalContent.includes("wedding") || finalContent.includes("total") || finalContent.includes("overall")) &&
        !isRecapMessage
      ) {
        quickReplies = BUDGET_OPTIONS;
      }

      // Q4 - Setting question (more flexible detection)
      if (
        !isRecapMessage &&
        ((finalContent.includes("setting") && (finalContent.includes("feels right") || finalContent.includes("top 3") || finalContent.includes("pick"))) ||
          (finalContent.includes("kind of setting") || finalContent.includes("type of setting")))
      ) {
        selectionOptions = {
          type: "setting",
          options: SETTING_OPTIONS.map(label => ({ label })),
          maxSelections: 3
        };
      }

      // Q5 - Style question (more flexible detection)
      if (
        !isRecapMessage &&
        ((finalContent.includes("style") && (finalContent.includes("describe") || finalContent.includes("pick") || finalContent.includes("top 3"))) ||
          (finalContent.includes("vibe") && (finalContent.includes("describe") || finalContent.includes("want"))))
      ) {
        selectionOptions = {
          type: "style",
          options: STYLE_OPTIONS.map(label => ({ label })),
          maxSelections: 3
        };
      }

      // Q6 - Scenery question (more flexible detection)
      if (
        !isRecapMessage &&
        (finalContent.includes("scenery") ||
          (finalContent.includes("what") && finalContent.includes("around you") && !finalContent.includes("spaces")))
      ) {
        selectionOptions = {
          type: "scenery",
          options: SCENERY_OPTIONS.map(label => ({ label })),
          maxSelections: 3
        };
      }

      // Q7 - Celebration type question
      if (
        finalContent.includes("celebration") &&
        finalContent.includes("look like")
      ) {
        quickReplies = CELEBRATION_OPTIONS;
      }

      // Q8 - Required Spaces question
      if (
        !isRecapMessage &&
        (finalContent.includes("specific spaces") ||
          (finalContent.includes("spaces") && finalContent.includes("need")) ||
          (finalContent.includes("spaces") && finalContent.includes("select all")))
      ) {
        selectionOptions = {
          type: "extras",
          options: SPACES_OPTIONS.map(label => ({ label })),
          maxSelections: 7,
          selectAll: true
        };
      }

      // Q9 - Pets question
      if (
        !isRecapMessage &&
        (finalContent.includes("pets") || finalContent.includes("pet-friendly") || finalContent.includes("pet friendly"))
      ) {
        quickReplies = PET_OPTIONS;
      }

      // Q10 - Accessibility question
      if (
        !isRecapMessage &&
        (finalContent.includes("wheelchair") || finalContent.includes("accessibility"))
      ) {
        quickReplies = ACCESSIBILITY_OPTIONS;
      }

      // Q11 - Vendors question
      if (
        !isRecapMessage &&
        (finalContent.includes("handle vendors") ||
          finalContent.includes("vendor") && (finalContent.includes("how") || finalContent.includes("setup") || finalContent.includes("handling")))
      ) {
        quickReplies = VENDOR_OPTIONS;
      }

      // Q12 - Coordination question
      if (
        !isRecapMessage &&
        (finalContent.includes("coordination") && !finalContent.includes("recap"))
      ) {
        quickReplies = COORDINATION_OPTIONS;
      }

      // Detect contact collection prompt (after Q2 - guest count)
      if (
        (finalContent.includes("name") && finalContent.includes("email")) ||
        (finalContent.includes("name, email") || finalContent.includes("name, email, and cell")) ||
        (finalContent.includes("get your info") && finalContent.includes("planner")) ||
        (finalContent.includes("drop your") && (finalContent.includes("name") || finalContent.includes("email")))
      ) {
        showContactForm = true;
      }

      if (quickReplies || selectionOptions || showContactForm) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, quickReplies, selectionOptions, showContactForm } : m
          )
        );
      }

    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages((prev) => prev.filter((m) => m.content !== ""));
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  }, [playScriptedFlow, fetchAvailableSlots, markLastUserMessageAsRead]);

  const resetChat = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages(INITIAL_MESSAGES);
    setContactInfo(null);
    setError(null);
    hasSyncedRef.current = false;
    hasBookedRef.current = false;
    conversationIdRef.current = generateConversationId();
  }, []);

  // Questions that require strict button selection (no free-form text)
  // Disable input for ALL interactive elements: quick replies, selection buttons, contact form, slot selector, wedding date input
  const requiresStrictSelection = useMemo(() => {
    // Find the last assistant message
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAssistantMessage) return false;

    // Disable input for:
    // 1. Selection options (Setting, Style, Scenery, Extras)
    if (lastAssistantMessage.selectionOptions) return true;

    // 2. Contact form
    if (lastAssistantMessage.showContactForm) return true;

    // 3. Slot selector
    if (lastAssistantMessage.showSlotSelector) return true;

    // 4. Wedding date input (has "Not sure yet" quick reply)
    if (lastAssistantMessage.quickReplies?.includes("Not sure yet")) return true;

    // 5. Strict quick reply questions (Budget, Celebration, Pets, Accessibility, Vendors, Coordination)
    if (lastAssistantMessage.quickReplies) {
      const STRICT_SELECTION_REPLIES = [
        BUDGET_OPTIONS,
        CELEBRATION_OPTIONS,
        PET_OPTIONS,
        ACCESSIBILITY_OPTIONS,
        VENDOR_OPTIONS,
        COORDINATION_OPTIONS,
      ];

      // Check if the quick replies match any strict selection set
      const lastReplies = JSON.stringify(lastAssistantMessage.quickReplies);
      return STRICT_SELECTION_REPLIES.some(
        options => JSON.stringify(options) === lastReplies
      );
    }

    return false;
  }, [messages]);

  return {
    messages,
    isLoading,
    isTyping,
    isReading,
    error,
    contactInfo,
    sendMessage,
    resetChat,
    handleContactSubmit,
    handleSlotSelect,
    handleSeeAllSlots,
    handleBookLater,
    requiresStrictSelection,
  };
}
