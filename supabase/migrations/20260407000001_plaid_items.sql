-- Plaid linked accounts storage
CREATE TABLE IF NOT EXISTS plaid_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  item_id TEXT NOT NULL UNIQUE,
  institution_name TEXT,
  institution_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: users can only see their own linked accounts
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own plaid items"
  ON plaid_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON plaid_items(user_id);
