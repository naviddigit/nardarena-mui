/**
 * ⚡ API Cache Layer
 * 
 * کش ساده برای کاهش تعداد API calls به backend
 * فقط برای درخواست‌های GET استفاده می‌شود
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class APICache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  /**
   * ذخیره داده در کش
   */
  set<T>(key: string, data: T, expiresIn: number = 5000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }
  
  /**
   * خواندن داده از کش
   * اگر منقضی شده باشد null برمی‌گرداند
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // چک کردن انقضا
    const now = Date.now();
    const age = now - entry.timestamp;
    
    if (age > entry.expiresIn) {
      // منقضی شده - حذف از کش
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * حذف یک key از کش
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * حذف همه keyهای مرتبط با یک pattern
   */
  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }
  
  /**
   * پاکسازی کل کش
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * پاکسازی داده‌های منقضی شده
   */
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    entries.forEach(([key, entry]) => {
      const age = now - entry.timestamp;
      if (age > entry.expiresIn) {
        this.cache.delete(key);
      }
    });
  }
}

// ✅ Singleton instance
export const apiCache = new APICache();

// ✅ پاکسازی خودکار هر 30 ثانیه
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 30000);
}

/**
 * Helper function برای cache کردن درخواست‌های API
 */
export async function cachedAPICall<T>(
  cacheKey: string,
  apiCall: () => Promise<T>,
  expiresIn: number = 5000
): Promise<T> {
  // ✅ چک کردن کش
  const cached = apiCache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  // ✅ درخواست به API
  const data = await apiCall();
  
  // ✅ ذخیره در کش
  apiCache.set(cacheKey, data, expiresIn);
  
  return data;
}

/**
 * تنظیمات کش برای انواع مختلف درخواست‌ها
 */
export const CACHE_CONFIG = {
  // بازی - کش کوتاه‌مدت (بازی فعال است)
  GAME: {
    TTL: 3000, // 3 seconds
  },
  
  // Can play - خیلی کوتاه
  CAN_PLAY: {
    TTL: 2000, // 2 seconds
  },
  
  // تایمر - بدون کش (همیشه fresh باشد)
  TIMER: {
    TTL: 0, // No cache
  },
  
  // User info - کش بلند‌مدت
  USER: {
    TTL: 60000, // 1 minute
  },
};
