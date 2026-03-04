import { ChatMessage } from "@/hooks/useMyRAChat";

const CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

const SUMMARIZER_PROMPT = `You are a professional scribe for a financial advisory firm.
Your job is to read the attached transcript of a consultation between a user and an AI Retirement Advisor named MyRA.

Please extract the most critical information into a clean, highly professional, and perfectly formatted markdown summary. This summary will be sent directly to the user and saved in our CRM for the human advisor to review.

FORMAT REQUIREMENTS:
Use strict markdown formatting. Use bullet points for readability. Keep it concise.

Use the following exact sections:
### 1. Client Profile
[Bullet points covering Age, Retirement Status, Risk Tolerance, etc.]

### 2. Strategy Chosen
[A brief 1-2 sentence description of the path they selected (e.g., 100% Guaranteed, Blended Approach, etc.)]

### 3. Action Items
[What does the user need to do next? What does the advisor need to prepare?]

### 4. Important Context
[Any fears, hesitations, legacy goals, or specific notes the human advisor should be aware of before their follow-up meeting]

Do NOT include any pleasantries or conversational filler in your output (e.g., "Here is the summary"). Just output the raw markdown requested.`;

export async function generateSessionSummary(messages: ChatMessage[]): Promise<string> {
    if (!messages || messages.length === 0) return "No conversation history found.";

    // Filter out system tags and format the transcript
    const transcript = messages.map(m => {
        let text = m.content;
        text = text.replace(/\[\[.*?\]\]/g, ""); // Remove hidden tags like [[TRIGGER_BOOKING]]
        return `${m.role.toUpperCase()}: ${text}`;
    }).join("\n\n");

    try {
        const response = await fetch(CHAT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: SUMMARIZER_PROMPT },
                    { role: "user", content: `Please summarize this transcript:\n\n${transcript}` }
                ],
                temperature: 0.3, // Lower temperature for factual extraction
                max_tokens: 1000,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "Failed to generate summary.";

    } catch (error) {
        console.error("Failed to summarize session:", error);
        return "An error occurred while generating your session summary. Our team has a copy of your plan and will review it before your meeting.";
    }
}
