import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

async function diagnostic() {
  console.log("Checking user_roles table...")
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
  
  if (rolesError) {
    console.error("Error fetching roles:", rolesError)
  } else {
    console.log(`Found ${roles?.length} roles.`)
    roles?.forEach(r => console.log(`- ${r.email}: ${r.role}`))
  }

  console.log("\nChecking auth users...")
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
  
  if (usersError) {
    console.error("Error listing users:", usersError)
  } else {
    console.log(`Found ${users?.users.length} auth users.`)
    users?.users.forEach(u => console.log(`- ${u.email}: Confirmed=${!!u.email_confirmed_at}, Invited=${!!u.invited_at}`))
  }
}

diagnostic()
