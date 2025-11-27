import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from 'src/components/iconify';
import { useBoardTheme } from 'src/contexts/board-theme-context';

// ----------------------------------------------------------------------

export function ThemeSwitcher() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const { currentTheme, allThemes, changeTheme } = useBoardTheme();

  const handleThemeChange = async (themeId: string) => {
    console.log('🎨 Changing theme to:', themeId);
    try {
      await changeTheme(themeId);
      console.log('✅ Theme changed successfully to:', themeId);
    } catch (error) {
      console.error('❌ Failed to change theme:', error);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(12px)',
        borderRadius: 10,
        p: 1,
        boxShadow: (theme) => theme.customShadows.z20,
        maxWidth: isMobile ? 'calc(100vw - 32px)' : 'auto',
        overflowX: isMobile ? 'auto' : 'visible',
        overflowY: 'visible',
        '&::-webkit-scrollbar': {
          height: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'primary.main',
          borderRadius: 2,
        },
      }}
    >
      {allThemes.map((themeItem) => (
        <Tooltip key={themeItem.id} title={themeItem.name} placement="top">
          <IconButton
            size="large"
            onClick={() => handleThemeChange(themeItem.id)}
            sx={{
              width: 48,
              height: 48,
              bgcolor: themeItem.colors.background,
              position: 'relative',
              border: (muiTheme) =>
                currentTheme.id === themeItem.id
                  ? `3px solid ${muiTheme.palette.primary.main}`
                  : `2px solid ${alpha(muiTheme.palette.grey[500], 0.3)}`,
              '&:hover': {
                transform: 'scale(1.15)',
                boxShadow: (muiTheme) => muiTheme.customShadows.z16,
              },
              transition: 'all 0.2s',
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
                gap: 0.4,
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: themeItem.colors.darkPoint,
                }}
              />
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: themeItem.colors.lightPoint,
                }}
              />
            </Box>

            {/* آیکون قفل برای تم‌های پریمیوم */}
            {themeItem.isPremium && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  bgcolor: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:star-bold" width={11} sx={{ color: 'common.white' }} />
              </Box>
            )}

            {/* آیکون تیک برای تم فعال */}
            {currentTheme.id === themeItem.id && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -6,
                  left: -6,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:check-circle-bold" width={14} sx={{ color: 'common.white' }} />
              </Box>
            )}
          </IconButton>
        </Tooltip>
      ))}
    </Stack>
  );
}
