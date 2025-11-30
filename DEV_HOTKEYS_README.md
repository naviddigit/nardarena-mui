# 🔧 Development Hotkeys Guide

⚠️ **این فایل‌ها فقط برای development هستند و قبل از production باید حذف شوند!**

## فایل‌های مربوط به Dev Tools:

1. `src/components/dev-hotkeys.tsx` - کامپوننت hotkey handler
2. استفاده در `src/app/game/ai/page.tsx` - خط حدود 638

## هات کی‌های موجود:

| کلید | عملکرد | توضیحات |
|------|--------|---------|
| `Ctrl + 1` | Win Test | تست انیمیشن برد بازیکن |
| `Ctrl + 2` | Add Demo Checkers | اضافه کردن مهره تست به bear-off |
| `Ctrl + 3` | Set Start Test | تست انیمیشن شروع ست |
| `Ctrl + 4` | Roll Dice | ریختن تاس |
| `Ctrl + 5` | Reload Dice.js | بارگذاری مجدد فایل dice.js |

## نحوه حذف قبل از Production:

### 1. حذف کامپوننت DevHotkeys از صفحه بازی:
```tsx
// در فایل: src/app/game/ai/page.tsx
// این خطوط را حذف کنید:

import { DevHotkeys } from 'src/components/dev-hotkeys'; // حذف این import

// و در return:
<DevHotkeys 
  onWinTest={handleWinTest}
  onBothDemoAdd={handleBothDemoAdd}
  onSetStartTest={handleSetStartTest}
  onDiceRoll={triggerDiceRoll}
  onDiceRefresh={triggerDiceRefresh}
/>
// این کامل حذف شود
```

### 2. حذف فایل dev-hotkeys:
```bash
rm src/components/dev-hotkeys.tsx
```

### 3. حذف توابع تست (اختیاری):
اگر می‌خواهید توابع `handleWinTest`, `handleBothDemoAdd`, `handleSetStartTest` را هم حذف کنید (چون فقط برای تست هستند).

## یادداشت:
- این hotkey ها هیچ تاثیری روی بازی اصلی ندارند
- فقط در development mode فعال هستند
- می‌توان با یک environment variable هم کنترل کرد
