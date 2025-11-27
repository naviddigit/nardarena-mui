// ===============================================
// BOARD SCALE CONFIGURATIONS
// ===============================================

export const BOARD_RATIO = 1.25;

export const SCALE_CONFIG = {
  // عرض جایگاه‌ها (Point Width Scale)
  pointWidth: {
    desktop: 0.9,
    mobile: 0.85,
  },
  // اندازه مهره‌ها (Checker Size Scale)
  checkerSize: {
    desktop: 0.9,
    mobile: 0.9,
  },
  // فاصله بین مهره‌ها (Stack Spacing)
  stackSpacing: {
    desktop: 0.9,
    mobile: 0.9,
  },
  // مهره‌های bar
  barChecker: {
    desktop: 0.7,
    mobile: 0.6,
  },
  // عرض bar وسطی
  barWidth: 0.9,
} as const;

// ===============================================
// BOARD DIMENSIONS CALCULATOR
// ===============================================

export interface BoardDimensions {
  boardHeight: number;
  boardWidth: number;
  padding: number;
  pointWidth: number;
  pointHeight: number;
  triangleHeight: number;
  checkerSize: number;
}

export function calculateBoardDimensions(
  isMobile: boolean,
  isSmallMobile: boolean
): BoardDimensions {
  const boardHeight = isSmallMobile ? 450 : isMobile ? 500 : 600;
  const boardWidth = boardHeight * BOARD_RATIO;
  const padding = isSmallMobile ? 8 : isMobile ? 12 : 16;

  const basePointWidth = (boardWidth - padding * 2) / 16;
  const pointWidthScale = isMobile ? SCALE_CONFIG.pointWidth.mobile : SCALE_CONFIG.pointWidth.desktop;
  const pointWidth = basePointWidth * pointWidthScale;
  const pointHeight = (boardHeight - padding * 2 - 20) / 2;
  const triangleHeight = pointHeight - pointHeight * 0.2;

  const checkerScale = isMobile ? SCALE_CONFIG.checkerSize.mobile : SCALE_CONFIG.checkerSize.desktop;
  const checkerSize = pointWidth * checkerScale;

  return {
    boardHeight,
    boardWidth,
    padding,
    pointWidth,
    pointHeight,
    triangleHeight,
    checkerSize,
  };
}

// ===============================================
// CHECKER POSITIONING
// ===============================================

export interface CheckerPosition {
  stackPosition: number;
  maxStackPos: number;
  absolutePosition: number;
}

export function calculateCheckerPosition(
  checkerIndex: number,
  pointWidth: number,
  pointHeight: number,
  checkerSize: number,
  stackSpacing: number,
  isTopPoint: boolean
): CheckerPosition {
  // For checkers 0-4: normal stacking
  // For checkers 5+: all sit on position 5
  const displayIdx = Math.min(checkerIndex, 4);
  const stackPosition = displayIdx * (pointWidth * stackSpacing);
  const maxStackPos = Math.min(stackPosition, pointHeight - checkerSize);
  const absolutePosition = isTopPoint
    ? maxStackPos
    : pointHeight - maxStackPos - checkerSize;

  return {
    stackPosition,
    maxStackPos,
    absolutePosition,
  };
}

// ===============================================
// COUNT LABEL POSITIONING
// ===============================================

export function calculateCountLabelPosition(
  pointWidth: number,
  pointHeight: number,
  checkerSize: number,
  stackSpacing: number,
  isTopPoint: boolean
): number {
  const visibleCount = 5;
  const nextPosition = visibleCount * (pointWidth * stackSpacing);
  const maxStackForLabel = Math.min(nextPosition, pointHeight - checkerSize);
  return isTopPoint ? maxStackForLabel : pointHeight - maxStackForLabel - checkerSize;
}

// ===============================================
// BOARD LAYOUT
// ===============================================

export function getTopPoints(): number[] {
  return Array.from({ length: 12 }, (_, i) => 12 + i); // [12-23]
}

export function getBottomPoints(): number[] {
  return Array.from({ length: 12 }, (_, i) => 11 - i); // [11-0]
}
