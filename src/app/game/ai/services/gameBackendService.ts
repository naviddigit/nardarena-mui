/**
 * ⛔ LOCKED - Game Backend Service
 * 
 * All backend API calls for game operations
 * - Record moves
 * - End turn
 * - Sync timers
 * - Complete opening roll
 * - End game
 */

import { gamePersistenceAPI } from 'src/api/game-persistence';
import type { Player, BoardState } from 'src/types/game';

type APIPlayerColor = 'WHITE' | 'BLACK';

interface RecordMoveData {
  playerColor: APIPlayerColor;
  moveNumber: number;
  from: number;
  to: number;
  diceUsed: number;
  isHit: boolean;
  boardStateAfter: {
    points: any;
    bar: any;
    off: any;
    currentPlayer: Player;
    diceValues: number[];
  };
  timeRemaining: number;
  moveTime: number;
}

interface EndTurnResponse {
  data: {
    nextPlayer: Player;
    nextRoll: any;
  };
}

interface TimerData {
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
  lastDoneBy?: string;
}

interface GameResult {
  winner: APIPlayerColor;
  whiteSetsWon: number;
  blackSetsWon: number;
  endReason: 'NORMAL_WIN' | 'TIMEOUT';
  finalGameState: BoardState;
}

class GameBackendService {
  /**
   * Record a single move to backend
   */
  async recordMove(gameId: string, moveData: RecordMoveData): Promise<void> {
    await gamePersistenceAPI.recordMove(gameId, moveData);
  }

  /**
   * Record multiple moves in batch
   */
  async recordMoves(
    gameId: string,
    moves: any[],
    gameState: any,
    moveCounter: number,
    whiteTimerSeconds: number,
    blackTimerSeconds: number,
    turnStartTime: number
  ): Promise<void> {
    for (let i = moveCounter; i < moves.length; i++) {
      const move = moves[i];
      
      const playerTimeRemaining = move.player === 'white' 
        ? whiteTimerSeconds
        : blackTimerSeconds;
      
      await this.recordMove(gameId, {
        playerColor: move.player.toUpperCase() as APIPlayerColor,
        moveNumber: i + 1,
        from: move.from,
        to: move.to,
        diceUsed: move.diceValue,
        isHit: move.hitChecker ? true : false,
        boardStateAfter: {
          points: gameState.boardState.points,
          bar: gameState.boardState.bar,
          off: gameState.boardState.off,
          currentPlayer: gameState.currentPlayer,
          diceValues: gameState.diceValues,
        },
        timeRemaining: playerTimeRemaining,
        moveTime: Date.now() - turnStartTime,
      });
    }
  }

  /**
   * End current turn and get next player's dice
   */
  async endTurn(gameId: string): Promise<EndTurnResponse> {
    const response = await gamePersistenceAPI.axios.post(`/game/${gameId}/end-turn`);
    console.log('📥 Backend endTurn response:', JSON.stringify(response.data, null, 2));
    return response;
  }

  /**
   * Get current timer values from backend
   */
  async syncTimers(gameId: string): Promise<TimerData> {
    const updatedGame = await gamePersistenceAPI.getGame(gameId);
    return {
      whiteTimeRemaining: (updatedGame as any).whiteTimeRemaining || 0,
      blackTimeRemaining: (updatedGame as any).blackTimeRemaining || 0,
      lastDoneBy: updatedGame.gameState?.lastDoneBy,
    };
  }

  /**
   * Complete opening roll and generate dice for winner
   */
  async completeOpeningRoll(gameId: string, winner: Player): Promise<{ nextRoll: any }> {
    console.log('📤 Sending opening roll to backend...');
    
    const response = await gamePersistenceAPI.axios.post(
      `/game/${gameId}/complete-opening-roll`,
      { winner }
    );
    
    console.log('✅ Opening roll completed, dice generated for winner');
    console.log('📋 Full response:', response.data);
    
    if (!response.data.nextRoll) {
      throw new Error('Backend did not generate dice for winner');
    }
    
    return response.data;
  }

  /**
   * End the game with result
   */
  async endGame(gameId: string, result: GameResult): Promise<void> {
    await gamePersistenceAPI.endGame(gameId, result);
    console.log('Game ended:', { 
      winner: result.winner, 
      reason: result.endReason, 
      scores: { white: result.whiteSetsWon, black: result.blackSetsWon }
    });
  }

  /**
   * Check if player can play
   */
  async canPlay(gameId: string): Promise<{
    canPlay: boolean;
    isYourTurn: boolean;
    canRollNewDice?: boolean;
    turnCompleted?: boolean;
    currentPlayer?: string;
    playerColor?: string;
  }> {
    const response = await gamePersistenceAPI.axios.get(`/game/${gameId}/can-play`);
    return response.data;
  }

  /**
   * Roll dice from backend
   */
  async rollDice(gameId: string): Promise<{ dice: [number, number] }> {
    return await gamePersistenceAPI.rollDice(gameId);
  }
}

export const gameBackendService = new GameBackendService();
