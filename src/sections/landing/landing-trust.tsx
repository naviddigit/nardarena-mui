'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function LandingTrust() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: alpha(theme.palette.background.neutral, 0.3),
      }}
    >
      <Container component={MotionViewport}>
        <m.div variants={varFade().inUp}>
          <Typography
            variant="overline"
            sx={{
              textAlign: 'center',
              display: 'block',
              color: 'text.secondary',
              fontWeight: 700,
              mb: 4,
              letterSpacing: 2,
            }}
          >
            Trusted By Players Worldwide
          </Typography>
        </m.div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(4, 1fr)',
            },
            gap: { xs: 3, sm: 4, md: 6 },
          }}
        >
          {[
            { icon: '🔒', label: 'Secure', value: '256-bit SSL' },
            { icon: '⚡', label: 'Fast', value: 'Instant Payouts' },
            { icon: '🌐', label: 'Global', value: '150+ Countries' },
            { icon: '✅', label: 'Verified', value: 'Licensed Platform' },
          ].map((item, index) => (
            <m.div key={item.label} variants={varFade().inUp}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
                <Typography sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, mb: 1 }}>
                  {item.icon}
                </Typography>
                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  {item.value}
                </Typography>
              </Box>
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
