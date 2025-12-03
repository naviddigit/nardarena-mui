/**
 * ⛔ CRITICAL - DO NOT MODIFY AFTER TESTING! ⛔
 * 
 * این فایل کنترل دکمه Roll Dice را مدیریت میکند.
 * بعد از تست کامل، هیچ تغییری در این فایل ندهید!
 * 
 * قوانین Roll Dice:
 * 1. در opening phase: هر player میتونه همزمان roll کنه (اگه هنوز roll نکرده)
 * 2. در gameplay عادی: فقط وقتی نوبت player هست و در فاز waiting هست
 * 3. نمیتونه roll کنه اگه:
 *    - در حال rolling باشه (isRolling = true)
 *    - منتظر backend باشه (isWaitingForBackend = true)
 *    - AI در حال حرکت باشه (isExecutingAIMove = true)
 *    - در فاز moving باشه (باید اول Done بزنه)
 * 
 * این فایل با چوب حفاظت شده! 🔒
 */

import { useMemo } from 'react';
import type { GameState } from 'src/hooks/game-logic/types';

interface UseDiceRollControlProps {
  gameState: GameState;
  playerColor: 'white' | 'black' | null;
  isRolling: boolean;
  isWaitingForBackend: boolean;
  isExecutingAIMove: boolean;
}

interface UseDiceRollControlReturn {
  canRoll: boolean;
  canRollReason: string; // برای debug - چرا نمیتونه roll کنه
}

export function useDiceRollControl({
  gameState,
  playerColor,
  isRolling,
  isWaitingForBackend,
  isExecutingAIMove,
}: UseDiceRollControlProps): UseDiceRollControlReturn {
  
  const { canRoll, canRollReason } = useMemo(() => {
    // اگه player هنوز انتخاب نشده
    if (!playerColor) {
      return { canRoll: false, canRollReason: 'Player color not selected' };
    }

    // Opening phase: هر player میتونه بدون نوبت roll کنه (simultaneous)
    // ⚠️ Check opening BEFORE isRolling so both players can roll
    if (gameState.gamePhase === 'opening') {
      // White player can roll if hasn't rolled yet (regardless of isRolling)
      if (playerColor === 'white' && gameState.openingRoll.white === null) {
        return { canRoll: true, canRollReason: 'Opening roll for white (simultaneous)' };
      }
      // Black player (AI) can roll if hasn't rolled yet (regardless of isRolling)
      if (playerColor === 'black' && gameState.openingRoll.black === null) {
        return { canRoll: true, canRollReason: 'Opening roll for black (simultaneous)' };
      }
      // Already rolled
      return { canRoll: false, canRollReason: 'Already rolled in opening' };
    }

    // اگه در حال rolling هست (only for normal gameplay)
    if (isRolling) {
      return { canRoll: false, canRollReason: 'Already rolling' };
    }

    // اگه منتظر backend هست
    if (isWaitingForBackend) {
      return { canRoll: false, canRollReason: 'Waiting for backend' };
    }

    // اگه AI در حال حرکت هست
    if (isExecutingAIMove) {
      return { canRoll: false, canRollReason: 'AI is moving' };
    }

    // Gameplay عادی: باید نوبت player باشه و در فاز waiting باشه
    if (gameState.currentPlayer === playerColor && gameState.gamePhase === 'waiting') {
      console.log('✅ Can roll! currentPlayer:', gameState.currentPlayer, 'playerColor:', playerColor, 'phase:', gameState.gamePhase);
      return { canRoll: true, canRollReason: 'Your turn to roll' };
    }

    // اگه در فاز moving هست
    if (gameState.gamePhase === 'moving') {
      return { canRoll: false, canRollReason: 'Must finish moves or click Done' };
    }

    // اگه نوبت opponent هست
    if (gameState.currentPlayer !== playerColor) {
      console.log('🚫 Cannot roll - opponent turn. currentPlayer:', gameState.currentPlayer, 'playerColor:', playerColor, 'phase:', gameState.gamePhase);
      return { canRoll: false, canRollReason: 'Opponent turn' };
    }

    // هیچکدوم از شرایط برقرار نیست
    console.log('❓ Unknown state. currentPlayer:', gameState.currentPlayer, 'playerColor:', playerColor, 'phase:', gameState.gamePhase);
    return { canRoll: false, canRollReason: 'Unknown state' };
  }, [gameState.gamePhase, gameState.currentPlayer, gameState.openingRoll.white, playerColor, isRolling, isWaitingForBackend, isExecutingAIMove]);

  return { canRoll, canRollReason };
}
