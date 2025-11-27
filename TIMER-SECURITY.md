# Timer Security & Background Execution Fixes

## مشکلات قبلی
1. ⚠️ Timer وقتی tab minimize میشد متوقف میشد (browser throttling)
2. ⚠️ Timer قابل manipulation بود (client-side)

## راه حل‌های پیاده شده

### 1. بهبود `useCountdownSeconds` (تمام صفحات)
**فایل:** `src/hooks/use-countdown.ts`

**تغییرات:**
- ✅ استفاده از `Date.now()` به جای tick counting
- ✅ ترکیب `requestAnimationFrame` + `setInterval` 
- ✅ کار میکنه حتی وقتی tab minimize است
- ✅ دقت بالاتر (check هر 100ms)

**نحوه استفاده:** (بدون تغییر - همون قبلی)
```typescript
const timer = useCountdownSeconds(120);
```

### 2. `useWorkerTimer` (پیشنهادی - امن‌تر)
**فایل:** `src/hooks/use-worker-timer.ts`

**مزایا:**
- ✅ اجرا در background thread جداگانه (Web Worker)
- ✅ سخت‌تر برای hack کردن
- ✅ کار میکنه حتی اگر main thread مشغول باشه
- ✅ Fallback به Date.now() اگر Worker پشتیبانی نشد

**نحوه استفاده:**
```typescript
import { useWorkerTimer } from 'src/hooks/use-worker-timer';

// در کامپوننت game
const whiteTimer = useWorkerTimer(120);
const blackTimer = useWorkerTimer(120);
```

### 3. Timer Web Worker
**فایل:** `public/timer-worker.js`

Background worker که:
- در thread جداگانه اجرا میشه
- Update هر 100ms برای دقت بالا
- PING/PONG health check

## استفاده در Game Component

### روش 1: استفاده از Hook بهبود یافته (فعلی)
```typescript
// src/app/game/ai/page.tsx
import { useCountdownSeconds } from 'src/hooks/use-countdown';

const whiteTimer = useCountdownSeconds(120);
const blackTimer = useCountdownSeconds(120);
```

✅ **بدون نیاز به تغییر کد - خودکار فعال شد**

### روش 2: استفاده از Worker Timer (امن‌تر)
```typescript
// src/app/game/ai/page.tsx
import { useWorkerTimer } from 'src/hooks/use-worker-timer';

const whiteTimer = useWorkerTimer(120);
const blackTimer = useWorkerTimer(120);
```

⚠️ **نیاز به تغییر import دارد**

## تست کردن

### Test 1: Minimize Tab
1. بازی رو شروع کن
2. Tab رو minimize کن
3. 2 دقیقه صبر کن
4. Tab رو باز کن
5. ✅ باید timer درست ادامه داده باشه (نه متوقف شده)

### Test 2: Developer Tools Manipulation
1. Console رو باز کن
2. بخوای تایمر رو تغییر بدی: `Date.now = () => ...`
3. ✅ با useWorkerTimer سخت‌تر هست (اجرا در thread جداگانه)

## محافظت کامل (مرحله بعدی - نیاز به Backend)

برای محافظت 100%، نیاز به:

### Server-Side Timer
```typescript
// Backend endpoint
POST /api/game/start-turn
Response: { turnStartTime: "2024-11-26T10:30:00Z", expiresAt: "2024-11-26T10:32:00Z" }

GET /api/game/remaining-time
Response: { remaining: 87 } // seconds
```

### Heartbeat System
```typescript
// هر 5 ثانیه check کن
setInterval(() => {
  fetch('/api/game/remaining-time').then(data => {
    if (data.remaining === 0) {
      // Time's up - از سرور تایید شده
      handleTimeout();
    }
  });
}, 5000);
```

### Anti-Cheat Validation
```typescript
// Backend validates all moves
POST /api/game/move
Body: { 
  from: 5, 
  to: 8,
  timestamp: "2024-11-26T10:31:45Z"
}

// Server checks:
if (moveTimestamp > turnExpireTime) {
  return { error: "Move made after time expired" };
}
```

## مقایسه روش‌ها

| ویژگی | useCountdownSeconds | useWorkerTimer | Server Timer |
|------|---------------------|----------------|--------------|
| Minimize-Safe | ✅ | ✅ | ✅ |
| Anti-Manipulation | ⚠️ (متوسط) | ✅ (خوب) | ✅✅ (عالی) |
| Offline | ✅ | ✅ | ❌ |
| پیچیدگی | کم | متوسط | زیاد |
| نیاز به Backend | ❌ | ❌ | ✅ |

## توصیه

**فعلاً:** 
- ✅ از `useCountdownSeconds` بهبود یافته استفاده کن (بدون تغییر کد)
- یا برو سراغ `useWorkerTimer` برای امنیت بیشتر

**آینده:** 
- پیاده‌سازی Server-Side Timer برای Online Multiplayer
- Heartbeat با backend هر 5 ثانیه
- Validation تمام moves در سرور
