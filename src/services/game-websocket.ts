import type {
  GameId,
  PlayerId,
  ServerGameState,
  WebSocketEvent,
} from 'src/types/game-api';

// ----------------------------------------------------------------------

type EventHandler = (data: any) => void;

/**
 * WebSocket service for real-time game updates
 * Handles connection, reconnection, and event broadcasting
 */
export class GameWebSocketService {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // ms
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private gameId: GameId | null = null;
  private playerId: PlayerId | null = null;
  private isSpectator = false;

  /**
   * Connect to game WebSocket
   */
  async connect(gameId: GameId, playerId: PlayerId, isSpectator = false): Promise<void> {
    this.gameId = gameId;
    this.playerId = playerId;
    this.isSpectator = isSpectator;

    const wsUrl = this.getWebSocketUrl(gameId, playerId, isSpectator);
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected:', gameId);
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data: WebSocketEvent = JSON.parse(event.data);
            this.handleEvent(data);
          } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          this.stopHeartbeat();
          this.attemptReconnect();
        };
      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.gameId = null;
    this.playerId = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Subscribe to event
   */
  on(event: WebSocketEvent['type'], handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Unsubscribe from event
   */
  off(event: WebSocketEvent['type'], handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Send message to server
   */
  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send:', data);
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Private methods

  private getWebSocketUrl(gameId: GameId, playerId: PlayerId, isSpectator: boolean): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
    const role = isSpectator ? 'spectator' : 'player';
    return `${protocol}//${host}/api/game/${gameId}/ws?playerId=${playerId}&role=${role}`;
  }

  private handleEvent(event: WebSocketEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`❌ Error in event handler for ${event.type}:`, error);
        }
      });
    }

    // Also emit to wildcard listeners
    const wildcardHandlers = this.eventHandlers.get('*' as any);
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error('❌ Error in wildcard event handler:', error);
        }
      });
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached');
      this.handleEvent({
        type: 'ERROR',
        error: 'Connection lost',
        code: 'MAX_RECONNECT_ATTEMPTS',
      });
      return;
    }

    this.reconnectAttempts += 1;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
    
    setTimeout(() => {
      if (this.gameId && this.playerId) {
        this.connect(this.gameId, this.playerId, this.isSpectator).catch((error) => {
          console.error('❌ Reconnection failed:', error);
        });
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'PING' });
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Singleton instance
export const gameWebSocket = new GameWebSocketService();
