# Backgammon Game Logic - Refactored Structure

این پروژه با ساختار ماژولار و استاندارد refactor شده تا خوانایی و نگهداری کد آسان‌تر باشه.

## 📁 ساختار فایل‌ها

### 🎮 Game Logic Module (`src/hooks/game-logic/`)

#### **types.ts**
انواع داده‌های بازی:
- `Player`: 'white' | 'black'
- `ValidMove`: حرکت‌های معتبر با from, to, die
- `MoveHistory`: تاریخچه حرکات برای undo
- `GameState`: state کامل بازی

#### **validation.ts**
Logic اعتبارسنجی حرکات:
- `isValidDestination()`: چک می‌کنه که آیا مقصد معتبره
  - مهره می‌تونه به point خالی بره
  - مهره می‌تونه روی مهره‌های همرنگ stack بشه
  - مهره می‌تونه مهره تکی حریف رو بزنه (hit)
- `canBearOff()`: چک می‌کنه آیا می‌شه مهره رو از تخته خارج کرد
- `isValidBearOff()`: چک می‌کنه حرکت خروج از تخته معتبره
- `calculateValidMoves()`: تمام حرکات معتبر رو برای dice values محاسبه می‌کنه

#### **move-executor.ts**
اجرای حرکات با animation:
- `executeMoveFromBar()`: حرکت از bar به تخته
- `executeMoveFromPoint()`: حرکت از point به point
- `executeMove()`: تابع اصلی که هر دو حالت رو handle می‌کنه

**ویژگی‌های خاص:**
- Hit moves دو مرحله‌ای هستن (با animation delay):
  1. مهره حریف رو به bar می‌بره (250ms)
  2. مهره خودمون رو جابجا می‌کنه
- Non-hit moves یک مرحله‌ای و sync هستن

#### **index.ts**
Export همه module ها برای استفاده آسان

---

### 🎨 Board Components (`src/components/backgammon-board/`)

#### **dice-indicators.tsx**
کامپوننت مستقل برای نمایش dice indicators:
- نمایش dice های کلیک‌شدنی کنار مهره انتخاب شده
- Position به صورت خودکار بر اساس `isTopPoint` تنظیم میشه
- Animation با framer-motion
- نقاط dice به صورت standard (1-6)

#### **checker.tsx**
کامپوننت مهره با استفاده از DiceIndicators:
- Animation با framer-motion layout
- استایل متفاوت برای white/black
- Border و shadow برای selected/playable state
- استفاده از DiceIndicators component

#### **configs/motion-configs.ts**
تنظیمات animation:
- `checkerTransition`: تنظیمات spring برای حرکت مهره‌ها
- `diceIndicatorTransition`: fade animation برای dice indicators
- `boardRotationTransition`: animation چرخش تخته

#### **configs/board-calculations.ts**
محاسبات positioning:
- `calculateBoardDimensions()`: محاسبه سایز responsive board
- `calculateCheckerPosition()`: محاسبه position مهره‌ها (stacking)
- `calculateCountLabelPosition()`: position label برای ۵+ مهره
- `getTopPoints()`, `getBottomPoints()`: helper های layout

---

## 🐛 Bug Fix: Hit Detection

### مشکل قبلی:
```typescript
// ❌ BAD: این شرط برای هر مهره تکی true میشد
target.count === 1
```

### راه‌حل:
```typescript
// ✅ GOOD: فقط مهره تکی حریف hit میشه
(target.count === 1 && target.checkers[0] !== currentPlayer)
```

این باعث میشه:
- مهره‌های همرنگ نتونن روی هم stack بشن (اگه قبلاً یک مهره بود)
- فقط مهره‌های حریف hit بشن

---

## 🔄 Flow اجرای Move

### 1. کاربر روی مهره کلیک می‌کنه
- `board-container` → `handlePointClick`
- `selectedPoint` set میشه
- `validMoves` برای اون point فیلتر میشه

### 2. کاربر dice indicator رو کلیک می‌کنه
- `checker` → `DiceIndicators` → `onDiceClick`
- `executeMove` صدا زده میشه با from, to, die

### 3. Move اجرا میشه
**Non-Hit Move (sync):**
- State بلافاصله update میشه
- Animation با framer-motion

**Hit Move (async با 2 مرحله):**
1. مهره حریف به bar میره (state update)
2. بعد 250ms: مهره ما جابجا میشه (state update)

### 4. Valid moves دوباره محاسبه میشه
- با dice های باقی‌مانده
- `calculateValidMoves` از validation module

---

## 📦 استفاده

```typescript
import { useGameState } from 'src/hooks/use-game-state';
import { calculateValidMoves } from 'src/hooks/game-logic';

function MyComponent() {
  const {
    gameState,
    handleDiceRoll,
    handlePointClick,
    handleEndTurn,
  } = useGameState(initialBoardState);

  // gameState شامل: boardState, currentPlayer, diceValues, validMoves, ...
}
```

---

## ✅ مزایای Refactoring

1. **خوانایی بهتر**: هر فایل مسئولیت مشخصی داره
2. **Test پذیری**: توابع pure قابل test هستن
3. **Reusability**: می‌شه validation logic رو جاهای دیگه استفاده کرد
4. **Debugging آسان‌تر**: مشکلات سریع‌تر پیدا میشن
5. **Documentation بهتر**: کامنت‌ها و JSDoc برای هر تابع

---

## 🧪 Testing

برای test کردن hit detection:
1. یک مهره سفید رو روی point 5 بذار
2. یک مهره سیاه رو روی point 3 بذار
3. با سفید بازی کن و تاس 2 بیار
4. از point 5 به point 3 برو
5. **انتظار:** مهره سیاه باید به bar بره (hit شده)

---

## 📝 TODO

- [ ] Unit tests برای validation functions
- [ ] Integration tests برای move execution
- [ ] Performance optimization برای calculateValidMoves
- [ ] Add TypeScript strict mode
- [ ] Component documentation با Storybook

---

## 🎯 معماری

```
┌─────────────────────────────────────┐
│         UI Layer (React)            │
│  board-container, checker, etc.     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Hook Layer (useGameState)     │
│    State management & handlers      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Game Logic Layer (Modules)     │
│  validation, move-executor, types   │
└─────────────────────────────────────┘
```

این ساختار از **Separation of Concerns** و **Single Responsibility Principle** پیروی می‌کنه.
