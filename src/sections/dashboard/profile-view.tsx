'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';

import { useAuthContext } from 'src/auth/hooks';

import { Iconify } from 'src/components/iconify';
import { BottomDrawer } from 'src/components/bottom-drawer';

import { MobileLayout } from 'src/layouts/dashboard/mobile-layout';

// ----------------------------------------------------------------------

export default function ProfileView() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    try {
      // TODO: Implement logout
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <MobileLayout>
      <Container maxWidth="sm" sx={{ pt: 2, pb: 2 }}>
        <Stack spacing={3}>
          {/* Profile Header */}
          <Card sx={{ p: 3 }}>
            <Stack alignItems="center" spacing={2}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      border: (theme) => `3px solid ${theme.palette.background.paper}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: 'white' }} />
                  </Box>
                }
              >
                <Avatar
                  src={user?.avatar || undefined}
                  sx={{
                    width: 96,
                    height: 96,
                    border: (theme) => `4px solid ${theme.palette.primary.main}`,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                </Avatar>
              </Badge>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {user?.displayName || user?.username || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {user?.id?.slice(0, 8) || '12345678'}
                </Typography>
              </Box>

              {/* Stats */}
              <Stack
                direction="row"
                spacing={3}
                divider={<Divider orientation="vertical" flexItem />}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    0
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Games
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    0
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Wins
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    0%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Win Rate
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Card>

          {/* Quick Actions */}
          <Stack spacing={1.5}>
            <ListItemButton
              onClick={() => router.push('/profile')}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Iconify icon="solar:user-bold-duotone" width={24} sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                Edit Profile
              </Typography>
              <Iconify icon="solar:alt-arrow-right-outline" width={20} color="text.secondary" />
            </ListItemButton>

            <ListItemButton
              onClick={() => router.push('/dashboard/game-history')}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Iconify icon="solar:history-bold-duotone" width={24} sx={{ mr: 2, color: 'info.main' }} />
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                Game History
              </Typography>
              <Iconify icon="solar:alt-arrow-right-outline" width={20} color="text.secondary" />
            </ListItemButton>

            <ListItemButton
              onClick={() => router.push('/dashboard/rankings')}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Iconify icon="solar:cup-star-bold-duotone" width={24} sx={{ mr: 2, color: 'warning.main' }} />
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                Rankings
              </Typography>
              <Iconify icon="solar:alt-arrow-right-outline" width={20} color="text.secondary" />
            </ListItemButton>

            <ListItemButton
              onClick={() => setSettingsDrawerOpen(true)}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Iconify icon="solar:settings-bold-duotone" width={24} sx={{ mr: 2, color: 'success.main' }} />
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                Settings
              </Typography>
              <Iconify icon="solar:alt-arrow-right-outline" width={20} color="text.secondary" />
            </ListItemButton>
          </Stack>

          {/* Logout Button */}
          <Button
            fullWidth
            size="large"
            color="error"
            variant="outlined"
            startIcon={<Iconify icon="solar:logout-2-bold" width={20} />}
            onClick={handleLogout}
            sx={{
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Logout
          </Button>
        </Stack>
      </Container>

      {/* Settings Drawer */}
      <BottomDrawer
        open={settingsDrawerOpen}
        onClose={() => setSettingsDrawerOpen(false)}
        title="⚙️ Settings"
        heightPercentage={70}
      >
        <Stack spacing={2} sx={{ p: 2 }}>
          {/* Sound */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.neutral',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Iconify icon="solar:music-note-2-bold-duotone" width={24} color="primary.main" />
              <Box>
                <Typography variant="subtitle2">Sound Effects</Typography>
                <Typography variant="caption" color="text.secondary">
                  Enable game sounds
                </Typography>
              </Box>
            </Stack>
            <Switch checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
          </Stack>

          {/* Notifications */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.neutral',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Iconify icon="solar:bell-bold-duotone" width={24} color="warning.main" />
              <Box>
                <Typography variant="subtitle2">Notifications</Typography>
                <Typography variant="caption" color="text.secondary">
                  Push notifications
                </Typography>
              </Box>
            </Stack>
            <Switch
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
          </Stack>

          <Divider />

          {/* Other Settings */}
          <ListItemButton
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: 2,
            }}
          >
            <Iconify icon="solar:pallete-2-bold-duotone" width={24} sx={{ mr: 2, color: 'info.main' }} />
            <Typography variant="subtitle2" sx={{ flex: 1 }}>
              Theme
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Dark
            </Typography>
          </ListItemButton>

          <ListItemButton
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: 2,
            }}
          >
            <Iconify icon="solar:shield-user-bold-duotone" width={24} sx={{ mr: 2, color: 'success.main' }} />
            <Typography variant="subtitle2" sx={{ flex: 1 }}>
              Security
            </Typography>
            <Iconify icon="solar:alt-arrow-right-outline" width={20} color="text.secondary" />
          </ListItemButton>

          <ListItemButton
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: 2,
            }}
          >
            <Iconify icon="solar:help-bold-duotone" width={24} sx={{ mr: 2, color: 'error.main' }} />
            <Typography variant="subtitle2" sx={{ flex: 1 }}>
              Help & Support
            </Typography>
            <Iconify icon="solar:alt-arrow-right-outline" width={20} color="text.secondary" />
          </ListItemButton>
        </Stack>
      </BottomDrawer>
    </MobileLayout>
  );
}
