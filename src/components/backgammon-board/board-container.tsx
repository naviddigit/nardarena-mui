'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

import { varAlpha } from 'src/theme/styles';

import { Checker } from './checker';
import { SplashScreen } from '../loading-screen';
import { PointTriangle } from './point-triangle';

import type { BackgammonBoardProps } from './types';

// ----------------------------------------------------------------------

const BOARD_RATIO = 1.25;

// ⚙️ CONTROL PANEL - تنظیمات مرکزی (فقط اینجا تغییر بده!)
const SCALE_CONFIG = {
  // عرض جایگاه‌ها (Point Width Scale)
  pointWidth: {
    desktop: 0.9,    // 100% = عادی | مثال: 1.2 = 20% بزرگتر | 0.8 = 20% کوچکتر
    mobile: 0.85,    // نسبت به desktop
  },
  // اندازه مهره‌ها (Checker Size Scale)
  checkerSize: {
    desktop: 0.9,   // نسبت به pointWidth | 0.85 = 85% عرض جایگاه
    mobile: 0.9,     // نسبت به pointWidth
  },
  // فاصله بین مهره‌ها (Stack Spacing)
  stackSpacing: {
    desktop: 0.9,    // نسبت به pointWidth
    mobile: 0.9,     // نسبت به pointWidth
  },
  // مهره‌های bar
  barChecker: {
    desktop: 0.7,    // نسبت به pointWidth
    mobile: 0.6,    // نسبت به pointWidth
  },
  // عرض bar وسطی (10% کوچک‌تر از pointWidth)
  barWidth: 0.9,
  // ارتفاع مثلث‌ها (Triangle Height)
  // triangleHeight: 240, // px - ارتفاع ثابت مثلث‌ها
};

// ----------------------------------------------------------------------

export function BackgammonBoard({
  boardState,
  onPointClick,
  onBarClick,
  selectedPoint,
  validDestinations = [],
  diceRoller,
  dicePosition = { top: 20, right: 20 },
  isRolling = false,
}: BackgammonBoardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Refs for stable ID tracking
  const idsRef = useRef<{
    points: string[][],
    bar: { white: string[], black: string[] },
    off: { white: string[], black: string[] }
  }>({
    points: Array.from({ length: 24 }, () => []),
    bar: { white: [], black: [] },
    off: { white: [], black: [] }
  });
  
  const prevBoardStateRef = useRef(boardState);

  // Generate stable IDs for checkers to enable smooth transitions
  const checkerIds = useMemo(() => {
    const prevIds = idsRef.current;
    const prevState = prevBoardStateRef.current;
    const nextState = boardState;
    
    // If state hasn't changed structurally, return previous IDs to prevent re-renders
    if (JSON.stringify(prevState) === JSON.stringify(nextState)) {
      return prevIds;
    }
    
    // Deep clone to avoid mutation
    const newIds = JSON.parse(JSON.stringify(prevIds));
    
    // Use deterministic ID generation based on initial position if possible, or random if needed
    const generateId = (player: string) => `${player}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Check if it's the first initialization (empty IDs)
    const isInitialized = newIds.points.some((p: any[]) => p.length > 0) || 
                          newIds.bar.white.length > 0 || 
                          newIds.bar.black.length > 0;

    if (!isInitialized) {
      // Initial population
      for (let i = 0; i < 24; i++) {
        const point = nextState.points[i];
        for (let j = 0; j < point.count; j++) {
          newIds.points[i].push(generateId(point.checkers[j]));
        }
      }
      for (let i = 0; i < nextState.bar.white; i++) newIds.bar.white.push(generateId('white'));
      for (let i = 0; i < nextState.bar.black; i++) newIds.bar.black.push(generateId('black'));
      for (let i = 0; i < nextState.off.white; i++) newIds.off.white.push(generateId('white'));
      for (let i = 0; i < nextState.off.black; i++) newIds.off.black.push(generateId('black'));
    } else {
      // Diff and update
      const pool: { id: string, player: string }[] = [];

      // 1. Collect removed checkers (Source)
      // Points
      for (let i = 0; i < 24; i++) {
        const diff = prevState.points[i].count - nextState.points[i].count;
        if (diff > 0) {
          const player = prevState.points[i].checkers[0];
          for (let k = 0; k < diff; k++) {
            const id = newIds.points[i].pop();
            if (id) pool.push({ id, player });
          }
        }
      }
      // Bar
      if (prevState.bar.white > nextState.bar.white) {
        for (let k = 0; k < prevState.bar.white - nextState.bar.white; k++) {
          const id = newIds.bar.white.pop();
          if (id) pool.push({ id, player: 'white' });
        }
      }
      if (prevState.bar.black > nextState.bar.black) {
        for (let k = 0; k < prevState.bar.black - nextState.bar.black; k++) {
          const id = newIds.bar.black.pop();
          if (id) pool.push({ id, player: 'black' });
        }
      }

      // 2. Distribute to added checkers (Destination)
      // Points
      for (let i = 0; i < 24; i++) {
        const diff = nextState.points[i].count - prevState.points[i].count;
        if (diff > 0) {
          const player = nextState.points[i].checkers[0];
          for (let k = 0; k < diff; k++) {
            const poolIndex = pool.findIndex(c => c.player === player);
            let id;
            if (poolIndex !== -1) {
              id = pool[poolIndex].id;
              pool.splice(poolIndex, 1);
            } else {
              id = generateId(player);
            }
            newIds.points[i].push(id);
          }
        }
      }
      // Bar (e.g. hit)
      if (nextState.bar.white > prevState.bar.white) {
        for (let k = 0; k < nextState.bar.white - prevState.bar.white; k++) {
          const poolIndex = pool.findIndex(c => c.player === 'white');
          let id;
          if (poolIndex !== -1) {
            id = pool[poolIndex].id;
            pool.splice(poolIndex, 1);
          } else {
            id = generateId('white');
          }
          newIds.bar.white.push(id);
        }
      }
      if (nextState.bar.black > prevState.bar.black) {
        for (let k = 0; k < nextState.bar.black - prevState.bar.black; k++) {
          const poolIndex = pool.findIndex(c => c.player === 'black');
          let id;
          if (poolIndex !== -1) {
            id = pool[poolIndex].id;
            pool.splice(poolIndex, 1);
          } else {
            id = generateId('black');
          }
          newIds.bar.black.push(id);
        }
      }
      // Off
      if (nextState.off.white > prevState.off.white) {
        for (let k = 0; k < nextState.off.white - prevState.off.white; k++) {
          const poolIndex = pool.findIndex(c => c.player === 'white');
          let id;
          if (poolIndex !== -1) {
            id = pool[poolIndex].id;
            pool.splice(poolIndex, 1);
          } else {
            id = generateId('white');
          }
          newIds.off.white.push(id);
        }
      }
      if (nextState.off.black > prevState.off.black) {
        for (let k = 0; k < nextState.off.black - prevState.off.black; k++) {
          const poolIndex = pool.findIndex(c => c.player === 'black');
          let id;
          if (poolIndex !== -1) {
            id = pool[poolIndex].id;
            pool.splice(poolIndex, 1);
          } else {
            id = generateId('black');
          }
          newIds.off.black.push(id);
        }
      }
    }

    // Update refs
    idsRef.current = newIds;
    prevBoardStateRef.current = nextState;

    return newIds;
  }, [boardState]);

  // Responsive sizing
  const boardHeight = isSmallMobile ? 450 : isMobile ? 500 : 600;
  const boardWidth = boardHeight * BOARD_RATIO;
  const padding = isSmallMobile ? 8 : isMobile ? 12 : 16;
  const cardPaddingX = 6; // px
  const barMarginX = 8; // px
  
  // استفاده از SCALE_CONFIG برای محاسبه سایزها
  const basePointWidth = (boardWidth - padding * 2) / 16;
  const pointWidthScale = isMobile ? SCALE_CONFIG.pointWidth.mobile : SCALE_CONFIG.pointWidth.desktop;
  const pointWidth = basePointWidth * pointWidthScale;
  const pointHeight = (boardHeight - padding * 2 - 20) / 2;
  const triangleHeight = pointHeight - (pointHeight * 0.2); // ارتفاع مثلث‌ها نسبت به ارتفاع جایگاه‌ها
  
  // Calculate absolute positions for checkers
  const getCheckerPosition = (pointIndex: number | 'bar-white' | 'bar-black' | 'off-white' | 'off-black', stackIndex: number) => {
    const stackSpacing = isMobile ? SCALE_CONFIG.stackSpacing.mobile : SCALE_CONFIG.stackSpacing.desktop;
    const checkerScale = isMobile ? SCALE_CONFIG.checkerSize.mobile : SCALE_CONFIG.checkerSize.desktop;
    const checkerSize = pointWidth * checkerScale;
    const barWidthPx = pointWidth * SCALE_CONFIG.barWidth;

    let x = 0;
    let y = 0;

    // Helper to get X for a point index (0-11 bottom, 12-23 top)
    const getPointX = (idx: number) => {
      // Normalize index to 0-11 (left to right visually)
      // Top: 12->0, 13->1 ... 17->5 | Bar | 18->6 ... 23->11
      // Bottom: 11->0 ... 6->5 | Bar | 5->6 ... 0->11
      
      let visualIndex = 0;
      let isLeftGroup = false;

      if (idx >= 12) { // Top row
        // 12 is leftmost (visual 0)
        visualIndex = idx - 12;
      } else { // Bottom row
        // 11 is leftmost (visual 0)
        visualIndex = 11 - idx;
      }

      isLeftGroup = visualIndex < 6;

      if (isLeftGroup) {
        return cardPaddingX + (visualIndex * pointWidth);
      } else {
        return cardPaddingX + (6 * pointWidth) + (barMarginX * 2) + barWidthPx + ((visualIndex - 6) * pointWidth);
      }
    };

    if (typeof pointIndex === 'number') {
      const isTop = pointIndex >= 12;
      x = getPointX(pointIndex) + (pointWidth - checkerSize) / 2;
      
      const stackOffset = stackIndex * (pointWidth * stackSpacing);
      const maxStack = Math.min(stackOffset, pointHeight - checkerSize);
      
      if (isTop) {
        y = maxStack;
      } else {
        y = (pointHeight * 2) - maxStack - checkerSize;
      }
    } else if (pointIndex === 'bar-white' || pointIndex === 'bar-black') {
      // Bar position
      x = cardPaddingX + (6 * pointWidth) + barMarginX + (barWidthPx - checkerSize) / 2;
      const barStackSpacing = pointWidth * stackSpacing;
      
      if (pointIndex === 'bar-white') {
        // White bar (top)
        y = pointHeight / 2 - (stackIndex * barStackSpacing) - checkerSize;
        // Center vertically in top half roughly? No, usually from middle out or top down
        // Let's stack from center-line outwards
        y = pointHeight - (pointHeight * 0.1) - (stackIndex * barStackSpacing) - checkerSize;
      } else {
        // Black bar (bottom)
        y = pointHeight + (pointHeight * 0.1) + (stackIndex * barStackSpacing);
      }
    } else {
      // Off position
      x = boardWidth - 40; // Approximate
      y = pointHeight;
    }

    return { x, y };
  };

  // Theme-based colors (no hardcoded values)
  const darkPoint = theme.vars.palette.grey[700];
  const lightPoint = theme.vars.palette.grey[500];
  const boardBg = theme.palette.mode === 'light' 
    ? theme.vars.palette.common.white 
    : theme.vars.palette.grey[800];
  const barColor = theme.vars.palette.grey[700];

  const isValidDestination = (pointIndex: number) => validDestinations.includes(pointIndex);

  // Standard backgammon board layout (matching initial setup)
  // Top: 12-23 (left to right)
  // Bottom: 11-0 (left to right)
  const topPoints = Array.from({ length: 12 }, (_, i) => 12 + i);  // [12,13,14,15,16,17,18,19,20,21,22,23]
  const bottomPoints = Array.from({ length: 12 }, (_, i) => 11 - i); // [11,10,9,8,7,6,5,4,3,2,1,0]

  const renderPoint = (pointIndex: number, i: number, isTop: boolean) => {
    const isValid = isValidDestination(pointIndex);
    const isSelected = selectedPoint === pointIndex;

    return (
      <Box
        key={pointIndex}
        onClick={() => onPointClick?.(pointIndex)}
        sx={{
          width: pointWidth,
          height: pointHeight,
          position: 'relative',
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 },
        }}
      >
        <PointTriangle
          color={i % 2 === 0 ? darkPoint : lightPoint}
          direction={isTop ? 'down' : 'up'}
          width={pointWidth}
          height={triangleHeight}
        />

        {/* Valid destination indicator */}
        {isValid && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: pointWidth * 0.4,
              height: pointWidth * 0.4,
              borderRadius: '50%',
              border: '3px solid',
              borderColor: theme.vars.palette.success.main,
              bgcolor: varAlpha(theme.vars.palette.success.mainChannel, 0.1),
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Render checkers - max 5 visible with count label if more */}
        {/* Checkers are now rendered absolutely in a separate layer */}
        
        {/* Show count label if more than 5 checkers */}
        {boardState.points[pointIndex]?.count > 5 && (
          <Box
            sx={{
              position: 'absolute',
              top: isTop ? '5px' : 'auto',
              bottom: isTop ? 'auto' : '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderRadius: '50%',
              width: pointWidth * 0.5,
              height: pointWidth * 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: pointWidth * 0.3,
              border: (theme) => `2px solid ${theme.vars.palette.divider}`,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            +{boardState.points[pointIndex].count - 5}
          </Box>
        )}
      </Box>
    );
  };

  // Render all checkers in a single layer
  const renderCheckers = () => {
    const checkers = [];
    const checkerScale = isMobile ? SCALE_CONFIG.checkerSize.mobile : SCALE_CONFIG.checkerSize.desktop;
    const checkerSize = pointWidth * checkerScale;

    // Points
    for (let i = 0; i < 24; i++) {
      const point = boardState.points[i];
      // Only render up to 5 checkers visually per stack (plus count label handled in renderPoint)
      const renderCount = Math.min(point.count, 5);
      
      for (let j = 0; j < renderCount; j++) {
        const player = point.checkers[j];
        const checkerId = checkerIds.points[i][j] || `${player}-p${i}-s${j}`;
        const { x, y } = getCheckerPosition(i, j);
        const isCheckerSelected = selectedPoint === i && j === point.count - 1;

        checkers.push(
          <Checker
            key={checkerId}
            player={player}
            size={checkerSize}
            x={x}
            y={y}
            isSelected={isCheckerSelected}
            onCheckerClick={() => onPointClick?.(i)}
          />
        );
      }
    }

    // Bar White
    for (let i = 0; i < boardState.bar.white; i++) {
      const checkerId = checkerIds.bar.white[i] || `white-bar-${i}`;
      const { x, y } = getCheckerPosition('bar-white', i);
      checkers.push(
        <Checker
          key={checkerId}
          player="white"
          size={checkerSize}
          x={x}
          y={y}
          onCheckerClick={() => onBarClick?.()}
        />
      );
    }

    // Bar Black
    for (let i = 0; i < boardState.bar.black; i++) {
      const checkerId = checkerIds.bar.black[i] || `black-bar-${i}`;
      const { x, y } = getCheckerPosition('bar-black', i);
      checkers.push(
        <Checker
          key={checkerId}
          player="black"
          size={checkerSize}
          x={x}
          y={y}
          onCheckerClick={() => onBarClick?.()}
        />
      );
    }

    return checkers;
  };

  if (!mounted) {
    return <SplashScreen />;
  }

  return (
    <Card
      sx={{
        bgcolor: boardBg,
        position: 'relative',
        boxSizing: 'border-box',
        boxShadow: theme.palette.mode === 'light' 
          ? '2px 2px 4px 0px rgb(74 74 74)' 
          : '0 1px 2px 0 rgba(196, 197, 199, 0.16)',
        border: isRolling ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
        borderRadius: 2,
        px: '6px',
        py: 0,
        zIndex: 0,
        overflow: 'hidden',
        transition: 'border 0.3s ease-in-out',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
          borderRadius: 1,
        },
      }}
    >
      {/* Checker Layer - Absolute positioned on top */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
        {/* Enable pointer events only for checkers */}
        <Box sx={{ pointerEvents: 'auto' }}>
          {renderCheckers()}
        </Box>
      </Box>

      {/* Top half */}
      <Box sx={{ display: 'flex', height: pointHeight }}>
        {topPoints.slice(0, 6).map((pointIndex, i) => renderPoint(pointIndex, i, true))}

        <Box
          onClick={() => boardState.bar.white > 0 && onBarClick?.()}
          sx={{
            width: pointWidth * SCALE_CONFIG.barWidth,
            height: pointHeight,
            bgcolor: barColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            borderRadius: 2,
            py: 1,
            mx: '8px',
            cursor: boardState.bar.white > 0 ? 'pointer' : 'default',
            border: selectedPoint === -1 && boardState.bar.white > 0 ? '3px solid' : 'none',
            borderColor: theme.vars.palette.primary.main,
            '&:hover': boardState.bar.white > 0 ? { opacity: 0.8 } : {},
          }}
        >
          {/* Bar checkers are now rendered in renderCheckers */}
        </Box>

        {topPoints.slice(6, 12).map((pointIndex, i) => renderPoint(pointIndex, i, true))}
      </Box>

      {/* Bottom half */}
      <Box sx={{ display: 'flex', height: pointHeight }}>
        {/* Left side: points 11→6 */}
        {bottomPoints.slice(0, 6).map((pointIndex, i) => renderPoint(pointIndex, i, false))}

        <Box
          onClick={() => boardState.bar.black > 0 && onBarClick?.()}
          sx={{
            width: pointWidth * SCALE_CONFIG.barWidth,
            height: pointHeight,
            bgcolor: barColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            borderRadius: 2,
            py: 1,
            mx: '8px',
            cursor: boardState.bar.black > 0 ? 'pointer' : 'default',
            border: selectedPoint === -1 && boardState.bar.black > 0 ? '3px solid' : 'none',
            borderColor: theme.vars.palette.primary.main,
            '&:hover': boardState.bar.black > 0 ? { opacity: 0.8 } : {},
          }}
        >
          {/* Bar checkers are now rendered in renderCheckers */}
        </Box>

        {/* Right side: points 5→0 */}
        {bottomPoints.slice(6, 12).map((pointIndex, i) => renderPoint(pointIndex, i, false))}
      </Box>

      {/* Off areas */}
      <Box
        sx={{
          position: 'absolute',
          right: -80,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ typography: 'caption', color: 'text.secondary', mb: 0.5 }}>White Off</Box>
          <Box sx={{ typography: 'h6' }}>{boardState.off.white}</Box>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ typography: 'caption', color: 'text.secondary', mb: 0.5 }}>Black Off</Box>
          <Box sx={{ typography: 'h6' }}>{boardState.off.black}</Box>
        </Box>
      </Box>

      {/* 🎲 Dice Roller - Positioned relative to board */}
      {diceRoller && (
        <Box
          sx={{
            position: 'absolute',
            zIndex: 10,
            ...dicePosition,
          }}
        >
          {diceRoller}
        </Box>
      )}
    </Card>
  );
}
