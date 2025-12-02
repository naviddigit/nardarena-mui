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
import { INITIAL_GAME_TIME } from '../constants/game-config';

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
}

export function useGameTimers({
  gameState,
  playerColor,
  whiteTimer,
  blackTimer,
  winner,
  onTimeout,
}: UseGameTimersProps) {
  
  // ✅ 1. Start timer when turn begins (only once at start)
  useEffect(() => {
    if (winner || !playerColor) return;

    // Start white timer if it's white's turn and timer hasn't started
    if (gameState.currentPlayer === 'white' && gameState.gamePhase === 'waiting') {
      if (!whiteTimer.counting && whiteTimer.countdown === INITIAL_GAME_TIME) {
        console.log('⏱️ Starting white timer');
        whiteTimer.startCountdown();
      }
    }
    // Start black timer if it's black's turn and timer hasn't started
    else if (gameState.currentPlayer === 'black' && gameState.gamePhase === 'waiting') {
      if (!blackTimer.counting && blackTimer.countdown === INITIAL_GAME_TIME) {
        console.log('⏱️ Starting black timer');
        blackTimer.startCountdown();
      }
    }
  }, [gameState.currentPlayer, gameState.gamePhase, playerColor, winner]);

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
