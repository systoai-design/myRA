import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-flash-latest";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

console.log("Testing Gemini API...");
console.log("Model:", MODEL);
console.log("Key present:", !!API_KEY);

async function testGemini() {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: "Hello, are you working?" }]
                }],
                generationConfig: {
                    maxOutputTokens: 50,
                }
            })
        });

        console.log("Status:", response.status);

        if (!response.ok) {
            const text = await response.text();
            console.error("Error Body:", text);
            return;
        }

        const data = await response.json();
        console.log("Response Success!");
        console.log("Output:", data.candidates?.[0]?.content?.parts?.[0]?.text);

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testGemini();
