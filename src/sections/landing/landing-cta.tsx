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

export function LandingCTA() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.dark, 0.95)} 0%, 
          ${alpha(theme.palette.primary.darker, 1)} 50%,
          ${alpha(theme.palette.background.default, 0.95)} 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 30% 50%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%),
                           radial-gradient(circle at 70% 50%, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 50%)`,
        },
      }}
    >
      <Container component={MotionViewport} sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
          <m.div variants={varFade().inUp}>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.lighter',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: 2,
                mb: 2,
              }}
            >
              Join Now
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              variant="h2"
              sx={{
                mb: 3,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 900,
                color: 'common.white',
                lineHeight: 1.2,
              }}
            >
              Ready to Start Earning?
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              sx={{
                mb: 5,
                color: alpha(theme.palette.common.white, 0.8),
                fontSize: { xs: '1rem', md: '1.25rem' },
                lineHeight: 1.8,
                maxWidth: 640,
                mx: 'auto',
              }}
            >
              Join thousands of players worldwide who are already earning crypto while playing the
              game they love. No deposits, no hidden fees, just pure gaming and earning.
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 2 },
                justifyContent: 'center',
                mb: 6,
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Button
                component={RouterLink}
                href="/login"
                size="large"
                variant="contained"
                startIcon={<Box sx={{ fontSize: '1.5rem' }}>🚀</Box>}
                sx={{
                  px: { xs: 5, sm: 6 },
                  py: { xs: 2.5, sm: 3 },
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 700,
                  bgcolor: 'common.white',
                  color: 'primary.main',
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { sm: 220 },
                  boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.3)}`,
                  '&:hover': {
                    bgcolor: 'common.white',
                    boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.4)}`,
                    transform: 'translateY(-3px) scale(1.02)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Start Earning Now
              </Button>

              <Button
                component={RouterLink}
                href="/login"
                size="large"
                variant="outlined"
                sx={{
                  px: { xs: 5, sm: 6 },
                  py: { xs: 2.5, sm: 3 },
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 700,
                  borderColor: alpha(theme.palette.common.white, 0.3),
                  color: 'common.white',
                  borderWidth: 2,
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: 'common.white',
                    bgcolor: alpha(theme.palette.common.white, 0.15),
                    transform: 'translateY(-3px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Sign In
              </Button>
            </Box>
          </m.div>

          {/* Stats */}
          <m.div variants={varFade().inUp}>
            <Box
              sx={{
                display: 'grid',
                gap: 4,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(3, 1fr)',
                },
                pt: 6,
                borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
              }}
            >
              {[
                { value: '10,000+', label: 'Active Players' },
                { value: '50,000+', label: 'Games Played' },
                { value: '$100K+', label: 'Crypto Earned' },
              ].map((stat, index) => (
                <Box key={stat.label} sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    sx={{
                      mb: 1,
                      fontWeight: 900,
                      color: 'common.white',
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: alpha(theme.palette.common.white, 0.7),
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </m.div>
        </Box>
      </Container>
    </Box>
  );
}
