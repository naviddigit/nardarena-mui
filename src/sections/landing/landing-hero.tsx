'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function LandingHero() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 10, md: 12 },
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.dark, 0.9)} 0%, 
          ${alpha(theme.palette.background.default, 0.95)} 50%,
          ${alpha(theme.palette.primary.darker, 0.9)} 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 50%)`,
          animation: 'pulse 8s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.5 },
            '50%': { opacity: 1 },
          },
        },
      }}
    >
      <Container component={MotionViewport} sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            textAlign: { xs: 'center', md: 'left' },
            maxWidth: { md: 720 },
          }}
        >
          <m.div variants={varFade().inUp}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2rem', sm: '3rem', md: '4.5rem', lg: '5rem' },
                fontWeight: 900,
                lineHeight: { xs: 1.3, md: 1.2 },
                mb: { xs: 2, md: 3 },
                background: `linear-gradient(135deg, ${theme.palette.primary.lighter} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: `0 0 80px ${alpha(theme.palette.primary.main, 0.5)}`,
                letterSpacing: { xs: '-0.02em', md: '-0.03em' },
              }}
            >
              Play Backgammon.
              <br />
              Earn Crypto.
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              variant="h5"
              sx={{
                mb: { xs: 4, md: 5 },
                color: 'text.secondary',
                fontWeight: 400,
                lineHeight: 1.8,
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                maxWidth: { xs: '100%', sm: 600 },
              }}
            >
              Challenge AI, compete globally, watch & predict matches. Earn TRX and BNB through multiple reward systems.
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 2 },
                justifyContent: { xs: 'stretch', md: 'flex-start' },
                mb: { xs: 6, md: 8 },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Button
                component={RouterLink}
                href="/auth/jwt/sign-up"
                size="large"
                variant="contained"
                startIcon={<Box sx={{ fontSize: '1.5rem' }}>🎮</Box>}
                sx={{
                  px: { xs: 4, sm: 5 },
                  py: { xs: 2, sm: 2.5 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { sm: 200 },
                  '&:hover': {
                    boxShadow: `0 12px 48px ${alpha(theme.palette.primary.main, 0.6)}`,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Start Playing Free
              </Button>

              <Button
                size="large"
                variant="outlined"
                sx={{
                  px: { xs: 4, sm: 5 },
                  py: { xs: 2, sm: 2.5 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 700,
                  borderWidth: 2,
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                How It Works
              </Button>
            </Box>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: { xs: 2, sm: 3 },
                maxWidth: { xs: '100%', md: 600 },
              }}
            >
              {[
                { label: 'AI Mode', icon: '🤖' },
                { label: 'Multiplayer', icon: '🌍' },
                { label: 'Watch & Earn', icon: '👁️' },
                { label: 'Predict', icon: '🎯' },
              ].map((feature, index) => (
                <Box
                  key={feature.label}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.05),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.background.paper, 0.1),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                  }}
                >
                  <Typography sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}>{feature.icon}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {feature.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </m.div>
        </Box>

        {/* Animated Game Board Visual */}
        <Box
          sx={{
            position: 'absolute',
            right: { xs: '-20%', md: '-5%' },
            top: '50%',
            transform: 'translateY(-50%)',
            width: { xs: '70%', md: '50%' },
            height: '80%',
            opacity: { xs: 0.1, md: 0.3 },
            pointerEvents: 'none',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 100%)`,
              borderRadius: '50%',
              filter: 'blur(100px)',
              animation: 'float 6s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-30px)' },
              },
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
