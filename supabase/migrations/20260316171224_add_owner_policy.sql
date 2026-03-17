-- Add a policy for the owner to bypass is_admin recursion
create policy "Owner can view all roles"
    on public.user_roles
    for select
    to authenticated
    using (auth.jwt() ->> 'email' = 'systo.ai@gmail.com');

-- Grant all permissions to the owner as well for management
create policy "Owner can manage all roles"
    on public.user_roles
    for all
    to authenticated
    using (auth.jwt() ->> 'email' = 'systo.ai@gmail.com');
