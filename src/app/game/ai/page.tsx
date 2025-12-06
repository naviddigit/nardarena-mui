/**
 * ⛔ CRITICAL WARNING - DO NOT MODIFY WITHOUT APPROVAL! ⛔
 * 
 * این فایل بعد از ماه‌ها تست و debug کامل شده است.
 * هر تغییری در logic های زیر نیاز به تایید صریح دارد:
 * 
 * 1. AI dice roll logic (lines ~830-870)
 * 2. handleDiceRollComplete (lines ~526-548)
 * 3. Dice state synchronization with backend
 * 4. skipBackendDice flag handling
 * 
 * ⚠️ تغییر بدون تایید منجر به bugs جدی میشود:
 * - AI با تاس اشتباه بازی میکنه
 * - Dice desync بین frontend و backend
 * - Race conditions در state updates
 * 
 * قبل از هر تغییر:
 * 1. مستندات و کامنت‌های موجود را بخوانید
 * 2. تست کامل با حالت‌های مختلف انجام دهید
 * 3. تایید بگیرید
 */

/**
 * ⛔⛔⛔ ABSOLUTELY CRITICAL - DO NOT MODIFY THIS FILE! ⛔⛔⛔
 * 
 * AI Game Page - Main game logic container
 * 
 * LOCKED AFTER MONTHS OF DEBUGGING:
 * - Dice synchronization with backend
 * - Timer management between players
 * - AI move execution with delays
 * - Roll button control logic
 * - State management and game flow
 * 
 * This file is the heart of the game. Any modification will break:
 * - Dice roll timing
 * - AI vs Player turn switching
 * - Timer countdown
 * - Move execution order
 * 
 * ⚠️ User has explicitly forbidden modifications to this file!
 * 
 * Last stable: Dec 2, 2025
 */

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

import { useGameState, type Player, type GamePhase } from 'src/hooks/use-game-state';
import { calculateValidMoves } from 'src/hooks/game-logic/validation';
import { useCountdownSeconds } from 'src/hooks/use-countdown';
import { useSound } from 'src/hooks/use-sound';
import { useAIGame } from 'src/hooks/use-ai-game';
import { useAIOpeningRoll } from 'src/hooks/use-ai-opening-roll';
import { useGameRecovery } from 'src/hooks/use-game-recovery';
import { _mock } from 'src/_mock';
import { BoardThemeProvider } from 'src/contexts/board-theme-context';
import { useAuthContext } from 'src/auth/hooks';
import { AuthGuard } from 'src/auth/guard';
import { gamePersistenceAPI } from 'src/services/game-persistence-api';
import type { GameResponse, PlayerColor as APIPlayerColor } from 'src/services/game-persistence-api';
import { toast } from 'src/components/snackbar';

// Import AI hooks
import { useGameTimers } from './hooks/useGameTimers';
import { useAIGameLogic } from './hooks/useAIGameLogic';
import { useDiceRoller } from './hooks/useDiceRoller';
import { useDiceRollControl } from './hooks/useDiceRollControl';
import { useAIAutoRoll } from './hooks/useAIAutoRoll';

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

// Guest user for non-authenticated play
const GUEST_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  displayName: 'Guest',
  username: 'guest',
  email: 'guest@nardaria.com',
  photoURL: null,
  role: 'USER' as const,
};

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
  
  // Timer initial values (will be restored from backend if resuming)
  const [whiteTimerInit, setWhiteTimerInit] = useState(1800);
  const [blackTimerInit, setBlackTimerInit] = useState(1800);
  
  // 🔑 Refs to track ACTUAL timer values (updated every second)
  const whiteTimerValueRef = useRef(1800);
  const blackTimerValueRef = useRef(1800);
  
  // AI player color state (opposite of human player)
  const [aiPlayerColor, setAiPlayerColor] = useState<'white' | 'black'>('black');
  
  // ✅ Backend authorization state - controls if user can play
  const [canUserPlay, setCanUserPlay] = useState<boolean>(true);
  const [waitingForOpponent, setWaitingForOpponent] = useState<boolean>(false);

  // ✅ Track if game was already loaded to prevent infinite loop
  const gameLoadedRef = useRef(false);
  
  // ✅ Track backend dice values (for anti-cheat: physics might show wrong numbers)
  const backendDiceRef = useRef<[number, number] | null>(null);

  // AI Game hook
  const {
    isAIThinking,
    aiError,
    createAIGame,
    checkAndTriggerAI,
  } = useAIGame({
    gameId: backendGameId,
    aiDifficulty,
    aiPlayerColor, // Pass AI player color to backend
    onGameUpdate: (game) => {
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
  const openingRollEndedRef = useRef(false); // Track if opening roll endTurn was called
  const openingJustCompletedRef = useRef(false); // Track if opening JUST completed (prevent immediate AI roll)

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

  // 🔄 Game Resume: Load existing game from URL
  // ✅ Load existing game from URL (on mount or refresh)
  useEffect(() => {
    const loadExistingGame = async () => {
      // ✅ Prevent multiple loads
      if (gameLoadedRef.current) return;
      
      // Only try to load if we have urlGameId and user is logged in
      // ⚠️ Don't check playerColor - we need to restore it on refresh!
      if (urlGameId && user) {
        gameLoadedRef.current = true; // Mark as loaded
        
        try {
          const game = await gamePersistenceAPI.getGame(urlGameId);
          
          // 📋 Log complete gameState structure from backend
          console.log('🎮 gameState:', {
            currentPlayer: game.gameState.currentPlayer,
            lastDoneBy: game.gameState.lastDoneBy || null,
            lastDoneAt: game.gameState.lastDoneAt || null,
            turnCompleted: game.gameState.turnCompleted ?? true,
            phase: game.gameState.phase || 'waiting',
            aiPlayerColor: game.gameState.aiPlayerColor || null,
            previousDice: game.gameState.currentTurnDice || null, // ✅ Previous turn dice
            currentDiceValues: game.gameState.diceValues || null,
            nextDiceRoll: game.gameState.nextDiceRoll || null,
            nextRoll: game.gameState.nextRoll || null, // ✅ CRITICAL: This is the real one!
          });
          
          // Check if game is still active
          if (game.status === 'ACTIVE' as any && game.gameState) {
            // ✅ Determine which color this user is playing
            const isWhitePlayer = game.whitePlayerId === user.id;
            const isBlackPlayer = game.blackPlayerId === user.id;
            
            console.log('👤 Player Check:', { userId: user.id, whitePlayerId: game.whitePlayerId, blackPlayerId: game.blackPlayerId, isWhitePlayer, isBlackPlayer });
            
            // ✅ Determine player color from actual game assignment
            const resumedPlayerColor = isWhitePlayer ? 'white' : 'black';
            // AI is OPPOSITE of player
            const resumedAIColor = isWhitePlayer ? 'black' : 'white';
            
            if (isWhitePlayer || isBlackPlayer) {
              
              // ✅ Set colors ONCE at the beginning
              setPlayerColor(resumedPlayerColor);
              setAiPlayerColor(resumedAIColor);
              setBackendGameId(game.id);
              
              // ✅ Determine correct gamePhase
              // Priority: game.gameState.phase > check diceValues > default 'waiting'
              let restoredPhase: GamePhase = 'waiting';
              
              if (game.gameState.phase) {
                restoredPhase = game.gameState.phase as GamePhase;
              } else if (game.gameState.diceValues && game.gameState.diceValues.length > 0) {
                restoredPhase = 'moving';
              } else if (!game.gameState.currentPlayer) {
                restoredPhase = 'opening';
              }
              
              // Restore board state
              // ✅ Backend now sends SAME format as frontend: {checkers: [...], count: n}
              // NO CONVERSION NEEDED!
              
              setGameState((prev) => ({
                ...prev,
                boardState: {
                  points: game.gameState.points || prev.boardState.points,
                  bar: game.gameState.bar || prev.boardState.bar,
                  off: game.gameState.off || prev.boardState.off,
                },
                currentPlayer: game.gameState.currentPlayer || 'white',
                gamePhase: restoredPhase,
                diceValues: game.gameState.diceValues || [],
                openingRoll: game.gameState.openingRoll || prev.openingRoll, // ✅ Restore opening roll
                nextRoll: game.gameState.nextRoll || undefined, // ✅ CRITICAL: Restore nextRoll from backend!
              }));
              
              // ⚠️ CRITICAL FIX: If moving phase but no dice, force to waiting phase
              if (restoredPhase === 'moving' && (!game.gameState.diceValues || game.gameState.diceValues.length === 0)) {
                setTimeout(() => {
                  setGameState(prev => ({
                    ...prev,
                    gamePhase: 'waiting',
                    diceValues: [],
                  }));
                }, 500);
              }
              
              // 🕐 Restore timers from MOVES (not moveHistory - it has wrong structure)
              // Use game.timeControl as base timer if available (in seconds)
              const gameTimeControl = (game as any).timeControl || 1800;
              
              // ✅ Use game.moves (GameMove[]) instead of game.moveHistory (Json[])
              const gameMoves = (game as any).moves || [];
              
              if (gameMoves && gameMoves.length > 0) {
                const now = Date.now();
                const currentPlayerInGame = game.gameState.currentPlayer?.toLowerCase() || 'white';
                
                // Find last moves for each player
                let whiteLastMove = null;
                let blackLastMove = null;
                
                // Iterate from end to find last move of each player
                for (let i = gameMoves.length - 1; i >= 0; i--) {
                  const move = gameMoves[i];
                  
                  // ✅ Now using correct field: playerColor (not player)
                  if (!move.playerColor) {
                    continue;
                  }
                  
                  // ✅ Handle both uppercase and lowercase
                  const movePlayer = move.playerColor.toString().toLowerCase();
                  
                  if (movePlayer === 'white' && !whiteLastMove) {
                    whiteLastMove = move;
                  }
                  if (movePlayer === 'black' && !blackLastMove) {
                    blackLastMove = move;
                  }
                  
                  // Stop if we found both
                  if (whiteLastMove && blackLastMove) break;
                }
                
                // ⏱️ TIMER CALCULATION - Read carefully!
                // Logic: Each player starts with gameTimeControl seconds
                // After each move, save their remaining time
                // On resume: if it's their turn, subtract time since their last move
                
                // Restore white timer
                if (whiteLastMove && whiteLastMove.timeRemaining != null) {
                  // timeRemaining is in SECONDS (not milliseconds!)
                  const lastKnownTime = whiteLastMove.timeRemaining;
                  
                  // If white is current player, they've been "thinking" since their last move
                  if (currentPlayerInGame === 'white' && whiteLastMove.createdAt) {
                    const lastMoveTime = new Date(whiteLastMove.createdAt).getTime();
                    const elapsedSeconds = Math.floor((now - lastMoveTime) / 1000);
                    const actualTime = Math.max(0, lastKnownTime - elapsedSeconds);
                    
                    setWhiteTimerInit(actualTime);
                    whiteTimerValueRef.current = actualTime;
                  } else {
                    // Not white's turn - use their last saved time as-is
                    setWhiteTimerInit(lastKnownTime);
                    whiteTimerValueRef.current = lastKnownTime;
                  }
                } else {
                  // White hasn't moved yet - full time
                  setWhiteTimerInit(gameTimeControl);
                  whiteTimerValueRef.current = gameTimeControl;
                }
                
                // Restore black timer  
                if (blackLastMove && blackLastMove.timeRemaining != null) {
                  // timeRemaining is in SECONDS (not milliseconds!)
                  const lastKnownTime = blackLastMove.timeRemaining;
                  
                  // If black is current player, they've been "thinking" since their last move
                  if (currentPlayerInGame === 'black' && blackLastMove.createdAt) {
                    const lastMoveTime = new Date(blackLastMove.createdAt).getTime();
                    const elapsedSeconds = Math.floor((now - lastMoveTime) / 1000);
                    const actualTime = Math.max(0, lastKnownTime - elapsedSeconds);
                    
                    setBlackTimerInit(actualTime);
                    blackTimerValueRef.current = actualTime;
                  } else {
                    // Not black's turn - use their last saved time as-is
                    setBlackTimerInit(lastKnownTime);
                    blackTimerValueRef.current = lastKnownTime;
                  }
                } else {
                  // Black hasn't moved yet - full time
                  setBlackTimerInit(gameTimeControl);
                  blackTimerValueRef.current = gameTimeControl;
                }
              } else {
                // No moves at all - use game time control for both
                setWhiteTimerInit(gameTimeControl);
                setBlackTimerInit(gameTimeControl);
                whiteTimerValueRef.current = gameTimeControl;
                blackTimerValueRef.current = gameTimeControl;
              }
              
              try {
                const canPlayResponse = await gamePersistenceAPI.axios.get(`/game/${game.id}/can-play`);
                
                const { canPlay, isYourTurn, currentPlayer } = canPlayResponse.data;
                const { lastDoneBy, lastDoneAt } = canPlayResponse.data;
                
                setCanUserPlay(canPlay);
                setWaitingForOpponent(!canPlay);
                
              } catch (error) {
              }
              
              // ⏱️ Start timer ONLY for HUMAN player if it's their turn (NOT during opening)
              if (restoredPhase !== 'opening') {
                setTimeout(() => {
                  const currentPlayerAfterLoad = (game.gameState.currentPlayer?.toLowerCase() || 'white') as Player;
                  
                  // Only start timer if it's HUMAN player's turn
                  if (currentPlayerAfterLoad === resumedPlayerColor) {
                    if (resumedPlayerColor === 'white') {
                      whiteTimer.startCountdown();
                    } else {
                      blackTimer.startCountdown();
                    }
                  }
                  
                  // ⚠️ NEVER trigger AI on refresh - AI should only be triggered by game events, not page load
                }, 500);
              }
            }
          }
        } catch (error) {
          // If game not found or error, just continue with normal flow (show color selection)
        }
      }
    };
    
    loadExistingGame();
  }, [urlGameId, user]); // ✅ Removed playerColor to prevent infinite loop
  
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

  // Timer for White player (restored from backend or default 30 minutes)
  const whiteTimer = useCountdownSeconds(whiteTimerInit);
  // Timer for Black player (restored from backend or default 30 minutes)
  const blackTimer = useCountdownSeconds(blackTimerInit);

  // ✅ Define handleDone before useAIGameLogic (AI needs this function)
  const handleDone = useCallback(async () => {
    const currentPlayer = gameState.currentPlayer;
    
    if (diceRollerRef.current?.clearDice) {
      diceRollerRef.current.clearDice();
    }
    
    if (currentPlayer === 'white') {
      whiteTimer.stopCountdown();
    } else {
      blackTimer.stopCountdown();
    }
    
    if (backendGameId && user) {
      try {
        // ✅ RECORD ALL MOVES FIRST (before ending turn)
        
        for (let i = moveCounter; i < gameState.moveHistory.length; i++) {
          const move = gameState.moveHistory[i];
          
          const playerTimeRemaining = move.player === 'white' 
            ? whiteTimerValueRef.current
            : blackTimerValueRef.current;
          
          await gamePersistenceAPI.recordMove(backendGameId, {
            playerColor: move.player.toUpperCase() as APIPlayerColor,
            moveNumber: i + 1,
            from: move.from,
            to: move.to,
            diceUsed: move.diceValue,
            isHit: move.hitChecker ? true : false,
            boardStateAfter: {
              points: gameState.boardState.points,
              bar: gameState.boardState.bar,
              off: gameState.boardState.off,
              currentPlayer: gameState.currentPlayer,
              diceValues: gameState.diceValues,
            },
            timeRemaining: playerTimeRemaining,
            moveTime: Date.now() - turnStartTime,
          });
          
        }
        
        setMoveCounter(gameState.moveHistory.length);
        
        // ✅ NOW END TURN
        const response = await gamePersistenceAPI.axios.post(`/game/${backendGameId}/end-turn`);
        
        console.log('📥 Backend endTurn response:', JSON.stringify(response.data, null, 2));
        
        // 🔒 CRITICAL: Verify server returned nextRoll for opponent
        const nextRoll = response.data.nextRoll;
        const nextPlayer = response.data.nextPlayer;
        
        console.log(`🎯 currentPlayer BEFORE: ${currentPlayer}, nextPlayer FROM BACKEND: ${nextPlayer}`);
        console.log(`🎲 nextRoll FROM BACKEND:`, JSON.stringify(nextRoll));
        
        if (!nextRoll || !nextRoll[nextPlayer] || nextRoll[nextPlayer].length === 0) {
          console.error('❌ Server did NOT return nextRoll! Cannot end turn.');
          console.error('Response:', response.data);
          toast.error('Server error: Next dice not generated. Please try again.');
          
          // ✅ Restart timer so player can try again
          if (currentPlayer === 'white') {
            whiteTimer.startCountdown();
          } else {
            blackTimer.startCountdown();
          }
          return; // ⛔ STOP - Don't switch turns!
        }
        
        // ✅ Success - Server returned nextRoll
        console.log(`✅ nextRoll:`, nextRoll);
        
        // ✅ CRITICAL: Set canUserPlay based on WHO pressed Done
        // If AI pressed Done → nextPlayer is human → canUserPlay = true
        // If human pressed Done → nextPlayer is AI → canUserPlay = false
        const nextPlayerIsHuman = response.data.nextPlayer === playerColor;
        setCanUserPlay(nextPlayerIsHuman);
        setWaitingForOpponent(!nextPlayerIsHuman);
        
        setGameState(prev => ({
          ...prev,
          currentPlayer: response.data.nextPlayer,
          gamePhase: 'waiting',
          diceValues: [],
          validMoves: [],
          selectedPoint: null,
          nextRoll: nextRoll, // ✅ CRITICAL: Save backend nextRoll to state!
        }));
        
        // Record turn start time for next turn
        setTurnStartTime(Date.now());
        
      } catch (error) {
        console.error('Failed to end turn:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to end turn';
        toast.error(errorMsg);
        
        // ✅ Restart timer on error
        if (currentPlayer === 'white') {
          whiteTimer.startCountdown();
        } else {
          blackTimer.startCountdown();
        }
      }
    } else {
      // Frontend-only mode
      handleEndTurn();
      
      if (currentPlayer === 'white') {
        setTimeout(() => blackTimer.startCountdown(), 100);
      } else {
        setTimeout(() => whiteTimer.startCountdown(), 100);
      }
    }
  }, [gameState, backendGameId, user, moveCounter, whiteTimer, blackTimer, handleEndTurn, turnStartTime]);

  // ✅ استفاده از AI hooks جدید (بعد از useGameState)
  const { isExecutingAIMove } = useAIGameLogic({
    gameState,
    setGameState,
    backendGameId,
    aiPlayerColor,
    handleDone,
    onTurnComplete: () => {
      // ❌ DON'T clear AI dice here - let them stay until player rolls
      // Players need to see what dice AI used!
      
      // ✅ Stop AI timer and start player timer (based on actual colors)
      
      if (aiPlayerColor === 'black') {
        // AI is black → stop black, start white
        console.log('AI turn complete - stopping black timer, starting white (player) timer');
        blackTimer.stopCountdown();
        setTimeout(() => {
          whiteTimer.startCountdown();
        }, 100);
      } else {
        // AI is white → stop white, start black
        console.log('AI turn complete - stopping white timer, starting black (player) timer');
        whiteTimer.stopCountdown();
        setTimeout(() => {
          blackTimer.startCountdown();
        }, 100);
      }
    },
  });
  
  // ✅ Update refs whenever countdown changes (track actual values)
  useEffect(() => {
    whiteTimerValueRef.current = whiteTimer.countdown;
  }, [whiteTimer.countdown]);
  
  useEffect(() => {
    blackTimerValueRef.current = blackTimer.countdown;
  }, [blackTimer.countdown]);

  // ✅ استفاده از Timer hook (مدیریت خودکار تایمرها)
  useGameTimers({
    gameState,
    playerColor,
    whiteTimer,
    blackTimer,
    winner,
    isExecutingAIMove, // ✅ Pass AI execution state to prevent timer conflicts
    onTimeout: (timeoutWinner) => {
      setWinner(timeoutWinner);
      setTimeoutWinner(true);
      setResultDialogOpen(true);
    },
  });

  // ✅ استفاده از Dice Roll Control hook (کنترل دکمه Roll)
  const { canRoll, canRollReason } = useDiceRollControl({
    gameState,
    playerColor,
    isRolling,
    isWaitingForBackend,
    isExecutingAIMove,
  });

  // 🐛 Debug canRoll
  useEffect(() => {
    console.log('🎯 canRoll status:', {
      canRoll,
      canRollReason,
      gamePhase: gameState.gamePhase,
      currentPlayer: gameState.currentPlayer,
      playerColor,
      aiPlayerColor,
      isRolling,
      isWaitingForBackend,
      isExecutingAIMove,
    });
  }, [canRoll, canRollReason, gameState.gamePhase, gameState.currentPlayer, playerColor, aiPlayerColor, isRolling, isWaitingForBackend, isExecutingAIMove]);

  // Wrapper to restrict AI checker interaction
  const handlePointClick = useCallback((pointIndex: number, targetIndex?: number) => {
    // Only allow interaction during user's turn
    if (gameState.currentPlayer !== playerColor) {
      return;
    }

    // If selecting a point (no targetIndex), check if it has user's checkers
    if (targetIndex === undefined && gameState.selectedPoint === null) {
      const point = gameState.boardState.points[pointIndex];
      if (point.checkers.length > 0 && point.checkers[0] !== playerColor) {
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
      return;
    }

    // Check if user has checkers on bar
    if (playerColor && gameState.boardState.bar[playerColor] === 0) {
      return;
    }

    // Allow the click
    originalHandleBarClick();
  }, [gameState.currentPlayer, gameState.boardState.bar, playerColor, originalHandleBarClick]);

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
  }, [playerColor, gameState.currentPlayer, gameState.gamePhase, winner, playSound]);

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

  // ✅ Stop rolling when gamePhase changes OR when dice values are set
  useEffect(() => {
    if (isRolling) {
      // Stop rolling when entering moving phase
      if (gameState.gamePhase === 'moving') {
        setIsRolling(false);
      }
      // Stop rolling when leaving opening phase (going to waiting)
      else if (gameState.gamePhase === 'waiting' && gameState.openingRoll.white !== null && gameState.openingRoll.black !== null) {
        setIsRolling(false);
      }
      // Stop rolling when dice values are applied (player rolled)
      else if (gameState.gamePhase === 'waiting' && gameState.diceValues.length > 0 && gameState.currentPlayer === playerColor) {
        setIsRolling(false);
      }
    }
  }, [gameState.gamePhase, gameState.openingRoll.white, gameState.openingRoll.black, gameState.diceValues.length, gameState.currentPlayer, playerColor, isRolling]);

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
          setWinner(currentSetWinner); // Set the winner state
          setTimeoutWinner(false);
          setResultDialogOpen(true);
          playSound('move');
        } else {
          // Start next set after delay
          
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
              openingRollEndedRef.current = false; // Reset opening roll flag for new set
              
            }, 500); // 0.5 second after win text disappears
          }, 4000); // 4 seconds to show the victory text
        }
        
        return newScore;
      });
    }
  }, [gameState.gamePhase, gameState.boardState.off, winner, currentSet, maxSets, startNewSet, whiteTimer, blackTimer, playSound]);

  const handleDiceRollComplete = async (results: { value: number; type: string }[]) => {
    // ✅ ANTI-CHEAT: Use backend dice, NOT physics results!
    // Physics might show wrong numbers (shift_dice_faces doesn't work perfectly)
    let actualResults = results;
    
    if (backendDiceRef.current && gameState.gamePhase !== 'opening') {
      console.log('🎲 Physics showed:', results.map(r => r.value));
      console.log('✅ Using backend dice:', backendDiceRef.current);
      
      actualResults = backendDiceRef.current.map(value => ({ value, type: 'd6' }));
      
      // Clear backend dice ref
      backendDiceRef.current = null;
    }
    
    // Apply dice results to game state
    handleDiceRollWithTimestamp(actualResults);
    
    // If it's a normal game roll (not opening), we should inform backend
    // but we DON'T need to wait for it - dice are already rolled visually
    if (gameState.gamePhase !== 'opening') {
      // Just log the dice values - backend doesn't need to validate them
      console.log('Dice rolled:', actualResults.map(r => r.value));
    }
  };

  const triggerDiceRoll = async () => {
    console.log('🎲 triggerDiceRoll called');
    console.log('📊 State:', {
      gamePhase: gameState.gamePhase,
      currentPlayer: gameState.currentPlayer,
      playerColor,
      aiPlayerColor,
      backendGameId,
      isRolling,
      isWaitingForBackend,
      canUserPlay,
    });
    
    if (backendGameId && user && gameState.gamePhase !== 'opening') {
      try {
        const canPlayResponse = await gamePersistenceAPI.axios.get(`/game/${backendGameId}/can-play`);
        const { canRollNewDice, isYourTurn, turnCompleted, currentPlayer, playerColor } = canPlayResponse.data;
        
        // ✅ ALLOW ROLLING: Even if turnCompleted=false, user can roll again (backend will return same dice)
        // This is for refresh scenario: user rolled but didn't press Done yet
        
        if (!isYourTurn) {
          return;
        }
        
        setCanUserPlay(true);
        setWaitingForOpponent(false);
      } catch (error) {
        return;
      }
    }
    
    // In opening phase, allow rolling only if this player hasn't rolled yet
    if (gameState.gamePhase === 'opening') {
      // Check if player already rolled
      if (playerColor === 'white' && gameState.openingRoll.white !== null) {
        return;
      }
      if (playerColor === 'black' && gameState.openingRoll.black !== null) {
        return;
      }
      
      if (diceRollerRef.current?.rollDice) {
        
        // ⛔ CRITICAL: Set currentPlayer BEFORE rolling to identify who's rolling
        // This is needed for handleDiceRoll to know which player's openingRoll to update
        setGameState(prev => ({ ...prev, currentPlayer: playerColor as Player }));
        
        setTimeout(() => {
          setIsRolling(true);
          diceRollerRef.current?.rollDice();
        }, 100);
      }
      return;
    }
    
    // Prevent rolling if already rolling or waiting (only in normal gameplay)
    if (isRolling || isWaitingForBackend) {
      return;
    }

    // Guard: playerColor must be set
    if (!playerColor) {
      return;
    }

    // Guard: backendGameId must exist
    if (!backendGameId) {
      return;
    }

    // In normal gameplay, prevent rolling dice for AI player
    if (gameState.currentPlayer === aiPlayerColor) {
      return;
    }
    
    // ⛔ CRITICAL: Clear old dice first (but NOT in opening phase!)
    if (diceRollerRef.current?.clearDice && (gameState.gamePhase as any) !== 'opening') {
      diceRollerRef.current.clearDice();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // ✅ ANTI-CHEAT: Get dice from backend FIRST
    // Backend will return SAME dice if turnCompleted=false (refresh scenario)
    setIsWaitingForBackend(true);

    try {
      const diceResponse = await gamePersistenceAPI.rollDice(backendGameId);
      console.log('🎲 xxxxxxxxxxxxxxxxxxxxxxx:', diceResponse);

      setIsWaitingForBackend(false);
      
      // ✅ CRITICAL: Save backend dice to ref (for anti-cheat)
      backendDiceRef.current = diceResponse.dice;
      console.log('🎲 Backend dice saved:', diceResponse.dice);

      // Show dice animation with backend values
      if (diceRollerRef.current?.setDiceValues) {
        setIsRolling(true);
        diceRollerRef.current.setDiceValues(diceResponse.dice);
      }
    } catch (error) {
      setIsRolling(false);
      setIsWaitingForBackend(false);
      
      // ⚠️ Show error message to user
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to backend';
      const displayMessage = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')
        ? '❌ Backend connection failed. Please check if server is running.'
        : `❌ ${errorMessage}`;
      toast.error(displayMessage);
    }
  };

  const triggerDiceRefresh = () => {
    if (diceRollerRef.current) {
      if (diceRollerRef.current.reloadDice) {
        diceRollerRef.current.reloadDice();
      } else if (diceRollerRef.current.clearDice) {
        diceRollerRef.current.clearDice();
      }
    }
  };

  const triggerDoubleSix = () => {
    if (diceRollerRef.current?.setDiceValues) {
      
      // Set flag to skip backend dice request
      setSkipBackendDice(true);
      
      diceRollerRef.current.setDiceValues([6, 6]);
    } else {
      
      // Fallback: Apply directly without animation
      const doubleSixResults = [
        { value: 6, type: 'die' },
        { value: 6, type: 'die' },
      ];
      handleDiceRollWithTimestamp(doubleSixResults);
    }
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
    setAiPlayerColor(color === 'white' ? 'black' : 'white'); // Set AI to opposite color
    setMaxSets(selectedMaxSets);
    
    // Show set start animation for first set
    setTimeout(() => {
      showWinMessage(`Start Set 1 of ${selectedMaxSets}`);
    }, 500);
  };

  // ==========================================
  // Helper function to trigger AI dice roll
  // ==========================================
  const triggerAIDiceRollFn = useCallback(() => {
    if (diceRollerRef.current?.rollDice && !isRolling && !isWaitingForBackend) {
      setIsRolling(true);
      diceRollerRef.current.rollDice();
    }
  }, [isRolling, isWaitingForBackend]);

  // Create game in backend when player selects color
  useEffect(() => {
    if (playerColor && user && !backendGameId) {
      const createBackendGame = async () => {
        try {
          const game = await createAIGame();
          
          setBackendGameId(game.id);
          
          // Update URL with game ID
          const newUrl = `${window.location.pathname}?game-id=${game.id}`;
          window.history.pushState({}, '', newUrl);
        } catch (error) {
        }
      };
      
      createBackendGame();
    }
  }, [playerColor, user, backendGameId, createAIGame]);

  // Save opening roll results to backend when both players have rolled
  // Auto-save opening roll when both players have rolled
  useEffect(() => {
    if (!backendGameId || !user) return;
    
    // ⚠️ Save when BOTH rolled AND haven't saved yet
    // ✅ REMOVED gamePhase === 'opening' check because use-game-state changes it to 'waiting' immediately!
    if (
      gameState.openingRoll.white !== null &&
      gameState.openingRoll.black !== null &&
      gameState.openingRoll.white !== gameState.openingRoll.black && // ✅ Not a tie
      !openingRollEndedRef.current // Only execute once
    ) {
      // Prevent duplicate execution (React Strict Mode calls useEffect twice)
      if (openingRollEndedRef.current) return;
      
      openingRollEndedRef.current = true;
      
      console.log('🎯 Opening roll conditions met, saving to backend...');
      
      const saveOpeningRoll = async () => {
        try {
          // ✅ Determine winner from opening roll (HIGHER dice wins in Nard!)
          const openingWinner = gameState.openingRoll.white! > gameState.openingRoll.black! ? 'white' : 'black';
          console.log(`🎯 Opening roll: white=${gameState.openingRoll.white}, black=${gameState.openingRoll.black}, winner=${openingWinner}`);
          console.log(`📊 In Nard, HIGHER dice wins! Winner: ${openingWinner}`);
          
          const updatedGameState = {
            openingRoll: gameState.openingRoll,
            currentPlayer: openingWinner, // ✅ Set winner as current player
            phase: 'waiting',
            points: gameState.boardState.points,
            bar: gameState.boardState.bar,
            off: gameState.boardState.off,
            diceValues: [],
          };
          
          console.log('📤 Sending opening roll to backend...');
          
          // ✅ Save opening roll AND generate dice for winner in one call
          const response = await gamePersistenceAPI.axios.post(
            `/game/${backendGameId}/complete-opening-roll`,
            { winner: openingWinner }
          );
          
          console.log('✅ Opening roll completed, dice generated for winner');
          console.log('📋 Full response:', response.data);
          console.log('📋 nextRoll:', response.data.nextRoll);
          
          // ✅ CRITICAL: Verify nextRoll exists before saving
          if (!response.data.nextRoll) {
            console.error('❌ Backend did not return nextRoll!');
            throw new Error('Backend did not generate dice for winner');
          }
          
          console.log('💾 Saving nextRoll to state:', response.data.nextRoll);
          
          setGameState(prev => {
            const newState = {
              ...prev,
              currentPlayer: openingWinner,
              gamePhase: 'waiting',
              diceValues: [],
              nextRoll: response.data.nextRoll, // ✅ Save dice for winner
            };
            console.log('💾 New state after opening roll:', newState);
            return newState;
          });
          
        } catch (error) {
          console.error('❌ Error saving opening roll:', error);
          console.error('❌ Error details:', error.response?.data || error.message);
          
          // ✅ Show user-friendly error message
          const errorMsg = error.response?.data?.message || 'System error occurred. Please try again.';
          toast.error(errorMsg);
          
          openingRollEndedRef.current = false;
        }
      };
      
      saveOpeningRoll();
    }
  }, [backendGameId, user, gameState.openingRoll, gameState.currentPlayer, gameState.boardState, aiPlayerColor, triggerAIDiceRollFn]);

  // Record moves to backend - REMOVED
  // Moves will be recorded only when Done button is pressed
  // useEffect(() => { ... }, [gameState.moveHistory]);

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
          
        } catch (error) {
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
          
          console.log('Game ended (timeout)');
        } catch (error) {
        }
      };
      
      endBackendGame();
    }
  }, [backendGameId, user, winner, timeoutWinner, scores, gameState.boardState]);

  // Clear dice when opening roll is a tie (shouldClearDice flag)
  // 🏆 Check for game winner after each move
  useEffect(() => {
    const whiteWon = gameState.boardState.off.white === 15;
    const blackWon = gameState.boardState.off.black === 15;
    
    if (whiteWon && !winner) {
      setWinner('white');
      setResultDialogOpen(true);
    } else if (blackWon && !winner) {
      setWinner('black');
      setResultDialogOpen(true);
    }
  }, [gameState.boardState.off.white, gameState.boardState.off.black, winner]);

  // Clear dice when opening roll is a tie (shouldClearDice flag)
  useEffect(() => {
    if (gameState.shouldClearDice && diceRollerRef.current?.clearDice) {
      diceRollerRef.current.clearDice();
      
      // ✅ CRITICAL: Stop rolling state so players can roll again
      setIsRolling(false);
      
      // ✅ CRITICAL: Reset openingRollEndedRef so opening roll can be saved again after tie
      openingRollEndedRef.current = false;
      
      // Reset the flag after clearing
      setGameState((prev) => ({
        ...prev,
        shouldClearDice: false,
      }));
    }
  }, [gameState.shouldClearDice, setGameState]);

  // ⚠️ CRITICAL: Clear dice when opening roll completes (winner determined)
  useEffect(() => {
    // If we just left opening phase and have a current player set
    if (
      gameState.gamePhase === 'waiting' &&
      gameState.openingRoll.white !== null &&
      gameState.openingRoll.black !== null &&
      gameState.openingRoll.white !== gameState.openingRoll.black &&
      gameState.diceValues.length === 0 &&
      diceRollerRef.current?.clearDice
    ) {
      // Clear opening roll dice from board
      console.log('🧹 Clearing opening roll dice - winner must roll new dice');
      diceRollerRef.current.clearDice();
    }
  }, [gameState.gamePhase, gameState.openingRoll, gameState.diceValues.length]);

  // Auto-roll for AI in opening phase using modular hook
  useAIOpeningRoll({
    gameState,
    isAIGame: !!playerColor, // playerColor exists means it's AI game
    aiPlayerColor,
    diceRollerReady: !!diceRollerRef.current?.rollDice,
    onRollNeeded: useCallback(() => {
      
      // ✅ CRITICAL: Set currentPlayer to AI so handleDiceRoll knows which openingRoll to update
      setGameState(prev => ({ ...prev, currentPlayer: aiPlayerColor }));
      
      // Roll the dice
      setTimeout(() => {
        if (diceRollerRef.current?.rollDice) {
          setIsRolling(true);
          diceRollerRef.current.rollDice();
        }
      }, 100);
    }, [setGameState, setIsRolling, aiPlayerColor]),
  });

  // ✅ AI Auto-roll using modular hook
  useAIAutoRoll({
    gameState,
    aiPlayerColor,
    isRolling,
    isWaitingForBackend,
    isExecutingAIMove,
    backendGameId,
    diceRollerRef,
    setIsRolling,
    setIsWaitingForBackend,
  });

  // Auto-execute AI moves when in moving phase
  // ✅ این حالا توی useAIGameLogic hook اجرا میشه با delay های مناسب

  // ==========================================
  // 🚨 GAME RECOVERY SYSTEM
  // ==========================================
  // Auto-recovery disabled - user controls all actions manually

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
                }).catch((error) => console.log('Share failed'));
              } else {
                navigator.clipboard.writeText(shareUrl);
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
        {/* ✅ Safety check: only render when boardState exists */}
        {gameState.boardState && gameState.boardState.points ? (
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
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Loading game board...</Typography>
          </Box>
        )}
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
          canRoll={canRoll}
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
    <AuthGuard>
      <Suspense fallback={<LoadingScreen />}>
        <GameAIPageContent />
      </Suspense>
    </AuthGuard>
  );
}