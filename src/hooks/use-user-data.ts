import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';

import type { UserBalance, UserStats, UserProfile } from 'src/api/user';

// ----------------------------------------------------------------------

// Temporary mock fetcher until backend API is ready
const mockBalanceFetcher = async (): Promise<UserBalance> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return {
    mainBalance: 1250.0,
    giftPoolBalance: 45.0,
    totalBalance: 1295.0,
    currency: 'USDT',
  };
};

// Hook for user balance
export function useUserBalance(config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<UserBalance>(
    '/users/me/balance',
    mockBalanceFetcher, // Using mock for now
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
      ...config,
    }
  );

  return {
    balance: data,
    isLoading,
    error,
    mutate, // Use to manually refresh
  };
}

// Mock stats fetcher
const mockStatsFetcher = async (): Promise<UserStats> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    totalProfit: 0,
    currentStreak: 0,
    bestStreak: 0,
  };
};

// Hook for user stats
export function useUserStats(config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<UserStats>(
    '/users/me/stats',
    mockStatsFetcher, // Using mock for now
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      ...config,
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    mutate,
  };
}

// Mock profile fetcher
const mockProfileFetcher = async (): Promise<UserProfile> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return {
    id: 'mock-user-id',
    username: 'Player',
    email: 'player@example.com',
    displayName: null,
    avatar: null,
    role: 'USER',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Hook for user profile
export function useUserProfile(config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<UserProfile>(
    '/users/me',
    mockProfileFetcher, // Using mock for now
    {
      revalidateOnFocus: true,
      ...config,
    }
  );

  return {
    profile: data,
    isLoading,
    error,
    mutate,
  };
}
