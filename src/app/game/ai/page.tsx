'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';

import { useGameState } from 'src/hooks/use-game-state';

import { Iconify } from 'src/components/iconify';
import { PlayerCard } from 'src/components/player-card';
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

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Nard Arena</Typography>

        <IconButton
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          sx={{ width: 40, height: 40 }}
        >
          <Iconify icon={mode === 'light' ? 'ph:moon-duotone' : 'ph:sun-duotone'} width={24} />
        </IconButton>
      </Stack>

      {/* Player 1 (Black - Top) */}
      <Box sx={{ mb: 2 }}>
        <PlayerCard
          name="AI Opponent"
          country="Computer"
          avatarUrl="/assets/images/avatar/avatar-2.webp"
          isActive={gameState.currentPlayer === 'black' && gameState.gamePhase !== 'opening'}
          canRoll={
            (gameState.gamePhase === 'opening' && gameState.openingRoll.white !== null && gameState.openingRoll.black === null) ||
            (gameState.currentPlayer === 'black' && gameState.gamePhase === 'waiting' && gameState.diceValues.length === 0)
          }
          onRollDice={handleDiceRollComplete}
          diceNotation={diceNotation}
        />
      </Box>

      {/* Game Board */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <BackgammonBoard 
          boardState={gameState.boardState} 
          onPointClick={handlePointClick}
          selectedPoint={gameState.selectedPoint}
          validDestinations={validDestinations}
        />
      </Box>

      {/* Player 2 (White - Bottom) */}
      <Box>
        <PlayerCard
          name="You"
          country="Iran"
          avatarUrl="/assets/images/avatar/avatar-1.webp"
          isActive={gameState.currentPlayer === 'white' || gameState.gamePhase === 'opening'}
          canRoll={
            (gameState.gamePhase === 'opening' && gameState.openingRoll.white === null) ||
            (gameState.currentPlayer === 'white' && gameState.gamePhase === 'waiting' && gameState.diceValues.length === 0)
          }
          onRollDice={handleDiceRollComplete}
          diceNotation={diceNotation}
        />
      </Box>
    </Container>
  );
}
