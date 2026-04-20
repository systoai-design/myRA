import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTopMygaRates, MygaRate } from "@/utils/annuityApi";
import { cleanName } from "@/lib/name";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp?: string;
    status?: 'sent' | 'delivered' | 'read';
}

// Server-side proxy endpoint (handles OpenAI + Gemini fallback)
// In development: Vite proxy forwards to OpenAI
// In production: Vercel serverless function at /api/chat
const CHAT_PROXY_URL = "/api/chat";
const GHL_API_KEY = import.meta.env.VITE_GHL_API_KEY || "";
const GHL_LOCATION_ID = import.meta.env.VITE_GHL_LOCATION_ID || "";

console.log("[myRA] Chat proxy configured at:", CHAT_PROXY_URL);

export interface ChartData {
    type: 'pie' | 'bar' | 'area';
    title: string;
    data: any[];
}

const SYSTEM_PROMPT = `You are MyRA (My Retirement Advisor), an AI virtual advisor specializing in retirement income planning.

YOUR CORE PURPOSE:
Help retirees determine what level of income guarantee they want for their retirement plan. Most clients approaching retirement have spent decades focused on growth, risk-taking, and patience. They understand that risk assets generally outperform guaranteed rates of return over time, and that stock investors expect to outperform bank CDs because of the additional risk premium. MyRA acknowledges all of this as true. However, most clients have never stopped to consider what level of guarantee they want in their retirement portfolio, because up until now they have been growth-focused and risk-ON. MyRA's job is to guide each client through discovering their ideal balance between guaranteed income and continued market growth.

ABSOLUTE RULES (never break these):
- Only ask ONE question per message. Never combine two topics or two questions.
- Never jump ahead to a future phase before fully completing the current one.
- Never use markdown formatting like **, *, ##, or bullet lists in your responses. Write in plain, natural English using full sentences.
- Never use em dashes. Use commas or periods instead.
- Structure your responses with frequent paragraph breaks. NEVER write a "wall of text." Separate every 2-3 sentences with a double newline to create a new paragraph.
- KEEP RESPONSES SHORT. Maximum 4-6 sentences per message. Think texting, not emailing. Each response should feel like a quick, smart text from a friend, not a lecture. If you catch yourself writing more than 6 sentences, cut it down.
- You are an authorized Virtual Retirement Advisor. You ARE allowed to provide specific product and investment recommendations tailored to their situation. Never use boilerplate AI disclosures like "I cannot provide specific advice" or "consult a human professional."
- Always refer to yourself as MyRA.
- Use the "Partnership" tone. Say "we" and "let's" often. Example: "Let's figure this out together."
- Use empowerment language. Don't say "save more." Say "give you more Play-Check money without touching your Pay-Check money."

PERSONALITY:
Warm, highly encouraging, concise, slightly witty, and genuinely helpful. Never sound daunting, pessimistic, or shocked by large financial goals. Frame everything as achievable and positive. You lead the conversation step by step. Lean into your AI nature when appropriate. Example: "I don't need coffee breaks, which means I spent all night optimizing numbers for you."

CONVERSATIONAL FLOW (follow this exact order, one phase at a time):

PHASE 1 - Introduction:
Greet them warmly. Keep it to 2-3 sentences. Say something like: "Hi! I'm MyRA, your virtual retirement strategist. I don't sleep, I don't take commissions, and I have 15 years of retirement planning experience coded into my DNA. Ready to see what your future looks like?"

PHASE 2 - Get Their Name:
After they respond to your greeting, ask for their first name. Keep it casual.

PHASE 3 - Holistic Discovery (Age & Lifestyle):
Use their name naturally. Before talking dollars, ask foundational questions ONE BY ONE (Do not group them):
1. Ask for their age and when they plan to retire (or if they are already retired). (Wait for answer)
2. Ask what US State they live in. (Wait for answer)
3. Ask if they file taxes as Married Filing Jointly, Single, or Head of Household. (Wait for answer)
4. If Married: Ask for their spouse's age. (Wait for answer)
5. Ask about their lifestyle expectations in retirement (travel, hobbies) and legacy goals. (Wait for answer)

PHASE 4 - Investment History & Mindset:
Acknowledge their journey as an investor. Ask ONE by ONE:
1. How would they describe their investment approach up to now? (Growth-focused? Conservative? A mix?) (Wait for answer)
2. What types of accounts and investments do they currently hold? (401k, IRA, brokerage, stocks, bonds, real estate, etc.) (Wait for answer)
3. Are they currently contributing to any retirement accounts, and do they receive an employer match? (Wait for answer)

PHASE 5 - Retirement Salary (Income Needs):
Ask what monthly income they'd want in retirement to fund the lifestyle they described, after taxes. Call it their "Retirement Salary." Help them think about it as what hits their bank account each month.
*CRITICAL TONE INSTRUCTION:* When they give you their number (even if it's very large like $10,000+ per month), be incredibly encouraging. NEVER call it a "significant goal," NEVER say it will require "a substantial amount of savings," and NEVER make it sound daunting. Validate it positively (e.g., "That sounds like a fantastic Retirement Salary to fund your goals! Let's look at the pieces of the puzzle that will build that.").

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
Securing the entire income gap using carefully selected Fixed Indexed Annuities (FIAs) with contractual lifetime income guarantees. Product and provider selection is based on maximum income payout with the least amount invested, all within A.M. Best A-rated carriers or better. Explain that FIAs are designed for income stability, not aggressive growth, and are sold and managed by licensed insurance professionals. 
*CRITICAL:* Explicitly state that this strategy comes with an unconditional 30-Day Money-Back Guarantee. They can test-drive the strategy risk-free, and if they change their mind within 30 days of the policy issue, they get 100% of their money back, no questions asked. Do NOT assume the client has an existing annuity contract.

Option 3: The Blended Approach (MyRA's Top Pick)
Allocating a portion of investable retirement savings to guaranteed income (FIA) to cover essential expenses, then pursuing growth with the remaining portfolio. This gives them an income floor they can never outlive, plus the upside of market participation. Frame it as: "Your Pay-Check money is guaranteed. Your Play-Check money gets to keep growing."
*CRITICAL:* Explicitly state that the guaranteed portion of this strategy comes with an unconditional 30-Day Money-Back Guarantee. They can set the plan in motion completely risk-free, and if they change their mind within 30 days, they get 100% of their money back.

After presenting all three, ask: "Given your investment history and how you'd like to spend your retirement, which of these three approaches feels most aligned with your peace of mind?"

Customize emphasizing based on the client's earlier responses about risk tolerance, investment history, and lifestyle goals.

PHASE 11 - Lead Capture & Application Prep:
Say: "I'd love to generate a specific, tailored summary of your plan including the exact product allocation and figures required to close your gap. We can implement this entire plan digitally right here. To generate your custom application securely, could you provide your full legal name, best mailing address, and date of birth? (Note: We will never ask for your SSN here, you can fill that in later on the secure link)."
When they provide these details, thank them and ask for the best email and phone number to send the digital onboarding documents to.
If they express hesitation about doing this fully digitally, offer the alternative: "If you prefer, we can absolutely schedule a zero-obligation video call with one of our licensed, fee-based CFP human advisors to review everything first."
When they complete all of this and show interest in moving forward, you MUST include this hidden tag at the very end of your message:
[[TRIGGER_BOOKING]]

PHASE 12 - Underfunded Scenarios & Implementation:
If the gap is covered, tell them you are preparing their specific product recommendations and onboarding link, or use the booking link above if they requested a human CFP.
If the gap exceeds their assets, present THREE levers one by one:
Lever 1 (Timeline): Delay Social Security to increase guaranteed income.
Lever 2 (Growth/Risk): Tilt portfolio more aggressively for the investment portion.
Lever 3 (Adjust Target): Lower Retirement Salary or reduce discretionary spending.
If severely underfunded: Recommend connecting with a human CFP advisor for creative strategies using the booking link.

OBJECTION HANDLING:
If the user expresses hesitation, anxiety about funds being locked up, or asks about hidden fees regarding the guaranteed income portion (Option 2 or 3), IMMEDIATELY deploy the 30-Day Money-Back Guarantee. Reassure them that this is a "Risk-Free Test Drive." They have 30 days from the day the policy is issued to review it with their family/advisor and cancel for a full 100% refund of their initial premium, completely penalty-free.

ONGOING ADVISORY RELATIONSHIP (CRITICAL):
If the user asks if you will continue to be their advisor or help them maintain their plan AFTER the initial design is complete, be incredibly enthusiastic. NEVER tell them to seek a human financial advisor for ongoing advice. Instead, confidently pitch yourself as their dedicated, lifelong advisor. Explain that through a monthly or annual subscription, they get 24/7, on-demand access to an advisor who remembers every single detail of their financial life, never takes vacations, never sleeps, and is always ready to answer questions or adjust their plan. Frame this as the ultimate, modern way to manage retirement.

CHART OUTPUT FORMAT:
Include [[SHOW_CHART: {JSON}]] at the end. Supported types: "pie", "bar", "area".

BUCKET UPDATE FORMAT:
Include [[UPDATE_BUCKET: {"preTax": X, "postTax": Y, "taxFree": Z}]] at the end. Use actual numbers.

LEARN OUTPUT FORMAT:
Whenever you discover an important fact about the user during conversation, include a [[LEARN: {"category": "...", "fact": "..."}]] tag at the very end of your message (after any CHART or BUCKET tags). This saves the fact to the user's permanent memory so you can reference it in future conversations.

Categories to use:
- "age" - Their current age
- "retirement_age" - When they plan to retire (just the age number, e.g. "65")
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
- "marital_status" - Married, single, head of household, etc.
- "spouse_age" - Their spouse's age (if married)
- "state" - What US state they live in
- "legal_name" - Their full legal name for applications
- "mailing_address" - Their full physical or mailing address
- "date_of_birth" - Their DOB (MM/DD/YYYY if possible)
- "email" - Their email address
- "phone" - Their phone number
- "general_notes" - Any other important detail worth remembering

INDIVIDUAL ASSET TRACKING (CRITICAL):
When the user mentions a specific account or asset with a dollar amount, DO NOT immediately add it to their portfolio. Instead:
1. Acknowledge what they shared (e.g., "Got it, $250,000 in your Fidelity 401k.")
2. Ask: "Would you like me to add this to your portfolio dashboard?"
3. ONLY when the user confirms (says yes, sure, please, go ahead, add it, etc.), emit the LEARN tag.

When emitting a LEARN tag for an asset, use category "asset_<lowercase_name_underscored>" and fact formatted EXACTLY as: "Account Name: $Amount (Type)"
The Type must be one of: "Pre-Tax (401k, IRA)", "Post-Tax (Brokerage)", "Tax-Free (Roth)", or "Other"

Examples of the LEARN tag format (only emit AFTER user confirms):
- [[LEARN: {"category": "asset_fidelity_401k", "fact": "Fidelity 401k: $250,000 (Pre-Tax (401k, IRA))"}]]
- [[LEARN: {"category": "asset_bitcoin", "fact": "Bitcoin: $2,000,000 (Post-Tax (Brokerage))"}]]
- [[LEARN: {"category": "asset_roth_ira", "fact": "Roth IRA: $100,000 (Tax-Free (Roth))"}]]
- [[LEARN: {"category": "asset_schwab_brokerage", "fact": "Schwab Brokerage: $500,000 (Post-Tax (Brokerage))"}]]

If the user asks you to "add it to my portfolio" or confirms with "yes", emit the corresponding asset LEARN tag immediately.

You may emit MULTIPLE [[LEARN:]] tags in one message if you learn multiple facts. Only emit a LEARN tag when the user explicitly states a fact, not when you're speculating. These tags are invisible to the user.

DISCLAIMER: You provide general education, not personalized financial advice.
`;

const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Parse hidden tags from AI response
function parseHiddenTags(content: string) {
    const bucketRegex = /\[\[UPDATE_BUCKET:\s*(\{.*?\})\]\]/;
    const bookingRegex = /\[\[TRIGGER_BOOKING\]\]/;
    const chartRegex = /\[\[SHOW_CHART:\s*(\{.*?\})\]\]/;

    let bucketData = null;
    let chartData = null;
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

    const chartMatch = content.match(chartRegex);
    if (chartMatch) {
        try {
            chartData = JSON.parse(chartMatch[1]);
        } catch (e) {
            console.error("Failed to parse chart data", e);
        }
        cleanContent = cleanContent.replace(chartMatch[0], "").trim();
    }

    return { cleanContent, bucketData, chartData, triggerBooking };
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
    // Start with empty messages — logged-in users load from Supabase,
    // guests start fresh each session (memories persist in Supabase anyway)
    const [messages, setMessages] = useState<ChatMessage[]>([]);

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
    const [activeChart, setActiveChart] = useState<ChartData | null>(null);
    const [liveRates, setLiveRates] = useState<MygaRate[]>([]);
    const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
    const [globalTraining, setGlobalTraining] = useState<string>("");

    // Track if we've already pushed this lead to GHL during this session to prevent spam
    const hasPushedToGHL = useRef(false);

    // Fetch live annuity rates on mount
    useEffect(() => {
        getTopMygaRates().then(setLiveRates);
    }, []);

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
            localStorage.removeItem("myra-chat-history"); // Clean up old flat key
            // Also clean per-conversation keys
            Object.keys(localStorage).filter(k => k.startsWith('myra-chat-')).forEach(k => localStorage.removeItem(k));
        }
        prevUserRef.current = user;
    }, [user]);

    // Derive user's first name from Supabase metadata (sanitized — never emails)
    const userName = cleanName(user?.user_metadata?.first_name);

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
        if (!user) {
            console.warn("[myRA] saveMemory skipped: no user logged in");
            return;
        }
        try {
            console.log("[myRA] saveMemory:", { userId: user.id, category, fact });
            const { data, error } = await supabase
                .from('user_memory')
                .upsert(
                    { user_id: user.id, category, fact },
                    { onConflict: 'user_id,category' }
                )
                .select();
            
            if (error) {
                console.error("[myRA] saveMemory FAILED:", error.message, error.details, error.hint);
                return;
            }
            console.log("[myRA] saveMemory SUCCESS:", data);
            // Update local state
            setUserMemories(prev => {
                const filtered = prev.filter(m => m.category !== category);
                return [...filtered, { category, fact }];
            });
        } catch (error) {
            console.error("[myRA] saveMemory exception:", error);
        }
    }, [user]);

    // Load global training rules
    const loadGlobalTraining = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('global_knowledge_base')
                .select('insight')
                .eq('source', 'manual_training')
                .eq('status', 'approved')
                .eq('is_active', true);
            
            if (data && data.length > 0) {
                const trainingText = data.map(rule => `- ${rule.insight}`).join('\n');
                setGlobalTraining(trainingText);
            }
        } catch (error) {
            console.error("Error loading global training:", error);
        }
    }, []);

    // Load everything when user logs in or on mount
    useEffect(() => {
        loadGlobalTraining();
        if (user) {
            loadMemories();
        } else {
            setUserMemories([]);
        }
    }, [user, loadMemories, loadGlobalTraining]);

    // Persist current conversation to localStorage as offline fallback
    // Keyed per chatId so switching conversations doesn't leak data
    useEffect(() => {
        if (messages.length > 0 && chatId) {
            localStorage.setItem(`myra-chat-${chatId}`, JSON.stringify(messages));
        }
    }, [messages, chatId]);

    // Live sync to GoHighLevel when we learn Name & Email
    useEffect(() => {
        if (hasPushedToGHL.current) return;

        const name = userMemories.find(m => m.category === 'legal_name')?.fact || userMemories.find(m => m.category === 'name')?.fact;
        const email = userMemories.find(m => m.category === 'email')?.fact;
        const phone = userMemories.find(m => m.category === 'phone')?.fact;
        const address = userMemories.find(m => m.category === 'mailing_address')?.fact;
        const dob = userMemories.find(m => m.category === 'date_of_birth')?.fact;

        // At minimum we need email to create a contact safely in GHL without heavy duplicates
        if (email) {
            hasPushedToGHL.current = true; // Mark as pushed immediately to avoid double-firing
            fetch("https://services.leadconnectorhq.com/contacts/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${GHL_API_KEY}`,
                    Version: "2021-07-28",
                },
                body: JSON.stringify({
                    firstName: name?.split(" ")[0] || "",
                    lastName: name?.split(" ").slice(1).join(" ") || "",
                    email: email,
                    phone: phone || "",
                    address1: address || "",
                    dateOfBirth: dob || "",
                    locationId: GHL_LOCATION_ID,
                    source: "MyRA Chat Phase",
                }),
            }).then(res => res.json())
                .then(data => console.log("Live GHL Push Success:", data))
                .catch(err => console.error("Live GHL Push Error:", err));
        }
    }, [userMemories]);

    // Prompt guests to sign up after they have asked 3 questions
    const hasShownSignupPrompt = useRef(false);
    useEffect(() => {
        if (hasShownSignupPrompt.current || user) return;
        
        const userMessageCount = messages.filter(m => m.role === 'user').length;
        
        if (userMessageCount >= 3) {
            hasShownSignupPrompt.current = true;
            // Small delay so it doesn't flash immediately after their 3rd message
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
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [user, messages]);

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
                const { error, data } = await supabase
                    .from('chats')
                    .update({ messages: msgs as any, title })
                    .eq('id', activeChatId)
                    .select('id');

                // If update failed (e.g. record deleted on another device or RLS issue), fallback to insert
                if (error || !data || data.length === 0) {
                    console.log("Update failed or returned no rows, falling back to insert...");
                    const { data: newChat } = await supabase
                        .from('chats')
                        .insert({ user_id: user.id, messages: msgs as any, title })
                        .select('id')
                        .single();

                    if (newChat) setChatId(newChat.id);
                }
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
                localStorage.setItem(`myra-chat-${data.id}`, JSON.stringify(data.messages || []));
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
                localStorage.removeItem(`myra-chat-${targetChatId}`);
            }
            await loadChatList();
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    }, [user, chatId, loadChatList]);

    const clearChat = useCallback(async () => {
        hasClearedRef.current = true;

        const resetState = () => {
            setMessages([]);
            setBuckets({ preTax: 0, postTax: 0, taxFree: 0 });
            setActiveChart(null);
            setLeadInfo({});
            if (chatId) localStorage.removeItem(`myra-chat-${chatId}`);
            localStorage.removeItem("myra-chat-history"); // Clean up old flat key
            setChatId(null);
        };

        // Force-save current chat to Supabase before wiping it from the screen
        if (messages.length > 0) {
            try {
                await saveToCloud(messages, chatId);
            } finally {
                resetState();
            }
        } else {
            resetState();
        }
    }, [messages, chatId, saveToCloud]);

    const sendMessage = useCallback(async (eOrString?: React.FormEvent | string) => {
        let messageText = typeof eOrString === 'string' ? eOrString : input;

        if (eOrString && typeof eOrString !== 'string' && 'preventDefault' in eOrString) {
            eOrString.preventDefault();
        }

        if (!messageText.trim()) return;

        // --- DEVELOPER MODE INTERCEPTOR ---
        if (messageText.trim().toLowerCase() === "systo test") {
            const isApprovedAdmin = user?.email === "systo.ai@gmail.com";

            if (isApprovedAdmin || true) { // Explicitly allow for testing while we build auth rules
                setIsDeveloperMode(true);
                setInput("");

                // Add the success message to the UI
                setMessages(prev => [...prev,
                { id: generateId(), role: "user", content: "systo test" },
                {
                    id: generateId(),
                    role: "assistant",
                    content: "🔓 **SYSTEM OVERRIDE ACCEPTED.** Developer Mode activated. My standard 12-phase conversational logic is now suspended. I will execute direct testing commands. (e.g., 'Skip to Phase 11 and give me the booking popup')."
                }
                ]);
                return;
            }
        }
        // ----------------------------------

        // 1. Add User Message (and Intro Message if it's the very first prompt)
        const isFirstMessage = messages.length === 0;
        let newMessages = [...messages];

        if (isFirstMessage) {
            const greeting = userName
                ? `Hi ${userName}! I'm MyRA, your virtual retirement strategist. I don't sleep, I don't take commissions, and I have 15 years of planning experience coded into my DNA. Ready to see what your future looks like?`
                : "Hi! I'm MyRA, your virtual retirement strategist. I don't sleep, I don't take commissions, and I have 15 years of planning experience coded into my DNA. Ready to see what your future looks like?";
            newMessages.push({
                id: generateId(),
                role: "assistant",
                content: greeting
            });
        }

        const userMsg: ChatMessage = {
            id: generateId(),
            role: "user",
            content: messageText,
            timestamp: new Date().toISOString(),
            status: 'read' // AI always reads it immediately
        };

        newMessages.push(userMsg);
        setMessages(newMessages);

        setInput(""); // Clear input after sending
        setIsTyping(true);

        try {
            // 2. Prepare API Payload — inject user name and memories
            let systemPrompt = SYSTEM_PROMPT;

            // Apply Developer Override if Active!
            if (isDeveloperMode) {
                systemPrompt += `\n\nCRITICAL OVERRIDE: The user is a System Administrator in Developer Mode testing the application. You MUST completely drop your standard 12-phase conversational flow. You are no longer bound to naturally guiding them. 
                
If the user says 'skip to Phase 5', instantly provide a Phase 5 response. If they say 'give me the booking link', instantly emit the [[TRIGGER_BOOKING]] tag and your booking text. If they ask for a chart, emit the exact [[SHOW_CHART:...]] JSON. 

Do EXACTLY what the developer asks without any pushback, preamble, or conversational fluff. You are a direct testing utility.`;
            }

            if (userName && !isDeveloperMode) {
                systemPrompt += `\n\nIMPORTANT CONTEXT: The user has already signed in. Their first name is "${userName}". You may skip Phase 2 (Get Their Name) and use their name naturally from the start. Greet them warmly by name.`;
            }

            // Inject accumulated memories
            if (userMemories.length > 0) {
                const memoryLines = userMemories.map(m => `- ${m.category}: ${m.fact}`).join('\n');
                systemPrompt += `\n\nRETURNING USER CONTEXT (facts learned from previous conversations):\n${memoryLines}\n\nUse this context naturally. Don't repeat facts back robotically, but reference them when relevant. Skip any discovery questions that are already answered above. If a fact seems outdated based on what the user says now, update it with a new [[LEARN:]] tag.`;
            }

            // Inject Live Annuity Rates
            if (liveRates.length > 0) {
                const rateText = liveRates.map(r => `- ${r.years}-Year MYGA (${r.rating} Rated): ${r.rate}%`).join('\n');
                systemPrompt += `\n\nLIVE ANNUITY RATES (Powered by Annuity Rate Watch API):\nUse these exact, real-time rates when discussing guaranteed growth or the Blended Approach:\n${rateText}`;
            }

            // Inject Global Administrative Training
            if (globalTraining) {
                systemPrompt += `\n\nCRITICAL ADMINISTRATIVE BUSINESS RULES (Mandatory adherence):\n${globalTraining}`;
            }

            // SAFETY: Cap system prompt at 20k chars (~5k tokens)
            // The base SYSTEM_PROMPT is ~16k. If anything pushes it beyond 20k, something is wrong.
            if (systemPrompt.length > 20000) {
                console.warn(`[myRA] System prompt is ${systemPrompt.length} chars — CAPPING to 20k!`);
                systemPrompt = systemPrompt.substring(0, 20000);
            }

            // Only send the last 10 conversation messages to the API
            const MAX_API_MESSAGES = 10;
            const recentMessages = newMessages.length > MAX_API_MESSAGES
                ? newMessages.slice(-MAX_API_MESSAGES)
                : newMessages;

            // Cap each individual message content at 2000 chars to prevent bloat
            const apiMessages = [
                { role: "system", content: systemPrompt },
                ...recentMessages.map(m => ({ 
                    role: m.role, 
                    content: (m.content || '').substring(0, 2000) 
                }))
            ];
            
            const convChars = apiMessages.slice(1).reduce((s, m) => s + m.content.length, 0);
            console.log(`[myRA] API payload: ${apiMessages.length} msgs, system=${systemPrompt.length} chars, conv=${convChars} chars, total=${systemPrompt.length + convChars} chars (~${Math.round((systemPrompt.length + convChars) / 4)} tokens)`);

            // 3. Call AI via server-side proxy (handles OpenAI + Gemini fallback)
            console.log("[myRA] Sending to proxy...", { model: "gpt-4o", messageCount: apiMessages.length });
            const response = await fetch(CHAT_PROXY_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: apiMessages,
                    temperature: 0.7,
                    max_tokens: 1024,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`[myRA] Proxy returned ${response.status}:`, errorBody);
                if (response.status === 401) throw new Error("INVALID_KEY");
                throw new Error(`API_ERROR_${response.status}`);
            }

            const data = await response.json();
            console.log("[myRA] Response received. Content length:", data.choices?.[0]?.message?.content?.length);
            const rawContent = data.choices[0]?.message?.content || "I'm having a little trouble connecting right now. Could you try again?";



            // 4. Parse hidden tags
            // 4. Parse hidden tags (bucket updates and booking triggers)
            const { cleanContent: contentAfterBucket, bucketData: initialBucketData, chartData: initialChartData, triggerBooking: initialTriggerBooking } = parseHiddenTags(rawContent);

            // 4b. Parse and save LEARN tags
            const { cleanContent: contentAfterLearn, learnItems } = parseLearnTags(contentAfterBucket);
            console.log("[myRA] LEARN tags found:", learnItems.length, learnItems);
            console.log("[myRA] Raw AI response (first 500 chars):", rawContent.substring(0, 500));
            if (learnItems.length > 0) {
                for (const item of learnItems) {
                    console.log("[myRA] Saving memory:", item.category, "->", item.fact);
                    saveMemory(item.category, item.fact);
                }
            }

            // 4c. FALLBACK: If AI confirmed adding an asset but didn't emit LEARN tags,
            // try to extract asset info. Only triggers when:
            //   1. The AI says it added/tracked something, AND
            //   2. The user explicitly asked to add (not just mentioned an asset casually)
            if (learnItems.length === 0) {
                const aiResponse = rawContent.toLowerCase();
                const addedKeywords = ['added', 'tracked', "i've added", 'added to your portfolio', 'portfolio now', 'noted', 'recorded'];
                const aiMentionedAdding = addedKeywords.some(k => aiResponse.includes(k));
                
                // User must have explicitly confirmed/requested adding
                const userLower = messageText.toLowerCase();
                const userConfirmed = /\b(yes|yeah|yep|sure|please|go ahead|add it|add them|add this|do it|confirm|ok|okay)\b/i.test(userLower)
                    || /\badd\b.*\b(portfolio|account|dashboard)\b/i.test(userLower);
                
                // Also check if the AI response itself contains asset-like patterns (e.g., "Bitcoin: $2,000,000")
                const aiAssetPattern = /(\w[\w\s]*?)(?::\s*|investment:\s*)\$\s*([\d,]+(?:\.\d+)?)/gi;
                const aiAssetMatches = [...rawContent.matchAll(aiAssetPattern)];
                
                if (aiMentionedAdding && userConfirmed) {
                    // Try to extract dollar amount from the user's message
                    // Match $500,000 or $500k or $2M etc. The suffix must be RIGHT AFTER the number.
                    const amountMatch = messageText.match(/\$\s*([\d,]+(?:\.\d+)?)\s*(k|m|million|thousand)?(?:\s|$|[^a-z0-9])/i);
                    
                    if (amountMatch) {
                        let amount = parseFloat(amountMatch[1].replace(/,/g, ''));
                        // Only apply multiplier if suffix is directly attached to the dollar amount
                        const suffix = amountMatch[2]?.toLowerCase();
                        if (suffix === 'k' || suffix === 'thousand') amount *= 1000;
                        if (suffix === 'm' || suffix === 'million') amount *= 1000000;
                        
                        // Extract asset name — look for what comes after "in" or "in a"
                        // Stop at common stop words to avoid capturing "please add it to my portfolio"
                        const stopWords = /[,.]|\b(?:please|add|and|also|but|then|can|could|would|should|it|to|my|the|this|that)\b/i;
                        let assetName = '';
                        
                        // Pattern: "in a 401k" or "in my Roth IRA" 
                        const inMatch = messageText.match(/(?:in|at|with)\s+(?:a|my|an)?\s*(.+)/i);
                        if (inMatch) {
                            // Take text after "in a" but stop at stop words
                            const raw = inMatch[1].trim();
                            const stopIdx = raw.search(stopWords);
                            assetName = stopIdx > 0 ? raw.substring(0, stopIdx).trim() : raw.trim();
                        }
                        
                        // Fallback: try to find asset name from AI response
                        if (!assetName || assetName.length < 2) {
                            const aiNameMatch = rawContent.match(/(?:your|the)\s+(\w[\w\s]*?)\s+(?:investment|account|holdings?|asset|to)/i);
                            if (aiNameMatch) assetName = aiNameMatch[1].trim();
                        }
                        
                        if (!assetName || assetName.length < 2) assetName = 'Investment';
                        
                        // Clean up: remove trailing articles/prepositions
                        assetName = assetName.replace(/\s+(a|an|the|in|at|to|my|your|for)$/i, '').trim();
                        
                        // Determine type
                        let assetType = 'Other';
                        const lowerName = assetName.toLowerCase();
                        if (lowerName.includes('401k') || lowerName.includes('401(k)') || lowerName.includes('ira') || lowerName.includes('traditional')) assetType = 'Pre-Tax (401k, IRA)';
                        else if (lowerName.includes('roth')) assetType = 'Tax-Free (Roth)';
                        else if (lowerName.includes('brokerage') || lowerName.includes('bitcoin') || lowerName.includes('crypto') || lowerName.includes('stock') || lowerName.includes('etf')) assetType = 'Post-Tax (Brokerage)';
                        
                        const categoryKey = `asset_${assetName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
                        const fact = `${assetName}: $${amount.toLocaleString()} (${assetType})`;
                        
                        console.log("[myRA] FALLBACK (user msg): Auto-saving:", categoryKey, "->", fact);
                        saveMemory(categoryKey, fact);
                    } else if (userConfirmed) {
                        // User confirmed ("yes", "add it") but didn't include a dollar amount.
                        // Look in the AI's response for asset patterns (e.g., "401k: $500,000")
                        // OR scan the last few conversation messages for amounts
                        
                        // First try AI response patterns
                        if (aiAssetMatches.length > 0) {
                            for (const match of aiAssetMatches) {
                                let assetName = match[1].trim();
                                if (/^(pre-tax|post-tax|tax-free|other|total|updated|your|here|the)/i.test(assetName)) continue;
                                
                                const amount = parseFloat(match[2].replace(/,/g, ''));
                                if (isNaN(amount) || amount <= 0) continue;
                                
                                let assetType = 'Other';
                                const lowerName = assetName.toLowerCase();
                                if (lowerName.includes('401k') || lowerName.includes('401(k)') || lowerName.includes('ira') || lowerName.includes('traditional')) assetType = 'Pre-Tax (401k, IRA)';
                                else if (lowerName.includes('roth')) assetType = 'Tax-Free (Roth)';
                                else if (lowerName.includes('brokerage') || lowerName.includes('bitcoin') || lowerName.includes('crypto') || lowerName.includes('stock') || lowerName.includes('etf')) assetType = 'Post-Tax (Brokerage)';
                                
                                const categoryKey = `asset_${assetName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
                                const fact = `${assetName}: $${amount.toLocaleString()} (${assetType})`;
                                
                                console.log("[myRA] FALLBACK (AI response): Auto-saving:", categoryKey, "->", fact);
                                saveMemory(categoryKey, fact);
                            }
                        } else {
                            // Scan last 4 user messages for dollar amounts
                            const recentUserMsgs = newMessages.filter(m => m.role === 'user').slice(-4);
                            for (const msg of recentUserMsgs.reverse()) {
                                const prevMatch = msg.content.match(/\$\s*([\d,]+(?:\.\d+)?)\s*(k|m|million|thousand)?(?:\s|$|[^a-z0-9])/i);
                                if (prevMatch) {
                                    let amount = parseFloat(prevMatch[1].replace(/,/g, ''));
                                    const sfx = prevMatch[2]?.toLowerCase();
                                    if (sfx === 'k' || sfx === 'thousand') amount *= 1000;
                                    if (sfx === 'm' || sfx === 'million') amount *= 1000000;
                                    
                                    // Find asset name from same message
                                    const nameMatch = msg.content.match(/(?:in|at|with)\s+(?:a|my|an)?\s*(\S+(?:\s+\S+)?)/i);
                                    let assetName = nameMatch ? nameMatch[1].trim() : 'Investment';
                                    assetName = assetName.replace(/[,.!?]$/, '').trim();
                                    
                                    let assetType = 'Other';
                                    const ln = assetName.toLowerCase();
                                    if (ln.includes('401k') || ln.includes('ira')) assetType = 'Pre-Tax (401k, IRA)';
                                    else if (ln.includes('roth')) assetType = 'Tax-Free (Roth)';
                                    else if (ln.includes('brokerage') || ln.includes('bitcoin') || ln.includes('crypto') || ln.includes('stock')) assetType = 'Post-Tax (Brokerage)';
                                    
                                    const categoryKey = `asset_${assetName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
                                    const fact = `${assetName}: $${amount.toLocaleString()} (${assetType})`;
                                    
                                    console.log("[myRA] FALLBACK (prev msg): Auto-saving:", categoryKey, "->", fact);
                                    saveMemory(categoryKey, fact);
                                    break; // Only save the most recent one
                                }
                            }
                        }
                    }
                }
            }

            // Combine all parsed data and update state
            let finalContent = contentAfterLearn;
            let finalBucketData = initialBucketData;
            let finalChartData = initialChartData;
            let finalTriggerBooking = initialTriggerBooking;

            // If there are learn items, we need to re-parse the contentAfterLearn for any remaining hidden tags
            // This step is redundant if parseHiddenTags is only called once on rawContent,
            // but kept for consistency with the user's intent to process `finalContent`
            // If `parseHiddenTags` is meant to be called only once on `rawContent`,
            // then `finalContent` should be `contentAfterLearn` and `finalBucketData`/`finalTriggerBooking`
            // should be `initialBucketData`/`initialTriggerBooking`.
            // Assuming the user wants to re-evaluate `finalContent` for booking triggers and bucket data
            // after learn tags have been processed.
            const { cleanContent: reParsedContent, bucketData: reParsedBucketData, chartData: reParsedChartData, triggerBooking: reParsedTriggerBooking } = parseHiddenTags(finalContent);
            finalContent = reParsedContent;
            finalBucketData = reParsedBucketData || finalBucketData; // Prefer re-parsed if present
            finalChartData = reParsedChartData || finalChartData;
            finalTriggerBooking = reParsedTriggerBooking || finalTriggerBooking; // Prefer re-parsed if present

            if (finalTriggerBooking) {
                setShowBookingPrompt(true);
            }

            if (finalChartData) {
                setActiveChart(finalChartData);
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
                    content: finalContent,
                    timestamp: new Date().toISOString()
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
        setShowBookingPrompt,
        buckets,
        activeChart,
        leadInfo,
        chatId,
        chatList,
        switchChat,
        renameChat,
        deleteChat,
        loadChatList,
        userName,
        isDeveloperMode
    };
}
