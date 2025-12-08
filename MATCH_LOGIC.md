# 🏆 Match Win Logic - NardAria Backgammon

## 📋 Overview
این سند منطق برد در بازی چند-ستی (Multi-Set Match) را توضیح می‌دهد.

---

## 🎯 Win Conditions (شرایط برد)

### 1. Normal Win (برد عادی - تکمیل ست‌ها)

برای برد Match، بازیکن باید **بیش از 50% ست‌ها** را ببرد:

| تعداد کل ست‌ها | ست‌های لازم برای برد | درصد |
|----------------|---------------------|------|
| 1 ست | 1 ست | 100% |
| 3 ست | 2 ست | 66.7% |
| 5 ست | 3 ست | 60% |
| 9 ست | 5 ست | 55.6% |

**فرمول**: `setsToWin = Math.ceil(maxSets / 2)`

**مثال - بازی 5 ستی**:
```
Set 1: شما بردید → امتیاز: شما 1 - AI 0
Set 2: AI برد    → امتیاز: شما 1 - AI 1
Set 3: شما بردید → امتیاز: شما 2 - AI 1
Set 4: AI برد    → امتیاز: شما 2 - AI 2
Set 5: شما بردید → امتیاز: شما 3 - AI 2 ✅ شما برنده!
```

### 2. Timeout Win (برد با Timeout - اولویت اول)

⚠️ **CRITICAL**: Timeout اولویت دارد بر همه!

اگر تایمر بازیکن به 0 برسد:
- بازی **فوراً** تمام می‌شود
- حریف برنده اعلام می‌شود
- حریف `setsToWin` امتیاز می‌گیرد (مثلاً در 5 ست → 3 امتیاز)
- مدال نمایش داده می‌شود با پیام مثل: **"You won 3 sets"**

**مثال - بازی 5 ستی**:
```
Set 1: شما بردید → امتیاز: شما 1 - AI 0
Set 2: در حین بازی، تایمر AI به 0 رسید
     → بازی فوراً تمام می‌شود
     → امتیاز نهایی: شما 3 - AI 0
     → مدال: "You won 3 sets" ✅
```

**کد مربوطه**:
```typescript
// Frontend: page.tsx (lines 1120-1130)
if (blackTimeBackend <= 0) {
  const setsToWin = Math.ceil(maxSets / 2);
  setScores(s => ({ ...s, white: setsToWin })); // ← برنده فوراً setsToWin می‌گیرد
  setWinner('white');
  setTimeoutWinner(true);
  setResultDialogOpen(true);
}
```

---

## 🔄 Set Winner Logic (منطق برد هر ست)

### شروع ست جدید

وقتی یک بازیکن ست را می‌برد (15 مهره خارج کرد):

1. **Check Match Win**:
   ```typescript
   const newScore = {
     ...prev,
     [currentSetWinner]: prev[currentSetWinner] + 1,
   };
   
   const setsToWin = Math.ceil(maxSets / 2);
   
   if (newScore[currentSetWinner] >= setsToWin) {
     // 🏆 Match تمام شد - نمایش مدال
     setWinner(currentSetWinner);
     setResultDialogOpen(true);
   }
   ```

2. **Start Next Set** (اگر Match تمام نشده):
   - نمایش پیام: `"You Win This Set!"` یا `"AI Wins This Set!"`
   - نمایش انیمیشن: `"Start Set X of Y"`
   - **برنده ست، ست بعدی را شروع می‌کند**
   - تایمرها به مقدار اولیه reset می‌شوند
   - تخته به حالت اولیه برمی‌گردد

### ⏱️ Timer Start for Winner (شروع تایمر برنده)

⚠️ **CRITICAL**: تایمر برنده باید **فوراً** شروع شود!

**Frontend**:
```typescript
// When starting new set
startNewSet(currentSetWinner); // Winner starts

// In startNewSet:
setGameState((prev) => ({
  ...prev,
  currentPlayer: winner, // ← برنده current player می‌شود
  gamePhase: 'waiting',  // ← منتظر roll
}));
```

**Backend** (باید اضافه شود):
```typescript
// When new set starts in backend
gameState.currentPlayer = winner;
gameState.lastDoneBy = loser; // ← مهم! بازنده آخرین Done را زده
gameState.lastDoneAt = new Date().toISOString(); // ← زمان شروع

// Result: Winner's timer immediately starts counting
```

**Formula**:
```
Active timer = player who did NOT press Done last
If lastDoneBy = 'black' → white's timer is active
If lastDoneBy = 'white' → black's timer is active
```

---

## 📊 Game Flow Example (مثال کامل)

### بازی 5 ستی (First to 3 wins)

```
START MATCH:
- تایمر هر دو: 240 ثانیه
- Opening roll

SET 1:
1. Opening: شما 6 زدید، AI 4 زد → شما شروع می‌کنید
2. شما تاس می‌زنید → حرکت → Done
   → تایمر شما: 230s، AI: 240s
3. AI تاس می‌زند → حرکت → Done
   → تایمر شما: 230s، AI: 235s
4. ... بازی ادامه دارد ...
5. شما 15 مهره خارج کردید ✅
   → امتیاز: شما 1 - AI 0
   → پیام: "You Win This Set!"

SET 2 STARTS:
1. شما برنده Set 1 بودید → شما شروع می‌کنید
2. تایمر شما فوراً شروع می‌شود (lastDoneBy = 'black')
3. ... بازی ...
4. AI برنده Set 2 ✅
   → امتیاز: شما 1 - AI 1

SET 3:
1. AI شروع می‌کند
2. ... بازی ...
3. شما برنده ✅
   → امتیاز: شما 2 - AI 1

SET 4:
1. شما شروع می‌کنید
2. در حین بازی، تایمر AI به 0 رسید! ⏱️
   → بازی فوراً متوقف می‌شود
   → امتیاز نهایی: شما 3 - AI 0
   → مدال: "You won 3 sets - AI timed out" 🏆
```

---

## 🔧 Implementation Checklist

### ✅ Completed:
- [x] Win condition calculation (`Math.ceil(maxSets / 2)`)
- [x] Timeout priority (immediately gives `setsToWin` to winner)
- [x] Set winner detection (15 checkers off)
- [x] Score tracking
- [x] Winner starts next set (frontend)

### ⚠️ Needs Fix:
- [ ] Backend: Set `lastDoneBy = loser` when new set starts
- [ ] Backend: Create API endpoint for starting new set
- [ ] Frontend: Call backend when new set starts
- [ ] Fix: Game marked as `COMPLETED` after first set (should stay `ACTIVE` until match over)

---

## 📝 Key Files

### Frontend:
- `nard-frontend/src/app/game/ai/page.tsx`
  - Lines 1333-1413: Set winner logic
  - Lines 1100-1180: Timeout detection
  - Lines 489-506: Refresh winner check

### Backend:
- `nard-backend/src/modules/game/game.service.ts`
  - Lines 685-850: endTurn() (handles timer updates)
  - Lines 247-310: calculateCurrentTimers() (LOCKED)

---

## 🎮 User Experience

### Normal Win (3 sets in 5-set match):
```
"🎉 You Win!
You won 3 sets out of 5"
```

### Timeout Win:
```
"🎉 You Win!
You won 3 sets
Opponent timed out"
```

### Display Format:
- Total sets won is shown (e.g., "3 sets")
- This equals `setsToWin` value
- For timeout: always show full `setsToWin` amount

---

## 🐛 Known Issues

1. **Game ends after first set**:
   - Backend marks game as `COMPLETED`
   - Should stay `ACTIVE` until match is won
   - Need multi-set game support in backend

2. **Refresh shows winner modal**:
   - Fixed by checking if score >= `setsToWin`
   - Lines 489-506 in page.tsx

3. **Timer doesn't start for winner of new set**:
   - Frontend sets `currentPlayer = winner`
   - Backend needs to set `lastDoneBy = loser`
   - This makes winner's timer start immediately
