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

type GameHistory = {
  id: string;
  opponent: {
    name: string;
    avatar?: string;
  };
  result: 'win' | 'loss' | 'draw';
  score: string;
  stake: number;
  profit: number;
  duration: string;
  date: string;
  gameMode: 'ai' | 'pvp' | 'tournament';
};

const MOCK_GAME_HISTORY: GameHistory[] = [
  {
    id: '1',
    opponent: { name: 'AI Bot - Level 3' },
    result: 'win',
    score: '3-0',
    stake: 10.00,
    profit: 9.50,
    duration: '12m 30s',
    date: '2 hours ago',
    gameMode: 'ai',
  },
  {
    id: '2',
    opponent: { name: 'Player_123', avatar: '/assets/images/avatar/avatar-11.webp' },
    result: 'loss',
    score: '1-3',
    stake: 25.00,
    profit: -25.00,
    duration: '18m 45s',
    date: '5 hours ago',
    gameMode: 'pvp',
  },
  {
    id: '3',
    opponent: { name: 'AI Bot - Level 2' },
    result: 'win',
    score: '3-1',
    stake: 15.00,
    profit: 14.25,
    duration: '15m 20s',
    date: 'Yesterday',
    gameMode: 'ai',
  },
  {
    id: '4',
    opponent: { name: 'MohammadG', avatar: '/assets/images/avatar/avatar-12.webp' },
    result: 'win',
    score: '3-2',
    stake: 50.00,
    profit: 47.50,
    duration: '25m 10s',
    date: 'Yesterday',
    gameMode: 'pvp',
  },
  {
    id: '5',
    opponent: { name: 'AI Bot - Level 1' },
    result: 'win',
    score: '3-0',
    stake: 5.00,
    profit: 4.75,
    duration: '8m 15s',
    date: '2 days ago',
    gameMode: 'ai',
  },
];

// ----------------------------------------------------------------------

export default function GameHistoryView() {
  const theme = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState('all');

  const getFilteredGames = () => {
    if (filter === 'all') return MOCK_GAME_HISTORY;
    if (filter === 'wins') return MOCK_GAME_HISTORY.filter((g) => g.result === 'win');
    if (filter === 'losses') return MOCK_GAME_HISTORY.filter((g) => g.result === 'loss');
    return MOCK_GAME_HISTORY;
  };

  const filteredGames = getFilteredGames();

  // Statistics
  const totalGames = MOCK_GAME_HISTORY.length;
  const wins = MOCK_GAME_HISTORY.filter((g) => g.result === 'win').length;
  const losses = MOCK_GAME_HISTORY.filter((g) => g.result === 'loss').length;
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0';
  const totalProfit = MOCK_GAME_HISTORY.reduce((sum, g) => sum + g.profit, 0);

  return (
    <MobileLayout>
      <Container maxWidth="sm" sx={{ pt: 2, pb: 2 }}>
        <Stack spacing={2.5}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Game History
            </Typography>
            <IconButton onClick={() => router.back()} size="small">
              <Iconify icon="solar:close-circle-bold" width={24} />
            </IconButton>
          </Stack>

          {/* Statistics Cards */}
          <Stack direction="row" spacing={1}>
            <Card
              sx={{
                flex: 1,
                p: 1.5,
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.dark, 0.15)} 100%)`,
              }}
            >
              <Stack alignItems="center" spacing={0.25}>
                <Iconify icon="solar:cup-star-bold" width={24} color="success.main" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {wins}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                  Wins
                </Typography>
              </Stack>
            </Card>

            <Card
              sx={{
                flex: 1,
                p: 1.5,
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.dark, 0.15)} 100%)`,
              }}
            >
              <Stack alignItems="center" spacing={0.25}>
                <Iconify icon="solar:close-circle-bold" width={24} color="error.main" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {losses}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                  Losses
                </Typography>
              </Stack>
            </Card>

            <Card
              sx={{
                flex: 1,
                p: 1.5,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.15)} 100%)`,
              }}
            >
              <Stack alignItems="center" spacing={0.25}>
                <Iconify icon="solar:chart-2-bold" width={24} color="primary.main" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {winRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                  Win Rate
                </Typography>
              </Stack>
            </Card>
          </Stack>

          {/* Profit Card */}
          <Card
            sx={{
              p: 1.5,
              background: `linear-gradient(135deg, ${alpha(theme.palette[totalProfit >= 0 ? 'success' : 'error'].main, 0.1)} 0%, ${alpha(theme.palette[totalProfit >= 0 ? 'success' : 'error'].dark, 0.15)} 100%)`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                  Total Profit/Loss
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: totalProfit >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  {totalProfit >= 0 ? '+' : ''}${Math.abs(totalProfit).toFixed(2)}
                </Typography>
              </Box>
              <Iconify
                icon={totalProfit >= 0 ? 'solar:graph-up-bold' : 'solar:graph-down-bold'}
                width={36}
                color={totalProfit >= 0 ? 'success.main' : 'error.main'}
              />
            </Stack>
          </Card>

          {/* Filter Chips */}
          <Stack direction="row" spacing={1}>
            {[
              { value: 'all', label: `All (${totalGames})` },
              { value: 'wins', label: `Wins (${wins})` },
              { value: 'losses', label: `Losses (${losses})` },
            ].map((item) => (
              <Chip
                key={item.value}
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

          {/* Game History List */}
          <Stack spacing={1}>
            {filteredGames.length === 0 ? (
              <Card sx={{ p: 3 }}>
                <Stack alignItems="center" spacing={1}>
                  <Iconify icon="solar:gameboy-bold" width={48} sx={{ opacity: 0.3 }} />
                  <Typography variant="body2" color="text.secondary">
                    No games found
                  </Typography>
                </Stack>
              </Card>
            ) : (
              filteredGames.map((game) => (
                <Card
                  key={game.id}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                  }}
                >
                  <Stack spacing={1}>
                    {/* Header: Opponent & Result */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          src={game.opponent.avatar}
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: game.gameMode === 'ai' ? 'primary.main' : 'info.main',
                          }}
                        >
                          {game.opponent.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} fontSize="0.875rem">
                            {game.opponent.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                            {game.date}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        label={game.result}
                        color={game.result === 'win' ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem', minWidth: 50 }}
                      />
                    </Stack>

                    {/* Game Details */}
                    <Stack direction="row" spacing={1.5}>
                      <Stack flex={1} spacing={0.25}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                          Score
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} fontSize="0.8rem">
                          {game.score}
                        </Typography>
                      </Stack>

                      <Stack flex={1} spacing={0.25}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                          Stake
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} fontSize="0.8rem">
                          ${game.stake.toFixed(2)}
                        </Typography>
                      </Stack>

                      <Stack flex={1} spacing={0.25}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                          Profit
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: game.profit >= 0 ? 'success.main' : 'error.main',
                          }}
                          fontSize="0.8rem"
                        >
                          {game.profit >= 0 ? '+' : ''}${Math.abs(game.profit).toFixed(2)}
                        </Typography>
                      </Stack>

                      <Stack flex={1} spacing={0.25}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                          Time
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} fontSize="0.8rem">
                          {game.duration}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))
            )}
          </Stack>
        </Stack>
      </Container>
    </MobileLayout>
  );
}
