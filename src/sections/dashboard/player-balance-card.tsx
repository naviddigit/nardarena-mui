'use client';

// ⚠️ DO NOT MODIFY - Compact USD balance card for player dashboard
// Shows current balance, deposits, earnings, withdrawals with action buttons

import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title: string;
  currentBalance: number;
  deposited: number;
  earned: number;
  withdrawn: number;
};

export function PlayerBalanceCard({
  sx,
  title,
  earned,
  withdrawn,
  deposited,
  currentBalance,
  ...other
}: Props) {
  const theme = useTheme();
  const router = useRouter();

  const row = (label: string, value: number, isMain?: boolean) => (
    <Box
      sx={{
        display: 'flex',
        typography: isMain ? 'subtitle1' : 'body2',
        justifyContent: 'space-between',
        fontWeight: isMain ? 600 : 400,
      }}
    >
      <Box component="span" sx={{ color: isMain ? 'text.primary' : 'text.secondary' }}>
        {label}
      </Box>
      <Box
        component="span"
        sx={{ color: isMain ? 'success.main' : 'text.primary', fontWeight: 600 }}
      >
        {fCurrency(value)}
      </Box>
    </Box>
  );

  return (
    <Card sx={{ p: 3, ...sx }} {...other}>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="solar:wallet-bold" width={24} sx={{ color: 'primary.main' }} />
        <Box sx={{ typography: 'subtitle2' }}>{title}</Box>
      </Box>

      <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ typography: 'h3', color: 'primary.main' }}>{fCurrency(currentBalance)}</Box>

        {row('Deposited', deposited)}
        {row('Earned', earned, true)}
        {row('Withdrawn', withdrawn)}

        <Box sx={{ gap: 2, display: 'flex', mt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<Iconify icon="solar:upload-minimalistic-bold" />}
            onClick={() => router.push(paths.dashboard.deposit)}
          >
            Deposit
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Iconify icon="solar:download-minimalistic-bold" />}
            onClick={() => router.push(paths.dashboard.withdraw)}
          >
            Withdraw
          </Button>
        </Box>

        <Box sx={{ typography: 'caption', color: 'text.secondary', textAlign: 'center' }}>
          USDT via TRC20 or BSC • Min withdrawal: $10
        </Box>
      </Box>
    </Card>
  );
}
