'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useAuthContext } from 'src/auth/hooks';
import { CONFIG } from 'src/config-global';

/**
 * Google OAuth Success Page
 * Receives tokens from backend redirect and saves them
 */
export default function GoogleSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkUserSession } = useAuthContext();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      console.log('🔑 Google callback received:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken 
      });

      if (accessToken && refreshToken) {
        try {
          // Save tokens to sessionStorage (same as regular login)
          sessionStorage.setItem('jwt_access_token', accessToken);
          
          console.log('✅ Tokens saved to sessionStorage');

          // Wait a bit for storage to persist
          await new Promise(resolve => setTimeout(resolve, 100));

          // Refresh user session (this will call setSession)
          await checkUserSession?.();

          console.log('✅ User session refreshed, redirecting...');

          // Small delay before redirect
          await new Promise(resolve => setTimeout(resolve, 300));

          // Redirect to dashboard
          router.replace(CONFIG.auth.redirectPath);
        } catch (error) {
          console.error('❌ Failed to process Google login:', error);
          router.push('/auth/login?error=google_auth_failed');
        }
      } else {
        console.error('❌ Missing tokens in callback');
        router.push('/auth/login?error=missing_tokens');
      }
    };

    handleGoogleCallback();
  }, [searchParams, checkUserSession, router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">Signing you in with Google...</Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we complete your sign-in
      </Typography>
    </Box>
  );
}
