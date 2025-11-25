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
  onPointClick?: (pointIndex: number) => void;
  selectedPoint?: number | null;
  validDestinations?: number[];
  diceRoller?: React.ReactNode;
  dicePosition?: { top?: string | number; bottom?: string | number; left?: string | number; right?: string | number };
};
