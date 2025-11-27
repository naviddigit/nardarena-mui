import type {
  GameId,
  PlayerId,
  ServerGameState,
  PlayerAction,
  ServerResponse,
} from 'src/types/game-api';

// ----------------------------------------------------------------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Game API service - REST endpoints
 * All game logic is validated on server
 */
class GameAPIService {
  /**
   * Get current game state from server
   */
  async getGameState(gameId: GameId): Promise<ServerGameState> {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/state`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to get game state: ${response.statusText}`);
    }

    const data = await response.json();
    return data.gameState;
  }

  /**
   * Send player action to server
   * Server validates and returns new state
   */
  async sendAction(
    gameId: GameId,
    action: PlayerAction
  ): Promise<ServerResponse> {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(action),
    });

    if (!response.ok) {
      throw new Error(`Failed to send action: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Request to roll dice
   * Server generates random dice values (anti-cheat)
   */
  async requestRoll(gameId: GameId, playerId: PlayerId): Promise<ServerResponse> {
    return this.sendAction(gameId, {
      type: 'REQUEST_ROLL',
      playerId,
    });
  }

  /**
   * Request to make a move
   * Server validates if move is legal
   */
  async requestMove(
    gameId: GameId,
    playerId: PlayerId,
    from: number,
    to: number,
    die: number
  ): Promise<ServerResponse> {
    return this.sendAction(gameId, {
      type: 'REQUEST_MOVE',
      playerId,
      from,
      to,
      die,
    });
  }

  /**
   * Request to undo last move
   */
  async requestUndo(gameId: GameId, playerId: PlayerId): Promise<ServerResponse> {
    return this.sendAction(gameId, {
      type: 'REQUEST_UNDO',
      playerId,
    });
  }

  /**
   * End current turn
   */
  async endTurn(gameId: GameId, playerId: PlayerId): Promise<ServerResponse> {
    return this.sendAction(gameId, {
      type: 'END_TURN',
      playerId,
    });
  }

  /**
   * Join game as player
   */
  async joinGame(gameId: GameId, playerId: PlayerId): Promise<ServerResponse> {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ playerId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to join game: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Join game as spectator
   */
  async spectateGame(gameId: GameId, spectatorId: PlayerId): Promise<ServerResponse> {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/spectate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ spectatorId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to spectate game: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Leave game
   */
  async leaveGame(gameId: GameId, playerId: PlayerId): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ playerId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to leave game: ${response.statusText}`);
    }
  }

  /**
   * Create new game
   */
  async createGame(config: {
    maxSets: number;
    timePerPlayer: number; // seconds
    timePerMove: number; // seconds
  }): Promise<{ gameId: GameId }> {
    const response = await fetch(`${API_BASE_URL}/game/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Failed to create game: ${response.statusText}`);
    }

    return response.json();
  }
}

// Singleton instance
export const gameAPI = new GameAPIService();
