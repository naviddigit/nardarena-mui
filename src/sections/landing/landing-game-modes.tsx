'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const GAME_MODES = [
  {
    title: 'AI Mode',
    subtitle: 'Practice & Improve',
    description:
      'Challenge intelligent AI opponents at multiple difficulty levels. Perfect for learning strategies, testing new tactics, and improving your skills.',
    features: ['Multiple difficulty levels', 'Instant matchmaking', 'Practice without pressure', 'Skill improvement'],
    available: true,
    icon: '🤖',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    title: 'Online Mode',
    subtitle: 'Compete Globally',
    description:
      'Play against real players from around the world. Climb the global leaderboard, compete in ranked matches, and earn rewards.',
    features: ['Real-time multiplayer', 'Global leaderboard', 'Ranked matches', 'Earn crypto rewards'],
    available: true,
    icon: '🌍',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    title: 'Tournament Mode',
    subtitle: 'Coming Soon',
    description:
      'Compete in high-stakes tournaments with massive prize pools. Join scheduled events and battle for the top position.',
    features: ['Large prize pools', 'Scheduled events', 'Elimination brackets', 'Championship titles'],
    available: false,
    icon: '🏆',
    gradient: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
  },
];

// ----------------------------------------------------------------------

export function LandingGameModes() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 },
        bgcolor: alpha(theme.palette.background.neutral, 0.4),
        position: 'relative',
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
          <m.div variants={varFade().inUp}>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: 2,
                mb: 1,
              }}
            >
              Game Modes
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              variant="h2"
              sx={{
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 800,
              }}
            >
              Choose Your Playing Style
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              sx={{
                color: 'text.secondary',
                fontSize: '1.125rem',
                maxWidth: 640,
                mx: 'auto',
              }}
            >
              Whether you want to practice, compete, or join tournaments, we've got you covered.
            </Typography>
          </m.div>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 3, sm: 4 },
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
          }}
        >
          {GAME_MODES.map((mode, index) => (
            <m.div key={mode.title} variants={varFade().inUp}>
              <Card
                sx={{
                  p: { xs: 3, sm: 4 },
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: mode.available ? 'pointer' : 'default',
                  '&:hover': {
                    transform: mode.available ? 'translateY(-12px) scale(1.02)' : 'none',
                    boxShadow: mode.available ? theme.shadows[24] : theme.shadows[4],
                    '& .mode-icon': {
                      transform: mode.available ? 'scale(1.15) rotate(-8deg)' : 'none',
                    },
                    '&::before': {
                      opacity: mode.available ? 0.08 : 0.5,
                    },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: mode.gradient,
                    transition: 'opacity 0.4s ease',
                    opacity: 0,
                    zIndex: 0,
                    borderRadius: 'inherit',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: mode.gradient,
                    zIndex: 0,
                    borderTopLeftRadius: 'inherit',
                    borderTopRightRadius: 'inherit',
                  },
                  opacity: mode.available ? 1 : 0.7,
                }}
              >
                {!mode.available && (
                  <Chip
                    label="Coming Soon"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontWeight: 700,
                      background: mode.gradient,
                      color: 'white',
                      zIndex: 2,
                    }}
                  />
                )}

                <Box
                  className="mode-icon"
                  sx={{
                    width: { xs: 70, sm: 80 },
                    height: { xs: 70, sm: 80 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: { xs: '2.5rem', sm: '3rem' },
                    mb: 3,
                    borderRadius: 3,
                    background: mode.gradient,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 8px 24px ${alpha('#000', 0.2)}`,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {mode.icon}
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    mb: 1,
                    fontWeight: 800,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {mode.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    color: 'text.secondary',
                    fontWeight: 600,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {mode.subtitle}
                </Typography>

                <Typography
                  sx={{
                    mb: 3,
                    color: 'text.secondary',
                    lineHeight: 1.8,
                    flexGrow: 1,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {mode.description}
                </Typography>

                <Box sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
                  {mode.features.map((feature, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: mode.gradient,
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {mode.available ? (
                  <Button
                    component={RouterLink}
                    href="/login"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      background: mode.gradient,
                      fontWeight: 700,
                      boxShadow: `0 8px 16px ${alpha('#000', 0.2)}`,
                      position: 'relative',
                      zIndex: 1,
                      '&:hover': {
                        boxShadow: `0 12px 24px ${alpha('#000', 0.3)}`,
                      },
                    }}
                  >
                    Play Now
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    disabled
                    sx={{
                      fontWeight: 700,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    Coming Soon
                  </Button>
                )}
              </Card>
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
