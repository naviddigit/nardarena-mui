# Backgammon Game Logic Documentation

## Overview
This document explains the backgammon game logic found in `nard-logic/game.js` for easy understanding and implementation in React/TypeScript with Material-UI.

## Board Structure

### Standard Backgammon Board
- **24 Points** (triangles): Numbered 0-23
- **Bar**: Middle divider where hit checkers are placed
- **Off Area**: Where checkers are removed (bearing off)
- **Dimensions**: Tournament standard ratio is **1.25:1** (width:height)

### Point Numbering System
```
Top (Points 12-23):    [23][22][21][20][19][18] | BAR | [17][16][15][14][13][12]
Bottom (Points 0-11):  [11][10][9][8][7][6]     | BAR | [5][4][3][2][1][0]
```

### Board Layout Calculations (from game.js)
```javascript
// Tournament standard: 1.25:1 ratio
const targetRatio = 1.25;
const frameWidth = boardWidth * 0.04;  // Border frame
const barWidth = innerWidth / 14;      // Middle bar
const playableWidth = (innerWidth - barWidth) / 2;  // Each side
const pointWidth = playableWidth / 6;  // Width of each triangle
const pointHeight = innerHeight * 0.40; // Triangle height
const checkerRadius = pointWidth * 0.44; // Checker size
```

## Game State

### Core Data Structure
```javascript
{
  board: Array(24) -> [{ count: number, color: 'white'|'black'|null }],
  bar: { white: number, black: number },
  off: { white: number, black: number },
  currentPlayer: 'white' | 'black',
  dice: number[],
  usedDice: number[],
  selected: number | null,
  validMoves: [{ from: number, to: number, distance: number }],
  moveHistory: [],
  animations: []
}
```

## Key Game Logic

### 1. Initial Setup
- Each player starts with 15 checkers
- Standard starting position (needs to be defined)

### 2. Move Validation
- Check if source point has player's checker
- Check if destination is valid:
  - Empty point
  - Own checker on point
  - Opponent has only 1 checker (can hit)
- Distance must match available dice value

### 3. Move Types
- **Regular Move**: Move checker forward by dice value
- **Hit**: Land on opponent's single checker → send to bar
- **Enter from Bar**: Must enter before other moves
- **Bear Off**: Remove checkers when all are in home board

### 4. Turn Flow
1. Roll dice
2. If doubles → use value 4 times
3. Select checker
4. Show valid destinations
5. Make move(s)
6. End turn when no moves left

## Component Architecture Plan

### React Components Structure
```
GameBoard/
├── BoardContainer.tsx          // Main container with theme
├── BoardFrame.tsx              // Outer frame with Material-UI Card
├── PointTriangle.tsx           // Individual point (using Box + SVG)
├── Checker.tsx                 // Single checker piece (Box with styling)
├── BarArea.tsx                 // Middle bar component
├── OffArea.tsx                 // Bearing off area
├── DiceRoller.tsx              // 3D dice with Cannon.js + Three.js
└── GameControls.tsx            // Action buttons
```

### Material-UI Implementation Strategy

#### Point Triangle Component
```typescript
// Use Box with clip-path for triangle shape
<Box
  sx={{
    width: pointWidth,
    height: pointHeight,
    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', // Upward triangle
    bgcolor: isLight ? 'background.paper' : 'grey.800',
    position: 'absolute',
    // ... positioning
  }}
/>
```

#### Checker Component
```typescript
// Use Box with border radius for circular checkers
<Box
  sx={{
    width: checkerRadius * 2,
    height: checkerRadius * 2,
    borderRadius: '50%',
    bgcolor: color === 'white' ? 'common.white' : 'grey.900',
    border: 2,
    borderColor: color === 'white' ? 'grey.300' : 'grey.700',
    boxShadow: (theme) => theme.shadows[3],
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: (theme) => theme.shadows[8],
    }
  }}
/>
```

#### Board Container
```typescript
// Use Card from Material-UI with gradient background
<Card
  sx={{
    position: 'relative',
    aspectRatio: '1.25/1', // Tournament standard
    maxWidth: '90vw',
    maxHeight: '90vh',
    background: (theme) => 
      theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #2c1810 0%, #1a0d06 100%)'
        : 'linear-gradient(135deg, #8b6f47 0%, #6b4423 100%)',
    p: 2,
    overflow: 'hidden',
  }}
>
```

## Dice Integration

### Libraries Needed
```bash
npm install three @types/three cannon-es @types/cannon-es
```

### Dice Component Strategy
- Use existing `dice.js` Cannon.js + Three.js setup
- Integrate into React with useEffect and useRef
- Mount Three.js scene in separate container
- Trigger rolls via React state

## Spectator Mode Requirements

### Real-time Updates (Socket.IO)
```typescript
interface GameState {
  gameId: string;
  players: {
    white: { id: string; name: string };
    black: { id: string; name: string };
  };
  board: BoardState;
  currentPlayer: 'white' | 'black';
  spectators: number;
  lastMove?: Move;
}

// Events
socket.on('game:state-update', (state: GameState) => {});
socket.on('game:move', (move: Move) => {});
socket.on('game:dice-roll', (dice: number[]) => {});
```

### UI for Spectators
- Show player names and avatars
- Display current turn
- Show dice roll results
- Highlight last move
- Spectator count badge
- Chat panel (optional)

## Color Schemes (Match Template Theme)

### Light Mode
```typescript
{
  boardBg: 'linear-gradient(135deg, #8b6f47 0%, #6b4423 100%)',
  pointLight: '#f8ead8',
  pointDark: '#8b2e2e',
  checkerWhite: '#ffffff',
  checkerBlack: '#1a1a1a',
  bar: '#5a3a1a',
}
```

### Dark Mode
```typescript
{
  boardBg: 'linear-gradient(135deg, #2c1810 0%, #1a0d06 100%)',
  pointLight: '#4a3428',
  pointDark: '#6b1f1f',
  checkerWhite: '#e8e8e8',
  checkerBlack: '#0d0d0d',
  bar: '#3a2a1a',
}
```

## Animation Strategy

### Using Framer Motion (already in template)
```typescript
import { motion } from 'framer-motion';

// Animated checker movement
<motion.div
  initial={{ x: fromX, y: fromY }}
  animate={{ x: toX, y: toY }}
  transition={{ duration: 0.3, ease: 'easeInOut' }}
>
  <Checker />
</motion.div>
```

## Next Steps

1. ✅ Document logic structure
2. ⏳ Create base board layout with Material-UI
3. ⏳ Implement point and checker components
4. ⏳ Add click handlers and move validation
5. ⏳ Integrate 3D dice roller
6. ⏳ Add Socket.IO for multiplayer
7. ⏳ Implement spectator mode
8. ⏳ Add animations and polish
