/**
 * ⛔⛔⛔ CRITICAL - DO NOT MODIFY THIS FILE! ⛔⛔⛔
 * 
 * 🎲 AI Auto-Roll Hook
 * ماژول مستقل برای مدیریت تاس خوردن خودکار AI
 * 
 * این hook تشخیص می‌دهد کی نوبت AI است و خودکار تاس می‌زند
 * رفتار یکسان برای هر دو رنگ (white/black)
 * 
 * ✅ فقط از backend می‌خونه - هیچ تاس تصادفی generate نمیشه
 * 
 * 🔒 LOCKED AFTER SUCCESSFUL TESTING - December 6, 2025
 * ⚠️ تغییر بدون اجازه = اخراج از پروژه
 */

import { useEffect, useRef } from 'react';
import type { GameState } from 'src/hooks/game-logic/types';
import { useBackendDiceOnly } from './useBackendDiceOnly';

interface UseAIAutoRollProps {
  gameState: GameState;
  aiPlayerColor: 'white' | 'black';
  isRolling: boolean;
  isWaitingForBackend: boolean;
  isExecutingAIMove: boolean;
  backendGameId: string | null;
  diceRollerRef: React.RefObject<any>;
  setIsRolling: (value: boolean) => void;
  setIsWaitingForBackend: (value: boolean) => void;
}

/**
 * Hook برای تاس خوردن خودکار AI
 * 
 * شرایط اجرا:
 * 1. نوبت فعلی باید AI باشه (currentPlayer === aiPlayerColor)
 * 2. فاز بازی باید 'waiting' باشه (نه opening)
 * 3. در حال تاس خوردن نباشه
 * 4. منتظر backend نباشه
 * 5. در حال اجرای حرکت AI نباشه
 * 6. تاس‌های AI در nextRoll موجود باشه
 */
export function useAIAutoRoll({
  gameState,
  aiPlayerColor,
  isRolling,
  isWaitingForBackend,
  isExecutingAIMove,
  backendGameId,
  diceRollerRef,
  setIsRolling,
  setIsWaitingForBackend,
}: UseAIAutoRollProps) {
  const autoRollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRolledRef = useRef(false); // ✅ Track if AI already rolled for current turn

  // ✅ استفاده از hook ماژولار برای دریافت تاس فقط از backend
  const { rollDiceFromBackend } = useBackendDiceOnly({
    backendGameId,
    diceRollerRef,
    setIsRolling,
    setIsWaitingForBackend,
  });

  useEffect(() => {
    // پاک کردن timeout قبلی
    if (autoRollTimeoutRef.current) {
      clearTimeout(autoRollTimeoutRef.current);
      autoRollTimeoutRef.current = null;
    }

    // ✅ شرط 1: فقط اگر نوبت AI است
    if (gameState.currentPlayer !== aiPlayerColor) {
      console.log('⛔ AI Auto-roll: Not AI turn', {
        currentPlayer: gameState.currentPlayer,
        aiPlayerColor,
      });
      hasRolledRef.current = false; // ✅ Reset when turn changes
      return;
    }

    // ✅ شرط 2: فقط در فاز waiting (نه opening)
    if (gameState.gamePhase !== 'waiting') {
      console.log('⛔ AI Auto-roll: Not in waiting phase', {
        phase: gameState.gamePhase,
      });
      hasRolledRef.current = false; // ✅ Reset when phase changes
      return;
    }

    // ✅ شرط 3-5: بررسی وضعیت‌های مانع
    if (isRolling || isWaitingForBackend || isExecutingAIMove) {
      console.log('⛔ AI Auto-roll: Blocked by state', {
        isRolling,
        isWaitingForBackend,
        isExecutingAIMove,
      });
      return;
    }

    // ✅ جلوگیری از roll مجدد در همان turn
    if (hasRolledRef.current) {
      console.log('⛔ AI Auto-roll: Already rolled for this turn');
      return;
    }

    // ✅ شرط 6: بررسی وجود تاس در nextRoll
    const aiDiceFromBackend = gameState.nextRoll?.[aiPlayerColor];
    if (!aiDiceFromBackend || !Array.isArray(aiDiceFromBackend) || aiDiceFromBackend.length === 0) {
      console.log('⛔ AI Auto-roll: No dice in nextRoll', {
        aiPlayerColor,
        nextRoll: gameState.nextRoll,
        hasNextRoll: !!gameState.nextRoll,
        aiDice: aiDiceFromBackend,
      });
      return;
    }

    // ✅ شرط 7: بررسی وجود diceRollerRef و آماده بودن آن
    if (!diceRollerRef.current || !diceRollerRef.current.isReady) {
      console.log('⛔ AI Auto-roll: Dice roller not ready', {
        hasRef: !!diceRollerRef.current,
        isReady: diceRollerRef.current?.isReady,
      });
      return;
    }

    // ✅ شرط 8: بررسی وجود backendGameId
    if (!backendGameId) {
      console.log('⛔ AI Auto-roll: No backend game ID');
      return;
    }

    console.log('✅ AI Auto-roll: All conditions met - scheduling roll', {
      aiPlayerColor,
      dice: aiDiceFromBackend,
    });

    // ✅ فوری شروع (بدون delay اضافه - ستینگ سیستم سرعت AI را کنترل می‌کند)
    autoRollTimeoutRef.current = setTimeout(async () => {
      // ✅ چک مجدد قبل از اجرا (ممکنه state تغییر کرده باشه)
      if (isRolling || isWaitingForBackend || isExecutingAIMove) {
        console.log('⛔ AI roll cancelled - state changed during timeout');
        return;
      }

      if (gameState.currentPlayer !== aiPlayerColor) {
        console.log('⛔ AI roll cancelled - not AI turn anymore');
        return;
      }

      try {
        // ✅ علامت‌گذاری که roll انجام شد
        hasRolledRef.current = true;
        
        // ✅ پاک کردن تاس‌های قبلی
        if (diceRollerRef.current?.clearDice) {
          diceRollerRef.current.clearDice();
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // ✅ دریافت تاس از backend با استفاده از hook ماژولار
        console.log('🤖 [AI Auto-roll] Getting dice from backend...');
        await rollDiceFromBackend();
        
      } catch (error) {
        console.error('❌ AI failed to get dice from backend:', error);
        setIsWaitingForBackend(false);
        hasRolledRef.current = false; // ✅ Reset on error so it can retry
      }
    }, 100);

    // Cleanup
    return () => {
      if (autoRollTimeoutRef.current) {
        clearTimeout(autoRollTimeoutRef.current);
        autoRollTimeoutRef.current = null;
      }
    };
  }, [
    gameState.gamePhase,
    gameState.currentPlayer,
    // ❌ REMOVED: gameState.nextRoll
    // این باعث می‌شد هر بار که nextRoll update بشه، useEffect دوباره trigger بشه
    // و AI 2 بار roll کنه! حالا از hasRolledRef استفاده می‌کنیم.
    aiPlayerColor,
    isRolling,
    isWaitingForBackend,
    isExecutingAIMove,
    backendGameId,
    // ❌ REMOVED: diceRollerRef.current?.isReady
    // این هم باعث unnecessary re-renders می‌شد
    rollDiceFromBackend,
  ]);
}
