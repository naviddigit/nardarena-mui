'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { varFade, MotionViewport } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// ⚠️ DO NOT MODIFY - Landing content must reflect actual payment system
// Users earn USDT only via TRC20 (Tron) and BSC (Binance Smart Chain) networks

const EARNING_METHODS = [
  {
    icon: '🎮',
    title: 'Play to Earn',
    description: 'Win matches and earn USDT rewards. The more you play and win, the more you earn.',
    example: 'Win 10 games = ~$50 USDT',
    color: '#00A76F',
    features: ['Instant rewards', 'No deposit required', 'Skill-based earnings', 'Competitive rates'],
  },
  {
    icon: '👁️',
    title: 'Watch to Earn',
    description: 'Earn USDT just by watching live matches. Engage with the community and get rewarded.',
    example: 'Watch 20 games = ~$10 USDT',
    color: '#2065D1',
    features: ['Passive income', 'No gaming required', 'Community engagement', 'Regular payouts'],
  },
  {
    icon: '🎯',
    title: 'Predict to Earn',
    description: 'Predict match outcomes and share the commission pool. Test your analytical skills.',
    example: 'Correct predictions = Up to 30% commission',
    color: '#7635dc',
    features: ['Share commission pool', 'Multiple predictions', 'Strategic thinking', 'High rewards'],
  },
];

// ----------------------------------------------------------------------

export function LandingEarnings() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 },
        bgcolor: 'background.default',
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
              Earning System
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
              Multiple Ways to Earn Crypto
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
              Whether you're a player, spectator, or analyst, there's an earning opportunity for you.
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
            mb: { xs: 6, md: 8 },
          }}
        >
          {EARNING_METHODS.map((method, index) => (
            <m.div key={method.title} variants={varFade().inUp}>
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
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: `0 32px 64px ${alpha(method.color, 0.24)}`,
                    '& .earning-icon': {
                      transform: 'scale(1.2) rotate(-8deg)',
                    },
                    '&::before': {
                      height: '100%',
                      opacity: 0.05,
                    },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    bgcolor: method.color,
                    transition: 'all 0.4s ease',
                    opacity: 1,
                  },
                }}
              >
                <Box
                  className="earning-icon"
                  sx={{
                    width: 70,
                    height: 70,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: alpha(method.color, 0.08),
                    transition: 'all 0.4s ease',
                  }}
                >
                  {method.icon}
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                  }}
                >
                  {method.title}
                </Typography>

                <Typography
                  sx={{
                    mb: 3,
                    color: 'text.secondary',
                    lineHeight: 1.8,
                    flexGrow: 1,
                  }}
                >
                  {method.description}
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: alpha(method.color, 0.08),
                    border: `1px dashed ${alpha(method.color, 0.24)}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: method.color,
                      textAlign: 'center',
                    }}
                  >
                    {method.example}
                  </Typography>
                </Box>

                <Box>
                  {method.features.map((feature, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: method.color,
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </m.div>
          ))}
        </Box>

        {/* Crypto Payment Logos */}
        <m.div variants={varFade().inUp}>
          <Box
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.24)}`,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
                letterSpacing: 2,
                mb: 3,
                display: 'block',
              }}
            >
              Supported Cryptocurrencies
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                    mx: 'auto',
                    borderRadius: '50%',
                    bgcolor: alpha('#26A17B', 0.08),
                  }}
                >
                  <Iconify icon="cryptocurrency:usdt" width={40} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  USDT (TRC20)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Tron Network
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                    mx: 'auto',
                    borderRadius: '50%',
                    bgcolor: alpha('#26A17B', 0.08),
                  }}
                >
                  <Iconify icon="cryptocurrency:usdt" width={40} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  USDT (BSC)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Binance Smart Chain
                </Typography>
              </Box>
            </Box>
          </Box>
        </m.div>
      </Container>
    </Box>
  );
}
