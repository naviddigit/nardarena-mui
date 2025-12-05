'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import { Chip, CircularProgress, ButtonGroup } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { PlayerStatWidget } from 'src/sections/dashboard/player-stat-widget';
import { getLeaderboard, type LeaderboardEntry, type LeaderboardResponse } from 'src/api/game-stats';

// ----------------------------------------------------------------------

export default function RankingPage() {
  const theme = useTheme();
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getLeaderboard(period, 50);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getTopPlayerStats = () => {
    if (!data || data.leaderboard.length === 0) return null;
    const top = data.leaderboard[0];
    return {
      totalWins: top.wins,
      bestWinRate: top.winRate,
      longestStreak: top.bestStreak,
    };
  };

  const stats = getTopPlayerStats();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'warning';
    if (rank === 2) return 'info';
    if (rank === 3) return 'error';
    return 'primary';
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4" mb={0.5}>
            Player Rankings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Compete with players and climb the leaderboard
          </Typography>
        </Box>

        <ButtonGroup variant="outlined" size="small">
          <Button
            variant={period === 'weekly' ? 'contained' : 'outlined'}
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={period === 'monthly' ? 'contained' : 'outlined'}
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={period === 'all-time' ? 'contained' : 'outlined'}
            onClick={() => setPeriod('all-time')}
          >
            All Time
          </Button>
        </ButtonGroup>
      </Stack>

      {/* Stats Overview */}
      {stats && (
        <Box
          gap={3}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
          mb={3}
        >
          <PlayerStatWidget
            title="Total Wins"
            total={stats.totalWins}
            percent={15.3}
            icon="solar:trophy-bold-duotone"
            color="warning"
            chart={{
              categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              series: [12, 18, 14, 20, 16, 22, stats.totalWins % 30],
            }}
          />
          <PlayerStatWidget
            title="Best Win Rate"
            total={stats.bestWinRate}
            percent={8.2}
            icon="solar:chart-bold-duotone"
            color="success"
            chart={{
              categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              series: [65, 70, 68, 72, 75, 78, Math.round(stats.bestWinRate)],
            }}
          />
          <PlayerStatWidget
            title="Longest Streak"
            total={stats.longestStreak}
            percent={12.5}
            icon="solar:fire-bold-duotone"
            color="error"
            chart={{
              categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              series: [3, 5, 4, 7, 6, 9, stats.longestStreak],
            }}
          />
        </Box>
      )}

      {/* Leaderboard Table */}
      <Card>
        <Box sx={{ p: 3, pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {period === 'weekly' && 'This Week\'s Champions'}
              {period === 'monthly' && 'This Month\'s Champions'}
              {period === 'all-time' && 'All-Time Legends'}
            </Typography>
            {data && data.totalPlayers !== undefined && (
              <Chip
                icon={<Iconify icon="solar:users-group-rounded-bold-duotone" />}
                label={`${data.totalPlayers} Players`}
                size="small"
                variant="soft"
              />
            )}
          </Stack>
        </Box>

        <Scrollbar>
          <TableContainer sx={{ minWidth: 720 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={60}>Rank</TableCell>
                  <TableCell>Player</TableCell>
                  <TableCell align="center">Games</TableCell>
                  <TableCell align="center">Wins</TableCell>
                  <TableCell align="center">Losses</TableCell>
                  <TableCell align="center">Win Rate</TableCell>
                  <TableCell align="center">Streak</TableCell>
                  <TableCell align="center">Best</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                )}

                {error && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                      <Typography color="error">{error}</Typography>
                      <Button
                        onClick={fetchLeaderboard}
                        sx={{ mt: 2 }}
                        startIcon={<Iconify icon="solar:refresh-linear" />}
                      >
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                )}

                {!loading && !error && data && data.leaderboard.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                      <Iconify
                        icon="solar:inbox-line-bold-duotone"
                        width={64}
                        sx={{ mb: 2, color: 'text.disabled', opacity: 0.5 }}
                      />
                      <Typography variant="h6" color="text.secondary">
                        No rankings yet
                      </Typography>
                      <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                        Play games to appear on the leaderboard
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  !error &&
                  data &&
                  data.leaderboard.map((player) => (
                    <TableRow
                      key={player.userId}
                      sx={{
                        backgroundColor:
                          player.rank <= 3
                            ? alpha(theme.palette[getRankColor(player.rank) as any].main, 0.08)
                            : 'transparent',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            typography: 'h6',
                            fontSize: player.rank <= 3 ? 24 : 16,
                            textAlign: 'center',
                          }}
                        >
                          {getRankIcon(player.rank)}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            src={player.avatar || undefined}
                            alt={player.username}
                            sx={{
                              width: 40,
                              height: 40,
                              border: player.rank <= 3 ? `2px solid ${theme.palette[getRankColor(player.rank) as any].main}` : 'none',
                            }}
                          >
                            {player.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{player.username}</Typography>
                            {player.currentStreak > 0 && (
                              <Chip
                                icon={<Iconify icon="solar:fire-bold" width={14} />}
                                label={`${player.currentStreak} win streak`}
                                size="small"
                                color="warning"
                                sx={{ height: 20, mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2">{player.gamesPlayed}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip label={player.wins} size="small" color="success" variant="soft" />
                      </TableCell>

                      <TableCell align="center">
                        <Chip label={player.losses} size="small" color="error" variant="soft" />
                      </TableCell>

                      <TableCell align="center">
                        <Box
                          sx={{
                            typography: 'subtitle2',
                            color:
                              player.winRate >= 70
                                ? 'success.main'
                                : player.winRate >= 50
                                  ? 'warning.main'
                                  : 'text.secondary',
                          }}
                        >
                          {player.winRate}%
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        {player.currentStreak > 0 ? (
                          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                            <Iconify icon="solar:fire-bold" width={16} color="warning.main" />
                            <Typography variant="body2" fontWeight="bold">
                              {player.currentStreak}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            -
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium">
                          {player.bestStreak}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>
    </DashboardContent>
  );
}
