'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useTheme, alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { MobileLayout } from 'src/layouts/dashboard/mobile-layout';

// ----------------------------------------------------------------------

type RankingPlayer = {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  isCurrentUser?: boolean;
};

const MOCK_RANKINGS: RankingPlayer[] = [
  {
    rank: 1,
    userId: '1',
    name: 'Champion_Master',
    avatar: '/assets/images/avatar/avatar-1.webp',
    rating: 2450,
    gamesPlayed: 520,
    wins: 398,
    losses: 122,
    winRate: 76.5,
    totalProfit: 5420.5,
  },
  {
    rank: 2,
    userId: '2',
    name: 'Pro_Player_X',
    avatar: '/assets/images/avatar/avatar-2.webp',
    rating: 2380,
    gamesPlayed: 445,
    wins: 335,
    losses: 110,
    winRate: 75.3,
    totalProfit: 4875.25,
  },
  {
    rank: 3,
    userId: '3',
    name: 'Elite_Gamer',
    avatar: '/assets/images/avatar/avatar-3.webp',
    rating: 2310,
    gamesPlayed: 389,
    wins: 290,
    losses: 99,
    winRate: 74.6,
    totalProfit: 4320.0,
  },
  {
    rank: 4,
    userId: '4',
    name: 'NardKing_99',
    avatar: '/assets/images/avatar/avatar-4.webp',
    rating: 2245,
    gamesPlayed: 356,
    wins: 258,
    losses: 98,
    winRate: 72.5,
    totalProfit: 3890.75,
  },
  {
    rank: 5,
    userId: '5',
    name: 'Sara_Champion',
    avatar: '/assets/images/avatar/avatar-5.webp',
    rating: 2180,
    gamesPlayed: 334,
    wins: 239,
    losses: 95,
    winRate: 71.6,
    totalProfit: 3650.0,
  },
  {
    rank: 12,
    userId: 'current',
    name: 'You',
    avatar: '/assets/images/avatar/avatar-10.webp',
    rating: 1850,
    gamesPlayed: 145,
    wins: 98,
    losses: 47,
    winRate: 67.6,
    totalProfit: 1245.5,
    isCurrentUser: true,
  },
];

// ----------------------------------------------------------------------

export default function RankingsView() {
  const theme = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState('global');

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: theme.palette.warning.main };
    if (rank === 2) return { icon: '🥈', color: theme.palette.grey[400] };
    if (rank === 3) return { icon: '🥉', color: '#CD7F32' };
    return { icon: `#${rank}`, color: theme.palette.text.secondary };
  };

  return (
    <MobileLayout>
      <Container maxWidth="sm" sx={{ pt: 2, pb: 2 }}>
        <Stack spacing={2.5}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Rankings
            </Typography>
            <IconButton onClick={() => router.back()} size="small">
              <Iconify icon="solar:close-circle-bold" width={24} />
            </IconButton>
          </Stack>

          {/* Filter Chips */}
          <Stack direction="row" spacing={1}>
            {[
              { value: 'global', label: 'Global', icon: 'solar:global-bold' },
              { value: 'weekly', label: 'Weekly', icon: 'solar:calendar-bold' },
              { value: 'monthly', label: 'Monthly', icon: 'solar:medal-star-bold' },
            ].map((item) => (
              <Chip
                key={item.value}
                icon={<Iconify icon={item.icon} width={16} sx={{ color: filter === item.value ? 'common.white' : 'text.secondary' }} />}
                label={item.label}
                onClick={() => setFilter(item.value)}
                color={filter === item.value ? 'primary' : 'default'}
                variant={filter === item.value ? 'filled' : 'outlined'}
                sx={{
                  height: 32,
                  fontWeight: 600,
                  ...(filter !== item.value && {
                    bgcolor: 'transparent',
                    borderColor: alpha(theme.palette.text.disabled, 0.16),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.text.primary, 0.08),
                    },
                  }),
                }}
              />
            ))}
          </Stack>

          {/* Current User Card */}
          {MOCK_RANKINGS.find((p) => p.isCurrentUser) && (
            <Card
              sx={{
                p: 1.5,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.15)} 100%)`,
                border: `2px solid ${theme.palette.primary.main}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    minWidth: 50,
                  }}
                >
                  #12
                </Typography>

                <Stack flex={1} spacing={0.25}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Your Ranking
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                    Keep playing to climb higher
                  </Typography>
                </Stack>

                <Stack alignItems="flex-end">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    1850
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                    Rating
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          )}

          {/* Top 3 Podium */}
          <Stack direction="row" alignItems="flex-end" justifyContent="center" spacing={1.5} sx={{ px: 0.5 }}>
            {/* Rank 2 */}
            {MOCK_RANKINGS[1] && (
              <Card
                sx={{
                  flex: 1,
                  p: 1.5,
                  textAlign: 'center',
                  background: alpha(theme.palette.grey[400], 0.08),
                  border: `1px solid ${alpha(theme.palette.grey[400], 0.3)}`,
                }}
              >
                <Stack alignItems="center" spacing={0.75}>
                  <Typography fontSize="1.5rem">🥈</Typography>
                  <Avatar
                    src={MOCK_RANKINGS[1].avatar}
                    alt={MOCK_RANKINGS[1].name}
                    sx={{
                      width: 40,
                      height: 40,
                      border: `2px solid ${theme.palette.grey[400]}`,
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '0.7rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                    }}
                  >
                    {MOCK_RANKINGS[1].name}
                  </Typography>
                  <Chip label={MOCK_RANKINGS[1].rating} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                </Stack>
              </Card>
            )}

            {/* Rank 1 */}
            {MOCK_RANKINGS[0] && (
              <Card
                sx={{
                  flex: 1,
                  p: 1.75,
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.warning.dark, 0.2)} 100%)`,
                  transform: 'scale(1.05)',
                  zIndex: 2,
                  border: `2px solid ${theme.palette.warning.main}`,
                }}
              >
                <Stack alignItems="center" spacing={0.75}>
                  <Typography fontSize="2rem">🥇</Typography>
                  <Avatar
                    src={MOCK_RANKINGS[0].avatar}
                    alt={MOCK_RANKINGS[0].name}
                    sx={{
                      width: 52,
                      height: 52,
                      border: `3px solid ${theme.palette.warning.main}`,
                    }}
                  />
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                    }}
                  >
                    {MOCK_RANKINGS[0].name}
                  </Typography>
                  <Chip label={MOCK_RANKINGS[0].rating} color="warning" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }} />
                </Stack>
              </Card>
            )}

            {/* Rank 3 */}
            {MOCK_RANKINGS[2] && (
              <Card
                sx={{
                  flex: 1,
                  p: 1.5,
                  textAlign: 'center',
                  background: alpha('#CD7F32', 0.08),
                  border: `1px solid ${alpha('#CD7F32', 0.3)}`,
                }}
              >
                <Stack alignItems="center" spacing={0.75}>
                  <Typography fontSize="1.5rem">🥉</Typography>
                  <Avatar
                    src={MOCK_RANKINGS[2].avatar}
                    alt={MOCK_RANKINGS[2].name}
                    sx={{
                      width: 40,
                      height: 40,
                      border: '2px solid #CD7F32',
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '0.7rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                    }}
                  >
                    {MOCK_RANKINGS[2].name}
                  </Typography>
                  <Chip label={MOCK_RANKINGS[2].rating} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                </Stack>
              </Card>
            )}
          </Stack>

          {/* Full Rankings List */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
              FULL LEADERBOARD
            </Typography>

            <Stack spacing={1}>
              {MOCK_RANKINGS.map((player) => {
                const badge = getRankBadge(player.rank);
                return (
                  <Card
                    key={player.userId}
                    sx={{
                      p: 1.5,
                      bgcolor: player.isCurrentUser ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                      border: player.isCurrentUser ? `1px solid ${theme.palette.primary.main}` : 'none',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {/* Rank */}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: badge.color,
                          minWidth: 40,
                          textAlign: 'center',
                          fontSize: '0.95rem',
                        }}
                      >
                        {badge.icon}
                      </Typography>

                      {/* Avatar & Name */}
                      <Avatar
                        src={player.avatar}
                        alt={player.name}
                        sx={{
                          width: 36,
                          height: 36,
                          border: player.isCurrentUser ? `2px solid ${theme.palette.primary.main}` : 'none',
                        }}
                      />

                      <Box flex={1} minWidth={0}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} fontSize="0.875rem" noWrap>
                            {player.name}
                          </Typography>
                          {player.isCurrentUser && (
                            <Chip label="YOU" size="small" color="primary" sx={{ height: 18, fontSize: '0.6rem' }} />
                          )}
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                            {player.gamesPlayed} games
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            •
                          </Typography>
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }} fontSize="0.7rem">
                            {player.winRate}% WR
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Stats */}
                      <Stack alignItems="flex-end" spacing={0.25}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }} fontSize="0.875rem">
                          {player.rating}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: player.totalProfit >= 0 ? 'success.main' : 'error.main',
                          }}
                          fontSize="0.65rem"
                        >
                          {player.totalProfit >= 0 ? '+' : ''}${Math.abs(player.totalProfit).toFixed(0)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </MobileLayout>
  );
}
