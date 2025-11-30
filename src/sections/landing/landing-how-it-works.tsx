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

const STEPS = [
  {
    number: '01',
    title: 'Sign Up',
    description: 'Create your free account in just 30 seconds. No credit card required.',
    icon: '👤',
    color: '#00A76F',
  },
  {
    number: '02',
    title: 'Play or Watch',
    description: 'Choose your path: compete in matches, watch live games, or predict outcomes.',
    icon: '🎮',
    color: '#2065D1',
  },
  {
    number: '03',
    title: 'Earn Crypto',
    description: 'Get rewarded in TRX or BNB. Withdraw anytime by providing your wallet address.',
    icon: '💰',
    color: '#7635dc',
  },
];

// ----------------------------------------------------------------------

export function LandingHowItWorks() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 },
        bgcolor: alpha(theme.palette.background.neutral, 0.4),
        position: 'relative',
        overflow: 'hidden',
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
              How It Works
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
              Get Started in 3 Simple Steps
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
              Join thousands of players worldwide and start earning crypto today.
            </Typography>
          </m.div>
        </Box>

        <Box
          sx={{
            position: 'relative',
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          {/* Connection Line */}
          <Box
            sx={{
              position: 'absolute',
              top: 80,
              left: { xs: 40, md: '15%' },
              right: { xs: 40, md: '15%' },
              height: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              display: { xs: 'none', md: 'block' },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'primary.main',
                transformOrigin: 'left',
                animation: 'lineGrow 2s ease-out forwards',
                '@keyframes lineGrow': {
                  '0%': { transform: 'scaleX(0)' },
                  '100%': { transform: 'scaleX(1)' },
                },
              },
            }}
          />

          <Box
            sx={{
              display: 'grid',
              gap: { xs: 6, md: 4 },
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)',
              },
              position: 'relative',
            }}
          >
            {STEPS.map((step, index) => (
              <m.div key={step.number} variants={varFade().inUp}>
                <Box
                  sx={{
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Step Number Circle */}
                  <Box
                    sx={{
                      width: 160,
                      height: 160,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      borderRadius: '50%',
                      position: 'relative',
                      bgcolor: 'background.paper',
                      border: `4px solid ${alpha(step.color, 0.2)}`,
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        border: `4px solid ${step.color}`,
                        boxShadow: `0 12px 32px ${alpha(step.color, 0.3)}`,
                        '& .step-icon': {
                          transform: 'scale(1.2) rotate(-10deg)',
                        },
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -4,
                        borderRadius: '50%',
                        padding: 4,
                        background: `linear-gradient(135deg, ${step.color} 0%, ${alpha(step.color, 0.5)} 100%)`,
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        opacity: 0.5,
                      },
                    }}
                  >
                    <Box
                      className="step-icon"
                      sx={{
                        fontSize: '4rem',
                        transition: 'all 0.4s ease',
                      }}
                    >
                      {step.icon}
                    </Box>

                    {/* Step Number Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: step.color,
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '1.25rem',
                        boxShadow: `0 4px 12px ${alpha(step.color, 0.4)}`,
                      }}
                    >
                      {step.number}
                    </Box>
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{
                      mb: 2,
                      fontWeight: 800,
                    }}
                  >
                    {step.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.8,
                      fontSize: '1rem',
                    }}
                  >
                    {step.description}
                  </Typography>
                </Box>
              </m.div>
            ))}
          </Box>
        </Box>

        {/* CTA Button */}
        <m.div variants={varFade().inUp}>
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button
              component={RouterLink}
              href="/login"
              size="large"
              variant="contained"
              sx={{
                px: 6,
                py: 2.5,
                fontSize: '1.125rem',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.6)}`,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Get Started Now
            </Button>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 2,
                color: 'text.secondary',
              }}
            >
              No credit card required • Free forever
            </Typography>
          </Box>
        </m.div>
      </Container>
    </Box>
  );
}
