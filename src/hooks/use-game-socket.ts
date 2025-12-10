import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * 🎮 useGameSocket Hook - Real-time WebSocket connection for game updates
 * 
 * ✅ FIXED: Reconnect loop issue - callbacks now use refs
 * 
 * Features:
 * - Auto-connect/disconnect
 * - Auto-reconnect on network issues
 * - Room management (join/leave game)
 * - Event listeners for game updates
 * - Fallback to polling if WebSocket fails
 * 
 * Mobile Optimizations:
 * - Battery-friendly (only active during game)
 * - Reconnection logic for network switches (WiFi ↔ 4G)
 * - Bandwidth-efficient (events only, no polling)
 * 
 * @param gameId - The game ID to connect to
 * @param userId - The user ID for tracking
 * @param enabled - Whether to enable socket connection (default: true)
 */

interface UseGameSocketOptions {
  gameId: string | null;
  userId: string | null;
  enabled?: boolean;
  onGameStateUpdate?: (data: any) => void;
  onOpponentMove?: (data: any) => void;
  onTimerUpdate?: (data: { timers: { white: number; black: number } }) => void;
  onGameEnd?: (data: any) => void;
  onPlayerDisconnect?: (data: { playerId: string }) => void;
}

interface UseGameSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isReconnecting: boolean;
  error: Error | null;
  emitMove: (moveData: any) => void;
  emitTimerUpdate: (timers: { white: number; black: number }) => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3002';
const SOCKET_NAMESPACE = '/game';

export function useGameSocket(options: UseGameSocketOptions): UseGameSocketReturn {
  const {
    gameId,
    userId,
    enabled = true,
    onGameStateUpdate,
    onOpponentMove,
    onTimerUpdate,
    onGameEnd,
    onPlayerDisconnect,
  } = options;

  // ✅ FIX: Use refs for callbacks to prevent useEffect re-triggering
  const callbacksRef = useRef({
    onGameStateUpdate,
    onOpponentMove,
    onTimerUpdate,
    onGameEnd,
    onPlayerDisconnect,
  });

  // Update refs when callbacks change (without triggering useEffect)
  useEffect(() => {
    callbacksRef.current = {
      onGameStateUpdate,
      onOpponentMove,
      onTimerUpdate,
      onGameEnd,
      onPlayerDisconnect,
    };
  }, [onGameStateUpdate, onOpponentMove, onTimerUpdate, onGameEnd, onPlayerDisconnect]);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true); // Track if component is mounted

  // ✅ FIX: Initialize socket connection - ONLY depends on gameId, userId, enabled
  useEffect(() => {
    mountedRef.current = true;
    
    if (!enabled || !gameId || !userId) {
      return undefined;
    }

    console.log(`🔌 [Socket] Connecting to ${SOCKET_URL}${SOCKET_NAMESPACE} for game ${gameId}`);

    // Create socket instance
    const newSocket = io(`${SOCKET_URL}${SOCKET_NAMESPACE}`, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log(`✅ [Socket] Connected: ${newSocket.id}`);
      if (mountedRef.current) {
        setIsConnected(true);
        setIsReconnecting(false);
        setError(null);
      }

      // Join game room
      newSocket.emit('joinGame', { gameId, userId });
    });

    newSocket.on('joinedGame', (data: { gameId: string; success: boolean }) => {
      console.log(`🎮 [Socket] Joined game room: ${data.gameId}`);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn(`🔌 [Socket] Disconnected: ${reason}`);
      if (mountedRef.current) {
        setIsConnected(false);
      }

      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect manually
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ [Socket] Connection error:', err.message);
      if (mountedRef.current) {
        setError(err);
      }
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 [Socket] Reconnection attempt ${attemptNumber}`);
      if (mountedRef.current) {
        setIsReconnecting(true);
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`✅ [Socket] Reconnected after ${attemptNumber} attempts`);
      if (mountedRef.current) {
        setIsReconnecting(false);
      }
      
      // Re-join game room after reconnection
      newSocket.emit('joinGame', { gameId, userId });
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ [Socket] Reconnection failed');
      if (mountedRef.current) {
        setError(new Error('Failed to reconnect to game server'));
        setIsReconnecting(false);
      }
    });

    // ✅ FIX: Use refs for event handlers (prevents re-subscription on callback change)
    const handleGameStateUpdate = (data: any) => {
      if (callbacksRef.current.onGameStateUpdate) {
        callbacksRef.current.onGameStateUpdate(data);
      }
    };

    const handleOpponentMove = (data: any) => {
      if (callbacksRef.current.onOpponentMove) {
        callbacksRef.current.onOpponentMove(data);
      }
    };

    const handleTimerUpdate = (data: { timers: { white: number; black: number } }) => {
      if (callbacksRef.current.onTimerUpdate) {
        callbacksRef.current.onTimerUpdate(data);
      }
    };

    const handleGameEnd = (data: any) => {
      if (callbacksRef.current.onGameEnd) {
        callbacksRef.current.onGameEnd(data);
      }
    };

    const handlePlayerDisconnect = (data: { playerId: string }) => {
      if (callbacksRef.current.onPlayerDisconnect) {
        callbacksRef.current.onPlayerDisconnect(data);
      }
    };

    // Register event handlers
    newSocket.on('gameStateUpdate', handleGameStateUpdate);
    newSocket.on('opponentMove', handleOpponentMove);
    newSocket.on('timerUpdate', handleTimerUpdate);
    newSocket.on('gameEnd', handleGameEnd);
    newSocket.on('playerDisconnect', handlePlayerDisconnect);

    // Cleanup on unmount
    return () => {
      console.log(`🔌 [Socket] Cleaning up connection for game ${gameId}`);
      mountedRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (socketRef.current) {
        socketRef.current.emit('leaveGame', { gameId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      setSocket(null);
      setIsConnected(false);
    };
  }, [enabled, gameId, userId]); // ✅ FIX: Only these 3 dependencies!

  // Emit move event
  const emitMove = useCallback((moveData: any) => {
    if (socket && isConnected) {
      socket.emit('playerMove', { gameId, move: moveData });
      console.log(`📤 [Socket] Emitted move for game ${gameId}`, moveData);
    } else {
      console.warn('⚠️ [Socket] Cannot emit move: not connected');
    }
  }, [socket, isConnected, gameId]);

  // Emit timer update (for local timer sync)
  const emitTimerUpdate = useCallback((timers: { white: number; black: number }) => {
    if (socket && isConnected) {
      socket.emit('timerUpdate', { gameId, timers });
      // Don't log timer updates (too frequent)
    }
  }, [socket, isConnected, gameId]);

  return {
    socket,
    isConnected,
    isReconnecting,
    error,
    emitMove,
    emitTimerUpdate,
  };
}
