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

// ⚠️ AI delay settings - loaded from backend
let AI_MOVE_DELAY_MIN = 1000; // Default: 1 second
let AI_MOVE_DELAY_MAX = 4000; // Default: 4 seconds

interface UseAIGameLogicProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  backendGameId: string | null;
  aiPlayerColor: 'white' | 'black'; // AI player color (not hard-coded!)
  onTurnComplete?: () => void; // ✅ Callback when AI finishes turn
}

/**
 * تولید delay تصادفی بین حداقل و حداکثر
 */
function getRandomDelay(min: number = AI_MOVE_DELAY_MIN, max: number = AI_MOVE_DELAY_MAX): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useAIGameLogic({ gameState, setGameState, backendGameId, aiPlayerColor, onTurnComplete }: UseAIGameLogicProps) {
  const [isExecutingAIMove, setIsExecutingAIMove] = useState(false);

  // Load AI delay settings from backend on mount
  useEffect(() => {
    const loadAIDelays = async () => {
      try {
        const delays = await gamePersistenceAPI.getAIMoveDelays();
        AI_MOVE_DELAY_MIN = delays.min;
        AI_MOVE_DELAY_MAX = delays.max;
        console.log('⚙️ AI delays loaded:', delays);
      } catch (error) {
        console.warn('⚠️ Failed to load AI delays, using defaults');
      }
    };
    loadAIDelays();
  }, []);

  // اجرای خودکار حرکات AI
  useEffect(() => {
    console.log('🔍 AI Logic Check:', {
      currentPlayer: gameState.currentPlayer,
      aiPlayerColor,
      gamePhase: gameState.gamePhase,
      validMovesCount: gameState.validMoves.length,
      backendGameId,
      isExecutingAIMove,
    });
    
    const shouldExecuteAI =
      gameState.currentPlayer === aiPlayerColor &&
      gameState.gamePhase === 'moving' &&
      gameState.validMoves.length > 0 &&
      backendGameId &&
      !isExecutingAIMove;

    console.log('🔍 shouldExecuteAI:', shouldExecuteAI);
    
    if (!shouldExecuteAI) return;

    console.log(`🤖 AI (${aiPlayerColor}) needs to move! Valid moves:`, gameState.validMoves.length);
    console.log('🎲 AI dice values:', gameState.diceValues);

    const executeAIMoves = async () => {
      setIsExecutingAIMove(true);

      try {
        // 1️⃣ همگام‌سازی state با backend
        console.log('📤 Syncing game state to backend...');
        console.log('🔍 Current player in gameState:', gameState.currentPlayer);
        console.log('🔍 AI player color:', aiPlayerColor);
        
        // Sync complete game state with updated currentPlayer
        const syncState = {
          points: gameState.boardState.points,
          bar: gameState.boardState.bar,
          off: gameState.boardState.off,
          currentPlayer: aiPlayerColor,
          phase: 'moving',
          aiPlayerColor: aiPlayerColor,
        };
        console.log('🔍 Syncing state currentPlayer:', syncState.currentPlayer);
        
        await gamePersistenceAPI.syncGameState(
          backendGameId,
          syncState,
          gameState.diceValues
        );
        console.log('✅ Game state synced');
        
        // ⏱️ Small delay to ensure database commit completes
        await new Promise(resolve => setTimeout(resolve, 100));

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
          
          // Check if this is a hit move first
          const opponentColor = aiPlayerColor === 'white' ? 'black' : 'white';
          const isHitMove = move.to >= 0 && move.to < 24 && 
                           gameState.boardState.points[move.to].count === 1 && 
                           gameState.boardState.points[move.to].checkers[0] === opponentColor;

          if (isHitMove) {
            // STEP 1: Hit the opponent checker first (triggers hit animation)
            setGameState((prev) => {
              const newPoints = prev.boardState.points.map((point) => ({
                checkers: [...point.checkers],
                count: point.count,
              }));

              // Hit white checker - send to bar
              newPoints[move.to] = {
                checkers: [],
                count: 0,
              };

              const newBar = {
                ...prev.boardState.bar,
                [opponentColor]: prev.boardState.bar[opponentColor] + 1,
              };

              console.log(`💥 Hit ${opponentColor} checker at point ${move.to}`);

              return {
                ...prev,
                boardState: {
                  points: newPoints,
                  bar: newBar,
                  off: { ...prev.boardState.off },
                },
              };
            });

            // Wait for hit animation
            await new Promise(resolve => setTimeout(resolve, 300));

            // STEP 2: Move our checker (triggers move animation)
            setGameState((prev) => {
              const newPoints = prev.boardState.points.map((point) => ({
                checkers: [...point.checkers],
                count: point.count,
              }));

              // Remove from source
              if (move.from === -1) {
                // From bar
              } else {
                // From point
                if (newPoints[move.from].checkers.length > 0) {
                  newPoints[move.from].checkers.pop();
                  newPoints[move.from].count--;
                }
              }

              // Add to destination
              newPoints[move.to].checkers.push(aiPlayerColor);
              newPoints[move.to].count++;

              const newBar = move.from === -1 
                ? { ...prev.boardState.bar, [aiPlayerColor]: prev.boardState.bar[aiPlayerColor] - 1 }
                : { ...prev.boardState.bar };

              return {
                ...prev,
                boardState: {
                  points: newPoints,
                  bar: newBar,
                  off: { ...prev.boardState.off },
                },
                selectedPoint: null,
              };
            });

            await new Promise(resolve => setTimeout(resolve, 200));
          } else {
            // Regular move (no hit)
            setGameState((prev) => {
              const newBoardState = JSON.parse(JSON.stringify(prev.boardState));

              // انتقال مهره از مبدا
              if (move.from === -1) {
                newBoardState.bar[aiPlayerColor]--;
              } else {
                if (newBoardState.points[move.from].checkers.length > 0) {
                  newBoardState.points[move.from].checkers.pop();
                  newBoardState.points[move.from].count--;
                }
              }

              // قرار دادن مهره در مقصد
              if (move.to >= 0 && move.to < 24) {
                newBoardState.points[move.to].checkers.push(aiPlayerColor);
                newBoardState.points[move.to].count++;
              } else if (move.to === 24 || move.to === -1) {
                newBoardState.off[aiPlayerColor]++;
                console.log(`🏁 Bore off ${aiPlayerColor} checker`);
              }

              return {
                ...prev,
                boardState: newBoardState,
                selectedPoint: null,
              };
            });

            await new Promise(resolve => setTimeout(resolve, 300));
          }
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
          
          // ✅ Call timer switch callback
          if (onTurnComplete) {
            console.log('⏱️ Calling onTurnComplete to switch timers');
            onTurnComplete();
          }
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
