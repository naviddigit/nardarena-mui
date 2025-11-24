'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { Iconify } from 'src/components/iconify';
import { DiceRoller } from 'src/components/dice-roller';
import { BackgammonBoard, type BoardState } from 'src/components/backgammon-board';

// ----------------------------------------------------------------------

// Initial board state (standard backgammon starting position)
const createInitialBoardState = (): BoardState => {
  const points = Array.from({ length: 24 }, () => ({
    checkers: [] as ('white' | 'black')[],
    count: 0,
  }));

  // White checkers starting positions
  points[0] = { checkers: Array(2).fill('white') as ('white' | 'black')[], count: 2 };
  points[11] = { checkers: Array(5).fill('white') as ('white' | 'black')[], count: 5 };
  points[16] = { checkers: Array(3).fill('white') as ('white' | 'black')[], count: 3 };
  points[18] = { checkers: Array(5).fill('white') as ('white' | 'black')[], count: 5 };

  // Black checkers starting positions
  points[23] = { checkers: Array(2).fill('black') as ('white' | 'black')[], count: 2 };
  points[12] = { checkers: Array(5).fill('black') as ('white' | 'black')[], count: 5 };
  points[7] = { checkers: Array(3).fill('black') as ('white' | 'black')[], count: 3 };
  points[5] = { checkers: Array(5).fill('black') as ('white' | 'black')[], count: 5 };

  return {
    points,
    bar: { white: 0, black: 0 },
    off: { white: 0, black: 0 },
  };
};

// ----------------------------------------------------------------------

export default function GameAIPage() {
  const settings = useSettingsContext();
  const [diceResults, setDiceResults] = useState<{ value: number; type: string }[]>([]);
  const [boardState] = useState<BoardState>(createInitialBoardState());

  const handleDiceRollComplete = (results: { value: number; type: string }[]) => {
    setDiceResults(results);
  };

  const handlePointClick = (pointIndex: number) => {
    console.log('Point clicked:', pointIndex);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
          href="/dashboard"
        >
          Back to Dashboard
        </Button>

        <Typography variant="h4">Play vs AI</Typography>

        <IconButton
          onClick={() => {
            settings.onUpdateField('colorScheme', settings.colorScheme === 'light' ? 'dark' : 'light');
          }}
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'background.neutral',
          }}
        >
          <Iconify
            icon={settings.colorScheme === 'light' ? 'solar:moon-bold-duotone' : 'solar:sun-bold-duotone'}
            width={24}
          />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={3} alignItems="flex-start">
        {/* Game Board */}
        <Box sx={{ flex: 1 }}>
          <BackgammonBoard boardState={boardState} onPointClick={handlePointClick} />
        </Box>

        {/* Right Sidebar */}
        <Stack spacing={3} sx={{ width: 400 }}>
          {/* Dice Roller */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              🎲 Roll Dice
            </Typography>
            <DiceRoller diceNotation="2d6" onRollComplete={handleDiceRollComplete} />

            {diceResults.length > 0 && (
              <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center' }}>
                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                  Results:
                </Typography>
                {diceResults.map((result, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 1,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      fontWeight: 'bold',
                      boxShadow: (theme) => theme.shadows[4],
                    }}
                  >
                    {result.value}
                  </Box>
                ))}
              </Stack>
            )}
          </Card>

          {/* Game Info */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Game Info
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Current Turn
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  White
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  White Off
                </Typography>
                <Typography variant="body2">{boardState.off.white}/15</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Black Off
                </Typography>
                <Typography variant="body2">{boardState.off.black}/15</Typography>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
}
