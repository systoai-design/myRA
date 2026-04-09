import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from "vite";

// Custom plugin to proxy /api/chat to OpenAI during development
function chatProxyPlugin(): Plugin {
  let openaiKey = '';
  let geminiKey = '';

  return {
    name: 'chat-proxy',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '');
      openaiKey = env.VITE_OPENAI_API_KEY || '';
      geminiKey = env.VITE_GEMINI_API_KEY || '';
      
      console.log('[chat-proxy] OpenAI key:', openaiKey ? `${openaiKey.substring(0, 15)}...` : 'MISSING');
      
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
          });
          res.end();
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body);
            
            // ── AGGRESSIVE TOKEN MANAGEMENT ──
            // The OpenAI org has a 30k TPM limit.
            // System prompt is ~16k chars (~4k tokens).
            // We cap total payload at 25k chars to stay safe.
            const MAX_TOTAL_CHARS = 25000;
            
            let allMessages = payload.messages || [];
            const systemMsg = allMessages[0]?.role === 'system' ? allMessages[0] : null;
            let convMsgs = allMessages.filter((m: any) => m.role !== 'system');
            
            let totalChars = (systemMsg?.content?.length || 0) +
              convMsgs.reduce((s: number, m: any) => s + (m.content?.length || 0), 0);
            
            // Drop oldest messages until we're under the limit
            while (totalChars > MAX_TOTAL_CHARS && convMsgs.length > 2) {
              const removed = convMsgs.shift();
              totalChars -= (removed?.content?.length || 0);
            }
            
            const messages = systemMsg ? [systemMsg, ...convMsgs] : convMsgs;
            
            console.log('[chat-proxy] Payload:', {
              originalMsgs: allMessages.length,
              finalMsgs: messages.length,
              totalChars,
              estTokens: Math.round(totalChars / 4),
            });

            // ── TRY GPT-4O-MINI FIRST (200k TPM limit vs 30k for gpt-4o) ──
            let response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`,
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages,
                temperature: payload.temperature || 0.7,
                max_tokens: payload.max_tokens || 1024,
                stream: false,
              }),
            });

            // ── FALLBACK 1: GPT-4O ──
            if (!response.ok) {
              const miniErr = await response.text();
              console.warn(`[chat-proxy] gpt-4o-mini failed (${response.status}): ${miniErr.substring(0, 200)}`);
              
              response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${openaiKey}`,
                },
                body: JSON.stringify({
                  model: 'gpt-4o',
                  messages,
                  temperature: payload.temperature || 0.7,
                  max_tokens: payload.max_tokens || 1024,
                  stream: false,
                }),
              });
            }

            // ── FALLBACK 2: GEMINI ──
            if (!response.ok && geminiKey) {
              const gptErr = await response.text();
              console.warn(`[chat-proxy] gpt-4o failed (${response.status}): ${gptErr.substring(0, 200)}`);
              
              response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${geminiKey}`,
                },
                body: JSON.stringify({
                  model: 'gemini-2.0-flash',
                  messages,
                  temperature: payload.temperature || 0.7,
                  max_tokens: payload.max_tokens || 1024,
                  stream: false,
                }),
              });
            }

            const data = await response.text();
            console.log(`[chat-proxy] Final response status: ${response.status}`);
            res.writeHead(response.status, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(data);
          } catch (err: any) {
            console.error('[chat-proxy] Error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: { message: err.message } }));
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), chatProxyPlugin()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
