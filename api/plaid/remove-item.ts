import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { createClient } from '@supabase/supabase-js';

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user_id, item_id } = req.body;
    if (!user_id || !item_id) {
      return res.status(400).json({ error: 'user_id and item_id required' });
    }

    // Find the item in Supabase
    const { data: item, error: dbFetchError } = await supabase
      .from('plaid_items')
      .select('*')
      .eq('user_id', user_id)
      .eq('item_id', item_id)
      .single();

    if (dbFetchError || !item) {
      return res.status(404).json({ error: 'Linked account not found' });
    }

    // Remove from Plaid
    try {
      await plaidClient.itemRemove({ access_token: item.access_token });
    } catch (plaidErr: any) {
      console.warn('Plaid item remove warning:', plaidErr?.response?.data);
      // Continue anyway — we still want to remove from our DB
    }

    // Delete from Supabase
    const { error: dbDeleteError } = await supabase
      .from('plaid_items')
      .delete()
      .eq('user_id', user_id)
      .eq('item_id', item_id);

    if (dbDeleteError) {
      console.error('DB delete error:', dbDeleteError);
      return res.status(500).json({ error: 'Failed to remove from database' });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Remove item error:', error?.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to remove linked account' });
  }
}
