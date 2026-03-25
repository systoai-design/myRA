import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { userId } = await req.json();

        // 1. Create Supabase client with admin privileges so we can read user_memory and auth tables reliably
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Verify request comes from logged in user (security check)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('No Authorization header');
        
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));

        if (authError || !user) {
            throw new Error('Not authenticated');
        }

        // 2. Fetch User Memories
        const { data: memories } = await supabaseClient
            .from('user_memory')
            .select('category, fact')
            .eq('user_id', userId);

        const memoryMap: Record<string, string> = {};
        if (memories) {
            memories.forEach(m => (memoryMap[m.category] = m.fact));
        }

        const name = memoryMap['legal_name'] || "";
        const [firstName, ...lastNames] = name.split(" ");
        const lastName = lastNames.join(" ");
        const email = user.email || memoryMap['email'] || "";
        const phone = memoryMap['phone'] || "";
        const state = memoryMap['state'] || "";
        
        // Prepare info for a Note (since we don't have exact GHL Custom Field IDs yet)
        const dob = memoryMap['date_of_birth'] || 'Unknown';
        const taxStatus = memoryMap['marital_status'] || 'Unknown';
        const spouseAge = memoryMap['spouse_age'] || 'N/A';
        const retirementDate = memoryMap['retirement_date'] || 'Unknown';
        
        const contactNote = `[Initial Calibration Profile]\nDOB: ${dob}\nTax Status: ${taxStatus}\nSpouse Age: ${spouseAge}\nTarget Retirement: ${retirementDate}`;

        const ghlApiKey = Deno.env.get('VITE_GHL_API_KEY');
        const locationId = Deno.env.get('VITE_GHL_LOCATION_ID');

        if (!ghlApiKey || !locationId) {
            console.warn("GHL API Key or Location ID not found in ENV. Skipping sync.");
            return new Response(JSON.stringify({ message: 'Skipped - Missing GHL Env' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 3. Upsert Contact in GHL (LeadConnector v2 format)
        const ghlPayload = {
            locationId: locationId,
            email: email,
            phone: phone,
            firstName: firstName,
            lastName: lastName,
            state: state,
            tags: ["MyRA Lead", "Initial Calibration Form"]
        };

        const ghlRes = await fetch("https://services.leadconnectorhq.com/contacts/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${ghlApiKey}`,
                "Version": "2021-07-28",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(ghlPayload)
        });

        const ghlData = await ghlRes.json();

        // 4. Add Note to Contact if successful
        if (ghlData.contact?.id) {
            await fetch(`https://services.leadconnectorhq.com/contacts/${ghlData.contact.id}/notes`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${ghlApiKey}`,
                    "Version": "2021-07-28",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    body: contactNote
                })
            });
        }

        return new Response(JSON.stringify({ success: true, contact: ghlData }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
