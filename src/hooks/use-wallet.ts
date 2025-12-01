import { useState, useEffect, useCallback } from 'react';

import type { WalletData, DepositData, WithdrawalData } from 'src/api/wallet';
import * as walletApi from 'src/api/wallet';

// ----------------------------------------------------------------------

export function useWallet(network?: 'TRC20' | 'BSC') {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    if (!network) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await walletApi.getWallet(network);
      setWallet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet');
      console.error('Error fetching wallet:', err);
    } finally {
      setLoading(false);
    }
  }, [network]);

  const checkBalance = useCallback(async () => {
    if (!network) return;
    
    setChecking(true);
    try {
      const data = await walletApi.checkBalance(network);
      setWallet(data);
    } catch (err) {
      console.error('Error checking balance:', err);
    } finally {
      setChecking(false);
    }
  }, [network]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return {
    wallet,
    loading,
    checking,
    error,
    refetch: fetchWallet,
    checkBalance,
  };
}

// ----------------------------------------------------------------------

export function useAllWallets() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await walletApi.getAllWallets();
      setWallets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallets');
      console.error('Error fetching wallets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate total balance
  const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return {
    wallets,
    totalBalance,
    loading,
    error,
    refetch: fetchWallets,
  };
}

// ----------------------------------------------------------------------

export function useTransactions() {
  const [deposits, setDeposits] = useState<DepositData[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [depositsRes, withdrawalsRes] = await Promise.all([
        walletApi.getUserDeposits({ page, limit: 10 }),
        walletApi.getUserWithdrawals({ page, limit: 10 }),
      ]);

      setDeposits(depositsRes?.data || []);
      setWithdrawals(withdrawalsRes?.data || []);
      setTotal((depositsRes?.total || 0) + (withdrawalsRes?.total || 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
      // Set empty arrays on error
      setDeposits([]);
      setWithdrawals([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Combine and sort transactions by date
  const allTransactions = [
    ...deposits.map((d) => ({ ...d, type: 'deposit' as const })),
    ...withdrawals.map((w) => ({ ...w, type: 'withdraw' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    deposits,
    withdrawals,
    allTransactions,
    loading,
    error,
    page,
    total,
    setPage,
    refetch: fetchTransactions,
  };
}

// ----------------------------------------------------------------------

export function useWithdraw() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withdraw = useCallback(
    async (data: { network: 'TRC20' | 'BSC'; toAddress: string; amount: number }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await walletApi.requestWithdrawal(data);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to process withdrawal';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    withdraw,
    loading,
    error,
  };
}
