/**
 * ⚡ Performance Utilities
 * 
 * توابع کمکی برای بهبود عملکرد
 */

/**
 * Debounce function
 * تابعی را بعد از یک مدت زمان مشخص اجرا می‌کند
 * اگر دوباره صدا زده شود، تایمر ریست می‌شود
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * تابع را حداکثر یکبار در هر مدت زمان مشخص اجرا می‌کند
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>): ReturnType<T> {
    if (!inThrottle) {
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
      lastResult = func(...args);
    }
    return lastResult;
  };
}

/**
 * Batch state updates
 * چندین state update را یکجا اجرا می‌کند
 */
export function batchUpdates<T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  updates: Partial<T>[]
): void {
  setState((prev) => {
    let result = { ...prev };
    updates.forEach((update) => {
      result = { ...result, ...update };
    });
    return result;
  });
}

/**
 * Request deduplication
 * جلوگیری از ارسال درخواست‌های تکراری همزمان
 */
const pendingRequests = new Map<string, Promise<any>>();

export async function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // اگر درخواست در حال اجراست، همان promise را برگردان
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  // درخواست جدید
  const promise = requestFn()
    .finally(() => {
      // بعد از اتمام، از map حذف کن
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Lazy load component
 * کامپوننت را به صورت lazy load می‌کند
 */
export function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const LazyComponent = React.lazy(factory);
  let preloaded: Promise<{ default: T }> | null = null;

  return {
    Component: LazyComponent,
    preload: () => {
      if (!preloaded) {
        preloaded = factory();
      }
      return preloaded;
    },
  };
}

/**
 * Memoize function result
 * نتیجه تابع را کش می‌کند
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

import React from 'react';
