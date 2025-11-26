'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type PlayerCardProps = {
  name: string;
  country: string;
  avatarUrl: string;
  isActive: boolean;
  onRollDice?: () => void;
  canRoll: boolean;
  onDone?: () => void;
  canDone?: boolean;
  onUndo?: () => void;
  canUndo?: boolean;
  timeRemaining?: number;
  checkerColor?: 'white' | 'black';
  isWinner?: boolean;
  isLoser?: boolean;
  setsWon?: number;
};

export function PlayerCard({ 
  name, 
  country, 
  avatarUrl, 
  isActive, 
  onRollDice, 
  canRoll,
  onDone,
  canDone = false,
  onUndo,
  canUndo = false,
  timeRemaining = 60,
  checkerColor = 'white',
  isWinner = false,
  isLoser = false,
  setsWon = 0,
}: PlayerCardProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    <Card 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: (theme) => theme.spacing(1.5, 1.5, 1.5, 1.5),
        border: (theme) => {
          if (isLoser) return `3px solid ${theme.palette.error.main}`;
          if (isActive) return `2px solid ${theme.palette.primary.main}`;
          return '2px solid transparent';
        },
        transition: 'all 0.3s ease-in-out',
        boxShadow: (theme) => isActive ? theme.shadows[8] : theme.shadows[2],
      }}
    >
      <Box sx={{ position: 'relative', mr: 2 }}>
        <Avatar alt={name} src={avatarUrl} sx={{ width: 48, height: 48 }} />
        {isWinner && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              bgcolor: 'warning.main',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2,
            }}
          >
            <Iconify icon="solar:cup-star-bold" width={16} sx={{ color: 'common.white' }} />
          </Box>
        )}
        {isLoser && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              bgcolor: 'error.main',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2,
            }}
          >
            <Iconify icon="solar:close-circle-bold" width={16} sx={{ color: 'common.white' }} />
          </Box>
        )}
      </Box>

      <ListItemText
        sx={{ flex: 1 }}
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {name}
            {setsWon > 0 && (
              <Box
                sx={{
                  bgcolor: 'success.main',
                  color: 'common.white',
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                {setsWon} WIN{setsWon > 1 ? 'S' : ''}
              </Box>
            )}
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: checkerColor === 'white' ? 'common.white' : 'grey.900',
                border: (theme) => `2px solid ${theme.palette.divider}`,
                boxShadow: 1,
                flexShrink: 0,
              }}
            />
          </Box>
        }
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Iconify icon="mingcute:location-fill" width={16} sx={{ flexShrink: 0, mr: 0.5 }} />
            {country}
          </Box>
        }
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        secondaryTypographyProps={{
          noWrap: true,
          component: 'span',
          typography: 'caption',
          color: 'text.disabled',
        }}
      />

      {/* Timer Display */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 50,
          mr: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'monospace',
            color: timeRemaining < 10 ? 'error.main' : 'text.primary',
            fontWeight: 600,
          }}
        >
          {timeDisplay}
        </Typography>
      </Box>

      {/* Action Buttons - Show only relevant button based on game state */}
      <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
        {/* Roll Button - Only show when player can roll */}
        {canRoll && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={onRollDice}
            sx={{ minWidth: 70, px: 1 }}
          >
            Roll
          </Button>
        )}
        
        {/* Undo Button - Show when player has made at least one move */}
        {canUndo && !canRoll && (
          <IconButton
            size="small"
            color="default"
            onClick={onUndo}
            sx={{
              width: 36,
              height: 36,
            }}
          >
            <Iconify icon="eva:arrow-back-fill" width={18} />
          </IconButton>
        )}

        {/* Done Button - Show when moves are complete and can finish turn */}
        {canDone && !canRoll && (
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={onDone}
            sx={{ minWidth: 70, px: 1 }}
          >
            Done
          </Button>
        )}
      </Stack>
    </Card>
  );
}
