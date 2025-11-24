# Nard Arena - Development Guide

## 🚀 Run in Development Mode

```bash
npm run dev
```

The application will start at: `http://localhost:8083`

## 📂 Project Structure

- `src/app/` - Next.js app router pages
- `src/components/` - Reusable React components
  - `dice-roller/` - 3D dice roller with Three.js + Cannon-ES
  - `backgammon-board/` - Material-UI backgammon board
  - `settings/` - Theme and settings management
- `src/hooks/` - Custom React hooks
  - `use-game-state.ts` - Game state management
- `src/sections/` - Page sections
  - `dashboard/` - Main dashboard
  - `game/` - Game mode cards
- `public/assets/` - Static assets (images, sounds, icons)

## 🎮 How to Play

1. Go to: `http://localhost:8083/game/ai`
2. Click "Roll Dice" button
3. Click on your checker (white pieces) - if it has valid moves, it will be highlighted
4. Valid destination points will show with **green border** and lighter background
5. Click on a valid destination to move
6. Checker moves and used dice value is removed
7. Continue until no dice left, then turn switches

## 🎨 Theme Toggle

- Use the **Settings Panel** (gear icon in top-right) to switch between light/dark mode
- Dark mode toggle is in the first row of settings
- Theme persists using template's settings system (localStorage + cookies)

## 🎲 Features Implemented

✅ 3D Dice Roller with realistic physics (Cannon-ES)
✅ Material-UI Backgammon Board (1.25:1 tournament ratio)
✅ **Valid moves calculation** (based on nard-logic patterns)
✅ **Visual highlighting** for valid destination points
✅ **Hit detection** (opponent checker sent to bar)
✅ **Bearing off** logic when all checkers in home board
✅ Dark/Light theme via Settings Panel (template standard)
✅ Dice roll sound effect (from nard-logic assets)
✅ Smooth checker transitions with cubic-bezier
✅ Selected point highlighting (blue border)
✅ Turn switching when no moves left

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material-UI v5
- **Template**: Minimal Template v5.7.0
- **3D Graphics**: Three.js
- **Physics**: Cannon-ES
- **Language**: TypeScript
- **Auth**: JWT (template's built-in)

## 📝 Development Notes

- Template uses custom theme system with CSS variables (`theme.vars.palette`)
- All components follow template patterns (use `'use client'` for client-only components)
- **IMPORTANT**: Always use template's built-in systems (Settings, Auth, Routing)
- NO Persian text in UI code (only in chat/docs)
- Board uses Material-UI Box with `clipPath` for triangles (NOT canvas)
- Dice sound: `/public/assets/sounds/dice-roll.mp3` (from nard-logic)
- **SSR Fix**: Inline all dynamic styles in `sx` prop to prevent hydration mismatch
- Use `alpha()` for transparent colors instead of rgba()
- Follow `nard-logic/game.js` patterns for game logic

## 🐛 Fixed Issues

✅ SSR hydration warning - added `'use client'` directives
✅ Dark mode not working - use Settings Panel instead of custom toggle
✅ Checkers not moving - implemented proper move validation
✅ No visual feedback - added valid destinations highlighting
✅ Hover effect too aggressive - removed scale transform

## 📚 Learning Resources

- Template Docs: Check `/next-ts/src/sections/_examples/` for component patterns
- Animations: See `src/components/animate/` for framer-motion usage
- Theme System: Study `src/components/settings/` for theme management
- Board Logic: Read `nard-logic/game.js` for backgammon rules

## 📦 Next Steps

- [ ] Complete move validation (hit, block, bearing off)
- [ ] AI opponent implementation
- [ ] Socket.IO for multiplayer
- [ ] Tournament system
- [ ] Spectator mode
