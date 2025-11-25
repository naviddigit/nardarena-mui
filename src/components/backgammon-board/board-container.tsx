'use client';

import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

import { varAlpha } from 'src/theme/styles';

import { Checker } from './checker';
import { PointTriangle } from './point-triangle';

import type { BackgammonBoardProps } from './types';

// ----------------------------------------------------------------------

const BOARD_RATIO = 1.25;

// ----------------------------------------------------------------------

export function BackgammonBoard({
  boardState,
  onPointClick,
  selectedPoint,
  validDestinations = [],
}: BackgammonBoardProps) {
  const theme = useTheme();

  const boardHeight = 600;
  const boardWidth = boardHeight * BOARD_RATIO;
  const pointWidth = boardWidth / 14;
  const pointHeight = (boardHeight - 40) / 2;

  const darkPoint = theme.palette.mode === 'dark' ? theme.vars.palette.grey[700] : theme.vars.palette.grey[800];
  const lightPoint = theme.palette.mode === 'dark' ? theme.vars.palette.grey[600] : theme.vars.palette.grey[300];
  const boardBg = theme.palette.mode === 'dark' ? theme.vars.palette.grey[900] : '#8B4513';
  const barColor = theme.palette.mode === 'dark' ? theme.vars.palette.grey[800] : '#654321';

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
          height={pointHeight}
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

        {boardState.points[pointIndex]?.checkers.map((player, idx) => {
          const checkerId = `${player}-p${pointIndex}-s${idx}`;
          const stackPosition = idx * (pointWidth * 0.75);
          const absolutePosition = isTop ? stackPosition : pointHeight - stackPosition - (pointWidth * 0.85);
          const isCheckerSelected = selectedPoint === pointIndex && idx === boardState.points[pointIndex].count - 1;
          
          return (
            <Checker
              key={checkerId}
              layoutId={checkerId}
              player={player}
              size={pointWidth * 0.85}
              yPosition={absolutePosition}
              isSelected={isCheckerSelected}
              onCheckerClick={() => {
                onPointClick?.(pointIndex);
              }}
            />
          );
        })}
      </Box>
    );
  };

  return (
    <Card
      sx={{
        width: boardWidth,
        height: boardHeight,
        bgcolor: boardBg,
        p: 2,
        position: 'relative',
        border: `4px solid ${varAlpha(theme.vars.palette.divider, 1)}`,
      }}
    >
      {/* Top half */}
      <Box sx={{ display: 'flex', height: pointHeight, mb: 1 }}>
        {topPoints.slice(0, 6).map((pointIndex, i) => renderPoint(pointIndex, i, true))}

        <Box
          sx={{
            width: pointWidth,
            height: pointHeight,
            bgcolor: barColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          {Array.from({ length: boardState.bar.white }).map((_, idx) => (
            <Checker 
              key={`white-bar-${idx}`} 
              layoutId={`white-bar-${idx}`}
              player="white" 
              size={pointWidth * 0.7} 
              yPosition={idx * (pointWidth * 0.75)} 
            />
          ))}
        </Box>

        {topPoints.slice(6, 12).map((pointIndex, i) => renderPoint(pointIndex, i, true))}
      </Box>

      {/* Bottom half */}
      <Box sx={{ display: 'flex', height: pointHeight, mt: 1 }}>
        {/* Left side: points 11→6 */}
        {bottomPoints.slice(0, 6).map((pointIndex, i) => renderPoint(pointIndex, i, false))}

        <Box
          sx={{
            width: pointWidth,
            height: pointHeight,
            bgcolor: barColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          {Array.from({ length: boardState.bar.black }).map((_, idx) => (
            <Checker 
              key={`black-bar-${idx}`} 
              layoutId={`black-bar-${idx}`}
              player="black" 
              size={pointWidth * 0.7} 
              yPosition={idx * (pointWidth * 0.75)} 
            />
          ))}
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
    </Card>
  );
}
