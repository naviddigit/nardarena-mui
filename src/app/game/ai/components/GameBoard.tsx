/**
 * ⛔ LOCKED - Game Board Component
 * 
 * Wraps BackgammonBoard with DiceRoller integration
 * - Board rendering
 * - Dice positioning
 * - Board rotation for black player
 */

'use client';

import { useRef } from 'react';
import { Box } from '@mui/material';
import BackgammonBoard from 'src/sections/game/backgammon-board';
import DiceRoller from 'src/sections/game/DiceRoller';
import type { GameState } from 'src/types/game';

interface GameBoardProps {
  gameState: GameState;
  playerColor: 'white' | 'black';
  boardPosition: any;
  setBoardPosition: (pos: any) => void;
  onCheckerMove: (from: number, to: number) => void;
  isDiceVisible: boolean;
  rollingDice: boolean;
  setRollingDice: (rolling: boolean) => void;
}

export function GameBoard({
  gameState,
  playerColor,
  boardPosition,
  setBoardPosition,
  onCheckerMove,
  isDiceVisible,
  rollingDice,
  setRollingDice,
}: GameBoardProps) {
  
  const boardContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      ref={boardContainerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <BackgammonBoard
        boardPosition={boardPosition}
        setBoardPosition={setBoardPosition}
        onCheckerMove={onCheckerMove}
        validMoves={gameState.validMoves}
        currentPlayer={gameState.currentPlayer}
        dice={gameState.dice}
        playerColor={playerColor}
        bearingOffWhite={gameState.bearingOffWhite}
        bearingOffBlack={gameState.bearingOffBlack}
        gamePhase={gameState.gamePhase}
        openingRoll={gameState.openingRoll}
        rotateBoard={playerColor === 'black'}
      />

      {isDiceVisible && (
        <DiceRoller
          dice={gameState.dice}
          isRolling={rollingDice}
          setIsRolling={setRollingDice}
          boardContainerRef={boardContainerRef}
          rotateBoard={playerColor === 'black'}
        />
      )}
    </Box>
  );
}
