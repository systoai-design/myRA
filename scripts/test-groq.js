import fetch from 'node-fetch';

const GROQ_KEY = process.env.VITE_GROQ_API_KEY || "";

async function test() {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: 'Say hi in 5 words' }],
            max_tokens: 50
        })
    });
    console.log('Status:', r.status);
    const d = await r.json();
    console.log('Response:', d.choices?.[0]?.message?.content);
}
test();
