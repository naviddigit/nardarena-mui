/**
 * ⛔ LOCKED - Game Effects Hook
 * 
 * Small side-effect hooks that don't fit elsewhere:
 * - Auto-skip when blocked on bar
 * - Set winner detection
 * - Sound effects
 * - Clear dice on tie
 * - Opening roll save
 * - End game on match win
 */

import { useEffect, useRef } from 'react';
import type { GameState, Player } from 'src/types/game';
import { gameBackendService } from '../services/gameBackendService';
import { toast } from 'sonner';

interface UseGameEffectsProps {
  gameState: GameState;
  winner: 'white' | 'black' | null;
  playerColor: 'white' | 'black' | null;
  aiPlayerColor: 'white' | 'black';
  backendGameId: string | null;
  user: any;
  maxSets: number;
  currentSet: number;
  scores: { white: number; black: number };
  timeoutWinner: boolean;
  diceRollerRef: any;
  isRolling: boolean;
  handleEndTurn: () => void;
  setWinner: (winner: 'white' | 'black' | null) => void;
  setResultDialogOpen: (value: boolean) => void;
  setGameState: any;
  setScores: any;
  setCurrentSet: (set: number) => void;
  setShowWinText: (value: boolean) => void;
  setWinTextMessage: (message: string) => void;
  setLastDoneBy: (value: 'white' | 'black' | null) => void;
  setIsRolling: (value: boolean) => void;
  setTimeoutWinner: (value: boolean) => void;
  startNewSet: (winner: Player) => void;
  playSound: (sound: string) => void;
}

export function useGameEffects({
  gameState,
  winner,
  playerColor,
  aiPlayerColor,
  backendGameId,
  user,
  maxSets,
  currentSet,
  scores,
  timeoutWinner,
  diceRollerRef,
  isRolling,
  handleEndTurn,
  setWinner,
  setResultDialogOpen,
  setGameState,
  setScores,
  setCurrentSet,
  setShowWinText,
  setWinTextMessage,
  setLastDoneBy,
  setIsRolling,
  setTimeoutWinner,
  startNewSet,
  playSound,
}: UseGameEffectsProps) {
  
  const lastTurnPlayerRef = useRef<'white' | 'black' | null>(null);
  const lastMoveCountRef = useRef(0);
  const setWinnerProcessedRef = useRef(false);
  const openingRollEndedRef = useRef(false);

  // Auto-skip turn if player can't enter from bar
  useEffect(() => {
    if (gameState.gamePhase !== 'moving' || winner) return;
    
    const hasCheckersOnBar = gameState.boardState.bar[gameState.currentPlayer] > 0;
    
    if (hasCheckersOnBar) {
      const hasValidBarMoves = gameState.validMoves.some((m) => m.from === -1);
      
      if (!hasValidBarMoves) {
        setTimeout(() => {
          handleEndTurn();
        }, 1500);
      }
    }
  }, [gameState.gamePhase, gameState.validMoves, gameState.currentPlayer, gameState.boardState.bar, winner, handleEndTurn]);

  // Check for set winner and start new set
  useEffect(() => {
    if (gameState.gamePhase === 'finished' && !winner && !setWinnerProcessedRef.current) {
      setWinnerProcessedRef.current = true;
      
      const currentSetWinner = gameState.boardState.off.white === 15 ? 'white' : 'black';
      playSound('move');
      
      setScores((prev: any) => {
        const newScore = {
          ...prev,
          [currentSetWinner]: prev[currentSetWinner] + 1,
        };
        
        const setsToWin = Math.ceil(maxSets / 2);
        
        if (newScore[currentSetWinner] >= setsToWin) {
          setWinner(currentSetWinner);
          setTimeoutWinner(false);
          setResultDialogOpen(true);
          playSound('move');
        } else {
          setShowWinText(true);
          setWinTextMessage(currentSetWinner === 'white' ? 'You Win This Set!' : 'AI Wins This Set!');
          
          setTimeout(() => {
            setShowWinText(false);
            
            setTimeout(async () => {
              const nextSet = currentSet + 1;
              setCurrentSet(nextSet);
              
              setWinTextMessage(`Start Set ${nextSet} of ${maxSets}`);
              setShowWinText(true);
              setTimeout(() => setShowWinText(false), 4000);
              
              startNewSet(currentSetWinner);
              
              // Reset timer values for new set
              if (backendGameId) {
                try {
                  const timerData = await gameBackendService.syncTimers(backendGameId);
                  // Timer reset handled by parent component
                  console.log('⏱️ Timer reset for new set:', timerData);
                } catch (error) {
                  console.error('❌ Failed to fetch timer values:', error);
                }
              }
              
              setWinnerProcessedRef.current = false;
              openingRollEndedRef.current = false;
            }, 500);
          }, 4000);
        }
        
        return newScore;
      });
    }
  }, [gameState.gamePhase, gameState.boardState.off, winner, currentSet, maxSets, startNewSet, playSound]);

  // Play turn sound
  useEffect(() => {
    if (!playerColor || winner || gameState.gamePhase === 'opening') {
      return;
    }

    if (gameState.currentPlayer === playerColor && gameState.gamePhase === 'waiting') {
      if (lastTurnPlayerRef.current !== gameState.currentPlayer) {
        setTimeout(() => {
          playSound('turn');
        }, 1000);
        lastTurnPlayerRef.current = gameState.currentPlayer;
      }
    } else if (gameState.gamePhase !== 'waiting') {
      lastTurnPlayerRef.current = null;
    }
  }, [playerColor, gameState.currentPlayer, gameState.gamePhase, winner, playSound]);

  // Play move sound
  useEffect(() => {
    if (gameState.moveHistory.length > lastMoveCountRef.current) {
      playSound('move');
      lastMoveCountRef.current = gameState.moveHistory.length;
    } else if (gameState.moveHistory.length === 0) {
      lastMoveCountRef.current = 0;
    }
  }, [gameState.moveHistory.length, playSound]);

  // Stop rolling when dice applied
  useEffect(() => {
    if (isRolling) {
      if (gameState.gamePhase === 'moving') {
        setIsRolling(false);
      } else if (gameState.gamePhase === 'waiting' && 
                 gameState.openingRoll.white !== null && 
                 gameState.openingRoll.black !== null) {
        setIsRolling(false);
      } else if (gameState.diceValues.length > 0) {
        setIsRolling(false);
      }
    }
  }, [gameState.gamePhase, gameState.openingRoll.white, gameState.openingRoll.black, gameState.diceValues.length, isRolling]);

  // Clear dice on tie
  useEffect(() => {
    if (gameState.shouldClearDice && diceRollerRef.current?.clearDice) {
      diceRollerRef.current.clearDice();
      setIsRolling(false);
      openingRollEndedRef.current = false;
      
      setGameState((prev: any) => ({
        ...prev,
        shouldClearDice: false,
      }));
    }
  }, [gameState.shouldClearDice, setGameState]);

  // Clear opening roll dice
  useEffect(() => {
    if (
      gameState.gamePhase === 'waiting' &&
      gameState.openingRoll.white !== null &&
      gameState.openingRoll.black !== null &&
      gameState.openingRoll.white !== gameState.openingRoll.black &&
      gameState.diceValues.length === 0 &&
      diceRollerRef.current?.clearDice
    ) {
      console.log('🧹 Clearing opening roll dice');
      diceRollerRef.current.clearDice();
      
      setTimeout(() => {
        if (diceRollerRef.current?.clearDice) {
          diceRollerRef.current.clearDice();
        }
      }, 200);
    }
  }, [gameState.gamePhase, gameState.openingRoll, gameState.diceValues.length]);

  // Save opening roll to backend
  useEffect(() => {
    if (!backendGameId || !user) return;
    
    if (
      gameState.openingRoll.white !== null &&
      gameState.openingRoll.black !== null &&
      gameState.openingRoll.white !== gameState.openingRoll.black &&
      !openingRollEndedRef.current
    ) {
      if (openingRollEndedRef.current) return;
      
      openingRollEndedRef.current = true;
      console.log('🎯 Opening roll conditions met, saving to backend...');
      
      const saveOpeningRoll = async () => {
        try {
          const openingWinner: Player = gameState.openingRoll.white! > gameState.openingRoll.black! ? 'white' : 'black';
          console.log(`🎯 Opening roll: white=${gameState.openingRoll.white}, black=${gameState.openingRoll.black}, winner=${openingWinner}`);
          
          const response = await gameBackendService.completeOpeningRoll(backendGameId, openingWinner);
          
          console.log('💾 Saving nextRoll to state:', response.nextRoll);
          
          const loser = openingWinner === 'white' ? 'black' : 'white';
          setLastDoneBy(loser);
          console.log(`⏱️ [Timer] Opening completed - set lastDoneBy to ${loser}`);
          
          setGameState((prev: any) => ({
            ...prev,
            currentPlayer: openingWinner as Player,
            gamePhase: 'waiting',
            diceValues: [],
            nextRoll: response.nextRoll,
          }));
          
        } catch (error) {
          console.error('❌ Error saving opening roll:', error);
          const errorMsg = (error as any).response?.data?.message || 'System error occurred';
          toast.error(errorMsg);
          openingRollEndedRef.current = false;
        }
      };
      
      saveOpeningRoll();
    }
  }, [backendGameId, user, gameState.openingRoll, gameState.currentPlayer, gameState.boardState, aiPlayerColor]);

  // End game in backend when match is over
  useEffect(() => {
    if (backendGameId && user && winner) {
      const endBackendGame = async () => {
        try {
          await gameBackendService.endGame(backendGameId, {
            winner: winner.toUpperCase() as any,
            whiteSetsWon: scores.white,
            blackSetsWon: scores.black,
            endReason: timeoutWinner ? 'TIMEOUT' : 'NORMAL_WIN',
            finalGameState: gameState.boardState,
          });
        } catch (error) {
          if ((error as any)?.response?.status !== 400) {
            console.error('Failed to end game:', error);
          }
        }
      };
      
      endBackendGame();
    }
  }, [backendGameId, user, winner, timeoutWinner, scores, gameState.boardState]);

  return {
    openingRollEndedRef,
    setWinnerProcessedRef,
  };
}
