import { useState, useEffect, useCallback } from 'react';

import type { BoardTheme } from 'src/_mock/_board-themes';
import { getActiveTheme, BOARD_THEMES } from 'src/_mock/_board-themes';
import { 
  fetchActiveTheme, 
  fetchBoardThemes, 
  setActiveBoardTheme,
  checkThemeAccess,
  purchasePremiumTheme 
} from 'src/api/board-themes';

// ----------------------------------------------------------------------

type UseBoardThemeReturn = {
  currentTheme: BoardTheme;
  allThemes: BoardTheme[];
  freeThemes: BoardTheme[];
  premiumThemes: BoardTheme[];
  loading: boolean;
  error: string | null;
  changeTheme: (themeId: string) => Promise<void>;
  purchaseTheme: (themeId: string) => Promise<boolean>;
  hasAccessToTheme: (themeId: string) => Promise<boolean>;
  refreshThemes: () => Promise<void>;
};

/**
 * Hook برای مدیریت تم‌های تخته
 * 
 * @param useApi - آیا از API بک‌اند استفاده شود یا Mock Data؟
 * @returns تم فعلی و توابع مدیریت تم
 * 
 * @example
 * ```tsx
 * const { currentTheme, changeTheme } = useBoardTheme(true);
 * 
 * // استفاده از رنگ‌های تم
 * <Box sx={{ bgcolor: currentTheme.colors.background }}>
 * 
 * // تغییر تم
 * await changeTheme('ocean-blue');
 * ```
 */
export function useBoardTheme(useApi: boolean = false): UseBoardThemeReturn {
  const [currentTheme, setCurrentTheme] = useState<BoardTheme>(getActiveTheme());
  const [allThemes, setAllThemes] = useState<BoardTheme[]>(BOARD_THEMES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // دریافت تم‌ها از API یا Mock
  const loadThemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (useApi) {
        // دریافت از بک‌اند
        const [themes, activeTheme] = await Promise.all([
          fetchBoardThemes(),
          fetchActiveTheme(),
        ]);
        
        setAllThemes(themes);
        setCurrentTheme(activeTheme);
      } else {
        // استفاده از Mock Data
        setAllThemes(BOARD_THEMES);
        setCurrentTheme(getActiveTheme());
      }
    } catch (err) {
      console.error('Error loading themes:', err);
      setError('خطا در بارگذاری تم‌ها');
      // در صورت خطا، از Mock استفاده کن
      setAllThemes(BOARD_THEMES);
      setCurrentTheme(getActiveTheme());
    } finally {
      setLoading(false);
    }
  }, [useApi]);

  // بارگذاری اولیه
  useEffect(() => {
    loadThemes();
  }, [loadThemes]);

  // تغییر تم
  const changeTheme = useCallback(async (themeId: string) => {
    console.log('🔄 changeTheme called with:', themeId);
    setLoading(true);
    setError(null);
    
    try {
      if (useApi) {
        // ارسال به بک‌اند
        const newTheme = await setActiveBoardTheme(themeId);
        setCurrentTheme(newTheme);
      } else {
        // تغییر در Mock Data
        console.log('📝 Before change - Current theme:', currentTheme.id);
        
        // ابتدا همه را غیرفعال کن
        BOARD_THEMES.forEach(t => { t.isActive = false; });
        
        // تم جدید را پیدا کن و فعال کن
        const newTheme = BOARD_THEMES.find(t => t.id === themeId);
        if (newTheme) {
          newTheme.isActive = true;
          console.log('✨ New theme found and activated:', newTheme.id);
          // آپدیت state با کپی جدید
          setCurrentTheme({ ...newTheme });
          setAllThemes([...BOARD_THEMES]);
          console.log('✅ State updated - New current theme:', newTheme.id);
        } else {
          console.error('❌ Theme not found:', themeId);
        }
      }
    } catch (err) {
      console.error('❌ Error changing theme:', err);
      setError('خطا در تغییر تم');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useApi, currentTheme]);

  // خرید تم پریمیوم
  const purchaseTheme = useCallback(async (themeId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      if (useApi) {
        const result = await purchasePremiumTheme(themeId);
        if (result.success) {
          await loadThemes(); // رفرش لیست تم‌ها
        }
        return result.success;
      }
      // در Mock mode همیشه موفق
      return true;
    } catch (err) {
      console.error('Error purchasing theme:', err);
      setError('خطا در خرید تم');
      return false;
    } finally {
      setLoading(false);
    }
  }, [useApi, loadThemes]);

  // چک کردن دسترسی به تم
  const hasAccessToTheme = useCallback(async (themeId: string): Promise<boolean> => {
    try {
      if (useApi) {
        const result = await checkThemeAccess(themeId);
        return result.hasAccess;
      }
      // در Mock mode همه تم‌های رایگان در دسترس هستند
      const theme = allThemes.find(t => t.id === themeId);
      return !theme?.isPremium;
    } catch (err) {
      console.error('Error checking theme access:', err);
      return false;
    }
  }, [useApi, allThemes]);

  // محاسبه تم‌های رایگان و پریمیوم
  const freeThemes = allThemes.filter(t => !t.isPremium);
  const premiumThemes = allThemes.filter(t => t.isPremium);

  return {
    currentTheme,
    allThemes,
    freeThemes,
    premiumThemes,
    loading,
    error,
    changeTheme,
    purchaseTheme,
    hasAccessToTheme,
    refreshThemes: loadThemes,
  };
}
