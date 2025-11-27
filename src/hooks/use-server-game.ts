import { useState, useEffect, useCallback, useRef } from 'react';

import type {
  GameId,
  PlayerId,
  ServerGameState,
  WebSocketEvent,
} from 'src/types/game-api';
import { gameAPI } from 'src/services/game-api';
import { gameWebSocket } from 'src/services/game-websocket';

// ----------------------------------------------------------------------

interface UseServerGameOptions {
  gameId: GameId;
  playerId: PlayerId;
  isSpectator?: boolean;
  onError?: (error: string) => void;
  onGameFinished?: (winner: 'white' | 'black') => void;
}

/**
 * Hook for server-authoritative game
 * - Syncs with backend via WebSocket
 * - All actions go through server validation
 * - Supports real-time spectating
 */
export function useServerGame({
  gameId,
  playerId,
  isSpectator = false,
  onError,
  onGameFinished,
}: UseServerGameOptions) {
  const [gameState, setGameState] = useState<ServerGameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if component is mounted
  const isMountedRef = useRef(true);

  /**
   * Load initial game state
   */
  const loadGameState = useCallback(async () => {
    try {
      setIsLoading(true);
      const state = await gameAPI.getGameState(gameId);
      
      if (isMountedRef.current) {
        setGameState(state);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load game';
      if (isMountedRef.current) {
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [gameId, onError]);

  /**
   * Request to roll dice
   */
  const rollDice = useCallback(async () => {
    if (!gameState || isSpectator) return;

    try {
      const response = await gameAPI.requestRoll(gameId, playerId);
      
      if (!response.success) {
        setError(response.error);
        onError?.(response.error);
      }
      // State update will come via WebSocket
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to roll dice';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [gameId, playerId, gameState, isSpectator, onError]);

  /**
   * Request to make a move
   */
  const makeMove = useCallback(
    async (from: number, to: number, die: number) => {
      if (!gameState || isSpectator) return;

      try {
        const response = await gameAPI.requestMove(gameId, playerId, from, to, die);
        
        if (!response.success) {
          setError(response.error);
          onError?.(response.error);
          
          // Handle cheat detection
          if (response.code === 'CHEAT_DETECTED') {
            console.error('🚨 CHEAT DETECTED - Action rejected by server');
          }
        }
        // State update will come via WebSocket
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to make move';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    },
    [gameId, playerId, gameState, isSpectator, onError]
  );

  /**
   * Request to undo move
   */
  const undoMove = useCallback(async () => {
    if (!gameState || isSpectator) return;

    try {
      const response = await gameAPI.requestUndo(gameId, playerId);
      
      if (!response.success) {
        setError(response.error);
        onError?.(response.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to undo';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [gameId, playerId, gameState, isSpectator, onError]);

  /**
   * End turn
   */
  const endTurn = useCallback(async () => {
    if (!gameState || isSpectator) return;

    try {
      const response = await gameAPI.endTurn(gameId, playerId);
      
      if (!response.success) {
        setError(response.error);
        onError?.(response.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end turn';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [gameId, playerId, gameState, isSpectator, onError]);

  /**
   * Handle WebSocket events
   */
  useEffect(() => {
    const handleGameStateUpdate = (event: WebSocketEvent) => {
      if (event.type === 'GAME_STATE_UPDATE' && isMountedRef.current) {
        setGameState(event.gameState);
      }
    };

    const handleGameFinished = (event: WebSocketEvent) => {
      if (event.type === 'GAME_FINISHED' && isMountedRef.current) {
        onGameFinished?.(event.winner);
      }
    };

    const handleError = (event: WebSocketEvent) => {
      if (event.type === 'ERROR' && isMountedRef.current) {
        setError(event.error);
        onError?.(event.error);
      }
    };

    gameWebSocket.on('GAME_STATE_UPDATE', handleGameStateUpdate);
    gameWebSocket.on('GAME_FINISHED', handleGameFinished);
    gameWebSocket.on('ERROR', handleError);

    return () => {
      gameWebSocket.off('GAME_STATE_UPDATE', handleGameStateUpdate);
      gameWebSocket.off('GAME_FINISHED', handleGameFinished);
      gameWebSocket.off('ERROR', handleError);
    };
  }, [onGameFinished, onError]);

  /**
   * Connect to game
   */
  useEffect(() => {
    let mounted = true;

    const connectToGame = async () => {
      try {
        // Load initial state
        await loadGameState();

        // Connect WebSocket
        if (mounted) {
          await gameWebSocket.connect(gameId, playerId, isSpectator);
          setIsConnected(true);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Connection failed';
        if (mounted) {
          setError(errorMessage);
          onError?.(errorMessage);
        }
      }
    };

    connectToGame();

    return () => {
      mounted = false;
      isMountedRef.current = false;
      gameWebSocket.disconnect();
    };
  }, [gameId, playerId, isSpectator, loadGameState, onError]);

  return {
    // State
    gameState,
    isConnected,
    isLoading,
    error,
    
    // Actions (only for players, not spectators)
    rollDice,
    makeMove,
    undoMove,
    endTurn,
    
    // Utility
    reload: loadGameState,
    isSpectator,
  };
}
