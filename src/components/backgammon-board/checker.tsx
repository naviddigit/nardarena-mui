import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

type CheckerProps = {
  player: 'white' | 'black';
  size: number;
  top?: number;
  bottom?: number;
};

// ----------------------------------------------------------------------

export function Checker({ player, size, top, bottom }: CheckerProps) {
  const color = player === 'white' ? '#F5F5F5' : '#1A1A1A';
  const borderColor = player === 'white' ? '#D0D0D0' : '#000000';

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: color,
        border: `2px solid ${borderColor}`,
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        ...(top !== undefined && { top }),
        ...(bottom !== undefined && { bottom }),
        boxShadow: `0 2px 8px ${alpha('#000', 0.3)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth transition for movement
        transitionProperty: 'top, bottom, left, transform, box-shadow',
        '&:hover': {
          transform: 'translateX(-50%) scale(1.05)',
          boxShadow: `0 4px 12px ${alpha('#000', 0.4)}`,
        },
      }}
    />
  );
}
