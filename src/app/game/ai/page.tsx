'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useGameState } from 'src/hooks/use-game-state';
import { useCountdownSeconds } from 'src/hooks/use-countdown';
import { _mock } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { PlayerCard } from 'src/components/player-card';
import { DiceRoller } from 'src/components/dice-roller';
import { LoadingScreen } from 'src/components/loading-screen';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const diceRollerRef = useRef<any>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [winner, setWinner] = useState<'white' | 'black' | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [scores, setScores] = useState({ white: 0, black: 0 });
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [loading, setLoading] = useState(true);
  const [maxSets, setMaxSets] = useState(5);
  const [currentSet, setCurrentSet] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
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

  // Start timer when real game begins (after opening roll)
  useEffect(() => {
    if (!playerColor || winner || gameState.gamePhase === 'opening') {
      return;
    }

    // Start timer for current player
    if (gameState.currentPlayer === 'white' && whiteTimer.countdown === 120 && !whiteTimer.counting) {
      whiteTimer.startCountdown();
    } else if (gameState.currentPlayer === 'black' && blackTimer.countdown === 120 && !blackTimer.counting) {
      blackTimer.startCountdown();
    }
  }, [playerColor, gameState.currentPlayer, gameState.gamePhase, winner, whiteTimer, blackTimer]);

  // Check for time-out loss
  useEffect(() => {
    if (whiteTimer.countdown === 0 && !winner && whiteTimer.counting) {
      // White time's up - Black wins immediately with penalty points
      // Calculate penalty based on game state
      const whiteOffCount = gameState.boardState.off.white;
      let penaltyPoints = 1; // Default: 1 hich
      
      if (whiteOffCount === 0) {
        // White hasn't borne off any checkers = 5 hich (very bad)
        penaltyPoints = 5;
      } else if (whiteOffCount < 5) {
        // White bore off less than 5 = 3 hich (bad)
        penaltyPoints = 3;
      } else if (whiteOffCount < 9) {
        // White bore off 5-8 checkers = 2 hich (normal)
        penaltyPoints = 2;
      }
      // else: White bore off 9+ checkers = 1 hich (minimal penalty)
      
      const newBlackScore = scores.black + penaltyPoints;
      setScores((prev) => ({ ...prev, black: newBlackScore }));
      whiteTimer.stopCountdown();
      blackTimer.stopCountdown();
      
      // Check if black won the match (reached winning sets)
      const setsToWin = Math.ceil(maxSets / 2);
      if (newBlackScore >= setsToWin) {
        setWinner('black');
        setResultDialogOpen(true);
      } else {
        // Just won a set, start new set with black (winner) going first
        setCurrentSet((prev) => prev + 1);
        whiteTimer.setCountdown(120);
        blackTimer.setCountdown(120);
        // Reset board - will trigger timer start in useEffect above
        handleEndTurn();
      }
    } else if (blackTimer.countdown === 0 && !winner && blackTimer.counting) {
      // Black time's up - White wins immediately with penalty points
      const blackOffCount = gameState.boardState.off.black;
      let penaltyPoints = 1;
      
      if (blackOffCount === 0) {
        penaltyPoints = 5; // 5 hich - no checkers borne off
      } else if (blackOffCount < 5) {
        penaltyPoints = 3; // 3 hich - less than 5 checkers
      } else if (blackOffCount < 9) {
        penaltyPoints = 2; // 2 hich - 5-8 checkers
      }
      
      const newWhiteScore = scores.white + penaltyPoints;
      setScores((prev) => ({ ...prev, white: newWhiteScore }));
      whiteTimer.stopCountdown();
      blackTimer.stopCountdown();
      
      // Check if white won the match
      const setsToWin = Math.ceil(maxSets / 2);
      if (newWhiteScore >= setsToWin) {
        setWinner('white');
        setResultDialogOpen(true);
      } else {
        // Just won a set, start new set with white (winner) going first
        setCurrentSet((prev) => prev + 1);
        whiteTimer.setCountdown(120);
        blackTimer.setCountdown(120);
        // Reset board - will trigger timer start in useEffect above
        handleEndTurn();
      }
    }
  }, [whiteTimer.countdown, blackTimer.countdown, winner, whiteTimer, blackTimer, scores, maxSets, handleEndTurn, gameState.boardState.off]);

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
    // Save current player before turn ends
    const currentPlayer = gameState.currentPlayer;
    
    // Stop current player's timer
    if (currentPlayer === 'white') {
      whiteTimer.stopCountdown();
    } else {
      blackTimer.stopCountdown();
    }
    
    handleEndTurn();
    
    // Start next player's timer (opposite of current)
    setTimeout(() => {
      if (currentPlayer === 'white') {
        blackTimer.startCountdown();
      } else {
        whiteTimer.startCountdown();
      }
    }, 100);
  };

  const handleRematch = () => {
    setResultDialogOpen(false);
    setWinner(null);
    setScores({ white: 0, black: 0 });
    setCurrentSet(1);
    whiteTimer.setCountdown(120);
    blackTimer.setCountdown(120);
    setPlayerColor(null);
  };

  const handleColorSelect = (color: 'white' | 'black', selectedMaxSets: number) => {
    setPlayerColor(color);
    setMaxSets(selectedMaxSets);
  };

  // Determine dice notation based on game phase
  const diceNotation = gameState.gamePhase === 'opening' ? '1d6' : '2d6';

  // Responsive dice position
  const dicePosition = isSmallMobile 
    ? { top: 130, left: 0 } 
    : isMobile 
      ? { top: 190, left: 0 } 
      : { top: 200, left: 0 };

  if (loading) {
    return (
      <LoadingScreen 
        portal={false}
        sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          zIndex: 9999,
          bgcolor: 'background.default',
        }} 
      />
    );
  }

  if (!playerColor) {
    return (
      <ColorSelectionDialog
        open
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
            Set {currentSet} of {maxSets}
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
          setsWon={playerColor === 'white' ? scores.black : scores.white}
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
          dicePosition={dicePosition}
        />
      </Box>

      {/* Player 2 (You - Bottom) */}
      <Box>
        <PlayerCard
          name="You"
          country="Iran"
          avatarUrl={_mock.image.avatar(0)}
          checkerColor={playerColor || 'white'}
          setsWon={playerColor === 'white' ? scores.white : scores.black}
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
        currentSet={currentSet}
      />
    </Container>
    </>
  );
}
