'use client';

import type { IconButtonProps } from '@mui/material/IconButton';

import IconButton from '@mui/material/IconButton';
import { useColorScheme } from '@mui/material/styles';

import { useSettingsContext } from 'src/components/settings';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type ThemeToggleButtonProps = IconButtonProps;

export function ThemeToggleButton({ sx, ...other }: ThemeToggleButtonProps) {
  const { mode, setMode } = useColorScheme();
  const settings = useSettingsContext();

  const handleToggle = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    settings.onUpdateField('colorScheme', newMode);
  };

  return (
    <IconButton
      aria-label="toggle theme"
      onClick={handleToggle}
      sx={{ p: 0, width: 40, height: 40, ...sx }}
      {...other}
    >
      <Iconify 
        icon={mode === 'light' ? 'solar:moon-bold' : 'solar:sun-bold'} 
        width={24} 
      />
    </IconButton>
  );
}
