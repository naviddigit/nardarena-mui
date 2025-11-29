'use client';

import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { AccountButton } from 'src/layouts/components/account-button';

import { ThemeOptions } from './theme-options';

// ----------------------------------------------------------------------

export type GameSettingsDrawerProps = IconButtonProps & {
  displayName?: string;
  photoURL?: string;
};

export function GameSettingsDrawer({ 
  displayName = 'Player',
  photoURL,
  sx, 
  ...other 
}: GameSettingsDrawerProps) {
  const [open, setOpen] = useState(false);

  const handleOpenDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Game Settings
      </Typography>

      <IconButton onClick={handleCloseDrawer}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  return (
    <>
      <AccountButton
        open={open}
        onClick={handleOpenDrawer}
        photoURL={photoURL || ''}
        displayName={displayName}
        sx={sx}
        {...other}
      />

      <Drawer
        open={open}
        onClose={handleCloseDrawer}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 360 } }}
      >
        {renderHead}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar
          sx={{
            height: 1,
            '& .simplebar-content': {
              height: 1,
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <ThemeOptions />
          </Box>
        </Scrollbar>
      </Drawer>
    </>
  );
}
