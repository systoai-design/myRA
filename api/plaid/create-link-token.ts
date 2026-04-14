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

    console.log('[create-link-token] Creating for user:', user_id);
    console.log('[create-link-token] PLAID_ENV:', process.env.PLAID_ENV || 'sandbox');
    console.log('[create-link-token] PLAID_REDIRECT_URI:', process.env.PLAID_REDIRECT_URI || '(not set)');
    console.log('[create-link-token] CLIENT_ID present:', !!process.env.PLAID_CLIENT_ID);
    console.log('[create-link-token] SECRET present:', !!process.env.PLAID_SECRET);

    // Build link token config — keep it simple and compatible
    const linkConfig: any = {
      user: { client_user_id: user_id },
      client_name: 'MyRA Retirement Advisor',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    };

    // Add investments as optional if supported
    try {
      linkConfig.optional_products = [Products.Investments];
    } catch {
      // Investments enum might not exist in this SDK version
      console.warn('[create-link-token] Products.Investments not available, skipping optional_products');
    }

    // Only include redirect_uri if configured
    const redirectUri = process.env.PLAID_REDIRECT_URI;
    if (redirectUri) {
      linkConfig.redirect_uri = redirectUri;
    }

    console.log('[create-link-token] Config:', JSON.stringify({ ...linkConfig, user: '(redacted)' }));

    const response = await plaidClient.linkTokenCreate(linkConfig);

    console.log('[create-link-token] Success! Token generated.');
    return res.status(200).json({ link_token: response.data.link_token });
  } catch (error: any) {
    const plaidError = error?.response?.data;
    console.error('[create-link-token] ERROR:', JSON.stringify(plaidError || error.message, null, 2));
    return res.status(500).json({ 
      error: 'Failed to create link token', 
      details: plaidError,
      message: error.message,
    });
  }
}
