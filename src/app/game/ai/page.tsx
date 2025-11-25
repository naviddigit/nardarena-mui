'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';

import { useGameState } from 'src/hooks/use-game-state';
import { useCountdownSeconds } from 'src/hooks/use-countdown';
import { _mock } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { PlayerCard } from 'src/components/player-card';
import { DiceRoller } from 'src/components/dice-roller';
import { SplashScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { GameResultDialog } from 'src/components/game-result-dialog';
import { ColorSelectionDialog } from 'src/components/color-selection-dialog';
import { BackgammonBoard, type BoardState } from 'src/components/backgammon-board';

// ----------------------------------------------------------------------

// Initial board state (standard backgammon layout - always the same)
const createInitialBoardState = (): BoardState => {
  const points = Array.from({ length: 24 }, () => ({
    checkers: [] as ('white' | 'black')[],
    count: 0,
  }));

  // White pieces at bottom
  points[23] = { checkers: Array(2).fill('white') as ('white' | 'black')[], count: 2 };
  points[12] = { checkers: Array(5).fill('white') as ('white' | 'black')[], count: 5 };
  points[7] = { checkers: Array(3).fill('white') as ('white' | 'black')[], count: 3 };
  points[5] = { checkers: Array(5).fill('white') as ('white' | 'black')[], count: 5 };

  // Black pieces at top
  points[0] = { checkers: Array(2).fill('black') as ('white' | 'black')[], count: 2 };
  points[11] = { checkers: Array(5).fill('black') as ('white' | 'black')[], count: 5 };
  points[16] = { checkers: Array(3).fill('black') as ('white' | 'black')[], count: 3 };
  points[18] = { checkers: Array(5).fill('black') as ('white' | 'black')[], count: 5 };

  return {
    points,
    bar: { white: 0, black: 0 },
    off: { white: 0, black: 0 },
  };
};

// ----------------------------------------------------------------------

export default function GameAIPage() {
  const router = useRouter();
  const { mode, setMode } = useColorScheme();
  const diceRollerRef = useRef<any>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [winner, setWinner] = useState<'white' | 'black' | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [scores, setScores] = useState({ white: 0, black: 0 });
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [colorDialogOpen, setColorDialogOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const maxSets = 5;

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const initialBoardState = useMemo(() => createInitialBoardState(), []);
  const { 
    gameState, 
    handleDiceRoll, 
    handlePointClick,
    handleBarClick,
    handleUndo, 
    handleEndTurn, 
    validDestinations 
  } = useGameState(initialBoardState);

  // Timer for White player (120 seconds = 2 minutes)
  const whiteTimer = useCountdownSeconds(120);
  // Timer for Black player (120 seconds = 2 minutes)
  const blackTimer = useCountdownSeconds(120);

  // Start/stop timers based on current player
  useEffect(() => {
    if (gameState.gamePhase === 'opening') {
      // During opening roll, don't run timers
      return;
    }

    if (gameState.currentPlayer === 'white' && gameState.gamePhase !== 'waiting') {
      if (!whiteTimer.counting && whiteTimer.countdown === 120) {
        whiteTimer.startCountdown();
      }
    } else if (gameState.currentPlayer === 'black' && gameState.gamePhase !== 'waiting') {
      if (!blackTimer.counting && blackTimer.countdown === 120) {
        blackTimer.startCountdown();
      }
    }
  }, [gameState.currentPlayer, gameState.gamePhase, whiteTimer, blackTimer]);

  // Reset timer when turn ends
  useEffect(() => {
    if (gameState.gamePhase === 'waiting') {
      if (gameState.currentPlayer === 'white') {
        whiteTimer.setCountdown(120);
      } else {
        blackTimer.setCountdown(120);
      }
    }
  }, [gameState.gamePhase, gameState.currentPlayer, whiteTimer, blackTimer]);

  // Check for time-out loss
  useEffect(() => {
    if (whiteTimer.countdown === 0 && !winner) {
      setWinner('black');
      setScores((prev) => ({ ...prev, black: prev.black + 1 }));
      setResultDialogOpen(true);
      whiteTimer.stopCountdown();
      blackTimer.stopCountdown();
    } else if (blackTimer.countdown === 0 && !winner) {
      setWinner('white');
      setScores((prev) => ({ ...prev, white: prev.white + 1 }));
      setResultDialogOpen(true);
      whiteTimer.stopCountdown();
      blackTimer.stopCountdown();
    }
  }, [whiteTimer.countdown, blackTimer.countdown, winner, whiteTimer, blackTimer]);

  const handleDiceRollComplete = (results: { value: number; type: string }[]) => {
    handleDiceRoll(results);
    setIsRolling(false);
  };

  const triggerDiceRoll = () => {
    if (diceRollerRef.current) {
      if (diceRollerRef.current.rollDice) {
        setIsRolling(true);
        diceRollerRef.current.rollDice();
      }
    }
  };

  const handleDone = () => {
    // Stop current player's timer
    if (gameState.currentPlayer === 'white') {
      whiteTimer.stopCountdown();
    } else {
      blackTimer.stopCountdown();
    }
    
    handleEndTurn();
  };

  const handleRematch = () => {
    setResultDialogOpen(false);
    setWinner(null);
    whiteTimer.setCountdown(120);
    blackTimer.setCountdown(120);
    setPlayerColor(null);
    setColorDialogOpen(true);
  };

  const handleColorSelect = (color: 'white' | 'black') => {
    setPlayerColor(color);
    setColorDialogOpen(false);
  };

  // Determine dice notation based on game phase
  const diceNotation = gameState.gamePhase === 'opening' ? '1d6' : '2d6';

  if (!mounted) {
    return <SplashScreen portal={false} />;
  }

  if (!playerColor) {
    return (
      <ColorSelectionDialog
        open={colorDialogOpen}
        onSelectColor={handleColorSelect}
      />
    );
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <IconButton
          onClick={() => setExitDialogOpen(true)}
          sx={{ width: 40, height: 40 }}
        >
          <Iconify icon="eva:arrow-back-fill" width={24} />
        </IconButton>

        <Stack alignItems="center" spacing={0.5}>
          <Typography variant="h4">Nard Arena</Typography>
          <Box
            sx={{
              width: '100%',
              height: 2,
              bgcolor: 'primary.main',
              borderRadius: 1,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {scores.white} - {scores.black} (of {maxSets})
          </Typography>
        </Stack>

        <IconButton
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          sx={{ width: 40, height: 40 }}
        >
          <Iconify icon={mode === 'light' ? 'ph:moon-duotone' : 'ph:sun-duotone'} width={24} />
        </IconButton>
      </Stack>

      {/* Player 1 (Opponent - Top) */}
      <Box sx={{ mb: 2 }}>
        <PlayerCard
          name="AI Opponent"
          country="Computer"
          avatarUrl={_mock.image.avatar(1)}
          checkerColor={playerColor === 'white' ? 'black' : 'white'}
          isActive={
            (gameState.gamePhase === 'opening' && gameState.openingRoll.white !== null && gameState.openingRoll.black === null) ||
            (gameState.currentPlayer === (playerColor === 'white' ? 'black' : 'white') && gameState.gamePhase !== 'opening')
          }
          canRoll={
            (gameState.gamePhase === 'opening' && gameState.openingRoll.white !== null && gameState.openingRoll.black === null) ||
            (gameState.currentPlayer === (playerColor === 'white' ? 'black' : 'white') && gameState.gamePhase === 'waiting')
          }
          onRollDice={triggerDiceRoll}
          onDone={handleDone}
          canDone={gameState.currentPlayer === (playerColor === 'white' ? 'black' : 'white') && gameState.gamePhase === 'moving' && gameState.moveHistory.length > 0 && gameState.diceValues.length >= 0}
          onUndo={handleUndo}
          canUndo={gameState.currentPlayer === (playerColor === 'white' ? 'black' : 'white') && gameState.gamePhase === 'moving' && gameState.moveHistory.length > 0}
          timeRemaining={playerColor === 'white' ? blackTimer.countdown : whiteTimer.countdown}
          isWinner={winner === (playerColor === 'white' ? 'black' : 'white')}
          isLoser={winner === playerColor}
        />
      </Box>

      {/* Game Board with Dice Roller */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 2, 
          position: 'relative',
          transform: playerColor === 'black' ? 'rotate(180deg)' : 'none',
        }}
      >
        <BackgammonBoard 
          boardState={gameState.boardState} 
          onPointClick={handlePointClick}
          onBarClick={handleBarClick}
          selectedPoint={gameState.selectedPoint}
          validDestinations={validDestinations}
          isRolling={isRolling}
          diceRoller={
            <DiceRoller
              ref={diceRollerRef}
              diceNotation={diceNotation}
              onRollComplete={handleDiceRollComplete}
            />
          }
          dicePosition={{ top: 200, left: 0 }}
        />
      </Box>

      {/* Player 2 (You - Bottom) */}
      <Box>
        <PlayerCard
          name="You"
          country="Iran"
          avatarUrl={_mock.image.avatar(0)}
          checkerColor={playerColor || 'white'}
          isActive={
            (gameState.gamePhase === 'opening' && gameState.openingRoll.white === null) ||
            (gameState.currentPlayer === playerColor && gameState.gamePhase !== 'opening')
          }
          canRoll={
            (gameState.gamePhase === 'opening' && gameState.openingRoll.white === null) ||
            (gameState.currentPlayer === playerColor && gameState.gamePhase === 'waiting')
          }
          onRollDice={triggerDiceRoll}
          onDone={handleDone}
          canDone={gameState.currentPlayer === playerColor && gameState.gamePhase === 'moving' && gameState.moveHistory.length > 0 && gameState.diceValues.length >= 0}
          onUndo={handleUndo}
          canUndo={gameState.currentPlayer === playerColor && gameState.gamePhase === 'moving' && gameState.moveHistory.length > 0}
          timeRemaining={playerColor === 'white' ? whiteTimer.countdown : blackTimer.countdown}
          isWinner={winner === playerColor}
          isLoser={winner !== null && winner !== playerColor}
        />
      </Box>

      {/* Exit Confirmation Dialog */}
      <ConfirmDialog
        open={exitDialogOpen}
        onClose={() => setExitDialogOpen(false)}
        title="Exit Game?"
        content="Are you sure you want to leave? Your game progress will be lost."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setExitDialogOpen(false);
              router.push('/');
            }}
          >
            Exit
          </Button>
        }
      />
      {/* Color Selection Dialog */}
      <ColorSelectionDialog
        open={colorDialogOpen}
        onSelectColor={handleColorSelect}
      />

      {/* Game Result Dialog */}
      <GameResultDialog
        open={resultDialogOpen}
        onRematch={handleRematch}
        whitePlayer={{
          name: playerColor === 'white' ? 'You' : 'AI Opponent',
          avatarUrl: playerColor === 'white' ? _mock.image.avatar(0) : _mock.image.avatar(1),
          score: scores.white,
          isWinner: winner === 'white',
        }}
        blackPlayer={{
          name: playerColor === 'black' ? 'You' : 'AI Opponent',
          avatarUrl: playerColor === 'black' ? _mock.image.avatar(0) : _mock.image.avatar(1),
          score: scores.black,
          isWinner: winner === 'black',
        }}
        maxSets={maxSets}
      />
    </Container>
    </>
  );
}
