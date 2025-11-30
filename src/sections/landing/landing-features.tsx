'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const FEATURES = [
  {
    icon: '🤖',
    title: 'Play with AI',
    description:
      'Challenge smart AI opponents at different difficulty levels. Perfect your strategy and improve your skills before competing online.',
    color: '#00A76F',
  },
  {
    icon: '🌍',
    title: 'Global Competition',
    description:
      'Compete with real players from around the world in live matches. Climb the global leaderboard and prove your mastery.',
    color: '#2065D1',
  },
  {
    icon: '💰',
    title: 'Crypto Payments',
    description:
      'Secure and instant transactions using TRX (Tron) and BNB (Binance Smart Chain). Play, earn, and withdraw seamlessly.',
    color: '#FFC107',
  },
  {
    icon: '🎁',
    title: 'Earn Rewards',
    description:
      'Earn crypto by playing, watching live games, and predicting match outcomes. Multiple ways to grow your earnings.',
    color: '#7635dc',
  },
];

// ----------------------------------------------------------------------

export function LandingFeatures() {
  const theme = useTheme();

  return (
    <Box
      id="features"
      sx={{
        py: { xs: 10, md: 15 },
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.3)} 50%, transparent 100%)`,
        },
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
              Features
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
              Everything You Need to Play & Earn
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
              Experience the most advanced backgammon platform with cutting-edge features designed
              for players and spectators alike.
            </Typography>
          </m.div>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 3, sm: 4 },
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
            },
          }}
        >
          {FEATURES.map((feature, index) => (
            <m.div key={feature.title} variants={varFade().inUp}>
              <Card
                sx={{
                  p: { xs: 4, sm: 5 },
                  height: '100%',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: `0 32px 64px ${alpha(feature.color, 0.24)}`,
                    border: `1px solid ${alpha(feature.color, 0.4)}`,
                    '& .feature-icon': {
                      transform: 'scale(1.2) rotate(8deg)',
                      boxShadow: `0 12px 32px ${alpha(feature.color, 0.3)}`,
                    },
                    '&::before': {
                      opacity: 1,
                      height: '100%',
                    },
                    '&::after': {
                      opacity: 1,
                    },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: `linear-gradient(90deg, ${feature.color} 0%, ${alpha(feature.color, 0.5)} 100%)`,
                    opacity: 0.6,
                    transition: 'all 0.4s ease',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 50% 0%, ${alpha(feature.color, 0.08)} 0%, transparent 70%)`,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                  },
                }}
              >
                <Box
                  className="feature-icon"
                  sx={{
                    width: { xs: 70, sm: 80 },
                    height: { xs: 70, sm: 80 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: { xs: '2.5rem', sm: '3rem' },
                    mx: 'auto',
                    mb: 3,
                    borderRadius: '50%',
                    bgcolor: alpha(feature.color, 0.08),
                    border: `2px solid ${alpha(feature.color, 0.2)}`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {feature.icon}
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {feature.title}
                </Typography>

                <Typography
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.8,
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {feature.description}
                </Typography>
              </Card>
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
