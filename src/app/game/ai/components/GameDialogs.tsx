/**
 * ⛔ LOCKED - Game Dialogs Component
 * 
 * All dialog modals for the game:
 * - Exit confirmation dialog
 * - Game result dialog
 * - Color selection dialog
 * - Win text overlay
 */

'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { AnimatePresence, m } from 'framer-motion';

interface GameDialogsProps {
  // Exit Dialog
  exitDialogOpen: boolean;
  onExitCancel: () => void;
  onExitConfirm: () => void;

  // Result Dialog
  resultDialogOpen: boolean;
  winner: 'white' | 'black' | null;
  scores: { white: number; black: number };
  onResultClose: () => void;

  // Color Selection Dialog
  colorDialogOpen: boolean;
  onColorSelect: (color: 'white' | 'black') => void;

  // Win Text
  showWinText: boolean;
  winText: string;
  playerColor: 'white' | 'black';
}

export function GameDialogs({
  exitDialogOpen,
  onExitCancel,
  onExitConfirm,
  resultDialogOpen,
  winner,
  scores,
  onResultClose,
  colorDialogOpen,
  onColorSelect,
  showWinText,
  winText,
  playerColor,
}: GameDialogsProps) {
  
  return (
    <>
      {/* Exit Confirmation Dialog */}
      <Dialog
        open={exitDialogOpen}
        onClose={onExitCancel}
        aria-labelledby="exit-dialog-title"
      >
        <DialogTitle id="exit-dialog-title">Exit Game</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to exit? The game will be saved automatically.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onExitCancel}>Cancel</Button>
          <Button onClick={onExitConfirm} color="error" variant="contained">
            Exit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Game Result Dialog */}
      <Dialog
        open={resultDialogOpen}
        onClose={onResultClose}
        aria-labelledby="result-dialog-title"
      >
        <DialogTitle id="result-dialog-title">
          {winner ? `${winner.charAt(0).toUpperCase() + winner.slice(1)} Wins!` : 'Game Over'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Final Score:
          </Typography>
          <Typography>White: {scores.white}</Typography>
          <Typography>Black: {scores.black}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onResultClose} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Color Selection Dialog */}
      <Dialog
        open={colorDialogOpen}
        aria-labelledby="color-dialog-title"
        disableEscapeKeyDown
      >
        <DialogTitle id="color-dialog-title">Choose Your Color</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => onColorSelect('white')}
              sx={{
                width: 120,
                height: 120,
                borderRadius: 2,
                bgcolor: 'white',
                color: 'black',
                border: 2,
                '&:hover': {
                  bgcolor: 'grey.100',
                  borderColor: 'primary.main',
                },
              }}
            >
              White
            </Button>
            <Button
              variant="outlined"
              onClick={() => onColorSelect('black')}
              sx={{
                width: 120,
                height: 120,
                borderRadius: 2,
                bgcolor: 'black',
                color: 'white',
                border: 2,
                '&:hover': {
                  bgcolor: 'grey.900',
                  borderColor: 'primary.main',
                },
              }}
            >
              Black
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Win Text Overlay */}
      <AnimatePresence>
        {showWinText && (
          <Box
            component={m.div}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            <Typography
              variant="h1"
              sx={{
                color: playerColor === 'white' ? 'primary.main' : 'error.main',
                fontWeight: 'bold',
                textShadow: '0 0 20px rgba(0,0,0,0.5)',
                fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
              }}
            >
              {winText}
            </Typography>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
}
