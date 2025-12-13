'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { MobileLayout } from 'src/layouts/dashboard/mobile-layout';

// ----------------------------------------------------------------------

type Friend = {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  status: string;
  gamesPlayed: number;
};

type WatchHistory = {
  id: string;
  players: string;
  duration: string;
  date: string;
};

const MOCK_FRIENDS: Friend[] = [
  {
    id: '1',
    name: 'Ali_Player',
    avatar: '/assets/images/avatar/avatar-6.webp',
    isOnline: true,
    status: 'Playing now',
    gamesPlayed: 145,
  },
  {
    id: '2',
    name: 'MohammadG',
    avatar: '/assets/images/avatar/avatar-7.webp',
    isOnline: false,
    status: '2 hours ago',
    gamesPlayed: 89,
  },
  {
    id: '3',
    name: 'Sara123',
    avatar: '/assets/images/avatar/avatar-8.webp',
    isOnline: true,
    status: 'Online',
    gamesPlayed: 234,
  },
];

const MOCK_WATCH_HISTORY: WatchHistory[] = [
  {
    id: '1',
    players: 'Ali vs Reza',
    duration: '45 mins',
    date: 'Yesterday',
  },
  {
    id: '2',
    players: 'Tournament Final',
    duration: '1h 20m',
    date: '2 days ago',
  },
];

// ----------------------------------------------------------------------

export default function FriendsView() {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState('friends');

  return (
    <MobileLayout>
      <Container maxWidth="sm" sx={{ pt: 2, pb: 2 }}>
        <Stack spacing={2.5}>
          {/* Header */}
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Friends
          </Typography>

          {/* Tabs */}
          <Stack direction="row" spacing={1}>
            <Chip
              label={`Friends (${MOCK_FRIENDS.length})`}
              icon={<Iconify icon="solar:users-group-rounded-bold" width={16} sx={{ color: currentTab === 'friends' ? 'common.white' : 'text.secondary' }} />}
              onClick={() => setCurrentTab('friends')}
              color={currentTab === 'friends' ? 'primary' : 'default'}
              variant={currentTab === 'friends' ? 'filled' : 'outlined'}
              sx={{
                height: 36,
                fontWeight: 600,
                ...(currentTab !== 'friends' && {
                  bgcolor: 'transparent',
                  borderColor: alpha(theme.palette.text.disabled, 0.16),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.text.primary, 0.08),
                  },
                }),
              }}
            />
            <Chip
              label="Watch History"
              icon={<Iconify icon="solar:eye-bold" width={16} sx={{ color: currentTab === 'watch' ? 'common.white' : 'text.secondary' }} />}
              onClick={() => setCurrentTab('watch')}
              color={currentTab === 'watch' ? 'primary' : 'default'}
              variant={currentTab === 'watch' ? 'filled' : 'outlined'}
              sx={{
                height: 36,
                fontWeight: 600,
                ...(currentTab !== 'watch' && {
                  bgcolor: 'transparent',
                  borderColor: alpha(theme.palette.text.disabled, 0.16),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.text.primary, 0.08),
                  },
                }),
              }}
            />
          </Stack>

          {/* Friends Tab */}
          {currentTab === 'friends' && (
            <Stack spacing={1.5}>
              {MOCK_FRIENDS.map((friend) => (
                <Card key={friend.id} sx={{ p: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    {/* Avatar with Online Badge */}
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: friend.isOnline ? 'success.main' : 'grey.500',
                            border: `2px solid ${theme.palette.background.paper}`,
                          }}
                        />
                      }
                    >
                      <Avatar
                        src={friend.avatar}
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: 'primary.main',
                        }}
                      >
                        {friend.name[0].toUpperCase()}
                      </Avatar>
                    </Badge>

                    {/* Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                        {friend.name}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                          {friend.status}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                          {friend.gamesPlayed} games
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Actions */}
                    {friend.isOnline ? (
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                          }}
                        >
                          <Iconify icon="solar:gameboy-bold" width={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: 'info.main',
                            '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) },
                          }}
                        >
                          <Iconify icon="solar:eye-bold" width={18} />
                        </IconButton>
                      </Stack>
                    ) : (
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: 'background.neutral',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Iconify icon="solar:user-bold" width={18} />
                      </IconButton>
                    )}
                  </Stack>
                </Card>
              ))}

              {/* Add Friend Button */}
              <Button
                fullWidth
                variant="outlined"
                size="medium"
                startIcon={<Iconify icon="solar:add-circle-bold" width={20} />}
                sx={{
                  py: 1.25,
                  borderStyle: 'dashed',
                }}
              >
                Add New Friend
              </Button>
            </Stack>
          )}

          {/* Watch History Tab */}
          {currentTab === 'watch' && (
            <Stack spacing={2}>
              {/* Stats Card */}
              <Card
                sx={{
                  p: 1.5,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.dark, 0.15)} 100%)`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      bgcolor: 'info.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="solar:eye-bold" width={24} sx={{ color: 'common.white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      12 Games
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Watched this week (3h 25m)
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              {/* Watch History List */}
              {MOCK_WATCH_HISTORY.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  RECENT
                </Typography>
              )}

              <Stack spacing={1}>
                {MOCK_WATCH_HISTORY.map((item) => (
                  <Card key={item.id} sx={{ p: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Iconify
                          icon="solar:play-circle-bold"
                          width={22}
                          sx={{ color: 'info.main' }}
                        />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                          {item.players}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Chip
                            label={item.duration}
                            size="small"
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                            • {item.date}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Card>
                ))}

                {MOCK_WATCH_HISTORY.length === 0 && (
                  <Card sx={{ p: 3 }}>
                    <Stack alignItems="center" spacing={1}>
                      <Iconify icon="solar:eye-bold" width={48} sx={{ opacity: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">
                        No watch history yet
                      </Typography>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Container>
    </MobileLayout>
  );
}
