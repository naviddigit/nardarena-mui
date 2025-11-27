import type { BoardTheme } from 'src/_mock/_board-themes';

// ----------------------------------------------------------------------
// Board Themes API
// ----------------------------------------------------------------------

/**
 * دریافت تمام تم‌های تخته از بک‌اند
 */
export async function fetchBoardThemes(): Promise<BoardTheme[]> {
  try {
    const response = await fetch('/api/board-themes');
    
    if (!response.ok) {
      throw new Error('Failed to fetch board themes');
    }
    
    const data = await response.json();
    return data.themes || [];
  } catch (error) {
    console.error('Error fetching board themes:', error);
    throw error;
  }
}

/**
 * دریافت تم فعال کاربر از بک‌اند
 */
export async function fetchActiveTheme(): Promise<BoardTheme> {
  try {
    const response = await fetch('/api/board-themes/active');
    
    if (!response.ok) {
      throw new Error('Failed to fetch active theme');
    }
    
    const data = await response.json();
    return data.theme;
  } catch (error) {
    console.error('Error fetching active theme:', error);
    throw error;
  }
}

/**
 * تنظیم تم فعال برای کاربر
 */
export async function setActiveBoardTheme(themeId: string): Promise<BoardTheme> {
  try {
    const response = await fetch('/api/board-themes/active', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ themeId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to set active theme');
    }
    
    const data = await response.json();
    return data.theme;
  } catch (error) {
    console.error('Error setting active theme:', error);
    throw error;
  }
}

/**
 * خرید تم پریمیوم
 */
export async function purchasePremiumTheme(themeId: string): Promise<{ success: boolean; theme: BoardTheme }> {
  try {
    const response = await fetch('/api/board-themes/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ themeId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to purchase theme');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error purchasing theme:', error);
    throw error;
  }
}

/**
 * چک کردن دسترسی کاربر به تم پریمیوم
 */
export async function checkThemeAccess(themeId: string): Promise<{ hasAccess: boolean }> {
  try {
    const response = await fetch(`/api/board-themes/${themeId}/access`);
    
    if (!response.ok) {
      throw new Error('Failed to check theme access');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking theme access:', error);
    throw error;
  }
}
