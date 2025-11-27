import type { BoardState } from 'src/components/backgammon-board';

import type { Player, ValidMove, MoveHistory, GameState } from './types';
import { calculateValidMoves } from './validation';

// ----------------------------------------------------------------------

/**
 * Check if player won the set (all 15 checkers borne off)
 */
function checkSetWin(boardState: BoardState, player: Player): boolean {
  return boardState.off[player] === 15;
}

/**
 * Execute a move from bar to a point
 * Returns updated game state or null for async hit moves
 */
export function executeMoveFromBar(
  currentState: GameState,
  toIndex: number,
  validMove: ValidMove,
  setGameState: (updater: (prev: GameState) => GameState) => void
): GameState | null {
  const historyEntry: MoveHistory = {
    boardState: currentState.boardState,
    diceValue: validMove.die,
    from: -1,
    to: toIndex,
  };

  const newPoints = currentState.boardState.points.map((point) => ({
    checkers: [...point.checkers],
    count: point.count,
  }));

  let newBar = { ...currentState.boardState.bar };
  const toPoint = newPoints[toIndex];

  // Check if this is a hit move
  const isHitMove = toPoint.count === 1 && toPoint.checkers[0] !== currentState.currentPlayer;

  if (isHitMove) {
    const hitColor = toPoint.checkers[0];
    historyEntry.hitChecker = hitColor;

    // STEP 1: Hit the opponent checker first
    toPoint.checkers = [];
    toPoint.count = 0;
    newBar = { ...newBar, [hitColor]: newBar[hitColor] + 1 };

    // Create intermediate state for hit animation
    const intermediateState = {
      points: newPoints,
      bar: newBar,
      off: { ...currentState.boardState.off },
    };

    // Update with hit animation first
    setGameState(() => ({
      ...currentState,
      boardState: intermediateState,
    }));

    // STEP 2: Then move our checker from bar after animation
    setTimeout(() => {
      setGameState((current) => {
        const updatedPoints = current.boardState.points.map((point) => ({
          checkers: [...point.checkers],
          count: point.count,
        }));

        const updatedToPoint = updatedPoints[toIndex];
        let updatedBar = { ...current.boardState.bar };

        // Move from bar to point
        updatedBar = {
          ...updatedBar,
          [current.currentPlayer]: updatedBar[current.currentPlayer] - 1,
        };
        updatedToPoint.checkers.push(current.currentPlayer);
        updatedToPoint.count += 1;

        // Remove used dice
        const newDiceValues = [...current.diceValues];
        const diceIndex = newDiceValues.indexOf(validMove.die);
        newDiceValues.splice(diceIndex, 1);

        const finalBoardState = {
          points: updatedPoints,
          bar: updatedBar,
          off: { ...current.boardState.off },
        };

        const newValidMoves = calculateValidMoves(
          finalBoardState,
          current.currentPlayer,
          newDiceValues
        );

        return {
          ...current,
          boardState: finalBoardState,
          diceValues: newDiceValues,
          selectedPoint: null,
          gamePhase: 'moving' as const,
          validMoves: newValidMoves,
          moveHistory: [...current.moveHistory, historyEntry],
        };
      });
    }, 250);

    return null; // Async move, return null
  }

  // NON-HIT MOVE: Normal entry from bar
  newBar = {
    ...newBar,
    [currentState.currentPlayer]: newBar[currentState.currentPlayer] - 1,
  };
  toPoint.checkers.push(currentState.currentPlayer);
  toPoint.count += 1;

  // Remove used dice value
  const newDiceValues = [...currentState.diceValues];
  const diceIndex = newDiceValues.indexOf(validMove.die);
  newDiceValues.splice(diceIndex, 1);

  // Create new board state
  const newBoardState = {
    points: newPoints,
    bar: newBar,
    off: { ...currentState.boardState.off },
  };

  // Recalculate valid moves
  const newValidMoves = calculateValidMoves(
    newBoardState,
    currentState.currentPlayer,
    newDiceValues
  );

  return {
    ...currentState,
    boardState: newBoardState,
    diceValues: newDiceValues,
    selectedPoint: null,
    gamePhase: 'moving',
    validMoves: newValidMoves,
    moveHistory: [...currentState.moveHistory, historyEntry],
  };
}

/**
 * Execute a move from point to point
 * Returns updated game state or null for async hit moves
 */
export function executeMoveFromPoint(
  currentState: GameState,
  fromIndex: number,
  toIndex: number,
  validMove: ValidMove,
  setGameState: (updater: (prev: GameState) => GameState) => void
): GameState | null {
  // Handle bear-off move (toIndex === -2)
  if (toIndex === -2) {
    const historyEntry: MoveHistory = {
      boardState: currentState.boardState,
      diceValue: validMove.die,
      from: fromIndex,
      to: -2,
    };

    const newPoints = currentState.boardState.points.map((point) => ({
      checkers: [...point.checkers],
      count: point.count,
    }));

    const fromPoint = newPoints[fromIndex];
    
    // Remove checker from board
    const checker = fromPoint.checkers.pop();
    if (checker) {
      fromPoint.count -= 1;
    }

    // Remove used dice value
    const newDiceValues = [...currentState.diceValues];
    const diceIndex = newDiceValues.indexOf(validMove.die);
    newDiceValues.splice(diceIndex, 1);

    // Increase off count
    const newOff = {
      ...currentState.boardState.off,
      [currentState.currentPlayer]: currentState.boardState.off[currentState.currentPlayer] + 1,
    };

    // Create new board state
    const newBoardState = {
      points: newPoints,
      bar: { ...currentState.boardState.bar },
      off: newOff,
    };

    // Check if player won the set (all 15 checkers borne off)
    const playerWon = checkSetWin(newBoardState, currentState.currentPlayer);

    // If player won, set game phase to finished
    if (playerWon) {
      return {
        ...currentState,
        boardState: newBoardState,
        diceValues: [],
        selectedPoint: null,
        gamePhase: 'finished',
        validMoves: [],
        moveHistory: [...currentState.moveHistory, historyEntry],
      };
    }

    // Recalculate valid moves
    const newValidMoves = calculateValidMoves(
      newBoardState,
      currentState.currentPlayer,
      newDiceValues
    );

    return {
      ...currentState,
      boardState: newBoardState,
      diceValues: newDiceValues,
      selectedPoint: null,
      gamePhase: 'moving',
      validMoves: newValidMoves,
      moveHistory: [...currentState.moveHistory, historyEntry],
    };
  }

  const historyEntry: MoveHistory = {
    boardState: currentState.boardState,
    diceValue: validMove.die,
    from: fromIndex,
    to: toIndex,
  };

  const newPoints = currentState.boardState.points.map((point) => ({
    checkers: [...point.checkers],
    count: point.count,
  }));

  let newBar = { ...currentState.boardState.bar };
  const fromPoint = newPoints[fromIndex];
  const toPoint = newPoints[toIndex];

  // Check if this is a hit move
  const isHitMove = toPoint.count === 1 && toPoint.checkers[0] !== currentState.currentPlayer;

  if (isHitMove) {
    const hitColor = toPoint.checkers[0];
    historyEntry.hitChecker = hitColor;

    // STEP 1: Hit the opponent checker first
    toPoint.checkers = [];
    toPoint.count = 0;
    newBar = { ...newBar, [hitColor]: newBar[hitColor] + 1 };

    // Create intermediate state for hit animation
    const intermediateState = {
      points: newPoints,
      bar: newBar,
      off: { ...currentState.boardState.off },
    };

    // Update state with just the hit (triggers animation 1)
    setGameState(() => ({
      ...currentState,
      boardState: intermediateState,
    }));

    // STEP 2: After delay, move our checker (triggers animation 2)
    setTimeout(() => {
      setGameState((current) => {
        const updatedPoints = current.boardState.points.map((point) => ({
          checkers: [...point.checkers],
          count: point.count,
        }));

        const updatedFromPoint = updatedPoints[fromIndex];
        const updatedToPoint = updatedPoints[toIndex];

        // Move our checker
        const checker = updatedFromPoint.checkers.pop();
        if (checker) {
          updatedFromPoint.count -= 1;
          updatedToPoint.checkers.push(checker);
          updatedToPoint.count += 1;
        }

        // Remove used dice value
        const newDiceValues = [...current.diceValues];
        const diceIndex = newDiceValues.indexOf(validMove.die);
        newDiceValues.splice(diceIndex, 1);

        // Create final board state
        const finalBoardState = {
          points: updatedPoints,
          bar: current.boardState.bar,
          off: { ...current.boardState.off },
        };

        // Recalculate valid moves
        const newValidMoves = calculateValidMoves(
          finalBoardState,
          current.currentPlayer,
          newDiceValues
        );

        return {
          ...current,
          boardState: finalBoardState,
          diceValues: newDiceValues,
          selectedPoint: null,
          gamePhase: 'moving' as const,
          validMoves: newValidMoves,
          moveHistory: [...current.moveHistory, historyEntry],
        };
      });
    }, 250); // 250ms delay for hit animation

    return null; // Async move, return null
  }

  // NON-HIT MOVE: Normal move without hitting
  const checker = fromPoint.checkers.pop();
  if (checker) {
    fromPoint.count -= 1;
    toPoint.checkers.push(checker);
    toPoint.count += 1;
  }

  // Remove used dice value
  const newDiceValues = [...currentState.diceValues];
  const diceIndex = newDiceValues.indexOf(validMove.die);
  newDiceValues.splice(diceIndex, 1);

  // Create new board state
  const newBoardState = {
    points: newPoints,
    bar: newBar,
    off: { ...currentState.boardState.off },
  };

  // Recalculate valid moves
  const newValidMoves = calculateValidMoves(
    newBoardState,
    currentState.currentPlayer,
    newDiceValues
  );

  return {
    ...currentState,
    boardState: newBoardState,
    diceValues: newDiceValues,
    selectedPoint: null,
    gamePhase: 'moving',
    validMoves: newValidMoves,
    moveHistory: [...currentState.moveHistory, historyEntry],
  };
}

/**
 * Execute a move (handles both from-bar and from-point moves)
 */
export function executeMove(
  currentState: GameState,
  fromIndex: number,
  toIndex: number,
  validMove: ValidMove,
  setGameState: (updater: (prev: GameState) => GameState) => void
): GameState | null {
  if (fromIndex === -1) {
    return executeMoveFromBar(currentState, toIndex, validMove, setGameState);
  }
  return executeMoveFromPoint(currentState, fromIndex, toIndex, validMove, setGameState);
}
