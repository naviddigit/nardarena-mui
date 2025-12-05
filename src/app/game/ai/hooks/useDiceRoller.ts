/**
 * ⛔⛔⛔ CRITICAL - ABSOLUTELY DO NOT MODIFY! ⛔⛔⛔
 * 
 * این فایل قفل شده است. هیچ تغییری بدون اجازه صریح مجاز نیست!
 * فقط در صورت خطای محرز و با اجازه صریح تغییر دهید.
 * 
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
  backendGameId: string | null; // Added: need gameId for backend dice
}

export function useDiceRoller({ gameState, diceRollerRef, onDiceRollComplete, backendGameId }: UseDiceRollerProps) {
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
');
        setSkipBackendDice(false);
        onDiceRollComplete(results.map((r) => r.value));
        setIsRolling(false);
        return;
      }

      // برای opening roll، از تاس frontend استفاده کن
      if (gameState.gamePhase === 'opening') {
 => r.value));
        onDiceRollComplete(results.map((r) => r.value));
        setIsRolling(false);
        return;
      }

      // برای game rolls، نباید اینجا بیاد
    },
    [skipBackendDice, gameState.gamePhase, onDiceRollComplete]
  );

  /**
   * شروع انداختن تاس (player)
   */
  const triggerDiceRoll = useCallback(async () => {
    if (isRolling || isWaitingForBackend) {
      return;
    }

    if (!backendGameId) {
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
    setIsWaitingForBackend(true);

    try {
      const diceResponse = await gamePersistenceAPI.rollDice(backendGameId);

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
      setIsRolling(false);
      setIsWaitingForBackend(false);
    }
  }, [isRolling, isWaitingForBackend, gameState.gamePhase, diceRollerRef, backendGameId]);

  /**
   * انداختن خودکار تاس برای AI
   */
  const triggerAIDiceRoll = useCallback(async () => {
    if (isRolling || isWaitingForBackend) return;

    if (!backendGameId) {
      return;
    }

    setIsWaitingForBackend(true);

    try {
      const diceResponse = await gamePersistenceAPI.rollDice(backendGameId);

      setSkipBackendDice(true);
      setIsWaitingForBackend(false);

      await new Promise((resolve) => setTimeout(resolve, 10));

      if (diceRollerRef.current?.setDiceValues) {
        setIsRolling(true);
        diceRollerRef.current.setDiceValues(diceResponse.dice);
      }
    } catch (error) {
      setIsRolling(false);
      setIsWaitingForBackend(false);
    }
  }, [isRolling, isWaitingForBackend, diceRollerRef, backendGameId]);

  return {
    isRolling,
    isWaitingForBackend,
    handleDiceRollComplete,
    triggerDiceRoll,
    triggerAIDiceRoll,
  };
}
