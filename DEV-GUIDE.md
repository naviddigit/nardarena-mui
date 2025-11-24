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
3. Click on your checker (white pieces)
4. Click on destination point (distance must match dice value)
5. Checker moves with smooth animation!

## 🎨 Theme Toggle

- Click the sun/moon icon in top-right to switch between light/dark mode
- Theme persists in localStorage

## 🎲 Features Implemented

✅ 3D Dice Roller with realistic physics
✅ Material-UI Backgammon Board (1.25:1 ratio)
✅ Basic game logic (click to select, click to move)
✅ Dark/Light theme toggle
✅ Dice roll sound effect
✅ Smooth checker transitions
✅ Selected point highlighting

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material-UI v5
- **Template**: Minimal Template v5.7.0
- **3D Graphics**: Three.js
- **Physics**: Cannon-ES
- **Language**: TypeScript
- **Auth**: JWT (template's built-in)

## 📝 Development Notes

- Template uses custom theme system with CSS variables
- All components follow template patterns (no custom UI that doesn't match)
- NO Persian text in UI code (only in chat/docs)
- Board uses Material-UI Box with clipPath for triangles (NOT canvas)
- Dice sound: `/public/assets/sounds/dice-roll.mp3` (from nard-logic)

## 🐛 Known Issues

- Move validation is basic (only checks distance)
- No hit detection yet
- No bearing off logic
- AI opponent not implemented yet
- Socket.IO not connected yet

## 📦 Next Steps

- [ ] Complete move validation (hit, block, bearing off)
- [ ] AI opponent implementation
- [ ] Socket.IO for multiplayer
- [ ] Tournament system
- [ ] Spectator mode
