import { useState, useCallback } from 'react';

import type { BoardState } from 'src/components/backgammon-board';

// ----------------------------------------------------------------------

type Player = 'white' | 'black';

export type GameState = {
  boardState: BoardState;
  currentPlayer: Player;
  diceValues: number[];
  selectedPoint: number | null;
  gamePhase: 'waiting' | 'rolling' | 'moving' | 'finished';
};

// ----------------------------------------------------------------------

export function useGameState(initialBoardState: BoardState) {
  const [gameState, setGameState] = useState<GameState>({
    boardState: initialBoardState,
    currentPlayer: 'white',
    diceValues: [],
    selectedPoint: null,
    gamePhase: 'waiting',
  });

  const handleDiceRoll = useCallback((results: { value: number }[]) => {
    setGameState((prev) => ({
      ...prev,
      diceValues: results.map((r) => r.value),
      gamePhase: 'moving',
    }));
  }, []);

  const handlePointClick = useCallback(
    (pointIndex: number) => {
      if (gameState.gamePhase !== 'moving') return;

      // Simple move logic: if no point selected, select this one
      if (gameState.selectedPoint === null) {
        const point = gameState.boardState.points[pointIndex];
        // Check if this point belongs to current player
        if (point.checkers.length > 0 && point.checkers[0] === gameState.currentPlayer) {
          setGameState((prev) => ({
            ...prev,
            selectedPoint: pointIndex,
          }));
        }
      } else {
        // Try to move from selectedPoint to pointIndex
        const fromIndex = gameState.selectedPoint;
        const toIndex = pointIndex;

        // Simple validation: just check if we have a dice value that matches the distance
        const distance = Math.abs(toIndex - fromIndex);
        const diceIndex = gameState.diceValues.indexOf(distance);

        if (diceIndex !== -1) {
          // Valid move! Update board state
          setGameState((prev) => {
            const newPoints = [...prev.boardState.points];
            const fromPoint = newPoints[fromIndex];
            const toPoint = newPoints[toIndex];

            // Remove checker from source
            const checker = fromPoint.checkers.pop();
            if (checker) {
              fromPoint.count -= 1;

              // Add checker to destination
              toPoint.checkers.push(checker);
              toPoint.count += 1;
            }

            // Remove used dice value
            const newDiceValues = [...prev.diceValues];
            newDiceValues.splice(diceIndex, 1);

            // If no more dice, switch player
            const newPhase = newDiceValues.length === 0 ? 'waiting' : 'moving';
            const newPlayer = newDiceValues.length === 0 ? (prev.currentPlayer === 'white' ? 'black' : 'white') : prev.currentPlayer;

            return {
              ...prev,
              boardState: {
                ...prev.boardState,
                points: newPoints,
              },
              diceValues: newDiceValues,
              selectedPoint: null,
              gamePhase: newPhase as any,
              currentPlayer: newPlayer as Player,
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
    [gameState]
  );

  const resetGame = useCallback(() => {
    setGameState({
      boardState: initialBoardState,
      currentPlayer: 'white',
      diceValues: [],
      selectedPoint: null,
      gamePhase: 'waiting',
    });
  }, [initialBoardState]);

  return {
    gameState,
    handleDiceRoll,
    handlePointClick,
    resetGame,
  };
}
