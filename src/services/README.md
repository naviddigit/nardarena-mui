# 🎮 Server API Services

> ⚠️ **توجه مهم:** این فایل‌ها **فقط قالب** هستن و الان کار نمی‌کنن!
> 
> برای استفاده نیاز به **Backend Server** داریم که هنوز ساخته نشده.

---

## 📁 فایل‌های موجود

### 1. `game-api.ts` - REST API Client
**وضعیت:** ✅ آماده ولی بدون Backend کار نمی‌کنه

**چیکار می‌کنه:**
- درخواست‌های HTTP به backend می‌فرسته
- تمام action های بازی (roll, move, undo, ...) از طریق این فایل

**Endpoints که انتظار داره:**
```typescript
GET    /api/game/:gameId/state       // دریافت وضعیت بازی
POST   /api/game/:gameId/action      // ارسال action (roll/move/...)
POST   /api/game/:gameId/join        // پیوستن به بازی
POST   /api/game/:gameId/spectate    // تماشای بازی
POST   /api/game/:gameId/leave       // خروج از بازی
POST   /api/game/create              // ساخت بازی جدید
```

**استفاده:**
```typescript
import { gameAPI } from 'src/services/game-api';

// دریافت state
const state = await gameAPI.getGameState('game-123');

// تاس زدن
const response = await gameAPI.requestRoll('game-123', 'player-456');

// حرکت مهره
await gameAPI.requestMove('game-123', 'player-456', 5, 3, 2);
```

---

### 2. `game-websocket.ts` - WebSocket Client
**وضعیت:** ✅ آماده ولی بدون Backend کار نمی‌کنه

**چیکار می‌کنه:**
- اتصال WebSocket برای دریافت real-time updates
- وقتی بازیکنی حرکت می‌کنه، بقیه فوراً می‌بینن
- Auto-reconnect اگه connection قطع بشه

**WebSocket URL:**
```
ws://localhost:3001/api/game/:gameId/ws?playerId=xxx&role=player
```

**استفاده:**
```typescript
import { gameWebSocket } from 'src/services/game-websocket';

// وصل شدن
await gameWebSocket.connect('game-123', 'player-456', false);

// گوش دادن به event ها
gameWebSocket.on('GAME_STATE_UPDATE', (event) => {
  console.log('New state:', event.gameState);
});

gameWebSocket.on('MOVE_MADE', (event) => {
  console.log('Move:', event.from, '->', event.to);
});

// قطع اتصال
gameWebSocket.disconnect();
```

---

## 📝 Type Definitions

فایل `src/types/game-api/index.ts` تمام type های API رو داره:

- `ServerGameState` - وضعیت کامل بازی از server
- `PlayerAction` - action هایی که بازیکن می‌تونه انجام بده
- `ServerResponse` - پاسخ server به action ها
- `WebSocketEvent` - event های real-time

---

## 🎯 Hook آماده برای استفاده

فایل `src/hooks/use-server-game.ts` یه React Hook آماده داره که همه چیز رو یکجا انجام میده:

```typescript
import { useServerGame } from 'src/hooks/use-server-game';

function GamePage() {
  const {
    gameState,      // وضعیت بازی از server
    isConnected,    // آیا به WebSocket وصلیم؟
    isLoading,      // در حال بارگذاری؟
    error,          // خطا اگه باشه
    rollDice,       // تاس زدن
    makeMove,       // حرکت کردن
    undoMove,       // برگشت حرکت
    endTurn,        // تمام کردن نوبت
  } = useServerGame({
    gameId: 'game-123',
    playerId: 'player-456',
    isSpectator: false,
    onError: (err) => console.error(err),
    onGameFinished: (winner) => console.log('Winner:', winner),
  });

  // الان کار نمی‌کنه چون backend نداریم!
  // ولی وقتی backend آماده شد، همین کد کار می‌کنه
}
```

---

## 🚧 چیزایی که نیاز داریم بسازیم

### Backend Requirements

#### 1. Node.js/Express Server یا Python/FastAPI یا Go/Gin
```bash
# مثال با Node.js
cd nard-backend
npm init -y
npm install express ws socket.io
```

#### 2. Database
- PostgreSQL یا MongoDB برای ذخیره game state
- Redis برای cache کردن active games

#### 3. API Endpoints پیاده‌سازی کن

**مثال endpoint ساده:**
```javascript
// backend/routes/game.js
app.get('/api/game/:gameId/state', async (req, res) => {
  const { gameId } = req.params;
  const gameState = await db.getGameState(gameId);
  res.json({ gameState });
});

app.post('/api/game/:gameId/action', async (req, res) => {
  const { gameId } = req.params;
  const action = req.body;
  
  // Validate action
  const result = await gameLogic.validateAction(gameId, action);
  
  if (result.valid) {
    // Update game state
    await db.updateGameState(gameId, result.newState);
    
    // Broadcast to all connected clients
    wss.broadcast(gameId, {
      type: 'GAME_STATE_UPDATE',
      gameState: result.newState,
    });
    
    res.json({ success: true, gameState: result.newState });
  } else {
    res.json({ success: false, error: result.error });
  }
});
```

#### 4. WebSocket Server
```javascript
// backend/websocket.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', (ws, req) => {
  const gameId = getGameIdFromUrl(req.url);
  const playerId = getPlayerIdFromUrl(req.url);
  
  // Subscribe to game updates
  subscribeToGame(gameId, ws);
  
  ws.on('message', (data) => {
    // Handle client messages
  });
});
```

---

## 🔄 نحوه استفاده (وقتی Backend آماده شد)

### مرحله 1: تنظیم Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_HOST=localhost:3001
```

### مرحله 2: جایگزین کردن useGameState

```typescript
// قبل (client-side):
import { useGameState } from 'src/hooks/use-game-state';

function GamePage() {
  const { boardState, rollDice, handlePointClick } = useGameState(initialBoard);
}

// بعد (server-side):
import { useServerGame } from 'src/hooks/use-server-game';

function GamePage() {
  const { gameState, rollDice, makeMove } = useServerGame({
    gameId: params.gameId,
    playerId: user.id,
  });
  
  // Convert server state to board state
  const boardState = gameState?.board;
}
```

### مرحله 3: تست کنیم

```bash
# Backend را run کن
cd nard-backend
npm start

# Frontend را run کن
cd nard-frontend
npm run dev

# باز کن: http://localhost:3000/game/test
```

---

## 🎯 مزایای این معماری

✅ **Anti-Cheat:** تمام logic در backend → نمی‌شه تقلب کرد

✅ **Real-time:** هزاران نفر می‌تونن live تماشا کنن

✅ **Scalable:** Server می‌تونه صدها بازی همزمان handle کنه

✅ **Consistent:** همه بازیکنان state یکسان می‌بینن

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────┐
│           Backend Server                │
│  ┌───────────────────────────────────┐  │
│  │  Game Logic (Single Source)       │  │
│  │  - Dice Generation                │  │
│  │  - Move Validation                │  │
│  │  - Cheat Detection                │  │
│  └───────────────────────────────────┘  │
│            ↕ REST + WebSocket            │
└─────────────────────────────────────────┘
              ↕                    ↕
    ┌─────────────────┐   ┌─────────────────┐
    │   Player 1      │   │  Spectators     │
    │   (Frontend)    │   │  (Frontend)     │
    │  - Display      │   │  - Read Only    │
    │  - Send Actions │   │  - Real-time    │
    └─────────────────┘   └─────────────────┘
```

---

## 📌 یادت باشه!

1. ✅ این فایل‌ها **آماده** هستن ولی **کار نمی‌کنن**
2. ✅ بودجه صرف **ساختن infrastructure** شد، نه API واقعی
3. ✅ وقتی Backend ساختیم، فقط کافیه `.env.local` رو تنظیم کنیم
4. ✅ همه چیز **type-safe** هست با TypeScript
5. ✅ Auto-reconnect و error handling همه آماده هست

---

## 🔗 فایل‌های مرتبط

- `src/types/game-api/index.ts` - Type definitions
- `src/services/game-api.ts` - REST client
- `src/services/game-websocket.ts` - WebSocket client
- `src/hooks/use-server-game.ts` - React hook
- `SERVER_GAME_ARCHITECTURE.md` - مستندات کامل فارسی

---

**تاریخ ساخت:** 27 نوامبر 2025  
**وضعیت:** Ready for Backend Integration  
**بودجه مصرفی:** ~830 خط کد TypeScript
