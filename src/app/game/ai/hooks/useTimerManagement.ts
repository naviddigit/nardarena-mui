/**
 * ⛔ LOCKED - Timer Management Hook
 * 
 * Manages chess-clock style timers for both players
 * - Countdown based on lastDoneBy
 * - Freeze human timer during AI turn
 * - Sync with backend on visibility change
 * - Handle timeout scenarios
 */

import { useEffect, useCallback } from 'react';
import type { Player, GamePhase } from 'src/types/game';
import { gamePersistenceAPI } from 'src/api/game-persistence';
import { toast } from 'sonner';

interface UseTimerManagementProps {
  lastDoneBy: 'white' | 'black' | null;
  gamePhase: GamePhase;
  currentPlayer: Player;
  aiPlayerColor: 'white' | 'black';
  winner: 'white' | 'black' | null;
  isExecutingAIMove: boolean;
  whiteTimerSeconds: number;
  blackTimerSeconds: number;
  setWhiteTimerSeconds: (value: number | ((prev: number) => number)) => void;
  setBlackTimerSeconds: (value: number | ((prev: number) => number)) => void;
  setLastDoneBy: (value: 'white' | 'black' | null) => void;
  setWinner: (value: 'white' | 'black' | null) => void;
  setTimeoutWinner: (value: boolean) => void;
  setGameState: any;
  backendGameId: string | null;
  user: any;
  gameState: any;
  maxSets: number;
}

export function useTimerManagement({
  lastDoneBy,
  gamePhase,
  currentPlayer,
  aiPlayerColor,
  winner,
  isExecutingAIMove,
  whiteTimerSeconds,
  blackTimerSeconds,
  setWhiteTimerSeconds,
  setBlackTimerSeconds,
  setLastDoneBy,
  setWinner,
  setTimeoutWinner,
  setGameState,
  backendGameId,
  user,
  gameState,
  maxSets,
}: UseTimerManagementProps) {
  
  // ⏱️ LOCAL TIMER COUNTDOWN - Update timer state every second
  useEffect(() => {
    console.log('⏱️ [Timer Countdown] useEffect triggered:', {
      lastDoneBy,
      phase: gamePhase,
      winner,
      isExecutingAIMove,
      currentPlayer,
      aiPlayerColor,
    });
    
    // Determine which timer should count
    const whiteIsActive = lastDoneBy === 'black' && 
                         gamePhase !== 'opening' && 
                         gamePhase !== 'game-over' && 
                         !winner;
    
    const blackIsActive = lastDoneBy === 'white' && 
                         gamePhase !== 'opening' && 
                         gamePhase !== 'game-over' && 
                         !winner;

    if (!whiteIsActive && !blackIsActive) {
      console.log('⏱️ [Timer Countdown] No active timer', {
        lastDoneBy,
        whiteWouldBe: lastDoneBy === 'black',
        blackWouldBe: lastDoneBy === 'white',
        phase: gamePhase,
      });
      return;
    }
    
    // ⏱️ CRITICAL: Freeze HUMAN timer when AI is playing
    const isAITurn = currentPlayer === aiPlayerColor;
    const isAIMovingPhase = isAITurn && gamePhase === 'moving';
    const humanPlayerColor = aiPlayerColor === 'white' ? 'black' : 'white';
    
    if ((isExecutingAIMove || isAIMovingPhase) && 
        ((whiteIsActive && humanPlayerColor === 'white') || (blackIsActive && humanPlayerColor === 'black'))) {
      console.log('⏱️ [Timer Countdown] Frozen - Human timer frozen during AI turn');
      return;
    }

    console.log('⏱️ [Timer Countdown] Starting interval:', {
      whiteIsActive,
      blackIsActive,
      whiteTime: whiteTimerSeconds,
      blackTime: blackTimerSeconds,
    });

    // ⏱️ Timestamp-based timer (works even when page hidden)
    let lastTickTime = Date.now();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastTickTime) / 1000);
      
      if (elapsed >= 1) {
        lastTickTime = now;
        
        if (whiteIsActive) {
          setWhiteTimerSeconds(prev => {
            const newValue = Math.max(0, prev - elapsed);
            
            if (newValue === 0 && prev > 0 && !winner) {
              console.log('⏱️ WHITE TIMEOUT! Ending game immediately...');
              
              setWinner('black');
              setTimeoutWinner(true);
              setGameState((prevState: any) => ({
                ...prevState,
                gamePhase: 'finished',
              }));
              
              toast.error("⏱️ Time's up! BLACK wins!");
              
              if (backendGameId && user) {
                gamePersistenceAPI.endGame(backendGameId, {
                  winner: 'BLACK',
                  whiteSetsWon: 0,
                  blackSetsWon: maxSets,
                  endReason: 'TIMEOUT',
                  finalGameState: gameState.boardState,
                }).catch(console.error);
              }
            }
            
            return newValue;
          });
        }
        
        if (blackIsActive) {
          setBlackTimerSeconds(prev => {
            const newValue = Math.max(0, prev - elapsed);
            
            if (newValue === 0 && prev > 0 && !winner) {
              console.log('⏱️ BLACK TIMEOUT! Ending game immediately...');
              
              setWinner('white');
              setTimeoutWinner(true);
              setGameState((prevState: any) => ({
                ...prevState,
                gamePhase: 'finished',
              }));
              
              toast.error("⏱️ Time's up! WHITE wins!");
              
              if (backendGameId && user) {
                gamePersistenceAPI.endGame(backendGameId, {
                  winner: 'WHITE',
                  whiteSetsWon: maxSets,
                  blackSetsWon: 0,
                  endReason: 'TIMEOUT',
                  finalGameState: gameState.boardState,
                }).catch(console.error);
              }
            }
            
            return newValue;
          });
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [
    lastDoneBy,
    gamePhase,
    currentPlayer,
    aiPlayerColor,
    winner,
    backendGameId,
    user,
    gameState,
    maxSets,
    isExecutingAIMove,
  ]);

  // ⏱️ Sync timers when page becomes visible
  useEffect(() => {
    if (!backendGameId || !gamePhase || gamePhase === 'opening' || gamePhase === 'game-over' || winner) {
      return;
    }

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log('⏱️ [Page Visible] Syncing timers from backend...');
        
        try {
          const updatedGame = await gamePersistenceAPI.getGame(backendGameId);
          
          setWhiteTimerSeconds(updatedGame.whiteTimeRemaining);
          setBlackTimerSeconds(updatedGame.blackTimeRemaining);
          
          const lastDoneByBackend = updatedGame.gameState?.lastDoneBy;
          if (lastDoneByBackend) {
            setLastDoneBy(lastDoneByBackend.toLowerCase() as 'white' | 'black');
          }
          
          console.log('⏱️ [Page Visible] Timers synced:', {
            white: updatedGame.whiteTimeRemaining,
            black: updatedGame.blackTimeRemaining,
            lastDoneBy: lastDoneByBackend,
          });
        } catch (error) {
          console.error('❌ Failed to sync timers on page visible:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [backendGameId, gamePhase, winner]);
}
