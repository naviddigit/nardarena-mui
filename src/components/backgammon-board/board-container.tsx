'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';

import { Checker } from './checker';
import { PointTriangle } from './point-triangle';

// ----------------------------------------------------------------------

export type Player = 'white' | 'black';

export type BoardPoint = {
  checkers: Player[];
  count: number;
};

export type BoardState = {
  points: BoardPoint[]; // 24 points (0-23)
  bar: { white: number; black: number };
  off: { white: number; black: number };
};

type BackgammonBoardProps = {
  boardState: BoardState;
  onPointClick?: (pointIndex: number) => void;
  selectedPoint?: number | null;
  validDestinations?: number[];
};

// ----------------------------------------------------------------------

// Standard backgammon board ratio: 1.25:1 (width:height)
const BOARD_RATIO = 1.25;

export function BackgammonBoard({ boardState, onPointClick, selectedPoint, validDestinations = [] }: BackgammonBoardProps) {
  const theme = useTheme();

  // Calculate board dimensions
  const boardHeight = 600; // Base height
  const boardWidth = boardHeight * BOARD_RATIO;
  const pointWidth = boardWidth / 14; // 6 points + bar + 6 points per half
  const pointHeight = (boardHeight - 40) / 2; // Minus padding, divided by 2 for top/bottom

  // Colors for board elements
  const darkPoint = theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[800];
  const lightPoint = theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[300];
  const boardBg = theme.palette.mode === 'dark' ? theme.palette.grey[900] : '#8B4513';
  const barColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#654321';

  // Helper to check if point is a valid destination
  const isValidDestination = (pointIndex: number) => validDestinations.includes(pointIndex);

  // Point indices:
  // Top: 12-23 (right to left)
  // Bottom: 11-0 (left to right)
  const topPoints = Array.from({ length: 12 }, (_, i) => 23 - i);
  const bottomPoints = Array.from({ length: 12 }, (_, i) => i);

  return (
    <Card
      sx={{
        width: boardWidth,
        height: boardHeight,
        bgcolor: boardBg,
        p: 2,
        position: 'relative',
        border: `4px solid ${theme.palette.divider}`,
      }}
    >
      {/* Top half - Points 12-23 */}
      <Box
        sx={{
          display: 'flex',
          height: pointHeight,
          mb: 1,
        }}
      >
        {/* Right quadrant: points 18-23 */}
        {topPoints.slice(0, 6).map((pointIndex, i) => {
          const isValid = isValidDestination(pointIndex);
          return (
            <Box
              key={pointIndex}
              onClick={() => onPointClick?.(pointIndex)}
              sx={{
                width: pointWidth,
                height: pointHeight,
                position: 'relative',
                cursor: 'pointer',
                border: selectedPoint === pointIndex 
                  ? `3px solid ${theme.palette.primary.main}` 
                  : isValid
                    ? `3px solid ${theme.palette.success.main}`
                    : 'none',
                borderRadius: selectedPoint === pointIndex || isValid ? 1 : 0,
                bgcolor: isValid ? theme.palette.success.lighter : 'transparent',
                '&:hover': { opacity: 0.8 },
              }}
            >
              <PointTriangle
                color={i % 2 === 0 ? darkPoint : lightPoint}
                direction="down"
                width={pointWidth}
                height={pointHeight}
              />
              {/* Render checkers on this point */}
              {boardState.points[pointIndex]?.checkers.map((player, idx) => (
                <Checker
                  key={idx}
                  player={player}
                  size={pointWidth * 0.85}
                  top={idx * (pointWidth * 0.75)}
                />
              ))}
            </Box>
          );
        })}

        {/* Bar area */}
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
            <Checker key={`white-${idx}`} player="white" size={pointWidth * 0.7} />
          ))}
        </Box>

        {/* Left quadrant: points 12-17 */}
        {topPoints.slice(6, 12).map((pointIndex, i) => {
          const isValid = isValidDestination(pointIndex);
          return (
            <Box
              key={pointIndex}
              onClick={() => onPointClick?.(pointIndex)}
              sx={{
                width: pointWidth,
                height: pointHeight,
                position: 'relative',
                cursor: 'pointer',
                border: selectedPoint === pointIndex 
                  ? `3px solid ${theme.palette.primary.main}` 
                  : isValid
                    ? `3px solid ${theme.palette.success.main}`
                    : 'none',
                borderRadius: selectedPoint === pointIndex || isValid ? 1 : 0,
                bgcolor: isValid ? theme.palette.success.lighter : 'transparent',
                '&:hover': { opacity: 0.8 },
              }}
            >
              <PointTriangle
                color={i % 2 === 0 ? darkPoint : lightPoint}
                direction="down"
                width={pointWidth}
                height={pointHeight}
              />
              {boardState.points[pointIndex]?.checkers.map((player, idx) => (
                <Checker
                  key={idx}
                  player={player}
                  size={pointWidth * 0.85}
                  top={idx * (pointWidth * 0.75)}
                />
              ))}
            </Box>
          );
        })}
      </Box>

      {/* Bottom half - Points 0-11 */}
      <Box
        sx={{
          display: 'flex',
          height: pointHeight,
          mt: 1,
        }}
      >
        {/* Left quadrant: points 11-6 */}
        {bottomPoints
          .slice(6, 12)
          .reverse()
          .map((pointIndex, i) => {
            const isValid = isValidDestination(pointIndex);
            return (
              <Box
                key={pointIndex}
                onClick={() => onPointClick?.(pointIndex)}
                sx={{
                  width: pointWidth,
                  height: pointHeight,
                  position: 'relative',
                  cursor: 'pointer',
                  border: selectedPoint === pointIndex 
                    ? `3px solid ${theme.palette.primary.main}` 
                    : isValid
                      ? `3px solid ${theme.palette.success.main}`
                      : 'none',
                  borderRadius: selectedPoint === pointIndex || isValid ? 1 : 0,
                  bgcolor: isValid ? theme.palette.success.lighter : 'transparent',
                  '&:hover': { opacity: 0.8 },
                }}
              >
                <PointTriangle
                  color={i % 2 === 0 ? darkPoint : lightPoint}
                  direction="up"
                  width={pointWidth}
                  height={pointHeight}
                />
                {boardState.points[pointIndex]?.checkers.map((player, idx) => (
                  <Checker
                    key={idx}
                    player={player}
                    size={pointWidth * 0.85}
                    bottom={idx * (pointWidth * 0.75)}
                  />
                ))}
              </Box>
            );
          })}

        {/* Bar area */}
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
            <Checker key={`black-${idx}`} player="black" size={pointWidth * 0.7} />
          ))}
        </Box>

        {/* Right quadrant: points 5-0 */}
        {bottomPoints
          .slice(0, 6)
          .reverse()
          .map((pointIndex, i) => {
            const isValid = isValidDestination(pointIndex);
            return (
              <Box
                key={pointIndex}
                onClick={() => onPointClick?.(pointIndex)}
                sx={{
                  width: pointWidth,
                  height: pointHeight,
                  position: 'relative',
                  cursor: 'pointer',
                  border: selectedPoint === pointIndex 
                    ? `3px solid ${theme.palette.primary.main}` 
                    : isValid
                      ? `3px solid ${theme.palette.success.main}`
                      : 'none',
                  borderRadius: selectedPoint === pointIndex || isValid ? 1 : 0,
                  bgcolor: isValid ? theme.palette.success.lighter : 'transparent',
                  '&:hover': { opacity: 0.8 },
                }}
              >
                <PointTriangle
                  color={i % 2 === 0 ? darkPoint : lightPoint}
                  direction="up"
                  width={pointWidth}
                  height={pointHeight}
                />
                {boardState.points[pointIndex]?.checkers.map((player, idx) => (
                  <Checker
                    key={idx}
                    player={player}
                    size={pointWidth * 0.85}
                    bottom={idx * (pointWidth * 0.75)}
                  />
                ))}
              </Box>
            );
          })}
      </Box>

      {/* Off areas (borne off checkers) */}
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
