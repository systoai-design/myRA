-- MyRA User Memory Table
-- Run this in Supabase SQL Editor to create the user_memory table

-- First, create the update_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.user_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  fact TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint: one fact per category per user (upsert replaces old value)
-- Use a DO block to avoid error if constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_category'
    ) THEN
        ALTER TABLE public.user_memory ADD CONSTRAINT unique_user_category UNIQUE (user_id, category);
    END IF;
END $$;


-- RLS: users can only access their own memories
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users read own memory" ON public.user_memory;
DROP POLICY IF EXISTS "Users insert own memory" ON public.user_memory;
DROP POLICY IF EXISTS "Users update own memory" ON public.user_memory;
DROP POLICY IF EXISTS "Users delete own memory" ON public.user_memory;

CREATE POLICY "Users read own memory"
  ON public.user_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own memory"
  ON public.user_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own memory"
  ON public.user_memory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own memory"
  ON public.user_memory FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
DROP TRIGGER IF EXISTS update_user_memory_updated_at ON public.user_memory;
CREATE TRIGGER update_user_memory_updated_at
  BEFORE UPDATE ON public.user_memory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
