import axios from 'axios';
import { API_BASE_URL } from 'src/config/api.config';

const adminAxios = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
adminAxios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('jwt_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Database Management API
export const adminApi = {
  // Get comprehensive database stats
  getDatabaseStats: async () => {
    const { data } = await adminAxios.get('/database/stats');
    return data;
  },

  // Get cleanup recommendations
  getCleanupRecommendations: async () => {
    const { data } = await adminAxios.get('/database/recommendations');
    return data;
  },

  // Cleanup old game moves
  cleanupOldGameMoves: async (olderThanDays: number = 10, dryRun: boolean = false) => {
    const { data } = await adminAxios.post('/database/cleanup-moves', null, {
      params: { olderThanDays, dryRun },
    });
    return data;
  },

  // Archive old games
  archiveOldGames: async (olderThanMonths: number = 6, dryRun: boolean = false) => {
    const { data } = await adminAxios.post('/database/archive-games', null, {
      params: { olderThanMonths, dryRun },
    });
    return data;
  },

  // Delete very old games
  deleteVeryOldGames: async (olderThanMonths: number = 12, dryRun: boolean = false) => {
    const { data } = await adminAxios.delete('/database/delete-old-games', {
      params: { olderThanMonths, dryRun },
    });
    return data;
  },

  // Optimize database
  optimizeDatabase: async () => {
    const { data } = await adminAxios.post('/database/optimize');
    return data;
  },

  // User Management
  getStats: async () => {
    const { data } = await adminAxios.get('/stats');
    return data;
  },

  getUsers: async (
    page: number = 1,
    limit: number = 50,
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ) => {
    const { data } = await adminAxios.get('/users', {
      params: { page, limit, search, sortBy, sortOrder },
    });
    return data;
  },

  getGames: async (
    page: number = 1,
    limit: number = 50,
    gameType?: string,
    status?: string,
    startDate?: string,
    endDate?: string
  ) => {
    const { data } = await adminAxios.get('/games', {
      params: { page, limit, gameType, status, startDate, endDate },
    });
    return data;
  },

  updateUserStatus: async (userId: string, status: string) => {
    const { data } = await adminAxios.put(`/users/${userId}/status`, { status });
    return data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const { data } = await adminAxios.put(`/users/${userId}/role`, { role });
    return data;
  },

  resetUserPassword: async (userId: string, newPassword: string) => {
    const { data } = await adminAxios.put(`/users/${userId}/password`, { newPassword });
    return data;
  },

  banUser: async (userId: string) => {
    const { data } = await adminAxios.put(`/users/${userId}/ban`);
    return data;
  },
};
