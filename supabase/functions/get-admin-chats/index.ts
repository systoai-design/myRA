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
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. Verify Administrative Access
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('No Authorization header');
        
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) throw new Error('Not authenticated');

        // Check if user is an admin in user_roles table
        const { data: roleData } = await supabaseClient
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        const PROTECTED_ADMIN_EMAILS = [
            "systo.ai@gmail.com",
            "darren@retirementarchitects.com",
        ];

        const isProtected = PROTECTED_ADMIN_EMAILS.includes(user.email?.toLowerCase() || "");
        const isAdmin = roleData?.role === 'admin' || isProtected;

        if (!isAdmin) {
            throw new Error('Access denied: Admins only');
        }

        // 2. Fetch All Chats
        const { data: chats, error: chatsError } = await supabaseClient
            .from('chats')
            .select(`
                id,
                user_id,
                title,
                messages,
                created_at,
                updated_at
            `)
            .order('updated_at', { ascending: false });

        if (chatsError) throw chatsError;

        // 3. Enrich with User Emails
        // We fetch from user_roles as it usually contains the email mapping in this project
        const { data: roles } = await supabaseClient
            .from('user_roles')
            .select('user_id, email');

        const emailMap: Record<string, string> = {};
        roles?.forEach(r => {
            if (r.user_id) emailMap[r.user_id] = r.email;
        });

        const enrichedChats = (chats || []).map(chat => ({
            ...chat,
            user_email: emailMap[chat.user_id] || 'Unknown User'
        }));

        return new Response(JSON.stringify({ success: true, chats: enrichedChats }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
