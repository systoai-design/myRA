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
    const { public_token, user_id, institution_name, institution_id } = req.body;
    if (!public_token || !user_id) {
      return res.status(400).json({ error: 'public_token and user_id required' });
    }

    // Exchange public_token for permanent access_token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = exchangeResponse.data;

    // Store in Supabase
    const { error: dbError } = await supabase
      .from('plaid_items')
      .upsert({
        user_id,
        access_token,
        item_id,
        institution_name: institution_name || null,
        institution_id: institution_id || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'item_id' });

    if (dbError) {
      console.error('DB insert error:', dbError);
      return res.status(500).json({ error: 'Failed to store linked account' });
    }

    return res.status(200).json({ success: true, item_id });
  } catch (error: any) {
    console.error('Exchange token error:', error?.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to exchange token', details: error?.response?.data });
  }
}
