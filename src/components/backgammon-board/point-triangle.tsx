import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type PointTriangleProps = {
  color: string;
  direction: 'up' | 'down';
  width: number;
  height: number;
};

// ----------------------------------------------------------------------

export function PointTriangle({ color, direction, width, height }: PointTriangleProps) {
  // Create triangle using CSS clip-path
  const points =
    direction === 'down'
      ? '50% 100%, 0 0, 100% 0' // Triangle pointing down
      : '50% 0, 0 100%, 100% 100%'; // Triangle pointing up

  return (
    <Box
      sx={{
        width,
        height,
        bgcolor: color,
        clipPath: `polygon(${points})`,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
}
