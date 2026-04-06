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
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    // Get all linked Plaid items for this user
    const { data: items, error: dbError } = await supabase
      .from('plaid_items')
      .select('*')
      .eq('user_id', user_id);

    if (dbError) {
      console.error('DB fetch error:', dbError);
      return res.status(500).json({ error: 'Failed to fetch linked accounts' });
    }

    if (!items || items.length === 0) {
      return res.status(200).json({ accounts: [], investments: [] });
    }

    const allAccounts: any[] = [];
    const allInvestments: any[] = [];

    for (const item of items) {
      try {
        // Fetch accounts
        const accountsResponse = await plaidClient.accountsGet({
          access_token: item.access_token,
        });
        
        const accounts = accountsResponse.data.accounts.map((acct: any) => ({
          ...acct,
          institution_name: item.institution_name,
          plaid_item_id: item.item_id,
        }));
        allAccounts.push(...accounts);

        // Try to fetch investment holdings (may not be available for all institutions)
        try {
          const investmentsResponse = await plaidClient.investmentsHoldingsGet({
            access_token: item.access_token,
          });
          
          const holdings = investmentsResponse.data.holdings.map((holding: any) => {
            const security = investmentsResponse.data.securities.find(
              (s: any) => s.security_id === holding.security_id
            );
            return {
              ...holding,
              security_name: security?.name || 'Unknown',
              security_ticker: security?.ticker_symbol || '',
              security_type: security?.type || '',
              institution_name: item.institution_name,
            };
          });
          allInvestments.push(...holdings);
        } catch (investError: any) {
          // Investments product may not be enabled for this item — that's OK
          if (investError?.response?.data?.error_code !== 'PRODUCTS_NOT_READY') {
            console.warn('Investments fetch skipped for', item.institution_name, investError?.response?.data?.error_code);
          }
        }
      } catch (itemError: any) {
        console.error('Error fetching from', item.institution_name, ':', itemError?.response?.data || itemError.message);
      }
    }

    return res.status(200).json({ accounts: allAccounts, investments: allInvestments });
  } catch (error: any) {
    console.error('Accounts fetch error:', error?.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to fetch accounts' });
  }
}
