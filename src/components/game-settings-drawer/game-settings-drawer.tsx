'use client';

import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { useBoardTheme } from 'src/contexts/board-theme-context';

import { AccountButton } from 'src/layouts/components/account-button';

// ----------------------------------------------------------------------

export type GameSettingsDrawerProps = IconButtonProps & {
  displayName?: string;
  photoURL?: string;
};

export function GameSettingsDrawer({ 
  displayName = 'Player',
  photoURL,
  sx, 
  ...other 
}: GameSettingsDrawerProps) {
  const theme = useTheme();
  const { currentTheme, allThemes, changeTheme } = useBoardTheme();
  const [open, setOpen] = useState(false);

  const handleOpenDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  const handleThemeChange = async (themeId: string) => {
    console.log('🎨 Changing theme to:', themeId);
    try {
      await changeTheme(themeId);
      console.log('✅ Theme changed successfully to:', themeId);
    } catch (error) {
      console.error('❌ Failed to change theme:', error);
    }
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Game Settings
      </Typography>

      <IconButton onClick={handleCloseDrawer}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const renderThemes = (
    <Box sx={{ p: 2.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Board Themes
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: 'repeat(3, 1fr)',
        }}
      >
        {allThemes.map((themeItem) => (
          <Tooltip key={themeItem.id} title={themeItem.name} placement="top">
            <Box
              onClick={() => handleThemeChange(themeItem.id)}
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '100%', // Square aspect ratio
                borderRadius: 1.5,
                cursor: 'pointer',
                bgcolor: themeItem.colors.background,
                border: (muiTheme) =>
                  currentTheme.id === themeItem.id
                    ? `3px solid ${muiTheme.palette.primary.main}`
                    : `2px solid ${varAlpha(muiTheme.palette.grey['500Channel'], 0.2)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: theme.customShadows.z8,
                  borderColor: (muiTheme) =>
                    currentTheme.id === themeItem.id
                      ? muiTheme.palette.primary.main
                      : varAlpha(muiTheme.palette.grey['500Channel'], 0.4),
                },
              }}
            >
              {/* نمایش دایره‌های کوچک رنگی داخل */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: themeItem.colors.darkPoint,
                    border: `2px solid ${varAlpha(theme.palette.common.whiteChannel, 0.2)}`,
                  }}
                />
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: themeItem.colors.lightPoint,
                    border: `2px solid ${varAlpha(theme.palette.common.blackChannel, 0.1)}`,
                  }}
                />
              </Box>

              {/* آیکون قفل برای تم‌های پریمیوم */}
              {themeItem.isPremium && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: theme.customShadows.z8,
                  }}
                >
                  <Iconify icon="solar:star-bold" width={12} sx={{ color: 'common.white' }} />
                </Box>
              )}

              {/* آیکون تیک برای تم فعال */}
              {currentTheme.id === themeItem.id && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: theme.customShadows.z8,
                  }}
                >
                  <Iconify
                    icon="solar:check-circle-bold"
                    width={16}
                    sx={{ color: 'common.white' }}
                  />
                </Box>
              )}

              {/* نام تم در پایین */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: varAlpha(theme.palette.grey['900Channel'], 0.72),
                  backdropFilter: 'blur(8px)',
                  py: 0.5,
                  px: 1,
                  borderBottomLeftRadius: 6,
                  borderBottomRightRadius: 6,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'common.white',
                    fontSize: 10,
                    fontWeight: 600,
                    display: 'block',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {themeItem.name}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        ))}
      </Box>

      <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
        {allThemes.length} themes available • Current: {currentTheme.name}
      </Typography>
    </Box>
  );

  return (
    <>
      <AccountButton
        open={open}
        onClick={handleOpenDrawer}
        photoURL={photoURL || ''}
        displayName={displayName}
        sx={sx}
        {...other}
      />

      <Drawer
        open={open}
        onClose={handleCloseDrawer}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 360 } }}
      >
        {renderHead}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ height: 1, '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' } }}>
          {renderThemes}
        </Scrollbar>
      </Drawer>
    </>
  );
}
