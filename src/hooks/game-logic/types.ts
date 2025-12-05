import type { BoardState } from 'src/components/backgammon-board';

// ----------------------------------------------------------------------

export type Player = 'white' | 'black';

export type GamePhase = 'opening' | 'waiting' | 'rolling' | 'moving' | 'finished';

export type ValidMove = {
  from: number;
  to: number;
  die: number;
};

export type MoveHistory = {
  boardState: BoardState;
  diceValue: number;
  from: number;
  to: number;
  hitChecker?: Player;
  player: Player; // Player who made the move
};

export type GameState = {
  boardState: BoardState;
  currentPlayer: Player;
  diceValues: number[];
  selectedPoint: number | null;
  gamePhase: GamePhase;
  validMoves: ValidMove[];
  moveHistory: MoveHistory[];
  openingRoll: { white: number | null; black: number | null };
  scores: { white: number; black: number };
  setWinner: Player | null;
  shouldClearDice?: boolean; // Flag to clear dice on tie re-rolls
};
