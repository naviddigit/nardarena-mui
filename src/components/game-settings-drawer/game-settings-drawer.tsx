'use client';

import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useColorScheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { BottomDrawer } from 'src/components/bottom-drawer';

import { AccountButton } from 'src/layouts/components/account-button';

import { ThemeOptions } from './theme-options';

// ----------------------------------------------------------------------

export type GameSettingsDrawerProps = IconButtonProps & {
  displayName?: string;
  photoURL?: string;
  currentSet?: number;
  maxSets?: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onShare?: () => void;
  onExitGame?: () => void;
  canShare?: boolean;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  open?: boolean;
  onClose?: () => void;
  hideButton?: boolean;
};

export function GameSettingsDrawer({ 
  displayName = 'Player',
  photoURL,
  currentSet = 1,
  maxSets = 5,
  isMuted = false,
  onToggleMute,
  onShare,
  onExitGame,
  canShare = true,
  anchor = 'bottom',
  open: externalOpen,
  onClose: externalOnClose,
  hideButton = false,
  sx, 
  ...other 
}: GameSettingsDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const { mode, setMode } = useColorScheme();

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnClose !== undefined 
    ? (value: boolean) => { if (!value) externalOnClose(); }
    : setInternalOpen;

  const handleOpenDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  const handleAction = useCallback((callback?: () => void) => {
    if (callback) {
      callback();
    }
    handleCloseDrawer();
  }, [handleCloseDrawer]);

  return (
    <>
      {!hideButton && (
        <AccountButton
          open={open}
          onClick={handleOpenDrawer}
          photoURL={photoURL || ''}
          displayName={displayName}
          sx={sx}
          {...other}
        />
      )}

      <BottomDrawer
        open={open}
        onClose={handleCloseDrawer}
        title="Game Menu"
        maxWidth="sm"
        showHandle
        heightPercentage={80}
      >
        {/* Game Info - Compact */}
        <Box sx={{ py: 0.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Match Progress
            </Typography>
            <Typography variant="body2" fontWeight="600" color="primary.main">
              Set {currentSet} / {maxSets}
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

        {/* Theme Options */}
        <Box sx={{ pt: 0, pb: 1 }}>
          <ThemeOptions />
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

        {/* Quick Actions */}
        <Box sx={{ py: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
            Quick Actions
          </Typography>
          <Stack spacing={1}>
            {/* Share Game */}
            <ListItemButton
              onClick={() => handleAction(onShare)}
              disabled={!canShare}
              sx={{
                borderRadius: 1.5,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Iconify icon="solar:share-bold" width={24} />
              </ListItemIcon>
              <ListItemText 
                primary="Share Game" 
                secondary="Copy invite link"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>

            {/* Sound Toggle */}
            <ListItemButton
              onClick={() => {
                // فقط mute/unmute بشه، drawer بسته نشه
                if (onToggleMute) {
                  onToggleMute();
                }
              }}
              sx={{
                borderRadius: 1.5,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Iconify 
                  icon={isMuted ? 'solar:volume-cross-bold' : 'solar:volume-loud-bold'} 
                  width={24}
                />
              </ListItemIcon>
              <ListItemText 
                primary={isMuted ? 'Unmute Sounds' : 'Mute Sounds'}
                secondary={isMuted ? 'Enable game sounds' : 'Disable game sounds'}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>

            {/* Dark/Light Mode Toggle */}
            <ListItemButton
              onClick={() => {
                setMode(mode === 'dark' ? 'light' : 'dark');
              }}
              sx={{
                borderRadius: 1.5,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Iconify 
                  icon={mode === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold'} 
                  width={24}
                />
              </ListItemIcon>
              <ListItemText 
                primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                secondary={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>

            {/* Exit Game */}
            <ListItemButton
              onClick={() => handleAction(onExitGame)}
              sx={{
                borderRadius: 1.5,
                '&:hover': { bgcolor: 'error.lighter' },
                color: 'error.main',
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <Iconify icon="solar:logout-2-bold" width={24} />
              </ListItemIcon>
              <ListItemText 
                primary="Exit Game"
                secondary="Back to dashboard"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>
          </Stack>
        </Box>
      </BottomDrawer>
    </>
  );
}
