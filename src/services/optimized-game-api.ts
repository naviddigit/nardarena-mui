/**
 * ⚡ Optimized Game API
 * 
 * Wrapper حول gamePersistenceAPI با قابلیت caching و optimization
 */

import { gamePersistenceAPI } from './game-persistence-api';
import { cachedAPICall, apiCache, CACHE_CONFIG } from 'src/utils/api-cache';
import { deduplicateRequest } from 'src/utils/performance';
import { debugLog } from 'src/config/debug.config';

/**
 * بهبود یافته getGame با caching
 */
export const optimizedGameAPI = {
  /**
   * دریافت اطلاعات بازی با cache
   */
  async getGame(gameId: string, useCache = true) {
    const cacheKey = `game:${gameId}`;
    
    if (!useCache) {
      // بدون cache - مستقیم از API
      apiCache.invalidate(cacheKey);
      return gamePersistenceAPI.getGame(gameId);
    }
    
    // با cache و request deduplication
    return deduplicateRequest(cacheKey, async () => {
      return cachedAPICall(
        cacheKey,
        () => gamePersistenceAPI.getGame(gameId),
        CACHE_CONFIG.GAME.TTL
      );
    });
  },

  /**
   * چک کردن can-play با cache کوتاه‌مدت
   */
  async canPlay(gameId: string, useCache = true) {
    const cacheKey = `can-play:${gameId}`;
    
    if (!useCache) {
      apiCache.invalidate(cacheKey);
      return gamePersistenceAPI.axios.get(`/game/${gameId}/can-play`);
    }
    
    return deduplicateRequest(cacheKey, async () => {
      return cachedAPICall(
        cacheKey,
        () => gamePersistenceAPI.axios.get(`/game/${gameId}/can-play`),
        CACHE_CONFIG.CAN_PLAY.TTL
      );
    });
  },

  /**
   * دریافت تایمر (بدون cache - همیشه fresh)
   */
  async getTimers(gameId: string) {
    const game = await gamePersistenceAPI.getGame(gameId);
    return {
      whiteTime: (game as any).whiteTimeRemaining || 0,
      blackTime: (game as any).blackTimeRemaining || 0,
      lastDoneBy: game.gameState?.lastDoneBy,
      lastDoneAt: game.gameState?.lastDoneAt,
    };
  },

  /**
   * انجام حرکت (بعد از انجام cache رو invalidate می‌کند)
   */
  async recordMove(gameId: string, moveData: any) {
    const result = await gamePersistenceAPI.recordMove(gameId, moveData);
    
    // ✅ Invalidate cache after mutation
    apiCache.invalidatePattern(`game:${gameId}`);
    apiCache.invalidatePattern(`can-play:${gameId}`);
    
    return result;
  },

  /**
   * پایان نوبت (بعد از انجام cache رو invalidate می‌کند)
   */
  async endTurn(gameId: string) {
    const result = await gamePersistenceAPI.axios.post(`/game/${gameId}/end-turn`);
    
    // ✅ Invalidate cache after mutation
    apiCache.invalidatePattern(`game:${gameId}`);
    apiCache.invalidatePattern(`can-play:${gameId}`);
    
    debugLog.backend('End turn - cache invalidated');
    
    return result;
  },

  /**
   * رول کردن تاس (مستقیم بدون cache)
   */
  rollDice(gameId: string) {
    return gamePersistenceAPI.rollDice(gameId);
  },

  /**
   * پایان بازی (مستقیم بدون cache)
   */
  endGame(gameId: string, data: any) {
    apiCache.invalidatePattern(`game:${gameId}`);
    return gamePersistenceAPI.endGame(gameId, data);
  },

  /**
   * دسترسی به axios مستقیم (برای موارد خاص)
   */
  get axios() {
    return gamePersistenceAPI.axios;
  },

  /**
   * پاکسازی کل کش بازی
   */
  clearCache(gameId?: string) {
    if (gameId) {
      apiCache.invalidatePattern(`game:${gameId}`);
      apiCache.invalidatePattern(`can-play:${gameId}`);
    } else {
      apiCache.clear();
    }
    debugLog.backend('API cache cleared');
  },
};
