-- ============================================
-- MyRA Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Chats table: stores entire conversation threads
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation',
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);

-- 3. Row Level Security (RLS) - users can only see their own chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own chats
CREATE POLICY "Users can read own chats"
    ON public.chats FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own chats
CREATE POLICY "Users can insert own chats"
    ON public.chats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own chats
CREATE POLICY "Users can update own chats"
    ON public.chats FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete their own chats
CREATE POLICY "Users can delete own chats"
    ON public.chats FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_chat_updated
    BEFORE UPDATE ON public.chats
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
