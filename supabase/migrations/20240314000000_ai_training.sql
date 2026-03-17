-- Add source and is_active columns to global_knowledge_base
alter table public.global_knowledge_base 
add column if not exists source text default 'ai_extraction', -- 'ai_extraction' or 'manual_training'
add column if not exists is_active boolean default true;

-- Update RLS for manual training entries
-- Only admins can insert manual training entries
create policy "Admins can insert manual training"
    on public.global_knowledge_base
    for insert
    to authenticated
    with check (
        exists (
            select 1 from public.user_roles ur
            where ur.user_id = auth.uid() and ur.role = 'admin'
        )
    );

-- Admins can update their own manual training or AI insights
-- RLS already covers update for admins in previous migration, but we ensure it works here.
