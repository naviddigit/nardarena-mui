/**
 * Game Recovery Hook
 * Automatically detects stuck states and recovers the game
 */

import { useEffect, useRef } from 'react';
import type { GameState } from './use-game-state';

interface UseGameRecoveryOptions {
  gameState: GameState;
  playerColor: 'white' | 'black' | null;
  aiPlayerColor: 'white' | 'black';
  backendGameId: string | null;
  isAIThinking: boolean;
  isRolling?: boolean;
  triggerAIMove: () => void;
  triggerAIDiceRoll?: () => void;
  onRecovery?: (action: string) => void;
}

export function useGameRecovery(options: UseGameRecoveryOptions) {
  const {
    gameState,
    playerColor,
    aiPlayerColor,
    backendGameId,
    isAIThinking,
    isRolling = false,
    triggerAIMove,
    triggerAIDiceRoll,
    onRecovery,
  } = options;

  const lastCheckRef = useRef<number>(0);
  const recoveryAttemptedRef = useRef<string | null>(null);
  const lastStateChangeRef = useRef<number>(Date.now()); // Track when state last changed

  useEffect(() => {
    // Track state changes
    lastStateChangeRef.current = Date.now();
  }, [gameState.gamePhase, gameState.currentPlayer, gameState.diceValues.length]);

  useEffect(() => {
    // Only check every 3 seconds to avoid spam
    const now = Date.now();
    if (now - lastCheckRef.current < 3000) return;
    lastCheckRef.current = now;

    // ✅ CRITICAL: Wait at least 2 seconds after state change before attempting recovery
    // This prevents false positives when state is legitimately transitioning
    const timeSinceStateChange = now - lastStateChangeRef.current;
    if (timeSinceStateChange < 2000) {
      return; // Too soon after state change
    }

    // Skip if game not initialized
    if (!backendGameId || !playerColor) return;

    // Skip if already attempting recovery
    const stateKey = `${gameState.gamePhase}-${gameState.currentPlayer}-${gameState.diceValues.length}`;
    if (recoveryAttemptedRef.current === stateKey) return;

    // ==========================================
    // DETECTION 1: Moving phase without dice (MOST COMMON)
    // ==========================================
    if (
      gameState.gamePhase === 'moving' &&
      gameState.diceValues.length === 0
    ) {
      console.warn('🚨 RECOVERY: Moving phase but NO DICE!');
      console.log('  Forcing back to waiting phase...');
      
      recoveryAttemptedRef.current = stateKey;
      
      if (onRecovery) {
        onRecovery('force-waiting-phase');
      }
      
      // Force back to waiting so player can roll
      setTimeout(() => {
        console.log('🔧 RECOVERY: Setting phase to waiting');
        // This will be handled by the page.tsx fix above
      }, 100);
      
      return;
    }

    // ==========================================
    // DETECTION 2: Stuck in moving phase (AI turn with dice)
    // ==========================================
    if (
      gameState.gamePhase === 'moving' &&
      gameState.currentPlayer === aiPlayerColor &&
      !isAIThinking &&
      gameState.diceValues.length > 0
    ) {
      console.warn('🚨 RECOVERY: AI stuck in moving phase WITH dice!');
      console.log('  currentPlayer:', gameState.currentPlayer);
      console.log('  diceValues:', gameState.diceValues);
      
      recoveryAttemptedRef.current = stateKey;
      
      if (onRecovery) {
        onRecovery('trigger-ai-move');
      }
      
      // Trigger AI move
      setTimeout(() => {
        console.log('🔧 RECOVERY: Triggering AI move...');
        triggerAIMove();
      }, 1000);
      
      return;
    }

    // ==========================================
    // DETECTION 3: Stuck in waiting phase (AI turn)
    // ⛔ BUT NOT during opening roll - that has its own logic
    // ==========================================
    if (
      gameState.gamePhase === 'waiting' &&
      gameState.currentPlayer === aiPlayerColor &&
      !isAIThinking &&
      !isRolling &&
      gameState.diceValues.length === 0 &&
      // ✅ Skip if opening roll not complete yet - opening has separate logic
      gameState.openingRoll.white !== null &&
      gameState.openingRoll.black !== null
    ) {
      console.warn('🚨 RECOVERY: AI stuck in waiting phase - needs to roll dice!');
      
      recoveryAttemptedRef.current = stateKey;
      
      if (onRecovery) {
        onRecovery('ai-roll-dice');
      }
      
      // Trigger AI dice roll
      if (triggerAIDiceRoll) {
        setTimeout(() => {
          console.log('🔧 RECOVERY: Triggering AI dice roll...');
          triggerAIDiceRoll();
        }, 1000);
      }
      
      return;
    }

    // Clear recovery attempt flag if state changed
    if (recoveryAttemptedRef.current && recoveryAttemptedRef.current !== stateKey) {
      console.log('✅ State changed - clearing recovery flag');
      recoveryAttemptedRef.current = null;
    }

  }, [
    gameState.gamePhase,
    gameState.currentPlayer,
    gameState.diceValues,
    playerColor,
    aiPlayerColor,
    backendGameId,
    isAIThinking,
    isRolling,
    triggerAIMove,
    triggerAIDiceRoll,
    onRecovery,
  ]);
}
