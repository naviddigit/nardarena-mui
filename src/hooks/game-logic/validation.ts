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

  // Standard backgammon home boards:
  // White: points 0-5 (bottom right)
  // Black: points 18-23 (top right)
  const homeRange = currentPlayer === 'white' ? [0, 5] : [18, 23];
  
  for (let i = 0; i < 24; i += 1) {
    const point = boardState.points[i];
    // CRITICAL: Check last checker (top of stack) belongs to current player
    if (point.count > 0 && point.checkers[point.checkers.length - 1] === currentPlayer) {
      if (i < homeRange[0] || i > homeRange[1]) return false;
    }
  }
  
  return true;
}

/**
 * Check if specific bear-off move is valid
 * Standard backgammon rules:
 * 1. Exact match: die matches the point's position number
 * 2. Higher die: can bear off from highest occupied point if die > highest position
 * 
 * White home: 0-5 (position: 0→1, 1→2, 2→3, 3→4, 4→5, 5→6)
 * Black home: 18-23 (position: 23→1, 22→2, 21→3, 20→4, 19→5, 18→6)
 */
export function isValidBearOff(
  boardState: BoardState,
  from: number,
  die: number,
  currentPlayer: Player
): boolean {
  let position: number;
  
  if (currentPlayer === 'white') {
    // White home: 0-5
    // Point 0 = position 1 (closest to off)
    // Point 5 = position 6 (farthest from off)
    position = from + 1;
  } else {
    // Black home: 18-23
    // Point 23 = position 1 (closest to off)
    // Point 18 = position 6 (farthest from off)
    position = 24 - from;
  }
  
  // Exact match: die equals position
  if (position === die) {
    return true;
  }
  
  // Higher die: can bear off if die > position AND this is the highest occupied point
  if (die > position) {
    if (currentPlayer === 'white') {
      // Check points from+1 to 5 for higher positions (farther from off)
      for (let p = from + 1; p <= 5; p += 1) {
        const point = boardState.points[p];
        if (point.count > 0 && point.checkers[point.checkers.length - 1] === currentPlayer) {
          return false;
        }
      }
    } else {
      // Check points 18 to from-1 for higher positions (farther from off)
      for (let p = 18; p < from; p += 1) {
        const point = boardState.points[p];
        if (point.count > 0 && point.checkers[point.checkers.length - 1] === currentPlayer) {
          return false;
        }
      }
    }
    
    return true;
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
    // CRITICAL: Check last checker (top of stack) belongs to current player
    if (point.count > 0 && point.checkers[point.checkers.length - 1] === currentPlayer) {
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
    const homeStart = currentPlayer === 'white' ? 0 : 18;
    const homeEnd = currentPlayer === 'white' ? 5 : 23;
    
    diceValues.forEach((die) => {
      for (let from = homeStart; from <= homeEnd; from += 1) {
        const point = boardState.points[from];
        // CRITICAL: Check last checker (top of stack) belongs to current player
        if (point.count > 0 && point.checkers[point.checkers.length - 1] === currentPlayer) {
          if (isValidBearOff(boardState, from, die, currentPlayer)) {
            moves.push({ from, to: -2, die });
          }
        }
      }
    });
  }

  return moves;
}
