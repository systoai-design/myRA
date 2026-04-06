import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: user_id },
      client_name: 'MyRA Retirement Advisor',
      products: [Products.Auth, Products.Transactions, Products.Investments],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return res.status(200).json({ link_token: response.data.link_token });
  } catch (error: any) {
    console.error('Create link token error:', error?.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to create link token', details: error?.response?.data });
  }
}
