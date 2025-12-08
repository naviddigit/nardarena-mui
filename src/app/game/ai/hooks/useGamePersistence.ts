/**
 * ⛔ LOCKED - Game Persistence Hook
 * 
 * Load and restore game from URL
 * - Load existing game on mount/refresh
 * - Restore board state
 * - Restore timer values
 * - Handle completed games
 */

import { useEffect, useRef } from 'react';
import { gamePersistenceAPI } from 'src/api/game-persistence';
import type { Player, GamePhase } from 'src/types/game';

interface UseGamePersistenceProps {
  urlGameId: string | null;
  user: any;
  setPlayerColor: (color: 'white' | 'black') => void;
  setAiPlayerColor: (color: 'white' | 'black') => void;
  setBackendGameId: (id: string | null) => void;
  setGameState: any;
  setScores: (scores: { white: number; black: number }) => void;
  setWinner: (winner: 'white' | 'black' | null) => void;
  setTimeoutWinner: (value: boolean) => void;
  setResultDialogOpen: (value: boolean) => void;
  setWhiteTimerSeconds: (value: number) => void;
  setBlackTimerSeconds: (value: number) => void;
  setLastDoneBy: (value: 'white' | 'black' | null) => void;
  setCanUserPlay: (value: boolean) => void;
  setWaitingForOpponent: (value: boolean) => void;
  setBackendGame: (game: any) => void;
  setLoading: (value: boolean) => void;
}

export function useGamePersistence({
  urlGameId,
  user,
  setPlayerColor,
  setAiPlayerColor,
  setBackendGameId,
  setGameState,
  setScores,
  setWinner,
  setTimeoutWinner,
  setResultDialogOpen,
  setWhiteTimerSeconds,
  setBlackTimerSeconds,
  setLastDoneBy,
  setCanUserPlay,
  setWaitingForOpponent,
  setBackendGame,
  setLoading,
}: UseGamePersistenceProps) {
  const gameLoadedRef = useRef(false);

  useEffect(() => {
    const loadExistingGame = async () => {
      if (gameLoadedRef.current) return;
      
      if (urlGameId && user) {
        gameLoadedRef.current = true;
        
        try {
          const game = await gamePersistenceAPI.getGame(urlGameId);
          setBackendGame(game);
          
          console.log('🎲 Dice restoration data:', {
            currentDiceValues: game.currentDiceValues,
            whiteHasDiceRolled: game.whiteHasDiceRolled,
            blackHasDiceRolled: game.blackHasDiceRolled,
            currentPlayer: game.gameState?.currentPlayer,
          });
          
          console.log('🎮 gameState:', {
            currentPlayer: game.gameState.currentPlayer,
            lastDoneBy: game.gameState.lastDoneBy || null,
            lastDoneAt: game.gameState.lastDoneAt || null,
            turnCompleted: game.gameState.turnCompleted ?? true,
            phase: game.gameState.phase || 'waiting',
            aiPlayerColor: game.gameState.aiPlayerColor || null,
            previousDice: game.gameState.currentTurnDice || null,
            currentDiceValues: game.gameState.diceValues || null,
            nextDiceRoll: game.gameState.nextDiceRoll || null,
            nextRoll: game.gameState.nextRoll || null,
          });
          
          // Handle completed game
          if (game.status === 'COMPLETED' as any) {
            const isWhitePlayer = game.whitePlayerId === user.id;
            const resumedPlayerColor = isWhitePlayer ? 'white' : 'black';
            const resumedAIColor = isWhitePlayer ? 'black' : 'white';
            
            setPlayerColor(resumedPlayerColor);
            setAiPlayerColor(resumedAIColor);
            setBackendGameId(game.id);
            
            if (game.gameState && game.gameState.points) {
              setGameState((prev: any) => ({
                ...prev,
                boardState: {
                  points: game.gameState.points,
                  bar: game.gameState.bar || { white: 0, black: 0 },
                  off: game.gameState.off || { white: 0, black: 0 },
                },
                currentPlayer: game.gameState.currentPlayer || 'white',
                gamePhase: 'finished',
              }));
            }
            
            const gameWinner = game.winner?.toLowerCase() as 'white' | 'black' | null;
            if (gameWinner) {
              setWinner(gameWinner);
              setScores({
                white: game.whiteSetsWon || 0,
                black: game.blackSetsWon || 0,
              });
              setTimeoutWinner(game.endReason === 'TIMEOUT');
              setResultDialogOpen(true);
            }
            
            setLoading(false);
            return;
          }
          
          // Handle active game
          if (game.status === 'ACTIVE' as any && game.gameState) {
            const isWhitePlayer = game.whitePlayerId === user.id;
            const isBlackPlayer = game.blackPlayerId === user.id;
            
            console.log('👤 Player Check:', { 
              userId: user.id, 
              whitePlayerId: game.whitePlayerId, 
              blackPlayerId: game.blackPlayerId, 
              isWhitePlayer, 
              isBlackPlayer 
            });
            
            const resumedPlayerColor = isWhitePlayer ? 'white' : 'black';
            const resumedAIColor = isWhitePlayer ? 'black' : 'white';
            
            if (isWhitePlayer || isBlackPlayer) {
              setPlayerColor(resumedPlayerColor);
              setAiPlayerColor(resumedAIColor);
              setBackendGameId(game.id);
              
              // Determine gamePhase
              let restoredPhase: GamePhase = 'waiting';
              
              if (game.gameState.phase) {
                restoredPhase = game.gameState.phase as GamePhase;
              } else if (game.gameState.diceValues && game.gameState.diceValues.length > 0) {
                restoredPhase = 'moving';
              } else if (!game.gameState.currentPlayer) {
                restoredPhase = 'opening';
              }
              
              if (game.gameState.turnCompleted === true) {
                console.log('⚠️ turnCompleted=true detected, forcing phase to waiting');
                restoredPhase = 'waiting';
              }
              
              console.log('🔍 Phase restoration:', {
                fromBackend: game.gameState.phase,
                turnCompleted: game.gameState.turnCompleted,
                finalPhase: restoredPhase,
              });
              
              // Restore board state
              setGameState((prev: any) => ({
                ...prev,
                boardState: {
                  points: game.gameState.points || prev.boardState.points,
                  bar: game.gameState.bar || prev.boardState.bar,
                  off: game.gameState.off || prev.boardState.off,
                },
                currentPlayer: game.gameState.currentPlayer || 'white',
                gamePhase: restoredPhase,
                diceValues: game.gameState.diceValues || [],
                openingRoll: game.gameState.openingRoll || prev.openingRoll,
                nextRoll: game.gameState.nextRoll || undefined,
              }));
              
              // Fix phase if needed
              if (restoredPhase === 'moving' && 
                  (!game.gameState.diceValues || game.gameState.diceValues.length === 0) && 
                  !game.gameState.turnCompleted) {
                setTimeout(() => {
                  setGameState((prev: any) => ({
                    ...prev,
                    gamePhase: 'waiting',
                    diceValues: [],
                  }));
                }, 500);
              }
              
              // Restore timers
              const dbTimeControl = (game as any).timeControl;
              const whiteTimeDB = (game as any).whiteTimeRemaining;
              const blackTimeDB = (game as any).blackTimeRemaining;
              
              let whiteTime = whiteTimeDB !== null && whiteTimeDB !== undefined ? whiteTimeDB : dbTimeControl;
              let blackTime = blackTimeDB !== null && blackTimeDB !== undefined ? blackTimeDB : dbTimeControl;
              
              setWhiteTimerSeconds(whiteTime);
              setBlackTimerSeconds(blackTime);
              
              const lastDoneByBackend = game.gameState?.lastDoneBy;
              if (lastDoneByBackend) {
                setLastDoneBy(lastDoneByBackend.toLowerCase() as 'white' | 'black');
                console.log('⏱️ [Timer] lastDoneBy restored:', lastDoneByBackend);
              } else if (game.gameState?.phase === 'playing' || game.gameState?.phase === 'waiting') {
                const winner = game.gameState.currentPlayer?.toLowerCase();
                const loser = winner === 'white' ? 'black' : 'white';
                setLastDoneBy(loser);
                console.log('⏱️ [Timer] lastDoneBy inferred:', loser);
              }
              
              console.log('⏱️ Timers restored:', {
                white: whiteTime,
                black: blackTime,
                currentPlayer: game.gameState.currentPlayer,
              });
              
              try {
                const canPlayResponse = await gamePersistenceAPI.axios.get(`/game/${game.id}/can-play`);
                const { canPlay, isYourTurn } = canPlayResponse.data;
                
                setCanUserPlay(canPlay);
                setWaitingForOpponent(!canPlay);
              } catch (error) {
                // Ignore
              }
              
              setLoading(false);
            }
          }
        } catch (error) {
          setLoading(false);
        }
      }
    };
    
    loadExistingGame();
  }, [urlGameId, user]);
}
