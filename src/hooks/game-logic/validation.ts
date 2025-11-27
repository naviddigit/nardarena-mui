import type { BoardState } from 'src/components/backgammon-board';

import type { Player } from './types';

// ----------------------------------------------------------------------

/**
 * Check if destination point is valid for moving a checker
 * @returns true if the destination is empty, has same color checkers, or has a single opponent checker (hit)
 */
export function isValidDestination(
  boardState: BoardState,
  point: number,
  currentPlayer: Player
): boolean {
  if (point < 0 || point > 23) return false;
  
  const target = boardState.points[point];
  
  // Can move to:
  // 1. Empty point
  // 2. Point with same color checkers
  // 3. Point with single opponent checker (hit move)
  return (
    target.count === 0 ||
    target.checkers[0] === currentPlayer ||
    (target.count === 1 && target.checkers[0] !== currentPlayer)
  );
}

/**
 * Check if player can bear off (remove checkers from board)
 * @returns true if all checkers are in home board and none on bar
 */
export function canBearOff(boardState: BoardState, currentPlayer: Player): boolean {
  // Can't bear off if checkers on bar
  if (boardState.bar[currentPlayer] > 0) return false;

  // All checkers must be in home board
  const homeRange = currentPlayer === 'white' ? [18, 23] : [0, 5];
  
  for (let i = 0; i < 24; i += 1) {
    const point = boardState.points[i];
    if (point.count > 0 && point.checkers[0] === currentPlayer) {
      if (i < homeRange[0] || i > homeRange[1]) return false;
    }
  }
  
  return true;
}

/**
 * Check if specific bear-off move is valid
 * @returns true if the die value allows bearing off from this point
 */
export function isValidBearOff(
  boardState: BoardState,
  from: number,
  die: number,
  currentPlayer: Player
): boolean {
  const homeBase = currentPlayer === 'white' ? 18 : 0;
  const pointValue = currentPlayer === 'white' ? from - homeBase + 1 : from + 1;

  // Exact match: die value matches point value
  if (pointValue === die) return true;

  // Can bear off with higher die if no checkers on higher points
  if (die > pointValue) {
    const range = currentPlayer === 'white'
      ? Array.from({ length: 24 - from - 1 }, (_, i) => from + 1 + i)
      : Array.from({ length: from }, (_, i) => i);
    
    return range.every((p) => {
      const point = boardState.points[p];
      return point.count === 0 || point.checkers[0] !== currentPlayer;
    });
  }

  return false;
}

/**
 * Calculate all valid moves for current player and dice values
 */
export function calculateValidMoves(
  boardState: BoardState,
  currentPlayer: Player,
  diceValues: number[]
): Array<{ from: number; to: number; die: number }> {
  const moves: Array<{ from: number; to: number; die: number }> = [];
  
  // Priority 1: If checkers on bar, must enter first
  if (boardState.bar[currentPlayer] > 0) {
    diceValues.forEach((die) => {
      const enterPoint = currentPlayer === 'white' ? 24 - die : die - 1;
      if (isValidDestination(boardState, enterPoint, currentPlayer)) {
        moves.push({ from: -1, to: enterPoint, die });
      }
    });
    return moves; // Must enter from bar before any other moves
  }

  // Priority 2: Check all points for regular moves
  for (let from = 0; from < 24; from += 1) {
    const point = boardState.points[from];
    if (point.count > 0 && point.checkers[0] === currentPlayer) {
      diceValues.forEach((die) => {
        const to = currentPlayer === 'white' ? from - die : from + die;
        if (to >= 0 && to < 24 && isValidDestination(boardState, to, currentPlayer)) {
          moves.push({ from, to, die });
        }
      });
    }
  }

  // Priority 3: Check for bearing off if all checkers are in home board
  if (canBearOff(boardState, currentPlayer)) {
    diceValues.forEach((die) => {
      for (let from = 0; from < 24; from += 1) {
        const point = boardState.points[from];
        if (point.count > 0 && point.checkers[0] === currentPlayer) {
          if (isValidBearOff(boardState, from, die, currentPlayer)) {
            moves.push({ from, to: -2, die });
          }
        }
      }
    });
  }

  return moves;
}
