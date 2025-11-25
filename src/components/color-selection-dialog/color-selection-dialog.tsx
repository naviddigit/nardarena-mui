'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';

// ----------------------------------------------------------------------

type ColorSelectionDialogProps = {
  open: boolean;
  onSelectColor: (color: 'white' | 'black') => void;
};

// ----------------------------------------------------------------------

export function ColorSelectionDialog({ open, onSelectColor }: ColorSelectionDialogProps) {
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
              Choose Your Color
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select which checkers you want to play with
            </Typography>
          </Box>

          {/* Color Options */}
          <Stack
            direction="row"
            spacing={3}
            sx={{ width: '100%', justifyContent: 'center' }}
          >
            {/* White Option */}
            <Button
              variant="outlined"
              onClick={() => onSelectColor('white')}
              sx={{
                flex: 1,
                maxWidth: 200,
                py: 3,
                borderRadius: 2,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: (theme) => theme.palette.action.hover,
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
              variant="outlined"
              onClick={() => onSelectColor('black')}
              sx={{
                flex: 1,
                maxWidth: 200,
                py: 3,
                borderRadius: 2,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: (theme) => theme.palette.action.hover,
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
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
