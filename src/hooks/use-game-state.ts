import { useState, useCallback, useMemo } from 'react';

import type { BoardState } from 'src/components/backgammon-board';

// ----------------------------------------------------------------------

type Player = 'white' | 'black';

type ValidMove = {
  from: number;
  to: number;
  die: number;
};

export type GameState = {
  boardState: BoardState;
  currentPlayer: Player;
  diceValues: number[];
  selectedPoint: number | null;
  gamePhase: 'waiting' | 'rolling' | 'moving' | 'finished';
  validMoves: ValidMove[];
};

// ----------------------------------------------------------------------

export function useGameState(initialBoardState: BoardState) {
  const [gameState, setGameState] = useState<GameState>({
    boardState: initialBoardState,
    currentPlayer: 'white',
    diceValues: [],
    selectedPoint: null,
    gamePhase: 'waiting',
    validMoves: [],
  });

  // Calculate valid moves based on current board state, player, and dice
  const calculateValidMoves = useCallback((
    boardState: BoardState,
    currentPlayer: Player,
    diceValues: number[]
  ): ValidMove[] => {
    const moves: ValidMove[] = [];
    
    // Check if there are checkers on the bar that need to enter first
    if (boardState.bar[currentPlayer] > 0) {
      diceValues.forEach((die) => {
        const enterPoint = currentPlayer === 'white' ? 24 - die : die - 1;
        if (isValidDestination(boardState, enterPoint, currentPlayer)) {
          moves.push({ from: -1, to: enterPoint, die });
        }
      });
      return moves; // Must enter from bar before other moves
    }

    // Check all points for possible moves
    for (let from = 0; from < 24; from += 1) {
      const point = boardState.points[from];
      if (point.count > 0 && point.checkers[0] === currentPlayer) {
        diceValues.forEach((die) => {
          const to = currentPlayer === 'white' ? from + die : from - die;
          if (to >= 0 && to < 24 && isValidDestination(boardState, to, currentPlayer)) {
            moves.push({ from, to, die });
          }
        });
      }
    }

    // Check for bearing off if all checkers are in home board
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
  }, []);

  // Check if destination point is valid
  const isValidDestination = (
    boardState: BoardState,
    point: number,
    currentPlayer: Player
  ): boolean => {
    if (point < 0 || point > 23) return false;
    const target = boardState.points[point];
    // Can move to: empty point, same color, or single opponent checker (hit)
    return (
      target.count === 0 ||
      target.checkers[0] === currentPlayer ||
      target.count === 1
    );
  };

  // Check if player can bear off
  const canBearOff = (boardState: BoardState, currentPlayer: Player): boolean => {
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
  };

  // Check if specific bear-off move is valid
  const isValidBearOff = (
    boardState: BoardState,
    from: number,
    die: number,
    currentPlayer: Player
  ): boolean => {
    const homeBase = currentPlayer === 'white' ? 18 : 0;
    const pointValue = currentPlayer === 'white' ? from - homeBase + 1 : from + 1;

    // Exact match
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
  };

  const handleDiceRoll = useCallback((results: { value: number }[]) => {
    console.log('handleDiceRoll called with:', results);
    setGameState((prev) => {
      const diceValues = results.map((r) => r.value);
      const validMoves = calculateValidMoves(prev.boardState, prev.currentPlayer, diceValues);
      
      console.log('Calculated valid moves:', validMoves);
      console.log('Dice values:', diceValues);
      
      return {
        ...prev,
        diceValues,
        gamePhase: 'moving',
        validMoves,
      };
    });
  }, [calculateValidMoves]);

  // Get valid destinations for selected point
  const validDestinations = useMemo(() => {
    if (gameState.selectedPoint === null) return [];
    return gameState.validMoves
      .filter((m) => m.from === gameState.selectedPoint)
      .map((m) => m.to);
  }, [gameState.selectedPoint, gameState.validMoves]);

  const handlePointClick = useCallback(
    (pointIndex: number) => {
      console.log('handlePointClick called:', { 
        pointIndex, 
        gamePhase: gameState.gamePhase,
        selectedPoint: gameState.selectedPoint,
        validMoves: gameState.validMoves 
      });
      
      if (gameState.gamePhase !== 'moving') return;

      // If no point selected, try to select this point
      if (gameState.selectedPoint === null) {
        const point = gameState.boardState.points[pointIndex];
        // Check if this point has a valid move
        const hasValidMove = gameState.validMoves.some((m) => m.from === pointIndex);
        
        if (point.checkers.length > 0 && point.checkers[0] === gameState.currentPlayer && hasValidMove) {
          setGameState((prev) => ({
            ...prev,
            selectedPoint: pointIndex,
          }));
        }
      } else {
        // Deselect if clicking same point
        if (pointIndex === gameState.selectedPoint) {
          setGameState((prev) => ({
            ...prev,
            selectedPoint: null,
          }));
          return;
        }

        // Try to move from selectedPoint to pointIndex
        const fromIndex = gameState.selectedPoint;
        const toIndex = pointIndex;

        // Find matching valid move
        const validMove = gameState.validMoves.find(
          (m) => m.from === fromIndex && m.to === toIndex
        );

        if (validMove) {
          // Execute move
          setGameState((prev) => {
            const newPoints = prev.boardState.points.map((point) => ({
              checkers: [...point.checkers],
              count: point.count,
            }));

            const fromPoint = newPoints[fromIndex];
            const toPoint = newPoints[toIndex];
            
            let newBar = { ...prev.boardState.bar };

            // Handle hitting opponent checker
            if (toPoint.count === 1 && toPoint.checkers[0] !== prev.currentPlayer) {
              const hitColor = toPoint.checkers[0];
              toPoint.checkers = [];
              toPoint.count = 0;
              newBar = { ...newBar, [hitColor]: newBar[hitColor] + 1 };
            }

            // Move checker
            const checker = fromPoint.checkers.pop();
            if (checker) {
              fromPoint.count -= 1;
              toPoint.checkers.push(checker);
              toPoint.count += 1;
            }

            // Remove used dice value
            const newDiceValues = [...prev.diceValues];
            const diceIndex = newDiceValues.indexOf(validMove.die);
            newDiceValues.splice(diceIndex, 1);

            // Create new board state
            const newBoardState = {
              points: newPoints,
              bar: newBar,
              off: { ...prev.boardState.off },
            };

            // Recalculate valid moves with remaining dice
            const newValidMoves = calculateValidMoves(
              newBoardState,
              prev.currentPlayer,
              newDiceValues
            );

            // If no more dice or no valid moves, switch player
            const shouldSwitchPlayer = newDiceValues.length === 0 || newValidMoves.length === 0;
            const newPhase = shouldSwitchPlayer ? 'waiting' : 'moving';
            const newPlayer = shouldSwitchPlayer 
              ? (prev.currentPlayer === 'white' ? 'black' : 'white') 
              : prev.currentPlayer;

            return {
              ...prev,
              boardState: newBoardState,
              diceValues: shouldSwitchPlayer ? [] : newDiceValues,
              selectedPoint: null,
              gamePhase: newPhase as any,
              currentPlayer: newPlayer as Player,
              validMoves: shouldSwitchPlayer ? [] : newValidMoves,
            };
          });
        } else {
          // Invalid move, deselect
          setGameState((prev) => ({
            ...prev,
            selectedPoint: null,
          }));
        }
      }
    },
    [gameState, calculateValidMoves]
  );

  const resetGame = useCallback(() => {
    setGameState({
      boardState: initialBoardState,
      currentPlayer: 'white',
      diceValues: [],
      selectedPoint: null,
      gamePhase: 'waiting',
      validMoves: [],
    });
  }, [initialBoardState]);

  return {
    gameState,
    handleDiceRoll,
    handlePointClick,
    resetGame,
    validDestinations,
  };
}
