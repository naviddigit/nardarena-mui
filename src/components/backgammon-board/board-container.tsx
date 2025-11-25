'use client';

import { useState, useEffect } from 'react';
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

  // Responsive sizing
  const boardHeight = isSmallMobile ? 450 : isMobile ? 500 : 600;
  const boardWidth = boardHeight * BOARD_RATIO;
  const padding = isSmallMobile ? 8 : isMobile ? 12 : 16;
  
  // استفاده از SCALE_CONFIG برای محاسبه سایزها
  const basePointWidth = (boardWidth - padding * 2) / 16;
  const pointWidthScale = isMobile ? SCALE_CONFIG.pointWidth.mobile : SCALE_CONFIG.pointWidth.desktop;
  const pointWidth = basePointWidth * pointWidthScale;
  const pointHeight = (boardHeight - padding * 2 - 20) / 2;
  const triangleHeight = pointHeight - (pointHeight * 0.2); // ارتفاع مثلث‌ها نسبت به ارتفاع جایگاه‌ها
  
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
        {boardState.points[pointIndex]?.checkers.slice(0, 5).map((player, idx) => {
          const checkerId = `${player}-p${pointIndex}-s${idx}`;
          // استفاده از SCALE_CONFIG
          const stackSpacing = isMobile ? SCALE_CONFIG.stackSpacing.mobile : SCALE_CONFIG.stackSpacing.desktop;
          const checkerScale = isMobile ? SCALE_CONFIG.checkerSize.mobile : SCALE_CONFIG.checkerSize.desktop;
          
          const stackPosition = idx * (pointWidth * stackSpacing);
          const checkerSize = pointWidth * checkerScale;
          // Ensure checkers don't overflow
          const maxStack = Math.min(stackPosition, pointHeight - checkerSize);
          const absolutePosition = isTop ? maxStack : pointHeight - maxStack - checkerSize;
          const isCheckerSelected = selectedPoint === pointIndex && idx === boardState.points[pointIndex].count - 1;
          
          return (
            <Checker
              key={checkerId}
              layoutId={checkerId}
              player={player}
              size={checkerSize}
              yPosition={absolutePosition}
              isSelected={isCheckerSelected}
              onCheckerClick={() => {
                onPointClick?.(pointIndex);
              }}
            />
          );
        })}
        
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
          {Array.from({ length: boardState.bar.white }).map((_, idx) => {
            const barSize = isMobile ? SCALE_CONFIG.barChecker.mobile : SCALE_CONFIG.barChecker.desktop;
            const barStackSpacing = isMobile ? SCALE_CONFIG.stackSpacing.mobile : SCALE_CONFIG.stackSpacing.desktop;
            
            return (
              <Checker 
                key={`white-bar-${idx}`} 
                layoutId={`white-bar-${idx}`}
                player="white" 
                size={pointWidth * barSize}
                yPosition={idx * (pointWidth * barStackSpacing)} 
              />
            );
          })}
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
          {Array.from({ length: boardState.bar.black }).map((_, idx) => {
            const barSize = isMobile ? SCALE_CONFIG.barChecker.mobile : SCALE_CONFIG.barChecker.desktop;
            const barStackSpacing = isMobile ? SCALE_CONFIG.stackSpacing.mobile : SCALE_CONFIG.stackSpacing.desktop;
            
            return (
              <Checker 
                key={`black-bar-${idx}`} 
                layoutId={`black-bar-${idx}`}
                player="black" 
                size={pointWidth * barSize}
                yPosition={idx * (pointWidth * barStackSpacing)} 
              />
            );
          })}
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
