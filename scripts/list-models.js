import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log("Listing Gemini Models...");

async function listModels() {
    try {
        const response = await fetch(URL);
        if (!response.ok) {
            const text = await response.text();
            console.error("Error:", text);
            return;
        }

        const data = await response.json();
        console.log("Available Models:");
        data.models?.forEach(m => {
            if (m.supportedGenerationMethods?.includes("generateContent")) {
                console.log(`- ${m.name} (${m.displayName})`);
            }
        });

    } catch (error) {
        console.error("Failed:", error);
    }
}

listModels();
