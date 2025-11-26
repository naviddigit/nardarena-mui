'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import ToggleButton from '@mui/material/ToggleButton';
import CardActionArea from '@mui/material/CardActionArea';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { varAlpha } from 'src/theme/styles';

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
            <Stack spacing={2}>
              {/* White Option */}
              <Card>
                <CardActionArea
                  onClick={() => setSelectedColor('white')}
                  sx={{
                    p: 2,
                    border: (theme) =>
                      `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                    ...(selectedColor === 'white' && {
                      bgcolor: 'action.selected',
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    }),
                  }}
                >
                  <Stack spacing={2} direction="row" alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        minWidth: 48,
                        borderRadius: '50%',
                        bgcolor: 'common.white',
                        border: (theme) => `2px solid ${theme.palette.divider}`,
                        boxShadow: 2,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 0.5,
                          ...(selectedColor === 'white' && { fontWeight: 'fontWeightSemiBold' }),
                        }}
                      >
                        White
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Play first
                      </Typography>
                    </Box>
                  </Stack>
                </CardActionArea>
              </Card>

              {/* Black Option */}
              <Card>
                <CardActionArea
                  onClick={() => setSelectedColor('black')}
                  sx={{
                    p: 2,
                    border: (theme) =>
                      `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                    ...(selectedColor === 'black' && {
                      bgcolor: 'action.selected',
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    }),
                  }}
                >
                  <Stack spacing={2} direction="row" alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        minWidth: 48,
                        borderRadius: '50%',
                        bgcolor: 'grey.900',
                        border: (theme) => `2px solid ${theme.palette.divider}`,
                        boxShadow: 2,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 0.5,
                          ...(selectedColor === 'black' && { fontWeight: 'fontWeightSemiBold' }),
                        }}
                      >
                        Black
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Play second
                      </Typography>
                    </Box>
                  </Stack>
                </CardActionArea>
              </Card>
            </Stack>
          </Box>

          {/* Start Game Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleConfirm}
            disabled={!selectedColor}
            sx={{
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
