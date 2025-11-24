import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title: string;
  description: string;
  icon: string;
  color?: 'primary' | 'info' | 'warning' | 'error' | 'success';
  enabled: boolean;
  comingSoon?: boolean;
  onPlay: () => void;
};

export function GameModeCard({
  title,
  description,
  icon,
  color = 'primary',
  enabled,
  comingSoon,
  onPlay,
  sx,
  ...other
}: Props) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: { xs: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 2,
        transition: 'all 0.3s ease-in-out',
        opacity: enabled ? 1 : 0.6,
        height: 1,
        ...(enabled && {
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: theme.shadows[20],
          },
        }),
        ...sx,
      }}
      {...other}
    >
      {/* Coming Soon Badge */}
      {comingSoon && (
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Chip label="Coming Soon" size="small" color="warning" sx={{ fontWeight: 600 }} />
        </Box>
      )}

      {/* Icon */}
      <Box
        sx={{
          width: { xs: 80, md: 100 },
          height: { xs: 80, md: 100 },
          flexShrink: 0,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.16),
          color: `${color}.main`,
          mb: 2,
        }}
      >
        <Iconify icon={icon} width={{ xs: 48, md: 64 }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </Box>

      {/* Action Button */}
      <Button
        variant={enabled ? 'contained' : 'outlined'}
        color={color}
        size="large"
        fullWidth
        disabled={!enabled}
        onClick={onPlay}
        sx={{
          mt: 'auto',
        }}
      >
        {enabled ? 'Play Now' : 'Locked'}
      </Button>
    </Card>
  );
}
