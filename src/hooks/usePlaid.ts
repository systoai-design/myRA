import { useState, useCallback, useEffect } from 'react';
import { usePlaidLink, PlaidLinkOnSuccess } from 'react-plaid-link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PlaidAccount {
  account_id: string;
  name: string;
  official_name: string | null;
  mask: string | null;
  type: string;
  subtype: string | null;
  balances: {
    available: number | null;
    current: number | null;
    iso_currency_code: string | null;
  };
  institution_name: string | null;
  plaid_item_id: string;
}

interface PlaidHolding {
  security_name: string;
  security_ticker: string;
  security_type: string;
  quantity: number;
  institution_price: number;
  cost_basis: number | null;
  institution_value: number;
  institution_name: string | null;
}

export interface UsePlaidReturn {
  linkToken: string | null;
  linkedAccounts: PlaidAccount[];
  linkedInvestments: PlaidHolding[];
  isLinking: boolean;
  isLoadingAccounts: boolean;
  openPlaidLink: () => void;
  readyToLink: boolean;
  fetchAccounts: () => Promise<void>;
  removeItem: (itemId: string, institutionName: string) => Promise<void>;
}

const API_BASE = '/api/plaid';

export function usePlaid(): UsePlaidReturn {
  const { user } = useAuth();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<PlaidAccount[]>([]);
  const [linkedInvestments, setLinkedInvestments] = useState<PlaidHolding[]>([]);
  const [isLinking, setIsLinking] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // Check if returning from OAuth redirect
  const isOAuthReturn = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).has('oauth_state_id');

  // 1. Create a link token when user becomes available, or restore for OAuth
  useEffect(() => {
    if (!user) return;

    // If returning from OAuth, restore the stored link token
    if (isOAuthReturn) {
      const storedToken = sessionStorage.getItem('plaid_link_token');
      if (storedToken) {
        setLinkToken(storedToken);
        return;
      }
    }

    let cancelled = false;
    const createLinkToken = async () => {
      try {
        const res = await fetch(`${API_BASE}/create-link-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id }),
        });
        const data = await res.json();
        if (!cancelled && data.link_token) {
          setLinkToken(data.link_token);
          // Store for OAuth return
          sessionStorage.setItem('plaid_link_token', data.link_token);
        }
      } catch (err) {
        console.error('[usePlaid] Create link token error:', err);
      }
    };
    createLinkToken();
    return () => { cancelled = true; };
  }, [user, isOAuthReturn]);

  // 2. Fetch existing linked accounts
  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    setIsLoadingAccounts(true);
    try {
      const res = await fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await res.json();
      setLinkedAccounts(data.accounts || []);
      setLinkedInvestments(data.investments || []);
    } catch (err) {
      console.error('[usePlaid] Fetch accounts error:', err);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [user]);

  // Fetch on mount
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // 3. Handle successful Plaid Link
  const onSuccess: PlaidLinkOnSuccess = useCallback(async (publicToken, metadata) => {
    if (!user) return;
    setIsLinking(true);
    try {
      const res = await fetch(`${API_BASE}/exchange-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_token: publicToken,
          user_id: user.id,
          institution_name: metadata.institution?.name || null,
          institution_id: metadata.institution?.institution_id || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Connected ${metadata.institution?.name || 'account'} successfully!`);
        await fetchAccounts();
      } else {
        toast.error('Failed to link account. Please try again.');
      }
    } catch (err) {
      console.error('[usePlaid] Exchange token error:', err);
      toast.error('Something went wrong linking your account.');
    } finally {
      setIsLinking(false);
    }
  }, [user, fetchAccounts]);

  // 4. Plaid Link hook — pass token + OAuth redirect URI if returning
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit: (err) => {
      if (err) console.warn('[usePlaid] Plaid Link exited with error:', err);
      // Clean up OAuth params from URL
      if (isOAuthReturn) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    },
    ...(isOAuthReturn ? { receivedRedirectUri: window.location.href } : {}),
  });

  // Auto-open Plaid Link when returning from OAuth
  useEffect(() => {
    if (isOAuthReturn && ready) {
      open();
    }
  }, [isOAuthReturn, ready, open]);

  // 5. Remove a linked item
  const removeItem = useCallback(async (itemId: string, institutionName: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/remove-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, item_id: itemId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Disconnected ${institutionName}`);
        await fetchAccounts();
      } else {
        toast.error('Failed to remove account.');
      }
    } catch (err) {
      console.error('[usePlaid] Remove item error:', err);
      toast.error('Failed to disconnect account.');
    }
  }, [user, fetchAccounts]);

  return {
    linkToken,
    linkedAccounts,
    linkedInvestments,
    isLinking,
    isLoadingAccounts,
    openPlaidLink: () => {
      if (ready) {
        open();
      } else {
        toast.info('Plaid is still loading. Please try again in a moment.');
      }
    },
    readyToLink: ready && !!linkToken,
    fetchAccounts,
    removeItem,
  };
}
