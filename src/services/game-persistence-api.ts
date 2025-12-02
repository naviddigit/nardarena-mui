/**
 * Game Persistence API Service
 * Handles saving and retrieving game data from backend
 * 
 * ✅ Uses axios for automatic token refresh on 401 errors
 */

import axios from 'src/utils/axios';

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
  /**
   * Create a new game
   */
  async createGame(data: CreateGameDto): Promise<GameResponse> {
    const response = await axios.post(`${API_BASE_URL}/game/create`, data);
    return response.data;
  }

  /**
   * Record a move in the game
   */
  async recordMove(gameId: string, data: RecordMoveDto): Promise<GameResponse> {
    const response = await axios.post(`${API_BASE_URL}/game/${gameId}/move`, data);
    return response.data;
  }

  /**
   * End the game
   */
  async endGame(gameId: string, data: EndGameDto): Promise<GameResponse> {
    const response = await axios.post(`${API_BASE_URL}/game/${gameId}/end`, data);
    return response.data;
  }

  /**
   * Get game details
   */
  async getGame(gameId: string): Promise<GameResponse> {
    const response = await axios.get(`${API_BASE_URL}/game/${gameId}`);
    return response.data;
  }

  /**
   * Get user's game history
   */
  async getGameHistory(limit = 20, offset = 0): Promise<{
    games: GameHistoryItem[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await axios.get(
      `${API_BASE_URL}/game/history/me?limit=${limit}&offset=${offset}`
    );
    return response.data;
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
    const response = await axios.post(`${API_BASE_URL}/game/${gameId}/ai-move`);
    return response.data;
  }

  /**
   * Sync game state with backend (for dice rolls, phase changes, etc.)
   */
  async syncGameState(gameId: string, gameState: any, diceValues?: number[]): Promise<any> {
    const response = await axios.patch(`${API_BASE_URL}/game/${gameId}/sync-state`, {
      gameState,
      diceValues,
    });
    return response.data;
  }

  /**
   * Roll two dice on server (for fairness)
   */
  async rollDice(): Promise<{
    dice: [number, number];
    timestamp: string;
  }> {
    const response = await axios.post(`${API_BASE_URL}/game/dice/roll`);
    return response.data;
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
    const response = await axios.post(`${API_BASE_URL}/game/dice/opening`);
    return response.data;
  }

  /**
   * Get AI move delay settings
   */
  async getAIMoveDelays(): Promise<{ min: number; max: number }> {
    const response = await axios.get(`${API_BASE_URL}/settings/game/ai-delays`);
    return response.data;
  }

  /**
   * Get all game settings
   */
  async getAllGameSettings(): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/settings/game`);
    return response.data;
  }

  /**
   * Get game settings by category
   */
  async getGameSettingsByCategory(category: string): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/settings/game/category/${category}`);
    return response.data;
  }

  /**
   * Update single game setting (protected - requires auth)
   */
  async updateGameSetting(key: string, value: string): Promise<any> {
    const response = await axios.put(`${API_BASE_URL}/settings/game/${key}`, { value });
    return response.data;
  }

  /**
   * Bulk update game settings (protected - requires auth)
   */
  async updateGameSettingsBulk(settings: Array<{ key: string; value: string }>): Promise<any[]> {
    const response = await axios.patch(`${API_BASE_URL}/settings/game/bulk`, { settings });
    return response.data;
  }
}

// Singleton instance
export const gamePersistenceAPI = new GamePersistenceAPI();
