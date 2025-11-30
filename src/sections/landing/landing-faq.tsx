'use client';

import { m } from 'framer-motion';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const FAQS = [
  {
    question: 'How do I start earning crypto?',
    answer:
      'Simply sign up for a free account, verify your email, and you can start earning immediately. You can earn by playing games, watching matches, or predicting outcomes. No deposits required!',
  },
  {
    question: 'Which cryptocurrencies do you support?',
    answer:
      'We currently support TRX (Tron) and BNB (Binance Smart Chain) for all transactions. Both offer fast, low-cost transactions and instant withdrawals to your wallet.',
  },
  {
    question: 'Is there a minimum withdrawal amount?',
    answer:
      'Yes, the minimum withdrawal is $5 worth of crypto. This ensures that transaction fees don\'t eat into your earnings. You can withdraw anytime once you reach this threshold.',
  },
  {
    question: 'How does the watch-to-earn system work?',
    answer:
      'When you watch live matches, you earn points based on viewing time and engagement. These points are automatically converted to crypto rewards daily. The more you watch, the more you earn!',
  },
  {
    question: 'Can I play for free?',
    answer:
      'Absolutely! You can play against AI opponents for free to practice and improve your skills. When you\'re ready, you can join online matches or tournaments to compete for real crypto rewards.',
  },
  {
    question: 'How accurate is the AI opponent?',
    answer:
      'Our AI uses advanced algorithms to provide challenging gameplay at multiple difficulty levels. From beginner to expert, our AI adapts to your skill level for the best training experience.',
  },
];

// ----------------------------------------------------------------------

export function LandingFAQ() {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<number | false>(0);

  const handleChange = (panel: number) => {
    setExpanded(expanded === panel ? false : panel);
  };

  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 },
        bgcolor: 'background.default',
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
              FAQ
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
              Frequently Asked Questions
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
              Got questions? We've got answers. Can't find what you're looking for? Contact our support team.
            </Typography>
          </m.div>
        </Box>

        <Box
          sx={{
            maxWidth: 800,
            mx: 'auto',
          }}
        >
          {FAQS.map((faq, index) => (
            <m.div key={index} variants={varFade().inUp}>
              <Box
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <Box
                  onClick={() => handleChange(index)}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    gap: 2,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      color: expanded === index ? 'primary.main' : 'text.primary',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {faq.question}
                  </Typography>

                  <Iconify
                    icon={expanded === index ? 'eva:minus-outline' : 'eva:plus-outline'}
                    width={24}
                    sx={{
                      color: expanded === index ? 'primary.main' : 'text.secondary',
                      flexShrink: 0,
                      transition: 'all 0.3s ease',
                    }}
                  />
                </Box>

                <Collapse in={expanded === index}>
                  <Box
                    sx={{
                      px: { xs: 2.5, sm: 3 },
                      pb: { xs: 2.5, sm: 3 },
                      pt: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.8,
                        fontSize: { xs: '0.9rem', sm: '0.95rem' },
                      }}
                    >
                      {faq.answer}
                    </Typography>
                  </Box>
                </Collapse>
              </Box>
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
