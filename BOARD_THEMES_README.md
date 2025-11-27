# Board Themes System - سیستم تم‌های تخته

## 📁 فایل‌های مرتبط

### 1. فایل Mock Data (داده‌های تست)
**مسیر:** `src/_mock/_board-themes.ts`

این فایل شامل تمام تم‌های تخته است. برای اضافه کردن تم جدید یا تغییر رنگ‌ها، این فایل را ویرایش کنید.

```typescript
{
  id: 'your-theme-id',
  name: 'نام فارسی',
  nameEn: 'English Name',
  isPremium: false, // true برای تم پولی
  isActive: false,  // true برای تم پیش‌فرض
  colors: {
    background: '#HEX',      // رنگ پس‌زمینه تخته
    darkPoint: '#HEX',       // رنگ نقاط تیره
    lightPoint: '#HEX',      // رنگ نقاط روشن
    barBackground: '#HEX',   // رنگ پس‌زمینه بار (وسط تخته)
  },
}
```

### 2. فایل API (ارتباط با بک‌اند)
**مسیر:** `src/api/board-themes.ts`

توابع برای ارتباط با بک‌اند:
- `fetchBoardThemes()` - دریافت همه تم‌ها
- `fetchActiveTheme()` - دریافت تم فعال کاربر
- `setActiveBoardTheme(themeId)` - تنظیم تم فعال
- `purchasePremiumTheme(themeId)` - خرید تم پریمیوم
- `checkThemeAccess(themeId)` - چک کردن دسترسی

### 3. Hook (استفاده در کامپوننت‌ها)
**مسیر:** `src/hooks/use-board-theme.ts`

```typescript
// استفاده از Mock Data (بدون نیاز به API)
const { currentTheme, changeTheme } = useBoardTheme(false);

// استفاده از API بک‌اند
const { currentTheme, changeTheme } = useBoardTheme(true);
```

### 4. کامپوننت انتخاب تم
**مسیر:** `src/components/backgammon-board/board-theme-selector.tsx`

کامپوننت UI برای انتخاب و خرید تم‌ها

---

## 🚀 نحوه استفاده

### در BoardContainer
تخته به صورت خودکار از تم فعال استفاده می‌کند:

```typescript
// در board-container.tsx
const { currentTheme } = useBoardTheme(false);

// رنگ‌های تخته از currentTheme می‌آیند
const darkPoint = currentTheme.colors.darkPoint;
const lightPoint = currentTheme.colors.lightPoint;
const boardBg = currentTheme.colors.background;
const barColor = currentTheme.colors.barBackground;
```

### در صفحه تنظیمات
```typescript
import { BoardThemeSelector } from 'src/components/backgammon-board/board-theme-selector';

function SettingsPage() {
  return (
    <Box>
      <Typography variant="h4">تنظیمات تخته</Typography>
      <BoardThemeSelector />
    </Box>
  );
}
```

### استفاده مستقیم از Hook
```typescript
function MyComponent() {
  const { 
    currentTheme,    // تم فعال فعلی
    allThemes,       // همه تم‌ها
    freeThemes,      // فقط تم‌های رایگان
    premiumThemes,   // فقط تم‌های پریمیوم
    loading,         // وضعیت بارگذاری
    error,           // خطا (اگر وجود داشته باشد)
    changeTheme,     // تابع تغییر تم
    purchaseTheme,   // تابع خرید تم
    hasAccessToTheme // چک کردن دسترسی
  } = useBoardTheme(false);

  return (
    <Box sx={{ bgcolor: currentTheme.colors.background }}>
      {/* محتوای شما */}
    </Box>
  );
}
```

---

## 🎨 اضافه کردن تم جدید

### روش 1: در Mock Data
فایل `src/_mock/_board-themes.ts` را باز کنید و تم جدید را به آرایه `BOARD_THEMES` اضافه کنید:

```typescript
{
  id: 'sunset-orange',
  name: 'نارنجی غروب',
  nameEn: 'Sunset Orange',
  isPremium: true,
  isActive: false,
  colors: {
    background: '#FF6B35',
    darkPoint: '#FF8C42',
    lightPoint: '#FFAD5A',
    barBackground: '#E55527',
  },
}
```

### روش 2: از طریق API
```typescript
// در بک‌اند یک endpoint بسازید که تم جدید را ذخیره کند
POST /api/board-themes
{
  "theme": {
    "id": "sunset-orange",
    "name": "نارنجی غروب",
    ...
  }
}
```

---

## 🔌 API Endpoints مورد نیاز

بک‌اند شما باید این endpoint‌ها را پیاده‌سازی کند:

### 1. دریافت همه تم‌ها
```
GET /api/board-themes
Response: {
  "themes": [...]
}
```

### 2. دریافت تم فعال کاربر
```
GET /api/board-themes/active
Response: {
  "theme": {...}
}
```

### 3. تنظیم تم فعال
```
PUT /api/board-themes/active
Body: { "themeId": "ocean-blue" }
Response: {
  "theme": {...}
}
```

### 4. خرید تم پریمیوم
```
POST /api/board-themes/purchase
Body: { "themeId": "royal-purple" }
Response: {
  "success": true,
  "theme": {...}
}
```

### 5. چک کردن دسترسی
```
GET /api/board-themes/{themeId}/access
Response: {
  "hasAccess": true
}
```

---

## 📊 ساختار دیتابیس پیشنهادی

```sql
-- جدول تم‌ها
CREATE TABLE board_themes (
  id VARCHAR(50) PRIMARY KEY,
  name_fa VARCHAR(100),
  name_en VARCHAR(100),
  is_premium BOOLEAN DEFAULT FALSE,
  price INT DEFAULT 0,
  colors JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول تم‌های خریداری شده کاربران
CREATE TABLE user_board_themes (
  user_id INT,
  theme_id VARCHAR(50),
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, theme_id),
  FOREIGN KEY (theme_id) REFERENCES board_themes(id)
);

-- جدول تم فعال هر کاربر
CREATE TABLE user_active_theme (
  user_id INT PRIMARY KEY,
  theme_id VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (theme_id) REFERENCES board_themes(id)
);
```

---

## 🎮 تست در محیط Development

```typescript
// 1. استفاده از Mock Data (بدون API)
const { currentTheme, changeTheme } = useBoardTheme(false);

// 2. تست تغییر تم
await changeTheme('ocean-blue');

// 3. تست خرید تم
const success = await purchaseTheme('royal-purple');

// 4. چک کردن دسترسی
const hasAccess = await hasAccessToTheme('midnight-black');
```

---

## 💡 نکات مهم

1. **Mock vs API**: هنگام توسعه از `useBoardTheme(false)` استفاده کنید، در production از `useBoardTheme(true)`

2. **تم پیش‌فرض**: همیشه یک تم با `isActive: true` باید وجود داشته باشد

3. **رنگ‌ها**: از HEX colors استفاده کنید (#RRGGBB)

4. **تم‌های پریمیوم**: فیلد `isPremium: true` را تنظیم کنید

5. **تغییر رنگ**: فقط فایل `_board-themes.ts` را ویرایش کنید، نیازی به تغییر کامپوننت‌ها نیست

---

## 🔄 مهاجرت از سیستم قبلی

اگر قبلاً رنگ‌ها hardcoded بودند:

```typescript
// قبل ❌
const boardBg = '#8B4513';
const darkPoint = '#DEB887';

// بعد ✅
const { currentTheme } = useBoardTheme();
const boardBg = currentTheme.colors.background;
const darkPoint = currentTheme.colors.darkPoint;
```

---

## 📝 TODO برای آینده

- [ ] اضافه کردن پیش‌نمایش زنده تم
- [ ] امکان ساخت تم سفارشی توسط کاربر
- [ ] اشتراک‌گذاری تم‌ها بین کاربران
- [ ] تم‌های فصلی (عید، رمضان، ...)
- [ ] انیمیشن هنگام تغییر تم
