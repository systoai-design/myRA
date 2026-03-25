// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Manually fetch and verify the user from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) throw new Error("Unauthorized: Invalid session");

    const PROTECTED_ADMIN_EMAILS = [
      "systo.ai@gmail.com",
      "darren@retirementarchitects.com",
    ];

    const isOwner = PROTECTED_ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');

    // Ensure the calling user is actually an admin
    const { data: currentRoleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!isOwner && (!currentRoleData || currentRoleData.role !== 'admin')) {
      throw new Error("Forbidden: Only admins can promote users");
    }

    const { email } = await req.json()
    if (!email) throw new Error("Email required")

    // 1. Check if user exists in auth 
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    if (usersError) throw usersError

    let targetUser = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    const VERSION = "1.2.0"; // Version for debugging
    let action_link = null;
    let method_used = "none";

    // 2. Handle Invitation or Role Update
    if (!targetUser) {
      console.log('User missing, inviting via SMTP...');
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
      
      if (inviteError) {
        console.warn('Invite email failed, generating manual link:', inviteError.message);
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'invite',
          email: email,
        });
        if (linkError) throw new Error(`Could not invite or generate link: ${linkError.message}`);
        targetUser = linkData.user;
        action_link = linkData.properties.action_link;
        method_used = "manual_link_invite";
      } else {
        targetUser = inviteData.user;
        method_used = "smtp_invite";
      }
    } else {
      console.log('User exists, updating role and notifying...');
      // If user exists and SMTP is fixed, we can try to send a magic link or just notify success
      // To bypass SMTP issues for the user, we still generate a fallback link
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
      });
      if (!linkError && linkData) {
        action_link = linkData.properties.action_link;
      }
      method_used = "existing_user_promotion";
    }

    if (!targetUser) throw new Error("Could not find or create target user");

    // 3. Upsert into user_roles (with a minor delay to let Auth triggers finish)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: targetUser.id,
        email: targetUser.email || email,
        role: 'admin'
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (roleError) throw new Error(`Failed to assign admin role: ${roleError.message}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: action_link ? `Admin promoted! A manual link was also generated.` : `User ${email} is now an admin! (Sent via SMTP)`, 
        user: roleData,
        action_link,
        method_used,
        version: VERSION
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message || String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/add-admin' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"email":"test@example.com"}'

*/
