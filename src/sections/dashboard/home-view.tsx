'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useAuthContext } from 'src/auth/hooks';
import { useUserBalance } from 'src/hooks/use-user-data';

import { Iconify } from 'src/components/iconify';
import { BottomDrawer } from 'src/components/bottom-drawer';
import { BalanceCard } from 'src/components/dashboard/balance-card';
import { QuickActions } from 'src/components/dashboard/quick-actions';

import { MobileLayout } from 'src/layouts/dashboard/mobile-layout';

// ----------------------------------------------------------------------

export default function DashboardHomeView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { balance, isLoading: balanceLoading } = useUserBalance();

  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  // Use API data or fallback to 0
  const mainBalance = balance?.mainBalance ?? 0;
  const giftPoolBalance = balance?.giftPoolBalance ?? 0;

  const quickActions = [
    {
      title: 'Play Game',
      icon: 'solar:gameboy-bold-duotone',
      color: 'primary',
      onClick: () => router.push('/dashboard/play'),
    },
    {
      title: 'Statistics',
      icon: 'solar:chart-2-bold-duotone',
      color: 'info',
      onClick: () => router.push('/dashboard/stats'),
    },
    {
      title: 'Friends',
      icon: 'solar:users-group-rounded-bold-duotone',
      color: 'success',
      onClick: () => router.push('/dashboard/friends'),
    },
    {
      title: 'Gift Pool',
      icon: 'solar:gift-bold-duotone',
      color: 'warning',
      onClick: () => router.push('/dashboard/wallet'),
    },
  ];

  return (
    <MobileLayout>
      <Container maxWidth="sm" sx={{ pt: 2, pb: 2 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => setProfileDrawerOpen(true)}
                sx={{
                  p: 0,
                  width: 48,
                  height: 48,
                }}
              >
                <Avatar
                  src={user?.avatar || undefined}
                  alt={user?.displayName || 'User'}
                  sx={{
                    width: 48,
                    height: 48,
                    border: (theme) => `2px solid ${theme.palette.primary.main}`,
                    bgcolor: 'primary.main',
                  }}
                >
                  {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Welcome Back! 👋
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.displayName || user?.username || 'Player'}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {/* Balance Card */}
          {balanceLoading ? (
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} />
          ) : (
            <BalanceCard
              mainBalance={mainBalance}
              giftPoolBalance={giftPoolBalance}
              onDeposit={() => router.push('/dashboard/deposit')}
              onWithdraw={() => router.push('/dashboard/withdraw')}
            />
          )}

          {/* Quick Actions */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <QuickActions actions={quickActions} />
          </Box>

          {/* Live Games Section */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'error.main',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Live Games
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => router.push('/dashboard/watch')}
              >
                View All
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                }}
                onClick={() => router.push('/dashboard/watch')}
              >
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No live games at the moment
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Recent Matches */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                📊 Recent Matches
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => router.push('/dashboard/game-history')}
              >
                View All
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                }}
                onClick={() => router.push('/dashboard/game-history')}
              >
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No recent matches
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Container>

      {/* Profile Drawer */}
      <BottomDrawer
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        title="Profile Menu"
        heightPercentage={60}
      >
        <Stack spacing={2} sx={{ p: 2 }}>
          <Typography>Profile options will be here</Typography>
        </Stack>
      </BottomDrawer>
    </MobileLayout>
  );
}
