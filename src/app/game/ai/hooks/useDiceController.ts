/**
 * ⛔ LOCKED - Dice Controller Component
 * 
 * Handles all dice roll logic and backend communication
 * - Trigger dice roll
 * - Handle dice complete
 * - Backend dice validation (anti-cheat)
 * - Opening roll logic
 */

import { useRef } from 'react';
import type { Player, GameState } from 'src/types/game';
import { gameBackendService } from '../services/gameBackendService';
import { aiToggleService } from '../services/aiToggleService';
import { toast } from 'sonner';

interface UseDiceControllerProps {
  gameState: GameState;
  playerColor: 'white' | 'black' | null;
  aiPlayerColor: 'white' | 'black';
  backendGameId: string | null;
  user: any;
  diceRollerRef: any;
  isRolling: boolean;
  isWaitingForBackend: boolean;
  setIsRolling: (value: boolean) => void;
  setIsWaitingForBackend: (value: boolean) => void;
  setGameState: any;
  handleDiceRollWithTimestamp: (results: any[]) => void;
  canUserPlay: boolean;
  setCanUserPlay: (value: boolean) => void;
  setWaitingForOpponent: (value: boolean) => void;
}

export function useDiceController({
  gameState,
  playerColor,
  aiPlayerColor,
  backendGameId,
  user,
  diceRollerRef,
  isRolling,
  isWaitingForBackend,
  setIsRolling,
  setIsWaitingForBackend,
  setGameState,
  handleDiceRollWithTimestamp,
  canUserPlay,
  setCanUserPlay,
  setWaitingForOpponent,
}: UseDiceControllerProps) {
  
  const isRollingLockRef = useRef(false);
  const backendDiceRef = useRef<[number, number] | null>(null);

  const handleDiceRollComplete = async (results: { value: number; type: string }[]) => {
    isRollingLockRef.current = false;
    setIsWaitingForBackend(false);
    setIsRolling(false);
    
    // Anti-cheat: use backend dice
    let actualResults = results;
    
    if (backendDiceRef.current) {
      console.log('🎲 Physics showed:', results.map(r => r.value));
      console.log('✅ Using backend dice:', backendDiceRef.current);
      
      actualResults = backendDiceRef.current.map(value => ({ value, type: 'd6' }));
      backendDiceRef.current = null;
    }
    
    handleDiceRollWithTimestamp(actualResults);
    
    if (gameState.gamePhase !== 'opening') {
      console.log('Dice rolled:', actualResults.map(r => r.value));
    }
  };

  const triggerDiceRoll = async () => {
    console.log('🎲 triggerDiceRoll called');
    
    // ✅ Check if AI is disabled
    if (!aiToggleService.isEnabled() && gameState.currentPlayer === aiPlayerColor) {
      console.log('⛔ AI is disabled, skipping roll');
      return;
    }
    
    if (isRollingLockRef.current) {
      console.log('⛔ Roll already in progress');
      return;
    }
    
    console.log('📊 State:', {
      gamePhase: gameState.gamePhase,
      currentPlayer: gameState.currentPlayer,
      playerColor,
      aiPlayerColor,
      backendGameId,
      isRolling,
      isWaitingForBackend,
      canUserPlay,
    });
    
    if (backendGameId && user && gameState.gamePhase !== 'opening') {
      try {
        const canPlayData = await gameBackendService.canPlay(backendGameId);
        
        if (!canPlayData.isYourTurn) {
          return;
        }
        
        setCanUserPlay(true);
        setWaitingForOpponent(false);
      } catch (error) {
        return;
      }
    }
    
    // Opening phase logic
    if (gameState.gamePhase === 'opening') {
      if (playerColor === 'white' && gameState.openingRoll.white !== null) {
        return;
      }
      if (playerColor === 'black' && gameState.openingRoll.black !== null) {
        return;
      }
      
      if (diceRollerRef.current?.clearDice) {
        diceRollerRef.current.clearDice();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      isRollingLockRef.current = true;
      setIsWaitingForBackend(true);

      if (backendGameId) {
        try {
          const diceResponse = await gameBackendService.rollDice(backendGameId);
          console.log('🎲 Opening roll from backend:', diceResponse);
          
          backendDiceRef.current = diceResponse.dice;
          
          setGameState((prev: any) => ({ ...prev, currentPlayer: playerColor as Player }));
          
          if (diceRollerRef.current?.setDiceValues) {
            setIsRolling(true);
            diceRollerRef.current.setDiceValues(diceResponse.dice);
          }
        } catch (error) {
          isRollingLockRef.current = false;
          setIsRolling(false);
          setIsWaitingForBackend(false);
          toast.error('Failed to get opening roll from backend');
        }
      } else {
        if (diceRollerRef.current?.rollDice) {
          setGameState((prev: any) => ({ ...prev, currentPlayer: playerColor as Player }));
          
          setTimeout(() => {
            setIsRolling(true);
            diceRollerRef.current?.rollDice();
          }, 100);
        }
      }
      return;
    }
    
    if (isRolling || isWaitingForBackend) {
      return;
    }

    if (!playerColor) {
      return;
    }

    if (!backendGameId) {
      return;
    }

    if (gameState.currentPlayer === aiPlayerColor) {
      return;
    }
    
    if (diceRollerRef.current?.clearDice && (gameState.gamePhase as any) !== 'opening') {
      diceRollerRef.current.clearDice();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    isRollingLockRef.current = true;
    setIsWaitingForBackend(true);

    try {
      const diceResponse = await gameBackendService.rollDice(backendGameId);
      console.log('🎲 Backend dice:', diceResponse);
      
      backendDiceRef.current = diceResponse.dice;
      console.log('🎲 Backend dice saved:', diceResponse.dice);

      if (diceRollerRef.current?.setDiceValues) {
        setIsRolling(true);
        diceRollerRef.current.setDiceValues(diceResponse.dice);
      }
    } catch (error) {
      isRollingLockRef.current = false;
      setIsRolling(false);
      setIsWaitingForBackend(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to backend';
      const displayMessage = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')
        ? '❌ Backend connection failed. Please check if server is running.'
        : `❌ ${errorMessage}`;
      toast.error(displayMessage);
    }
  };

  const triggerDiceRefresh = () => {
    if (diceRollerRef.current) {
      if (diceRollerRef.current.reloadDice) {
        diceRollerRef.current.reloadDice();
      } else if (diceRollerRef.current.clearDice) {
        diceRollerRef.current.clearDice();
      }
    }
  };

  return {
    triggerDiceRoll,
    handleDiceRollComplete,
    triggerDiceRefresh,
    isRollingLockRef,
  };
}
