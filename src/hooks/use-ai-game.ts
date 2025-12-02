/**
 * Hook for managing AI games with automatic AI moves
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { gamePersistenceAPI } from 'src/services/game-persistence-api';
import type { GameResponse } from 'src/services/game-persistence-api';

interface UseAIGameOptions {
  gameId?: string | null;
  aiDifficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  onAIMove?: (moves: Array<{ from: number; to: number }>, dice: [number, number]) => void;
  onGameUpdate?: (game: GameResponse) => void;
}

export function useAIGame(options: UseAIGameOptions = {}) {
  const { gameId, aiDifficulty = 'MEDIUM', onAIMove, onGameUpdate } = options;
  
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastGameStateRef = useRef<any>(null);

  /**
   * Start polling for AI moves
   */
  const startPolling = useCallback((currentGameId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const game = await gamePersistenceAPI.getGame(currentGameId);
        
        // Check if game state changed (AI made a move)
        if (JSON.stringify(game.gameState) !== JSON.stringify(lastGameStateRef.current)) {
          lastGameStateRef.current = game.gameState;
          
          if (onGameUpdate) {
            onGameUpdate(game);
          }

          // If it's now player's turn (white), AI just moved
          if (game.gameState?.currentPlayer === 'white') {
            setIsAIThinking(false);
          }
        }
      } catch (error: any) {
        // Only log critical errors, skip auth errors (401 will be handled by interceptor)
        if (error?.response?.status !== 401 && error?.message !== 'Invalid or expired token') {
          console.error('Error polling game state:', error);
        }
        // Don't stop polling - interceptor will handle 401 and retry
      }
    }, 1000); // Poll every 1 second
  }, [onGameUpdate]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  /**
   * Create a new AI game
   */
  const createAIGame = useCallback(async () => {
    try {
      const game = await gamePersistenceAPI.createGame({
        gameType: 'AI',
        aiDifficulty,
        gameMode: 'CLASSIC',
        timeControl: 1800, // 30 minutes
      });

      console.log('✅ AI Game created:', game.id, 'Difficulty:', aiDifficulty);
      lastGameStateRef.current = game.gameState;
      
      return game;
    } catch (error) {
      console.error('❌ Failed to create AI game:', error);
      setAiError('Failed to create game');
      throw error;
    }
  }, [aiDifficulty]);

  /**
   * Manually trigger AI move (if needed)
   */
  const triggerAIMove = useCallback(async (currentGameId: string) => {
    if (!currentGameId) {
      console.warn('No game ID provided');
      return;
    }

    setIsAIThinking(true);
    setAiError(null);

    try {
      console.log('🤖 Triggering AI move for game:', currentGameId);
      const result = await gamePersistenceAPI.triggerAIMove(currentGameId);
      
      console.log('✅ AI moved:', result.moves, 'Dice:', result.diceRoll);
      
      if (onAIMove) {
        onAIMove(result.moves, result.diceRoll);
      }

      setIsAIThinking(false);
      return result;
    } catch (error: any) {
      console.error('❌ AI move failed:', error);
      setAiError(error.message || 'AI move failed');
      setIsAIThinking(false);
      throw error;
    }
  }, [onAIMove]);

  /**
   * Check if it's AI's turn and trigger move
   */
  const checkAndTriggerAI = useCallback(async (currentGameId: string) => {
    try {
      const game = await gamePersistenceAPI.getGame(currentGameId);
      
      // If it's AI's turn (black player)
      if (game.gameState?.currentPlayer === 'black') {
        console.log('🎯 It\'s AI\'s turn, waiting for automatic move...');
        setIsAIThinking(true);
        
        // AI will move automatically via backend
        // Start polling to detect when move is complete
        startPolling(currentGameId);
      }
    } catch (error) {
      console.error('Error checking AI turn:', error);
    }
  }, [startPolling]);

  /**
   * Start watching game for AI moves
   */
  useEffect(() => {
    if (gameId) {
      startPolling(gameId);
    }

    return () => {
      stopPolling();
    };
  }, [gameId, startPolling, stopPolling]);

  return {
    isAIThinking,
    aiError,
    createAIGame,
    triggerAIMove,
    checkAndTriggerAI,
    startPolling,
    stopPolling,
  };
}
