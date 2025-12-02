/**
 * Game Persistence API Service
 * Handles saving and retrieving game data from backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export type GameType = 'AI' | 'ONLINE' | 'TOURNAMENT';
export type GameMode = 'CLASSIC' | 'MODERN' | 'TOURNAMENT';
export type PlayerColor = 'WHITE' | 'BLACK';
export type GameStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type EndReason = 'NORMAL_WIN' | 'RESIGNATION' | 'TIMEOUT' | 'DISCONNECTION';

export interface CreateGameDto {
  gameType: GameType;
  aiDifficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'; // AI difficulty level
  opponentId?: string; // Optional for AI games
  timeControl?: number; // seconds per player
  gameMode?: GameMode;
}

export interface RecordMoveDto {
  playerColor: PlayerColor;
  moveNumber: number;
  from: number;
  to: number;
  diceUsed: number;
  isHit?: boolean;
  boardStateBefore?: any; // Full board state for replay
  boardStateAfter?: any; // Full board state after move
  timeRemaining?: number; // milliseconds
  moveTime?: number; // milliseconds taken for this move
}

export interface EndGameDto {
  winner: PlayerColor;
  whiteSetsWon: number;
  blackSetsWon: number;
  endReason: EndReason;
  finalGameState?: any;
}

export interface GameResponse {
  id: string;
  gameType: GameType;
  status: GameStatus;
  whitePlayerId: string;
  blackPlayerId: string;
  currentPlayer: PlayerColor;
  gameState: any;
  moveHistory: any[];
  winner?: PlayerColor;
  whiteSetsWon: number;
  blackSetsWon: number;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface GameHistoryItem {
  id: string;
  gameType: GameType;
  status: GameStatus;
  whitePlayer: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  blackPlayer: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  winner?: PlayerColor;
  whiteSetsWon: number;
  blackSetsWon: number;
  createdAt: string;
  endedAt?: string;
}

// ----------------------------------------------------------------------
// API Service
// ----------------------------------------------------------------------

class GamePersistenceAPI {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try sessionStorage first (jwt_access_token)
    const sessionToken = sessionStorage.getItem('jwt_access_token');
    if (sessionToken) return sessionToken;
    
    // Fallback to localStorage (accessToken)
    const localToken = localStorage.getItem('accessToken');
    if (localToken) return localToken;
    
    return null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Create a new game
   */
  async createGame(data: CreateGameDto): Promise<GameResponse> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('No token provided');
    }

    const response = await fetch(`${API_BASE_URL}/game/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to create game');
    }

    return response.json();
  }

  /**
   * Record a move in the game
   */
  async recordMove(gameId: string, data: RecordMoveDto): Promise<GameResponse> {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/move`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to record move');
    }

    return response.json();
  }

  /**
   * End the game
   */
  async endGame(gameId: string, data: EndGameDto): Promise<GameResponse> {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/end`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to end game');
    }

    return response.json();
  }

  /**
   * Get game details
   */
  async getGame(gameId: string): Promise<GameResponse> {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to get game');
    }

    return response.json();
  }

  /**
   * Get user's game history
   */
  async getGameHistory(limit = 20, offset = 0): Promise<{
    games: GameHistoryItem[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/game/history/me?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to get game history');
    }

    return response.json();
  }

  /**
   * Trigger AI to make its move
   */
  async triggerAIMove(gameId: string): Promise<{
    moves: Array<{ from: number; to: number }>;
    diceRoll: [number, number];
    difficulty: string;
    newGameState: any;
  }> {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/ai-move`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to trigger AI move');
    }

    return response.json();
  }

  /**
   * Sync game state with backend (for dice rolls, phase changes, etc.)
   */
  async syncGameState(gameId: string, gameState: any, diceValues?: number[]): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/sync-state`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({
        gameState,
        diceValues,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to sync game state');
    }

    return response.json();
  }

  /**
   * Roll two dice on server (for fairness)
   */
  async rollDice(): Promise<{
    dice: [number, number];
    timestamp: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/game/dice/roll`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to roll dice');
    }

    return response.json();
  }

  /**
   * Roll opening dice (one per player, no ties)
   */
  async rollOpeningDice(): Promise<{
    white: number;
    black: number;
    winner: 'white' | 'black';
    timestamp: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/game/dice/opening`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to roll opening dice');
    }

    return response.json();
  }

  /**
   * Get AI move delay settings
   */
  async getAIMoveDelays(): Promise<{ min: number; max: number }> {
    const response = await fetch(`${API_BASE_URL}/settings/game/ai-delays`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI move delays');
    }

    return response.json();
  }
}

// Singleton instance
export const gamePersistenceAPI = new GamePersistenceAPI();
