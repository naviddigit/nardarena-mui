# 🎯 PROJECT CRITICAL GUIDELINES

## ⚠️ CRITICAL FILES - NO DIRECT EDITING
این فایل‌ها فقط از روی package components نوشته شوند:

### 1. `src/components/game-settings-drawer/`
- **MUST USE**: `Block`, `ButtonBase` از `src/components/settings/drawer/`
- **NO HARDCODING**: همه style ها از theme بیاید
- **Pattern**: مثل `PresetsOptions` و `BaseOption` از settings drawer

### 2. `src/components/backgammon-board/board-container.tsx`
- **Bear-off zones (خط 632-690 و 767-815)**: 
  - از `flexbox` استفاده کن (نه absolute positioning)
  - `justifyContent: 'flex-end'` برای چینش از راست
  - `position: 'relative'` + `marginLeft` برای spacing
  - دست نزن به این قسمت مگر اینکه user صراحتاً بگه
- **NO HARDCODING**: همه مقادیر از `SCALE_CONFIG` و `checkerSize`

### 3. Theme System
- **NEVER HARDCODE COLORS**: فقط از `currentTheme.colors.*` استفاده کن
- **Context**: `useBoardTheme()` برای تم‌های board
- **Package themes**: از `src/theme/` فقط خوندن، نه نوشتن

---

## 📋 CODE STANDARDS

### ✅ CLEAN CODE RULES:
1. **No Persian in UI** - فقط در کامنت‌ها مجاز است
2. **Use Package Components** - از MUI و package components استفاده کن
3. **No Magic Numbers** - از constants و config استفاده کن
4. **Modular Structure** - هر feature یک component جدا
5. **Type Safety** - همه چیز typed باشه

### ❌ FORBIDDEN:
- Hardcoded colors/sizes
- Inline styles برای logic
- Direct state manipulation
- Persian text in UI
- Duplicate code

---

## 🎮 GAME FEATURES

### Dev Hotkeys (⚠️ REMOVE BEFORE PRODUCTION):
- **File**: `src/components/dev-hotkeys.tsx`
- **Usage**: Import در `page.tsx` با comment های `⚠️ DEV ONLY`
- **To Remove**: 
  1. Delete `dev-hotkeys.tsx`
  2. Remove `<DevHotkeys />` from page
  3. Remove `demoOffCounts` state
  4. Remove handler functions

### Set Start Animation:
- موشن "Start Set X of Y" در شروع هر ست
- با `showWinMessage()` اجرا میشه
- Timing: Win text (4s) → پاک → Set start (0.5s delay)

### Bear-off Zones:
```tsx
// ✅ CORRECT PATTERN:
justifyContent: 'flex-end',  // چینش از راست
marginLeft: index === 0 ? 0 : checkerSize * 0.55,  // فاصله نسبی
position: 'relative',  // نه absolute
```

---

## 📐 SCALE CONFIG
فایل: `board-container.tsx` خط 23-50

```tsx
const SCALE_CONFIG = {
  pointWidth: { desktop: 0.9, mobile: 0.85 },
  checkerSize: { desktop: 0.9, mobile: 0.9 },
  stackSpacing: { desktop: 0.9, mobile: 0.9 },
  barChecker: { desktop: 0.7, mobile: 0.6 },
  barWidth: 0.9,
};
```
**همه sizing از اینجا باید بیاد!**

---

## 🎨 THEME SYSTEM

### Board Themes:
- Context: `src/contexts/board-theme-context.tsx`
- Mock Data: `src/_mock/_board-themes.ts`
- Usage: `const { currentTheme, allThemes, changeTheme } = useBoardTheme()`

### Theme Options Grid:
```tsx
gridTemplateColumns: '1fr !important',  // تک ستونی
width: '100%',
```

---

## 🔥 COMMON MISTAKES TO AVOID

1. **Don't touch bear-off zones** مگر user بگه
2. **Don't hardcode colors** - use theme
3. **Don't use absolute positioning** برای checkers
4. **Don't forget cache clear** بعد تغییرات بزرگ
5. **Don't write Persian in UI** - only comments

---

## 📦 KEY PACKAGES & PATTERNS

### From Settings Drawer:
- `Block` component for sections
- `ButtonBase` for clickable items
- `Scrollbar` for drawer content
- Pattern: `src/components/settings/drawer/`

### From Game:
- `BackgammonBoard` - main board component
- `Checker` - individual checker
- `DiceRoller` - dice component
- `DevHotkeys` - dev testing (remove before prod)

---

## 🚀 WORKFLOW

### Making Changes:
1. Check if component exists in package
2. Use existing patterns
3. No hardcoding
4. Test with dev hotkeys
5. Clear cache if needed: Delete `.next` folder

### Before New Chat:
این guidelines رو copy کن و بگو:
"Read PROJECT_GUIDELINES.md - follow all rules strictly"

---

## 📝 QUICK REFERENCE

**Dev Hotkeys:**
- Ctrl+1: Win effect test
- Ctrl+2: Add checker (both colors)
- Ctrl+3: Set start animation test

**Critical Values:**
- Bear-off width: `60%`
- Checker spacing: `checkerSize * 0.55`
- Grid columns: `1fr` (single column)

**File Paths:**
- Game page: `src/app/game/ai/page.tsx`
- Board: `src/components/backgammon-board/board-container.tsx`
- Settings drawer: `src/components/game-settings-drawer/`
- Dev tools: `src/components/dev-hotkeys.tsx`
