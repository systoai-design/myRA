import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ 
            success: false, 
            error: "RESEND_API_KEY not found in Supabase Secrets.",
            details: "Missing secret. Run 'supabase secrets set RESEND_API_KEY=your_key' in your terminal."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Attempting to send test email to ${email} via Resend...`)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'MyRA Support <onboarding@resend.dev>',
        to: [email],
        subject: 'MyRA SMTP Debugger Test',
        html: '<strong>Resend Connectivity Successful!</strong><p>Your Edge Function can talk to Resend Api.</p>',
      }),
    })

    const data = await res.json()

    // ALWAYS RETURN 200 so Supabase JS doesn't hide the JSON error body
    if (res.ok) {
      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
        console.error("Resend API Error:", data)
        return new Response(
            JSON.stringify({ 
                success: false, 
                error: data.message || "Resend API rejected the request", 
                details: data 
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error: any) {
    console.error("DEBUG-SMTP Panic:", error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
