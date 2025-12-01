import axios from 'axios';

// ----------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
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

// ----------------------------------------------------------------------

export const gameStatsApi = {
  getUserGameStats,
  getMonthlyStats,
  getCurrentMonthStats,
  getGameHistory,
};
