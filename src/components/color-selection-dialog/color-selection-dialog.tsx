'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import { useTheme, alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { BottomDrawer } from 'src/components/bottom-drawer';

// ----------------------------------------------------------------------

type ColorSelectionDialogProps = {
  open: boolean;
  onSelectColor: (color: 'white' | 'black', maxSets: number) => void;
  onCancel?: () => void;
};

// ----------------------------------------------------------------------

export function ColorSelectionDialog({ open, onSelectColor, onCancel }: ColorSelectionDialogProps) {
  const theme = useTheme();
  const [selectedColor, setSelectedColor] = useState<'white' | 'black' | null>(null);
  const [maxSets, setMaxSets] = useState<number>(5);

  const handleConfirm = () => {
    if (selectedColor) {
      onSelectColor(selectedColor, maxSets);
    }
  };

  return (
    <BottomDrawer
      open={open}
      onClose={() => {}}
      title="Game Settings"
      heightPercentage={75}
      hideCloseButton
      disableSwipeToClose
    >
      <Box sx={{ p: 2 }}>
        <Stack spacing={2.5}>
          {/* Subtitle */}
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: -1 }}>
            Configure your game before starting
          </Typography>

          {/* Max Sets Selection */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Best of (Sets)
            </Typography>
            <Stack direction="row" spacing={1}>
              {[1, 3, 5, 9].map((sets) => (
                <Chip
                  key={sets}
                  label={sets}
                  onClick={() => setMaxSets(sets)}
                  color={maxSets === sets ? 'primary' : 'default'}
                  variant={maxSets === sets ? 'filled' : 'outlined'}
                  sx={{
                    flex: 1,
                    height: 44,
                    fontSize: '1rem',
                    fontWeight: 700,
                    ...(maxSets !== sets && {
                      bgcolor: 'transparent',
                      borderColor: alpha(theme.palette.text.disabled, 0.16),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                      },
                    }),
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Color Options */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Choose Your Color
            </Typography>
            <Stack spacing={1.5}>
              {/* White Option */}
              <Card
                sx={{
                  border: selectedColor === 'white' ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                  bgcolor: selectedColor === 'white' ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                }}
              >
                <CardActionArea
                  onClick={() => setSelectedColor('white')}
                  sx={{ p: 1.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        minWidth: 44,
                        borderRadius: '50%',
                        bgcolor: 'common.white',
                        border: `2px solid ${theme.palette.divider}`,
                        boxShadow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="solar:checkers-bold" width={24} sx={{ color: 'grey.800' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.25 }}>
                        White
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        You play first
                      </Typography>
                    </Box>
                    {selectedColor === 'white' && (
                      <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'primary.main' }} />
                    )}
                  </Stack>
                </CardActionArea>
              </Card>

              {/* Black Option */}
              <Card
                sx={{
                  border: selectedColor === 'black' ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                  bgcolor: selectedColor === 'black' ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                }}
              >
                <CardActionArea
                  onClick={() => setSelectedColor('black')}
                  sx={{ p: 1.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        minWidth: 44,
                        borderRadius: '50%',
                        bgcolor: 'grey.900',
                        border: `2px solid ${theme.palette.divider}`,
                        boxShadow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="solar:checkers-bold" width={24} sx={{ color: 'common.white' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.25 }}>
                        Black
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        AI plays first
                      </Typography>
                    </Box>
                    {selectedColor === 'black' && (
                      <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'primary.main' }} />
                    )}
                  </Stack>
                </CardActionArea>
              </Card>
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1.5}>
            {onCancel && (
              <Button
                variant="outlined"
                size="large"
                onClick={onCancel}
                startIcon={<Iconify icon="solar:arrow-left-outline" width={20} />}
                sx={{
                  height: 48,
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  minWidth: 110,
                }}
              >
                Back
              </Button>
            )}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleConfirm}
              disabled={!selectedColor}
              startIcon={<Iconify icon="solar:play-bold" width={20} />}
              sx={{
                height: 48,
                fontWeight: 700,
                fontSize: '0.9375rem',
              }}
            >
              Start Game
            </Button>
          </Stack>
        </Stack>
      </Box>
    </BottomDrawer>
  );
}
