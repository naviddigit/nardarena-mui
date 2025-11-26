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
  onBackToDashboard: () => void;
  whitePlayer: Player;
  blackPlayer: Player;
  maxSets?: number;
  currentSet?: number;
  isTimeout?: boolean;
};

// ----------------------------------------------------------------------

export function GameResultDialog({
  open,
  onRematch,
  onBackToDashboard,
  whitePlayer,
  blackPlayer,
  maxSets = 5,
  currentSet = 1,
  isTimeout = false,
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
              {isTimeout ? '⏰ Time Out!' : '🎉 Victory! 🎉'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isTimeout ? 'Game ended due to timeout' : 'Set completed'}
            </Typography>
          </Box>

          {/* Players Score Display */}
          <Stack
            direction="column"
            spacing={3}
            alignItems="stretch"
            sx={{ width: '100%', py: 2 }}
          >
            {/* Winner */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                bgcolor: 'background.neutral',
                borderRadius: 2,
                p: 2,
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={winner.avatarUrl}
                  alt={winner.name}
                  sx={{
                    width: 60,
                    height: 60,
                    border: (theme) => `4px solid ${theme.palette.success.main}`,
                    boxShadow: (theme) => theme.customShadows.success,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    bgcolor: 'warning.main',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 3,
                  }}
                >
                  <Iconify icon="solar:cup-star-bold" width={18} sx={{ color: 'common.white' }} />
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {winner.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isTimeout ? 'Winner by timeout' : 'Winner'}
                </Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: 'success.main',
                }}
              >
                {winner.score}
              </Typography>
            </Stack>

            {/* Score Info */}
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Set {currentSet} of {maxSets}
              </Typography>
            </Box>

            {/* Loser */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                bgcolor: 'background.neutral',
                borderRadius: 2,
                p: 2,
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={loser.avatarUrl}
                  alt={loser.name}
                  sx={{
                    width: 60,
                    height: 60,
                    border: (theme) => `4px solid ${theme.palette.error.main}`,
                    boxShadow: (theme) => theme.customShadows.error,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    bgcolor: 'error.main',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 3,
                  }}
                >
                  <Iconify
                    icon="solar:close-circle-bold"
                    width={18}
                    sx={{ color: 'common.white' }}
                  />
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {loser.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isTimeout ? 'Lost by timeout' : 'Defeated'}
                </Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: 'error.main',
                }}
              >
                {loser.score}
              </Typography>
            </Stack>
          </Stack>

          {/* Action Buttons */}
          <Stack spacing={2} sx={{ width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              color="primary"
              onClick={onRematch}
              startIcon={<Iconify icon="solar:refresh-bold" />}
              sx={{
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Play Again
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              color="inherit"
              onClick={onBackToDashboard}
              startIcon={<Iconify icon="solar:home-2-bold" />}
              sx={{
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Back to Dashboard
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
