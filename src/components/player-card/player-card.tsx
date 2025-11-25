'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';
import { DiceRoller } from 'src/components/dice-roller';

// ----------------------------------------------------------------------

type PlayerCardProps = {
  name: string;
  country: string;
  avatarUrl: string;
  isActive: boolean;
  onRollDice?: (results: { value: number; type: string }[]) => void;
  canRoll: boolean;
  diceNotation?: string;
};

export function PlayerCard({ 
  name, 
  country, 
  avatarUrl, 
  isActive, 
  onRollDice, 
  canRoll,
  diceNotation = '1d6',
}: PlayerCardProps) {
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
        primary={name}
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

      <Box sx={{ flexShrink: 0, ml: 1.5, minWidth: 80, visibility: canRoll ? 'visible' : 'hidden' }}>
        {canRoll && onRollDice && (
          <DiceRoller
            diceNotation={diceNotation}
            onRollComplete={onRollDice}
          />
        )}
      </Box>
    </Card>
  );
}
