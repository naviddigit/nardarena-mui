'use client';

// ⚠️ DO NOT MODIFY - Compact theme-aware widget for player dashboard
// Shows single stat with icon, value, trend indicator, and mini chart

import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';

import { fNumber, fPercent } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title: string;
  total: number;
  percent: number;
  icon: string;
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  chart: {
    categories: string[];
    series: number[];
  };
};

export function PlayerStatWidget({
  title,
  percent,
  total,
  icon,
  color = 'primary',
  chart,
  sx,
  ...other
}: Props) {
  const theme = useTheme();

  const chartColors = [theme.palette[color].main];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    stroke: { width: 0 },
    xaxis: { categories: chart.categories },
    tooltip: {
      y: { formatter: (value: number) => fNumber(value), title: { formatter: () => '' } },
    },
    plotOptions: { bar: { borderRadius: 1.5, columnWidth: '64%' } },
  });

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 3,
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Iconify icon={icon} width={24} sx={{ color: `${color}.main` }} />
          <Box sx={{ typography: 'subtitle2' }}>{title}</Box>
        </Box>

        <Box sx={{ typography: 'h3', mb: 1 }}>{fNumber(total)}</Box>

        <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
          <Iconify
            width={20}
            icon={
              percent < 0
                ? 'solar:double-alt-arrow-down-bold-duotone'
                : 'solar:double-alt-arrow-up-bold-duotone'
            }
            sx={{
              flexShrink: 0,
              color: 'success.main',
              ...(percent < 0 && { color: 'error.main' }),
            }}
          />

          <Box component="span" sx={{ typography: 'body2', fontWeight: 600 }}>
            {percent > 0 && '+'}
            {fPercent(percent)}
          </Box>
          <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
            vs last week
          </Box>
        </Box>
      </Box>

      <Chart
        type="bar"
        series={[{ data: chart.series }]}
        options={chartOptions}
        width={60}
        height={60}
      />
    </Card>
  );
}
