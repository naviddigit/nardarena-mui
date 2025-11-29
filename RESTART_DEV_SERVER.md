# 🔄 Restart Required

## Changes Made:
1. ✅ DevHotkeys component created and added
2. ✅ Theme grid changed to 1 column (gridTemplateColumns: '1fr')
3. ✅ Bear-off checkers fixed (bigger, right-aligned, more spacing)

## ⚠️ To Apply Changes:

### Option 1: Clear Cache & Restart (Recommended)
```powershell
# Stop dev server (Ctrl+C in terminal)
cd nard-frontend
Remove-Item -Recurse -Force .next
npm run dev
```

### Option 2: Hard Refresh Browser
1. Stop dev server (Ctrl+C)
2. Delete `.next` folder manually
3. Run `npm run dev`
4. In browser: Press `Ctrl+Shift+R` (hard refresh)

## 🧪 Test After Restart:
- Press `Ctrl+1` → Win effect
- Press `Ctrl+2` → Add white checkers (right-aligned)
- Press `Ctrl+3` → Add black checkers (right-aligned)
- Open drawer → Themes should be 1 per row

## 📝 To Remove Dev Features Before Production:
1. Delete `src/components/dev-hotkeys.tsx`
2. Remove `<DevHotkeys />` from `src/app/game/ai/page.tsx` (line 527-531)
3. Remove `demoOffCounts` state (line 198)
4. Remove hotkey handlers (line 216-228)
