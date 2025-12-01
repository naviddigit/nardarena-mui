'use client';

import { useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { Alert, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { adminAPI, type AdminStats } from 'src/services/admin-api';
import { useAuthContext } from 'src/auth/hooks';

import { AppWelcome } from './app-welcome';
import { AppWidgetSummary } from './app-widget-summary';

// ----------------------------------------------------------------------

export function AdminDashboardView() {
  const { user } = useAuthContext();
  const theme = useTheme();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminAPI.getStats();
        setStats(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch admin stats:', err);
        setError(err.message || 'Failed to load statistics');
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
          Admin Dashboard
        </Typography>
        <Alert severity="error">{error}</Alert>
      </DashboardContent>
    );
  }

  if (!stats) {
    return (
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
          Admin Dashboard
        </Typography>
        <Typography>No data available</Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid xs={12} md={8}>
          <AppWelcome
            title={`Welcome back, ${user?.displayName || 'Admin'}! 👋`}
            description="Manage your Nard Arena platform from here."
            action={
              <Button variant="contained" color="primary" href="/dashboard/admin/users">
                Manage Users
              </Button>
            }
          />
        </Grid>

        {/* Quick Stats */}
        <Grid xs={12} md={4}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>{stats.newUsersThisWeek}</strong> new users this week
          </Alert>
          <Alert severity="success">
            <strong>{stats.activeGames}</strong> active games now
          </Alert>
        </Grid>

        {/* Widget Summaries */}
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total Users"
            percent={stats.newUsersThisWeek > 0 ? 12.5 : 0}
            total={stats.totalUsers}
            chart={{
              categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              series: [10, 15, 12, 18, 22, 25, stats.newUsersThisWeek],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total Games"
            percent={8.2}
            total={stats.totalGames}
            chart={{
              colors: [theme.vars.palette.info.main],
              categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              series: [45, 52, 48, 60, 55, 58, stats.activeGames],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Completed Games"
            percent={-0.5}
            total={stats.completedGames}
            chart={{
              colors: [theme.vars.palette.error.main],
              categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              series: [30, 35, 32, 40, 42, 45, Math.floor(stats.completedGames % 100)],
            }}
          />
        </Grid>

        {/* Game Types */}
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="AI Games"
            percent={5.2}
            total={stats.gamesByType.AI || 0}
            chart={{
              colors: [theme.vars.palette.success.main],
              categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              series: [10, 12, 15, 18, 20, 22, Math.floor((stats.gamesByType.AI || 0) % 30)],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Online Games"
            percent={3.8}
            total={stats.gamesByType.ONLINE || 0}
            chart={{
              colors: [theme.vars.palette.warning.main],
              categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              series: [5, 8, 10, 12, 15, 18, Math.floor((stats.gamesByType.ONLINE || 0) % 20)],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Tournament Games"
            percent={7.5}
            total={stats.gamesByType.TOURNAMENT || 0}
            chart={{
              colors: [theme.vars.palette.secondary.main],
              categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              series: [2, 3, 5, 7, 8, 10, Math.floor((stats.gamesByType.TOURNAMENT || 0) % 15)],
            }}
          />
        </Grid>

        {/* Total Moves */}
        <Grid xs={12}>
          <Alert severity="info" icon={false} sx={{ textAlign: 'center', py: 2 }}>
            🎮 Total Moves Played: <strong>{stats.totalMoves.toLocaleString()}</strong>
          </Alert>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
