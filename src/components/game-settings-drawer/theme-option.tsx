import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha as hexAlpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import type { BoardTheme } from 'src/_mock/_board-themes';

// ----------------------------------------------------------------------

type ThemeOptionProps = ButtonBaseProps & {
  theme: BoardTheme;
  selected: boolean;
};

export function ThemeOption({ theme, selected, ...other }: ThemeOptionProps) {
  const muiTheme = useTheme();

  return (
    <ButtonBase
      sx={{
        width: 1,
        height: 80,
        borderRadius: 1.5,
        flexDirection: 'column',
        gap: 0.5,
        bgcolor: theme.colors.background,
        border: selected
          ? `2px solid ${muiTheme.palette.primary.main}`
          : `1px solid ${hexAlpha(muiTheme.palette.grey[500], 0.12)}`,
        ...(selected && {
          boxShadow: `0 0 0 2px ${hexAlpha(muiTheme.palette.primary.main, 0.08)}`,
        }),
        '&:hover': {
          borderColor: muiTheme.palette.primary.main,
          boxShadow: muiTheme.customShadows.z4,
        },
      }}
      {...other}
    >
      {/* Color preview circles */}
      <Box display="flex" gap={0.75} alignItems="center">
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: theme.colors.darkPoint,
            border: `2px solid ${hexAlpha('#fff', 0.2)}`,
          }}
        />
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: theme.colors.lightPoint,
            border: `2px solid ${hexAlpha('#000', 0.1)}`,
          }}
        />
      </Box>

      {/* Theme name */}
      <Box
        component="span"
        sx={{
          fontSize: 11,
          fontWeight: selected ? 600 : 500,
          color: selected ? 'primary.main' : 'text.secondary',
          lineHeight: 1.2,
          textAlign: 'center',
          px: 1,
        }}
      >
        {theme.name}
      </Box>

      {/* Premium badge */}
      {theme.isPremium && (
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
          }}
        >
          <Iconify icon="solar:star-bold" width={14} sx={{ color: 'warning.main' }} />
        </Box>
      )}

      {/* Selected checkmark */}
      {selected && (
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            left: 4,
          }}
        >
          <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: 'success.main' }} />
        </Box>
      )}
    </ButtonBase>
  );
}
