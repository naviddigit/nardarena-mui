import axios from 'axios';
import { API_BASE_URL } from 'src/config/api.config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  // Try sessionStorage first (jwt_access_token), then localStorage
  const sessionToken = typeof window !== 'undefined' ? sessionStorage.getItem('jwt_access_token') : null;
  const localToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const token = sessionToken || localToken;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------------------------------------------------------

export interface UserGameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalEarnings: number;
  totalLosses: number;
  netProfit: number;
  bestStreak: number;
  currentStreak: number;
  averageGameDuration: number;
  lastGameAt: string | null;
}

export interface MonthlyStats {
  month: string;
  year: number;
  gamesPlayed: number;
  wins: number;
  earnings: number;
  deposited: number;
  withdrawn: number;
}

export interface GameHistory {
  id: string;
  gameType: 'ai' | 'online' | 'tournament';
  opponent: string;
  bet: number;
  result: 'win' | 'loss' | 'draw';
  earnings: number;
  duration: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  winRate: number;
  totalEarnings: number;
  points: number;
}

// ----------------------------------------------------------------------

/**
 * Get user's overall game statistics
 */
export async function getUserGameStats(): Promise<UserGameStats> {
  const response = await axiosInstance.get('/game/stats');
  return response.data;
}

/**
 * Get monthly statistics
 */
export async function getMonthlyStats(year: number, month: number): Promise<MonthlyStats> {
  const response = await axiosInstance.get(`/game/stats/monthly/${year}/${month}`);
  return response.data;
}

/**
 * Get current month statistics
 */
export async function getCurrentMonthStats(): Promise<MonthlyStats> {
  const response = await axiosInstance.get('/game/stats/monthly/current');
  return response.data;
}

/**
 * Get game history with pagination
 */
export async function getGameHistory(params?: {
  page?: number;
  limit?: number;
  gameType?: string;
  result?: string;
}): Promise<{
  games: GameHistory[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const response = await axiosInstance.get('/game/history', { params });
  return response.data;
}

/**
 * Get leaderboard/rankings
 */
export async function getLeaderboard(
  period: 'weekly' | 'monthly' | 'all-time' = 'weekly',
  limit: number = 10
): Promise<{
  leaderboard: LeaderboardEntry[];
  total: number;
  period: string;
}> {
  const response = await axiosInstance.get('/game/leaderboard', {
    params: { period, limit },
  });
  return response.data;
}

// ----------------------------------------------------------------------

export const gameStatsApi = {
  getUserGameStats,
  getMonthlyStats,
  getCurrentMonthStats,
  getGameHistory,
  getLeaderboard,
};
