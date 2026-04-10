import { useState, useEffect } from 'react';
import { getBalance } from '../lib/stellar';

export function useStellarAccount(publicKey: string | null) {
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;

    const fetchBalance = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBalance(publicKey);
        setBalances(data);
      } catch (err) {
        setError('Failed to fetch account data');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [publicKey]);

  return { balances, loading, error };
}
