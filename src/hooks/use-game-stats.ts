import { useState, useEffect, useCallback } from 'react';

import type { UserGameStats, MonthlyStats, GameHistory } from 'src/api/game-stats';
import { gameStatsApi } from 'src/api/game-stats';

// ----------------------------------------------------------------------

/**
 * Hook to fetch user's overall game statistics
 */
export function useGameStats() {
  const [stats, setStats] = useState<UserGameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gameStatsApi.getUserGameStats();
      setStats(data);
    } catch (err: any) {
      // Silently handle 404/401 errors (endpoints not implemented yet)
      if (err?.response?.status === 404 || err?.response?.status === 401) {
        // Return mock data instead of error
        setStats({
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
          totalEarnings: 0,
          totalLosses: 0,
          netProfit: 0,
          bestStreak: 0,
          currentStreak: 0,
          averageGameDuration: 0,
          lastGameAt: null,
        });
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch game stats');
        console.error('Failed to fetch game stats:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

// ----------------------------------------------------------------------

/**
 * Hook to fetch monthly statistics
 */
export function useMonthlyStats(year?: number, month?: number) {
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data =
        year && month
          ? await gameStatsApi.getMonthlyStats(year, month)
          : await gameStatsApi.getCurrentMonthStats();
      
      setStats(data);
    } catch (err: any) {
      // Silently handle 404/401 errors (endpoints not implemented yet)
      if (err?.response?.status === 404 || err?.response?.status === 401) {
        // Return mock data instead of error
        const now = new Date();
        setStats({
          month: now.toLocaleString('default', { month: 'long' }),
          year: now.getFullYear(),
          gamesPlayed: 0,
          wins: 0,
          earnings: 0,
          deposited: 0,
          withdrawn: 0,
        });
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch monthly stats');
        console.error('Failed to fetch monthly stats:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

// ----------------------------------------------------------------------

/**
 * Hook to fetch game history with pagination
 */
export function useGameHistory(params?: {
  page?: number;
  limit?: number;
  gameType?: string;
  result?: string;
}) {
  const [games, setGames] = useState<GameHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params?.page || 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gameStatsApi.getGameHistory({ ...params, page });
      setGames(data.games);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch game history');
      console.error('Failed to fetch game history:', err);
    } finally {
      setLoading(false);
    }
  }, [page, params]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    games,
    total,
    page,
    setPage,
    loading,
    error,
    refetch: fetchHistory,
  };
}
