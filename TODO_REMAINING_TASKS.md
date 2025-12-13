# ✅ کارهای انجام شده و باقی‌مانده

## 🎯 کارهای انجام شده در این مرحله:

### 1. فیکس Balance Card ✅
**مشکل:** فاصله‌بندی ضعیف، Typography بهم ریخته
**راه‌حل:**
- افزایش فاصله‌ها (spacing: 2 → 2.5)
- جدا کردن مبلغ از واحد پول (خط جداگانه)
- بزرگتر کردن فونت Total Balance
- بهبود Typography برای Main Wallet و Gift Pool
- افزایش ارتفاع divider (32 → 40)

### 2. فیکس آواتار ✅
**مشکل:** `user?.photoURL` وجود نداره در type
**راه‌حل:**
- تغییر `photoURL` به `avatar` (مطابق با AuthType)
- اضافه کردن fallback: `username[0]` اگر `displayName` نبود
- اضافه کردن `bgcolor: 'primary.main'` برای حروف
- فیکس در 2 جا: home-view.tsx و profile-view.tsx

---

## 📋 لیست کامل کارهای باقی‌مانده:

### 🔴 فوری (High Priority):

#### 1. اتصال API به جای Mock Data
**فایل‌های نیازمند تغییر:**
- `home-view.tsx` → باید از API موجودی بگیره
- `wallet-view.tsx` → لیست تراکنش‌ها از API
- `friends-view.tsx` → لیست دوستان از API
- `game-history-view.tsx` → تاریخچه بازی‌ها از API
- `live-games-view.tsx` → بازی‌های زنده از WebSocket
- `rankings-view.tsx` → جدول امتیازات از API

**نمونه کد برای Home:**
```typescript
// Replace this:
const mainBalance = 1250.00;
const giftPoolBalance = 45.00;

// With this:
const { data: wallet } = useQuery({
  queryKey: ['wallet'],
  queryFn: () => walletAPI.getBalance(),
});
const mainBalance = wallet?.mainBalance ?? 0;
const giftPoolBalance = wallet?.giftPoolBalance ?? 0;
```

#### 2. اضافه کردن Loading States
**کامپوننت‌های نیازمند:**
- Skeleton برای Balance Card
- Skeleton برای Transaction Table
- Skeleton برای Game History Cards
- Loading Spinner برای Live Games

**نمونه:**
```typescript
{loading ? (
  <Skeleton variant="rectangular" height={200} />
) : (
  <BalanceCard ... />
)}
```

#### 3. Error Handling
- اضافه کردن Error Boundary
- پیام‌های خطا برای API failures
- Retry mechanism برای failed requests
- Fallback UI برای network errors

---

### 🟡 متوسط (Medium Priority):

#### 4. Deposit/Withdraw Flow
**فایل‌های نیازمند ساخت:**
- `deposit-modal.tsx` → Modal برای Deposit با انتخاب Network (BSC/TRX)
- `withdraw-modal.tsx` → Modal برای Withdraw با ولیدیشن آدرس
- Integration با Crypto Wallets (MetaMask, TronLink)

#### 5. Real-time Updates با WebSocket
**پیاده‌سازی:**
- اتصال WebSocket برای Live Games
- Update موجودی هنگام برد/باخت
- نوتیفیکیشن برای چالش دوستان
- Update online/offline status

#### 6. بهبود Quick Actions
- اضافه کردن Recent Activity در home
- نمایش Last Game Result
- اضافه کردن Daily Rewards section
- Notification Badge برای دعوت‌های pending

---

### 🟢 کم‌اولویت (Low Priority):

#### 7. نسخه Desktop (Responsive)
**تغییرات لازم:**
- ساخت `DesktopLayout` با Side Navigation
- Breakpoint handling در MobileLayout
- Grid layout برای Desktop (2-3 columns)
- بزرگتر کردن کارت‌ها برای صفحه بزرگ

#### 8. Animations & Transitions
- Page transition animations
- Card hover effects
- Number count-up animation برای Balance
- Skeleton animations
- Pull-to-refresh در موبایل

#### 9. بهبود Profile Section
- اضافه کردن Email Verification Card
- Change Password Form
- 2FA Toggle (Two-Factor Authentication)
- Upload Avatar functionality
- Display Name edit

#### 10. Game Features
- Spectator Mode برای Live Games
- Game Replay Player
- Save Favorite Games
- Share Game Link
- Tournament Bracket View

#### 11. Social Features
- Add Friend by Username
- Send Friend Request
- Accept/Decline Requests
- Challenge Friend Modal
- Private Chat (optional)

#### 12. Settings Drawer - کامل کردن
- Theme Switcher (Light/Dark)
- Language Settings (English/other)
- Sound Volume Controls
- Notification Preferences
- Privacy Settings

---

## 🔍 بررسی SSR vs CSR:

### وضعیت فعلی:
همه کامپوننت‌های Dashboard دارای **'use client'** هستند:
```typescript
'use client'; // ❌ Client-Side Rendering
```

### مشکلات:
1. **Bundle Size بزرگ:** همه JS روی کلاینت لود میشه
2. **Initial Load کند:** کاربر باید منتظر بمونه تا JS دانلود شه
3. **SEO ضعیف:** محتوا در سرور رندر نمیشه
4. **هیدریشن سنگین:** React باید همه رو دوباره hydrate کنه

### راه‌حل پیشنهادی:

#### ✅ کامپوننت‌هایی که باید Server Component باشن:
```typescript
// ❌ BEFORE (Client):
'use client';
export default function GameHistoryView() { ... }

// ✅ AFTER (Server):
// Remove 'use client'
export default async function GameHistoryView() {
  const games = await gameAPI.getHistory(); // Fetch on server
  return <GameHistoryList games={games} />;
}
```

**فایل‌هایی که میتونن Server باشن:**
- `page.tsx` files (route wrappers)
- Static sections without interaction
- Layout components without state

#### ✅ کامپوننت‌هایی که باید Client باشن:
```typescript
'use client'; // ✅ لازم چون useState داره

export function BalanceCard() {
  const [open, setOpen] = useState(false); // ❌ بدون 'use client' کار نمیکنه
  ...
}
```

**فایل‌هایی که باید Client بمونن:**
- کامپوننت‌های با `useState`, `useEffect`
- کامپوننت‌های با Event Handlers (`onClick`, `onChange`)
- کامپوننت‌های با `useRouter`, `useSearchParams`
- Modal, Drawer, Dialog components

### بهینه‌سازی پیشنهادی:

```typescript
// 📁 app/dashboard/page.tsx (Server Component)
import { Suspense } from 'react';
import { BalanceCard } from '@/components/balance-card';

export default async function DashboardPage() {
  // Fetch data on server
  const wallet = await walletAPI.getBalance();
  
  return (
    <Suspense fallback={<BalanceCardSkeleton />}>
      <BalanceCard data={wallet} /> {/* Client component with pre-fetched data */}
    </Suspense>
  );
}

// 📁 components/balance-card.tsx (Client Component)
'use client';

export function BalanceCard({ data }) {
  // Only interactive parts are client-side
  const [modalOpen, setModalOpen] = useState(false);
  
  return (
    <Card>
      {/* Pre-rendered content from server */}
      <Typography>${data.balance}</Typography>
      
      {/* Interactive button (client-side) */}
      <Button onClick={() => setModalOpen(true)}>Deposit</Button>
      
      {modalOpen && <DepositModal />}
    </Card>
  );
}
```

### مزایای این روش:
- ✅ **SEO بهتر:** محتوا در سرور رندر میشه
- ✅ **Initial Load سریع‌تر:** HTML آماده از سرور میاد
- ✅ **Bundle Size کوچک‌تر:** فقط بخش‌های تعاملی client-side هستن
- ✅ **بهینه برای موبایل:** کمتر JS روی دستگاه کاربر اجرا میشه

---

## 📊 اولویت‌بندی کارها:

### این هفته (Week 1):
1. ✅ فیکس Balance Card Typography
2. ✅ فیکس آواتار
3. 🔄 اتصال API برای Balance
4. 🔄 اضافه کردن Loading States
5. 🔄 Deposit/Withdraw Modals

### هفته بعد (Week 2):
6. WebSocket برای Live Games
7. Transaction History API
8. Game History API
9. Rankings API
10. Error Handling

### آینده (Future):
11. Desktop Layout
12. Animations
13. Profile Completion
14. Social Features
15. SSR Optimization

---

## 🎯 توصیه نهایی:

**الان باید روی چی کار کنم؟**
1. **API Integration** → جایگزینی Mock Data با API واقعی
2. **Loading States** → تجربه کاربری بهتر
3. **Deposit/Withdraw** → قابلیت اصلی کیف پول

**SSR Optimization رو بذار برای بعد** - الان کار میکنه و میتونیم بعداً بهینه‌سازی کنیم.

---

**وضعیت فعلی:** همه چی کار میکنه ولی با Mock Data
**هدف بعدی:** اتصال به Backend API و Real-time Updates
