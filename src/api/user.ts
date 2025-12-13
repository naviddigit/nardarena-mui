import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('jwt_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------------------------------------------------

export interface UserBalance {
  mainBalance: number; // USDT in main wallet
  giftPoolBalance: number; // USDT in gift pool
  totalBalance: number; // Sum of both
  currency: 'USDT';
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalProfit: number;
  currentStreak: number;
  bestStreak: number;
}

// ----------------------------------------------------------------------

// Get user balance (main wallet + gift pool)
export async function getUserBalance(): Promise<UserBalance> {
  const response = await axiosInstance.get('/users/me/balance');
  return response.data;
}

// Get user profile
export async function getUserProfile(): Promise<UserProfile> {
  const response = await axiosInstance.get('/users/me');
  return response.data;
}

// Get user stats (games, wins, losses, etc.)
export async function getUserStats(): Promise<UserStats> {
  const response = await axiosInstance.get('/users/me/stats');
  return response.data;
}

// Update user profile
export async function updateUserProfile(data: {
  displayName?: string;
  avatar?: string;
}): Promise<UserProfile> {
  const response = await axiosInstance.patch('/users/me', data);
  return response.data;
}

// Upload avatar
export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await axiosInstance.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

export default {
  getUserBalance,
  getUserProfile,
  getUserStats,
  updateUserProfile,
  uploadAvatar,
};
