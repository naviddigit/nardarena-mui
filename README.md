# NardAria Frontend - AI Backgammon Game

Next.js 14 frontend application for NardAria AI backgammon platform with Material-UI design system.

## Tech Stack

- **Framework:** Next.js 14.2.15 (App Router)
- **UI Library:** Material-UI v6
- **State Management:** React Context + Zustand
- **Styling:** Emotion CSS-in-JS
- **Forms:** React Hook Form + Yup validation
- **HTTP Client:** Axios
- **Real-time:** Socket.IO client
- **3D Graphics:** Three.js + React Three Fiber
- **Charts:** ApexCharts + Recharts
- **Animations:** Framer Motion

## Prerequisites

- Node.js 20.x (Recommended)
- Backend API running on `http://localhost:3000`

## Installation

**Using Yarn (Recommended)**

```sh
yarn install
yarn dev
```

**Using Npm**

```sh
npm i
npm run dev
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── game/ai/           # AI game page (main game interface)
│   ├── auth/              # Authentication pages (login, register)
│   └── dashboard/         # Admin dashboard
├── components/            # Reusable UI components
│   ├── snackbar/         # Toast notifications (sonner)
│   ├── loading-screen/   # Loading states
│   └── ...
├── contexts/             # React Context providers
│   └── game-context.tsx  # Game state management
├── services/             # API service layer
│   ├── api.ts           # Axios instance & interceptors
│   └── gameService.ts   # Game API calls
├── auth/                # Authentication logic
│   └── context/jwt/     # JWT token management
├── sections/            # Page-specific components
│   ├── game/           # Game UI sections
│   └── admin/          # Admin panel sections
└── theme/              # MUI theme customization
```

## Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Key Features

### 🎮 AI Game System
- **Real-time gameplay** with WebSocket synchronization
- **3D Board** rendering with Three.js
- **Chess-clock timer** with anti-cheat validation
- **AI opponent** with configurable difficulty
- **Move validation** and game state persistence
- **Opening roll** system with anti-cheat

### 🔐 Authentication
- JWT token-based authentication
- Silent token refresh on expiration
- Role-based access control (User/Admin)
- Secure logout with token cleanup

### 📊 Admin Dashboard
- User management with pagination/sorting/search
- Game statistics and analytics
- Real-time monitoring
- Security controls (admin cannot be banned)

### 🎨 UI/UX
- Material-UI design system
- Dark/Light theme toggle
- Responsive layout (mobile-first)
- Toast notifications (sonner)
- Loading states and skeletons

## Important Notes

### 🚨 Snackbar Component
- **Version:** sonner@1.5.0 (MUST match template version)
- **DO NOT** upgrade to sonner@2.x - it will break styling
- Custom wrapper: `src/components/snackbar/snackbar-provider.tsx`

### 🔑 Authentication Flow
- Token expiration redirects to login **WITHOUT alert popup**
- Modified: `src/auth/context/jwt/utils.ts` - removed alert()
- Silent redirect preserves user experience

### 🛡️ Admin Panel Security
- "Make Admin" option removed from UI
- Only one super admin allowed (enforced by backend)
- Admin users cannot be banned or suspended
- Backend validation: `nard-backend/src/modules/admin/admin.service.ts`

### 📡 API Integration
- **Base URL:** `/api` (proxied to backend)
- **Users API:** `GET /api/admin/users?page&limit&search&sortBy&sortOrder`
- **Sorting fields:** displayName, email, role, status, createdAt
- **Pagination:** Server-side with cursor-based navigation

### 🎲 Game Page (`/game/ai`)
- **File:** `src/app/game/ai/page.tsx` (2117 lines - LOCKED ⛔)
- **State Management:** React Context + useState
- **Timer Logic:** Chess-clock with elapsed time calculation
- **Dice System:** Backend-controlled with frontend visualization
- **Move Validation:** Client-side check + server-side enforcement

## Build & Deploy

```sh
# Development
yarn dev

# Production build
yarn build

# Start production server
yarn start

# PM2 deployment (with ecosystem.config.js)
pm2 start ecosystem.config.js --only nard-frontend
```

## Development Scripts

```sh
# Run with nodemon (auto-restart)
npm run dev:nodemon

# Lint code
npm run lint

# Format code
npm run prettier

# Type checking
npm run type-check
```

## PM2 Process Management

```sh
# Start frontend
pm2 start ecosystem.config.js --only nard-frontend

# Monitor logs
pm2 logs nard-frontend

# Restart
pm2 restart nard-frontend

# Stop
pm2 stop nard-frontend
```

## Related Documentation

- **Game Logic:** `/GAME_LOGIC_COMPLETE.md` (Root folder)
- **Project Summary:** `PROJECT_SUMMARY_FOR_AI.md` (This folder)
- **Backend API:** `../nard-backend/README.md`

## Template Credits

Based on Minimal UI Dashboard template v6.0.1  
- **Demo:** https://next.minimals.cc  
- **Docs:** https://docs.minimals.cc

---

**⚠️ NOTE:**  
When copying folders, remember to include hidden files like `.env.local` - they contain critical environment variables.
