'use client';

import type { BoxProps } from '@mui/material/Box';

import { m, AnimatePresence } from 'framer-motion';

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
  isPlayable?: boolean;
  isRotated?: boolean;
  onCheckerClick?: () => void;
};

// ----------------------------------------------------------------------

export function Checker({ player, size, yPosition, layoutId, isSelected, isPlayable, onCheckerClick, sx, ...other }: CheckerProps) {
  return (
    <Box
      component={m.div}
      layoutId={layoutId}
      initial={false}
      animate={{ 
        opacity: 1, 
        scale: isSelected ? [1, 1.1, 1] : 1,
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ 
        type: 'spring', 
        stiffness: 200,
        damping: 25,
        mass: 0.6,
        opacity: { duration: 0.2 },
        scale: isSelected ? {
          repeat: Infinity,
          duration: 0.8,
          ease: 'easeInOut',
        } : { duration: 0.2 },
        layout: { 
          type: 'spring',
          stiffness: 200,
          damping: 25,
          mass: 0.6,
          duration: 0.5
        }
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
        top: yPosition,
        left: `calc(50% - ${size / 2}px)`,
        cursor: 'pointer',
        zIndex: 15, // Higher than count labels (10) and valid indicators (5)
        // White checkers
        ...(player === 'white' && {
          background: 'linear-gradient(135deg, #FFFFFF 0%, #c7c7c7ff 50%, #E8E8E8 100%)',
          border: (theme) => (isPlayable || isSelected) ? `4px solid ${theme.vars.palette.primary.main}` : '2px solid #8a8a8aff',
          boxShadow: (theme) => 
            `0 4px 12px ${varAlpha(theme.vars.palette.common.blackChannel, 0.2)}, inset 0 2px 4px ${varAlpha(theme.vars.palette.common.whiteChannel, 0.8)}`,
        }),
        // Black checkers with reflection
        ...(player === 'black' && {
          background: 'linear-gradient(135deg, #1976d2 0%, #424242ff 40%, #1A1A1A 70%, #000000 100%)',
          border: (theme) => (isPlayable || isSelected) ? `4px solid ${theme.vars.palette.primary.main}` : '2px solid #d4d4d4ff',
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
