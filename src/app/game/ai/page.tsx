'use client';

import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';

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
import { useSound } from 'src/hooks/use-sound';
import { _mock } from 'src/_mock';
import { BoardThemeProvider } from 'src/contexts/board-theme-context';

import { Iconify } from 'src/components/iconify';
import { PlayerCard } from 'src/components/player-card';
import { DiceRoller } from 'src/components/dice-roller';
import { LoadingScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { GameResultDialog } from 'src/components/game-result-dialog';
import { ColorSelectionDialog } from 'src/components/color-selection-dialog';
import { BackgammonBoard, type BoardState } from 'src/components/backgammon-board';
import { ThemeSwitcher } from 'src/components/backgammon-board/theme-switcher';

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
  const [timeoutWinner, setTimeoutWinner] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [scores, setScores] = useState({ white: 0, black: 0 });
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [loading, setLoading] = useState(true);
  const [maxSets, setMaxSets] = useState(5);
  const [currentSet, setCurrentSet] = useState(1);

  // Sound hook
  const { isMuted, playSound, toggleMute } = useSound();
  const lastTurnPlayerRef = useRef<'white' | 'black' | null>(null);
  const lastMoveCountRef = useRef(0);

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
    resetGame,
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

    // Play turn sound when it becomes player's turn to roll dice (waiting phase)
    if (gameState.currentPlayer === playerColor && gameState.gamePhase === 'waiting') {
      if (lastTurnPlayerRef.current !== gameState.currentPlayer) {
        playSound('turn');
        lastTurnPlayerRef.current = gameState.currentPlayer;
      }
    }
    // Reset when leaving waiting phase so sound plays again next time
    else if (gameState.gamePhase !== 'waiting') {
      lastTurnPlayerRef.current = null;
    }

    // Start timer for current player
    if (gameState.currentPlayer === 'white' && whiteTimer.countdown === 120 && !whiteTimer.counting) {
      whiteTimer.startCountdown();
    } else if (gameState.currentPlayer === 'black' && blackTimer.countdown === 120 && !blackTimer.counting) {
      blackTimer.startCountdown();
    }
  }, [playerColor, gameState.currentPlayer, gameState.gamePhase, winner, whiteTimer, blackTimer, playSound]);

  // Play move sound when move history changes
  useEffect(() => {
    if (gameState.moveHistory.length > lastMoveCountRef.current) {
      playSound('move');
      lastMoveCountRef.current = gameState.moveHistory.length;
    } else if (gameState.moveHistory.length === 0) {
      // Reset counter when game resets
      lastMoveCountRef.current = 0;
    }
  }, [gameState.moveHistory.length, playSound]);

  // Check for time-out loss
  useEffect(() => {
    if (whiteTimer.countdown <= 0 && !winner) {
      // White time's up - Black wins the ENTIRE MATCH immediately
      console.log('⏰ White timeout - Black wins entire match!');
      whiteTimer.stopCountdown();
      blackTimer.stopCountdown();
      setWinner('black');
      setTimeoutWinner(true);
      setResultDialogOpen(true);
    } else if (blackTimer.countdown <= 0 && !winner) {
      // Black time's up - White wins the ENTIRE MATCH immediately
      console.log('⏰ Black timeout - White wins entire match!');
      whiteTimer.stopCountdown();
      blackTimer.stopCountdown();
      setWinner('white');
      setTimeoutWinner(true);
      setResultDialogOpen(true);
    }
  }, [whiteTimer.countdown, blackTimer.countdown, winner, whiteTimer, blackTimer]);

  // Auto-skip turn if player can't enter from bar
  useEffect(() => {
    if (gameState.gamePhase !== 'moving' || winner) return;
    
    // Check if player has checkers on bar
    const hasCheckersOnBar = gameState.boardState.bar[gameState.currentPlayer] > 0;
    
    if (hasCheckersOnBar) {
      // Check if there are ANY valid moves from bar
      const hasValidBarMoves = gameState.validMoves.some((m) => m.from === -1);
      
      if (!hasValidBarMoves) {
        // Player has checkers on bar but can't enter - skip turn automatically
        console.log(`🚫 ${gameState.currentPlayer} cannot enter from bar - skipping turn`);
        
        // Stop current player's timer
        if (gameState.currentPlayer === 'white') {
          whiteTimer.stopCountdown();
        } else {
          blackTimer.stopCountdown();
        }
        
        // Wait a bit to show the situation, then end turn
        setTimeout(() => {
          handleEndTurn();
          
          // Start next player's timer
          setTimeout(() => {
            if (gameState.currentPlayer === 'white') {
              blackTimer.startCountdown();
            } else {
              whiteTimer.startCountdown();
            }
          }, 100);
        }, 1500); // 1.5 second delay so player can see they're blocked
      }
    }
  }, [gameState.gamePhase, gameState.validMoves, gameState.currentPlayer, gameState.boardState.bar, winner, whiteTimer, blackTimer, handleEndTurn]);

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

  const handleRematch = useCallback(() => {
    setResultDialogOpen(false);
    setWinner(null);
    setTimeoutWinner(false);
    setScores({ white: 0, black: 0 });
    setCurrentSet(1);
    whiteTimer.setCountdown(120);
    blackTimer.setCountdown(120);
    whiteTimer.stopCountdown();
    blackTimer.stopCountdown();
    // Reset game state to initial
    if (resetGame) {
      resetGame();
    }
  }, [resetGame, whiteTimer, blackTimer]);

  const handleBackToDashboard = () => {
    router.push('/');
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
    <BoardThemeProvider useApi={false}>
      {/* Theme Switcher - پایین وسط صفحه */}
      <ThemeSwitcher />
      
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

        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={toggleMute}
            sx={{ width: 40, height: 40 }}
          >
            <Iconify 
              icon={isMuted ? 'solar:volume-cross-bold' : 'solar:volume-loud-bold'} 
              width={24} 
            />
          </IconButton>

          <IconButton
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
            sx={{ width: 40, height: 40 }}
          >
            <Iconify icon={mode === 'light' ? 'solar:moon-bold' : 'solar:sun-bold'} width={24} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Player 1 (Opponent - Top) */}
      <Box 
        component={m.div}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: 0.2,
          ease: "easeOut" 
        }}
        sx={{ mb: 2 }}
      >
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
          canDone={
            gameState.currentPlayer === (playerColor === 'white' ? 'black' : 'white') && 
            gameState.gamePhase === 'moving' && 
            (gameState.diceValues.length === 0 || gameState.validMoves.length === 0)
          }
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
        }}
      >
        <BackgammonBoard 
          boardState={gameState.boardState} 
          onPointClick={handlePointClick}
          onBarClick={handleBarClick}
          selectedPoint={gameState.selectedPoint}
          validDestinations={validDestinations}
          currentPlayer={gameState.currentPlayer}
          validMoves={gameState.validMoves}
          isRolling={isRolling}
          isRotated={playerColor === 'black'}
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
      <Box
        component={m.div}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: 0.2,
          ease: "easeOut" 
        }}
      >
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
          canDone={
            gameState.currentPlayer === playerColor && 
            gameState.gamePhase === 'moving' && 
            (gameState.diceValues.length === 0 || gameState.validMoves.length === 0)
          }
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
        onBackToDashboard={handleBackToDashboard}
        isTimeout={timeoutWinner}
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
    </BoardThemeProvider>
  );
}
