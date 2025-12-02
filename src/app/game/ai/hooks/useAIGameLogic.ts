/**
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

        // 3️⃣ 🎯 اجرای تک‌به‌تک حرکات با delay (مثل انسان!)
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
          
          // اجرای حرکت
          console.log(`➡️ AI moving from ${move.from} to ${move.to}`);
          
          // وقفه برای نمایش حرکت
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // پاک کردن انتخاب
          setGameState(prev => ({
            ...prev,
            selectedPoint: null,
          }));
        }

        // 4️⃣ دریافت state نهایی از backend (همه حرکات اعمال شده)
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

          setGameState({
            boardState: updatedGame.gameState,
            currentPlayer: updatedGame.gameState.currentPlayer || 'white',
            diceValues: [],
            selectedPoint: null,
            gamePhase: 'waiting',
            validMoves: newValidMoves,
            moveHistory: [],
            openingRoll: gameState.openingRoll,
          });

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

      setGameState({
        boardState: updatedGame.gameState,
        currentPlayer: updatedGame.gameState.currentPlayer || 'white',
        diceValues: [],
        selectedPoint: null,
        gamePhase: 'waiting',
        validMoves: newValidMoves,
        moveHistory: [],
        openingRoll: currentGameState.openingRoll,
      });

      console.log('✅ AI turn finished (no moves)');
    }
  } catch (error) {
    console.error('❌ Failed to finish AI turn:', error);
  }
}
