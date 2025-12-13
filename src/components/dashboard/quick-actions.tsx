'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type QuickAction = {
  title: string;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  onClick: () => void;
};

type QuickActionsProps = {
  actions: QuickAction[];
};

export function QuickActions({ actions }: QuickActionsProps) {
  const theme = useTheme();

  return (
    <Grid container spacing={2}>
      {actions.map((action, index) => (
        <Grid key={index} item xs={6}>
          <Card
            onClick={action.onClick}
            sx={{
              p: 2.5,
              cursor: 'pointer',
              transition: 'all 0.3s',
              bgcolor: alpha(theme.palette[action.color].main, 0.08),
              border: `1px solid ${alpha(theme.palette[action.color].main, 0.2)}`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.customShadows.z8,
                bgcolor: alpha(theme.palette[action.color].main, 0.12),
              },
              '&:active': {
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette[action.color].main, 0.16),
                }}
              >
                <Iconify
                  icon={action.icon}
                  width={32}
                  sx={{ color: `${action.color}.main` }}
                />
              </Box>

              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {action.title}
              </Typography>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
