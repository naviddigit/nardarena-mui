'use client';

import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useTheme, alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { MobileLayout } from 'src/layouts/dashboard/mobile-layout';

// ----------------------------------------------------------------------

type GameMode = {
  title: string;
  subtitle: string;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  path: string;
  disabled?: boolean;
};

const GAME_MODES: GameMode[] = [
  {
    title: 'Play with AI',
    subtitle: 'Practice against computer',
    icon: 'solar:cpu-bolt-bold-duotone',
    color: 'primary',
    path: '/game/ai',
  },
  {
    title: 'Play Online',
    subtitle: 'Multiplayer match',
    icon: 'solar:users-group-rounded-bold-duotone',
    color: 'success',
    path: '/game/pvp',
    disabled: true,
  },
  {
    title: 'Tournament Arena',
    subtitle: 'Coming Soon',
    icon: 'solar:cup-star-bold-duotone',
    color: 'warning',
    path: '#',
    disabled: true,
  },
];

// ----------------------------------------------------------------------

export default function PlayView() {
  const router = useRouter();
  const theme = useTheme();

  const handleModeClick = (mode: GameMode) => {
    if (mode.disabled) return;
    router.push(mode.path);
  };

  return (
    <MobileLayout>
      <Container maxWidth="sm" sx={{ pt: 2, pb: 2 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                🎲 Select Game Mode
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose how you want to play
              </Typography>
            </Box>
          </Stack>

          {/* Game Mode Cards */}
          <Stack spacing={2}>
            {GAME_MODES.map((mode, index) => (
              <Card
                key={index}
                onClick={() => handleModeClick(mode)}
                sx={{
                  p: 3,
                  cursor: mode.disabled ? 'not-allowed' : 'pointer',
                  opacity: mode.disabled ? 0.5 : 1,
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: alpha(theme.palette[mode.color].main, 0.08),
                  border: `2px solid ${alpha(theme.palette[mode.color].main, 0.2)}`,

                  '&:hover': mode.disabled
                    ? {}
                    : {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.customShadows.z12,
                        borderColor: `${mode.color}.main`,
                      },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: alpha(theme.palette[mode.color].main, 0.1),
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette[mode.color].main, 0.16),
                    }}
                  >
                    <Iconify icon={mode.icon} width={40} sx={{ color: `${mode.color}.main` }} />
                  </Box>

                  {/* Text */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {mode.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mode.subtitle}
                    </Typography>
                  </Box>

                  {/* Arrow or Lock */}
                  <IconButton
                    disabled={mode.disabled}
                    sx={{
                      bgcolor: mode.disabled ? 'action.disabledBackground' : `${mode.color}.main`,
                      color: 'common.white',
                      '&:hover': {
                        bgcolor: mode.disabled ? 'action.disabledBackground' : `${mode.color}.dark`,
                      },
                    }}
                  >
                    <Iconify
                      icon={mode.disabled ? 'solar:lock-bold' : 'solar:alt-arrow-right-bold'}
                      width={20}
                    />
                  </IconButton>
                </Stack>
              </Card>
            ))}
          </Stack>

          {/* Game History Section */}
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📜 Recent Games
            </Typography>

            <Card sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No games played yet. Start your first match!
              </Typography>
            </Card>
          </Box>
        </Stack>
      </Container>
    </MobileLayout>
  );
}
