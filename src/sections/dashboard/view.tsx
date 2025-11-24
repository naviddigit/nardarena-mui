'use client';

import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { useMockedUser } from 'src/auth/hooks';

import { useSettingsContext } from 'src/components/settings';

import { GameModeCard } from '../game';

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
  const settings = useSettingsContext();

  const handlePlayMode = (route: string) => {
    router.push(route);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Box
        sx={{
          py: { xs: 3, md: 5 },
          textAlign: 'center',
        }}
      >
        {/* Welcome Message */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Welcome back,
          </Typography>
          <Typography variant="h6">{user?.displayName}</Typography>
        </Stack>

        {/* Nard Arena Title */}
        <Typography
          variant="h1"
          sx={{
            mb: 2,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
            fontFamily: "'Brush Script MT', cursive",
          }}
        >
          Nard Arena
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 5 }}>
          Choose your game mode
        </Typography>

        {/* Game Mode Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {GAME_MODES.map((mode) => (
            <Grid key={mode.id} xs={12} md={4}>
              <GameModeCard
                title={mode.title}
                description={mode.description}
                icon={mode.icon}
                color={mode.color}
                enabled={mode.enabled}
                comingSoon={mode.comingSoon}
                onPlay={() => handlePlayMode(mode.route)}
                sx={{ height: 1 }}
              />
            </Grid>
          ))}
        </Grid>

        {/* Stats Row */}
        <Card sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ textAlign: 'center' }}>
            <Grid xs={12} md={4}>
              <Typography variant="h3" sx={{ color: 'primary.main', mb: 1 }}>
                0
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Games Played
              </Typography>
            </Grid>

            <Grid xs={12} md={4}>
              <Typography variant="h3" sx={{ color: 'info.main', mb: 1 }}>
                0
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Wins
              </Typography>
            </Grid>

            <Grid xs={12} md={4}>
              <Typography variant="h3" sx={{ color: 'success.main', mb: 1 }}>
                0%
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Win Rate
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Box>
    </Container>
  );
}
