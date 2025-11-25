'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

type DiceDisplayProps = {
  values: number[];
};

export function DiceDisplay({ values }: DiceDisplayProps) {
  if (!values || values.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        p: 1.5,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
        boxShadow: (theme) => theme.shadows[4],
      }}
    >
      {values.map((value, index) => (
        <Box
          key={index}
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.shadows[2],
            fontWeight: 'bold',
            fontSize: '1.25rem',
            color: 'text.primary',
          }}
        >
          {value}
        </Box>
      ))}
    </Box>
  );
}
