'use client';

import { useAutoTokenRefresh } from 'src/hooks/use-auto-token-refresh';

/**
 * Token Refresh Provider
 * Wraps the app and automatically refreshes JWT tokens
 * Must be a client component to use hooks
 */
export function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  // Start auto token refresh
  useAutoTokenRefresh();

  return <>{children}</>;
}
