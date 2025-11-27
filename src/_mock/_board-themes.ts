// ----------------------------------------------------------------------
// Board Theme Types
// ----------------------------------------------------------------------

export type BoardTheme = {
  id: string;
  name: string;
  nameEn: string;
  isPremium: boolean;
  isActive: boolean;
  colors: {
    background: string;
    darkPoint: string;
    lightPoint: string;
    barBackground: string;
  };
};

// ----------------------------------------------------------------------
// Mock Board Themes Data
// ----------------------------------------------------------------------

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'classic-wood',
    name: 'چوب کلاسیک',
    nameEn: 'Classic Wood',
    isPremium: false,
    isActive: true, // تم پیش‌فرض فعال
    colors: {
      background: '#8B4513',
      darkPoint: '#672e00',
      lightPoint: '#DEB887',
      barBackground: '#654321',
    },
  },
  {
    id: 'modern-dark',
    name: 'تاریک مدرن',
    nameEn: 'Modern Dark',
    isPremium: false,
    isActive: false,
    colors: {
      background: '#2C3E50',
      darkPoint: '#34495E',
      lightPoint: '#7F8C8D',
      barBackground: '#1A252F',
    },
  },
  {
    id: 'ocean-blue',
    name: 'اقیانوس آبی',
    nameEn: 'Ocean Blue',
    isPremium: true,
    isActive: false,
    colors: {
      background: '#1E3A5F',
      darkPoint: '#2E5A8F',
      lightPoint: '#5E9ACF',
      barBackground: '#0E2A4F',
    },
  },
  {
    id: 'forest-green',
    name: 'جنگل سبز',
    nameEn: 'Forest Green',
    isPremium: true,
    isActive: false,
    colors: {
      background: '#2f3e25',
      darkPoint: '#143102',
      lightPoint: '#6D9046',
      barBackground: '#5c6f50',
    },
  },
  {
    id: 'royal-purple',
    name: 'بنفش سلطنتی',
    nameEn: 'Royal Purple',
    isPremium: true,
    isActive: false,
    colors: {
      background: '#2d1e3e',
      darkPoint: '#7d3ca585',
      lightPoint: '#e2b3ff',
      barBackground: '#584287',
    },
  },
  {
    id: 'desert-sand',
    name: 'شن صحرا',
    nameEn: 'Desert Sand',
    isPremium: false,
    isActive: false,
    colors: {
      background: '#C19A6B',
      darkPoint: '#7f6443',
      lightPoint: '#E1BA8B',
      barBackground: '#916A3B',
    },
  },
  {
    id: 'midnight-black',
    name: 'سیاه نیمه‌شب',
    nameEn: 'Midnight Black',
    isPremium: true,
    isActive: false,
    colors: {
      background: '#1c252e',
      darkPoint: '#919fac',
      lightPoint: '#454f5b',
      barBackground: '#050505',
    },
  },
  {
    id: 'cherry-red',
    name: 'قرمز آلبالویی',
    nameEn: 'Cherry Red',
    isPremium: true,
    isActive: false,
    colors: {
      background: '#622f2f',
      darkPoint: '#A52A2A',
      lightPoint: '#CD5C5C',
      barBackground: '#6B0000',
    },
  },
    {
    id: 'tree-trunk',
    name: 'تنه درخت',
    nameEn: 'Tree trunk',
    isPremium: false,
    isActive: false,
    colors: {
      background: '#eebe74',
      darkPoint: '#824526',
      lightPoint: '#f1edb5',
      barBackground: '#523628',
    },
  },
];

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

/**
 * گرفتن تم فعال فعلی
 */
export function getActiveTheme(): BoardTheme {
  const activeTheme = BOARD_THEMES.find(theme => theme.isActive);
  return activeTheme || BOARD_THEMES[0]; // اگر هیچ تمی فعال نبود، اولین تم رو برگردون
}

/**
 * گرفتن تم بر اساس ID
 */
export function getThemeById(id: string): BoardTheme | undefined {
  return BOARD_THEMES.find(theme => theme.id === id);
}

/**
 * گرفتن تم‌های رایگان
 */
export function getFreeThemes(): BoardTheme[] {
  return BOARD_THEMES.filter(theme => !theme.isPremium);
}

/**
 * گرفتن تم‌های پریمیوم
 */
export function getPremiumThemes(): BoardTheme[] {
  return BOARD_THEMES.filter(theme => theme.isPremium);
}

/**
 * فعال کردن یک تم (برای لوکال تست)
 */
export function setActiveTheme(themeId: string): BoardTheme | null {
  // غیرفعال کردن همه تم‌ها
  BOARD_THEMES.forEach(theme => {
    theme.isActive = false;
  });
  
  // فعال کردن تم انتخابی
  const selectedTheme = BOARD_THEMES.find(theme => theme.id === themeId);
  if (selectedTheme) {
    selectedTheme.isActive = true;
    return selectedTheme;
  }
  
  return null;
}
