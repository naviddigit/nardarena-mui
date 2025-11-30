# 📋 Player Dashboard Components Documentation

## Overview
This document describes the compact, theme-aware components created for the Player Dashboard.

---

## Components

### 1. **PlayerBalanceCard** (`player-balance-card.tsx`)
**Purpose**: Display user's USD balance (USDT) with deposit/withdraw actions

**Features**:
- ✅ Shows current balance in USD (USDT)
- ✅ Displays deposited, earned, and withdrawn amounts
- ✅ Deposit and Withdraw action buttons
- ✅ Theme-aware colors (success/error)
- ✅ Currency formatting with `fCurrency`
- ✅ Network info: TRC20 & BSC

**Props**:
```typescript
{
  title: string;              // Card title
  currentBalance: number;     // Current USD balance
  deposited: number;          // Total deposited
  earned: number;             // Total earned
  withdrawn: number;          // Total withdrawn
}
```

**Usage**:
```tsx
<PlayerBalanceCard
  title="USD Balance (USDT)"
  currentBalance={1245.50}
  earned={865.50}
  withdrawn={120.00}
  deposited={500.00}
/>
```

---

### 2. **PlayerStatWidget** (`player-stat-widget.tsx`)
**Purpose**: Display single stat with icon, trend indicator, and mini chart

**Features**:
- ✅ Iconify icon with theme colors
- ✅ Number formatting with `fNumber`
- ✅ Trend indicator (up/down arrow)
- ✅ Mini bar chart (7-day data)
- ✅ Percent change indicator
- ✅ 6 color variants (primary, secondary, info, success, warning, error)

**Props**:
```typescript
{
  title: string;              // Stat title
  total: number;              // Main value
  percent: number;            // Change percentage
  icon: string;               // Iconify icon name
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  chart: {
    categories: string[];     // Chart labels
    series: number[];         // Chart data
  };
}
```

**Usage**:
```tsx
<PlayerStatWidget
  title="Games Played"
  total={87}
  percent={12.5}
  icon="solar:gameboy-bold"
  color="primary"
  chart={{
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [10, 12, 15, 11, 14, 13, 12],
  }}
/>
```

---

### 3. **GameHistoryTable** (`game-history-table.tsx`)
**Purpose**: Display recent game history with filters

**Features**:
- ✅ Filter by game type (All/AI/Online)
- ✅ Shows date, opponent, type, score, result
- ✅ USDT rewards (no TRX/BNB)
- ✅ Color-coded result chips (win/loss)
- ✅ View details icon button
- ✅ Scrollbar component
- ✅ Theme-aware

**Data Structure**:
```typescript
type GameHistoryItem = {
  id: string;
  date: string;
  opponent: string;
  gameType: 'AI' | 'Online';
  result: 'win' | 'loss';
  score: string;
  reward: number;  // USDT amount
}
```

**Usage**:
```tsx
<GameHistoryTable />
```

---

### 4. **DashboardView** (`view.tsx`)
**Purpose**: Main player dashboard layout

**Structure**:
```
Header (Welcome + Title)
  ↓
Balance Row
  - PlayerBalanceCard (USD balance)
  - Quick Stats Card (games/winrate/streak)
  ↓
Stats Widgets Row (4 columns)
  - Games Played (primary)
  - Total Wins (success)
  - Win Rate (info)
  - Best Streak (warning)
  ↓
Game History Table
  ↓
Network Info Cards
  - USDT (TRC20) - Tron Network
  - USDT (BSC) - Binance Smart Chain
```

**Mock Data**:
```typescript
const userData = {
  usdBalance: 1245.50,        // Current balance
  depositedThisMonth: 500.00,
  withdrawnThisMonth: 120.00,
  earningsThisMonth: 865.50,
  gamesPlayed: 87,
  wins: 52,
  winRate: 59.77,
  bestStreak: 8,
}
```

---

## Key Changes from Previous Version

### ❌ Removed:
- `balance-card.tsx` (custom built)
- `stat-card.tsx` (custom built)
- `EcommerceCurrentBalance` (system component)
- `EcommerceWidgetSummary` (system component)
- TRX and BNB separate balances

### ✅ Added:
- `PlayerBalanceCard` (compact, theme-aware)
- `PlayerStatWidget` (with mini charts)
- `GameHistoryTable` (updated for USDT)
- Network info cards for TRC20 & BSC

### 🔄 Updated:
- All currency displays to USD (USDT)
- Landing page hero text to mention TRC20 & BSC
- Landing earnings section to show USDT icons
- All references from TRX/BNB to USDT

---

## Payment System Architecture

### Supported Networks:
1. **TRC20 (Tron Network)**
   - Token: USDT
   - Network: Tron
   - Icon: `cryptocurrency:usdt`
   - Color: Green (#26A17B)

2. **BSC (Binance Smart Chain)**
   - Token: USDT
   - Network: Binance Smart Chain
   - Icon: `cryptocurrency:usdt`
   - Color: Yellow/Warning

### User Flow:
```
User Dashboard
  ↓
View USD Balance (USDT)
  ↓
Click "Deposit" → Select Network (TRC20/BSC) → Get Address & QR
  ↓
Click "Withdraw" → Enter Amount → Select Network → Enter Address → Confirm
```

---

## Important Notes

⚠️ **DO NOT MODIFY** comments added to all files to prevent accidental changes

All components are:
- ✅ Theme-aware (dark/light mode)
- ✅ Responsive (xs/sm/md/lg breakpoints)
- ✅ Type-safe (TypeScript)
- ✅ Using system utilities (fCurrency, fNumber, fPercent)
- ✅ Using system components (Iconify, Chart, Scrollbar)

---

## Next Steps (TODO)

1. **Wallet Management Section**
   - Wallet address display with copy
   - Add/Edit address dialogs
   - Deposit history table
   - Withdraw form

2. **Game History Enhancement**
   - Pagination
   - Date range filters
   - Click to view replay

3. **Earnings Charts**
   - Install recharts
   - Line charts for earnings
   - Pie chart for earning types

4. **Settings & Profile**
   - Profile photo upload
   - Game preferences
   - Notification settings

---

## File Structure
```
src/sections/dashboard/
├── view.tsx                    # Main dashboard view
├── player-balance-card.tsx     # USD balance card
├── player-stat-widget.tsx      # Stat widget with chart
├── game-history-table.tsx      # Game history table
├── ecommerce-current-balance.tsx  # (Legacy - not used)
├── ecommerce-widget-summary.tsx   # (Legacy - not used)
└── index.ts                    # Exports
```

---

**Last Updated**: November 30, 2025
**Author**: GitHub Copilot (Claude Sonnet 4.5)
**Status**: ✅ Completed - Ready for Wallet Management
