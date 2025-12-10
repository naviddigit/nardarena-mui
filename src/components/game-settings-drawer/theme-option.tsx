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
        width: 100,
        height: 'auto',
        borderRadius: 1.5,
        flexDirection: 'column',
        gap: 0.75,
        p: 1,
        bgcolor: 'background.paper',
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
        position: 'relative',
      }}
      {...other}
    >
      {/* Color preview box */}
      <Box
        sx={{
          width: '100%',
          height: 40,
          borderRadius: 1,
          bgcolor: theme.colors.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.75,
          border: `1px solid ${hexAlpha(muiTheme.palette.grey[500], 0.1)}`,
        }}
      >
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: theme.colors.darkPoint,
            border: `2px solid ${hexAlpha('#fff', 0.3)}`,
            boxShadow: 1,
          }}
        />
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: theme.colors.lightPoint,
            border: `2px solid ${hexAlpha('#000', 0.15)}`,
            boxShadow: 1,
          }}
        />
      </Box>

      {/* Theme name */}
      <Box
        component="span"
        sx={{
          fontSize: 10,
          fontWeight: selected ? 600 : 500,
          color: selected ? 'primary.main' : 'text.secondary',
          lineHeight: 1.2,
          textAlign: 'center',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {theme.nameEn || theme.name}
      </Box>

      {/* Premium badge */}
      {theme.isPremium && (
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
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
            top: 6,
            left: 6,
          }}
        >
          <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: 'success.main' }} />
        </Box>
      )}
    </ButtonBase>
  );
}
