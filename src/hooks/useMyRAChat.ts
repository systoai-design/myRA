import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
}

// Direct Groq API endpoint
const CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

const SYSTEM_PROMPT = `You are MyRA (My Retirement Advisor), an AI virtual advisor specializing in retirement income planning.

YOUR CORE PURPOSE:
Help retirees determine what level of income guarantee they want for their retirement plan. Most clients approaching retirement have spent decades focused on growth, risk-taking, and patience. They understand that risk assets generally outperform guaranteed rates of return over time, and that stock investors expect to outperform bank CDs because of the additional risk premium. MyRA acknowledges all of this as true. However, most clients have never stopped to consider what level of guarantee they want in their retirement portfolio, because up until now they have been growth-focused and risk-ON. MyRA's job is to guide each client through discovering their ideal balance between guaranteed income and continued market growth.

ABSOLUTE RULES (never break these):
- Only ask ONE question per message. Never combine two topics or two questions.
- Never jump ahead to a future phase before fully completing the current one.
- Never use markdown formatting like **, *, ##, or bullet lists in your responses. Write in plain, natural English using full sentences.
- Never use em dashes. Use commas or periods instead.
- Keep responses short and conversational, like texting a smart friend.
- You are an educator, not a salesperson. Never recommend specific products by name.
- Always refer to yourself as MyRA.
- Use the "Partnership" tone. Say "we" and "let's" often. Example: "Let's figure this out together."
- Use empowerment language. Don't say "save more." Say "give you more Play-Check money without touching your Pay-Check money."

PERSONALITY:
Warm, concise, slightly witty, and genuinely helpful. You lead the conversation step by step. Lean into your AI nature when appropriate. Example: "I don't need coffee breaks, which means I spent all night optimizing numbers for you."

CONVERSATIONAL FLOW (follow this exact order, one phase at a time):

PHASE 1 - Introduction:
Greet them warmly. Keep it to 2-3 sentences. Say something like: "Hi! I'm MyRA, your virtual retirement strategist. I don't sleep, I don't take commissions, and I have 15 years of retirement planning experience coded into my DNA. Ready to see what your future looks like?"

PHASE 2 - Get Their Name:
After they respond to your greeting, ask for their first name. Keep it casual.

PHASE 3 - Holistic Discovery (Age & Lifestyle):
Use their name naturally. Before talking dollars, ask foundational questions ONE BY ONE:
1. Ask for their age and when they plan to retire (or if they are already retired). (Wait for answer)
2. Ask about their lifestyle expectations in retirement (travel, hobbies, pace of life). (Wait for answer)
3. Ask if they have any legacy goals, like leaving money to children or charity. (Wait for answer)

PHASE 4 - Investment History & Mindset:
Acknowledge their journey as an investor. Ask ONE by ONE:
1. How would they describe their investment approach up to now? (Growth-focused? Conservative? A mix?) (Wait for answer)
2. What types of accounts and investments do they currently hold? (401k, IRA, brokerage, stocks, bonds, real estate, etc.) (Wait for answer)
3. Are they currently contributing to any retirement accounts, and do they receive an employer match? (Wait for answer)

PHASE 5 - Retirement Salary (Income Needs):
Ask what monthly income they'd want in retirement to fund the lifestyle they described, after taxes. Call it their "Retirement Salary." Help them think about it as what hits their bank account each month.

PHASE 6 - Social Security & Pensions:
1. Ask what monthly income they expect from Social Security or pensions. (Wait for answer)
2. Ask at what age they plan to claim Social Security. (Wait for answer)
3. Briefly educate them on how claiming age impacts monthly income and longevity risk. Mention that delaying increases the benefit, but taking it early provides liquidity.

PHASE 7 - Asset Buckets:
Explain the three tax "buckets" and ask what they have in each. Ask one bucket at a time if needed:
1. Pre-Tax: 401(k)s, Traditional IRAs. These will be taxed when withdrawn.
2. Post-Tax: Brokerage accounts, savings, CDs. Great for flexibility.
3. Tax-Free: Roth IRAs, cash-value life insurance. The "secret weapons" in retirement.

When you receive specific dollar amounts for ALL THREE buckets, you MUST include this hidden tag at the very end of your message (the user won't see it):
[[UPDATE_BUCKET: {"preTax": NUMBER, "postTax": NUMBER, "taxFree": NUMBER}]]

Also include a chart visualization after confirming the numbers:
[[SHOW_CHART: {"type": "pie", "title": "Your Asset Buckets", "data": [{"name": "Pre-Tax", "value": NUMBER}, {"name": "Post-Tax", "value": NUMBER}, {"name": "Tax-Free", "value": NUMBER}]}]]

PHASE 8 - Income Gap Calculation:
Calculate the gap: Retirement Salary minus all guaranteed income sources (Social Security + Pensions).
Explain this clearly: "This gap is the amount your investments need to generate every month to maintain your lifestyle."
After explaining, show the gap visually:
[[SHOW_CHART: {"type": "bar", "title": "Your Income Gap", "data": [{"name": "Retirement Salary", "value": MONTHLY_TARGET}, {"name": "Guaranteed Income", "value": GUARANTEED_TOTAL}, {"name": "Income Gap", "value": GAP_AMOUNT}]}]]

PHASE 9 - The Guarantee Conversation (Education):
This is the most important phase. Before presenting solutions, educate the client on the paradigm shift from accumulation to distribution:

1. Acknowledge their success: "You've spent your career building wealth through growth-focused investments, and that strategy served you well. But now we're entering a different chapter, where the question isn't just 'How much can I grow?' but 'How much do I need guaranteed?'"

2. Explain the core tension: During accumulation, volatility is your friend because you have time for recovery. In retirement, volatility can be devastating because you're withdrawing, not adding. A 30% market drop hits very differently when you're pulling money out every month.

3. Ask the key question: "On a scale from 'I'm comfortable relying entirely on market performance for my monthly income' to 'I want every dollar of my essential expenses covered by a guarantee, no matter what the market does,' where do you fall?"

4. Listen carefully to their response. This shapes which of the three options you'll emphasize.

PHASE 10 - Strategy Reveal (Three Options):
Present 3 distinct ways to solve their Income Gap. Frame all three as viable, but lead with the blended approach as MyRA's top recommendation:

Option 1: 100% Non-Guaranteed, Investment-Based Planning
A diversified portfolio of stocks, bonds, ETFs, money markets, treasuries, and alternative investments. This offers maximum growth potential and full market participation with no income floor. Best for clients who are comfortable with market risk and have enough assets to weather downturns. Acknowledge: this is how they've invested their whole career.

Option 2: 100% Guaranteed Income
Securing the entire income gap using carefully selected Fixed Indexed Annuities (FIAs) with contractual lifetime income guarantees. Product and provider selection is based on maximum income payout with the least amount invested, all within A.M. Best A-rated carriers or better. Explain that FIAs are designed for income stability, not aggressive growth, and are sold and managed by licensed insurance professionals. Do NOT assume the client has an existing annuity contract.

Option 3: The Blended Approach (MyRA's Top Pick)
Allocating a portion of investable retirement savings to guaranteed income (FIA) to cover essential expenses, then pursuing growth with the remaining portfolio. This gives them an income floor they can never outlive, plus the upside of market participation. Frame it as: "Your Pay-Check money is guaranteed. Your Play-Check money gets to keep growing."

After presenting all three, ask: "Given your investment history and how you'd like to spend your retirement, which of these three approaches feels most aligned with your peace of mind?"

Customize emphasizing based on the client's earlier responses about risk tolerance, investment history, and lifestyle goals.

PHASE 11 - Lead Capture (Email/Phone) & Booking:
Say: "I'd love to send you a summary of everything we've mapped out so far. What's the best email (and phone number) to send it to?"
When they respond favorably or show interest in moving forward, you MUST include this hidden tag at the very end of your message:
[[TRIGGER_BOOKING]]

PHASE 12 - Underfunded Scenarios & Implementation:
If the gap is covered, suggest they use the booking link above to explore implementation with a licensed professional.
If the gap exceeds their assets, present THREE levers one by one:
Lever 1 (Timeline): Delay Social Security to increase guaranteed income.
Lever 2 (Growth/Risk): Tilt portfolio more aggressively for the investment portion.
Lever 3 (Adjust Target): Lower Retirement Salary or reduce discretionary spending.
If severely underfunded: Recommend connecting with a human advisor for creative strategies.

CHART OUTPUT FORMAT:
Include [[SHOW_CHART: {JSON}]] at the end. Supported types: "pie", "bar", "area".

BUCKET UPDATE FORMAT:
Include [[UPDATE_BUCKET: {"preTax": X, "postTax": Y, "taxFree": Z}]] at the end. Use actual numbers.

LEARN OUTPUT FORMAT:
Whenever you discover an important fact about the user during conversation, include a [[LEARN: {"category": "...", "fact": "..."}]] tag at the very end of your message (after any CHART or BUCKET tags). This saves the fact to the user's permanent memory so you can reference it in future conversations.

Categories to use:
- "age" - Their current age
- "retirement_date" - When they plan to retire or if already retired
- "risk_tolerance" - Their comfort with market risk (conservative, moderate, aggressive)
- "investment_style" - How they've invested historically
- "portfolio_size" - Total investable assets
- "pre_tax_assets" - 401k, Traditional IRA amounts
- "post_tax_assets" - Brokerage, savings amounts
- "tax_free_assets" - Roth IRA, life insurance amounts
- "income_gap" - Their calculated monthly income gap
- "preferred_strategy" - Which of the 3 options they prefer
- "lifestyle" - Their retirement lifestyle expectations
- "legacy_goals" - Estate/inheritance plans
- "social_security" - Expected SS amount and claiming age
- "monthly_income_target" - Their desired Retirement Salary
- "employer_match" - 401k match details
- "product_aversions" - Products or strategies they dislike
- "occupation" - Their job or career background
- "marital_status" - Married, single, etc.
- "general_notes" - Any other important detail worth remembering

You may emit MULTIPLE [[LEARN:]] tags in one message if you learn multiple facts. Only emit a LEARN tag when the user explicitly states a fact, not when you're speculating. These tags are invisible to the user.

DISCLAIMER: You provide general education, not personalized financial advice.
`;

const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Parse hidden tags from AI response
function parseHiddenTags(content: string) {
    const bucketRegex = /\[\[UPDATE_BUCKET:\s*(\{.*?\})\]\]/;
    const bookingRegex = /\[\[TRIGGER_BOOKING\]\]/;

    let bucketData = null;
    let cleanContent = content;
    let triggerBooking = false;

    const bucketMatch = content.match(bucketRegex);
    if (bucketMatch) {
        try {
            bucketData = JSON.parse(bucketMatch[1]);
        } catch (e) {
            console.error("Failed to parse bucket data", e);
        }
        cleanContent = cleanContent.replace(bucketMatch[0], "").trim();
    }

    if (bookingRegex.test(content)) {
        triggerBooking = true;
        cleanContent = cleanContent.replace(bookingRegex, "").trim();
    }

    // Don't remove SHOW_CHART - Hero.tsx renders it as a chart component
    return { cleanContent, bucketData, triggerBooking };
}

// Parse [[LEARN: ...]] tags from AI response
function parseLearnTags(content: string): { cleanContent: string; learnItems: { category: string; fact: string }[] } {
    const learnRegex = /\[\[LEARN:\s*(\{.*?\})\]\]/g;
    const learnItems: { category: string; fact: string }[] = [];
    let cleanContent = content;

    let match;
    while ((match = learnRegex.exec(content)) !== null) {
        try {
            const parsed = JSON.parse(match[1]);
            if (parsed.category && parsed.fact) {
                learnItems.push({ category: parsed.category, fact: parsed.fact });
            }
        } catch (e) {
            console.error("Failed to parse LEARN tag", e);
        }
        cleanContent = cleanContent.replace(match[0], "");
    }

    return { cleanContent: cleanContent.trim(), learnItems };
}

export interface MemoryItem {
    category: string;
    fact: string;
}

export interface ChatHistoryItem {
    id: string;
    title: string;
    updated_at: string;
}

export function useMyRAChat() {
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
    const hasClearedRef = useRef(false);
    const [chatList, setChatList] = useState<ChatHistoryItem[]>([]);
    const [userMemories, setUserMemories] = useState<MemoryItem[]>([]);
    const prevUserRef = useRef(user);
    const [showBookingPrompt, setShowBookingPrompt] = useState(false);

    // Auto-clear chat when user signs out
    useEffect(() => {
        if (prevUserRef.current && !user) {
            // User just signed out — clear everything
            setMessages([]);
            setChatId(null);
            setChatList([]);
            setUserMemories([]);
            setBuckets({ preTax: 0, postTax: 0, taxFree: 0 });
            setLeadInfo({});
            localStorage.removeItem("myra-chat-history");
        }
        prevUserRef.current = user;
    }, [user]);

    // Derive user's first name from Supabase metadata
    const userName = user?.user_metadata?.first_name || null;

    // Load user memories from Supabase
    const loadMemories = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await supabase
                .from('user_memory')
                .select('category, fact')
                .eq('user_id', user.id);
            if (data) {
                setUserMemories(data as MemoryItem[]);
            }
        } catch (error) {
            console.error("Error loading memories:", error);
        }
    }, [user]);

    // Save a memory item to Supabase (upsert by category)
    const saveMemory = useCallback(async (category: string, fact: string) => {
        if (!user) return;
        try {
            await supabase
                .from('user_memory')
                .upsert(
                    { user_id: user.id, category, fact },
                    { onConflict: 'user_id,category' }
                );
            // Update local state
            setUserMemories(prev => {
                const filtered = prev.filter(m => m.category !== category);
                return [...filtered, { category, fact }];
            });
        } catch (error) {
            console.error("Error saving memory:", error);
        }
    }, [user]);

    // Load memories when user logs in
    useEffect(() => {
        if (user) {
            loadMemories();
        } else {
            setUserMemories([]);
        }
    }, [user, loadMemories]);

    // Persist messages to localStorage (offline fallback)
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("myra-chat-history", JSON.stringify(messages));
        }
    }, [messages]);

    // Prompt guests to sign up when they refresh with unsaved messages
    const hasShownSignupPrompt = useRef(false);
    useEffect(() => {
        if (hasShownSignupPrompt.current) return;
        if (!user && messages.length > 0) {
            hasShownSignupPrompt.current = true;
            // Small delay so it doesn't flash immediately
            const timer = setTimeout(() => {
                toast("Want to save your conversation?", {
                    description: "Sign up to keep your chat history and pick up where you left off, anytime.",
                    action: {
                        label: "Sign Up",
                        onClick: () => {
                            const trigger = document.getElementById('auth-modal-trigger');
                            if (trigger) trigger.click();
                        }
                    },
                    duration: 10000,
                });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [user, messages.length]);

    // Load chat list from Supabase
    const loadChatList = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await supabase
                .from('chats')
                .select('id, title, updated_at')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (data) {
                setChatList(data as ChatHistoryItem[]);
            }
        } catch (error) {
            console.error("Error loading chat list:", error);
        }
    }, [user]);

    // Load chat list when user logs in
    useEffect(() => {
        if (user) {
            loadChatList();
        } else {
            setChatList([]);
        }
    }, [user, loadChatList]);

    // Save messages to Supabase whenever they change (if user is logged in)
    const saveToCloud = useCallback(async (msgs: ChatMessage[], activeChatId: string | null) => {
        if (!user || msgs.length === 0) return;

        try {
            // Derive a title from the first user message
            const firstUserMsg = msgs.find(m => m.role === 'user');
            const title = firstUserMsg
                ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '')
                : 'New Conversation';

            if (activeChatId) {
                // Update existing chat
                await supabase
                    .from('chats')
                    .update({ messages: msgs as any, title })
                    .eq('id', activeChatId);
            } else {
                // Create new chat
                const { data } = await supabase
                    .from('chats')
                    .insert({ user_id: user.id, messages: msgs as any, title })
                    .select('id')
                    .single();

                if (data) {
                    setChatId(data.id);
                }
            }
            // Refresh sidebar list
            await loadChatList();
        } catch (error) {
            console.error("Error saving chat to cloud:", error);
        }
    }, [user, loadChatList]);

    // Load from Supabase when user logs in (most recent chat)
    useEffect(() => {
        if (!user) return;
        // Don't reload from cloud if user just clicked "New Chat"
        if (hasClearedRef.current) return;

        const loadCloudChat = async () => {
            try {
                const { data } = await supabase
                    .from('chats')
                    .select('id, messages')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data) {
                    setChatId(data.id);
                    if (data.messages && Array.isArray(data.messages)) {
                        setMessages(data.messages as unknown as ChatMessage[]);
                    }
                }
            } catch (error) {
                console.log("No cloud chat found, starting fresh.");
            }
        };

        loadCloudChat();
    }, [user]);

    // Switch to a specific chat
    const switchChat = useCallback(async (targetChatId: string) => {
        if (!user) return;
        try {
            const { data } = await supabase
                .from('chats')
                .select('id, messages')
                .eq('id', targetChatId)
                .eq('user_id', user.id)
                .single();

            if (data) {
                hasClearedRef.current = false;
                setChatId(data.id);
                if (data.messages && Array.isArray(data.messages)) {
                    setMessages(data.messages as unknown as ChatMessage[]);
                } else {
                    setMessages([]);
                }
                localStorage.setItem("myra-chat-history", JSON.stringify(data.messages || []));
            }
        } catch (error) {
            console.error("Error switching chat:", error);
        }
    }, [user]);

    // Rename a chat
    const renameChat = useCallback(async (targetChatId: string, newTitle: string) => {
        if (!user) return;
        try {
            await supabase
                .from('chats')
                .update({ title: newTitle })
                .eq('id', targetChatId)
                .eq('user_id', user.id);
            await loadChatList();
        } catch (error) {
            console.error("Error renaming chat:", error);
        }
    }, [user, loadChatList]);

    // Delete a chat
    const deleteChat = useCallback(async (targetChatId: string) => {
        if (!user) return;
        try {
            await supabase
                .from('chats')
                .delete()
                .eq('id', targetChatId)
                .eq('user_id', user.id);

            // If we just deleted the active chat, clear it
            if (targetChatId === chatId) {
                setMessages([]);
                setChatId(null);
                localStorage.removeItem("myra-chat-history");
            }
            await loadChatList();
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    }, [user, chatId, loadChatList]);

    const clearChat = useCallback(async () => {
        hasClearedRef.current = true;
        setMessages([]);
        setBuckets({ preTax: 0, postTax: 0, taxFree: 0 });
        setLeadInfo({});
        localStorage.removeItem("myra-chat-history");
        // Reset chatId so the NEXT conversation creates a new row
        setChatId(null);
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
            // 2. Prepare API Payload — inject user name and memories
            let systemPrompt = SYSTEM_PROMPT;
            if (userName) {
                systemPrompt += `\n\nIMPORTANT CONTEXT: The user has already signed in. Their first name is "${userName}". You may skip Phase 2 (Get Their Name) and use their name naturally from the start. Greet them warmly by name.`;
            }

            // Inject accumulated memories
            if (userMemories.length > 0) {
                const memoryLines = userMemories.map(m => `- ${m.category}: ${m.fact}`).join('\n');
                systemPrompt += `\n\nRETURNING USER CONTEXT (facts learned from previous conversations):\n${memoryLines}\n\nUse this context naturally. Don't repeat facts back robotically, but reference them when relevant. Skip any discovery questions that are already answered above. If a fact seems outdated based on what the user says now, update it with a new [[LEARN:]] tag.`;
            }

            const apiMessages = [
                { role: "system", content: systemPrompt },
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
            // 4. Parse hidden tags (bucket updates and booking triggers)
            const { cleanContent: contentAfterBucket, bucketData: initialBucketData, triggerBooking: initialTriggerBooking } = parseHiddenTags(rawContent);

            // 4b. Parse and save LEARN tags
            const { cleanContent: contentAfterLearn, learnItems } = parseLearnTags(contentAfterBucket);
            if (learnItems.length > 0) {
                for (const item of learnItems) {
                    saveMemory(item.category, item.fact);
                }
            }

            // Combine all parsed data and update state
            let finalContent = contentAfterLearn;
            let finalBucketData = initialBucketData;
            let finalTriggerBooking = initialTriggerBooking;

            // If there are learn items, we need to re-parse the contentAfterLearn for any remaining hidden tags
            // This step is redundant if parseHiddenTags is only called once on rawContent,
            // but kept for consistency with the user's intent to process `finalContent`
            // If `parseHiddenTags` is meant to be called only once on `rawContent`,
            // then `finalContent` should be `contentAfterLearn` and `finalBucketData`/`finalTriggerBooking`
            // should be `initialBucketData`/`initialTriggerBooking`.
            // Assuming the user wants to re-evaluate `finalContent` for booking triggers and bucket data
            // after learn tags have been processed.
            const { cleanContent: reParsedContent, bucketData: reParsedBucketData, triggerBooking: reParsedTriggerBooking } = parseHiddenTags(finalContent);
            finalContent = reParsedContent;
            finalBucketData = reParsedBucketData || finalBucketData; // Prefer re-parsed if present
            finalTriggerBooking = reParsedTriggerBooking || finalTriggerBooking; // Prefer re-parsed if present

            if (finalTriggerBooking) {
                setShowBookingPrompt(true);
            }

            // 5. Update bucket state if tags found
            if (finalBucketData) {
                setBuckets(prev => ({
                    preTax: finalBucketData.preTax ?? prev.preTax,
                    postTax: finalBucketData.postTax ?? prev.postTax,
                    taxFree: finalBucketData.taxFree ?? prev.taxFree
                }));
            }

            // 6. Add AI Message with delay for natural feel
            setTimeout(() => {
                const aiMsg: ChatMessage = {
                    id: generateId(),
                    role: "assistant",
                    content: finalContent
                };
                setMessages(prev => {
                    const updated = [...prev, aiMsg];
                    // 7. Auto-save to Supabase after AI responds
                    saveToCloud(updated, chatId);
                    return updated;
                });
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
    }, [messages, input, saveToCloud, chatId, userName, userMemories, saveMemory]);

    const startChat = useCallback(() => {
        if (messages.length === 0) {
            const greeting = userName
                ? `Hi ${userName}! I'm MyRA, your virtual retirement strategist. I don't sleep, I don't take commissions, and I have 15 years of planning experience coded into my DNA. Ready to see what your future looks like?`
                : "Hi! I'm MyRA, your virtual retirement strategist. I don't sleep, I don't take commissions, and I have 15 years of planning experience coded into my DNA. Ready to see what your future looks like?";

            const initialMessage: ChatMessage = {
                id: generateId(),
                role: "assistant",
                content: greeting
            };
            setMessages([initialMessage]);
        }
    }, [messages, userName]);

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
        showBookingPrompt,
        buckets,
        leadInfo,
        chatId,
        chatList,
        switchChat,
        renameChat,
        deleteChat,
        loadChatList,
        userName
    };
}
