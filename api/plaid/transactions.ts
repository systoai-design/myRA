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
    const { user_id, start_date, end_date } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    // Default to last 30 days if no dates provided
    const now = new Date();
    const endDate = end_date || now.toISOString().split('T')[0];
    const startDate = start_date || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

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
      return res.status(200).json({ transactions: [], total_spending: 0, categories: {}, linked_accounts: 0 });
    }

    console.log(`[transactions] Found ${items.length} linked items for user, fetching ${startDate} to ${endDate}`);

    const allTransactions: any[] = [];

    for (const item of items) {
      try {
        let hasMore = true;
        let offset = 0;

        while (hasMore) {
          const txResponse = await plaidClient.transactionsGet({
            access_token: item.access_token,
            start_date: startDate,
            end_date: endDate,
            options: { count: 500, offset },
          });

          const transactions = txResponse.data.transactions.map((tx: any) => ({
            id: tx.transaction_id,
            name: tx.name,
            merchant_name: tx.merchant_name || tx.name,
            amount: tx.amount,
            date: tx.date,
            category: tx.personal_finance_category?.primary || tx.category?.[0] || 'Other',
            category_detailed: tx.personal_finance_category?.detailed || tx.category?.join(' > ') || 'Other',
            pending: tx.pending,
            institution_name: item.institution_name,
            logo_url: tx.logo_url || null,
            payment_channel: tx.payment_channel,
          }));

          allTransactions.push(...transactions);
          offset += transactions.length;
          hasMore = offset < txResponse.data.total_transactions;
        }
      } catch (itemError: any) {
        console.error('Error fetching transactions from', item.institution_name, ':', itemError?.response?.data || itemError.message);
      }
    }

    // Calculate summary stats
    // In Plaid, positive amounts = money spent, negative = income/refunds
    const spending = allTransactions.filter(tx => tx.amount > 0 && !tx.pending);
    const totalSpending = spending.reduce((sum, tx) => sum + tx.amount, 0);

    // Category breakdown
    const categories: Record<string, { total: number; count: number }> = {};
    for (const tx of spending) {
      const cat = tx.category;
      if (!categories[cat]) categories[cat] = { total: 0, count: 0 };
      categories[cat].total += tx.amount;
      categories[cat].count += 1;
    }

    // Daily spending for calendar view
    const dailySpending: Record<string, number> = {};
    for (const tx of spending) {
      dailySpending[tx.date] = (dailySpending[tx.date] || 0) + tx.amount;
    }

    console.log(`[transactions] Returning ${allTransactions.length} transactions from ${items.length} accounts`);

    return res.status(200).json({
      transactions: allTransactions,
      total_spending: Math.round(totalSpending * 100) / 100,
      categories,
      daily_spending: dailySpending,
      period: { start: startDate, end: endDate },
      linked_accounts: items.length,
    });
  } catch (error: any) {
    console.error('Transactions fetch error:', error?.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}
