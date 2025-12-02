'use client';

import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useGameState } from 'src/hooks/use-game-state';
import { calculateValidMoves } from 'src/hooks/game-logic/validation';
import { useCountdownSeconds } from 'src/hooks/use-countdown';
import { useSound } from 'src/hooks/use-sound';
import { useAIGame } from 'src/hooks/use-ai-game';
import { _mock } from 'src/_mock';
import { BoardThemeProvider } from 'src/contexts/board-theme-context';
import { useAuthContext } from 'src/auth/hooks';
import { gamePersistenceAPI } from 'src/services/game-persistence-api';
import type { GameResponse, PlayerColor as APIPlayerColor } from 'src/services/game-persistence-api';

// Import AI hooks
import { useAIGameLogic } from './hooks/useAIGameLogic';
import { useDiceRoller } from './hooks/useDiceRoller';

import { Iconify } from 'src/components/iconify';
import { PlayerCard } from 'src/components/player-card';
import { DiceRoller } from 'src/components/dice-roller';
import { LoadingScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { GameResultDialog } from 'src/components/game-result-dialog';
import { ColorSelectionDialog } from 'src/components/color-selection-dialog';
import { BackgammonBoard, type BoardState } from 'src/components/backgammon-board';
import { GameSettingsDrawer } from 'src/components/game-settings-drawer';
import { DevHotkeys } from 'src/components/dev-hotkeys';

// AnimateText component variants and classes
import { useInView, useAnimation } from 'framer-motion';

const animateTextClasses = {
  root: 'animate-text-root',
  lines: 'animate-text-lines',
  line: 'animate-text-line',
  word: 'animate-text-word',
  char: 'animate-text-char',
  space: 'animate-text-space',
  srOnly: 'sr-only',
};

const varTranEnter = { duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] };
const varTranExit = { duration: 0.2, ease: [0.43, 0.13, 0.23, 0.96] };

const varFade = () => ({
  in: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: varTranEnter },
    exit: { opacity: 0, transition: varTranExit },
  },
  inRight: {
    initial: { x: 120, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: varTranEnter },
    exit: { x: -120, opacity: 0, transition: varTranExit },
  },
});

const varContainer = () => ({
  animate: {
    transition: { staggerChildren: 0.03, delayChildren: 0.05 },
  },
  exit: {
    transition: { staggerChildren: 0.02, staggerDirection: -1 },
  },
});

function AnimateText({ text, sx, variants, once = false, ...other }: any) {
  const ref = useRef(null);
  const controls = useAnimation();
  const textArray = Array.isArray(text) ? text : [text];
  const isInView = useInView(ref, { once, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start('animate');
    } else {
      controls.start('initial');
    }
  }, [controls, isInView]);

  return (
    <Typography
      className={animateTextClasses.root}
      sx={{ p: 0, m: 0, ...sx }}
      {...other}
    >
      <Box
        component={m.span}
        ref={ref}
        initial="initial"
        animate={controls}
        exit="exit"
        variants={varContainer()}
        className={animateTextClasses.lines}
      >
        {textArray.map((line: string, lineIndex: number) => (
          <Box
            component="span"
            key={`${line}-${lineIndex}`}
            className={animateTextClasses.line}
            sx={{ display: 'block' }}
          >
            {line.split(' ').map((word: string, wordIndex: number) => {
              const lastWordInline = line.split(' ')[line.split(' ').length - 1];
              return (
                <Box
                  component="span"
                  key={`${word}-${wordIndex}`}
                  className={animateTextClasses.word}
                  sx={{ display: 'inline-block' }}
                >
                  {word.split('').map((char: string, charIndex: number) => (
                    <Box
                      component={m.span}
                      key={`${char}-${charIndex}`}
                      variants={variants ?? varFade().inRight}
                      className={animateTextClasses.char}
                      sx={{ display: 'inline-block' }}
                    >
                      {char}
                    </Box>
                  ))}
                  {lastWordInline !== word && (
                    <Box
                      component="span"
                      className={animateTextClasses.space}
                      sx={{ display: 'inline-block' }}
                    >
                      &nbsp;
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Typography>
  );
}

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

function GameAIPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlGameId = searchParams?.get('game-id');
  
  const { mode, setMode } = useColorScheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const diceRollerRef = useRef<any>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isWaitingForBackend, setIsWaitingForBackend] = useState(false); // NEW: prevent multiple rolls
  const [skipBackendDice, setSkipBackendDice] = useState(false); // Flag to skip backend dice request
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  
  const [winner, setWinner] = useState<'white' | 'black' | null>(null);
  const [timeoutWinner, setTimeoutWinner] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [scores, setScores] = useState({ white: 0, black: 0 });
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [loading, setLoading] = useState(true);
  const [maxSets, setMaxSets] = useState(5);
  const [currentSet, setCurrentSet] = useState(1);
  const [showWinText, setShowWinText] = useState(false);
  const [winTextMessage, setWinTextMessage] = useState('');
  
  // Game persistence state
  const { user } = useAuthContext();
  const [backendGameId, setBackendGameId] = useState<string | null>(urlGameId);
  const [moveCounter, setMoveCounter] = useState(0);
  const [turnStartTime, setTurnStartTime] = useState<number>(Date.now());
  const [aiDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'>('MEDIUM');
  const [shareToast, setShareToast] = useState(false);
  
  // AI Game hook
  const {
    isAIThinking,
    aiError,
    createAIGame,
    checkAndTriggerAI,
  } = useAIGame({
    gameId: backendGameId,
    aiDifficulty,
    onGameUpdate: (game) => {
      console.log('🎮 Game updated:', game);
      // Update board state from backend
      // You can sync the board here if needed
    },
  });
  
  // ⚠️ DEV ONLY: Demo state for testing bear-off zones - Remove before production
  const [demoOffCounts, setDemoOffCounts] = useState({ white: 0, black: 0 });

  // Sound hook
  const { isMuted, playSound, toggleMute } = useSound();
  const lastTurnPlayerRef = useRef<'white' | 'black' | null>(null);
  const lastMoveCountRef = useRef(0);
  const setWinnerProcessedRef = useRef(false); // Track if we've processed this set winner

  // Win text display function
  const showWinMessage = (message: string) => {
    setWinTextMessage(message);
    setShowWinText(true);
    setTimeout(() => {
      setShowWinText(false);
    }, 4000);
  };

  // Wrapper for handleDiceRoll to track turn start time
  const handleDiceRollWithTimestamp = (results: { value: number; type: string }[]) => {
    setTurnStartTime(Date.now());
    handleDiceRoll(results);
  };

  // ⚠️ DEV ONLY: Hotkey handlers for testing - Remove before production
  const handleWinTest = () => showWinMessage('You Win This Test!');
  
  const handleBothDemoAdd = () => {
    setDemoOffCounts(prev => ({ 
      white: Math.min(prev.white + 1, 15),
      black: Math.min(prev.black + 1, 15)
    }));
  };
  
  const handleSetStartTest = () => {
    showWinMessage(`Start Set ${currentSet} of ${maxSets}`);
  };

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
    handlePointClick: originalHandlePointClick,
    handleBarClick: originalHandleBarClick,
    handleUndo, 
    handleEndTurn,
    resetGame,
    startNewSet,
    checkSetWin,
    validDestinations,
    setGameState, // For directly setting state from backend
  } = useGameState(initialBoardState);

  // ✅ استفاده از AI hooks جدید (بعد از useGameState)
  const { isExecutingAIMove } = useAIGameLogic({
    gameState,
    setGameState,
    backendGameId,
  });

  // Wrapper to restrict AI checker interaction
  const handlePointClick = useCallback((pointIndex: number, targetIndex?: number) => {
    // Only allow interaction during user's turn
    if (gameState.currentPlayer !== playerColor) {
      console.log('🚫 Cannot interact during AI turn');
      return;
    }

    // If selecting a point (no targetIndex), check if it has user's checkers
    if (targetIndex === undefined && gameState.selectedPoint === null) {
      const point = gameState.boardState.points[pointIndex];
      if (point.checkers.length > 0 && point.checkers[0] !== playerColor) {
        console.log('🚫 Cannot select AI checkers');
        return;
      }
    }

    // Allow the click
    originalHandlePointClick(pointIndex, targetIndex);
  }, [gameState.currentPlayer, gameState.selectedPoint, gameState.boardState.points, playerColor, originalHandlePointClick]);

  // Wrapper to restrict bar interaction
  const handleBarClick = useCallback(() => {
    // Only allow interaction during user's turn
    if (gameState.currentPlayer !== playerColor) {
      console.log('🚫 Cannot interact during AI turn');
      return;
    }

    // Check if user has checkers on bar
    if (playerColor && gameState.boardState.bar[playerColor] === 0) {
      console.log('🚫 You have no checkers on bar');
      return;
    }

    // Allow the click
    originalHandleBarClick();
  }, [gameState.currentPlayer, gameState.boardState.bar, playerColor, originalHandleBarClick]);

  // Timer for White player (1800 seconds = 30 minutes)
  const whiteTimer = useCountdownSeconds(1800);
  // Timer for Black player (1800 seconds = 30 minutes)
  const blackTimer = useCountdownSeconds(1800);

  // Start timer when real game begins (after opening roll)
  useEffect(() => {
    if (!playerColor || winner || gameState.gamePhase === 'opening') {
      return;
    }

    // Play turn sound when it becomes player's turn to roll dice (waiting phase)
    if (gameState.currentPlayer === playerColor && gameState.gamePhase === 'waiting') {
      if (lastTurnPlayerRef.current !== gameState.currentPlayer) {
        // Delay sound by 1 second so it plays AFTER AI finishes
        setTimeout(() => {
          playSound('turn');
        }, 1000);
        lastTurnPlayerRef.current = gameState.currentPlayer;
      }
    }
    // Reset when leaving waiting phase so sound plays again next time
    else if (gameState.gamePhase !== 'waiting') {
      lastTurnPlayerRef.current = null;
    }

    // Start timer for current player
    if (gameState.currentPlayer === 'white' && whiteTimer.countdown === 1800 && !whiteTimer.counting) {
      whiteTimer.startCountdown();
    } else if (gameState.currentPlayer === 'black' && blackTimer.countdown === 1800 && !blackTimer.counting) {
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

  // Check for set winner and start new set
  useEffect(() => {
    if (gameState.gamePhase === 'finished' && !winner && !setWinnerProcessedRef.current) {
      // Mark as processed to prevent double execution
      setWinnerProcessedRef.current = true;
      
      // Determine set winner
      const currentSetWinner = gameState.boardState.off.white === 15 ? 'white' : 'black';
      
      console.log(`🎉 Set ${currentSet} winner: ${currentSetWinner}`);
      playSound('move');
      
      // Stop both timers
      whiteTimer.stopCountdown();
      blackTimer.stopCountdown();
      
      // Update scores
      setScores((prev) => {
        const newScore = {
          ...prev,
          [currentSetWinner]: prev[currentSetWinner] + 1,
        };
        
        const setsToWin = Math.ceil(maxSets / 2); // For 3 sets: need 2, for 5: need 3, for 9: need 5
        
        if (newScore[currentSetWinner] >= setsToWin) {
          // Match over - this player won the match
          console.log(`🏆 Match over! ${currentSetWinner} wins ${newScore[currentSetWinner]}-${newScore[currentSetWinner === 'white' ? 'black' : 'white']}!`);
          setWinner(currentSetWinner); // Set the winner state
          setTimeoutWinner(false);
          setResultDialogOpen(true);
          playSound('move');
        } else {
          // Start next set after delay
          console.log(`🏏 Set ${currentSet} complete. ${currentSetWinner} wins! Score: White ${newScore.white}-${newScore.black} Black`);
          
          // Show win text for set winner
          setShowWinText(true);
          setWinTextMessage(currentSetWinner === 'white' ? 'You Win This Set!' : 'AI Wins This Set!');
          
          setTimeout(() => {
            setShowWinText(false);
            
            // After win text disappears, show set start animation
            setTimeout(() => {
              const nextSet = currentSet + 1;
              setCurrentSet(nextSet);
              
              // Show set start animation
              showWinMessage(`Start Set ${nextSet} of ${maxSets}`);
              
              startNewSet(currentSetWinner); // Winner starts next set
              
              // Reset both timers to initial time
              whiteTimer.resetCountdown();
              blackTimer.resetCountdown();
              
              // Start timer for the winner (who will move first)
              if (currentSetWinner === 'white') {
                whiteTimer.startCountdown();
              } else {
                blackTimer.startCountdown();
              }
              
              // Reset the processed flag for next set
              setWinnerProcessedRef.current = false;
              
              console.log(`🎮 Starting set ${nextSet} of ${maxSets}, ${currentSetWinner} to move first`);
            }, 500); // 0.5 second after win text disappears
          }, 4000); // 4 seconds to show the victory text
        }
        
        return newScore;
      });
    }
  }, [gameState.gamePhase, gameState.boardState.off, winner, currentSet, maxSets, startNewSet, whiteTimer, blackTimer, playSound]);

  const handleDiceRollComplete = async (results: { value: number; type: string }[]) => {
    // Skip backend dice if flag is set (means we're already applying backend dice)
    if (skipBackendDice) {
      console.log('🎲 Skipping backend dice request (already have backend values)');
      setSkipBackendDice(false);
      handleDiceRollWithTimestamp(results);
      setIsRolling(false);
      return;
    }

    // For opening roll, use frontend dice (just for show - doesn't affect game)
    if (gameState.gamePhase === 'opening') {
      console.log('🎲 Opening roll - using frontend dice:', results.map(r => r.value));
      handleDiceRollWithTimestamp(results);
      setIsRolling(false);
      return;
    }

    // For game rolls, this shouldn't happen because we get backend dice directly
    console.log('⚠️ Unexpected dice roll complete - should have gotten backend dice first');
  };

  const triggerDiceRoll = async () => {
    // Prevent rolling if already rolling or waiting
    if (isRolling || isWaitingForBackend) {
      console.log('⏳ Cannot roll - already rolling or waiting');
      return;
    }

    // In opening phase, roll normally with frontend
    if (gameState.gamePhase === 'opening') {
      if (diceRollerRef.current?.rollDice) {
        setIsRolling(true);
        diceRollerRef.current.rollDice();
      }
      return;
    }

    // In normal gameplay, prevent rolling dice for AI (black player)
    if (gameState.currentPlayer === 'black') {
      console.log('🚫 Cannot roll dice for AI player');
      return;
    }
    
    // For game rolls, get backend dice FIRST, then show them
    console.log('🎲 Getting dice from backend...');
    setIsWaitingForBackend(true);
    try {
      const diceResponse = await gamePersistenceAPI.rollDice();
      console.log('🎲 Backend dice:', diceResponse.dice);
      
      // IMPORTANT: Set ALL flags together before setDiceValues
      setSkipBackendDice(true);
      setIsWaitingForBackend(false);
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 10));
      
      if (diceRollerRef.current?.setDiceValues) {
        setIsRolling(true);
        diceRollerRef.current.setDiceValues(diceResponse.dice);
      } else {
        const results = diceResponse.dice.map((value) => ({
          value,
          type: 'die',
        }));
        handleDiceRollWithTimestamp(results);
        setIsRolling(false);
      }
    } catch (error) {
      console.error('❌ Failed to get backend dice:', error);
      setIsRolling(false);
      setIsWaitingForBackend(false);
    }
  };

  const triggerDiceRefresh = () => {
    if (diceRollerRef.current) {
      if (diceRollerRef.current.reloadDice) {
        console.log('🔄 Reloading dice.js via hotkey...');
        diceRollerRef.current.reloadDice();
      } else if (diceRollerRef.current.clearDice) {
        console.log('🎲 Clearing dice via hotkey...');
        diceRollerRef.current.clearDice();
      }
    }
  };

  const triggerDoubleSix = () => {
    if (diceRollerRef.current?.setDiceValues) {
      console.log('🎲 Forcing dice to [6, 6] via Ctrl+6 hotkey...');
      
      // Set flag to skip backend dice request
      setSkipBackendDice(true);
      
      diceRollerRef.current.setDiceValues([6, 6]);
    } else {
      console.warn('⚠️ setDiceValues method not available on dice roller');
      
      // Fallback: Apply directly without animation
      const doubleSixResults = [
        { value: 6, type: 'die' },
        { value: 6, type: 'die' },
      ];
      handleDiceRollWithTimestamp(doubleSixResults);
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
    setBackendGameId(null); // Reset backend game ID for new game
    setMoveCounter(0); // Reset move counter
    whiteTimer.setCountdown(1800);
    blackTimer.setCountdown(1800);
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
    
    // Show set start animation for first set
    setTimeout(() => {
      showWinMessage(`Start Set 1 of ${selectedMaxSets}`);
    }, 500);
  };

  // Create game in backend when player selects color
  useEffect(() => {
    if (playerColor && user && !backendGameId) {
      const createBackendGame = async () => {
        try {
          console.log('🎮 Creating AI game... Player:', playerColor, 'User ID:', user.id);
          const game = await createAIGame();
          
          console.log('✅ Game created in backend:', game.id);
          setBackendGameId(game.id);
          
          // Update URL with game ID
          const newUrl = `${window.location.pathname}?game-id=${game.id}`;
          window.history.pushState({}, '', newUrl);
          console.log('🔗 URL updated:', newUrl);
        } catch (error) {
          console.error('❌ Failed to create game in backend:', error);
        }
      };
      
      createBackendGame();
    }
  }, [playerColor, user, backendGameId, createAIGame]);

  // Record moves to backend
  useEffect(() => {
    if (!backendGameId || !user || gameState.moveHistory.length === 0) return;
    
    // Only record new moves (when moveHistory grows)
    if (gameState.moveHistory.length > moveCounter) {
      const latestMove = gameState.moveHistory[gameState.moveHistory.length - 1];
      
      const recordBackendMove = async () => {
        try {
          console.log('📤 Recording move to backend...', {
            gameId: backendGameId,
            from: latestMove.from,
            to: latestMove.to,
            currentPlayer: gameState.currentPlayer,
          });
          
          await gamePersistenceAPI.recordMove(backendGameId, {
            playerColor: latestMove.player.toUpperCase() as APIPlayerColor,
            moveNumber: gameState.moveHistory.length,
            from: latestMove.from,
            to: latestMove.to,
            diceUsed: latestMove.diceValue,
            isHit: latestMove.hitChecker ? true : false,
            boardStateAfter: {
              ...gameState.boardState,
              currentPlayer: gameState.currentPlayer, // Include current player
            },
            timeRemaining: latestMove.player === 'white' ? whiteTimer.countdown : blackTimer.countdown,
            moveTime: Date.now() - turnStartTime, // Duration in milliseconds
          });
          
          console.log('✅ Move recorded successfully');
          setMoveCounter(gameState.moveHistory.length);
          
          // Check if it's AI's turn after this move
          if (gameState.currentPlayer === 'black') {
            console.log('🤖 AI\'s turn detected! Current player:', gameState.currentPlayer);
            console.log('📝 Move recorded. Triggering AI in 1.5 seconds...');
            console.log('🎯 Backend Game ID:', backendGameId);
            // AI will move automatically via backend, just wait
            setTimeout(() => {
              console.log('⚡ Calling checkAndTriggerAI now...');
              checkAndTriggerAI(backendGameId);
            }, 1500);
          }
        } catch (error) {
          console.error('❌ Failed to record move:', error);
        }
      };
      
      recordBackendMove();
    }
  }, [backendGameId, user, gameState.moveHistory, gameState.boardState, gameState.currentPlayer, moveCounter, whiteTimer.countdown, blackTimer.countdown, checkAndTriggerAI]);

  // End game in backend when match is over
  useEffect(() => {
    if (backendGameId && user && winner && !timeoutWinner) {
      const endBackendGame = async () => {
        try {
          await gamePersistenceAPI.endGame(backendGameId, {
            winner: winner.toUpperCase() as APIPlayerColor,
            whiteSetsWon: scores.white,
            blackSetsWon: scores.black,
            endReason: 'NORMAL_WIN',
            finalGameState: gameState.boardState,
          });
          
          console.log('✅ Game ended in backend');
        } catch (error) {
          console.error('❌ Failed to end game:', error);
        }
      };
      
      endBackendGame();
    } else if (backendGameId && user && winner && timeoutWinner) {
      const endBackendGame = async () => {
        try {
          await gamePersistenceAPI.endGame(backendGameId, {
            winner: winner.toUpperCase() as APIPlayerColor,
            whiteSetsWon: scores.white,
            blackSetsWon: scores.black,
            endReason: 'TIMEOUT',
            finalGameState: gameState.boardState,
          });
          
          console.log('✅ Game ended in backend (timeout)');
        } catch (error) {
          console.error('❌ Failed to end game:', error);
        }
      };
      
      endBackendGame();
    }
  }, [backendGameId, user, winner, timeoutWinner, scores, gameState.boardState]);

  // Auto-roll for AI (only in waiting phase, NOT in opening)
  useEffect(() => {
    if (gameState.currentPlayer === 'black' && diceRollerRef.current) {
      // In opening phase, AI also needs to roll
      if (gameState.gamePhase === 'opening' && gameState.openingRoll.white !== null && gameState.openingRoll.black === null) {
        console.log('🎲 AI rolling opening die...');
        const openingTimeout = setTimeout(() => {
          if (diceRollerRef.current?.rollDice) {
            setIsRolling(true);
            diceRollerRef.current.rollDice();
          }
        }, 1500);
        
        return () => clearTimeout(openingTimeout);
      }
      
      if (gameState.gamePhase === 'waiting' && !isRolling && !isWaitingForBackend) {
        console.log('🎲 AI auto-rolling dice for its turn...');
        const waitingTimeout = setTimeout(async () => {
          if (isRolling || isWaitingForBackend) return;
          
          // Get backend dice directly
          setIsWaitingForBackend(true);
          try {
            const diceResponse = await gamePersistenceAPI.rollDice();
            console.log('🎲 Backend dice for AI:', diceResponse.dice);
            
            // IMPORTANT: Set ALL flags together before setDiceValues
            setSkipBackendDice(true);
            setIsWaitingForBackend(false);
            
            // Small delay to ensure state updates
            await new Promise(resolve => setTimeout(resolve, 10));
            
            if (diceRollerRef.current?.setDiceValues) {
              setIsRolling(true);
              diceRollerRef.current.setDiceValues(diceResponse.dice);
            } else {
              const results = diceResponse.dice.map((value) => ({
                value,
                type: 'die',
              }));
              handleDiceRoll(results);
              setIsRolling(false);
            }
          } catch (error) {
            console.error('❌ Failed to get AI dice:', error);
            setIsRolling(false);
            setIsWaitingForBackend(false);
          }
        }, 2000);
        
        return () => clearTimeout(waitingTimeout);
      }
    }
  }, [gameState.gamePhase, gameState.currentPlayer]);

  // Auto-execute AI moves when in moving phase
  // ✅ این حالا توی useAIGameLogic hook اجرا میشه با delay های مناسب

  // Determine dice notation based on game phase
  const diceNotation = gameState.gamePhase === 'opening' ? '1d6' : '2d6';

  // Responsive dice position
  const dicePosition = isSmallMobile 
    ? { top: 155, left: 0 } 
    : isMobile 
      ? { top: 210, left: 0 } 
      : { top: 230, left: 0 };

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
      {/* ⚠️ DEV ONLY: Remove DevHotkeys component before production */}
      <DevHotkeys 
        onWinTest={handleWinTest}
        onBothDemoAdd={handleBothDemoAdd}
        onSetStartTest={handleSetStartTest}
        onDiceRoll={triggerDiceRoll}
        onDiceRefresh={triggerDiceRefresh}
        onDoubleSix={triggerDoubleSix}
      />
      
      <BoardThemeProvider useApi={false}>
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
            onClick={() => {
              const shareUrl = `${window.location.origin}${window.location.pathname}?game-id=${backendGameId}`;
              if (navigator.share) {
                navigator.share({
                  title: 'Nard Arena - AI Game',
                  text: 'Watch me play backgammon against AI!',
                  url: shareUrl,
                }).catch((error) => console.log('Share failed:', error));
              } else {
                navigator.clipboard.writeText(shareUrl);
                console.log('✅ Link copied to clipboard!');
                setShareToast(true);
                setTimeout(() => setShareToast(false), 3000);
              }
            }}
            sx={{ width: 40, height: 40 }}
            disabled={!backendGameId}
          >
            <Iconify icon="solar:share-bold" width={24} />
          </IconButton>

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

          <GameSettingsDrawer 
            displayName={playerColor === 'white' ? 'You (White)' : 'You (Black)'}
            photoURL={_mock.image.avatar(0)}
          />
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
          country={`AI - ${aiDifficulty}`}
          avatarUrl={_mock.image.avatar(1)}
          checkerColor={playerColor === 'white' ? 'black' : 'white'}
          setsWon={playerColor === 'white' ? scores.black : scores.white}
          isActive={
            (gameState.gamePhase === 'opening' && gameState.openingRoll.white !== null && gameState.openingRoll.black === null) ||
            (gameState.currentPlayer === (playerColor === 'white' ? 'black' : 'white') && gameState.gamePhase !== 'opening')
          }
          canRoll={false} // AI cannot roll manually
          onRollDice={triggerDiceRoll}
          onDone={handleDone}
          canDone={false} // AI handles its own turns
          onUndo={handleUndo}
          canUndo={false} // AI cannot undo
          timeRemaining={playerColor === 'white' ? blackTimer.countdown : whiteTimer.countdown}
          isWinner={winner === (playerColor === 'white' ? 'black' : 'white')}
          isLoser={winner === playerColor}
        />
        {isAIThinking && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              p: 2,
              borderRadius: 2,
              boxShadow: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: '3px solid',
                borderColor: 'primary.main',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
            <Typography variant="body2">AI is thinking...</Typography>
          </Box>
        )}
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
          demoOffCounts={demoOffCounts}
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
            !isRolling &&
            !isWaitingForBackend &&
            (
              // In opening phase, player (white) rolls first
              (gameState.gamePhase === 'opening' && 
               playerColor === 'white' && 
               gameState.openingRoll.white === null) ||
              // In normal gameplay, if it's player's turn and waiting phase
              (gameState.currentPlayer === playerColor && 
               gameState.gamePhase === 'waiting')
            )
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

        {/* Win Text Overlay */}
        <AnimatePresence>
          {showWinText && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            >
              <AnimateText
                text={winTextMessage}
                variants={varFade().inRight}
                sx={{
                  color: 'primary.main',
                  fontWeight: 'bold',
                  textShadow: '0 0 20px rgba(0,0,0,0.5)',
                  fontSize: { xs: '3rem', md: '4rem' },
                  textAlign: 'center',
                }}
              />
            </Box>
          )}
        </AnimatePresence>
      </Container>
      </BoardThemeProvider>

      {/* Share Toast Notification */}
      <Snackbar
        open={shareToast}
        autoHideDuration={3000}
        onClose={() => setShareToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShareToast(false)} severity="success" sx={{ width: '100%' }}>
          🔗 Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}

// ----------------------------------------------------------------------

export default function GameAIPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <GameAIPageContent />
    </Suspense>
  );
}