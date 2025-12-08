/**
 * ⛔ LOCKED - Player Cards Component
 * 
 * Displays both player cards (opponent + human)
 * - Opponent card (top)
 * - Human card (bottom)
 * - Animations with framer-motion
 */

'use client';

import { Box } from '@mui/material';
import { m } from 'framer-motion';
import { PlayerCard } from 'src/sections/game/player-card';
import type { GameState, Player } from 'src/types/game';
import { _mock } from 'src/_mock';

interface PlayerCardsProps {
  playerColor: 'white' | 'black';
  aiPlayerColor: 'white' | 'black';
  scores: { white: number; black: number };
  gameState: GameState;
  winner: 'white' | 'black' | null;
  canRoll: boolean;
  canDone: boolean;
  canUndo: boolean;
  whiteTimerSeconds: number;
  blackTimerSeconds: number;
  isAIThinking: boolean;
  aiDifficulty: string;
  onRollDice: () => void;
  onDone: () => void;
  onUndo: () => void;
}

export function PlayerCards({
  playerColor,
  aiPlayerColor,
  scores,
  gameState,
  winner,
  canRoll,
  canDone,
  canUndo,
  whiteTimerSeconds,
  blackTimerSeconds,
  isAIThinking,
  aiDifficulty,
  onRollDice,
  onDone,
  onUndo,
}: PlayerCardsProps) {
  
  return (
    <>
      {/* Opponent Card (Top) */}
      <Box 
        component={m.div}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: 0.2,
          ease: "easeOut" 
        }}
        sx={{ mb: 2 }}
      >
        <PlayerCard
          name="AI Opponent"
          country={`AI - ${aiDifficulty}`}
          avatarUrl={_mock.image.avatar(1)}
          checkerColor={playerColor === 'white' ? 'black' : 'white'}
          setsWon={playerColor === 'white' ? scores.black : scores.white}
          isActive={
            (gameState.gamePhase === 'opening' && 
             gameState.openingRoll.white !== null && 
             gameState.openingRoll.black === null) ||
            (gameState.currentPlayer === (playerColor === 'white' ? 'black' : 'white') && 
             gameState.gamePhase !== 'opening')
          }
          canRoll={false}
          onRollDice={onRollDice}
          onDone={onDone}
          canDone={false}
          onUndo={onUndo}
          canUndo={false}
          timeRemaining={playerColor === 'white' ? blackTimerSeconds : whiteTimerSeconds}
          isWinner={winner === (playerColor === 'white' ? 'black' : 'white')}
          isLoser={winner === playerColor}
        />
        {isAIThinking && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              p: 2,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            AI is thinking...
          </Box>
        )}
      </Box>

      {/* Human Card (Bottom) */}
      <Box
        component={m.div}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: 0.2,
          ease: "easeOut" 
        }}
      >
        <PlayerCard
          name="You"
          country="Iran"
          avatarUrl={_mock.image.avatar(0)}
          checkerColor={playerColor || 'white'}
          setsWon={playerColor === 'white' ? scores.white : scores.black}
          isActive={
            (gameState.gamePhase === 'opening' && gameState.openingRoll.white === null) ||
            (gameState.currentPlayer === playerColor && gameState.gamePhase !== 'opening')
          }
          canRoll={canRoll}
          onRollDice={onRollDice}
          onDone={onDone}
          canDone={canDone}
          onUndo={onUndo}
          canUndo={canUndo}
          timeRemaining={playerColor === 'white' ? whiteTimerSeconds : blackTimerSeconds}
          isWinner={winner === playerColor}
          isLoser={winner !== null && winner !== playerColor}
        />
      </Box>
    </>
  );
}
