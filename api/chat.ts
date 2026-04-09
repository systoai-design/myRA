import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || '';
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        let { messages, temperature = 0.7, max_tokens = 1024 } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'messages array is required' });
        }

        // ── AGGRESSIVE TOKEN MANAGEMENT ──
        const MAX_TOTAL_CHARS = 25000;
        const systemMsg = messages[0]?.role === 'system' ? messages[0] : null;
        let convMsgs = messages.filter((m: any) => m.role !== 'system');
        let totalChars = (systemMsg?.content?.length || 0) +
            convMsgs.reduce((s: number, m: any) => s + (m.content?.length || 0), 0);
        
        while (totalChars > MAX_TOTAL_CHARS && convMsgs.length > 2) {
            const removed = convMsgs.shift();
            totalChars -= (removed?.content?.length || 0);
        }
        
        messages = systemMsg ? [systemMsg, ...convMsgs] : convMsgs;
        console.log(`Chat proxy: ${messages.length} msgs, ~${Math.round(totalChars / 4)} tokens`);

        // ── TRY GPT-4O-MINI FIRST (higher TPM limit) ──
        let response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
            body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature, max_tokens, stream: false }),
        });

        // ── FALLBACK 1: GPT-4O ──
        if (!response.ok) {
            console.warn(`gpt-4o-mini failed (${response.status})`);
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
                body: JSON.stringify({ model: 'gpt-4o', messages, temperature, max_tokens, stream: false }),
            });
        }

        // ── FALLBACK 2: GEMINI ──
        if (!response.ok && GEMINI_API_KEY) {
            console.warn(`gpt-4o failed (${response.status}), trying Gemini...`);
            response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GEMINI_API_KEY}` },
                body: JSON.stringify({ model: 'gemini-2.0-flash', messages, temperature, max_tokens, stream: false }),
            });
        }

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`All providers failed: ${response.status} ${errorBody.substring(0, 300)}`);
            return res.status(502).json({ error: { message: 'All AI providers are currently unavailable.' } });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Chat proxy error:', error);
        return res.status(500).json({ error: { message: error.message || 'Internal server error' } });
    }
}
