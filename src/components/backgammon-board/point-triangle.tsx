'use client';

import { memo } from 'react';
import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type PointTriangleProps = BoxProps & {
  color: string;
  direction: 'up' | 'down';
  width: number;
  height: number;
};

// ----------------------------------------------------------------------

const CLIP_PATHS = {
  down: 'polygon(50% 100%, 0 0, 100% 0)',
  up: 'polygon(50% 0, 0 100%, 100% 100%)',
} as const;

export const PointTriangle = memo(function PointTriangle({
  color,
  direction,
  width,
  height,
  sx,
  ...other
}: PointTriangleProps) {
  return (
    <Box
      sx={{
        width,
        height,
        bgcolor: color,
        clipPath: CLIP_PATHS[direction],
        WebkitClipPath: CLIP_PATHS[direction],
        position: 'absolute',
        top: direction === 'down' ? 0 : 'auto',
        bottom: direction === 'up' ? 0 : 'auto',
        left: 0,
        borderRadius: '25px',
        ...sx,
      }}
      {...other}
    />
  );
});
