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
  const token = sessionStorage.getItem('jwt_access_token') || localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------------------------------------------------------

export type GameSettingCategory = 'timing' | 'scoring' | 'rules' | 'bets';

export interface GameSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  category: GameSettingCategory;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateGameSettingDto {
  key: string;
  value: string;
}

// ----------------------------------------------------------------------

/**
 * Get all game settings
 */
export async function getAllGameSettings(): Promise<GameSetting[]> {
  const response = await axiosInstance.get('/settings/game');
  return response.data;
}

/**
 * Get settings by category
 */
export async function getGameSettingsByCategory(
  category: GameSettingCategory
): Promise<GameSetting[]> {
  const response = await axiosInstance.get(`/settings/game/category/${category}`);
  return response.data;
}

/**
 * Get single setting by key
 */
export async function getGameSetting(key: string): Promise<GameSetting> {
  const response = await axiosInstance.get(`/settings/game/${key}`);
  return response.data;
}

/**
 * Update single game setting
 */
export async function updateGameSetting(
  key: string,
  value: string
): Promise<GameSetting> {
  const response = await axiosInstance.patch(`/settings/game/${key}`, { value });
  return response.data;
}

/**
 * Bulk update game settings
 */
export async function updateGameSettingsBulk(
  settings: UpdateGameSettingDto[]
): Promise<GameSetting[]> {
  const response = await axiosInstance.patch('/settings/game/bulk', { settings });
  return response.data;
}

/**
 * Reset all game settings to defaults
 */
export async function resetGameSettingsToDefaults(): Promise<GameSetting[]> {
  const response = await axiosInstance.post('/settings/game/reset');
  return response.data;
}

// ----------------------------------------------------------------------

export const gameSettingsApi = {
  getAllGameSettings,
  getGameSettingsByCategory,
  getGameSetting,
  updateGameSetting,
  updateGameSettingsBulk,
  resetGameSettingsToDefaults,
};
