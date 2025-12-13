'use client';

import { useState, useEffect, useMemo, useRef, cloneElement, isValidElement } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { LayoutGroup, AnimatePresence, m } from 'framer-motion';

import { varAlpha } from 'src/theme/styles';
import { useAnimationConfig } from 'src/utils/animation-config';
import { useBoardTheme } from 'src/contexts/board-theme-context';
import { BOARD_CONFIG, BOARD_ELEMENTS_CONFIG, MOVE_INDICATORS_CONFIG } from 'src/config/board-dimensions.config';

import { Checker } from './checker';
import { SplashScreen } from '../loading-screen';
import { PointTriangle } from './point-triangle';

import type { BackgammonBoardProps } from './types';

// ----------------------------------------------------------------------

// استفاده از تنظیمات مرکزی (برای تغییر ابعاد به src/config/board-dimensions.config.ts برو)
const BOARD_DIMENSIONS = BOARD_CONFIG;
const SCALE_CONFIG = BOARD_ELEMENTS_CONFIG;

// ----------------------------------------------------------------------

export function BackgammonBoard({
  boardState,
  onPointClick,
  onBarClick,
  selectedPoint,
  validDestinations = [],
  currentPlayer,
  validMoves = [],
  diceRoller,
  dicePosition = { top: 20, right: 20 },
  isRolling = false,
  isRotated = false,
  demoOffCounts,
}: BackgammonBoardProps) {
  const theme = useTheme();
  
  // استفاده از Board Theme Context
  const { currentTheme } = useBoardTheme();
  
  // چک کردن doubles (جفت): اگه همه تاس‌ها یکسان باشن
  // ✅ Safety check for validMoves
  const diceValues = validMoves?.map(m => m.die) || [];
  const uniqueDiceValues = new Set(diceValues);
  const isDoubles = uniqueDiceValues.size === 1 && diceValues.length > 1;
  
  // 📱 تشخیص سایز صفحه
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 📱 تشخیص گوشی‌های خیلی کوچک (iPhone SE: 375px, iPhone 12/13 mini: 390px)
  // iPhone Pro Max: 430px
  const isVerySmallMobile = useMediaQuery('(max-width:400px)');
  
  const [mounted, setMounted] = useState(false);

  // Calculate playable points (points with checkers that can move)
  const playablePoints = useMemo(() => {
    const points = new Set<number>();
    // ✅ Safety check for validMoves
    if (validMoves) {
      validMoves.forEach(move => {
        points.add(move.from);
      });
    }
    return points;
  }, [validMoves, isDoubles, currentPlayer]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Combine real off counts with demo counts for visual display
  const displayOffCounts = useMemo(() => {
    // ✅ Safety check for boardState.off
    const whiteOff = boardState?.off?.white || 0;
    const blackOff = boardState?.off?.black || 0;
    return {
      white: whiteOff + (demoOffCounts?.white || 0),
      black: blackOff + (demoOffCounts?.black || 0),
    };
  }, [boardState?.off, demoOffCounts]);

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
    // ✅ Early return if boardState is not ready
    if (!boardState || !boardState.points || !boardState.bar || !boardState.off) {
      return {
        points: Array.from({ length: 24 }, () => []),
        bar: { white: [], black: [] },
        off: { white: [], black: [] }
      };
    }
    
    const prevIds = idsRef.current;
    const prevState = prevBoardStateRef.current;
    const nextState = boardState;
    
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
          const id = generateId(point.checkers[j]);
          newIds.points[i].push(id);
        }
      }
      for (let i = 0; i < nextState.bar.white; i++) newIds.bar.white.push(generateId('white'));
      for (let i = 0; i < nextState.bar.black; i++) newIds.bar.black.push(generateId('black'));
      // Use displayOffCounts for initial off checkers
      const initialWhiteOff = displayOffCounts.white;
      const initialBlackOff = displayOffCounts.black;
      for (let i = 0; i < initialWhiteOff; i++) newIds.off.white.push(generateId('white'));
      for (let i = 0; i < initialBlackOff; i++) newIds.off.black.push(generateId('black'));
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
            if (id) {
              pool.push({ id, player });
            }
          }
        }
      }
      // Bar
      if (prevState.bar.white > nextState.bar.white) {
        for (let k = 0; k < prevState.bar.white - nextState.bar.white; k++) {
          const id = newIds.bar.white.pop();
          if (id) {
            pool.push({ id, player: 'white' });
          }
        }
      }
      if (prevState.bar.black > nextState.bar.black) {
        for (let k = 0; k < prevState.bar.black - nextState.bar.black; k++) {
          const id = newIds.bar.black.pop();
          if (id) {
            pool.push({ id, player: 'black' });
          }
        }
      }
      // Off zones - we don't remove from pool anymore since we use displayOffCounts
      // The IDs will be adjusted in the add section based on displayOffCounts

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
        console.log('📥 Adding white checker to bar. Pool before:', pool.map(p => `${p.player}:${p.id}`));
        for (let k = 0; k < nextState.bar.white - prevState.bar.white; k++) {
          const poolIndex = pool.findIndex(c => c.player === 'white');
          let id;
          if (poolIndex !== -1) {
            id = pool[poolIndex].id;
            pool.splice(poolIndex, 1);
            console.log('✅ Reusing white ID from pool:', id);
          } else {
            id = generateId('white');
            console.log('⚠️ No white ID in pool, generating new:', id);
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
      // Off - use displayOffCounts for demo + real checkers
      const currentDisplayWhiteOff = displayOffCounts.white;
      const currentDisplayBlackOff = displayOffCounts.black;
      
      if (currentDisplayWhiteOff > newIds.off.white.length) {
        for (let k = 0; k < currentDisplayWhiteOff - newIds.off.white.length; k++) {
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
      } else if (currentDisplayWhiteOff < newIds.off.white.length) {
        // Remove excess IDs if demo count decreased
        newIds.off.white = newIds.off.white.slice(0, currentDisplayWhiteOff);
      }
      
      if (currentDisplayBlackOff > newIds.off.black.length) {
        for (let k = 0; k < currentDisplayBlackOff - newIds.off.black.length; k++) {
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
      } else if (currentDisplayBlackOff < newIds.off.black.length) {
        // Remove excess IDs if demo count decreased
        newIds.off.black = newIds.off.black.slice(0, currentDisplayBlackOff);
      }
    }

    // Update refs
    idsRef.current = newIds;
    prevBoardStateRef.current = nextState;

    return newIds;
  }, [boardState, displayOffCounts]);

  // 📏 محاسبه ابعاد تخته با Scale Factor (نسبت ثابت)
  // تشخیص سایز دستگاه و انتخاب Scale مناسب
  const currentScale = isVerySmallMobile 
    ? BOARD_DIMENSIONS.scale.smallMobile  // گوشی‌های خیلی کوچک (SE: 375px)
    : isSmallMobile
      ? BOARD_DIMENSIONS.scale.mobile     // گوشی‌های متوسط (Pro Max: 430px)
      : isTablet
        ? BOARD_DIMENSIONS.scale.tablet   // تبلت
        : BOARD_DIMENSIONS.scale.desktop; // دسکتاپ
  
  // محاسبه ابعاد با Scale Factor
  const boardHeight = BOARD_DIMENSIONS.baseHeight * currentScale;
  const boardWidth = boardHeight * BOARD_DIMENSIONS.ratio;
  
  // Padding نسبی به Scale
  const padding = isSmallMobile 
    ? BOARD_DIMENSIONS.padding.smallMobile 
    : isMobile 
      ? BOARD_DIMENSIONS.padding.mobile 
      : BOARD_DIMENSIONS.padding.desktop;
  
  // استفاده از SCALE_CONFIG برای محاسبه سایزها
  const basePointWidth = (boardWidth - padding * 2) / 16;
  const pointWidthScale = isMobile ? SCALE_CONFIG.pointWidth.mobile : SCALE_CONFIG.pointWidth.desktop;
  const pointWidth = basePointWidth * pointWidthScale;
  const pointHeight = (boardHeight - padding * 2 - 20) / 2;
  const triangleHeight = pointHeight - (pointHeight * BOARD_DIMENSIONS.triangleHeightRatio); // ارتفاع مثلث‌ها نسبت به ارتفاع جایگاه‌ها
  
  // استفاده از رنگ‌های تم - با useMemo برای رفرش خودکار
  const themeColors = useMemo(() => ({
    darkPoint: currentTheme.colors.darkPoint,
    lightPoint: currentTheme.colors.lightPoint,
    boardBg: currentTheme.colors.background,
    barColor: currentTheme.colors.barBackground,
  }), [currentTheme]);
  
  const { darkPoint, lightPoint, boardBg, barColor } = themeColors;

  // Calculate checker size once (used in bear-off zones)
  const checkerScale = isMobile ? SCALE_CONFIG.checkerSize.mobile : SCALE_CONFIG.checkerSize.desktop;
  const checkerSize = pointWidth * checkerScale;

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
          '&:hover': { 
            opacity: isSelected ? 1 : 0.8, // غیرفعال کردن hover برای جایگاه سلکت شده
          },
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
              top: `calc(50% + ${(isTop ? 1 : -1) * MOVE_INDICATORS_CONFIG.validDestination.verticalOffset * pointWidth}px)`,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: pointWidth * MOVE_INDICATORS_CONFIG.validDestination.size,
              height: pointWidth * MOVE_INDICATORS_CONFIG.validDestination.size,
              borderRadius: '50%',
              border: `${MOVE_INDICATORS_CONFIG.validDestination.borderWidth} solid`,
              borderColor: theme.vars.palette.success.main,
              bgcolor: varAlpha(theme.vars.palette.success.mainChannel, MOVE_INDICATORS_CONFIG.validDestination.backgroundOpacity),
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Render checkers - max 5 visible with count label if more */}
        <AnimatePresence>
        {(() => {
          const point = boardState.points[pointIndex];
          // ✅ Safety check: ensure point and checkers array exist
          if (!point || !point.checkers || !Array.isArray(point.checkers)) return null;
          
          // استفاده از SCALE_CONFIG
          const stackSpacing = isMobile ? SCALE_CONFIG.stackSpacing.mobile : SCALE_CONFIG.stackSpacing.desktop;
          const checkerScale = isMobile ? SCALE_CONFIG.checkerSize.mobile : SCALE_CONFIG.checkerSize.desktop;
          const checkerSize = pointWidth * checkerScale;
          
          // Calculate position for count label - place it after the last visible checker (in empty space)
          const visibleCount = Math.min(5, point.count);
          const nextPosition = visibleCount * (pointWidth * stackSpacing);
          const maxStackForLabel = Math.min(nextPosition, pointHeight - checkerSize);
          // Position label at the next stack position (where 6th checker would be)
          const countLabelPosition = isTop ? maxStackForLabel : pointHeight - maxStackForLabel - checkerSize;
          
          return (
            <>
              {point.checkers.map((player, idx) => {
                const checkerId = checkerIds.points[pointIndex][idx] || `${player}-p${pointIndex}-s${idx}`;
                
                // For checkers 0-4: normal stacking
                // For checkers 5+: all sit on position 5
                const displayIdx = Math.min(idx, 4);
                const stackPosition = displayIdx * (pointWidth * stackSpacing);
                const maxStackPos = Math.min(stackPosition, pointHeight - checkerSize);
                const absolutePosition = isTop ? maxStackPos : pointHeight - maxStackPos - checkerSize;
                
                const isCheckerSelected = selectedPoint === pointIndex && idx === point.count - 1;
                const isTopChecker = idx === point.count - 1;
                const isCheckerPlayable = isTopChecker && playablePoints.has(pointIndex) && player === currentPlayer;
                
                // Get valid destinations for this checker
                // ✅ Safety check for validMoves
                const checkerValidMoves = validMoves?.filter(m => m.from === pointIndex) || [];
                // Check if all moves go to the same destination (important for doubles like 3-3)
                const uniqueDestinations = new Set(checkerValidMoves.map(m => m.to));
                const hasSingleDestination = uniqueDestinations.size === 1;
                
                // نمایش dice indicators فقط وقتی مهره سلکت شده و بیش از یک حرکت داره (و جفت نیست)
                const availableDice = (isCheckerSelected && checkerValidMoves.length > 1 && !isDoubles) 
                  ? checkerValidMoves.map(m => ({ die: m.die, to: m.to })) 
                  : [];
                
                return (
                  <Checker
                    key={checkerId}
                    layoutId={checkerId}
                    player={player}
                    size={checkerSize}
                    yPosition={absolutePosition}
                    isSelected={isCheckerSelected}
                    isPlayable={isCheckerPlayable}
                    isRotated={isRotated}
                    isTopPoint={isTop}
                    availableDice={availableDice}
                    onDiceClick={(die, to) => {
                      // Move to specific destination with specific die
                      onPointClick?.(to);
                    }}
                    onCheckerClick={() => {
                      // If already selected and all moves go to same destination, auto-move
                      if (isCheckerSelected && hasSingleDestination && checkerValidMoves.length > 0) {
                        onPointClick?.(checkerValidMoves[0].to);
                      } else {
                        onPointClick?.(pointIndex);
                      }
                    }}
                  />
                );
              })}
              
              {/* Count label on empty position after last visible checker */}
              {point.count > 5 && (() => {
                // Get valid destinations for this checker
                // ✅ Safety check for validMoves
                const checkerValidMoves = validMoves?.filter(m => m.from === pointIndex) || [];
                const uniqueDestinations = new Set(checkerValidMoves.map(m => m.to));
                const hasSingleDestination = uniqueDestinations.size === 1;
                const isCheckerSelected = selectedPoint === pointIndex;
                
                // Position on NEXT empty space after 5th checker (position 6)
                const visibleCount = 5;
                const nextPosition = visibleCount * (pointWidth * stackSpacing);
                const maxStackForLabel = Math.min(nextPosition, pointHeight - checkerSize);
                const countLabelPosition = isTop ? maxStackForLabel : pointHeight - maxStackForLabel - checkerSize;
                
                return (
                  <Box
                    onClick={() => {
                      // Make count label clickable - select point or auto-move
                      if (isCheckerSelected && hasSingleDestination && checkerValidMoves.length > 0) {
                        onPointClick?.(checkerValidMoves[0].to);
                      } else {
                        onPointClick?.(pointIndex);
                      }
                    }}
                    sx={{
                      position: 'absolute',
                      top: countLabelPosition + checkerSize / 2,
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      bgcolor: (theme) => varAlpha(theme.vars.palette.background.paperChannel, 0.9),
                      color: (theme) => theme.vars.palette.text.primary,
                      borderRadius: '50%',
                      width: checkerSize * 0.55,
                      height: checkerSize * 0.55,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: checkerSize * 0.3,
                      border: (theme) => `2px solid ${theme.vars.palette.divider}`,
                      boxShadow: (theme) => `0 2px 8px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.24)}`,
                      zIndex: 20,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translate(-50%, -50%) scale(1.1)',
                        borderColor: (theme) => theme.vars.palette.primary.main,
                        bgcolor: (theme) => varAlpha(theme.vars.palette.background.paperChannel, 0.95),
                      },
                    }}
                  >
                    +{point.count - 5}
                  </Box>
                );
              })()}
            </>
          );
        })()}
        </AnimatePresence>
      </Box>
    );
  };

  // Memoize bar checkers to prevent infinite re-renders
  const barCheckers = useMemo(() => {
    const checkers: { white: JSX.Element[], black: JSX.Element[] } = { white: [], black: [] };
    const checkerScale = isMobile ? SCALE_CONFIG.checkerSize.mobile : SCALE_CONFIG.checkerSize.desktop;
    const checkerSize = pointWidth * checkerScale;
    const barStackSpacing = isMobile ? SCALE_CONFIG.stackSpacing.mobile : SCALE_CONFIG.stackSpacing.desktop;
    const isBarPlayable = playablePoints.has(-1);
    // ✅ Safety check for validMoves
    const barValidMoves = validMoves?.filter(m => m.from === -1) || [];
    const uniqueBarDestinations = new Set(barValidMoves.map(m => m.to));
    const hasBarSingleDestination = uniqueBarDestinations.size === 1;
    const isBarSelected = selectedPoint === -1;

    // Bar White - position from BOTTOM of bar (so they sit at bottom)
    for (let i = 0; i < boardState.bar.white; i++) {
      const checkerId = checkerIds.bar.white[i] || `white-bar-${i}`;
      // Calculate from bottom: start at (height - checkerSize) and stack upwards
      const yPos = pointHeight - checkerSize - (i * (pointWidth * barStackSpacing));
      const isTopChecker = i === boardState.bar.white - 1;
      const isCheckerPlayable = isTopChecker && isBarPlayable && currentPlayer === 'white';
      const isCheckerSelected = isBarSelected && isTopChecker && currentPlayer === 'white';
      
      // نمایش dice indicators فقط وقتی سلکت شده و بیش از یک حرکت داره
      const availableDice = (isCheckerSelected && barValidMoves.length > 1 && !isDoubles) 
        ? barValidMoves.map(m => ({ die: m.die, to: m.to })) 
        : [];
      
      checkers.white.push(
        <Checker
          key={checkerId}
          layoutId={checkerId}
          player="white"
          size={checkerSize}
          yPosition={yPos}
          isPlayable={isCheckerPlayable}
          isSelected={isCheckerSelected}
          isTopPoint={false}
          availableDice={availableDice}
          onDiceClick={(die, to) => {
            onPointClick?.(to);
          }}
          onCheckerClick={() => {
            // If already selected and all moves go to same destination, auto-move
            if (isCheckerSelected && hasBarSingleDestination && barValidMoves.length > 0) {
              onPointClick?.(barValidMoves[0].to);
            } else {
              onBarClick?.();
            }
          }}
        />
      );
    }

    // Bar Black - position from TOP of bar (so they sit at top)
    for (let i = 0; i < boardState.bar.black; i++) {
      const checkerId = checkerIds.bar.black[i] || `black-bar-${i}`;
      // Stack from top downwards
      const yPos = i * (pointWidth * barStackSpacing);
      const isTopChecker = i === boardState.bar.black - 1;
      const isCheckerPlayable = isTopChecker && isBarPlayable && currentPlayer === 'black';
      const isCheckerSelected = isBarSelected && isTopChecker && currentPlayer === 'black';
      
      // نمایش dice indicators فقط وقتی سلکت شده و بیش از یک حرکت داره
      const availableDice = (isCheckerSelected && barValidMoves.length > 1 && !isDoubles) 
        ? barValidMoves.map(m => ({ die: m.die, to: m.to })) 
        : [];
      
      checkers.black.push(
        <Checker
          key={checkerId}
          layoutId={checkerId}
          player="black"
          size={checkerSize}
          yPosition={yPos}
          isPlayable={isCheckerPlayable}
          isSelected={isCheckerSelected}
          isTopPoint={true}
          availableDice={availableDice}
          onDiceClick={(die, to) => {
            onPointClick?.(to);
          }}
          onCheckerClick={() => {
            // If already selected and all moves go to same destination, auto-move
            if (isCheckerSelected && hasBarSingleDestination && barValidMoves.length > 0) {
              onPointClick?.(barValidMoves[0].to);
            } else {
              onBarClick?.();
            }
          }}
        />
      );
    }

    return checkers;
  }, [boardState?.bar?.white, boardState?.bar?.black, checkerIds.bar.white, checkerIds.bar.black, pointWidth, pointHeight, isMobile, onBarClick, playablePoints, currentPlayer, validMoves, selectedPoint, onPointClick]);

  const animConfig = useAnimationConfig();

  if (!mounted) {
    return <SplashScreen />;
  }

  return (
    <Box
      component={m.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotate: isRotated ? 180 : 0,
      }}
      transition={{ 
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
        rotate: animConfig.board
      }}
      sx={{ display: 'inline-block' }}
    >
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
          userSelect: 'none',
          WebkitUserSelect: 'none',
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
          // لوگو سمت راست وسط
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            right: '23%',
            transform: 'translate(50%, -50%)',
            width: '180px',
            height: '180px',
            backgroundImage: 'url(/assets/background.svg)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.5,
            pointerEvents: 'none',
            zIndex: 0,
          },
        }}
      >
      <LayoutGroup id="board-checkers">
        {/* Black's bear-off zone - Top */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, px: 2 }}>
          <Box
            onClick={() => {
              if (selectedPoint !== null && selectedPoint !== undefined && selectedPoint >= 0 && currentPlayer === 'black') {
                onPointClick?.(selectedPoint, -2);
              }
            }}
            sx={{
              width: '60%',
              minHeight: checkerSize * 0.8,
              bgcolor: selectedPoint !== null && currentPlayer === 'black' && validMoves.some(m => m.from === selectedPoint && m.to === -2)
                ? `${currentTheme.colors.darkPoint}60`
                : `${currentTheme.colors.darkPoint}30`,
              border: selectedPoint !== null && currentPlayer === 'black' && validMoves.some(m => m.from === selectedPoint && m.to === -2)
                ? `2px solid ${currentTheme.colors.lightPoint}`
                : `1px solid ${currentTheme.colors.lightPoint}40`,
              borderRadius: 2,
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              px: 1,
              py: 0,

              cursor: selectedPoint !== null && currentPlayer === 'black' ? 'pointer' : 'default',
              transition: 'all 0.2s',
              '&:hover': selectedPoint !== null && currentPlayer === 'black' && validMoves.some(m => m.from === selectedPoint && m.to === -2) ? {
                bgcolor: `${currentTheme.colors.darkPoint}80`,
                borderColor: currentTheme.colors.lightPoint,
                borderWidth: '2px',
              } : {},
            }}
          >
            <AnimatePresence>
              {idsRef.current.off.black.slice(0, 15).map((id, index) => (
                <m.div
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{
                    position: 'relative',
                    marginLeft: index === 0 ? 0 : checkerSize * 0.55,
                  }}
                >
                  <Checker
                    player="black"
                    size={checkerSize * 0.7}
                    yPosition={0}
                    layoutId={id}
                    isSelected={false}
                    isPlayable={false}
                  />
                </m.div>
              ))}
            </AnimatePresence>
          </Box>
        </Box>

        {/* Top half */}
        <Box 
          component={m.div}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.1,
            ease: "easeOut" 
          }}
          sx={{ display: 'flex', height: pointHeight }}
        >
        {topPoints.slice(0, 6).map((pointIndex, i) => renderPoint(pointIndex, i, true))}

        <Box
          onClick={() => boardState.bar.white > 0 && onBarClick?.()}
          sx={{
            width: pointWidth * SCALE_CONFIG.barWidth,
            height: pointHeight,
            bgcolor: barColor,
            position: 'relative', // CRITICAL: Needed for absolute positioned checkers
            borderRadius: 2,
            py: 1,
            mx: '8px',
            cursor: boardState.bar.white > 0 ? 'pointer' : 'default',
            border: selectedPoint === -1 && boardState.bar.white > 0 ? '3px solid' : 'none',
            borderColor: theme.vars.palette.primary.main,
            '&:hover': boardState.bar.white > 0 ? { opacity: 0.8 } : {},
          }}
        >
          <AnimatePresence>
            {barCheckers.white.map(checker => checker)}
          </AnimatePresence>
        </Box>

        {topPoints.slice(6, 12).map((pointIndex, i) => renderPoint(pointIndex, i, true))}
      </Box>

      {/* Bottom half */}
      <Box 
        component={m.div}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.5, 
          delay: 0.1,
          ease: "easeOut" 
        }}
        sx={{ display: 'flex', height: pointHeight }}
      >
        {/* Left side: points 11→6 */}
        {bottomPoints.slice(0, 6).map((pointIndex, i) => renderPoint(pointIndex, i, false))}

        <Box
          onClick={() => boardState.bar.black > 0 && onBarClick?.()}
          sx={{
            width: pointWidth * SCALE_CONFIG.barWidth,
            height: pointHeight,
            bgcolor: barColor,
            position: 'relative', // CRITICAL: Needed for absolute positioned checkers
            borderRadius: 2,
            py: 1,
            mx: '8px',
            cursor: boardState.bar.black > 0 ? 'pointer' : 'default',
            border: selectedPoint === -1 && boardState.bar.black > 0 ? '3px solid' : 'none',
            borderColor: theme.vars.palette.primary.main,
            '&:hover': boardState.bar.black > 0 ? { opacity: 0.8 } : {},
          }}
        >
          <AnimatePresence>
            {barCheckers.black.map(checker => checker)}
          </AnimatePresence>
        </Box>

        {/* Right side: points 5→0 */}
        {bottomPoints.slice(6, 12).map((pointIndex, i) => renderPoint(pointIndex, i, false))}
      </Box>

      {/* White's bear-off zone - Bottom */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, px: 2 }}>
        <Box
          onClick={() => {
            if (selectedPoint !== null && selectedPoint !== undefined && selectedPoint >= 0 && currentPlayer === 'white') {
              onPointClick?.(selectedPoint, -2);
            }
          }}
          sx={{
            width: '60%',
            minHeight: checkerSize * 0.8,
            bgcolor: selectedPoint !== null && currentPlayer === 'white' && validMoves.some(m => m.from === selectedPoint && m.to === -2)
              ? `${currentTheme.colors.lightPoint}50`
              : `${currentTheme.colors.lightPoint}20`,
            border: selectedPoint !== null && currentPlayer === 'white' && validMoves.some(m => m.from === selectedPoint && m.to === -2)
              ? `2px solid ${currentTheme.colors.darkPoint}`
              : `1px solid ${currentTheme.colors.darkPoint}40`,
            borderRadius: 2,
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            px: 1,
            py: 0.5,
            cursor: selectedPoint !== null && currentPlayer === 'white' ? 'pointer' : 'default',
            transition: 'all 0.2s',
            '&:hover': selectedPoint !== null && currentPlayer === 'white' && validMoves.some(m => m.from === selectedPoint && m.to === -2) ? {
              bgcolor: `${currentTheme.colors.lightPoint}70`,
              borderColor: currentTheme.colors.darkPoint,
              borderWidth: '2px',
            } : {},
          }}
        >
          <AnimatePresence>
            {idsRef.current.off.white.slice(0, 15).map((id, index) => (
              <m.div
                key={id}
                layout
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                  position: 'relative',
                  marginLeft: index === 0 ? 0 : checkerSize * 0.55,
                }}
              >
                <Checker
                  player="white"
                  size={checkerSize * 0.7}
                  yPosition={0}
                  layoutId={id}
                  isSelected={false}
                  isPlayable={false}
                />
              </m.div>
            ))}
          </AnimatePresence>
        </Box>
      </Box>

      {/* لوگو سمت چپ وسط تخته */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '23%',
          transform: 'translate(-50%, -50%)',
          width: '180px',
          height: '180px',
          backgroundImage: 'url(/assets/background.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 🎲 Dice Roller - Positioned relative to board */}
      {diceRoller && (
        <Box
          sx={{
            position: 'absolute',
            zIndex: 10,
            ...dicePosition,
          }}
        >
          {/* Pass boardScale and boardHeight to DiceRoller component */}
          {isValidElement(diceRoller) 
            ? cloneElement(diceRoller as React.ReactElement<any>, { 
                boardScale: currentScale,
                boardHeight: boardHeight 
              })
            : diceRoller
          }
        </Box>
      )}
      </LayoutGroup>
    </Card>
    </Box>
  );
}
