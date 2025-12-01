'use client';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const LINKS = [
  {
    headline: 'Product',
    children: [
      { name: 'How to Play', href: '#' },
      { name: 'Game Modes', href: '#' },
      { name: 'Earnings System', href: '#' },
      { name: 'Tournaments', href: '#' },
    ],
  },
  {
    headline: 'Company',
    children: [
      { name: 'About Us', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
    ],
  },
  {
    headline: 'Legal',
    children: [
      { name: 'Terms of Service', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'Fair Play', href: '#' },
    ],
  },
];

const SOCIALS = [
  {
    name: 'Twitter',
    icon: 'mdi:twitter',
    href: '#',
    color: '#1DA1F2',
  },
  {
    name: 'Discord',
    icon: 'ic:baseline-discord',
    href: '#',
    color: '#5865F2',
  },
  {
    name: 'Telegram',
    icon: 'ic:baseline-telegram',
    href: '#',
    color: '#0088CC',
  },
  {
    name: 'Instagram',
    icon: 'mdi:instagram',
    href: '#',
    color: '#E4405F',
  },
];

// ----------------------------------------------------------------------

export function LandingFooter() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: 'background.default',
        borderTop: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
      }}
    >
      <Container>
        {/* Main Footer Content */}
        <Box
          sx={{
            display: 'grid',
            gap: 5,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(5, 1fr)',
            },
            mb: 8,
          }}
        >
          {/* Brand Section */}
          <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Logo width={40} height={40} disableLink />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                NardArena
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                mb: 3,
                color: 'text.secondary',
                lineHeight: 1.8,
                maxWidth: 280,
              }}
            >
              The world's first backgammon platform where you can play, watch, predict, and earn
              crypto rewards.
            </Typography>

            {/* Crypto Badges */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  bgcolor: alpha('#FF060A', 0.08),
                  border: `1px solid ${alpha('#FF060A', 0.24)}`,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  💎 TRX
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  bgcolor: alpha('#F3BA2F', 0.08),
                  border: `1px solid ${alpha('#F3BA2F', 0.24)}`,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  ⚡ BNB
                </Typography>
              </Box>
            </Box>

            {/* Social Links */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {SOCIALS.map((social) => (
                <IconButton
                  key={social.name}
                  href={social.href}
                  sx={{
                    color: 'text.secondary',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: social.color,
                      bgcolor: alpha(social.color, 0.08),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Iconify icon={social.icon} width={24} />
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Links Sections */}
          {LINKS.map((section) => (
            <Box key={section.headline}>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                }}
              >
                {section.headline}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {section.children.map((link) => (
                  <Link
                    key={link.name}
                    component={RouterLink}
                    href={link.href}
                    color="text.secondary"
                    underline="none"
                    sx={{
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: 'primary.main',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Bottom Bar */}
        <Box
          sx={{
            pt: 5,
            borderTop: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            © 2025 NardArena. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="#"
              color="text.secondary"
              underline="none"
              sx={{
                fontSize: '0.875rem',
                transition: 'color 0.2s ease',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Privacy
            </Link>
            <Link
              href="#"
              color="text.secondary"
              underline="none"
              sx={{
                fontSize: '0.875rem',
                transition: 'color 0.2s ease',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Terms
            </Link>
            <Link
              href="#"
              color="text.secondary"
              underline="none"
              sx={{
                fontSize: '0.875rem',
                transition: 'color 0.2s ease',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
