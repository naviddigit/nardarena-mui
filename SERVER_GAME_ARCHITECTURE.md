# Server-Authoritative Game Architecture

## 🎯 هدف

سیستمی که:
- ✅ **تمام logic در backend** اجرا میشه
- ✅ **Frontend فقط نمایش** میده
- ✅ **Anti-cheat built-in** داره
- ✅ **Real-time sync** برای هزاران تماشاچی
- ✅ **Hack-proof** هست

---

## 📐 معماری

```
┌─────────────────────────────────────────────────────────┐
│                        Backend                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │           Single Source of Truth                  │ │
│  │  - Board State                                    │ │
│  │  - Pre-rolled Dice (Anti-cheat)                   │ │
│  │  - Valid Moves Calculation                        │ │
│  │  - Move Validation                                │ │
│  │  - Cheat Detection                                │ │
│  └───────────────────────────────────────────────────┘ │
│           ↓ WebSocket (Real-time)                       │
└─────────────────────────────────────────────────────────┘
           ↓                           ↓
┌──────────────────┐      ┌──────────────────────────────┐
│   Player 1       │      │   Spectators (1000s)         │
│   (Frontend)     │      │   (Frontend)                 │
│  - Display Only  │      │  - Read-only View            │
│  - Send Actions  │      │  - No Actions                │
│  - Wait for OK   │      │  - Real-time Updates         │
└──────────────────┘      └──────────────────────────────┘
```

---

## 🔒 Security Flow

### 1️⃣ Dice Roll (Pre-rolled by Server)
```typescript
// ❌ BAD (Frontend generates - Hackable)
const dice = [Math.random() * 6, Math.random() * 6];

// ✅ GOOD (Server generates)
Client:  "REQUEST_ROLL" →
Server:  Generates [3, 5] → Stores → Broadcasts
Client:  Displays [3, 5]
```

### 2️⃣ Move Validation (Server checks everything)
```typescript
// Client sends move request
Client:  "MOVE from:5 to:3 die:2" →

// Server validates
Server:  ✓ Is it your turn?
         ✓ Do you have dice value 2?
         ✓ Is point 5 your checker?
         ✓ Is point 3 valid destination?
         ✓ Is move in validMoves list?
         
         → If ALL true: Accept & Broadcast
         → If ANY false: Reject + Log (Potential cheat)

Client:  Receives new state OR error
```

### 3️⃣ Cheat Detection
```typescript
// Server tracks suspicious behavior
if (invalidMoveAttempts > 3) {
  return {
    success: false,
    code: 'CHEAT_DETECTED',
    error: 'Multiple invalid moves detected'
  };
  // Can ban player, log to admin, etc.
}
```

---

## 📡 استفاده در Frontend

### نصب

```typescript
import { useServerGame } from 'src/hooks/use-server-game';

function GamePage() {
  const {
    gameState,        // State از server
    isConnected,      // Connection status
    isLoading,        // Loading state
    rollDice,         // Request dice roll
    makeMove,         // Request move
    undoMove,         // Request undo
    endTurn,          // End turn
  } = useServerGame({
    gameId: 'game-123',
    playerId: 'player-456',
    isSpectator: false,
    onError: (error) => console.error(error),
    onGameFinished: (winner) => console.log('Winner:', winner),
  });

  // Display game state
  return (
    <BackgammonBoard
      boardState={gameState?.board}
      onPointClick={(point) => {
        // Request move (server validates)
        makeMove(selectedPoint, point, selectedDie);
      }}
    />
  );
}
```

---

## 🎮 Flow مثال

### Scenario: بازیکن می‌خواد تاس بزنه

```
1. User clicks "Roll Dice"
   ↓
2. Frontend: rollDice()
   ↓
3. API Call: POST /api/game/123/action
   Body: { type: 'REQUEST_ROLL', playerId: '456' }
   ↓
4. Backend:
   - Check: Is it player's turn? ✓
   - Check: Can player roll? ✓
   - Generate: dice = [4, 2]
   - Calculate: validMoves = [...]
   - Store: gameState.dice = [4, 2]
   - Broadcast via WebSocket to ALL connected clients
   ↓
5. Frontend (ALL clients including spectators):
   - Receive: GAME_STATE_UPDATE event
   - Update: gameState with new dice
   - Display: Dice animation [4, 2]
```

### Scenario: بازیکن می‌خواد حرکت کنه

```
1. User clicks point 5, then point 3
   ↓
2. Frontend: makeMove(5, 3, 2)
   ↓
3. API Call: POST /api/game/123/action
   Body: { 
     type: 'REQUEST_MOVE',
     playerId: '456',
     from: 5,
     to: 3,
     die: 2
   }
   ↓
4. Backend Validation:
   - Is it player 456's turn? ✓
   - Does player have die value 2? ✓
   - Is point 5 player's checker? ✓
   - Is point 3 valid destination? ✓
   - Is this move in validMoves? ✓
   
   ALL PASS → Execute move
   ↓
5. Backend:
   - Move checker from 5 to 3
   - Check for hit (opponent single checker)
   - Update board state
   - Remove die 2 from available dice
   - Recalculate valid moves
   - Broadcast new state
   ↓
6. Frontend (ALL clients):
   - Receive: MOVE_MADE event
   - Animate: Checker moving
   - Update: Board state
```

### Scenario: هکر تلاش می‌کنه تقلب کنه

```
Hacker modifies frontend code:
- Changes dice [1,1] to [6,6] in UI
- Tries to move with die value 6

Frontend: makeMove(5, -1, 6)  // Bear off with 6
   ↓
Backend:
- Check available dice: [1, 1]  ❌
- Check if 6 exists: NO
- Check move validity: FAIL

Response: {
  success: false,
  code: 'CHEAT_DETECTED',
  error: 'Die value 6 not available'
}
   ↓
Backend logs:
- Player 456 attempted invalid move
- Increment suspicion counter
- If counter > 3: Ban player

Frontend:
- Displays error
- NO state change (server didn't accept)
```

---

## 🔥 مزایا

### 1. Anti-Cheat
```
❌ Hacker changes frontend dice → Server rejects
❌ Hacker skips validation → Server rejects
❌ Hacker modifies board state → Server ignores
✅ Only server state matters
```

### 2. Real-time Spectating
```
1000+ spectators watch same game
- No extra load (WebSocket broadcast)
- Always in sync
- No cheating possible
```

### 3. Consistent Experience
```
Player 1 phone:  Shows move at 12:34:56.123
Player 2 tablet: Shows move at 12:34:56.125
Spectator PC:    Shows move at 12:34:56.127

ALL see same state (2ms difference from network)
```

### 4. Easy Recovery
```
Player disconnects?
→ Reconnect → Fetch latest state from server
→ Continue playing

Everything synced automatically
```

---

## 🛠️ Backend Requirements

Backend باید این endpoints رو داشته باشه:

### REST API
```
POST   /api/game/create              - ساخت بازی جدید
GET    /api/game/:gameId/state       - دریافت state
POST   /api/game/:gameId/action      - ارسال action
POST   /api/game/:gameId/join        - پیوستن به بازی
POST   /api/game/:gameId/spectate    - تماشای بازی
POST   /api/game/:gameId/leave       - خروج از بازی
```

### WebSocket
```
ws://host/api/game/:gameId/ws?playerId=xxx&role=player

Events to broadcast:
- GAME_STATE_UPDATE  (هر تغییر state)
- DICE_ROLLED        (تاس ریخته شد)
- MOVE_MADE          (حرکت انجام شد)
- TURN_ENDED         (نوبت تمام شد)
- GAME_FINISHED      (بازی تمام شد)
- ERROR              (خطا)
```

---

## 📝 Backend Pseudocode

```typescript
// Server-side game logic
class GameServer {
  private games: Map<GameId, ServerGameState>;

  // Roll dice (server generates)
  rollDice(gameId: GameId, playerId: PlayerId) {
    const game = this.games.get(gameId);
    
    // Validate
    if (game.currentPlayer !== playerId) {
      return { success: false, error: 'NOT_YOUR_TURN' };
    }
    
    // Generate random dice (server-side)
    const dice = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
    
    // Calculate valid moves
    const validMoves = this.calculateValidMoves(
      game.board,
      game.currentPlayer,
      dice
    );
    
    // Update state
    game.dice = { values: dice, usedValues: [], remainingValues: dice };
    game.validMoves = validMoves;
    
    // Broadcast to all
    this.broadcast(gameId, {
      type: 'DICE_ROLLED',
      player: game.currentPlayer,
      values: dice,
    });
    
    this.broadcast(gameId, {
      type: 'GAME_STATE_UPDATE',
      gameState: game,
    });
    
    return { success: true, gameState: game };
  }

  // Make move (server validates)
  makeMove(gameId: GameId, playerId: PlayerId, from: number, to: number, die: number) {
    const game = this.games.get(gameId);
    
    // Validate turn
    if (game.currentPlayer !== playerId) {
      this.logSuspiciousActivity(playerId, 'WRONG_TURN');
      return { success: false, error: 'NOT_YOUR_TURN' };
    }
    
    // Validate die value
    if (!game.dice.remainingValues.includes(die)) {
      this.logSuspiciousActivity(playerId, 'INVALID_DIE');
      return { success: false, code: 'CHEAT_DETECTED', error: 'Invalid die' };
    }
    
    // Validate move
    const isValid = game.validMoves.some(
      m => m.from === from && m.to === to && m.die === die
    );
    
    if (!isValid) {
      this.logSuspiciousActivity(playerId, 'INVALID_MOVE');
      return { success: false, code: 'CHEAT_DETECTED', error: 'Invalid move' };
    }
    
    // Execute move
    const wasHit = this.executeMove(game, from, to, die);
    
    // Broadcast
    this.broadcast(gameId, {
      type: 'MOVE_MADE',
      player: playerId,
      from,
      to,
      die,
      wasHit,
    });
    
    this.broadcast(gameId, {
      type: 'GAME_STATE_UPDATE',
      gameState: game,
    });
    
    return { success: true, gameState: game };
  }
}
```

---

## ✅ Checklist پیاده‌سازی

### Frontend:
- ✅ Types defined (game-api/index.ts)
- ✅ WebSocket service (game-websocket.ts)
- ✅ API service (game-api.ts)
- ✅ React hook (use-server-game.ts)
- ⏳ Integration with existing UI

### Backend (نیاز به پیاده‌سازی):
- ⏳ REST API endpoints
- ⏳ WebSocket server
- ⏳ Game state management
- ⏳ Move validation logic
- ⏳ Dice generation
- ⏳ Cheat detection
- ⏳ Database persistence

---

## 🚀 Next Steps

1. **Backend API:** پیاده‌سازی endpoints
2. **Testing:** تست anti-cheat
3. **Performance:** Load testing با 1000 spectator
4. **Monitoring:** Logging & analytics
5. **Deployment:** Production setup

آماده‌ای شروع کنیم؟
