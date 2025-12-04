import { useEffect, useRef } from 'react';
import axios from 'axios';

import { CONFIG } from 'src/config-global';

/**
 * Auto Token Refresh Hook
 * Automatically refreshes JWT token every hour (before 4-hour expiration)
 * This prevents users from being logged out during gameplay
 */
export function useAutoTokenRefresh() {
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const refreshToken = async () => {
      try {
        const refreshTokenValue = sessionStorage.getItem('jwt_refresh_token') || 
                                 sessionStorage.getItem('refreshToken');

        if (!refreshTokenValue) {
          return;
        }

        const response = await axios.post(`${CONFIG.site.serverUrl}/api/auth/refresh`, {
          refreshToken: refreshTokenValue,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens in storage
        sessionStorage.setItem('jwt_access_token', newAccessToken);
        sessionStorage.setItem('accessToken', newAccessToken); // Backwards compatibility
        
        if (newRefreshToken) {
          sessionStorage.setItem('jwt_refresh_token', newRefreshToken);
          sessionStorage.setItem('refreshToken', newRefreshToken); // Backwards compatibility
        }
      } catch (error) {
        console.error('[Auto-Refresh] Failed to refresh token:', error);
        // Don't clear session here - let the 401 interceptor handle it
      }
    };

    // Check if user is logged in
    const accessToken = sessionStorage.getItem('jwt_access_token') || 
                       sessionStorage.getItem('accessToken');

    if (accessToken) {
      // Refresh every 1 hour (3600000 ms)
      // Token expires after 4 hours, so this gives us 3 refresh opportunities
      const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
      
      // Set up interval
      refreshIntervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL);

      // Cleanup on unmount
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }

    return undefined;
  }, []); // Empty deps - only run once on mount

  return null;
}
