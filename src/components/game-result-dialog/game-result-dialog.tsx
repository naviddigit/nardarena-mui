'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Backdrop from '@mui/material/Backdrop';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Player = {
  name: string;
  avatarUrl: string;
  score: number;
  isWinner: boolean;
};

type GameResultDialogProps = {
  open: boolean;
  onRematch: () => void;
  whitePlayer: Player;
  blackPlayer: Player;
  maxSets?: number;
};

// ----------------------------------------------------------------------

export function GameResultDialog({
  open,
  onRematch,
  whitePlayer,
  blackPlayer,
  maxSets = 5,
}: GameResultDialogProps) {
  const winner = whitePlayer.isWinner ? whitePlayer : blackPlayer;
  const loser = whitePlayer.isWinner ? blackPlayer : whitePlayer;

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      BackdropComponent={Backdrop}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: (theme) => theme.customShadows.dialog,
        },
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={4} alignItems="center">
          {/* Victory Title */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              🎉 Victory! 🎉
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set completed
            </Typography>
          </Box>

          {/* Players Score Display */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems="center"
            justifyContent="center"
            sx={{ width: '100%', py: 2 }}
          >
            {/* Winner */}
            <Stack alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={winner.avatarUrl}
                  alt={winner.name}
                  sx={{
                    width: 80,
                    height: 80,
                    border: (theme) => `4px solid ${theme.palette.success.main}`,
                    boxShadow: (theme) => theme.customShadows.success,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    right: -8,
                    bgcolor: 'warning.main',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 3,
                  }}
                >
                  <Iconify icon="solar:cup-star-bold" width={24} sx={{ color: 'common.white' }} />
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {winner.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Winner
                </Typography>
              </Box>
            </Stack>

            {/* Score */}
            <Box
              sx={{
                bgcolor: 'background.neutral',
                borderRadius: 2,
                px: 3,
                py: 2,
                minWidth: 100,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  textAlign: 'center',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                {winner.score} - {loser.score}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}
              >
                of {maxSets}
              </Typography>
            </Box>

            {/* Loser */}
            <Stack alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={loser.avatarUrl}
                  alt={loser.name}
                  sx={{
                    width: 80,
                    height: 80,
                    border: (theme) => `4px solid ${theme.palette.error.main}`,
                    boxShadow: (theme) => theme.customShadows.error,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    right: -8,
                    bgcolor: 'error.main',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 3,
                  }}
                >
                  <Iconify
                    icon="solar:close-circle-bold"
                    width={24}
                    sx={{ color: 'common.white' }}
                  />
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {loser.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Defeated
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {/* Rematch Button */}
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={onRematch}
            startIcon={<Iconify icon="solar:refresh-bold" />}
            sx={{
              minWidth: 200,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Rematch
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
