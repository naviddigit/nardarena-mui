'use client';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type PointTriangleProps = {
  color: string;
  direction: 'up' | 'down';
  width: number;
  height: number;
};

// ----------------------------------------------------------------------

export function PointTriangle({ color, direction, width, height }: PointTriangleProps) {
  return (
    <Box
      sx={{
        width,
        height,
        bgcolor: color,
        clipPath:
          direction === 'down'
            ? 'polygon(50% 100%, 0 0, 100% 0)'
            : 'polygon(50% 0, 0 100%, 100% 100%)',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
}
