/**
 * ⛔⛔⛔ CRITICAL - ABSOLUTELY DO NOT MODIFY! ⛔⛔⛔
 * 
 * این فایل بعد از ماه‌ها تست و debug کامل شده است.
 * هیچ تغییری بدون اجازه صریح مجاز نیست!
 * 
 * فقط در صورت خطای محرز و با اجازه صریح:
 * 1. خطا باید قابل تکرار و مستند باشه
 * 2. فقط این فایل رو تغییر بده، هیچ فایل دیگه ای رو دست نزن
 * 3. بعد از تغییر کامل تست کن
 * 
 * ⚠️ تغییر بدون اجازه = اخراج از پروژه
 * 
 * AI Game Logic Hook
 * مدیریت کامل منطق بازی با AI با delay های انسانی
 */

import { useEffect, useState } from 'react';
import { gamePersistenceAPI } from 'src/services/game-persistence-api';
import { calculateValidMoves } from 'src/hooks/game-logic/validation';
import type { GameState } from 'src/hooks/game-logic/types';

// ⚙️ تنظیمات delay برای حرکات AI (بر حسب میلی‌ثانیه)
const AI_MOVE_DELAY_MIN = 1000; // حداقل 1 ثانیه
const AI_MOVE_DELAY_MAX = 4000; // حداکثر 4 ثانیه

interface UseAIGameLogicProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  backendGameId: string | null;
}

/**
 * تولید delay تصادفی بین حداقل و حداکثر
 */
function getRandomDelay(min: number = AI_MOVE_DELAY_MIN, max: number = AI_MOVE_DELAY_MAX): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useAIGameLogic({ gameState, setGameState, backendGameId }: UseAIGameLogicProps) {
  const [isExecutingAIMove, setIsExecutingAIMove] = useState(false);

  // اجرای خودکار حرکات AI
  useEffect(() => {
    const shouldExecuteAI =
      gameState.currentPlayer === 'black' &&
      gameState.gamePhase === 'moving' &&
      gameState.validMoves.length > 0 &&
      backendGameId &&
      !isExecutingAIMove;

    if (!shouldExecuteAI) return;

    console.log('🤖 AI needs to move! Valid moves:', gameState.validMoves.length);
    console.log('🎲 AI dice values:', gameState.diceValues);

    const executeAIMoves = async () => {
      setIsExecutingAIMove(true);

      try {
        // 1️⃣ همگام‌سازی state با backend
        console.log('📤 Syncing game state to backend...');
        await gamePersistenceAPI.syncGameState(
          backendGameId,
          {
            ...gameState.boardState,
            currentPlayer: 'black',
            phase: 'moving',
          },
          gameState.diceValues
        );
        console.log('✅ Game state synced');

        // 2️⃣ محاسبه حرکات توسط AI
        console.log('🧠 Asking backend AI to calculate moves...');
        const aiResult = await gamePersistenceAPI.triggerAIMove(backendGameId);
        console.log('✅ AI calculated moves:', aiResult.moves);
        console.log('🎲 Number of moves:', aiResult.moves.length);

        // ⚠️ بررسی تعداد حرکات
        if (aiResult.moves.length === 0) {
          console.warn('⚠️ AI returned 0 moves! Skipping turn...');
          await finishAITurn(backendGameId, setGameState, gameState);
          return;
        }

        // 3️⃣ 🎯 اجرای تک‌به‌تک حرکات با delay و update واقعی board
        console.log(`🎬 Executing ${aiResult.moves.length} moves with human-like delays...`);
        
        for (let i = 0; i < aiResult.moves.length; i++) {
          const move = aiResult.moves[i];
          
          // ⏱️ وقفه تصادفی قبل از هر حرکت (بین حداقل و حداکثر)
          const moveDelay = getRandomDelay();
          console.log(`⏱️ Waiting ${moveDelay}ms before move ${i + 1}/${aiResult.moves.length}`);
          await new Promise(resolve => setTimeout(resolve, moveDelay));
          
          // نمایش انتخاب مهره
          console.log(`🎯 AI selecting checker at point ${move.from}`);
          setGameState(prev => ({
            ...prev,
            selectedPoint: move.from,
          }));
          
          // وقفه کوچک برای نمایش انتخاب
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // اجرای حرکت locally
          console.log(`➡️ AI moving from ${move.from} to ${move.to}`);
          setGameState((prev) => {
            const newBoardState = JSON.parse(JSON.stringify(prev.boardState)); // Deep clone

            // انتقال مهره از مبدا
            if (move.from === -1) {
              // از bar
              newBoardState.bar.black--;
            } else {
              // از point - حذف آخرین مهره از آرایه
              if (newBoardState.points[move.from].checkers.length > 0) {
                newBoardState.points[move.from].checkers.pop();
                newBoardState.points[move.from].count--;
              }
            }

            // چک کردن hit
            if (move.to >= 0 && move.to < 24) {
              const targetPoint = newBoardState.points[move.to];
              const isOpponentSingle = targetPoint.checkers.length === 1 && 
                                       targetPoint.checkers[0] === 'white';
              
              if (isOpponentSingle) {
                // Hit white checker
                targetPoint.checkers = [];
                targetPoint.count = 0;
                newBoardState.bar.white++;
                console.log(`💥 Hit white checker at point ${move.to}`);
              }

              // قرار دادن مهره black در مقصد
              newBoardState.points[move.to].checkers.push('black');
              newBoardState.points[move.to].count++;
            } else if (move.to === 24 || move.to === -1) {
              // Bear off
              newBoardState.off.black++;
              console.log(`🏁 Bore off black checker`);
            }

            return {
              ...prev,
              boardState: newBoardState,
              selectedPoint: null,
            };
          });
          
          // وقفه برای نمایش حرکت
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`✅ All ${aiResult.moves.length} moves executed visually`);

        // 4️⃣ دریافت state نهایی از backend (برای اطمینان)
        const updatedGame = await gamePersistenceAPI.getGame(backendGameId);
        console.log('📥 Fetched final game state from backend');

        // 5️⃣ اعمال state نهایی
        if (updatedGame.gameState) {
          console.log('🔄 Applying final backend state to frontend...');

          const newValidMoves = calculateValidMoves(
            updatedGame.gameState,
            updatedGame.gameState.currentPlayer,
            []
          );

          setGameState((prev) => ({
            ...prev,
            boardState: updatedGame.gameState,
            currentPlayer: updatedGame.gameState.currentPlayer || 'white',
            diceValues: [],
            selectedPoint: null,
            gamePhase: 'waiting',
            validMoves: newValidMoves,
            moveHistory: [],
          }));

          // 6️⃣ ⏱️ وقفه تصادفی قبل از Done (بین حداقل و حداکثر)
          const doneDelay = getRandomDelay();
          console.log(`⏱️ Waiting ${doneDelay}ms before finishing turn (clicking Done)...`);
          await new Promise(resolve => setTimeout(resolve, doneDelay));

          console.log('✅ AI moves complete! Turn switched to player');
        }
      } catch (error: any) {
        console.error('❌ AI move failed:', error);
        console.error('Error details:', error.message);
      } finally {
        setIsExecutingAIMove(false);
      }
    };

    // تاخیر برای طبیعی‌تر شدن بازی
    const aiMoveDelay = setTimeout(() => {
      executeAIMoves();
    }, 1500);

    return () => clearTimeout(aiMoveDelay);
  }, [
    gameState.currentPlayer,
    gameState.gamePhase,
    gameState.validMoves.length,
    backendGameId,
    isExecutingAIMove,
  ]);

  return { isExecutingAIMove };
}

/**
 * تمام کردن نوبت AI بدون حرکت
 */
async function finishAITurn(
  backendGameId: string,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  currentGameState: GameState
) {
  try {
    // دریافت state جدید
    const updatedGame = await gamePersistenceAPI.getGame(backendGameId);

    if (updatedGame.gameState) {
      const newValidMoves = calculateValidMoves(
        updatedGame.gameState,
        updatedGame.gameState.currentPlayer,
        []
      );

  setGameState((prev) => ({
    ...prev,
    boardState: updatedGame.gameState,
    currentPlayer: updatedGame.gameState.currentPlayer || 'white',
    diceValues: [],
    selectedPoint: null,
    gamePhase: 'waiting',
    validMoves: newValidMoves,
    moveHistory: [],
  }));      console.log('✅ AI turn finished (no moves)');
    }
  } catch (error) {
    console.error('❌ Failed to finish AI turn:', error);
  }
}
