'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';


import { useBoardTheme } from 'src/contexts/board-theme-context';
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
  totalTime?: number; // مقدار اولیه تایمر از بازی
  checkerColor?: 'white' | 'black';
  isWinner?: boolean;
  isLoser?: boolean;
  setsWon?: number;
  onAvatarClick?: (event: React.MouseEvent) => void;
  isAI?: boolean;
  position?: 'top' | 'bottom'; // موقعیت کاربر (بالا یا پایین)
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
  totalTime = 1800, // پیش‌فرض 30 دقیقه، ولی باید از بازی بیاد
  checkerColor = 'white',
  isWinner = false,
  isLoser = false,
  setsWon = 0,
  onAvatarClick,
  isAI = false,
  position = 'bottom', // پیش‌فرض: پایین
}: PlayerCardProps) {
  const { boardTheme } = useBoardTheme();
  
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  // محاسبه درصد تایمر برای progress bar (از مقدار واقعی بازی)
  const timePercentage = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));
  
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Timer Badge - بالا یا پایین بسته به position */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          ...(position === 'top' ? { bottom: -22 } : { top: -22 }),
          right: 8,
          fontSize: 9,
          fontWeight: 700,
          color: timeRemaining < 60 ? 'error.main' : 'text.primary',
          bgcolor: 'background.paper',
          px: 1,
          py: 0.25,
          borderRadius: 0.75,
          boxShadow: 1,
          zIndex: 1,
        }}
      >
        {timeDisplay}
      </Typography>

      <Card 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: (theme) => theme.spacing(1.5, 1.5, 1.5, 1.5),
          position: 'relative',
          overflow: 'visible',
          border: (theme) => {
            if (isLoser) return `3px solid ${theme.palette.error.main}`;
            if (isActive) return `2px solid ${theme.palette.primary.main}`;
            return '2px solid transparent';
          },
          transition: 'all 0.3s ease-in-out',
          boxShadow: (theme) => isActive ? theme.shadows[8] : theme.shadows[2],
        }}
      >
        {/* Progress Bar - به صورت background محو در پس‌زمینه کل کارت */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            borderRadius: 'inherit',
            zIndex: 0,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${timePercentage}%`,
              bgcolor: timeRemaining < 60 
                ? 'error.main'
                : (boardTheme?.lightSquareColor || 'primary.main'),
              opacity: 0.15,
              transition: 'width 1s linear, background-color 0.5s ease-in-out',
            }}
          />
        </Box>

      <Box sx={{ position: 'relative', mr: 2, zIndex: 1 }}>
        <Avatar 
          alt={name} 
          src={avatarUrl} 
          sx={{ 
            width: 48, 
            height: 48,
            cursor: onAvatarClick ? 'pointer' : 'default',
            '&:hover': onAvatarClick ? {
              boxShadow: (theme) => theme.shadows[4],
              transform: 'scale(1.05)',
            } : {}
          }}
          onClick={onAvatarClick}
        />
        {isAI && (
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              left: -4,
              bgcolor: 'primary.main',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2,
              zIndex: 1,
            }}
          >
            <Iconify icon="solar:cpu-bolt-bold" width={12} sx={{ color: 'common.white' }} />
          </Box>
        )}
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
        sx={{ flex: 1, zIndex: 1, position: 'relative' }}
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

      {/* دکمه مرکزی - تاس/تیک - وسط کارت، بالا یا پایین بسته به position */}
      <IconButton
        size="large"
        onClick={canDone ? onDone : onRollDice}
        disabled={!canRoll && !canDone}
        sx={{
          position: 'absolute',
          ...(position === 'top' ? { bottom: -28 } : { top: -28 }),
          left: '50%',
          transform: 'translateX(-50%)',
          width: 56,
          height: 56,
          bgcolor: canDone ? 'success.main' : canRoll ? 'primary.main' : 'action.disabledBackground',
          color: (canDone || canRoll) ? 'common.white' : 'action.disabled',
          border: (theme) => `4px solid ${theme.palette.background.paper}`,
          boxShadow: (theme) => `0 0 0 2px ${theme.palette.divider}, ${theme.shadows[4]}`,
          cursor: (canDone || canRoll) ? 'pointer' : 'default',
          '&:hover': {
            bgcolor: canDone ? 'success.dark' : canRoll ? 'primary.dark' : 'action.disabledBackground',
            transform: (canDone || canRoll) ? 'translateX(-50%) scale(1.08)' : 'translateX(-50%)',
            boxShadow: (theme) => (canDone || canRoll) 
              ? `0 0 0 2px ${theme.palette.divider}, ${theme.shadows[8]}`
              : `0 0 0 2px ${theme.palette.divider}, ${theme.shadows[4]}`,
          },
          '&.Mui-disabled': {
            bgcolor: 'action.disabledBackground',
            color: 'action.disabled',
            cursor: 'default',
          },
          transition: 'all 0.2s ease-in-out',
          zIndex: 2,
        }}
      >
        <Iconify 
          icon={canDone ? 'eva:checkmark-fill' : 'mdi:dice-5'} 
          width={canDone ? 28 : 26} 
        />
      </IconButton>

      {/* دکمه Undo - کنار دکمه مرکزی */}
      {canUndo && !canRoll && (
        <IconButton
          size="small"
          color="default"
          onClick={onUndo}
          sx={{
            position: 'absolute',
            ...(position === 'top' ? { bottom: -20 } : { top: -20 }),
            left: '50%',
            transform: 'translateX(40px)',
            width: 40,
            height: 40,
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: (theme) => `2px solid ${theme.palette.divider}`,
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'translateX(40px) scale(1.05)',
              boxShadow: 4,
            },
            transition: 'all 0.2s ease-in-out',
            zIndex: 2,
          }}
        >
          <Iconify icon="eva:arrow-back-fill" width={18} />
        </IconButton>
      )}

      {/* فضای خالی برای جلوگیری از overlap */}
      <Box sx={{ width: 80, zIndex: 1, position: 'relative' }} />

      {/* تعداد برد و رنگ مهره - سمت راست */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, zIndex: 1, position: 'relative' }}>
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
            minWidth: 45,
            textAlign: 'center',
          }}
        >
          {setsWon}W
        </Box>
        <Box
          sx={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            bgcolor: checkerColor === 'white' ? 'common.white' : 'grey.900',
            border: (theme) => `2px solid ${theme.palette.divider}`,
            boxShadow: 1,
            flexShrink: 0,
          }}
        />
      </Box>

      {/* Timer moved outside card - see top of component */}
      
    </Card>
    </Box>
  );
}
