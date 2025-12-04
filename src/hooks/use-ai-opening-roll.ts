import { useEffect, useRef } from 'react';
import type { GameState } from './use-game-state';

interface UseAIOpeningRollProps {
  gameState: GameState;
  isAIGame: boolean;
  aiPlayerColor: 'white' | 'black';
  diceRollerReady: boolean;
  onRollNeeded: () => void;
}

/**
 * Hook to manage AI auto-roll in opening phase
 * This is completely decoupled from UI and player-specific logic
 */
export function useAIOpeningRoll({
  gameState,
  isAIGame,
  aiPlayerColor,
  diceRollerReady,
  onRollNeeded,
}: UseAIOpeningRollProps) {
  const hasRolledRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset when phase changes
    if (gameState.gamePhase !== 'opening') {
      hasRolledRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }
    
    // ✅ CRITICAL: Reset hasRolled when both rolls are null (tie happened)
    if (gameState.openingRoll.white === null && gameState.openingRoll.black === null) {
      hasRolledRef.current = false;
    }

    // Skip if not AI game
    if (!isAIGame) {
      return;
    }

    // Skip if dice roller not ready
    if (!diceRollerReady) {
      return;
    }

    // Skip if AI already rolled
    if (gameState.openingRoll[aiPlayerColor] !== null) {
      return;
    }

    // ✅ AI should roll AFTER human player has rolled
    // Check if human player has rolled
    const humanColor = aiPlayerColor === 'white' ? 'black' : 'white';
    if (gameState.openingRoll[humanColor] === null) {
      // Human hasn't rolled yet - wait
      return;
    }

    // Skip if already triggered roll
    if (hasRolledRef.current) {
      return;
    }

    // Skip if player has selected a checker (they're interacting)
    if (gameState.selectedPoint !== null) {
      return;
    }

    // All conditions met - trigger AI roll
    timeoutRef.current = setTimeout(() => {
      // Double-check conditions before executing
      if (
        gameState.gamePhase === 'opening' &&
        gameState.openingRoll[aiPlayerColor] === null &&
        gameState.selectedPoint === null
      ) {
        hasRolledRef.current = true; // Mark as rolled ONLY when actually rolling
        onRollNeeded();
      }
    }, 1500); // 1.5 seconds to give player time

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [
    gameState.gamePhase,
    gameState.openingRoll, // Watch entire openingRoll object
    gameState.selectedPoint,
    isAIGame,
    aiPlayerColor,
    diceRollerReady,
    onRollNeeded,
  ]);
}
