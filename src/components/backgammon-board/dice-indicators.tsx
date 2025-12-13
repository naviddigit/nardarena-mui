'use client';

import { memo } from 'react';
import type { BoxProps } from '@mui/material/Box';

import { m, AnimatePresence } from 'framer-motion';

import Box from '@mui/material/Box';

import { varAlpha } from 'src/theme/styles';

import { MOVE_INDICATORS_CONFIG } from 'src/config/board-dimensions.config';

// ----------------------------------------------------------------------

/**
 * Render dots for dice face (1-6)
 */
function renderDiceDots(value: number, size: number): JSX.Element[] {
  const dotSize = size * 0.2;
  const positions: Record<number, Array<{ x: number; y: number }>> = {
    1: [{ x: 50, y: 50 }],
    2: [
      { x: 30, y: 30 },
      { x: 70, y: 70 },
    ],
    3: [
      { x: 30, y: 30 },
      { x: 50, y: 50 },
      { x: 70, y: 70 },
    ],
    4: [
      { x: 30, y: 30 },
      { x: 70, y: 30 },
      { x: 30, y: 70 },
      { x: 70, y: 70 },
    ],
    5: [
      { x: 30, y: 30 },
      { x: 70, y: 30 },
      { x: 50, y: 50 },
      { x: 30, y: 70 },
      { x: 70, y: 70 },
    ],
    6: [
      { x: 30, y: 25 },
      { x: 70, y: 25 },
      { x: 30, y: 50 },
      { x: 70, y: 50 },
      { x: 30, y: 75 },
      { x: 70, y: 75 },
    ],
  };

  return positions[value]?.map((pos, idx) => (
    <Box
      key={idx}
      sx={{
        position: 'absolute',
        width: dotSize,
        height: dotSize,
        borderRadius: '50%',
        bgcolor: 'common.white',
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
        boxShadow: (theme) =>
          `inset 0 1px 2px ${varAlpha(theme.vars.palette.common.blackChannel, 0.15)}`,
      }}
    />
  ));
}

// ----------------------------------------------------------------------

type DiceIndicatorsProps = {
  availableDice: Array<{ die: number; to: number }>;
  size: number;
  checkerSize: number;
  isVisible: boolean;
  isTopPoint?: boolean;
  isRotated?: boolean;
  onDiceClick?: (die: number, to: number) => void;
};

// ----------------------------------------------------------------------

/**
 * Renders clickable dice indicators next to a selected checker
 * Shows available move options for that checker
 */
export const DiceIndicators = memo<DiceIndicatorsProps>(function DiceIndicators({
  availableDice,
  size,
  checkerSize,
  isVisible,
  isTopPoint,
  isRotated,
  onDiceClick,
}) {
  if (!isVisible || availableDice.length === 0) return null;

  const distanceTop = MOVE_INDICATORS_CONFIG.diceIndicators.distanceTop;
  const distanceBottom = MOVE_INDICATORS_CONFIG.diceIndicators.distanceBottom;
  const spacing = MOVE_INDICATORS_CONFIG.diceIndicators.horizontalSpacing;

  // For top points: south-west and south-east (تاس‌ها پایین میفتن)
  // For bottom points: north-west and north-east (تاس‌ها بالا میفتن)
  const dicePositions = isTopPoint
    ? [
        { x: -spacing, y: distanceTop }, // South-west (جنوب غربی)
        { x: spacing, y: distanceTop }, // South-east (جنوب شرقی)
      ]
    : [
        { x: -spacing, y: -distanceBottom }, // North-west (شمال غربی)
        { x: spacing, y: -distanceBottom }, // North-east (شمال شرقی)
      ];

  return (
    <AnimatePresence>
      {availableDice.map((dice, index) => {
        const position = dicePositions[index];
        if (!position) return null;

        // محاسبه Y همون قبلی
        const offsetY = position.y * (checkerSize * 0.5);

        return (
          <Box
            key={`${dice.die}-${dice.to}`}
            component={m.div}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onDiceClick?.(dice.die, dice.to);
            }}
            sx={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: '15px',
              background: (theme) =>
                `linear-gradient(145deg, ${theme.vars.palette.primary.main}, ${theme.vars.palette.primary.dark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 150,
              pointerEvents: 'auto',
              // تاس چپ: از left محاسبه می‌شه
              ...(index === 0 && {
                left: `calc(45% - ${size}px)`,
              }),
              // تاس راست: از right محاسبه می‌شه
              ...(index === 1 && {
                right: `calc(45% - ${size}px)`,
              }),
              top: `calc(50% + ${offsetY}px)`,
              transform: `translate(-50%, -50%) rotate(${isRotated ? 180 : 0}deg)`,
              boxShadow: (theme) =>
                `0 4px 8px ${varAlpha(theme.vars.palette.common.blackChannel, 0.25)}, 0 2px 4px ${varAlpha(theme.vars.palette.common.blackChannel, 0.15)}`,
              '&:hover': {
                filter: 'brightness(1.1)',
                transform: `translate(-50%, -50%) rotate(${isRotated ? 180 : 0}deg) scale(1.05)`,
                boxShadow: (theme) =>
                  `0 6px 12px ${varAlpha(theme.vars.palette.common.blackChannel, 0.35)}`,
              },
              '&:active': {
                transform: `translate(-50%, -50%) rotate(${isRotated ? 180 : 0}deg) scale(0.95)`,
              },
            }}
          >
            {/* Dice dots */}
            {renderDiceDots(dice.die, size)}
          </Box>
        );
      })}
    </AnimatePresence>
  );
});
