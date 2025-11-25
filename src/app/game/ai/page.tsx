'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';

import { useGameState } from 'src/hooks/use-game-state';

import { Iconify } from 'src/components/iconify';
import { DiceRoller } from 'src/components/dice-roller';
import { SplashScreen } from 'src/components/loading-screen';
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
  const [diceResults, setDiceResults] = useState<{ value: number; type: string }[]>([]);
  const { mode, setMode } = useColorScheme();
  
  const initialBoardState = createInitialBoardState();
  const { gameState, handleDiceRoll, handlePointClick, validDestinations } = useGameState(initialBoardState);

  console.log('GameAIPage render:', {
    selectedPoint: gameState.selectedPoint,
    validDestinations,
    diceValues: gameState.diceValues,
    point0: gameState.boardState.points[0]?.count,
    point1: gameState.boardState.points[1]?.count,
  });

  const handleDiceRollComplete = (results: { value: number; type: string }[]) => {
    console.log('Dice rolled:', results);
    setDiceResults(results);
    handleDiceRoll(results);
    console.log('After handleDiceRoll, gameState:', gameState);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Button
          variant="contained"
          href="/dashboard"
          sx={{
            boxShadow: 2,
            border: 1,
            borderColor: 'divider',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          ← Back to Dashboard
        </Button>

        <Typography variant="h4">Play vs AI</Typography>

        <IconButton
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          sx={{
            width: 40,
            height: 40,
          }}
        >
          <Iconify icon={mode === 'light' ? 'ph:moon-duotone' : 'ph:sun-duotone'} width={24} />
        </IconButton>
      </Stack>

      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={3} 
        alignItems="flex-start"
      >
        {/* Game Board with Dice Roller */}
        <Box sx={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <BackgammonBoard 
            boardState={gameState.boardState} 
            onPointClick={handlePointClick}
            selectedPoint={gameState.selectedPoint}
            validDestinations={validDestinations}
            diceRoller={<DiceRoller diceNotation="2d6" onRollComplete={handleDiceRollComplete} />}
            dicePosition={{ 
              top: '25%',    // 👈 تغییر بده: فاصله از بالا
              left: '0%',   // 👈 تغییر بده: فاصله از چپ
            }}
          />
        </Box>

        {/* Right Sidebar - Game Info Only */}
        <Stack spacing={3} sx={{ width: { xs: '100%', md: 400 } }}>
          {/* Debug Info */}
          <Card>
            <Box sx={{ p: 2, bgcolor: 'background.neutral' }}>
              <Typography variant="caption" color="text.secondary">
                Debug: Phase = {gameState.gamePhase}, Dice = [{gameState.diceValues.join(', ')}], Valid Moves = {gameState.validMoves.length}
              </Typography>
            </Box>
          </Card>

          {/* Dice Results Display */}
          {diceResults.length > 0 && (
            <Card>
              <Box sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
                  <Typography variant="subtitle1" sx={{ mr: 1 }}>
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
              </Box>
            </Card>
          )}

          {/* Game Info */}
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Game Info
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Current Turn
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                    {gameState.currentPlayer}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Game Phase
                  </Typography>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {gameState.gamePhase}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Dice Remaining
                  </Typography>
                  <Typography variant="body2">
                    {gameState.diceValues.length > 0 ? gameState.diceValues.join(', ') : 'None'}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    White Off
                  </Typography>
                  <Typography variant="body2">{gameState.boardState.off.white}/15</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Black Off
                  </Typography>
                  <Typography variant="body2">{gameState.boardState.off.black}/15</Typography>
                </Stack>
                {gameState.selectedPoint !== null && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Selected Point
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight={600}>
                      {gameState.selectedPoint}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
}
