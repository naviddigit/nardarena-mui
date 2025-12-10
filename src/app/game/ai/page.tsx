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
 * 5. ⏱️ TIMER RESTORATION WITH ELAPSED TIME CALCULATION (lines ~538-587) ⚠️ CRITICAL ⚠️
 * 
 * ⚠️ تغییر بدون تایید منجر به bugs جدی میشود:
 * - AI با تاس اشتباه بازی میکنه
 * - Dice desync بین frontend و backend
 * - Race conditions در state updates
 * - ⏱️ Timer از اول شروع میشه بعد از refresh (باید elapsed time کم بشه)
 * 
 * 🕐 TIMER RESTORATION LOGIC (LOCKED - Dec 8, 2025):
 * =======================================================
 * وقتی صفحه refresh میشه:
 * 1. Timer values از database خونده میشه (whiteTimeRemaining, blackTimeRemaining)
 * 2. lastDoneBy و lastDoneAt از gameState خونده میشه
 * 3. Elapsed time محاسبه میشه: now - lastDoneAt
 * 4. Elapsed time از timer کسی که نوبتش بود کم میشه:
 *    - اگه lastDoneBy = 'black' → white timer counting بود → whiteTime - elapsed
 *    - اگه lastDoneBy = 'white' → black timer counting بود → blackTime - elapsed
 * 5. Timer با مقدار صحیح (منهای elapsed) نمایش داده میشه
 * 
 * مثال:
 * - Database: whiteTime = 120s, lastDoneBy = 'black', lastDoneAt = 10 seconds ago
 * - Calculation: whiteTime = 120 - 10 = 110s
 * - Result: White timer shows 110s (NOT 120s)
 * 
 * ⛔ بدون این محاسبه، timer همیشه از مقدار database شروع میشه که اشتباهه!
 * =======================================================
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
 * - ⏱️ Timer management with ELAPSED TIME calculation on refresh ⚠️ CRITICAL ⚠️
 * - AI move execution with delays
 * - Roll button control logic
 * - State management and game flow
 * 
 * This file is the heart of the game. Any modification will break:
 * - Dice roll timing
 * - AI vs Player turn switching
 * - ⏱️ Timer countdown and restoration after refresh
 * - Move execution order
 * 
 * 🕐 TIMER SYSTEM (LOCKED):
 * ========================
 * Timer restoration on page refresh MUST calculate elapsed time:
 * 
 * Formula: actualTime = dbTime - (now - lastDoneAt)
 * 
 * Example:
 * - DB has whiteTime = 120s, lastDoneBy = 'black', lastDoneAt = 10s ago
 * - White's timer was counting (because black pressed Done last)
 * - Correct value: 120 - 10 = 110s
 * - Wrong value: 120s (if elapsed time not calculated)
 * 
 * Lines ~538-587: Timer restoration with elapsed time calculation
 * Lines ~830-960: Local timer countdown with visibility sync
 * Lines ~973-1000: Timer sync when page becomes visible
 * 
 * ⚠️ User has explicitly forbidden modifications to this file!
 * 
 * Last stable: Dec 8, 2025 - Timer elapsed time fix applied
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

// 🐛 Debug configuration
import { debugLog, perfLog } from 'src/config/debug.config';

import { useGameState, type Player, type GamePhase } from 'src/hooks/use-game-state';
import { calculateValidMoves } from 'src/hooks/game-logic/validation';
import { useSound } from 'src/hooks/use-sound';
import { useAIGame } from 'src/hooks/use-ai-game';
import { useAIOpeningRoll } from 'src/hooks/use-ai-opening-roll';
import { useGameRecovery } from 'src/hooks/use-game-recovery';
import { useBackendConnection } from 'src/hooks/use-backend-connection';
import { useGameSocket } from 'src/hooks/use-game-socket';
import { _mock } from 'src/_mock';
import { BoardThemeProvider } from 'src/contexts/board-theme-context';
import { useAuthContext } from 'src/auth/hooks';
import { AuthGuard } from 'src/auth/guard';
import { gamePersistenceAPI } from 'src/services/game-persistence-api';
import type { GameResponse, PlayerColor as APIPlayerColor } from 'src/services/game-persistence-api';
import { toast } from 'src/components/snackbar';

// Import AI hooks
import { useAIGameLogic } from './hooks/useAIGameLogic';
import { useDiceRoller } from './hooks/useDiceRoller';
import { useDiceRollControl } from './hooks/useDiceRollControl';
import { useAIAutoRoll } from './hooks/useAIAutoRoll';
import { GameTimer } from './components/GameTimer';

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
import { BackgroundPattern } from 'src/components/background-pattern';

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
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false); // NEW: Game settings drawer
  
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
  
  // Timer values from database
  const [gameTimeControl, setGameTimeControl] = useState<number>(1800); // Default 30 minutes
  const [whiteTimerSeconds, setWhiteTimerSeconds] = useState(1800);
  const [blackTimerSeconds, setBlackTimerSeconds] = useState(1800);
  
  // ⏱️ Track who pressed Done last (to know whose timer should count)
  const [lastDoneBy, setLastDoneBy] = useState<'white' | 'black' | null>(null);
  const [lastDoneAt, setLastDoneAt] = useState<string | null>(null);
  
  // AI player color state (opposite of human player)
  const [aiPlayerColor, setAiPlayerColor] = useState<'white' | 'black'>('black');
  
  // ✅ Backend authorization state - controls if user can play
  const [canUserPlay, setCanUserPlay] = useState<boolean>(true);
  const [waitingForOpponent, setWaitingForOpponent] = useState<boolean>(false);

  // ✅ Track if game was already loaded to prevent infinite loop
  const gameLoadedRef = useRef(false);
  
  // ✅ Track backend dice values (for anti-cheat: physics might show wrong numbers)
  const backendDiceRef = useRef<[number, number] | null>(null);
  
  // ✅ Lock to prevent multiple simultaneous roll requests
  const isRollingLockRef = useRef(false);
  
  // ✅ Lock to prevent multiple auto-done triggers
  const autoDoneTriggeredRef = useRef(false);
  
  // ✅ Track if timeout verification already triggered
  const timeoutVerifiedRef = useRef<{ white: boolean; black: boolean }>({ white: false, black: false });
  
  // ✅ Track backend game object for dice restoration
  const [backendGame, setBackendGame] = useState<any>(null);

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
  const autoDoneTimerRef = useRef<NodeJS.Timeout | null>(null); // Track auto-done timer
  const openingJustCompletedRef = useRef(false); // Track if opening JUST completed (prevent immediate AI roll)
  const gameEndedRef = useRef(false); // Track if game has been ended to prevent duplicate calls

  // 🔌 WebSocket connection for real-time updates
  const {
    socket,
    isConnected: socketConnected,
    isReconnecting: socketReconnecting,
    error: socketError,
    emitMove: emitSocketMove,
    emitTimerUpdate: emitSocketTimer,
  } = useGameSocket({
    gameId: backendGameId,
    userId: user?.id || GUEST_USER.id,
    enabled: !!backendGameId && !!user,
    onGameStateUpdate: (gameState: any) => {
      debugLog.socket('[Socket] Game state update received', gameState);
      // Update local state from server (real-time sync)
      // TODO: Integrate with setGameState
    },
    onOpponentMove: (moveData: any) => {
      debugLog.socket('[Socket] Opponent move received', moveData);
      // AI move received via socket
      playSound('move');
    },
    onTimerUpdate: (data: { timers: { white: number; black: number } }) => {
      debugLog.socket('[Socket] Timer update received', data);
      setWhiteTimerSeconds(data.timers.white);
      setBlackTimerSeconds(data.timers.black);
    },
    onGameEnd: (result: any) => {
      debugLog.socket('[Socket] Game end received', result);
      // Game ended via socket
      setWinner(result.winner === 'WHITE' ? 'white' : 'black');
      if (result.endReason === 'TIMEOUT') {
        setTimeoutWinner(true);
      }
      setResultDialogOpen(true);
    },
    onPlayerDisconnect: (data: { playerId: string }) => {
      debugLog.socket('[Socket] Player disconnected', data);
      toast.warning('حریف اتصال خود را از دست داد');
    },
  });

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

  const handleShowStaticDice = () => {
    debugLog.dice('DEV: Showing static dice [2, 5]');
    if (diceRollerRef.current?.showStaticDice) {
      diceRollerRef.current.showStaticDice([2, 5]);
    } else {
      debugLog.error('DEV: showStaticDice not available');
    }
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
          
          // ✅ Save backend game for dice restoration
          setBackendGame(game);
          
          debugLog.dice('Dice restoration data:', {
            currentDiceValues: game.currentDiceValues,
            whiteHasDiceRolled: game.whiteHasDiceRolled,
            blackHasDiceRolled: game.blackHasDiceRolled,
            currentPlayer: game.gameState?.currentPlayer,
          });
          
          // 📋 Log complete gameState structure from backend
          debugLog.state('gameState:', {
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
          
          // Check if game is completed
          if (game.status === 'COMPLETED' as any) {
            // Game is finished - show result dialog
            const isWhitePlayer = game.whitePlayerId === user.id;
            const resumedPlayerColor = isWhitePlayer ? 'white' : 'black';
            const resumedAIColor = isWhitePlayer ? 'black' : 'white';
            
            setPlayerColor(resumedPlayerColor);
            setAiPlayerColor(resumedAIColor);
            setBackendGameId(game.id);
            
            // Restore board state for display
            if (game.gameState && game.gameState.points) {
              setGameState((prev) => ({
                ...prev,
                boardState: {
                  points: game.gameState.points,
                  bar: game.gameState.bar || { white: 0, black: 0 },
                  off: game.gameState.off || { white: 0, black: 0 },
                },
                currentPlayer: game.gameState.currentPlayer || 'white',
                gamePhase: 'finished',
              }));
            }
            
            // Set winner and scores ONLY if match is actually over
            const gameWinner = game.winner?.toLowerCase() as 'white' | 'black' | null;
            if (gameWinner) {
              const whiteSets = game.whiteSetsWon || 0;
              const blackSets = game.blackSetsWon || 0;
              
              setScores({
                white: whiteSets,
                black: blackSets,
              });
              
              // Only show winner dialog if someone actually won the MATCH (not just one set)
              const setsToWin = Math.ceil(maxSets / 2);
              const matchIsOver = whiteSets >= setsToWin || blackSets >= setsToWin;
              
              if (matchIsOver) {
                setWinner(gameWinner);
                setTimeoutWinner(game.endReason === 'TIMEOUT');
                setResultDialogOpen(true);
              }
            }
            
            setLoading(false);
            return;
          }
          
          // Check if game is still active
          if (game.status === 'ACTIVE' as any && game.gameState) {
            // ✅ Determine which color this user is playing
            const isWhitePlayer = game.whitePlayerId === user.id;
            const isBlackPlayer = game.blackPlayerId === user.id;
            
            debugLog.game('Player Check:', { userId: user.id, whitePlayerId: game.whitePlayerId, blackPlayerId: game.blackPlayerId, isWhitePlayer, isBlackPlayer });
            
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
              // Priority: check turnCompleted FIRST, then game.gameState.phase, then check diceValues
              let restoredPhase: GamePhase = 'waiting';
              
              if (game.gameState.phase) {
                restoredPhase = game.gameState.phase as GamePhase;
              } else if (game.gameState.diceValues && game.gameState.diceValues.length > 0) {
                restoredPhase = 'moving';
              } else if (!game.gameState.currentPlayer) {
                restoredPhase = 'opening';
              }
              
              // ✅ CRITICAL: If turnCompleted=true, OVERRIDE phase to waiting (not moving)
              // This handles refresh during AI's turn - AI finished but page shows moving
              // ALSO: Clear diceValues to allow fresh roll
              if (game.gameState.turnCompleted === true) {
                debugLog.state('turnCompleted=true detected, forcing phase to waiting and clearing diceValues (was:', restoredPhase, ')');
                restoredPhase = 'waiting';
                game.gameState.diceValues = []; // ✅ Clear old dice to allow new roll
              }
              
              debugLog.state('Phase restoration:', {
                fromBackend: game.gameState.phase,
                turnCompleted: game.gameState.turnCompleted,
                finalPhase: restoredPhase,
              });
              
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
              
              // ⚠️ CRITICAL FIX: If moving phase but no dice AND turnCompleted=false, force to waiting phase
              // But if turnCompleted=true, we already set to waiting above
              if (restoredPhase === 'moving' && (!game.gameState.diceValues || game.gameState.diceValues.length === 0) && !game.gameState.turnCompleted) {
                setTimeout(() => {
                  setGameState(prev => ({
                    ...prev,
                    gamePhase: 'waiting',
                    diceValues: [],
                  }));
                }, 500);
              }
              
              // 🕐 TIMER RESTORATION - Chess Clock Style WITH ELAPSED TIME CALCULATION
              // ⛔⛔⛔ CRITICAL LOGIC - DO NOT MODIFY ⛔⛔⛔
              // 
              // این بخش محاسبه elapsed time رو انجام میده که بعد از refresh
              // timer از جای درست ادامه پیدا کنه نه از اول
              //
              // Logic:
              // 1. Read timer values from database (whiteTimeRemaining, blackTimeRemaining)
              // 2. Read lastDoneBy and lastDoneAt from gameState
              // 3. Calculate elapsed: now - lastDoneAt
              // 4. Subtract elapsed from active player's timer:
              //    - lastDoneBy = 'black' → white was counting → whiteTime -= elapsed
              //    - lastDoneBy = 'white' → black was counting → blackTime -= elapsed
              // 5. Set corrected timer values
              //
              // Example:
              // - DB: whiteTime=120, lastDoneBy='black', lastDoneAt=10 seconds ago
              // - Calculation: whiteTime = 120 - 10 = 110
              // - Display: 110 seconds (NOT 120!)
              //
              // ⛔ بدون این محاسبه timer همیشه از database value شروع میشه که غلطه!
              // ⏱️ Timer restoration from backend
              // =================================================================
              // ✅ Backend's getGame() now calls calculateCurrentTimers()
              // ✅ This means whiteTimeRemaining/blackTimeRemaining already have elapsed time subtracted
              // ✅ Frontend just uses these values directly - NO recalculation needed!
              // =================================================================
              
          // ✅ Read timer values from backend (already calculated with elapsed time)
          const dbTimeControl = (game as any).timeControl || 1800;
          const whiteTimeDB = (game as any).whiteTimeRemaining;
          const blackTimeDB = (game as any).blackTimeRemaining;
          const lastDoneByFromState = (game.gameState as any).lastDoneBy;
          const lastDoneAtFromState = (game.gameState as any).lastDoneAt;
          
          // ✅ Set total time control from backend
          setGameTimeControl(dbTimeControl);
          
          // ✅ Use backend values directly (backend already calculated elapsed time via calculateCurrentTimers)
          const whiteTime = whiteTimeDB !== null && whiteTimeDB !== undefined ? whiteTimeDB : dbTimeControl;
          const blackTime = blackTimeDB !== null && blackTimeDB !== undefined ? blackTimeDB : dbTimeControl;              // ✅ Set timer values from backend (DO NOT recalculate - backend already did this!)
              setWhiteTimerSeconds(whiteTime);
              setBlackTimerSeconds(blackTime);
              
              // ✅ Restore lastDoneBy and lastDoneAt from gameState
              if (lastDoneByFromState) {
                setLastDoneBy(lastDoneByFromState.toLowerCase() as 'white' | 'black');
              }
              if (lastDoneAtFromState) {
                setLastDoneAt(lastDoneAtFromState);
              }
              
              debugLog.timerRestore('Timers restored from backend (backend calculated elapsed):', {
                white: whiteTime,
                black: blackTime,
                whiteFromDB: whiteTimeDB,
                blackFromDB: blackTimeDB,
                currentPlayer: game.gameState.currentPlayer,
                lastDoneBy: lastDoneByFromState,
                lastDoneAt: lastDoneAtFromState,
              });
              
              try {
                const canPlayResponse = await gamePersistenceAPI.axios.get(`/game/${game.id}/can-play`);
                
                const { canPlay, isYourTurn, currentPlayer } = canPlayResponse.data;
                const { lastDoneBy: lastDoneByBackend, lastDoneAt } = canPlayResponse.data;
                
                setCanUserPlay(canPlay);
                setWaitingForOpponent(!canPlay);
                
                // ⏱️ Set lastDoneBy and lastDoneAt for timer logic
                debugLog.timerSync('[Timer] lastDoneBy from backend:', lastDoneByBackend, 'currentPlayer:', currentPlayer);
                
                if (lastDoneByBackend) {
                  setLastDoneBy(lastDoneByBackend.toLowerCase() as 'white' | 'black');
                }
                
                const lastDoneAtBackend = game.gameState?.lastDoneAt;
                if (lastDoneAtBackend) {
                  setLastDoneAt(lastDoneAtBackend);
                }
                
                // ⏱️ Timer logic is FULLY controlled by backend
                // ================================================================
                // Backend sets lastDoneBy when someone presses Done.
                // Frontend NEVER sets lastDoneBy - it only reads from backend.
                // If lastDoneBy is null, NO timer should count (e.g., during opening).
                // ================================================================
                
              } catch (error) {
              }
              
              // ✅ Timers will automatically start based on gamePhase and currentPlayer
              // No manual timer start needed - GameTimer component handles it
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

  // ✅ Define handleDone before useAIGameLogic (AI needs this function)
  const handleDone = useCallback(async () => {
    const currentPlayer = gameState.currentPlayer;
    
    // ✅ CRITICAL: Reset rolling locks first (in case auto-done is called)
    isRollingLockRef.current = false;
    setIsRolling(false);
    setIsWaitingForBackend(false);
    
    if (diceRollerRef.current?.clearDice) {
      diceRollerRef.current.clearDice();
    }
    
    if (backendGameId && user) {
      try {
        // ✅ RECORD ALL MOVES FIRST (before ending turn)
        
        for (let i = moveCounter; i < gameState.moveHistory.length; i++) {
          const move = gameState.moveHistory[i];
          
          // ✅ Get current timer value from state
          const playerTimeRemaining = move.player === 'white' 
            ? whiteTimerSeconds
            : blackTimerSeconds;
          
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
              // ❌ Remove timer sync - server calculates timers
            },
            timeRemaining: playerTimeRemaining,
            moveTime: Date.now() - turnStartTime,
          });
          
        }
        
        setMoveCounter(gameState.moveHistory.length);
        
        // ✅ NOW END TURN
        const response = await gamePersistenceAPI.axios.post(`/game/${backendGameId}/end-turn`);
        
        debugLog.backend('Backend endTurn response:', JSON.stringify(response.data, null, 2));
        
        // ⏱️ SYNC TIMER after Done button (server calculates based on lastDoneAt)
        const updatedGame = await gamePersistenceAPI.getGame(backendGameId);
        const whiteTime = (updatedGame as any).whiteTimeRemaining || 0;
        const blackTime = (updatedGame as any).blackTimeRemaining || 0;
        
        debugLog.timerSync('[Timer Sync after Done]:', { whiteTime, blackTime });
        
        setWhiteTimerSeconds(whiteTime);
        setBlackTimerSeconds(blackTime);
        
        // Check if time is up
        if (whiteTime <= 0 || blackTime <= 0) {
          const winner = whiteTime <= 0 ? 'black' : 'white';
          setWinner(winner);
          setTimeoutWinner(true);
          setGameState(prev => ({
            ...prev,
            gamePhase: 'game-over',
          }));
          toast.error(`⏱️ Time's up! ${winner.toUpperCase()} wins!`);
          return;
        }
        
        // 🔒 CRITICAL: Verify server returned nextRoll for opponent
        const nextRoll = response.data.nextRoll;
        const nextPlayer = response.data.nextPlayer;
        
        debugLog.dice(`currentPlayer BEFORE: ${currentPlayer}, nextPlayer FROM BACKEND: ${nextPlayer}`);
        debugLog.dice(`nextRoll FROM BACKEND:`, JSON.stringify(nextRoll));
        
        if (!nextRoll || !nextRoll[nextPlayer] || nextRoll[nextPlayer].length === 0) {
          debugLog.error('Server did NOT return nextRoll! Cannot end turn.');
          debugLog.error('Response:', response.data);
          toast.error('Server error: Next dice not generated. Please try again.');
          return; // ⛔ STOP - Don't switch turns!
        }
        
        // ✅ Success - Server returned nextRoll
        debugLog.dice(`nextRoll:`, nextRoll);
        
        // ⏱️ Update lastDoneBy and lastDoneAt (current player just pressed Done)
        setLastDoneBy(currentPlayer);
        setLastDoneAt(new Date().toISOString());
        debugLog.timerSync(`[Timer] Updated lastDoneBy to: ${currentPlayer}`);
        
        // ✅ CRITICAL: Set canUserPlay based on WHO pressed Done
        // If AI pressed Done → nextPlayer is human → canUserPlay = true
        // If human pressed Done → nextPlayer is AI → canUserPlay = false
        const nextPlayerIsHuman = response.data.nextPlayer === playerColor;
        setCanUserPlay(nextPlayerIsHuman);
        setWaitingForOpponent(!nextPlayerIsHuman);
        
        // ✅ CRITICAL FIX: Reset ALL locks after successful end-turn
        isRollingLockRef.current = false;
        setIsRolling(false);
        setIsWaitingForBackend(false);
        autoDoneTriggeredRef.current = false; // Allow auto-done for next turn
        
        debugLog.state('All locks RESET after end-turn');
        
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
        debugLog.error('Failed to end turn:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to end turn';
        toast.error(errorMsg);
      }
    } else {
      // Frontend-only mode
      handleEndTurn();
    }
  }, [gameState, backendGameId, user, moveCounter, handleEndTurn, turnStartTime, whiteTimerSeconds, blackTimerSeconds]);

  // ✅ استفاده از AI hooks جدید (بعد از useGameState)
  const { isExecutingAIMove } = useAIGameLogic({
    gameState,
    setGameState,
    backendGameId,
    aiPlayerColor,
    handleDone,
    playSound,
    onTurnComplete: async () => {
      // ⏱️ CRITICAL: Sync timers from backend after AI finishes turn
      debugLog.timerSync('[AI Turn Complete] Syncing timers from backend...');
      
      if (backendGameId) {
        try {
          const updatedGame = await gamePersistenceAPI.getGame(backendGameId);
          
          // ✅ Backend already calculated timers with elapsed time
          // Just use the values from backend (DO NOT recalculate on frontend!)
          if (updatedGame.whiteTimeRemaining !== undefined) {
            setWhiteTimerSeconds(updatedGame.whiteTimeRemaining);
          }
          if (updatedGame.blackTimeRemaining !== undefined) {
            setBlackTimerSeconds(updatedGame.blackTimeRemaining);
          }
          
          // ✅ Update lastDoneBy from backend
          const lastDoneByBackend = updatedGame.gameState?.lastDoneBy;
          if (lastDoneByBackend) {
            setLastDoneBy(lastDoneByBackend.toLowerCase() as 'white' | 'black');
            debugLog.timerSync('[AI Turn Complete] Updated lastDoneBy:', lastDoneByBackend);
          }
          
          // ✅ CRITICAL: Use backend's lastDoneAt (NOT client NOW)
          // =================================================================
          // WHY: Backend already calculated elapsed time and returned updated timers.
          //      If we use client NOW, there will be network delay (e.g., 3-6 seconds).
          //      Timer countdown will see this delay as elapsed time and subtract it!
          // 
          // CORRECT: Use backend's lastDoneAt directly
          //          Backend sets this to NOW when AI presses Done
          //          Timers from backend are already adjusted for elapsed time
          //          No further calculation needed on frontend
          // =================================================================
          const lastDoneAtBackend = updatedGame.gameState?.lastDoneAt;
          if (lastDoneAtBackend) {
            setLastDoneAt(lastDoneAtBackend);
            debugLog.timerSync('[AI Turn Complete] Using backend lastDoneAt (prevents network delay subtraction)');
          }
          
          debugLog.timerSync('[AI Turn Complete] Timers synced from backend:', {
            white: updatedGame.whiteTimeRemaining,
            black: updatedGame.blackTimeRemaining,
            lastDoneBy: lastDoneByBackend,
            lastDoneAt: lastDoneAtBackend,
          });
        } catch (error) {
          debugLog.error('Failed to sync timers after AI turn:', error);
        }
      }
    },
  });

  // Use Dice Roll Control hook (control Roll button)
  const { canRoll, canRollReason } = useDiceRollControl({
    gameState,
    playerColor,
    isRolling,
    isWaitingForBackend,
    isExecutingAIMove,
    whiteTimerSeconds,
    blackTimerSeconds,
  });

  // 🐛 Debug canRoll
  useEffect(() => {
    debugLog.dice('canRoll status:', {
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

  // ✅ UNIFIED AUTO-DONE: If no valid moves after dice roll, automatically end turn
  useEffect(() => {
    // Reset lock when phase changes away from moving/waiting
    if (gameState.gamePhase !== 'moving' && gameState.gamePhase !== 'waiting') {
      autoDoneTriggeredRef.current = false;
      // Clear any pending timer
      if (autoDoneTimerRef.current) {
        clearTimeout(autoDoneTimerRef.current);
        autoDoneTimerRef.current = null;
      }
      return;
    }
    
    // ✅ CRITICAL FIX: gamePhase can be 'waiting' when validMoves=0 (see use-game-state.ts:144)
    // Auto-done when dice exist but NO valid moves (player is BLOCKED)
    const shouldAutoDone =
      (gameState.gamePhase === 'moving' || gameState.gamePhase === 'waiting') &&
      gameState.diceValues.length > 0 && // Has unused dice
      gameState.validMoves.length === 0 && // But can't move anything
      !isExecutingAIMove &&
      !autoDoneTriggeredRef.current &&
      !winner &&
      backendGameId;

    if (shouldAutoDone) {
      debugLog.state('Player is BLOCKED - has dice but no valid moves - auto-pressing Done... (gamePhase:', gameState.gamePhase, ')');
      
      // Set lock to prevent multiple triggers
      autoDoneTriggeredRef.current = true;
      
      // ✅ CRITICAL: Force reset rolling state immediately when blocked
      isRollingLockRef.current = false;
      setIsRolling(false);
      setIsWaitingForBackend(false);
      
      // Clear any existing timer
      if (autoDoneTimerRef.current) {
        clearTimeout(autoDoneTimerRef.current);
      }
      
      // Delay to let player see they're blocked
      autoDoneTimerRef.current = setTimeout(async () => {
        debugLog.state('Auto-pressing Done (blocked - no valid moves)');
        try {
          await handleDone();
          debugLog.state('Auto-done completed successfully');
        } catch (error) {
          debugLog.error('Auto-done failed:', error);
          // Reset lock on error
          autoDoneTriggeredRef.current = false;
        }
        autoDoneTimerRef.current = null;
      }, 1500); // 1.5 second delay to show the situation
    }

    // Don't cleanup timer here - let it run
    return undefined;
  }, [
    gameState.gamePhase, 
    gameState.diceValues.length, 
    gameState.validMoves.length, 
    isExecutingAIMove, 
    backendGameId, 
    winner,
    handleDone
  ]);

  // ✅ Monitor backend connection
  const checkBackendConnection = useCallback(async () => {
    try {
      // یه API ساده که سریع جواب میده
      await gamePersistenceAPI.axios.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const { isConnected: isBackendConnected } = useBackendConnection({
    enabled: !!backendGameId, // فقط وقتی بازی شروع شده
    checkConnection: checkBackendConnection,
    intervalSeconds: 5, // هر 5 ثانیه چک کن
  });

  // ⏱️ PAGE VISIBILITY SYNC - Fetch from backend and recalculate timer when tab becomes visible
  useEffect(() => {
    if (!backendGameId || !gameState.gamePhase || gameState.gamePhase === 'opening' || gameState.gamePhase === 'game-over' || gameState.gamePhase === 'finished' || winner) {
      return;
    }

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        debugLog.visibility('[Visibility] Page visible - syncing timer from backend...');
        
        try {
          // ✅ CRITICAL: Read from backend (server is source of truth)
          const updatedGame = await gamePersistenceAPI.getGame(backendGameId);
          
          // ⚠️ Check if game ended while tab was hidden
          if (updatedGame.status === 'COMPLETED' || updatedGame.winner) {
            debugLog.visibility('[Visibility] Game completed - showing result dialog');
            
            const gameWinner = updatedGame.winner?.toLowerCase() as 'white' | 'black';
            if (gameWinner) {
              setWinner(gameWinner);
              setScores({
                white: updatedGame.whiteSetsWon || 0,
                black: updatedGame.blackSetsWon || 0,
              });
              setTimeoutWinner(updatedGame.endReason === 'TIMEOUT');
              setResultDialogOpen(true);
              setGameState(prev => ({ ...prev, gamePhase: 'game-over' }));
            }
            return;
          }
          
          const whiteTimeDB = updatedGame.whiteTimeRemaining;
          const blackTimeDB = updatedGame.blackTimeRemaining;
          const lastDoneByBackend = updatedGame.gameState?.lastDoneBy;
          const lastDoneAtBackend = updatedGame.gameState?.lastDoneAt;
          
          // ✅ CRITICAL FIX: Backend already calculated elapsed time!
          // Backend stores lastDoneAt and calculates: timeRemaining = initialTime - elapsed
          // We should NEVER subtract elapsed time again on frontend!
          // Just use backend values directly (they are already correct)
          
          debugLog.visibility('[Visibility] Using backend timer values (already includes elapsed time):', {
            white: whiteTimeDB,
            black: blackTimeDB,
            lastDoneBy: lastDoneByBackend,
            lastDoneAt: lastDoneAtBackend,
          });
          
          // ✅ Set timer values directly from backend (NO recalculation!)
          if (whiteTimeDB !== undefined) {
            setWhiteTimerSeconds(whiteTimeDB);
          }
          if (blackTimeDB !== undefined) {
            setBlackTimerSeconds(blackTimeDB);
          }
          
          // ✅ Update lastDoneBy and lastDoneAt
          if (lastDoneByBackend) {
            setLastDoneBy(lastDoneByBackend.toLowerCase() as 'white' | 'black');
          }
          if (lastDoneAtBackend) {
            setLastDoneAt(lastDoneAtBackend);
          }
        } catch (error) {
          debugLog.error('Failed to sync timer on visibility change:', error);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [backendGameId, gameState.gamePhase, winner]);

  // ⏱️ LOCAL TIMER COUNTDOWN - Update timer state every second
  // ✅ Uses timestamp-based system to work even when page is hidden/minimized
  useEffect(() => {
    debugLog.timerCountdown('[Timer Countdown] useEffect triggered:', {
      lastDoneBy,
      phase: gameState.gamePhase,
      winner,
      isExecutingAIMove,
      currentPlayer: gameState.currentPlayer,
      aiPlayerColor,
    });
    
    // Determine which timer should count
    const whiteIsActive = lastDoneBy === 'black' && 
                         gameState.gamePhase !== 'opening' && 
                         gameState.gamePhase !== 'game-over' && 
                         !winner;
    
    const blackIsActive = lastDoneBy === 'white' && 
                         gameState.gamePhase !== 'opening' && 
                         gameState.gamePhase !== 'game-over' && 
                         !winner;

    if (!whiteIsActive && !blackIsActive) {
      debugLog.timerCountdown('[Timer Countdown] No active timer', {
        lastDoneBy,
        whiteWouldBe: lastDoneBy === 'black',
        blackWouldBe: lastDoneBy === 'white',
        phase: gameState.gamePhase,
      });
      return;
    }
    
    // ⏱️ CRITICAL: Freeze HUMAN timer when AI is playing, but let AI timer count
    const isAITurn = gameState.currentPlayer === aiPlayerColor;
    const isAIMovingPhase = isAITurn && gameState.gamePhase === 'moving';
    const humanPlayerColor = aiPlayerColor === 'white' ? 'black' : 'white';
    
    // If AI is playing and human timer would be active, freeze it
    if ((isExecutingAIMove || isAIMovingPhase) && 
        ((whiteIsActive && humanPlayerColor === 'white') || (blackIsActive && humanPlayerColor === 'black'))) {
      debugLog.timerCountdown('[Timer Countdown] Frozen - Human timer frozen during AI turn', {
        isExecutingAIMove,
        isAIMovingPhase,
        humanPlayerColor,
      });
      return;
    }

    debugLog.timerCountdown('[Timer Countdown] Starting interval:', {
      whiteIsActive,
      blackIsActive,
      whiteTime: whiteTimerSeconds,
      blackTime: blackTimerSeconds,
    });

    // ⏱️ FIXED: Simple 1-second countdown (no timestamp-based catching up)
    // Backend is source of truth, we just show countdown animation
    const interval = setInterval(() => {
      if (whiteIsActive) {
        setWhiteTimerSeconds(prev => {
          const newValue = Math.max(0, prev - 1);
          
          // Check timeout - VERIFY WITH BACKEND
          if (newValue === 0 && !winner && !timeoutVerifiedRef.current.white) {
              debugLog.timeout('[WHITE] TIME UP! Verifying with backend...');
              timeoutVerifiedRef.current.white = true; // Mark as verified to prevent multiple calls
              
              // ✅ Verify timeout with backend (server is source of truth)
              if (backendGameId && user) {
                gamePersistenceAPI.getGame(backendGameId)
                  .then(updatedGame => {
                    const whiteTimeBackend = updatedGame.whiteTimeRemaining;
                    const blackTimeBackend = updatedGame.blackTimeRemaining;
                    
                    debugLog.timeout('[Timeout Verification] Backend times:', {
                      white: whiteTimeBackend,
                      black: blackTimeBackend,
                    });
                    
                    // Only trigger timeout if backend confirms time is up
                    if (whiteTimeBackend !== undefined && whiteTimeBackend <= 0) {
                      debugLog.timeout('Backend confirmed WHITE timeout');
                      const setsToWin = Math.ceil(maxSets / 2);
                      
                      // ✅ Award enough sets to black to win the match
                      setScores(s => {
                        const blackNewScore = Math.max(s.black, setsToWin);
                        debugLog.timeout('Timeout victory:', {
                          winner: 'black',
                          reason: 'WHITE timeout',
                          finalScore: { white: s.white, black: blackNewScore },
                          setsToWin,
                        });
                        return { ...s, black: blackNewScore };
                      });
                      
                      setWinner('black');
                      setTimeoutWinner(true);
                      setResultDialogOpen(true);
                      
                      // Notify backend to end game - need to get scores from state
                      setScores(currentScores => {
                        gamePersistenceAPI.axios.post(`/game/${backendGameId}/end-game`, {
                          winner: 'BLACK',
                          whiteSetsWon: currentScores.white,
                          blackSetsWon: currentScores.black,
                          endReason: 'TIMEOUT',
                          finalGameState: gameState,
                        }).then(() => debugLog.timeout('White timeout recorded'))
                          .catch(err => debugLog.error('Failed to record timeout:', err));
                        
                        return currentScores; // Return unchanged to not trigger re-render
                      });
                    } else {
                      debugLog.timeout('Backend says time NOT up yet - syncing timer');
                      if (whiteTimeBackend !== undefined) {
                        setWhiteTimerSeconds(whiteTimeBackend);
                      }
                      timeoutVerifiedRef.current.white = false; // Reset flag if backend says not timeout
                    }
                  })
                  .catch(err => {
                    debugLog.error('Failed to verify timeout:', err);
                    timeoutVerifiedRef.current.white = false; // Reset flag on error
                  });
              }
            }
            
            return newValue;
          });
        }
        
        if (blackIsActive) {
          setBlackTimerSeconds(prev => {
            const newValue = Math.max(0, prev - 1);
            
            // Check timeout - VERIFY WITH BACKEND
            if (newValue === 0 && !winner && !timeoutVerifiedRef.current.black) {
              debugLog.timeout('[BLACK] TIME UP! Verifying with backend...');
              timeoutVerifiedRef.current.black = true; // Mark as verified to prevent multiple calls
              
              // ✅ Verify timeout with backend (server is source of truth)
              if (backendGameId && user) {
                gamePersistenceAPI.getGame(backendGameId)
                  .then(updatedGame => {
                    const whiteTimeBackend = updatedGame.whiteTimeRemaining;
                    const blackTimeBackend = updatedGame.blackTimeRemaining;
                    
                    debugLog.timeout('[Timeout Verification] Backend times:', {
                      white: whiteTimeBackend,
                      black: blackTimeBackend,
                    });
                    
                    // Only trigger timeout if backend confirms time is up
                    if (blackTimeBackend !== undefined && blackTimeBackend <= 0) {
                      debugLog.timeout('Backend confirmed BLACK timeout');
                      const setsToWin = Math.ceil(maxSets / 2);
                      
                      // ✅ Award enough sets to white to win the match
                      setScores(s => {
                        const whiteNewScore = Math.max(s.white, setsToWin);
                        debugLog.timeout('Timeout victory:', {
                          winner: 'white',
                          reason: 'BLACK timeout',
                          finalScore: { white: whiteNewScore, black: s.black },
                          setsToWin,
                        });
                        return { ...s, white: whiteNewScore };
                      });
                      
                      setWinner('white');
                      setTimeoutWinner(true);
                      setResultDialogOpen(true);
                      
                      // Notify backend to end game - need to get scores from state
                      setScores(currentScores => {
                        gamePersistenceAPI.axios.post(`/game/${backendGameId}/end-game`, {
                          winner: 'WHITE',
                          whiteSetsWon: currentScores.white,
                          blackSetsWon: currentScores.black,
                          endReason: 'TIMEOUT',
                          finalGameState: gameState,
                        }).then(() => debugLog.timeout('Black timeout recorded'))
                          .catch(err => debugLog.error('Failed to record timeout:', err));
                        
                        return currentScores; // Return unchanged to not trigger re-render
                      });
                    } else {
                      debugLog.timeout('Backend says time NOT up yet - syncing timer');
                      if (blackTimeBackend !== undefined) {
                        setBlackTimerSeconds(blackTimeBackend);
                      }
                      timeoutVerifiedRef.current.black = false; // Reset flag if backend says not timeout
                    }
                  })
                  .catch(err => {
                    debugLog.error('Failed to verify timeout:', err);
                    timeoutVerifiedRef.current.black = false; // Reset flag on error
                  });
              }
            }
            
            return newValue;
          });
        }
    }, 1000); // ✅ Simple 1-second interval (no catch-up)

    return () => {
      clearInterval(interval);
    };
  }, [lastDoneBy, gameState.gamePhase, gameState.currentPlayer, aiPlayerColor, winner, backendGameId, user, gameState, maxSets, isExecutingAIMove]);

  // ✅ Timer sync happens ONLY on Done button press (in handleDone)
  // No interval needed - reduces server load and prevents unnecessary syncs

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

  // 🔊 ترکیب شده: Sound Effects (Turn + Move)
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

    // Play move sound when move history changes
    if (gameState.moveHistory.length > lastMoveCountRef.current) {
      playSound('move');
      lastMoveCountRef.current = gameState.moveHistory.length;
    } else if (gameState.moveHistory.length === 0) {
      // Reset counter when game resets
      lastMoveCountRef.current = 0;
    }
  }, [playerColor, gameState.currentPlayer, gameState.gamePhase, gameState.moveHistory.length, winner, playSound]);

  // ✅ Stop rolling when gamePhase changes OR when dice values are set
  useEffect(() => {
    if (isRolling) {
      // Stop rolling when entering moving phase
      if (gameState.gamePhase === 'moving') {
        isRollingLockRef.current = false;
        setIsRolling(false);
      }
      // Stop rolling when leaving opening phase (going to waiting)
      else if (gameState.gamePhase === 'waiting' && gameState.openingRoll.white !== null && gameState.openingRoll.black !== null) {
        isRollingLockRef.current = false;
        setIsRolling(false);
      }
      // Stop rolling when dice values are applied (ANY player rolled)
      else if (gameState.diceValues.length > 0) {
        isRollingLockRef.current = false;
        setIsRolling(false);
      }
      
      // ✅ SAFETY: Force reset after 5 seconds (in case animation callback never fires)
      const safetyTimeout = setTimeout(() => {
        if (isRolling) {
          debugLog.warn('Safety timeout: Force resetting isRolling after 5s');
          isRollingLockRef.current = false;
          setIsRolling(false);
          setIsWaitingForBackend(false);
        }
      }, 5000);
      
      return () => clearTimeout(safetyTimeout);
    }
  }, [gameState.gamePhase, gameState.openingRoll.white, gameState.openingRoll.black, gameState.diceValues.length, isRolling]);

  // Check for set winner and start new set
  useEffect(() => {
    if (gameState.gamePhase === 'finished' && !winner && !setWinnerProcessedRef.current) {
      // Mark as processed to prevent double execution
      setWinnerProcessedRef.current = true;
      
      // Determine set winner
      const currentSetWinner = gameState.boardState.off.white === 15 ? 'white' : 'black';
      
      playSound('move');
      
      // Timers automatically stop when gamePhase becomes 'finished'
      
      // Update scores
      setScores((prev) => {
        const newScore = {
          ...prev,
          [currentSetWinner]: prev[currentSetWinner] + 1,
        };
        
        // Calculate sets needed to win (more than 50% of total sets)
        // 1 set: need 1 | 3 sets: need 2 | 5 sets: need 3 | 9 sets: need 5
        const setsToWin = Math.ceil(maxSets / 2);
        
        debugLog.setWinner('Set winner check:', {
          currentSetWinner,
          newScore,
          maxSets,
          setsToWin,
          matchOver: newScore[currentSetWinner] >= setsToWin,
        });
        
        if (newScore[currentSetWinner] >= setsToWin) {
          // Match over - this player won the required number of sets
          setWinner(currentSetWinner);
          setTimeoutWinner(false);
          setResultDialogOpen(true);
          playSound('move');
          
          debugLog.matchWinner(`MATCH WON by ${currentSetWinner}! Won ${newScore[currentSetWinner]} sets out of ${maxSets}`);
        } else {
          // Start next set after delay
          
          // Show win text for set winner
          setShowWinText(true);
          setWinTextMessage(currentSetWinner === 'white' ? 'You Win This Set!' : 'AI Wins This Set!');
          
          setTimeout(() => {
            setShowWinText(false);
            
            // After win text disappears, show set start animation
            setTimeout(async () => {
              const nextSet = currentSet + 1;
              setCurrentSet(nextSet);
              
              // Show set start animation
              showWinMessage(`Start Set ${nextSet} of ${maxSets}`);
              
              startNewSet(currentSetWinner); // Winner starts next set
              
              // ✅ Clear dice from previous set
              if (diceRollerRef.current?.clearDice) {
                diceRollerRef.current.clearDice();
              }
              
              // ✅ Reset timer values for new set - READ FROM BACKEND
              let newWhiteTime = gameTimeControl;
              let newBlackTime = gameTimeControl;
              
              if (backendGameId) {
                try {
                  const game = await gamePersistenceAPI.getGame(backendGameId);
                  const dbTimeControl = (game as any).timeControl || gameTimeControl;
                  newWhiteTime = dbTimeControl;
                  newBlackTime = dbTimeControl;
                  debugLog.timerRestore('Timer reset for new set:', { timeControl: dbTimeControl });
                } catch (error) {
                  debugLog.warn('Failed to fetch timer values, using state:', error);
                }
              }
              
              setWhiteTimerSeconds(newWhiteTime);
              setBlackTimerSeconds(newBlackTime);
              
              // Reset the processed flag for next set
              setWinnerProcessedRef.current = false;
              openingRollEndedRef.current = false; // Reset opening roll flag for new set
              
            }, 500); // 0.5 second after win text disappears
          }, 4000); // 4 seconds to show the victory text
        }
        
        return newScore;
      });
    }
  }, [gameState.gamePhase, gameState.boardState.off, winner, currentSet, maxSets, startNewSet, playSound]);

  const handleDiceRollComplete = async (results: { value: number; type: string }[]) => {
    // ✅ Release lock and stop rolling state after animation completes
    isRollingLockRef.current = false;
    setIsWaitingForBackend(false);
    setIsRolling(false);
    
    // ✅ ANTI-CHEAT: Use backend dice, NOT physics results!
    // Physics might show wrong numbers (shift_dice_faces doesn't work perfectly)
    let actualResults = results;
    
    if (backendDiceRef.current) {
      debugLog.dice('Physics showed:', results.map(r => r.value));
      debugLog.dice('Using backend dice:', backendDiceRef.current);
      
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
      debugLog.dice('Dice rolled:', actualResults.map(r => r.value));
    }
  };

  const triggerDiceRoll = async () => {
    debugLog.dice('🎲 triggerDiceRoll called');
    
    // ✅ CRITICAL: Check lock first (synchronous, prevents race condition)
    if (isRollingLockRef.current) {
      debugLog.dice('⛔ Roll already in progress (locked)');
      return;
    }
    
    debugLog.state('📊 State:', {
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
      
      // ✅ Clear previous dice BEFORE rolling (important for 2nd opening roll)
      if (diceRollerRef.current?.clearDice) {
        diceRollerRef.current.clearDice();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // ✅ Set lock BEFORE rolling
      isRollingLockRef.current = true;
      setIsWaitingForBackend(true);

      // ✅ Get opening roll dice from backend
      if (backendGameId) {
        try {
          const diceResponse = await gamePersistenceAPI.rollDice(backendGameId);
          debugLog.opening('Opening roll from backend:', diceResponse);
          
          // ✅ Save backend dice to ref (only 1 die for opening)
          backendDiceRef.current = diceResponse.dice;
          
          // ⛔ CRITICAL: Set currentPlayer BEFORE showing dice
          setGameState(prev => ({ ...prev, currentPlayer: playerColor as Player }));
          
          // Show dice animation with backend values
          if (diceRollerRef.current?.setDiceValues) {
            setIsRolling(true);
            diceRollerRef.current.setDiceValues(diceResponse.dice);
          }
        } catch (error) {
          isRollingLockRef.current = false;
          setIsRolling(false);
          setIsWaitingForBackend(false);
          
          // ⚠️ بهتر نشون بدیم که سرور قطع شده
          const errorMessage = error instanceof Error ? error.message : 'Failed to connect to backend';
          const displayMessage = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')
            ? '❌ سرور قطع است. لطفاً اتصال خود را بررسی کنید.'
            : `❌ ${errorMessage}`;
          toast.error(displayMessage);
        }
      } else {
        // Fallback to local roll if no backend
        if (diceRollerRef.current?.rollDice) {
          setGameState(prev => ({ ...prev, currentPlayer: playerColor as Player }));
          
          setTimeout(() => {
            setIsRolling(true);
            diceRollerRef.current?.rollDice();
          }, 100);
        }
      }
      return;
    }
    
    // Prevent rolling if already rolling or waiting (only in normal gameplay)
    if (isRolling || isWaitingForBackend) {
      debugLog.dice('Roll blocked by state:', { isRolling, isWaitingForBackend });
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
    
    // ✅ Set lock and loading state BEFORE API call
    isRollingLockRef.current = true;
    setIsWaitingForBackend(true);

    try {
      const diceResponse = await gamePersistenceAPI.rollDice(backendGameId);
      debugLog.dice('Dice response:', diceResponse);
      
      // ✅ CRITICAL: Save backend dice to ref (for anti-cheat)
      backendDiceRef.current = diceResponse.dice;
      debugLog.dice('Backend dice saved:', diceResponse.dice);

      // Show dice animation with backend values
      if (diceRollerRef.current?.setDiceValues) {
        setIsRolling(true);
        diceRollerRef.current.setDiceValues(diceResponse.dice);
      }
      
      // Note: Lock will be released in handleDiceRollComplete after animation
    } catch (error) {
      // ✅ Release lock on error
      isRollingLockRef.current = false;
      setIsRolling(false);
      setIsWaitingForBackend(false);
      
      // ⚠️ Show error message to user
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to backend';
      const displayMessage = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')
        ? '❌ سرور قطع است. لطفاً اتصال خود را بررسی کنید.'
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



  const handleRematch = useCallback(async () => {
    debugLog.game('Starting rematch - resetting all game state...');
    
    // Close result dialog
    setResultDialogOpen(false);
    
    // ✅ Reset all game state variables
    setWinner(null);
    setTimeoutWinner(false);
    setScores({ white: 0, black: 0 });
    setCurrentSet(1);
    setShowWinText(false);
    setWinTextMessage('');
    
    // ✅ Reset backend game state
    setBackendGameId(null); // Will create new game
    setBackendGame(null);
    setMoveCounter(0);
    setTurnStartTime(Date.now());
    
    // ✅ Reset player states
    setCanUserPlay(true);
    setWaitingForOpponent(false);
    setPlayerColor(null); // Reset to show color selection
    
    // ✅ Reset timers
    let newWhiteTime = gameTimeControl;
    let newBlackTime = gameTimeControl;
    
    if (backendGameId) {
      try {
        const game = await gamePersistenceAPI.getGame(backendGameId);
        const dbTimeControl = (game as any).timeControl || gameTimeControl;
        newWhiteTime = dbTimeControl;
        newBlackTime = dbTimeControl;
        debugLog.timerRestore('Timer values for rematch:', { timeControl: dbTimeControl });
      } catch (error) {
        debugLog.warn('Failed to fetch timer values, using default:', error);
      }
    }
    
    setWhiteTimerSeconds(newWhiteTime);
    setBlackTimerSeconds(newBlackTime);
    setLastDoneBy(null);
    setLastDoneAt(null);
    
    // ✅ Reset all refs
    openingRollEndedRef.current = false;
    setWinnerProcessedRef.current = false;
    gameLoadedRef.current = false;
    backendDiceRef.current = null;
    isRollingLockRef.current = false;
    autoDoneTriggeredRef.current = false;
    timeoutVerifiedRef.current = { white: false, black: false };
    lastTurnPlayerRef.current = null;
    lastMoveCountRef.current = 0;
    
    // ✅ Clear dice from board
    if (diceRollerRef.current?.clearDice) {
      diceRollerRef.current.clearDice();
    }
    
    // ✅ Reset game ended flag
    gameEndedRef.current = false;
    
    // ✅ Reset game state to initial (this resets board, phase, etc.)
    if (resetGame) {
      resetGame();
      debugLog.game('Game state reset to initial');
    }
    
    debugLog.game('Rematch ready - awaiting color selection');
  }, [resetGame, gameTimeControl, backendGameId]);

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
          
          // ✅ Set timeControl from created game
          const dbTimeControl = (game as any).timeControl || 1800;
          setGameTimeControl(dbTimeControl);
          setWhiteTimerSeconds(dbTimeControl);
          setBlackTimerSeconds(dbTimeControl);
          
          debugLog.game('Game created with timeControl:', dbTimeControl);
          
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
      
      debugLog.opening('🎯 Opening roll conditions met, saving to backend...');
      
      const saveOpeningRoll = async () => {
        try {
          // ✅ Determine winner from opening roll (HIGHER dice wins in Nard!)
          const openingWinner: Player = gameState.openingRoll.white! > gameState.openingRoll.black! ? 'white' : 'black';
          debugLog.openingWinner(`🎯 Opening roll: white=${gameState.openingRoll.white}, black=${gameState.openingRoll.black}, winner=${openingWinner}`);
          debugLog.game(`📊 In Nard, HIGHER dice wins! Winner: ${openingWinner}`);
          
          const updatedGameState = {
            openingRoll: gameState.openingRoll,
            currentPlayer: openingWinner, // ✅ Set winner as current player
            phase: 'waiting',
            points: gameState.boardState.points,
            bar: gameState.boardState.bar,
            off: gameState.boardState.off,
            diceValues: [],
          };
          
          debugLog.backend('📤 Sending opening roll to backend...');
          
          // ✅ Save opening roll AND generate dice for winner in one call
          const response = await gamePersistenceAPI.axios.post(
            `/game/${backendGameId}/complete-opening-roll`,
            { winner: openingWinner }
          );
          
          debugLog.opening('Opening roll completed, dice generated for winner');
          debugLog.opening('Full response:', response.data);
          debugLog.opening('nextRoll:', response.data.nextRoll);
          
          // ✅ CRITICAL: Verify nextRoll exists before saving
          if (!response.data.nextRoll) {
            debugLog.error('Backend did not return nextRoll!');
            throw new Error('Backend did not generate dice for winner');
          }
          
          debugLog.opening('Saving nextRoll to state:', response.data.nextRoll);
          
          // ⏱️ Set lastDoneBy and lastDoneAt to opposite of winner (so winner's timer starts)
          // If white won opening → lastDoneBy = 'black' → white timer counts
          const loser = openingWinner === 'white' ? 'black' : 'white';
          setLastDoneBy(loser);
          setLastDoneAt(new Date().toISOString());
          debugLog.timerSync(`[Timer] Opening completed - set lastDoneBy to ${loser} (so ${openingWinner} timer starts)`);
          
          setGameState(prev => ({
            ...prev,
            currentPlayer: openingWinner as Player,
            gamePhase: 'waiting',
            diceValues: [],
            nextRoll: response.data.nextRoll, // ✅ Save dice for winner
          }));
          
        } catch (error) {
          debugLog.error('Error saving opening roll:', error);
          debugLog.error('Error details:', error.response?.data || error.message);
          
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
    if (backendGameId && user && winner && !gameEndedRef.current) {
      gameEndedRef.current = true; // Mark as ended immediately to prevent duplicates
      
      const endBackendGame = async () => {
        try {
          await gamePersistenceAPI.endGame(backendGameId, {
            winner: winner.toUpperCase() as APIPlayerColor,
            whiteSetsWon: scores.white,
            blackSetsWon: scores.black,
            endReason: timeoutWinner ? 'TIMEOUT' : 'NORMAL_WIN',
            finalGameState: gameState.boardState,
          });
          
          debugLog.results('Game ended successfully:', { 
            winner, 
            reason: timeoutWinner ? 'TIMEOUT' : 'NORMAL_WIN', 
            scores 
          });
        } catch (error) {
          // ✅ Silently ignore "already ended" errors (handled in API layer)
          // Only log unexpected errors
          if (error instanceof Error && !error.message.includes('already ended')) {
            debugLog.error('Failed to end game:', error.message);
          }
        }
      };
      
      endBackendGame();
    }
  }, [backendGameId, user, winner, timeoutWinner, scores, gameState.boardState]);

  // Clear dice when opening roll is a tie (shouldClearDice flag)
  // 🏆 Check for SET winner after each move (not match winner!)
  // این فقط یک ست رو چک میکنه، نه کل match رو!
  // Match winner در useEffect دیگه (خطوط 1370-1460) مشخص میشه
  useEffect(() => {
    const whiteWon = gameState.boardState.off.white === 15;
    const blackWon = gameState.boardState.off.black === 15;
    
    // ✅ فقط gamePhase رو تغییر بده، نه winner رو!
    if ((whiteWon || blackWon) && gameState.gamePhase !== 'finished') {
      // این فقط یک ست تموم شده، نه کل match!
      // useEffect بعدی (line 1370) چک میکنه که آیا کل match تموم شده یا نه
      setGameState((prev) => ({
        ...prev,
        gamePhase: 'finished',
      }));
    }
  }, [gameState.boardState.off.white, gameState.boardState.off.black, gameState.gamePhase]);

  // 🎲 ترکیب شده: Dice Clear Management (Tie + Opening Winner)
  useEffect(() => {
    // Clear dice when opening roll is a tie (shouldClearDice flag)
    if (gameState.shouldClearDice && diceRollerRef.current?.clearDice) {
      diceRollerRef.current.clearDice();
      
      // ✅ CRITICAL: Stop rolling state and release lock so players can roll again
      isRollingLockRef.current = false;
      setIsRolling(false);
      
      // ✅ CRITICAL: Reset openingRollEndedRef so opening roll can be saved again after tie
      openingRollEndedRef.current = false;
      
      // Reset the flag after clearing
      setGameState((prev) => ({
        ...prev,
        shouldClearDice: false,
      }));
    }

    // ⚠️ CRITICAL: Clear dice when opening roll completes (winner determined)
    if (
      gameState.gamePhase === 'waiting' &&
      gameState.openingRoll.white !== null &&
      gameState.openingRoll.black !== null &&
      gameState.openingRoll.white !== gameState.openingRoll.black &&
      gameState.diceValues.length === 0 &&
      diceRollerRef.current?.clearDice
    ) {
      // Clear opening roll dice from board
      debugLog.opening('Clearing opening roll dice - winner must roll new dice');
      diceRollerRef.current.clearDice();
      
      // ✅ CRITICAL: Wait for clear to complete, then clear again to ensure scene is empty
      setTimeout(() => {
        if (diceRollerRef.current?.clearDice) {
          debugLog.opening('Double-clear to ensure no leftover dice');
          diceRollerRef.current.clearDice();
        }
      }, 200);
    }
  }, [gameState.shouldClearDice, gameState.gamePhase, gameState.openingRoll, gameState.diceValues.length, setGameState]);

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
        onShowStaticDice={handleShowStaticDice}
      />
      
      <BoardThemeProvider useApi={false}>
        <Container 
          maxWidth="xl" 
          sx={{ 
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            py: 0,
            px: { xs: 1, sm: 2, md: 3 },
            overflow: 'hidden',
          }}
        >
          {/* Background Pattern - پترن Games از Telegram با تنظیمات دقیق کاربر */}
          <BackgroundPattern opacity={0.8} />

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
        sx={{ 

          marginTop: { xs: 3, sm: 5, md: 6 },
          margin: 'auto',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: { xs: '100%', sm: 600, md: 800 },
          px: { xs: 1, sm: 1, md: 1 },
          zIndex: 1,
          '& > *': {
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          },
        }}
      >
        <PlayerCard
          name="AI"
          country="AI"
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
          timeRemaining={playerColor === 'white' ? blackTimerSeconds : whiteTimerSeconds}
          totalTime={gameTimeControl}
          isWinner={winner === (playerColor === 'white' ? 'black' : 'white')}
          isLoser={winner === playerColor}
          isAI
          position="top"
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
          alignItems: 'center',
          flex: 1,
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
              currentPlayer={gameState.currentPlayer}
              onRollComplete={handleDiceRollComplete}
              initialDiceValues={(
                backendGame?.currentDiceValues && 
                ((gameState.currentPlayer === 'white' && backendGame?.whiteHasDiceRolled) ||
                 (gameState.currentPlayer === 'black' && backendGame?.blackHasDiceRolled))
              ) ? (backendGame.currentDiceValues as number[]) : []}
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
        sx={{
          marginBottom: { xs: 3, sm: 5, md: 6 },
          margin: 'auto',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: { xs: '100%', sm: 600, md: 800 },
          px: { xs: 1, sm: 1, md: 1 },
          zIndex: 1,
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
            (gameState.diceValues.length === 0 || gameState.validMoves.length === 0) &&
            (playerColor === 'white' ? whiteTimerSeconds > 0 : blackTimerSeconds > 0)
          }
          onUndo={handleUndo}
          canUndo={gameState.currentPlayer === playerColor && gameState.gamePhase === 'moving' && gameState.moveHistory.length > 0}
          timeRemaining={playerColor === 'white' ? whiteTimerSeconds : blackTimerSeconds}
          totalTime={gameTimeControl}
          isWinner={winner === playerColor}
          isLoser={winner !== null && winner !== playerColor}
          onAvatarClick={() => setSettingsDrawerOpen(true)}
          position="bottom"
        />
      </Box>

      {/* Game Settings Drawer */}
      <GameSettingsDrawer
        displayName={_mock.fullName(0)}
        photoURL={_mock.image.avatar(0)}
        currentSet={currentSet}
        maxSets={maxSets}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onShare={() => {
          debugLog.share('Share clicked, backendGameId:', backendGameId);
          const shareUrl = `${window.location.origin}${window.location.pathname}?game-id=${backendGameId}`;
          debugLog.share('Share URL:', shareUrl);
          
          if (navigator.share) {
            debugLog.share('Using native share API');
            navigator.share({
              title: 'Nard Arena - AI Game',
              text: 'Watch me play backgammon against AI!',
              url: shareUrl,
            }).catch((error) => debugLog.error('Share failed:', error));
          } else {
            debugLog.share('Using clipboard API');
            navigator.clipboard.writeText(shareUrl)
              .then(() => {
                debugLog.share('Copied to clipboard');
                setShareToast(true);
                setTimeout(() => setShareToast(false), 3000);
              })
              .catch((error) => {
                debugLog.error('Clipboard write failed:', error);
              });
          }
        }}
        onExitGame={() => setExitDialogOpen(true)}
        canShare={!!backendGameId}
        anchor="bottom"
        open={settingsDrawerOpen}
        onClose={() => setSettingsDrawerOpen(false)}
        hideButton
      />

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