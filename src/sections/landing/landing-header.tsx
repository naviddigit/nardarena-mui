'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useTheme, alpha, useColorScheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function LandingHeader() {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();

  const handleToggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: theme.palette.mode === 'dark' ? alpha('#000000', 0.95) : alpha('#FFFFFF', 0.95),
        backdropFilter: 'blur(20px)',
        boxShadow: theme.palette.mode === 'dark' 
          ? `0 1px 0 ${alpha(theme.palette.grey[800], 0.8)}, 0 4px 20px ${alpha('#000000', 0.5)}`
          : `0 1px 0 ${alpha(theme.palette.grey[300], 0.8)}, 0 4px 20px ${alpha('#000000', 0.1)}`,
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
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.grey[900],
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
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
              color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.grey[900],
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.16),
              },
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
            href="/login"
            variant="outlined"
            sx={{
              mr: 1,
              display: { xs: 'none', sm: 'inline-flex' },
              borderColor: theme.palette.mode === 'dark' ? alpha('#FFFFFF', 0.3) : alpha(theme.palette.grey[900], 0.3),
              color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.grey[900],
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            Login
          </Button>

          {/* Sign Up Button */}
          <Button
            component={RouterLink}
            href="/login"
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
