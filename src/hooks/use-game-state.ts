import { useState, useCallback, useMemo } from 'react';

import type { BoardState } from 'src/components/backgammon-board';

// ----------------------------------------------------------------------

type Player = 'white' | 'black';

type ValidMove = {
  from: number;
  to: number;
  die: number;
};

type MoveHistory = {
  boardState: BoardState;
  diceValue: number;
  from: number;
  to: number;
  hitChecker?: Player;
};

export type GameState = {
  boardState: BoardState;
  currentPlayer: Player;
  diceValues: number[];
  selectedPoint: number | null;
  gamePhase: 'opening' | 'waiting' | 'rolling' | 'moving' | 'finished';
  validMoves: ValidMove[];
  moveHistory: MoveHistory[];
  openingRoll: { white: number | null; black: number | null };
};

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
          const to = currentPlayer === 'white' ? from - die : from + die;
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
    setGameState((prev) => {
      // Opening roll: each player rolls one die
      if (prev.gamePhase === 'opening') {
        const dieValue = results[0].value;
        const newOpeningRoll = { ...prev.openingRoll };
        
        if (prev.openingRoll.white === null) {
          newOpeningRoll.white = dieValue;
          return {
            ...prev,
            openingRoll: newOpeningRoll,
            currentPlayer: 'black',
          };
        }
        
        newOpeningRoll.black = dieValue;
        
        // Determine who starts (re-roll if tie)
        if (newOpeningRoll.white === newOpeningRoll.black) {
          return {
            ...prev,
            openingRoll: { white: null, black: null },
            currentPlayer: 'white',
          };
        }
        
        // Winner starts - go to waiting phase so they can roll 2d6
        const starter: Player = newOpeningRoll.white! > newOpeningRoll.black! ? 'white' : 'black';
        
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
      
      return {
        ...prev,
        diceValues: finalDiceValues,
        gamePhase: validMoves.length > 0 ? 'moving' : 'waiting',
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
    (pointIndex: number) => {
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
            // Save current state to history
            const historyEntry: MoveHistory = {
              boardState: prev.boardState,
              diceValue: validMove.die,
              from: fromIndex,
              to: toIndex,
            };

            const newPoints = prev.boardState.points.map((point) => ({
              checkers: [...point.checkers],
              count: point.count,
            }));

            let newBar = { ...prev.boardState.bar };
            
            // Handle move from bar
            if (fromIndex === -1) {
              const toPoint = newPoints[toIndex];
              
              // Handle hitting opponent checker when entering from bar
              const isHitMove = toPoint.count === 1 && toPoint.checkers[0] !== prev.currentPlayer;
              
              if (isHitMove) {
                const hitColor = toPoint.checkers[0];
                historyEntry.hitChecker = hitColor;
                
                // STEP 1: Hit the opponent checker first
                toPoint.checkers = [];
                toPoint.count = 0;
                newBar = { ...newBar, [hitColor]: newBar[hitColor] + 1 };
                
                // Create intermediate state
                const intermediateState = {
                  points: newPoints,
                  bar: newBar,
                  off: { ...prev.boardState.off },
                };
                
                // Update with hit animation first
                setGameState({
                  ...prev,
                  boardState: intermediateState,
                });
                
                // STEP 2: Then move our checker from bar
                setTimeout(() => {
                  setGameState((current) => {
                    const updatedPoints = current.boardState.points.map((point) => ({
                      checkers: [...point.checkers],
                      count: point.count,
                    }));
                    
                    const updatedToPoint = updatedPoints[toIndex];
                    let updatedBar = { ...current.boardState.bar };
                    
                    // Move from bar to point
                    updatedBar = { ...updatedBar, [current.currentPlayer]: updatedBar[current.currentPlayer] - 1 };
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
                      gamePhase: 'moving',
                      validMoves: newValidMoves,
                      moveHistory: [...current.moveHistory, historyEntry],
                    };
                  });
                }, 250);
                
                return prev;
              }
              
              // NON-HIT MOVE from bar: Normal entry without hitting
              // Move checker from bar to point
              newBar = { ...newBar, [prev.currentPlayer]: newBar[prev.currentPlayer] - 1 };
              toPoint.checkers.push(prev.currentPlayer);
              toPoint.count += 1;
            } else {
              // Handle normal move from point to point
              const fromPoint = newPoints[fromIndex];
              const toPoint = newPoints[toIndex];

              // Handle hitting opponent checker - CHECK IF IT'S A HIT MOVE
              const isHitMove = toPoint.count === 1 && toPoint.checkers[0] !== prev.currentPlayer;
              
              if (isHitMove) {
                const hitColor = toPoint.checkers[0];
                historyEntry.hitChecker = hitColor;
                
                // STEP 1: First move the hit checker to bar (animate this first)
                toPoint.checkers = [];
                toPoint.count = 0;
                newBar = { ...newBar, [hitColor]: newBar[hitColor] + 1 };
                
                // Create intermediate state for hit animation
                const intermediateState = {
                  points: newPoints,
                  bar: newBar,
                  off: { ...prev.boardState.off },
                };
                
                // Update state with just the hit (this triggers animation 1)
                setGameState({
                  ...prev,
                  boardState: intermediateState,
                });
                
                // STEP 2: After a small delay, move our checker (animate this second)
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
                      gamePhase: 'moving',
                      validMoves: newValidMoves,
                      moveHistory: [...current.moveHistory, historyEntry],
                    };
                  });
                }, 250); // 250ms delay for hit animation to complete
                
                // Return current state (will be updated by setTimeout)
                return prev;
              }

              // NON-HIT MOVE: Normal move without hitting
              // Move checker
              const checker = fromPoint.checkers.pop();
              if (checker) {
                fromPoint.count -= 1;
                toPoint.checkers.push(checker);
                toPoint.count += 1;
              }
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

            return {
              ...prev,
              boardState: newBoardState,
              diceValues: newDiceValues,
              selectedPoint: null,
              gamePhase: 'moving',
              validMoves: newValidMoves,
              moveHistory: [...prev.moveHistory, historyEntry],
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

  const handleUndo = useCallback(() => {
    setGameState((prev) => {
      if (prev.moveHistory.length === 0) return prev;
      
      const lastMove = prev.moveHistory[prev.moveHistory.length - 1];
      const newHistory = prev.moveHistory.slice(0, -1);
      const newDiceValues = [...prev.diceValues, lastMove.diceValue].sort((a, b) => b - a);
      
      // Check if this was a hit move
      const wasHitMove = lastMove.hitChecker !== undefined;
      
      if (wasHitMove) {
        // UNDO HIT MOVE: Need to animate in reverse (2 steps)
        // Current state: our checker on destination, opponent checker on bar
        // Target state: our checker on source, opponent checker on destination
        
        // STEP 1: Move our checker back first (reverse of step 2 in forward)
        const currentState = prev.boardState;
        const intermediatePoints = currentState.points.map((point) => ({
          checkers: [...point.checkers],
          count: point.count,
        }));
        
        let intermediateBar = { ...currentState.bar };
        
        // Restore our checker position from the move
        if (lastMove.from === -1) {
          // Was from bar → restore to bar
          intermediateBar = { 
            ...intermediateBar, 
            [prev.currentPlayer]: intermediateBar[prev.currentPlayer] + 1 
          };
          // Remove from destination
          const destPoint = intermediatePoints[lastMove.to];
          destPoint.checkers.pop();
          destPoint.count -= 1;
        } else {
          // Was from point → restore to that point
          const fromPoint = intermediatePoints[lastMove.from];
          const toPoint = intermediatePoints[lastMove.to];
          
          // Remove from destination
          const checker = toPoint.checkers.pop();
          if (checker) {
            toPoint.count -= 1;
            // Add back to source
            fromPoint.checkers.push(checker);
            fromPoint.count += 1;
          }
        }
        
        // Create intermediate state (our checker moved back, hit checker still on bar)
        const intermediateState = {
          points: intermediatePoints,
          bar: intermediateBar,
          off: { ...currentState.off },
        };
        
        // Update to intermediate state (animate our checker back)
        setGameState({
          ...prev,
          boardState: intermediateState,
        });
        
        // STEP 2: After delay, restore hit checker from bar to point
        setTimeout(() => {
          setGameState((current) => {
            const finalPoints = current.boardState.points.map((point) => ({
              checkers: [...point.checkers],
              count: point.count,
            }));
            
            let finalBar = { ...current.boardState.bar };
            
            // Restore hit checker from bar to original point
            if (lastMove.hitChecker) {
              finalBar = {
                ...finalBar,
                [lastMove.hitChecker]: finalBar[lastMove.hitChecker] - 1
              };
              
              // Add back to the destination point
              const destPoint = finalPoints[lastMove.to];
              destPoint.checkers.push(lastMove.hitChecker);
              destPoint.count += 1;
            }
            
            const finalState = {
              points: finalPoints,
              bar: finalBar,
              off: { ...current.boardState.off },
            };
            
            const newValidMoves = calculateValidMoves(finalState, current.currentPlayer, newDiceValues);
            
            return {
              ...current,
              boardState: finalState,
              diceValues: newDiceValues,
              moveHistory: newHistory,
              validMoves: newValidMoves,
              selectedPoint: null,
              gamePhase: 'moving',
            };
          });
        }, 250); // Same delay as forward hit animation
        
        return prev; // Keep current state until setTimeout updates it
      }
      
      // NON-HIT MOVE: Normal undo (single step)
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
    });
  }, [initialBoardState]);

  return {
    gameState,
    handleDiceRoll,
    handlePointClick,
    handleBarClick,
    handleUndo,
    handleEndTurn,
    resetGame,
    validDestinations,
  };
}
