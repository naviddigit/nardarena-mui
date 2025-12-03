import { useState, useCallback, useMemo } from 'react';

import type { BoardState } from 'src/components/backgammon-board';

import {
  calculateValidMoves,
  executeMove,
  type GameState,
  type Player,
  type ValidMove,
  type MoveHistory,
} from './game-logic';

// Re-export types for external use
export type { GameState, Player, ValidMove, MoveHistory };

// ----------------------------------------------------------------------

export function useGameState(initialBoardState: BoardState) {
  const [gameState, setGameState] = useState<GameState>({
    boardState: initialBoardState,
    currentPlayer: 'white',
    diceValues: [],
    selectedPoint: null,
    gamePhase: 'opening',
    validMoves: [],
    moveHistory: [],
    openingRoll: { white: null, black: null },
    scores: { white: 0, black: 0 },
    setWinner: null,
    shouldClearDice: false,
  });

  const handleDiceRoll = useCallback((results: { value: number }[]) => {
    setGameState((prev) => {
      // Opening roll: both players can roll independently (not turn-based)
      if (prev.gamePhase === 'opening') {
        const dieValue = results[0].value;
        const newOpeningRoll = { ...prev.openingRoll };
        
        // Determine which player rolled based on currentPlayer
        const rollingPlayer = prev.currentPlayer;
        
        // If this player already rolled, ignore (shouldn't happen but safety check)
        if (newOpeningRoll[rollingPlayer] !== null) {
          console.log(`⚠️ ${rollingPlayer} already rolled, ignoring duplicate roll`);
          return prev;
        }
        
        // Record this player's roll
        newOpeningRoll[rollingPlayer] = dieValue;
        console.log(`🎲 ${rollingPlayer} rolled:`, dieValue);
        
        // Check if both players have rolled
        if (newOpeningRoll.white !== null && newOpeningRoll.black !== null) {
          // Check for tie
          if (newOpeningRoll.white === newOpeningRoll.black) {
            console.log('🔄 Opening roll tie! Re-rolling...');
            return {
              ...prev,
              openingRoll: { white: null, black: null },
              currentPlayer: 'white',
              shouldClearDice: true,
            };
          }
          
          // Determine winner
          const starter: Player = newOpeningRoll.white > newOpeningRoll.black ? 'white' : 'black';
          console.log('🎯 Opening roll winner:', starter);
          
          return {
            ...prev,
            currentPlayer: starter,
            diceValues: [],
            gamePhase: 'waiting',
            validMoves: [],
            openingRoll: newOpeningRoll,
            moveHistory: [],
          };
        }
        
        // Only one player has rolled, stay in opening phase
        // DON'T change currentPlayer - both can roll anytime
        return {
          ...prev,
          openingRoll: newOpeningRoll,
        };
      }
      
      // Normal roll
      const diceValues = results.map((r) => r.value);
      
      // Handle doubles
      const finalDiceValues = diceValues[0] === diceValues[1] 
        ? [diceValues[0], diceValues[0], diceValues[0], diceValues[0]]
        : diceValues;
      const validMoves = calculateValidMoves(prev.boardState, prev.currentPlayer, finalDiceValues);
      
      // Check if player has checkers on bar
      const hasCheckersOnBar = prev.boardState.bar[prev.currentPlayer] > 0;
      const hasValidBarMoves = validMoves.some((m) => m.from === -1);
      
      // Auto-select bar if player has checkers on bar and has valid moves
      const autoSelectedPoint = hasCheckersOnBar && hasValidBarMoves ? -1 : null;
      
      // If no valid moves available, skip turn automatically
      if (validMoves.length === 0) {
        const nextPlayer: Player = prev.currentPlayer === 'white' ? 'black' : 'white';
        return {
          ...prev,
          currentPlayer: nextPlayer,
          diceValues: [],
          gamePhase: 'waiting',
          validMoves: [],
          moveHistory: [],
          selectedPoint: null,
        };
      }
      
      return {
        ...prev,
        diceValues: finalDiceValues,
        gamePhase: 'moving',
        validMoves,
        moveHistory: [],
        selectedPoint: autoSelectedPoint, // Auto-select bar if needed
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

  const handleBarClick = useCallback(() => {
    if (gameState.gamePhase !== 'moving') return;
    
    // Check if current player has checkers on bar
    if (gameState.boardState.bar[gameState.currentPlayer] > 0) {
      // Check if there are valid moves from bar
      const hasValidMove = gameState.validMoves.some((m) => m.from === -1);
      if (hasValidMove) {
        setGameState((prev) => ({
          ...prev,
          selectedPoint: -1, // -1 represents bar
        }));
      }
    }
  }, [gameState]);

  const handlePointClick = useCallback(
    (pointIndex: number, targetIndex?: number) => {
      if (gameState.gamePhase !== 'moving') return;

      // If targetIndex is provided (e.g., from bear-off zone click), try to execute move directly
      if (targetIndex !== undefined) {
        const fromIndex = gameState.selectedPoint;
        if (fromIndex === null || fromIndex < 0) return;

        const validMove = gameState.validMoves.find(
          (m) => m.from === fromIndex && m.to === targetIndex
        );

        if (validMove) {
          console.log(`🎯 Executing move: ${fromIndex} → ${targetIndex}`);
          const result = executeMove(
            gameState,
            fromIndex,
            targetIndex,
            validMove,
            setGameState
          );

          if (result) {
            setGameState(result);
          }
        }
        return;
      }

      // Normal point click logic (when targetIndex is not provided)
      // If no point selected, try to select this point
      if (gameState.selectedPoint === null) {
        const point = gameState.boardState.points[pointIndex];
        // Check if this point has a valid move
        const validMovesFromPoint = gameState.validMoves.filter((m) => m.from === pointIndex);
        
        if (point.checkers.length > 0 && point.checkers[0] === gameState.currentPlayer && validMovesFromPoint.length > 0) {
          // Check unique destinations (important for doubles)
          const uniqueDestinations = new Set(validMovesFromPoint.map((m) => m.to));
          
          // If only ONE unique destination, auto-execute first move
          if (uniqueDestinations.size === 1) {
            const autoMove = validMovesFromPoint[0];
            
            // Execute move immediately
            const result = executeMove(
              gameState,
              pointIndex,
              autoMove.to,
              autoMove,
              setGameState
            );

            if (result) {
              setGameState(result);
            }
            // Don't select point, just execute move
            return;
          }
          
          // Multiple destinations available, select the point
          setGameState((prev) => ({
            ...prev,
            selectedPoint: pointIndex,
          }));
        }
      } else {
        // Already have a point selected
        
        // Check if clicking same point again - deselect it
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
          // Execute move using the move-executor module
          const result = executeMove(
            gameState,
            fromIndex,
            toIndex,
            validMove,
            setGameState
          );

          // If result is not null, update state synchronously
          if (result) {
            setGameState(result);
          }
          // If result is null, executeMove handles async update
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

  const handleUndo = useCallback(() => {
    setGameState((prev) => {
      if (prev.moveHistory.length === 0) return prev;
      
      const lastMove = prev.moveHistory[prev.moveHistory.length - 1];
      const newHistory = prev.moveHistory.slice(0, -1);
      const newDiceValues = [...prev.diceValues, lastMove.diceValue].sort((a, b) => b - a);
      const newValidMoves = calculateValidMoves(lastMove.boardState, prev.currentPlayer, newDiceValues);
      
      return {
        ...prev,
        boardState: lastMove.boardState,
        diceValues: newDiceValues,
        moveHistory: newHistory,
        validMoves: newValidMoves,
        selectedPoint: null,
        gamePhase: 'moving',
      };
    });
  }, [calculateValidMoves]);

  const handleEndTurn = useCallback(() => {
    setGameState((prev) => {
      if (prev.gamePhase !== 'moving') return prev;
      
      const nextPlayer: Player = prev.currentPlayer === 'white' ? 'black' : 'white';
      return {
        ...prev,
        currentPlayer: nextPlayer,
        diceValues: [],
        gamePhase: 'waiting',
        validMoves: [],
        moveHistory: [],
        selectedPoint: null,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      boardState: initialBoardState,
      currentPlayer: 'white',
      diceValues: [],
      selectedPoint: null,
      gamePhase: 'opening',
      validMoves: [],
      moveHistory: [],
      openingRoll: { white: null, black: null },
      scores: { white: 0, black: 0 },
      setWinner: null,
      shouldClearDice: false,
    });
  }, [initialBoardState]);

  // Check if player won the set (all checkers borne off)
  const checkSetWin = useCallback((boardState: BoardState, player: Player) => {
    return boardState.off[player] === 15;
  }, []);

  // Start new set after someone wins
  const startNewSet = useCallback((winner: Player) => {
    // Create a fresh board state (not reusing initialBoardState reference)
    const freshBoardState = {
      points: initialBoardState.points.map(p => ({
        checkers: [...p.checkers],
        count: p.count,
      })),
      bar: { ...initialBoardState.bar },
      off: { white: 0, black: 0 }, // Reset off counts
    };
    
    setGameState((prev) => ({
      ...prev,
      boardState: freshBoardState,
      currentPlayer: winner, // Winner starts next set
      diceValues: [],
      selectedPoint: null,
      gamePhase: 'waiting', // Skip opening roll, go straight to waiting
      validMoves: [],
      moveHistory: [],
      openingRoll: { white: null, black: null },
      scores: {
        ...prev.scores,
        [winner]: prev.scores[winner] + 1,
      },
      setWinner: winner,
      shouldClearDice: false,
    }));
  }, [initialBoardState]);

  return {
    gameState,
    handleDiceRoll,
    handlePointClick,
    handleBarClick,
    handleUndo,
    handleEndTurn,
    resetGame,
    startNewSet,
    checkSetWin,
    validDestinations,
    // Direct state setter for AI moves from backend
    setGameState,
  };
}
