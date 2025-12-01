'use client';

import { m, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import { useTheme, useColorScheme } from '@mui/material/styles';

import { varFade, varSlide } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';

import { SettingsButton } from 'src/layouts/components';

import { LoginView } from './login-view';
import { RegisterView } from './register-view';
import { ResetPasswordView } from './reset-password-view';

// ----------------------------------------------------------------------

type AuthMode = 'login' | 'register' | 'reset';

export function AuthContainerView() {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();
  const [mode2, setMode2] = useState<AuthMode>('login');
  const [previousMode, setPreviousMode] = useState<AuthMode>('login');

  const handleModeChange = (newMode: AuthMode) => {
    setPreviousMode(mode2);
    setMode2(newMode);
  };

  // Dice animation at bottom
  const diceIcons = Array.from({ length: 6 }, (_, i) => i + 1);

  // Determine animation based on transition
  const getAnimation = (currentMode: AuthMode) => {
    if (previousMode === 'login' && currentMode === 'login') {
      // Initial load
      return varFade().inUp;
    }
    if (previousMode === 'login' && currentMode === 'register') {
      // Login -> Register: slide in from right
      return varFade().inRight;
    }
    if (previousMode === 'register' && currentMode === 'login') {
      // Register -> Login: slide in from right
      return varFade().inRight;
    }
    if (previousMode === 'login' && currentMode === 'reset') {
      // Login -> Reset: slide in from right
      return varFade().inRight;
    }
    if (previousMode === 'reset' && currentMode === 'login') {
      // Reset -> Login: slide in from right
      return varFade().inRight;
    }
    if (currentMode === 'reset') {
      // Reset password: slide in from left
      return varFade().inLeft;
    }
    return varFade().inUp;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.neutral} 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* Theme toggle button - top right */}
      <Box
        sx={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 999,
        }}
      >
        <IconButton
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          sx={{ width: 40, height: 40 }}
        >
          <Iconify icon={mode === 'light' ? 'solar:moon-bold' : 'solar:sun-bold'} width={24} />
        </IconButton>
      </Box>

      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 20% 50%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 80%, currentColor 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
        }}
      />

      {/* Main content */}
      <Container
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="wait">
          {mode2 === 'login' && (
            <m.div
              key="login"
              {...getAnimation('login')}
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <LoginView
                onSwitchToRegister={() => handleModeChange('register')}
                onSwitchToReset={() => handleModeChange('reset')}
              />
            </m.div>
          )}
          {mode2 === 'register' && (
            <m.div
              key="register"
              {...getAnimation('register')}
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <RegisterView onSwitchToLogin={() => handleModeChange('login')} />
            </m.div>
          )}
          {mode2 === 'reset' && (
            <m.div
              key="reset"
              {...getAnimation('reset')}
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <ResetPasswordView onSwitchToLogin={() => handleModeChange('login')} />
            </m.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Dice animation at bottom */}
      <Stack
        direction="row"
        spacing={3}
        sx={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.2,
          zIndex: 0,
        }}
      >
        {diceIcons.map((num, index) => (
          <m.div
            key={num}
            {...(index % 2 === 0 ? varFade().inLeft : varFade().inRight)}
            transition={{
              duration: 0.8,
              delay: index * 0.15,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                border: 2,
                borderColor: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                animation: `float ${3 + num * 0.5}s ease-in-out infinite`,
                animationDelay: `${num * 0.2}s`,
                '@keyframes float': {
                  '0%, 100%': {
                    transform: 'translateY(0px) rotate(0deg)',
                  },
                  '50%': {
                    transform: 'translateY(-10px) rotate(5deg)',
                  },
                },
              }}
            >
              {/* Dice dots pattern */}
              {num === 1 && (
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
              )}
              {num === 2 && (
                <>
                  <Box sx={{ position: 'absolute', top: 8, left: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ position: 'absolute', bottom: 8, right: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                </>
              )}
              {num === 3 && (
                <>
                  <Box sx={{ position: 'absolute', top: 8, left: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ position: 'absolute', bottom: 8, right: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                </>
              )}
              {num === 4 && (
                <>
                  <Box sx={{ position: 'absolute', top: 8, left: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ position: 'absolute', bottom: 8, left: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ position: 'absolute', bottom: 8, right: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                </>
              )}
              {num === 5 && (
                <>
                  <Box sx={{ position: 'absolute', top: 8, left: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ position: 'absolute', bottom: 8, left: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ position: 'absolute', bottom: 8, right: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                </>
              )}
              {num === 6 && (
                <>
                  <Box sx={{ position: 'absolute', top: 8, left: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ position: 'absolute', bottom: 8, left: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                  <Box sx={{ position: 'absolute', bottom: 8, right: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                </>
              )}
            </Box>
          </m.div>
        ))}
      </Stack>
    </Box>
  );
}
