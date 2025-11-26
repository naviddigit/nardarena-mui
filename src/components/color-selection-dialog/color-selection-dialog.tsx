'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// ----------------------------------------------------------------------

type ColorSelectionDialogProps = {
  open: boolean;
  onSelectColor: (color: 'white' | 'black', maxSets: number) => void;
};

// ----------------------------------------------------------------------

export function ColorSelectionDialog({ open, onSelectColor }: ColorSelectionDialogProps) {
  const [selectedColor, setSelectedColor] = useState<'white' | 'black' | null>(null);
  const [maxSets, setMaxSets] = useState<number>(5);

  const handleConfirm = () => {
    if (selectedColor) {
      onSelectColor(selectedColor, maxSets);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: (theme) => theme.customShadows.dialog,
        },
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={4} alignItems="center">
          {/* Title */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Game Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure your game before starting
            </Typography>
          </Box>

          {/* Max Sets Selection */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center' }}>
              Best of (Sets)
            </Typography>
            <ToggleButtonGroup
              value={maxSets}
              exclusive
              onChange={(e, value) => value && setMaxSets(value)}
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <ToggleButton value={1} sx={{ flex: 1, maxWidth: 80 }}>
                1
              </ToggleButton>
              <ToggleButton value={3} sx={{ flex: 1, maxWidth: 80 }}>
                3
              </ToggleButton>
              <ToggleButton value={5} sx={{ flex: 1, maxWidth: 80 }}>
                5
              </ToggleButton>
              <ToggleButton value={9} sx={{ flex: 1, maxWidth: 80 }}>
                9
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Color Options */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center' }}>
              Choose Your Color
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              sx={{ width: '100%', maxWidth: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
            >
              {/* White Option */}
              <Button
                variant={selectedColor === 'white' ? 'contained' : 'outlined'}
                onClick={() => setSelectedColor('white')}
                sx={{
                  flex: { xs: 'auto', sm: 1 },
                  maxWidth: { xs: '100%', sm: 200 },
                  py: 3,
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: 'common.white',
                      border: (theme) => `3px solid ${theme.palette.divider}`,
                      boxShadow: 3,
                    }}
                  />
                  <Typography variant="h6">White</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Play first
                  </Typography>
                </Stack>
              </Button>

              {/* Black Option */}
              <Button
                variant={selectedColor === 'black' ? 'contained' : 'outlined'}
                onClick={() => setSelectedColor('black')}
                sx={{
                  flex: { xs: 'auto', sm: 1 },
                  maxWidth: { xs: '100%', sm: 200 },
                  py: 3,
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: 'grey.900',
                      border: (theme) => `3px solid ${theme.palette.divider}`,
                      boxShadow: 3,
                    }}
                  />
                  <Typography variant="h6">Black</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Play second
                  </Typography>
                </Stack>
              </Button>
            </Stack>
          </Box>

          {/* Start Game Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleConfirm}
            disabled={!selectedColor}
            sx={{
              minWidth: 200,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Start Game
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
