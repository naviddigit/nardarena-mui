# 🐛 Bug Fixes Documentation

## ✅ v1.0.0-bar-fix (Nov 25, 2025) - Bar Checkers Display Issue

### 🔴 مشکل (Problem)
**مهره‌های زده شده روی bar نمایش داده نمی‌شدند**
- وقتی یک مهره زده می‌شد، state به درستی آپدیت می‌شد (`bar.white: 1` یا `bar.black: 1`)
- ولی مهره روی UI نمایش داده نمی‌شد
- گاهی نمایش داده می‌شد، گاهی نه (intermittent bug)
- Console پر می‌شد از لاگ‌های تکراری (infinite loop)

### 🔍 ریشه مشکل (Root Cause)
**Infinite Re-render Loop** در `board-container.tsx`:

```tsx
// ❌ کد قبلی (اشتباه)
<Box>
  {renderCheckers().filter(c => c.key?.toString().includes('white-bar'))}
</Box>
```

**چرا مشکل بود؟**
1. `renderCheckers()` یک function معمولی بود که در هر render اجرا می‌شد
2. این function دو بار صدا زده می‌شد (یکی برای white bar، یکی برای black bar)
3. هر بار که component render می‌شد، React فکر می‌کرد checkers جدیدی ساخته شده
4. این باعث re-render می‌شد → که دوباره `renderCheckers()` صدا می‌زد → infinite loop

### ✅ راه حل (Solution)
**استفاده از `useMemo` برای memoization**:

```tsx
// ✅ کد جدید (درست)
const barCheckers = useMemo(() => {
  const checkers: { white: JSX.Element[], black: JSX.Element[] } = { white: [], black: [] };
  const checkerScale = isMobile ? SCALE_CONFIG.checkerSize.mobile : SCALE_CONFIG.checkerSize.desktop;
  const checkerSize = pointWidth * checkerScale;

  // Bar White
  for (let i = 0; i < boardState.bar.white; i++) {
    const checkerId = checkerIds.bar.white[i] || `white-bar-${i}`;
    const barStackSpacing = isMobile ? SCALE_CONFIG.stackSpacing.mobile : SCALE_CONFIG.stackSpacing.desktop;
    const yPos = i * (pointWidth * barStackSpacing);
    
    checkers.white.push(
      <Checker
        key={checkerId}
        layoutId={checkerId}
        player="white"
        size={checkerSize}
        yPosition={yPos}
        onCheckerClick={() => onBarClick?.()}
      />
    );
  }

  // Bar Black
  for (let i = 0; i < boardState.bar.black; i++) {
    const checkerId = checkerIds.bar.black[i] || `black-bar-${i}`;
    const barStackSpacing = isMobile ? SCALE_CONFIG.stackSpacing.mobile : SCALE_CONFIG.stackSpacing.desktop;
    const yPos = i * (pointWidth * barStackSpacing);
    
    checkers.black.push(
      <Checker
        key={checkerId}
        layoutId={checkerId}
        player="black"
        size={checkerSize}
        yPosition={yPos}
        onCheckerClick={() => onBarClick?.()}
      />
    );
  }

  return checkers;
}, [boardState.bar.white, boardState.bar.black, checkerIds.bar.white, checkerIds.bar.black, pointWidth, isMobile, onBarClick]);

// استفاده:
<Box>{barCheckers.white}</Box>
<Box>{barCheckers.black}</Box>
```

### 🎯 چرا کار کرد؟
1. **Memoization**: `useMemo` نتیجه را cache می‌کند و فقط وقتی dependencies تغییر کنند، دوباره محاسبه می‌کند
2. **جلوگیری از re-render**: React می‌فهمد که checkers تغییری نکرده‌اند و دوباره render نمی‌کند
3. **Performance**: به جای اجرای function در هر render، فقط وقتی واقعاً لازم است اجرا می‌شود
4. **Separation**: مهره‌های white و black جدا شدند → دیگر نیازی به `.filter()` نیست

### 📝 مراحل Debug (برای آینده)
اگر دوباره با این مشکل مواجه شدید:

1. **چک کنید console پر از لاگ‌های تکراری نشده؟** → Infinite loop
2. **آیا component در هر render دوباره JSX می‌سازد؟** → باید memoize بشه
3. **آیا function‌های render داخل JSX صدا زده می‌شوند؟** → باید `useMemo` یا `useCallback` استفاده کنید
4. **چک کنید React DevTools Profiler** → تعداد render‌ها غیرطبیعی نباشد

### 🔧 تغییرات فایل‌ها
- ✅ `src/components/backgammon-board/board-container.tsx`
  - تبدیل `renderCheckers()` به `barCheckers` با `useMemo`
  - تقسیم به `barCheckers.white` و `barCheckers.black`
  - افزودن dependencies: `[boardState.bar.white, boardState.bar.black, checkerIds.bar.white, checkerIds.bar.black, pointWidth, isMobile, onBarClick]`

### 🏷️ Git Tag
```bash
git tag v1.0.0-bar-fix
```

برای بازگشت به این نسخه:
```bash
git checkout v1.0.0-bar-fix
```

---

## 📚 درس‌های آموخته شده

### ⚠️ قوانین React Performance:
1. **هیچ‌وقت function رو داخل JSX صدا نزنید** → از `useMemo` یا `useCallback` استفاده کنید
2. **اگر component بدون دلیل re-render می‌شه** → حتماً یه چیزی داره در هر render دوباره ساخته می‌شه
3. **Console پر از لاگ تکراری** = **Infinite loop** = شک کنید به memoization
4. **Framer Motion با `layoutId`** خیلی حساسه به re-render‌ها → حتماً باید memoize بشه

### 🛠️ ابزارهای Debug:
- ✅ React DevTools Profiler → تعداد render‌ها
- ✅ Console.log با emoji → پیدا کردن infinite loops
- ✅ `useMemo` dependencies → مطمئن بشید همه چیز درست است
- ✅ Git tags → ذخیره نسخه‌های مهم

---

## 📌 نکات مهم برای آینده

### اگر مهره‌ها دوباره ناپدید شدند:
1. چک کنید `useMemo` dependencies کامل هستند
2. مطمئن بشید `checkerIds` درست assign می‌شوند
3. بررسی کنید `position: relative` روی parent container هست
4. چک کنید Framer Motion `layoutId` یکتا هستند

### اگر infinite loop دوباره اتفاق افتاد:
1. فوراً `console.log` اضافه کنید ببینید چند بار اجرا می‌شه
2. هر function که داخل JSX صدا زده می‌شه رو به `useMemo` تبدیل کنید
3. چک کنید dependencies `useMemo` درست هستند
4. بررسی کنید React Strict Mode disable شده باشه (فقط برای development)

---

**Commit Hash**: `c4e00c5`  
**Tag**: `v1.0.0-bar-fix`  
**Date**: November 25, 2025

این یک bug خیلی مهم و پیچیده بود که ساعت‌ها طول کشید تا پیدا بشه! 🎉
