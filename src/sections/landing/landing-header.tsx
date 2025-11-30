'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useTheme, alpha } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { useSettingsContext } from 'src/components/settings';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function LandingHeader() {
  const theme = useTheme();
  const settings = useSettingsContext();

  const handleToggleMode = () => {
    settings.onUpdateField('colorScheme', theme.palette.mode === 'light' ? 'dark' : 'light');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: alpha(theme.palette.background.default, 0.8),
        backdropFilter: 'blur(20px)',
        boxShadow: `0 1px 0 ${alpha(theme.palette.grey[500], 0.08)}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 72 }}>
          {/* Logo */}
          <Box
            component={RouterLink}
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              flexGrow: 1,
            }}
          >
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
              🎲 NardArena
            </Typography>
          </Box>

          {/* Theme Toggle */}
          <IconButton
            onClick={handleToggleMode}
            sx={{
              mr: 1,
              color: 'text.primary',
            }}
          >
            <Iconify
              icon={theme.palette.mode === 'light' ? 'solar:moon-bold' : 'solar:sun-bold'}
              width={24}
            />
          </IconButton>

          {/* Login Button */}
          <Button
            component={RouterLink}
            href="/auth/jwt/sign-in"
            variant="outlined"
            sx={{
              mr: 1,
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          >
            Login
          </Button>

          {/* Sign Up Button */}
          <Button
            component={RouterLink}
            href="/auth/jwt/sign-up"
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            Sign Up
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
