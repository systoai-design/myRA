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
    configResolved(config) {
      // Keys are loaded from env
    },
    configureServer(server) {
      // Load keys from env
      const env = loadEnv('development', process.cwd(), '');
      openaiKey = env.VITE_OPENAI_API_KEY || '';
      geminiKey = env.VITE_GEMINI_API_KEY || '';
      
      console.log('[chat-proxy] OpenAI key:', openaiKey ? `${openaiKey.substring(0, 15)}...` : 'MISSING');
      
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' });
          res.end();
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body);
            console.log('[chat-proxy] Forwarding to OpenAI...', { model: payload.model, messages: payload.messages?.length });

            // Try OpenAI
            let response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`,
              },
              body: JSON.stringify({
                model: payload.model || 'gpt-4o',
                messages: payload.messages,
                temperature: payload.temperature || 0.7,
                max_tokens: payload.max_tokens || 1024,
                stream: false,
              }),
            });

            // Fallback to Gemini
            if (!response.ok && geminiKey) {
              const errText = await response.text();
              console.warn(`[chat-proxy] OpenAI failed (${response.status}): ${errText.substring(0, 200)}`);
              console.log('[chat-proxy] Falling back to Gemini...');
              response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${geminiKey}`,
                },
                body: JSON.stringify({
                  model: 'gemini-2.0-flash',
                  messages: payload.messages,
                  temperature: payload.temperature || 0.7,
                  max_tokens: payload.max_tokens || 1024,
                  stream: false,
                }),
              });
            }

            const data = await response.text();
            console.log(`[chat-proxy] Response status: ${response.status}`);
            res.writeHead(response.status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
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
