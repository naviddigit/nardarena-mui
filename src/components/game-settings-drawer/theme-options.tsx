import Box from '@mui/material/Box';

import { useBoardTheme } from 'src/contexts/board-theme-context';

import { Block } from 'src/components/settings/drawer/styles';

import { ThemeOption } from './theme-option';

// ----------------------------------------------------------------------

export function ThemeOptions() {
  const { currentTheme, allThemes, changeTheme } = useBoardTheme();

  console.log('🎨 Theme Options - Total themes:', allThemes.length);
  console.log('📐 Grid columns should be: 1fr (single column)');

  return (
    <Block title="Board Themes">
      <Box
        component="ul"
        sx={{
          gap: 1.5,
          display: 'grid',
          gridTemplateColumns: '1fr !important',
          width: '100%',
        }}
      >
        {allThemes.map((theme) => (
          <Box component="li" key={theme.id} sx={{ display: 'flex', width: '100%' }}>
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
