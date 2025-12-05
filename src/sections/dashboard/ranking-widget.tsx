'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Chip, Skeleton, CardHeader } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { getLeaderboard, type LeaderboardEntry } from 'src/api/game-stats';

// ----------------------------------------------------------------------

type Props = {
  period?: 'weekly' | 'monthly' | 'all-time';
  limit?: number;
};

export function RankingWidget({ period = 'weekly', limit = 5 }: Props) {
  const [loading, setLoading] = useState(true);
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetchTopPlayers();
  }, [period]);

  const fetchTopPlayers = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard(period, limit);
      setTopPlayers(data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'warning.main';
    if (rank === 2) return 'grey.500';
    if (rank === 3) return 'error.main';
    return 'text.secondary';
  };

  return (
    <Card>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:cup-star-bold-duotone" width={24} />
            <Typography variant="h6">Top Players</Typography>
          </Stack>
        }
        subheader={`${period === 'weekly' ? 'This Week' : period === 'monthly' ? 'This Month' : 'All Time'}`}
        action={
          <Button
            size="small"
            endIcon={<Iconify icon="solar:alt-arrow-right-linear" />}
            href="/dashboard/rankings"
          >
            View All
          </Button>
        }
      />

      <Stack spacing={0} sx={{ p: 3, pt: 2 }}>
        {loading ? (
          Array.from({ length: limit }).map((_, index) => (
            <Box
              key={index}
              sx={{
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Skeleton variant="text" width={32} height={32} />
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
              <Skeleton variant="text" width={60} />
            </Box>
          ))
        ) : topPlayers.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Iconify
              icon="solar:inbox-line-bold-duotone"
              width={48}
              sx={{ mb: 1, color: 'text.disabled', opacity: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              No rankings yet
            </Typography>
          </Box>
        ) : (
          topPlayers.map((player, index) => (
            <Box
              key={player.userId}
              sx={{
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: 1,
                px: 1,
                mx: -1,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              {/* Rank */}
              <Box
                sx={{
                  typography: 'h6',
                  fontSize: index < 3 ? 20 : 14,
                  minWidth: 32,
                  textAlign: 'center',
                  color: getRankColor(player.rank),
                  fontWeight: 'bold',
                }}
              >
                {getRankIcon(player.rank)}
              </Box>

              {/* Avatar & Name */}
              <Avatar
                src={player.avatar || undefined}
                alt={player.username}
                sx={{
                  width: 40,
                  height: 40,
                  border: index < 3 ? `2px solid` : 'none',
                  borderColor: getRankColor(player.rank),
                }}
              >
                {player.username.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {player.username}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {player.wins}W
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    •
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {player.winRate}%
                  </Typography>
                  {player.currentStreak > 0 && (
                    <>
                      <Typography variant="caption" color="text.disabled">
                        •
                      </Typography>
                      <Iconify icon="solar:fire-bold" width={12} color="warning.main" />
                      <Typography variant="caption" color="warning.main" fontWeight="bold">
                        {player.currentStreak}
                      </Typography>
                    </>
                  )}
                </Stack>
              </Box>

              {/* Score Badge */}
              <Chip
                label={player.wins}
                size="small"
                color={index === 0 ? 'warning' : index === 1 ? 'default' : index === 2 ? 'error' : 'default'}
                sx={{
                  fontWeight: 'bold',
                  minWidth: 50,
                }}
              />
            </Box>
          ))
        )}
      </Stack>
    </Card>
  );
}
