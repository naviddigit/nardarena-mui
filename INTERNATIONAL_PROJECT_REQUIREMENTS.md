# 🌍 International Project Requirements

## Currency & Financial Standards

### ✅ USDT Only - No Fiat Currencies
- **Currency**: USDT (Tether USD) - Stablecoin
- **Networks Supported**:
  - BSC (Binance Smart Chain / BEP-20)
  - TRX (Tron / TRC-20)
- **No Rial/Toman**: This is an international platform
- **Format**: Always show with $ symbol: `$1,250.00 USDT`
- **Decimals**: 2 decimal places for display

### Number Formatting
```typescript
// ✅ CORRECT
num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
// Output: "1,250.00"

// ❌ WRONG - NO PERSIAN NUMBERS
num.toLocaleString('fa-IR')
// Would output: "۱,۲۵۰"
```

## Language & Typography

### ✅ English Only - No Persian/Farsi
- **UI Language**: English
- **Code Comments**: English
- **User-facing Text**: English
- **No RTL Direction**: LTR only (Left-to-Right)
- **No Persian Fonts**: Use standard international fonts

### Examples
```typescript
// ✅ CORRECT
currency = 'USDT'
<Typography>Total Balance</Typography>

// ❌ WRONG - NO FARSI
currency = 'تومان'
<Typography>موجودی کل</Typography>
```

## Date & Time Standards

### ✅ Gregorian Calendar Only
- **Calendar**: Gregorian (International standard)
- **No Jalali/Shamsi**: Persian calendar not used
- **Format**: ISO 8601 or locale-based English dates
- **Examples**:
  - `Dec 12, 2024`
  - `2024-12-12`
  - `2 mins ago`
  - `1 hour ago`

### Date Formatting
```typescript
// ✅ CORRECT
new Date().toLocaleDateString('en-US')
// Output: "12/12/2024"

// ❌ WRONG - NO PERSIAN DATES
new Date().toLocaleDateString('fa-IR')
// Would output: "۱۴۰۳/۹/۲۲"
```

## Summary Checklist

### Before Committing Code:
- [ ] No Persian/Farsi text in UI
- [ ] No `toLocaleString('fa-IR')`
- [ ] No `direction: 'rtl'` in styles
- [ ] Currency shown as USDT (not Rial/Toman)
- [ ] Amounts formatted with $ symbol
- [ ] Dates in English/Gregorian format
- [ ] Comments and code in English

### Transaction Examples (USDT)
```typescript
// ✅ CORRECT - USDT amounts
{ amount: 15.50, currency: 'USDT' }    // $15.50 USDT
{ amount: 100.00, currency: 'USDT' }   // $100.00 USDT

// ❌ WRONG - Rial amounts
{ amount: 15000, currency: 'تومان' }   // ۱۵,۰۰۰ تومان
```

## Wallet Integration Notes

### Supported Networks
1. **BSC (BEP-20)**
   - Network: Binance Smart Chain
   - Token: USDT
   - Chain ID: 56

2. **TRX (TRC-20)**
   - Network: Tron
   - Token: USDT
   - Chain ID: (Tron mainnet)

### Display Format
```
Balance: $1,295.00 USDT
Network: BSC (BEP-20)
```

---

**Project Goal**: Create an international gaming platform accessible to users worldwide, using cryptocurrency (USDT) as the primary currency across multiple blockchain networks.
