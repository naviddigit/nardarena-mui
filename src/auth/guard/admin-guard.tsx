'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthContext } from 'src/auth/hooks';
import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: Props) {
  const router = useRouter();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in - redirect to login
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        // Not admin - redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [loading, user, router]);

  if (loading) {
    return <SplashScreen />;
  }

  if (!user || user.role !== 'ADMIN') {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
