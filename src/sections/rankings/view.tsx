'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

import { RankingWidget } from 'src/sections/dashboard/ranking-widget';

// ----------------------------------------------------------------------

type RankingPeriod = 'weekly' | 'monthly' | 'all-time';

export function RankingsView() {
  const [period, setPeriod] = useState<RankingPeriod>('weekly');

  const handlePeriodChange = (_event: React.SyntheticEvent, newValue: RankingPeriod) => {
    setPeriod(newValue);
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            Player Rankings
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Top players ranked by performance and achievements
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 1.5,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <Iconify icon="solar:cup-star-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle2" color="primary.main">
            Leaderboard
          </Typography>
        </Box>
      </Stack>

      {/* Period Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={period}
          onChange={handlePeriodChange}
          sx={{
            px: 2,
            bgcolor: 'background.neutral',
          }}
        >
          <Tab
            icon={<Iconify icon="solar:calendar-bold-duotone" width={20} />}
            iconPosition="start"
            label="This Week"
            value="weekly"
          />
          <Tab
            icon={<Iconify icon="solar:calendar-mark-bold-duotone" width={20} />}
            iconPosition="start"
            label="This Month"
            value="monthly"
          />
          <Tab
            icon={<Iconify icon="solar:history-bold-duotone" width={20} />}
            iconPosition="start"
            label="All Time"
            value="all-time"
          />
        </Tabs>
      </Card>

      {/* Info Cards */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card
          sx={{
            flex: 1,
            p: 2.5,
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
            border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.24)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify
              icon="solar:medal-star-bold-duotone"
              width={48}
              sx={{ color: 'warning.main' }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Top Player Rewards
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Top 3 players receive exclusive badges and bonus points
              </Typography>
            </Box>
          </Stack>
        </Card>

        <Card
          sx={{
            flex: 1,
            p: 2.5,
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
            border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.24)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="solar:chart-2-bold-duotone" width={48} sx={{ color: 'info.main' }} />
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Ranking System
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Rankings based on wins, win rate, and total points earned
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Stack>

      {/* Rankings Table */}
      <RankingWidget period={period} limit={50} />
    </DashboardContent>
  );
}
