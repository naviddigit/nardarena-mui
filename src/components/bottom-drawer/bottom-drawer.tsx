'use client';

import { useCallback, useState, useRef } from 'react';

import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type BottomDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hideCloseButton?: boolean;
  disableSwipeToClose?: boolean;
  /**
   * Custom height for mobile drawer
   * Can be: number (pixels), 'auto', or percentage string like '80%'
   */
  height?: number | string;
  /**
   * Height as percentage of viewport height for mobile (10-100)
   * Takes precedence over height prop if specified
   * Example: 60 = 60vh
   */
  heightPercentage?: number;
  /**
   * Show handle bar at top of drawer (for swipe indication)
   */
  showHandle?: boolean;
};

// ----------------------------------------------------------------------

export function BottomDrawer({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  hideCloseButton = false,
  disableSwipeToClose = false,
  height = 'auto',
  heightPercentage,
  showHandle = true,
}: BottomDrawerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disableSwipeToClose) return;
    setIsDragging(true);
    touchStartRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
  }, [disableSwipeToClose]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disableSwipeToClose || !isDragging) return;
    currentYRef.current = e.touches[0].clientY;
  }, [disableSwipeToClose, isDragging]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disableSwipeToClose) return;
    setIsDragging(false);
    const deltaY = currentYRef.current - touchStartRef.current;
    
    // If swiped down more than 100px, close
    if (deltaY > 100) {
      onClose();
    }
  }, [disableSwipeToClose, onClose]);

  // Desktop: Modal Dialog
  if (!isMobile) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={maxWidth}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
            overflow: 'hidden',
          },
        }}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 2,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            )}
            {!hideCloseButton && (
              <IconButton
                onClick={onClose}
                sx={{
                  ml: 'auto',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                  },
                }}
              >
                <Iconify icon="solar:close-circle-bold" width={24} />
              </IconButton>
            )}
          </Box>
        )}

        {/* Content */}
        <Box 
          sx={{ 
            p: 3,
            maxHeight: '70vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            // Custom scrollbar
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
              borderRadius: 1,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.3),
              borderRadius: 1,
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.4),
              },
            },
          }}
        >
          {children}
        </Box>
      </Dialog>
    );
  }

  // Calculate drawer height
  const drawerHeight = heightPercentage 
    ? `${heightPercentage}vh` 
    : (typeof height === 'number' ? `${height}px` : height);

  // Mobile: Bottom Drawer
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen={false}
      swipeAreaWidth={20}
      hysteresis={0.52}
      minFlingVelocity={450}
      disableBackdropTransition
      disableDiscovery
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: drawerHeight,
          maxHeight: drawerHeight,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.95),
          overflow: 'hidden',
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Handle Bar */}
        {showHandle && (
          <Box
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 1.5,
              cursor: 'grab',
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              '&:active': {
                cursor: 'grabbing',
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 4,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.3),
              }}
            />
          </Box>
        )}

        {/* Header */}
        {(title || !hideCloseButton) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              pb: 2,
              pt: showHandle ? 0 : 2,
            }}
          >
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            )}
            {!hideCloseButton && (
              <IconButton
                onClick={onClose}
                sx={{
                  ml: 'auto',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                  },
                }}
              >
                <Iconify icon="solar:close-circle-bold" width={24} />
              </IconButton>
            )}
          </Box>
        )}

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            px: 3,
            pb: 3,
            overflowY: 'auto',
            overflowX: 'hidden',
            // Hide scrollbar but keep functionality
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </SwipeableDrawer>
  );
}
