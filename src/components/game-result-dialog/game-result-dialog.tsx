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
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: (theme) => theme.customShadows.dialog,
          mx: { xs: 2, sm: 3 },
          maxWidth: { xs: '90%', sm: '600px' },
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack spacing={{ xs: 3, sm: 4 }} alignItems="center">
          {/* Victory Title */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2.5rem' }
              }}
            >
              {isTimeout ? '⏰ Time Out!' : '🎉 Victory! 🎉'}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                mb: isTimeout ? 1 : 0
              }}
            >
              {isTimeout ? 'Game ended - Time expired' : 'Match completed'}
            </Typography>
            
            {/* Additional timeout info */}
            {isTimeout && (
              <Box
                sx={{
                  mt: 2,
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: 'error.lighter',
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.error.light}`,
                }}
              >
                <Typography 
                  variant="body2" 
                  color="error.dark"
                  sx={{ 
                    fontWeight: 500,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}
                >
                  {loser.name} ran out of time and lost the match
                </Typography>
              </Box>
            )}
          </Box>

          {/* Players Score Display */}
          <Stack
            direction="column"
            spacing={{ xs: 2, sm: 3 }}
            alignItems="stretch"
            sx={{ width: '100%', py: { xs: 1, sm: 2 } }}
          >
            {/* Winner */}
            <Stack
              direction="row"
              spacing={{ xs: 1.5, sm: 2 }}
              alignItems="center"
              sx={{
                bgcolor: 'background.neutral',
                borderRadius: 2,
                p: { xs: 1.5, sm: 2 },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={winner.avatarUrl}
                  alt={winner.name}
                  sx={{
                    width: { xs: 50, sm: 60 },
                    height: { xs: 50, sm: 60 },
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
                    width: { xs: 24, sm: 28 },
                    height: { xs: 24, sm: 28 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 3,
                  }}
                >
                  <Iconify icon="solar:cup-star-bold" width={{ xs: 16, sm: 18 }} sx={{ color: 'common.white' }} />
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.main', fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
                  {winner.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {isTimeout ? 'Won - Opponent ran out of time' : 'Winner'}
                </Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: 'success.main',
                  fontSize: { xs: '1.5rem', sm: '1.75rem' }
                }}
              >
                {winner.score}
              </Typography>
            </Stack>

            {/* Score Info */}
            <Box sx={{ textAlign: 'center', py: { xs: 0.5, sm: 1 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Set {currentSet} of {maxSets}
              </Typography>
            </Box>

            {/* Loser */}
            <Stack
              direction="row"
              spacing={{ xs: 1.5, sm: 2 }}
              alignItems="center"
              sx={{
                bgcolor: 'background.neutral',
                borderRadius: 2,
                p: { xs: 1.5, sm: 2 },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={loser.avatarUrl}
                  alt={loser.name}
                  sx={{
                    width: { xs: 50, sm: 60 },
                    height: { xs: 50, sm: 60 },
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
                    width: { xs: 24, sm: 28 },
                    height: { xs: 24, sm: 28 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 3,
                  }}
                >
                  <Iconify
                    icon="solar:close-circle-bold"
                    width={{ xs: 16, sm: 18 }}
                    sx={{ color: 'common.white' }}
                  />
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main', fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
                  {loser.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {isTimeout ? 'Lost - Time expired' : 'Defeated'}
                </Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: 'error.main',
                  fontSize: { xs: '1.5rem', sm: '1.75rem' }
                }}
              >
                {loser.score}
              </Typography>
            </Stack>
          </Stack>

          {/* Action Buttons */}
          <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              color="primary"
              onClick={onRematch}
              startIcon={<Iconify icon="solar:refresh-bold" />}
              sx={{
                py: { xs: 1.25, sm: 1.5 },
                fontWeight: 600,
                fontSize: { xs: '0.95rem', sm: '1rem' }
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
                py: { xs: 1.25, sm: 1.5 },
                fontWeight: 600,
                fontSize: { xs: '0.95rem', sm: '1rem' }
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
