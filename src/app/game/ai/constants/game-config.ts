/**
 * Game Configuration Constants
 * 
 * این فایل تمام تنظیمات ثابت بازی را نگهداری می‌کند.
 * برای تغییر زمان بازی، فقط این فایل را ویرایش کنید.
 */

/**
 * زمان اولیه هر بازیکن به ثانیه
 * Default: 1800 ثانیه = 30 دقیقه
 * 
 * برای تغییر زمان بازی، این عدد را تغییر دهید:
 * - 900 = 15 دقیقه
 * - 1800 = 30 دقیقه
 * - 3600 = 1 ساعت
 */
export const INITIAL_GAME_TIME = 180; // seconds

/**
 * تنظیمات دیگر بازی
 */
export const GAME_CONFIG = {
  /** زمان اولیه هر بازیکن (ثانیه) */
  initialTimeSeconds: INITIAL_GAME_TIME,
  
  /** تعداد پیش‌فرض setها */
  defaultMaxSets: 3,
  
  /** تاخیر قبل از شروع set جدید (میلی‌ثانیه) */
  setStartDelay: 500,
  
  /** مدت نمایش پیام برنده (میلی‌ثانیه) */
  winTextDuration: 4000,
} as const;
