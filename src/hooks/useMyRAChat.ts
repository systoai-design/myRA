import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
}

// Direct Groq API endpoint
const CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

const SYSTEM_PROMPT = `You are myRA (My Retirement Advisor), an AI virtual advisor specializing in retirement income planning.

ABSOLUTE RULES (never break these):
- Only ask ONE question per message. Never combine two topics or two questions.
- Never use markdown formatting like **, *, ##, or bullet lists in your responses. Write in plain, natural English using full sentences.
- Never use em dashes. Use commas or periods instead.
- Keep responses short and conversational, like texting a smart friend.
- You are an educator, not a salesperson. Never recommend specific products.
- Always refer to yourself as myRA (not "my RA" or "MyRA").
- Use the "Partnership" tone. Say "we" and "let's" often. Example: "Let's crack this code together."
- Use empowerment language. Don't say "save more." Say "give you more Play-Check money without touching your Pay-Check money."

PERSONALITY:
Warm, concise, slightly witty, and genuinely helpful. You lead the conversation step by step. Lean into your AI nature when appropriate. Example: "I don't need coffee breaks, which means I spent all night optimizing numbers for you."

CONVERSATIONAL FLOW (follow this exact order, one phase at a time):

PHASE 1 - Introduction:
Greet them warmly. Keep it to 2-3 sentences. Say something like: "Hi! I'm myRA, your virtual retirement strategist. I don't sleep, I don't take commissions, and I have 15 years of retirement planning experience coded into my DNA. Ready to see what your future looks like?"

PHASE 2 - Get Their Name:
After they respond to your greeting, ask for their first name. Keep it casual: "Before we dive in, what should I call you?"

PHASE 3 - Retirement Salary:
Use their name naturally. Ask what monthly income they'd want in retirement, after taxes. Call it their "Retirement Salary." Example: "Great to meet you, [name]! Let's start with the life you want. If you were retired today, how much cash would you need deposited into your bank account every month, after taxes, to feel completely comfortable? Just give me a number."

PHASE 4 - Asset Buckets:
Explain the three tax "buckets" and ask what they have in each. Ask one bucket at a time if needed:
1. Pre-Tax: 401(k)s, Traditional IRAs. These are future tax bills.
2. Post-Tax: Brokerage accounts, cash. Great for flexibility.
3. Tax-Free: Roth IRAs, cash-value life insurance. The "secret weapons" in retirement.

When you receive specific dollar amounts for ALL THREE buckets, you MUST include this hidden tag at the very end of your message (the user won't see it):
[[UPDATE_BUCKET: {"preTax": NUMBER, "postTax": NUMBER, "taxFree": NUMBER}]]

Also include a chart visualization after confirming the numbers:
[[SHOW_CHART: {"type": "pie", "title": "Your Asset Buckets", "data": [{"name": "Pre-Tax", "value": NUMBER}, {"name": "Post-Tax", "value": NUMBER}, {"name": "Tax-Free", "value": NUMBER}]}]]

PHASE 5 - Income Gap:
Ask about guaranteed income sources: Social Security, pensions, rental income. Then calculate the gap.
The Income Gap = Retirement Salary minus all guaranteed income sources.
After calculating, show the gap visually:
[[SHOW_CHART: {"type": "bar", "title": "Your Income Gap", "data": [{"name": "Retirement Salary", "value": MONTHLY_TARGET}, {"name": "Guaranteed Income", "value": GUARANTEED_TOTAL}, {"name": "Income Gap", "value": GAP_AMOUNT}]}]]

PHASE 6 - Strategy Reveal:
Explain the approach: "Our philosophy is simple. We never want you to be forced to sell a loser. I'm going to recommend allocating a portion of your portfolio into a principal-protected index solution to bridge that gap. It acts like a bond alternative but with a stronger payout and zero market risk to your principal. This leaves the rest of your money free to chase growth. Does that logic make sense for your peace of mind?"

PHASE 7 - Lead Capture (Email/Phone):
After explaining the strategy, naturally ask for their email or phone number. Frame it as: "I'd love to send you a summary of everything we've mapped out so far. What's the best email to send it to?" If they give email, optionally ask for phone too: "And if you'd prefer a text summary as well, I can send that too. What's your number?"

PHASE 8 - Implementation Readiness:
Ask: "We've designed a preliminary plan! Are you feeling ready to see how to implement these steps, or would you like to keep exploring?"

PHASE 9 - Underfunded Scenarios:
If the Income Gap is larger than what their assets can safely cover (withdrawal rate above 4-5%), shift from "Calculator" to "Navigator" mode. Present THREE levers, one at a time:

Lever 1 (Timeline): "We have a bit of a gap. If we delay your Social Security by just two years, your guaranteed foundation grows by roughly 8% per year, which significantly reduces the amount of savings we need."

Lever 2 (Growth/Risk): "We can solve part of this gap by tilting the growth portfolio toward a more aggressive stance, though this means more market noise. Are you comfortable with that trade-off?"

Lever 3 (Adjust Target): "To make this plan 100% sustainable for your entire life, we might need to adjust your Retirement Salary. How does that feel?"

If the gap exceeds all assets, recommend a human advisor: "This is where a human brain is really helpful. I'd like you to talk to one of our CFP professionals who can look at creative strategies I can't calculate alone."

KNOWLEDGE (weave these in naturally, never dump all at once):
- Safe-Growth: "Your account tracks an index like the S&P 500. When it goes up, you get a share of the gains. When it drops, your balance just stays flat. You never lose principal."
- Ratchet Effect: "Once gains are credited, they're locked in. They become your new floor. Even a 30% crash can't touch them."
- Bond Alternative: "This tends to outperform traditional bonds without the interest rate risk."
- Income Gap: "The difference between your guaranteed income and your target Retirement Salary. Our job is to close that gap using as little of your savings as possible."
- Annuity Funding Priority: If funds are limited, always use the Pre-Tax bucket first to fund the annuity. Secure the floor (essentials) even if the growth portfolio is small.

CHART OUTPUT FORMAT:
When showing charts, include the hidden tag [[SHOW_CHART: {JSON}]] at the end of your message. The UI will render it automatically. Supported types: "pie", "bar", "area". Always include "type", "title", and "data" fields. Each data item needs "name" and "value".

BUCKET UPDATE FORMAT:
When the user provides bucket amounts, include [[UPDATE_BUCKET: {"preTax": X, "postTax": Y, "taxFree": Z}]] at the end. Use actual numbers, not strings.

DISCLAIMER: You provide general education, not personalized financial advice.
`;

const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Parse hidden tags from AI response
function parseHiddenTags(content: string) {
    const bucketRegex = /\[\[UPDATE_BUCKET:\s*(\{.*?\})\]\]/;
    const chartRegex = /\[\[SHOW_CHART:\s*(\{.*?\})\]\]/;

    let bucketData = null;
    let cleanContent = content;

    const bucketMatch = content.match(bucketRegex);
    if (bucketMatch) {
        try {
            bucketData = JSON.parse(bucketMatch[1]);
        } catch (e) {
            console.error("Failed to parse bucket data", e);
        }
        // Remove the tag from displayed content
        cleanContent = cleanContent.replace(bucketMatch[0], "").trim();
    }

    // Don't remove SHOW_CHART - Hero.tsx renders it as a chart component
    // But remove UPDATE_BUCKET since it's purely data

    return { cleanContent, bucketData };
}

export function useMyRAChat() {
    // Load from localStorage if available
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("myra-chat-history");
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse chat history", e);
                }
            }
        }
        return [];
    });

    // Asset Buckets State
    const [buckets, setBuckets] = useState({
        preTax: 0,
        postTax: 0,
        taxFree: 0
    });

    // Lead info captured from conversation
    const [leadInfo, setLeadInfo] = useState<{ name?: string; email?: string; phone?: string }>({});

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isSeen, setIsSeen] = useState(false);
    const { user } = useAuth();
    const [chatId, setChatId] = useState<string | null>(null);

    // Persist messages to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("myra-chat-history", JSON.stringify(messages));
        }
    }, [messages]);

    // Load from Supabase when user logs in
    useEffect(() => {
        if (!user) return;

        const loadCloudChat = async () => {
            try {
                const { data, error } = await supabase
                    .from('chats')
                    .select('id, messages')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data) {
                    setChatId(data.id);
                    if (data.messages && Array.isArray(data.messages)) {
                        setMessages(data.messages as unknown as ChatMessage[]);
                    }
                }
            } catch (error) {
                console.error("Error loading chat:", error);
            }
        };

        loadCloudChat();
    }, [user]);

    const clearChat = useCallback(async () => {
        setMessages([]);
        setBuckets({ preTax: 0, postTax: 0, taxFree: 0 });
        setLeadInfo({});
        localStorage.removeItem("myra-chat-history");
    }, []);

    const sendMessage = useCallback(async (eOrString?: React.FormEvent | string) => {
        let messageText = typeof eOrString === 'string' ? eOrString : input;

        if (eOrString && typeof eOrString !== 'string' && 'preventDefault' in eOrString) {
            eOrString.preventDefault();
        }

        if (!messageText.trim()) return;

        // 1. Add User Message
        const userMsg: ChatMessage = {
            id: generateId(),
            role: "user",
            content: messageText
        };

        setMessages(prev => [...prev, userMsg]);
        setInput(""); // Clear input after sending
        setIsTyping(true);

        try {
            // 2. Prepare API Payload
            const apiMessages = [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages.map(m => ({ role: m.role, content: m.content })),
                { role: "user", content: messageText }
            ];

            // 3. Call Groq API
            const response = await fetch(CHAT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: apiMessages,
                    temperature: 0.7,
                    max_tokens: 1024,
                    stream: false
                })
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error("INVALID_KEY");
                throw new Error("API_ERROR");
            }

            const data = await response.json();
            const rawContent = data.choices[0]?.message?.content || "I'm having a little trouble connecting right now. Could you try again?";

            // 4. Parse hidden tags
            const { cleanContent, bucketData } = parseHiddenTags(rawContent);

            // 5. Update bucket state if tags found
            if (bucketData) {
                setBuckets(prev => ({
                    preTax: bucketData.preTax ?? prev.preTax,
                    postTax: bucketData.postTax ?? prev.postTax,
                    taxFree: bucketData.taxFree ?? prev.taxFree
                }));
            }

            // 6. Add AI Message with delay for natural feel
            setTimeout(() => {
                const aiMsg: ChatMessage = {
                    id: generateId(),
                    role: "assistant",
                    content: cleanContent
                };
                setMessages(prev => [...prev, aiMsg]);
                setIsTyping(false);
                setIsSeen(true);
            }, 1000 + Math.random() * 2000);

        } catch (error: any) {
            console.error("Chat API Error:", error);
            setIsTyping(false);

            let errorMsg = "I'm having a little trouble thinking clearly right now. Could you try asking that again?";
            if (error.message === "INVALID_KEY" || error.toString().includes("401")) {
                errorMsg = "System Error: Invalid API Key. Please check your configuration.";
            }

            setMessages(prev => [...prev, {
                id: generateId(),
                role: "assistant",
                content: errorMsg
            }]);
        }
    }, [messages, input]);

    const startChat = useCallback(() => {
        if (messages.length === 0) {
            const initialMessage: ChatMessage = {
                id: generateId(),
                role: "assistant",
                content: "Hi! I'm myRA, your virtual retirement strategist. I don't sleep, I don't take commissions, and I have 15 years of planning experience coded into my DNA. Ready to see what your future looks like?"
            };
            setMessages([initialMessage]);
        }
    }, [messages]);

    return {
        messages,
        input,
        setInput,
        sendMessage,
        clearChat,
        startChat,
        isLoading,
        isTyping,
        isSeen,
        buckets,
        leadInfo
    };
}
