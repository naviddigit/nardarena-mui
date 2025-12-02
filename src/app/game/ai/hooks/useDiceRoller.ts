/**
 * Dice Roller Hook
 * مدیریت کامل منطق تاس‌ها
 */

import { useState, useCallback } from 'react';
import { gamePersistenceAPI } from 'src/services/game-persistence-api';
import type { GameState } from 'src/hooks/game-logic/types';

interface UseDiceRollerProps {
  gameState: GameState;
  diceRollerRef: React.RefObject<any>;
  onDiceRollComplete: (values: number[]) => void;
}

export function useDiceRoller({ gameState, diceRollerRef, onDiceRollComplete }: UseDiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [isWaitingForBackend, setIsWaitingForBackend] = useState(false);
  const [skipBackendDice, setSkipBackendDice] = useState(false);

  /**
   * مدیریت اتمام انیمیشن تاس
   */
  const handleDiceRollComplete = useCallback(
    async (results: { value: number; type: string }[]) => {
      // اگر flag فعال باشه، از backend نگیر (قبلاً گرفتیم)
      if (skipBackendDice) {
        console.log('🎲 Skipping backend dice request (already have backend values)');
        setSkipBackendDice(false);
        onDiceRollComplete(results.map((r) => r.value));
        setIsRolling(false);
        return;
      }

      // برای opening roll، از تاس frontend استفاده کن
      if (gameState.gamePhase === 'opening') {
        console.log('🎲 Opening roll - using frontend dice:', results.map((r) => r.value));
        onDiceRollComplete(results.map((r) => r.value));
        setIsRolling(false);
        return;
      }

      // برای game rolls، نباید اینجا بیاد
      console.log('⚠️ Unexpected dice roll complete - should have gotten backend dice first');
    },
    [skipBackendDice, gameState.gamePhase, onDiceRollComplete]
  );

  /**
   * شروع انداختن تاس (player)
   */
  const triggerDiceRoll = useCallback(async () => {
    if (isRolling || isWaitingForBackend) {
      console.log('⏳ Already rolling or waiting...');
      return;
    }

    // Opening phase: تاس frontend
    if (gameState.gamePhase === 'opening') {
      if (diceRollerRef.current?.rollDice) {
        setIsRolling(true);
        diceRollerRef.current.rollDice();
      }
      return;
    }

    // بازی عادی: ابتدا از backend بگیر، سپس نمایش بده
    console.log('🎲 Getting backend dice first...');
    setIsWaitingForBackend(true);

    try {
      const diceResponse = await gamePersistenceAPI.rollDice();
      console.log('🎲 Backend dice:', diceResponse.dice);

      // تنظیم flag‌ها
      setSkipBackendDice(true);
      setIsWaitingForBackend(false);

      // تاخیر کوچک برای اطمینان از به‌روزرسانی state
      await new Promise((resolve) => setTimeout(resolve, 10));

      // نمایش تاس‌ها
      if (diceRollerRef.current?.setDiceValues) {
        setIsRolling(true);
        diceRollerRef.current.setDiceValues(diceResponse.dice);
      }
    } catch (error) {
      console.error('❌ Failed to get backend dice:', error);
      setIsRolling(false);
      setIsWaitingForBackend(false);
    }
  }, [isRolling, isWaitingForBackend, gameState.gamePhase, diceRollerRef]);

  /**
   * انداختن خودکار تاس برای AI
   */
  const triggerAIDiceRoll = useCallback(async () => {
    if (isRolling || isWaitingForBackend) return;

    console.log('🎲 AI auto-rolling dice...');
    setIsWaitingForBackend(true);

    try {
      const diceResponse = await gamePersistenceAPI.rollDice();
      console.log('🎲 Backend dice for AI:', diceResponse.dice);

      setSkipBackendDice(true);
      setIsWaitingForBackend(false);

      await new Promise((resolve) => setTimeout(resolve, 10));

      if (diceRollerRef.current?.setDiceValues) {
        setIsRolling(true);
        diceRollerRef.current.setDiceValues(diceResponse.dice);
      }
    } catch (error) {
      console.error('❌ Failed to get AI dice:', error);
      setIsRolling(false);
      setIsWaitingForBackend(false);
    }
  }, [isRolling, isWaitingForBackend, diceRollerRef]);

  return {
    isRolling,
    isWaitingForBackend,
    handleDiceRollComplete,
    triggerDiceRoll,
    triggerAIDiceRoll,
  };
}
