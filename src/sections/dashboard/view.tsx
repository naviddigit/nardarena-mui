'use client';

// ⚠️ DO NOT MODIFY - Using compact theme-aware components for player dashboard
// Balance is in USD only (USDT via TRC20 and BSC networks)

import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { alpha, useTheme } from '@mui/material/styles';

import { useMockedUser } from 'src/auth/hooks';

import { useAllWallets } from 'src/hooks/use-wallet';
import { useGameStats, useMonthlyStats } from 'src/hooks/use-game-stats';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { NetworkIcon } from 'src/components/network-icon';

import { GameModeCard } from '../game';

import { PlayerBalanceCard } from './player-balance-card';
import { PlayerStatWidget } from './player-stat-widget';
import { GameHistoryTable } from './game-history-table';
import { WalletHistoryTable } from './wallet-history-table';
import { RankingWidget } from './ranking-widget';

// ----------------------------------------------------------------------

const GAME_MODES = [
  {
    id: 'ai',
    title: 'Play with AI',
    description: 'Challenge our smart AI in various difficulty levels',
    icon: 'solar:cpu-bolt-bold-duotone',
    color: 'primary' as const,
    enabled: true,
    route: '/game/ai',
  },
  {
    id: 'online',
    title: 'Play with Players',
    description: 'Match with real players online and compete',
    icon: 'solar:users-group-rounded-bold-duotone',
    color: 'info' as const,
    enabled: false,
    route: '/game/online',
    comingSoon: true,
  },
  {
    id: 'tournament',
    title: 'Tournament',
    description: 'Join tournaments and win amazing rewards',
    icon: 'solar:cup-star-bold-duotone',
    color: 'warning' as const,
    enabled: false,
    route: '/tournament',
    comingSoon: true,
  },
];

// ----------------------------------------------------------------------

export default function DashboardView() {
  const router = useRouter();
  const { user } = useMockedUser();
  const theme = useTheme();

  // Fetch wallet balance from API - Real Data
  const { totalBalance: usdBalance, loading: balanceLoading } = useAllWallets();
  
  // Fetch game statistics from API - Real Data
  const { stats: gameStats, loading: statsLoading } = useGameStats();
  const { stats: monthlyStats, loading: monthlyLoading } = useMonthlyStats();

  // Combine all data
  const userData = {
    usdBalance: usdBalance || 0,
    depositedThisMonth: monthlyStats?.deposited || 0,
    withdrawnThisMonth: monthlyStats?.withdrawn || 0,
    earningsThisMonth: monthlyStats?.earnings || 0,
    gamesPlayed: gameStats?.gamesPlayed || 0,
    wins: gameStats?.wins || 0,
    winRate: gameStats?.winRate || 0,
    bestStreak: gameStats?.bestStreak || 0,
  };

  const isLoading = balanceLoading || statsLoading || monthlyLoading;

  const handlePlayMode = (route: string) => {
    router.push(route);
  };

  const quickActions = [
    {
      title: 'Play AI',
      icon: 'game-icons:artificial-intelligence',
      color: theme.palette.primary.main,
      path: '/game/ai',
      available: true,
    },
    {
      title: 'Play Online',
      icon: 'mdi:account-multiple',
      color: theme.palette.info.main,
      path: '/game/online',
      available: false,
    },
    {
      title: 'View History',
      icon: 'solar:history-bold',
      color: theme.palette.success.main,
      path: '#history',
      available: true,
    },
    {
      title: 'Manage Wallet',
      icon: 'solar:wallet-bold',
      color: theme.palette.warning.main,
      path: '/wallet',
      available: true,
    },
  ];

  return (
    <DashboardContent maxWidth="xl">
      <Box
        sx={{
          py: { xs: 3, md: 5 },
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  mb: 0.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                }}
              >
                Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Welcome back, {user?.displayName}! Track your USD balance and game stats.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Balance Card - Using PlayerBalanceCard */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} md={6}>
            <PlayerBalanceCard
              title="USD Balance (USDT)"
              currentBalance={userData.usdBalance}
              earned={userData.earningsThisMonth}
              withdrawn={userData.withdrawnThisMonth}
              deposited={userData.depositedThisMonth}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:chart-bold" width={24} sx={{ color: 'info.main' }} />
                <Typography variant="subtitle2">Quick Stats</Typography>
              </Box>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Games Played
                  </Typography>
                  <Typography variant="h6">{userData.gamesPlayed}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Win Rate
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'success.main' }}>
                    {userData.winRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Best Streak
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'warning.main' }}>
                    {userData.bestStreak} wins
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Stats Cards - Using PlayerStatWidget */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} sm={6} md={3}>
            <PlayerStatWidget
              title="Games Played"
              total={userData.gamesPlayed}
              percent={12.5}
              icon="solar:gameboy-bold"
              color="primary"
              chart={{
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                series: [10, 12, 15, 11, 14, 13, 12],
              }}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <PlayerStatWidget
              title="Total Wins"
              total={userData.wins}
              percent={8.3}
              icon="solar:cup-star-bold"
              color="success"
              chart={{
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                series: [6, 7, 9, 6, 8, 7, 9],
              }}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <PlayerStatWidget
              title="Win Rate"
              total={userData.winRate}
              percent={5.2}
              icon="solar:chart-2-bold"
              color="info"
              chart={{
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                series: [55, 58, 60, 57, 59, 60, 59.77],
              }}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <PlayerStatWidget
              title="Best Streak"
              total={userData.bestStreak}
              percent={-2.1}
              icon="solar:fire-bold"
              color="warning"
              chart={{
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                series: [5, 6, 8, 7, 6, 5, 8],
              }}
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid key={action.title} xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled={!action.available}
                    href={action.available ? action.path : undefined}
                    sx={{
                      height: 100,
                      flexDirection: 'column',
                      gap: 1,
                      borderColor: alpha(action.color, 0.24),
                      '&:hover': {
                        borderColor: action.color,
                        bgcolor: alpha(action.color, 0.08),
                      },
                    }}
                  >
                    <Iconify icon={action.icon} width={32} sx={{ color: action.color }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {action.title}
                    </Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Game History */}
        <Box id="history" sx={{ mb: 4 }}>
          <GameHistoryTable limit={5} showViewAll />
        </Box>

        {/* Player Rankings */}
        <Box sx={{ mb: 4 }}>
          <RankingWidget period="weekly" limit={10} />
        </Box>

        {/* Wallet History */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Wallet Transactions
          </Typography>
          <WalletHistoryTable />
        </Box>

        {/* Network Info Card */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:info-circle-bold" width={24} sx={{ color: 'info.main' }} />
                <Typography variant="h6">Supported Networks</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Deposit and withdraw USDT using these blockchain networks:
              </Typography>
              <Stack direction="row" spacing={2}>
                <Card
                  sx={{
                    flex: 1,
                    p: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.24)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <NetworkIcon network="TRC20" size="large" />
                    <Box>
                      <Typography variant="subtitle2">USDT (TRC20)</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Tron Network • Low fees
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
                <Card
                  sx={{
                    flex: 1,
                    p: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.24)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <NetworkIcon network="BSC" size="large" />
                    <Box>
                      <Typography variant="subtitle2">USDT (BSC)</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Binance Smart Chain • Fast
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </DashboardContent>
  );
}

