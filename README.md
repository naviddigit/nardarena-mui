## Prerequisites

- Node.js 20.x (Recommended)

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

## Important Notes

### Snackbar Component
- **Version:** sonner@1.5.0 (MUST match template version)
- **DO NOT** upgrade to sonner@2.x - it will break styling
- All snackbar files copied from `next-ts/src/components/snackbar/`
- Files: `snackbar.tsx`, `styles.tsx`, `classes.ts`, `index.ts`
- Custom file: `snackbar-provider.tsx` (wrapper for layout)

### Authentication
- Token expiration redirects to login WITHOUT alert popup
- Modified: `src/auth/context/jwt/utils.ts` - removed alert()
- Silent redirect to login page when token expires

### Admin Panel
- **Dashboard:** Uses `LoadingScreen` component (no custom loading)
- **User List:** Server-side pagination + sorting + search
- **Loading States:** Uses template TableEmptyRows for skeleton
- **Selection:** Auto-clears on page change

### Admin Panel Security
- "Make Admin" option removed from user management
- Only one super admin allowed
- Admin users cannot be banned or suspended
- Backend validates: `nard-backend/src/modules/admin/admin.service.ts`

### API Features
- **Users:** GET /api/admin/users?page&limit&search&sortBy&sortOrder
- **Sorting:** Supported fields: displayName, email, role, status, createdAt
- **Pagination:** Backend handles all pagination logic

## Build

```sh
yarn build
# or
npm run build
```

## Mock server

By default we provide demo data from : `https://api-dev-minimal-[version].vercel.app`

To set up your local server:

- **Guide:** [https://docs.minimals.cc/mock-server](https://docs.minimals.cc/mock-server).

- **Resource:** [Download](https://www.dropbox.com/sh/6ojn099upi105tf/AACpmlqrNUacwbBfVdtt2t6va?dl=0).

## Full version

- Create React App ([migrate to CRA](https://docs.minimals.cc/migrate-to-cra/)).
- Next.js
- Vite.js

## Starter version

- To remove unnecessary components. This is a simplified version ([https://starter.minimals.cc/](https://starter.minimals.cc/))
- Good to start a new project. You can copy components from the full version.
- Make sure to install the dependencies exactly as compared to the full version.

---

**NOTE:**
_When copying folders remember to also copy hidden files like .env. This is important because .env files often contain environment variables that are crucial for the application to run correctly._
