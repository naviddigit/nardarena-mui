'use client';

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

export function PointTriangle({
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
        position: 'absolute',
        top: 0,
        left: 0,
        ...sx,
      }}
      {...other}
    />
  );
}
