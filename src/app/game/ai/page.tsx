'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  const { mode, setMode } = useColorScheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const initialBoardState = createInitialBoardState();
  const { 
    gameState, 
    handleDiceRoll, 
    handlePointClick, 
    handleUndo, 
    handleEndTurn, 
    validDestinations 
  } = useGameState(initialBoardState);

  const handleDiceRollComplete = (results: { value: number; type: string }[]) => {
    handleDiceRoll(results);
  };

  // Determine dice notation based on game phase
  const diceNotation = gameState.gamePhase === 'opening' ? '1d6' : '2d6';
  
  // Show roll button only when it's time to roll
  const showRollButton = 
    gameState.gamePhase === 'opening' || 
    (gameState.gamePhase === 'waiting' && gameState.diceValues.length === 0);
  
  // Get phase description
  const getPhaseDescription = () => {
    if (gameState.gamePhase === 'opening') {
      if (gameState.openingRoll.white === null) {
        return 'White: Roll to determine who starts';
      }
      if (gameState.openingRoll.black === null) {
        return 'Black: Roll to determine who starts';
      }
      return 'Tie! Roll again';
    }
    if (gameState.gamePhase === 'waiting') {
      return `${gameState.currentPlayer === 'white' ? 'White' : 'Black'}: Roll dice to start turn`;
    }
    if (gameState.gamePhase === 'moving') {
      return `${gameState.currentPlayer === 'white' ? 'White' : 'Black'}: Make your moves`;
    }
    return '';
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
            diceRoller={
              showRollButton ? (
                <DiceRoller 
                  diceNotation={diceNotation} 
                  onRollComplete={handleDiceRollComplete} 
                />
              ) : null
            }
            dicePosition={
              isMobile 
                ? { top: '10%', left: '8%' }
                : { top: '20%', left: '2%' }
            }
          />
        </Box>

        {/* Right Sidebar - Game Info */}
        <Stack spacing={3} sx={{ width: { xs: '100%', md: 400 } }}>
          {/* Game Status */}
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {getPhaseDescription()}
              </Typography>
              
              {gameState.gamePhase === 'opening' && gameState.openingRoll.white !== null && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    White rolled: {gameState.openingRoll.white}
                  </Typography>
                  {gameState.openingRoll.black !== null && (
                    <Typography variant="body2">
                      Black rolled: {gameState.openingRoll.black}
                    </Typography>
                  )}
                </Stack>
              )}
              
              {gameState.diceValues.length > 0 && (
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Typography variant="body1" fontWeight="bold">
                    Dice:
                  </Typography>
                  {gameState.diceValues.map((die, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: 1,
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                      }}
                    >
                      {die}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Card>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="error"
              onClick={handleUndo}
              disabled={gameState.moveHistory.length === 0 || gameState.gamePhase !== 'moving'}
              fullWidth
              sx={{
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Undo Last Move
            </Button>
            
            <Button
              variant="contained"
              color="success"
              onClick={handleEndTurn}
              disabled={gameState.gamePhase !== 'moving'}
              fullWidth
              sx={{
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Done (End Turn)
            </Button>
          </Stack>

          {/* Debug Info */}
          <Card>
            <Box sx={{ p: 2, bgcolor: 'background.neutral' }}>
              <Typography variant="caption" color="text.secondary">
                Debug: Phase = {gameState.gamePhase}, Moves in history = {gameState.moveHistory.length}, Valid Moves = {gameState.validMoves.length}
              </Typography>
            </Box>
          </Card>

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
