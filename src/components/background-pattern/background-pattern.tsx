'use client';

import { Box } from '@mui/material';
import { memo } from 'react';

// ----------------------------------------------------------------------

type Props = {
  opacity?: number;
  colors?: string[];
};

function BackgroundPatternComponent({ 
  opacity = 0.8, 
  colors = ['#519764', '#8d5986', '#d88d8d', '#6bb1f6']
}: Props) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* لایه Gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, ${colors[0]}33, transparent 50%),
            radial-gradient(circle at 80% 40%, ${colors[1]}2a, transparent 50%),
            radial-gradient(circle at 40% 80%, ${colors[2]}33, transparent 50%),
            radial-gradient(circle at 70% 70%, ${colors[3]}2a, transparent 50%)
          `,
        }}
      />

      {/* پترن سفارشی */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity,
          mixBlendMode: 'overlay',
          backgroundImage: 'url(/assets/patterns/games.svg)',
          backgroundSize: '500px',
          backgroundRepeat: 'repeat',
        }}
      />
    </Box>
  );
}

export const BackgroundPattern = memo(BackgroundPatternComponent);
