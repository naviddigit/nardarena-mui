/**
 * ⛔⛔⛔ ABSOLUTELY LOCKED - DO NOT TOUCH! ⛔⛔⛔
 * 
 * این فایل مدیریت تایمرهای بازی را انجام میدهد.
 * بعد از تست کامل، هیچ تغییری در این فایل ندهید!
 * 
 * Timer management TESTED and WORKING!
 * - AI timer stops when AI finishes
 * - Player timer starts when player's turn begins
 * - Both timers stop on game end
 * 
 * قوانین تایمر:
 * 1. وقتی نوبت player شروع میشه → تایمر player start + تایمر opponent stop
 * 2. وقتی player روی Done میزنه → تایمر player stop + تایمر opponent start
 * 3. وقتی تایمر به 0 برسه → بازی تموم میشه و opponent برنده میشه
 * 4. وقتی بازی تموم بشه → هر دو تایمر stop میشن
 */

import { useEffect } from 'react';
import type { GameState } from 'src/hooks/game-logic/types';

interface UseGameTimersProps {
  gameState: GameState;
  playerColor: 'white' | 'black' | null;
  whiteTimer: {
    countdown: number;
    counting: boolean;
    startCountdown: () => void;
    stopCountdown: () => void;
  };
  blackTimer: {
    countdown: number;
    counting: boolean;
    startCountdown: () => void;
    stopCountdown: () => void;
  };
  winner: 'white' | 'black' | null;
  onTimeout: (winner: 'white' | 'black') => void;
  isExecutingAIMove?: boolean; // ✅ Added: disable timer control during AI execution
}

export function useGameTimers({
  gameState,
  playerColor,
  whiteTimer,
  blackTimer,
  winner,
  onTimeout,
  isExecutingAIMove = false, // ✅ Default to false
}: UseGameTimersProps) {
  
  // ✅ 1. Start/stop timers based on whose turn it is
  useEffect(() => {
    if (winner || !playerColor || isExecutingAIMove) return; // ✅ Don't control timers during AI execution

    console.log('⏱️ [useGameTimers] Checking timer state:', {
      currentPlayer: gameState.currentPlayer,
      gamePhase: gameState.gamePhase,
      whiteTimerCounting: whiteTimer.counting,
      blackTimerCounting: blackTimer.counting,
      isExecutingAIMove,
    });

    // White's turn: start white timer, stop black timer
    if (gameState.currentPlayer === 'white' && gameState.gamePhase === 'waiting') {
      if (!whiteTimer.counting) {
        console.log('⏱️ Starting white timer (white\'s turn)');
        whiteTimer.startCountdown();
      }
      if (blackTimer.counting) {
        console.log('⏱️ Stopping black timer (not black\'s turn)');
        blackTimer.stopCountdown();
      }
    }
    // Black's turn: start black timer, stop white timer
    else if (gameState.currentPlayer === 'black' && gameState.gamePhase === 'waiting') {
      if (!blackTimer.counting) {
        console.log('⏱️ Starting black timer (black\'s turn)');
        blackTimer.startCountdown();
      }
      if (whiteTimer.counting) {
        console.log('⏱️ Stopping white timer (not white\'s turn)');
        whiteTimer.stopCountdown();
      }
    }
  }, [gameState.currentPlayer, gameState.gamePhase, playerColor, winner, isExecutingAIMove]);

  // ✅ 2. Check for timeout
  useEffect(() => {
    if (winner) return;

    if (whiteTimer.countdown <= 0) {
      console.log('⏱️ White timer expired - Black wins!');
      whiteTimer.stopCountdown();
      blackTimer.stopCountdown();
      onTimeout('black');
    } else if (blackTimer.countdown <= 0) {
      console.log('⏱️ Black timer expired - White wins!');
      whiteTimer.stopCountdown();
      blackTimer.stopCountdown();
      onTimeout('white');
    }
  }, [whiteTimer.countdown, blackTimer.countdown, winner]);

  // ✅ 3. Stop all timers when game ends
  useEffect(() => {
    if (winner) {
      console.log('⏱️ Game ended - stopping all timers');
      whiteTimer.stopCountdown();
      blackTimer.stopCountdown();
    }
  }, [winner]);
}
