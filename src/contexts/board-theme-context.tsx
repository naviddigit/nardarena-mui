'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

import { BOARD_THEMES } from 'src/_mock/_board-themes';
import {
  fetchBoardThemes,
  fetchActiveTheme,
  setActiveBoardTheme,
  purchasePremiumTheme,
  checkThemeAccess,
} from 'src/api/board-themes';

import type { BoardTheme } from 'src/types/board-theme';

// ----------------------------------------------------------------------

type BoardThemeContextValue = {
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

const BoardThemeContext = createContext<BoardThemeContextValue | undefined>(undefined);

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
  useApi?: boolean;
};

export function BoardThemeProvider({ children, useApi = false }: Props) {
  const [currentTheme, setCurrentTheme] = useState<BoardTheme>(
    BOARD_THEMES.find((t) => t.isActive) || BOARD_THEMES[0]
  );
  const [allThemes, setAllThemes] = useState<BoardTheme[]>(BOARD_THEMES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // بارگذاری اولیه تم‌ها
  const loadThemes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (useApi) {
        const [themes, activeTheme] = await Promise.all([
          fetchBoardThemes(),
          fetchActiveTheme(),
        ]);
        setAllThemes(themes);
        setCurrentTheme(activeTheme);
      } else {
        // استفاده از Mock Data
        setAllThemes([...BOARD_THEMES]);
        const active = BOARD_THEMES.find((t) => t.isActive) || BOARD_THEMES[0];
        setCurrentTheme({ ...active });
      }
    } catch (err) {
      console.error('Error loading themes:', err);
      setError('خطا در بارگذاری تم‌ها');
    } finally {
      setLoading(false);
    }
  }, [useApi]);

  useEffect(() => {
    loadThemes();
  }, [loadThemes]);

  // تغییر تم
  const changeTheme = useCallback(
    async (themeId: string) => {
      console.log('🔄 Context changeTheme called with:', themeId);
      setLoading(true);
      setError(null);

      try {
        if (useApi) {
          const newTheme = await setActiveBoardTheme(themeId);
          setCurrentTheme(newTheme);
        } else {
          // تغییر در Mock Data
          console.log('📝 Before change - Current theme:', currentTheme.id);

          BOARD_THEMES.forEach((t) => {
            t.isActive = false;
          });

          const newTheme = BOARD_THEMES.find((t) => t.id === themeId);
          if (newTheme) {
            newTheme.isActive = true;
            console.log('✨ New theme found:', newTheme.id, newTheme.name);
            
            // آپدیت state با object جدید
            const themeClone = { ...newTheme };
            setCurrentTheme(themeClone);
            setAllThemes([...BOARD_THEMES]);
            
            console.log('✅ Context state updated to:', themeClone.id);
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
    },
    [useApi, currentTheme]
  );

  // خرید تم پریمیوم
  const purchaseTheme = useCallback(
    async (themeId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        if (useApi) {
          const success = await purchasePremiumTheme(themeId);
          if (success) {
            await loadThemes(); // رفرش تم‌ها
          }
          return success;
        }
        // در Mock mode همه تم‌ها قابل دسترس هستن
        return true;
      } catch (err) {
        console.error('Error purchasing theme:', err);
        setError('خطا در خرید تم');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [useApi, loadThemes]
  );

  // چک کردن دسترسی به تم
  const hasAccessToTheme = useCallback(
    async (themeId: string): Promise<boolean> => {
      try {
        if (useApi) {
          return checkThemeAccess(themeId);
        }
        // در Mock mode همه تم‌ها قابل دسترس هستن
        return true;
      } catch (err) {
        console.error('Error checking theme access:', err);
        return false;
      }
    },
    [useApi]
  );

  const freeThemes = useMemo(
    () => allThemes.filter((theme) => !theme.isPremium),
    [allThemes]
  );

  const premiumThemes = useMemo(
    () => allThemes.filter((theme) => theme.isPremium),
    [allThemes]
  );

  const value = useMemo(
    () => ({
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
    }),
    [
      currentTheme,
      allThemes,
      freeThemes,
      premiumThemes,
      loading,
      error,
      changeTheme,
      purchaseTheme,
      hasAccessToTheme,
      loadThemes,
    ]
  );

  return <BoardThemeContext.Provider value={value}>{children}</BoardThemeContext.Provider>;
}

// Custom hook برای استفاده از context
export function useBoardTheme() {
  const context = useContext(BoardThemeContext);
  if (!context) {
    throw new Error('useBoardTheme must be used within BoardThemeProvider');
  }
  return context;
}
