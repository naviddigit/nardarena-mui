// ----------------------------------------------------------------------

export type Player = 'white' | 'black';

export type BoardPoint = {
  checkers: Player[];
  count: number;
};

export type BoardState = {
  points: BoardPoint[];
  bar: { white: number; black: number };
  off: { white: number; black: number };
};

export type BackgammonBoardProps = {
  boardState: BoardState;
  onPointClick?: (pointIndex: number, dieValue?: number) => void;
  onBarClick?: () => void;
  selectedPoint?: number | null;
  validDestinations?: number[];
  currentPlayer?: Player;
  validMoves?: Array<{ from: number; to: number; die: number }>;
  diceRoller?: React.ReactNode;
  dicePosition?: { top?: number; bottom?: number; left?: number; right?: number };
  isRolling?: boolean;
  isRotated?: boolean;
};
