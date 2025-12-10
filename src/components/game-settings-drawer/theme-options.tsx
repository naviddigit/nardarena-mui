import { useRef } from 'react';

import Box from '@mui/material/Box';

import { useBoardTheme } from 'src/contexts/board-theme-context';

import { Block } from 'src/components/settings/drawer/styles';

import { ThemeOption } from './theme-option';

// ----------------------------------------------------------------------

export function ThemeOptions() {
  const { currentTheme, allThemes, changeTheme } = useBoardTheme();
  const scrollRef = useRef<HTMLUListElement>(null);

  // Handle horizontal scroll with mouse wheel
  const handleWheel = (e: React.WheelEvent<HTMLUListElement>) => {
    if (scrollRef.current) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <Block title="Board Themes">
      <Box
        ref={scrollRef}
        component="ul"
        onWheel={handleWheel}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          pb: 1,
          // Hide scrollbar
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          // Snap scrolling
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        {allThemes.map((theme) => (
          <Box 
            component="li" 
            key={theme.id} 
            sx={{ 
              flex: '0 0 auto',
              scrollSnapAlign: 'start',
            }}
          >
            <ThemeOption
              theme={theme}
              selected={currentTheme.id === theme.id}
              onClick={() => changeTheme(theme.id)}
            />
          </Box>
        ))}
      </Box>
    </Block>
  );
}
