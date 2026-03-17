import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch recent user memories (e.g., from the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: memories, error: fetchError } = await supabaseClient
      .from('user_memory')
      .select('category, fact')
      .gte('updated_at', sevenDaysAgo.toISOString());

    if (fetchError) throw fetchError;
    if (!memories || memories.length === 0) {
      return new Response(JSON.stringify({ message: "No new memories to aggregate" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 2. Format data for the LLM (strip any PII intentionally)
    // Here we just map categories and facts as a raw text block
    const rawData = memories.map(m => `[${m.category}] ${m.fact}`).join('\n');

    // 3. Call Groq API (or OpenAI) to aggregate
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') || '';
    
    if (!GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY environment variable");
    }

    const systemPrompt = `You are a data analyst for a retirement advisory AI. 
Analyze the following list of raw facts extracted from user conversations over the past week.
Identify 3-5 high-level, recurring structural insights, common objections, or frequent user trends.

IMPORTANT RULES:
- NEVER include names, emails, phone numbers, or specific dollar amounts. Address the insights generally (e.g. "Many users are concerned about healthcare costs" instead of "John is worried about his $10k healthcare bill").
- Format your response strictly as a JSON array of objects.
- Each object must have three keys: 
  - "category" (a short string like "insight", "trend", "objection")
  - "insight" (a 1-2 sentence description of the finding)
  - "frequency_score" (an estimated integer from 1-100 indicating how prevalent this seems based on the data volume)

Output exactly valid JSON and nothing else.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here is the raw data:\n\n${rawData}` }
            ],
            temperature: 0.3,
            max_tokens: 1024,
            response_format: { type: "json_object" } // Tell Groq to expect JSON
        })
    });

    if (!response.ok) {
        throw new Error(`LLM API error: ${response.statusText}`);
    }

    const llmData = await response.json();
    let insights = [];
    
    // Attempt to parse the JSON array from the LLM
    try {
        const parsedContent = JSON.parse(llmData.choices[0].message.content);
        // Sometimes the LLM wraps the array in an object like { "insights": [...] }
        insights = Array.isArray(parsedContent) ? parsedContent : (parsedContent.insights || []);
    } catch (e) {
        console.error("Failed to parse LLM response:", llmData.choices[0].message.content);
        throw new Error("Failed to parse insights JSON from LLM");
    }

    if (insights.length === 0) {
        return new Response(JSON.stringify({ message: "No insights generated" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    // 4. Save Insights to the global_knowledge_base table
    const dbInserts = insights.map((item: any) => ({
        category: item.category || 'general',
        insight: item.insight,
        frequency_score: item.frequency_score || 1,
        status: 'pending_review' // Always default to pending for admin
    }));

    const { error: insertError } = await supabaseClient
        .from('global_knowledge_base')
        .insert(dbInserts);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ 
        message: `Successfully aggregated and saved ${insights.length} insights.`,
        insights 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
