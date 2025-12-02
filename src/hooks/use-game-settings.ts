import { useState, useEffect, useCallback } from 'react';

import type { GameSetting, GameSettingCategory } from 'src/api/game-settings';
import { gamePersistenceAPI } from 'src/services/game-persistence-api';

// ----------------------------------------------------------------------

/**
 * Hook to fetch and manage all game settings
 */
export function useGameSettings() {
  const [settings, setSettings] = useState<GameSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gamePersistenceAPI.getAllGameSettings();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch game settings');
      console.error('Failed to fetch game settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };
}

// ----------------------------------------------------------------------

/**
 * Hook to fetch game settings by category
 */
export function useGameSettingsByCategory(category: GameSettingCategory) {
  const [settings, setSettings] = useState<GameSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gamePersistenceAPI.getGameSettingsByCategory(category);
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category settings');
      console.error('Failed to fetch category settings:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };
}

// ----------------------------------------------------------------------

/**
 * Hook to update game settings
 */
export function useUpdateGameSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSetting = useCallback(async (key: string, value: string) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await gamePersistenceAPI.updateGameSetting(key, value);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update setting';
      setError(message);
      console.error('Failed to update setting:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBulk = useCallback(
    async (updates: Array<{ key: string; value: string }>) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await gamePersistenceAPI.updateGameSettingsBulk(updates);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update settings';
        setError(message);
        console.error('Failed to update settings:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const resetToDefaults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // This endpoint doesn't exist yet in backend, so we'll just return empty array
      console.warn('Reset to defaults not implemented in backend yet');
      return [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset settings';
      setError(message);
      console.error('Failed to reset settings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateSetting,
    updateBulk,
    resetToDefaults,
    loading,
    error,
  };
}
