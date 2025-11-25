'use client';

import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

export type DiceResult = {
  value: number;
  type: string;
};

type SimpleDiceProps = {
  diceNotation?: string;
  onRollComplete?: (results: DiceResult[]) => void;
};

export default function SimpleDice({ diceNotation = '2d6', onRollComplete }: SimpleDiceProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<number[]>([]);

  const rollDice = () => {
    if (isRolling) return;

    setIsRolling(true);
    setDiceValues([]);

    // Parse notation (e.g., "2d6")
    const match = diceNotation.match(/(\d+)d(\d+)/);
    if (!match) {
      setIsRolling(false);
      return;
    }

    const numDice = parseInt(match[1], 10);
    const diceSides = parseInt(match[2], 10);

    // Animate dice rolling
    let frame = 0;
    const maxFrames = 20; // 20 frames = ~333ms animation

    const animate = () => {
      frame++;

      // Show random values during animation
      const tempValues = Array.from({ length: numDice }, () =>
        Math.floor(Math.random() * diceSides) + 1
      );
      setDiceValues(tempValues);

      if (frame < maxFrames) {
        setTimeout(animate, 16); // ~60fps
      } else {
        // Final roll
        const finalValues = Array.from({ length: numDice }, () =>
          Math.floor(Math.random() * diceSides) + 1
        );
        setDiceValues(finalValues);
        setIsRolling(false);

        // Call completion callback
        const results: DiceResult[] = finalValues.map((value) => ({
          value,
          type: `d${diceSides}`,
        }));
        onRollComplete?.(results);
      }
    };

    animate();
  };

  return (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      <Stack spacing={2} alignItems="center">
        {/* Dice Display */}
        <Stack direction="row" spacing={2}>
          {diceValues.map((value, index) => (
            <Box
              key={index}
              sx={{
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                border: 2,
                borderColor: 'divider',
                borderRadius: 2,
                fontSize: 32,
                fontWeight: 'bold',
                color: 'text.primary',
                boxShadow: 3,
                transform: isRolling ? 'rotate(360deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
              }}
            >
              {value}
            </Box>
          ))}
        </Stack>

        {/* Roll Button */}
        <Button
          variant="contained"
          size="large"
          onClick={rollDice}
          disabled={isRolling}
          sx={{ minWidth: 200 }}
        >
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </Button>

        {/* Result Display */}
        {diceValues.length > 0 && !isRolling && (
          <Typography variant="h6" color="text.secondary">
            Result: {diceValues.join(' + ')} = {diceValues.reduce((a, b) => a + b, 0)}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
