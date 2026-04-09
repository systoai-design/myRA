import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || '';
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || '';

// OpenAI-compatible endpoint for Gemini
const GEMINI_CHAT_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages, model, temperature = 0.7, max_tokens = 1024 } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'messages array is required' });
        }

        // Try OpenAI first
        let response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: model || 'gpt-4o',
                messages,
                temperature,
                max_tokens,
                stream: false,
            }),
        });

        // Fallback to Gemini if OpenAI fails
        if (!response.ok && GEMINI_API_KEY) {
            const errorText = await response.text();
            console.warn(`OpenAI failed (${response.status}): ${errorText.substring(0, 200)}`);
            console.log('Falling back to Gemini...');

            response = await fetch(GEMINI_CHAT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GEMINI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'gemini-2.0-flash',
                    messages,
                    temperature,
                    max_tokens,
                    stream: false,
                }),
            });
        }

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`All LLM providers failed. Last status: ${response.status}, body: ${errorBody.substring(0, 500)}`);
            return res.status(response.status).json({
                error: {
                    message: 'All AI providers are currently unavailable. Please try again in a moment.',
                    status: response.status,
                },
            });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Chat proxy error:', error);
        return res.status(500).json({
            error: {
                message: error.message || 'Internal server error',
            },
        });
    }
}
