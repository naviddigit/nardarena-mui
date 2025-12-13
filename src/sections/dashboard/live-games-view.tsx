'use client';

import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { MobileLayout } from 'src/layouts/dashboard/mobile-layout';

// ----------------------------------------------------------------------

type LiveGame = {
  id: string;
  player1: {
    name: string;
    avatar?: string;
    rating: number;
  };
  player2: {
    name: string;
    avatar?: string;
    rating: number;
  };
  currentSet: string;
  stake: number;
  viewers: number;
  duration: string;
  gameMode: 'pvp' | 'tournament';
};

const MOCK_LIVE_GAMES: LiveGame[] = [
  {
    id: '1',
    player1: {
      name: 'Ali_Pro',
      rating: 1850,
    },
    player2: {
      name: 'MohammadG',
      rating: 1720,
    },
    currentSet: '2-1',
    stake: 100.0,
    viewers: 45,
    duration: '18m 30s',
    gameMode: 'pvp',
  },
  {
    id: '2',
    player1: {
      name: 'Sara_Player',
      rating: 1650,
    },
    player2: {
      name: 'Reza88',
      rating: 1680,
    },
    currentSet: '1-1',
    stake: 50.0,
    viewers: 23,
    duration: '12m 15s',
    gameMode: 'pvp',
  },
  {
    id: '3',
    player1: {
      name: 'Champion_X',
      rating: 2100,
    },
    player2: {
      name: 'Pro_Master',
      rating: 2050,
    },
    currentSet: '0-0',
    stake: 250.0,
    viewers: 128,
    duration: '5m 40s',
    gameMode: 'tournament',
  },
];

// ----------------------------------------------------------------------

export default function LiveGamesView() {
  const router = useRouter();

  const handleWatchGame = (gameId: string) => {
    console.log('Watch game:', gameId);
    // TODO: Navigate to spectator view
  };

  return (
    <MobileLayout>
      <Container maxWidth="sm" sx={{ pt: 2, pb: 2 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                  },
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Live Games
              </Typography>
            </Stack>
            <IconButton onClick={() => router.back()}>
              <Iconify icon="solar:close-circle-bold" width={24} />
            </IconButton>
          </Stack>

          {/* Stats Card */}
          <Card
            sx={{
              p: 2,
              background: (theme) =>
                `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.dark, 0.15)} 100%)`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {MOCK_LIVE_GAMES.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Games Playing Now
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:eye-bold" width={24} color="text.secondary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {MOCK_LIVE_GAMES.reduce((sum, game) => sum + game.viewers, 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  viewers
                </Typography>
              </Stack>
            </Stack>
          </Card>

          {/* Filter Chips */}
          <Stack direction="row" spacing={1}>
            <Chip label="All Games" color="primary" sx={{ fontWeight: 600 }} />
            <Chip label="High Stakes" variant="outlined" />
            <Chip label="Tournament" variant="outlined" />
          </Stack>

          {/* Live Games List */}
          <Stack spacing={2}>
            {MOCK_LIVE_GAMES.length === 0 ? (
              <Card sx={{ p: 4 }}>
                <Stack alignItems="center" spacing={2}>
                  <Iconify
                    icon="solar:gameboy-bold-duotone"
                    width={64}
                    color="text.disabled"
                  />
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No live games at the moment
                  </Typography>
                  <Button variant="outlined" onClick={() => router.push('/dashboard/play')}>
                    Start Playing
                  </Button>
                </Stack>
              </Card>
            ) : (
              MOCK_LIVE_GAMES.map((game) => (
                <Card
                  key={game.id}
                  sx={{
                    p: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: (theme) =>
                        `linear-gradient(90deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
                    },
                  }}
                >
                  <Stack spacing={2}>
                    {/* Game Type & Viewers */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Chip
                        label={game.gameMode.toUpperCase()}
                        size="small"
                        color={game.gameMode === 'tournament' ? 'warning' : 'info'}
                        sx={{ fontWeight: 700 }}
                      />
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:eye-bold" width={16} color="text.secondary" />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {game.viewers} watching
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Players */}
                    <Stack direction="row" alignItems="center" spacing={2}>
                      {/* Player 1 */}
                      <Stack flex={1} alignItems="center" spacing={1}>
                        <Avatar
                          src={game.player1.avatar}
                          sx={{
                            width: 56,
                            height: 56,
                            border: (theme) => `3px solid ${theme.palette.primary.main}`,
                          }}
                        >
                          {game.player1.name[0]}
                        </Avatar>
                        <Box textAlign="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                            {game.player1.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ⭐ {game.player1.rating}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* VS & Score */}
                      <Stack alignItems="center" spacing={0.5}>
                        <Chip
                          label={game.currentSet}
                          sx={{
                            fontWeight: 700,
                            fontSize: '1rem',
                            height: 40,
                            minWidth: 60,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          VS
                        </Typography>
                      </Stack>

                      {/* Player 2 */}
                      <Stack flex={1} alignItems="center" spacing={1}>
                        <Avatar
                          src={game.player2.avatar}
                          sx={{
                            width: 56,
                            height: 56,
                            border: (theme) => `3px solid ${theme.palette.error.main}`,
                          }}
                        >
                          {game.player2.name[0]}
                        </Avatar>
                        <Box textAlign="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                            {game.player2.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ⭐ {game.player2.rating}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    {/* Game Info */}
                    <Stack
                      direction="row"
                      spacing={2}
                      divider={<Box sx={{ width: 1, height: 16, bgcolor: 'divider' }} />}
                      justifyContent="center"
                    >
                      <Stack alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          Stake
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                          ${game.stake.toFixed(2)}
                        </Typography>
                      </Stack>

                      <Stack alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {game.duration}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Watch Button */}
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<Iconify icon="solar:play-bold" width={20} />}
                      onClick={() => handleWatchGame(game.id)}
                      sx={{
                        background: (theme) =>
                          `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                        fontWeight: 700,
                      }}
                    >
                      Watch Now
                    </Button>
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
