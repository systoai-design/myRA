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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Verify Authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) throw new Error('Invalid token')

    // 2. Verify Admin Privilege (with Owner bypass)
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    const PROTECTED_ADMIN_EMAILS = [
      "systo.ai@gmail.com",
      "darren@retirementarchitects.com",
    ];
    
    const isOwner = PROTECTED_ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')
    if (!isOwner && (!roleData || roleData.role !== 'admin')) {
      throw new Error('Unauthorized: Admin access required')
    }

    // 3. Fetch all Auth Users (including invited)
    const { data: authData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError

    // 4. Fetch all user roles
    const { data: rolesData, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
    if (rolesError) throw rolesError

    // 5. Merge Data
    // We start with rolesData as the source of truth for who is in the team
    const team = rolesData.map(role => {
      const authUser = authData.users.find(u => u.id === role.user_id)
      return {
        ...role,
        last_sign_in: authUser?.last_sign_in_at,
        confirmed_at: authUser?.email_confirmed_at,
        invited_at: authUser?.invited_at,
        status: authUser?.email_confirmed_at ? 'active' : 'invited'
      }
    })

    return new Response(
      JSON.stringify({ success: true, team, version: "2.0.1" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error("get-team error:", error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
