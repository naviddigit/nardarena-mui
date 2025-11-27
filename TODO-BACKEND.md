# TODO - Backend Integration

## ⚠️ یادت باشه!

### فایل‌هایی که ساخته شدن ولی بدون Backend کار نمی‌کنن:

```
src/
  types/game-api/
    index.ts              ← Type definitions (آماده)
  
  services/
    game-api.ts           ← REST API client (آماده)
    game-websocket.ts     ← WebSocket client (آماده)
    README.md             ← مستندات کامل
  
  hooks/
    use-server-game.ts    ← React hook (آماده)
```

### چیزی که نیاز داره:

- **Backend Server** (Node.js / Python / Go)
- **Database** (PostgreSQL / MongoDB)
- **WebSocket Server**
- **API Endpoints:**
  - GET `/api/game/:id/state`
  - POST `/api/game/:id/action`
  - POST `/api/game/:id/join`
  - WS `/api/game/:id/ws`

### وقتی Backend آماده شد:

1. فایل `.env.local` بساز:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_WS_HOST=localhost:3001
   ```

2. توی `game/ai/page.tsx`:
   ```typescript
   // ❌ حذف کن:
   import { useGameState } from 'src/hooks/use-game-state';
   
   // ✅ جایگزین کن با:
   import { useServerGame } from 'src/hooks/use-server-game';
   ```

3. مستندات کامل:
   - `src/services/README.md`
   - `SERVER_GAME_ARCHITECTURE.md`

---

**بودجه مصرفی:** ~830 خط کد  
**تاریخ:** 2025-11-27  
**وضعیت:** منتظر Backend
