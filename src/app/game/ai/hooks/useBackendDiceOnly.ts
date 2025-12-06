/**
 * ⛔⛔⛔ CRITICAL - DO NOT MODIFY THIS FILE! ⛔⛔⛔
 * 
 * 🎲 Backend Dice Only Hook
 * ماژول مستقل برای دریافت و نمایش تاس فقط از backend
 * 
 * این hook هیچ تاس تصادفی generate نمی‌کنه
 * فقط از backend می‌خونه و همون رو نمایش میده
 * 
 * ✅ استفاده:
 * - User roll: از backend بخوان، همون رو نشون بده
 * - AI roll: از backend بخوان، همون رو نشون بده
 * - Refresh: از nextRoll بخوان، همون رو نشون بده
 * 
 * ⛔ هیچوقت Math.random() یا تاس تصادفی استفاده نمیشه!
 * 
 * 🔒 LOCKED AFTER SUCCESSFUL TESTING - December 6, 2025
 * ⚠️ تغییر بدون اجازه = اخراج از پروژه
 */

import { useCallback } from 'react';
import { gamePersistenceAPI } from 'src/services/game-persistence-api';

interface UseBackendDiceOnlyProps {
  backendGameId: string | null;
  diceRollerRef: React.RefObject<any>;
  setIsRolling: (value: boolean) => void;
  setIsWaitingForBackend: (value: boolean) => void;
}

interface UseBackendDiceOnlyReturn {
  /**
   * دریافت و نمایش تاس از backend
   * این تابع:
   * 1. از backend تاس رو می‌خونه
   * 2. مستقیماً همون اعداد رو به dice roller میده
   * 3. هیچ تاس تصادفی generate نمی‌کنه
   */
  rollDiceFromBackend: () => Promise<number[] | null>;
  
  /**
   * نمایش تاس از nextRoll (برای refresh)
   * این تابع:
   * 1. اعداد تاس رو از nextRoll می‌گیره
   * 2. مستقیماً همون اعداد رو نمایش میده
   * 3. هیچ API call نمی‌زنه (چون تاس قبلاً گرفته شده)
   */
  showDiceFromNextRoll: (diceValues: number[]) => void;
}

/**
 * Hook برای دریافت و نمایش تاس فقط از backend
 * 
 * این hook تضمین می‌کنه که:
 * - هیچ تاس تصادفی generate نمیشه
 * - فقط از backend خونده میشه
 * - همون اعداد backend نمایش داده میشه
 */
export function useBackendDiceOnly({
  backendGameId,
  diceRollerRef,
  setIsRolling,
  setIsWaitingForBackend,
}: UseBackendDiceOnlyProps): UseBackendDiceOnlyReturn {
  
  /**
   * دریافت تاس از backend و نمایش
   */
  const rollDiceFromBackend = useCallback(async (): Promise<number[] | null> => {
    if (!backendGameId) {
      console.error('❌ No backend game ID');
      return null;
    }

    if (!diceRollerRef.current) {
      console.error('❌ Dice roller not ready');
      return null;
    }

    try {
      console.log('🎲 [BackendDiceOnly] Fetching dice from backend...');
      
      setIsWaitingForBackend(true);
      const diceResponse = await gamePersistenceAPI.rollDice(backendGameId);
      setIsWaitingForBackend(false);

      console.log('✅ [BackendDiceOnly] Got dice from backend:', diceResponse.dice);

      // ✅ نمایش مستقیم اعداد backend (بدون animation تصادفی)
      if (diceRollerRef.current.setDiceValues) {
        setIsRolling(true);
        diceRollerRef.current.setDiceValues(diceResponse.dice);
      }

      return diceResponse.dice;
    } catch (error) {
      console.error('❌ [BackendDiceOnly] Failed to get dice from backend:', error);
      setIsWaitingForBackend(false);
      return null;
    }
  }, [backendGameId, diceRollerRef, setIsRolling, setIsWaitingForBackend]);

  /**
   * نمایش تاس از nextRoll (بدون API call)
   */
  const showDiceFromNextRoll = useCallback((diceValues: number[]) => {
    if (!diceRollerRef.current) {
      console.error('❌ Dice roller not ready');
      return;
    }

    console.log('🎲 [BackendDiceOnly] Showing dice from nextRoll:', diceValues);

    // ✅ نمایش مستقیم اعداد nextRoll (بدون animation تصادفی)
    if (diceRollerRef.current.setDiceValues) {
      setIsRolling(true);
      diceRollerRef.current.setDiceValues(diceValues);
    }
  }, [diceRollerRef, setIsRolling]);

  return {
    rollDiceFromBackend,
    showDiceFromNextRoll,
  };
}
