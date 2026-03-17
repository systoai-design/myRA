import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkUsers() {
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
  
  if (rolesError) {
    console.error('Error fetching roles:', rolesError)
    return
  }

  console.log('--- USER ROLES TABLE ---')
  console.table(roles)

  const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
  
  if (usersError) {
    console.error('Error fetching auth users:', usersError)
    return
  }

  console.log('--- AUTH USERS ---')
  console.table(users.users.map(u => ({ id: u.id, email: u.email, confirmed: !!u.email_confirmed_at })))
}

checkUsers()
