// ----------------------------------------------------------------------
// Game API Types - Server-Authoritative Architecture
// ----------------------------------------------------------------------

export type PlayerId = string;
export type GameId = string;
export type MoveId = string;

/**
 * Player information
 */
export interface Player {
  id: PlayerId;
  name: string;
  avatarUrl?: string;
  country?: string;
  rating?: number;
  isSpectator?: boolean;
}

/**
 * Game state from server (Single Source of Truth)
 */
export interface ServerGameState {
  gameId: GameId;
  status: 'waiting' | 'opening' | 'playing' | 'paused' | 'finished';
  
  // Players
  players: {
    white: Player;
    black: Player;
  };
  
  // Current turn
  currentPlayer: 'white' | 'black';
  turnNumber: number;
  
  // Board state (24 points + bar + off)
  board: {
    points: Array<{
      index: number;
      checkers: Array<'white' | 'black'>;
      count: number;
    }>;
    bar: {
      white: number;
      black: number;
    };
    off: {
      white: number;
      black: number;
    };
  };
  
  // Dice (Pre-rolled by server)
  dice: {
    values: number[];
    usedValues: number[];
    remainingValues: number[];
  };
  
  // Valid moves (Calculated by server)
  validMoves: Array<{
    from: number; // -1 for bar, -2 for bear-off
    to: number;
    die: number;
    isHit?: boolean;
  }>;
  
  // Move history
  moveHistory: Array<{
    moveId: MoveId;
    player: 'white' | 'black';
    from: number;
    to: number;
    die: number;
    timestamp: number;
    wasHit?: boolean;
  }>;
  
  // Score
  scores: {
    white: number;
    black: number;
  };
  currentSet: number;
  maxSets: number;
  
  // Timing
  timers: {
    white: {
      total: number; // milliseconds
      perMove: number;
    };
    black: {
      total: number;
      perMove: number;
    };
  };
  
  // Spectators
  spectatorCount: number;
  spectators?: Player[];
  
  // Last update
  lastUpdate: number; // timestamp
  version: number; // for optimistic updates
}

/**
 * Player action request (sent to server)
 */
export type PlayerAction =
  | {
      type: 'REQUEST_ROLL';
      playerId: PlayerId;
    }
  | {
      type: 'REQUEST_MOVE';
      playerId: PlayerId;
      from: number;
      to: number;
      die: number;
    }
  | {
      type: 'REQUEST_UNDO';
      playerId: PlayerId;
    }
  | {
      type: 'END_TURN';
      playerId: PlayerId;
    };

/**
 * Server response to action
 */
export type ServerResponse =
  | {
      success: true;
      gameState: ServerGameState;
      message?: string;
    }
  | {
      success: false;
      error: string;
      code: 'INVALID_MOVE' | 'NOT_YOUR_TURN' | 'GAME_FINISHED' | 'TIMEOUT' | 'CHEAT_DETECTED';
    };

/**
 * WebSocket events
 */
export type WebSocketEvent =
  | {
      type: 'GAME_STATE_UPDATE';
      gameState: ServerGameState;
    }
  | {
      type: 'PLAYER_JOINED';
      player: Player;
    }
  | {
      type: 'PLAYER_LEFT';
      playerId: PlayerId;
    }
  | {
      type: 'SPECTATOR_JOINED';
      spectator: Player;
    }
  | {
      type: 'SPECTATOR_LEFT';
      spectatorId: PlayerId;
    }
  | {
      type: 'DICE_ROLLED';
      player: 'white' | 'black';
      values: number[];
    }
  | {
      type: 'MOVE_MADE';
      moveId: MoveId;
      player: 'white' | 'black';
      from: number;
      to: number;
      die: number;
      wasHit?: boolean;
    }
  | {
      type: 'TURN_ENDED';
      player: 'white' | 'black';
      nextPlayer: 'white' | 'black';
    }
  | {
      type: 'GAME_FINISHED';
      winner: 'white' | 'black';
      reason: 'normal' | 'timeout' | 'forfeit';
      finalScore: {
        white: number;
        black: number;
      };
    }
  | {
      type: 'ERROR';
      error: string;
      code: string;
    };

/**
 * API endpoints
 */
export interface GameAPI {
  // Get current game state
  getGameState: (gameId: GameId) => Promise<ServerGameState>;
  
  // Send action
  sendAction: (gameId: GameId, action: PlayerAction) => Promise<ServerResponse>;
  
  // Join as player
  joinGame: (gameId: GameId, playerId: PlayerId) => Promise<ServerResponse>;
  
  // Join as spectator
  spectateGame: (gameId: GameId, spectatorId: PlayerId) => Promise<ServerResponse>;
  
  // Leave game
  leaveGame: (gameId: GameId, playerId: PlayerId) => Promise<void>;
}

/**
 * WebSocket connection
 */
export interface GameWebSocket {
  connect: (gameId: GameId, playerId: PlayerId, isSpectator?: boolean) => Promise<void>;
  disconnect: () => void;
  on: (event: WebSocketEvent['type'], handler: (data: any) => void) => void;
  off: (event: WebSocketEvent['type'], handler: (data: any) => void) => void;
}
