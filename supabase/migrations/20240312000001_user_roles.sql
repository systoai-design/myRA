-- Create the user_role_enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('user', 'admin');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email text NOT NULL,
    role user_role_enum DEFAULT 'user'::user_role_enum NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Turn on RLS for user_roles
alter table public.user_roles enable row level security;

-- Policies for user_roles
-- Users can read their own role
create policy "Users can view their own role"
    on public.user_roles
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Helper function to check if a user is an admin without recursion issues
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from user_roles
    where user_id = auth.uid()
    and role = 'admin'
  );
end;
$$;

-- Admins can read all roles
create policy "Admins can view all roles"
    on public.user_roles
    for select
    to authenticated
    using (is_admin());

-- Admins can update roles
create policy "Admins can update roles"
    on public.user_roles
    for update
    to authenticated
    using (is_admin())
    with check (is_admin());

-- Trigger to create a user_role entry when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
    assigned_role user_role_enum;
begin
    -- Auto-assign admin to specific email
    if new.email = 'systo.ai@gmail.com' then
        assigned_role := 'admin'::user_role_enum;
    else
        assigned_role := 'user'::user_role_enum;
    end if;

    insert into public.user_roles (user_id, email, role)
    values (new.id, new.email, assigned_role);
    
    return new;
end;
$$;

-- Standard trigger binding
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();


-- Update global_knowledge_base RLS to strictly require admin role for read/update
drop policy if exists "Allow read access to authenticated users" on public.global_knowledge_base;

create policy "Admins can view global knowledge base"
    on public.global_knowledge_base
    for select
    to authenticated
    using (
        exists (
            select 1 from public.user_roles ur
            where ur.user_id = auth.uid() and ur.role = 'admin'
        )
    );

create policy "Admins can update global knowledge base"
    on public.global_knowledge_base
    for update
    to authenticated
    using (
        exists (
            select 1 from public.user_roles ur
            where ur.user_id = auth.uid() and ur.role = 'admin'
        )
    )
    with check (
        exists (
            select 1 from public.user_roles ur
            where ur.user_id = auth.uid() and ur.role = 'admin'
        )
    );
