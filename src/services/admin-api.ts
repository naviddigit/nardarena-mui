/**
 * Admin API Service
 * For admin panel data fetching
 */

import axios from 'src/utils/axios';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export interface AdminStats {
  totalUsers: number;
  totalGames: number;
  activeGames: number;
  completedGames: number;
  totalMoves: number;
  newUsersThisWeek: number;
  gamesByType: {
    AI?: number;
    ONLINE?: number;
    TOURNAMENT?: number;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED';
  createdAt: string;
  lastLoginAt: string | null;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    currentStreak: number;
  } | null;
}

export interface AdminGame {
  id: string;
  gameType: 'AI' | 'ONLINE' | 'TOURNAMENT';
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  whitePlayer: {
    id: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
  };
  blackPlayer: {
    id: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
  };
  winner: 'WHITE' | 'BLACK' | null;
  whiteSetsWon: number;
  blackSetsWon: number;
  moveCount: number;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
}

// ----------------------------------------------------------------------
// API Service
// ----------------------------------------------------------------------

class AdminAPIService {
  /**
   * Get admin dashboard statistics
   */
  async getStats(): Promise<AdminStats> {
    const response = await axios.get('/api/admin/stats');
    return response.data;
  }

  /**
   * Get paginated list of users
   */
  async getUsers(
    page = 1,
    limit = 50,
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<{
    users: AdminUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    const response = await axios.get('/api/admin/users', { params });
    return response.data;
  }

  /**
   * Get paginated list of games
   */
  async getGames(
    page = 1,
    limit = 50,
    gameType?: string,
    status?: string
  ): Promise<{
    games: AdminGame[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const params: any = { page, limit };
    if (gameType) params.gameType = gameType;
    if (status) params.status = status;

    const response = await axios.get('/api/admin/games', { params });
    return response.data;
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, status: string): Promise<AdminUser> {
    const response = await axios.put(`/api/admin/users/${userId}/status`, { status });
    return response.data;
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string): Promise<AdminUser> {
    const response = await axios.put(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  }

  /**
   * Reset user password
   */
  async resetUserPassword(userId: string, newPassword: string): Promise<{ message: string }> {
    const response = await axios.put(`/api/admin/users/${userId}/password`, { newPassword });
    return response.data;
  }
}

// Singleton instance
export const adminAPI = new AdminAPIService();
