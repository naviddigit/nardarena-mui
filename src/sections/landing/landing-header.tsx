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

import { bgBlur, varAlpha } from 'src/theme/styles';

import { useSettingsContext } from 'src/components/settings';
import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function LandingHeader() {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();
  const settings = useSettingsContext();

  const handleToggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    settings.onUpdateField('colorScheme', newMode);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        ...bgBlur({ color: varAlpha(theme.vars.palette.background.defaultChannel, 0.8) }),
        boxShadow: `0 1px 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 72 }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexGrow: 1,
            }}
          >
            <Logo width={40} height={40} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: 'text.primary',
              }}
            >
              NardArena
            </Typography>
          </Box>

          {/* Theme Toggle */}
          <IconButton
            onClick={handleToggleMode}
            sx={{
              mr: 1,
              color: 'text.primary',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.16),
              },
            }}
          >
            <Iconify
              icon={mode === 'light' ? 'solar:moon-bold' : 'solar:sun-bold'}
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
              borderColor: alpha(theme.palette.text.primary, 0.3),
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.main',
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
