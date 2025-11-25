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
}: PlayerCardProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    <Card 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: (theme) => theme.spacing(3, 2, 3, 3),
        border: (theme) => isActive ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
        transition: 'all 0.3s ease-in-out',
        boxShadow: (theme) => isActive ? theme.shadows[8] : theme.shadows[2],
      }}
    >
      <Avatar alt={name} src={avatarUrl} sx={{ width: 48, height: 48, mr: 2 }} />

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {name}
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
          minWidth: 60,
          mr: 1.5,
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
      <Stack direction="column" spacing={1} sx={{ flexShrink: 0 }}>
        {/* Roll Button - Only show when player can roll */}
        {canRoll && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={onRollDice}
            sx={{ minWidth: 80 }}
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
              bgcolor: (theme) => theme.palette.background.neutral,
              '&:hover': { bgcolor: (theme) => theme.palette.action.hover },
              width: 80,
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
            sx={{ minWidth: 80 }}
          >
            Done
          </Button>
        )}
      </Stack>
    </Card>
  );
}
