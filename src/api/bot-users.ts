import { API_BASE_URL } from '../config/api.config';

export interface BotUserPreview {
  firstName: string;
  lastName: string;
  displayName: string;
  username: string;
  email: string;
  password: string;
  country: string;
  countryName: string;
  avatar: string;
}

export interface BotUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  country: string;
  status: string;
  createdAt: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
  };
}

export interface BotUsersResponse {
  botUsers: BotUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Generate a preview of a bot user
 */
export async function generateBotPreview(country?: string): Promise<BotUserPreview> {
  const token = sessionStorage.getItem('jwt_access_token') || localStorage.getItem('accessToken');
  const url = country
    ? `${API_BASE_URL}/bot-users/preview?country=${country}`
    : `${API_BASE_URL}/bot-users/preview`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to generate bot preview');
  }

  return response.json();
}

/**
 * Create a bot user from preview
 */
export async function createBotUser(preview: BotUserPreview) {
  const token = sessionStorage.getItem('jwt_access_token') || localStorage.getItem('accessToken');

  const response = await fetch(`${API_BASE_URL}/bot-users/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(preview),
  });

  if (!response.ok) {
    throw new Error('Failed to create bot user');
  }

  return response.json();
}

/**
 * Generate and create a bot user in one step
 */
export async function generateAndCreateBotUser(country?: string) {
  const token = sessionStorage.getItem('jwt_access_token') || localStorage.getItem('accessToken');
  const url = country
    ? `${API_BASE_URL}/bot-users/generate?country=${country}`
    : `${API_BASE_URL}/bot-users/generate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to generate bot user');
  }

  return response.json();
}

/**
 * Get bot users count by country
 */
export async function getBotUsersByCountry(): Promise<Record<string, number>> {
  const token = sessionStorage.getItem('jwt_access_token') || localStorage.getItem('accessToken');

  const response = await fetch(`${API_BASE_URL}/bot-users/by-country`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bot users by country');
  }

  return response.json();
}

/**
 * Get all bot users
 */
export async function getBotUsers(page = 1, limit = 25, country?: string): Promise<BotUsersResponse> {
  const token = sessionStorage.getItem('jwt_access_token') || localStorage.getItem('accessToken');
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (country) {
    params.append('country', country);
  }

  const response = await fetch(`${API_BASE_URL}/bot-users?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bot users');
  }

  return response.json();
}

/**
 * Check if bot user can be deleted
 */
export async function canDeleteBotUser(userId: string) {
  const token = sessionStorage.getItem('jwt_access_token') || localStorage.getItem('accessToken');

  const response = await fetch(`${API_BASE_URL}/bot-users/${userId}/can-delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to check bot user');
  }

  return response.json();
}

/**
 * Get bot users statistics
 */
export async function getBotUsersStats() {
  const token = sessionStorage.getItem('jwt_access_token') || localStorage.getItem('accessToken');

  const response = await fetch(`${API_BASE_URL}/bot-users/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bot stats');
  }

  return response.json();
}

/**
 * Delete a bot user
 */
export async function deleteBotUser(userId: string) {
  const token = sessionStorage.getItem('jwt_access_token') || localStorage.getItem('accessToken');

  const response = await fetch(`${API_BASE_URL}/bot-users/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete bot user');
  }

  return response.json();
}

/**
 * Bulk generate bot users
 */
export async function bulkGenerateBotUsers(count: number, country?: string) {
  const token = sessionStorage.getItem('jwt_access_token') || localStorage.getItem('accessToken');

  const response = await fetch(`${API_BASE_URL}/bot-users/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ count, country }),
  });

  if (!response.ok) {
    throw new Error('Failed to bulk generate bot users');
  }

  return response.json();
}
