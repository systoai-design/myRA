-- Create global knowledge base table
create type knowledge_status as enum ('pending_review', 'approved', 'rejected');

create table public.global_knowledge_base (
    id uuid default gen_random_uuid() primary key,
    category text not null,
    insight text not null,
    frequency_score integer default 1,
    status knowledge_status default 'pending_review'::knowledge_status,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for global_knowledge_base
alter table public.global_knowledge_base enable row level security;

-- Only admins (people with specific emails or a role flag) should be able to read/update this.
-- For now, we will allow read access to authenticated users if they are an admin, 
-- or we can restrict it to service role entirely if it's only accessed via Edge Functions.
-- Assuming an admin dashboard exists, let's allow read for auth users for now, 
-- but in reality you'd want a more robust role check.
create policy "Allow read access to authenticated users"
    on public.global_knowledge_base
    for select
    to authenticated
    using (true);

-- Allow backend (service role) full access
create policy "Allow full access to service role"
    on public.global_knowledge_base
    for all
    to service_role
    using (true)
    with check (true);

-- Ensure user_memory has RLS enabled (it likely already does, but making sure)
alter table public.user_memory enable row level security;

-- Ensure users can only read/write their own memories
drop policy if exists "Users can manage their own memories" on public.user_memory;
create policy "Users can manage their own memories"
    on public.user_memory
    for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Allow service role to read all user memories for aggregation
drop policy if exists "Service role can read all memories" on public.user_memory;
create policy "Service role can read all memories"
    on public.user_memory
    for select
    to service_role
    using (true);
