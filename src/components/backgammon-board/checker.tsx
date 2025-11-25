'use client';

import type { BoxProps } from '@mui/material/Box';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';

import { varAlpha } from 'src/theme/styles';

import type { Player } from './types';

// ----------------------------------------------------------------------

type CheckerProps = BoxProps & {
  player: Player;
  size: number;
  yPosition: number;
  layoutId: string;
  isSelected?: boolean;
  onCheckerClick?: () => void;
};

// ----------------------------------------------------------------------

export function Checker({ player, size, x, y, isSelected, onCheckerClick, sx, ...other }: CheckerProps & { x?: number, y?: number }) {
  return (
    <Box
      component={m.div}
      initial={false}
      animate={{ 
        x, 
        y,
        opacity: 1, 
        scale: 1 
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        mass: 1
      }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onCheckerClick?.();
      }}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
        cursor: 'pointer',
        // White checkers
        ...(player === 'white' && {
          background: 'linear-gradient(135deg, #FFFFFF 0%, #c7c7c7ff 50%, #E8E8E8 100%)',
          border: isSelected ? '4px solid #1976d2' : '2px solid #8a8a8aff',
          boxShadow: (theme) => 
            `0 4px 12px ${varAlpha(theme.vars.palette.common.blackChannel, 0.2)}, inset 0 2px 4px ${varAlpha(theme.vars.palette.common.whiteChannel, 0.8)}`,
        }),
        // Black checkers with reflection
        ...(player === 'black' && {
          background: 'linear-gradient(135deg, #1976d2 0%, #424242ff 40%, #1A1A1A 70%, #000000 100%)',
          border: isSelected ? '4px solid #1976d2' : '2px solid #d4d4d4ff',
          boxShadow: (theme) => 
            `0 4px 12px ${varAlpha(theme.vars.palette.common.blackChannel, 0.5)}, inset -2px -2px 8px ${varAlpha(theme.vars.palette.common.whiteChannel, 0.15)}, inset 2px 2px 4px ${varAlpha(theme.vars.palette.common.blackChannel, 0.3)}`,
        }),
        '&:hover': {
          filter: 'brightness(1.1)',
          boxShadow: (theme) => 
            player === 'white'
              ? `0 6px 20px ${varAlpha(theme.vars.palette.common.blackChannel, 0.3)}, inset 0 2px 4px ${varAlpha(theme.vars.palette.common.whiteChannel, 0.9)}`
              : `0 6px 20px ${varAlpha(theme.vars.palette.common.blackChannel, 0.7)}, inset -2px -2px 10px ${varAlpha(theme.vars.palette.common.whiteChannel, 0.2)}`,
        },
        '&:active': {
          filter: 'brightness(0.9)',
        },
        ...sx,
      }}
      {...other}
    />
  );
}
