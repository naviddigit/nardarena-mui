'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';

import { useUserBalance } from 'src/hooks/use-user-data';

import { Iconify } from 'src/components/iconify';
import { BalanceCard } from 'src/components/dashboard/balance-card';

import { MobileLayout } from 'src/layouts/dashboard/mobile-layout';

// ----------------------------------------------------------------------

type Transaction = {
  id: string;
  type: 'deposit' | 'withdraw' | 'game_win' | 'game_loss';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'game_win',
    amount: 15.5,
    date: '2 mins ago',
    status: 'completed',
  },
  {
    id: '2',
    type: 'deposit',
    amount: 100.0,
    date: '1 hour ago',
    status: 'completed',
  },
  {
    id: '3',
    type: 'game_loss',
    amount: -5.0,
    date: '3 hours ago',
    status: 'completed',
  },
  {
    id: '4',
    type: 'withdraw',
    amount: -50.0,
    date: 'Yesterday',
    status: 'completed',
  },
  {
    id: '5',
    type: 'game_win',
    amount: 25.0,
    date: '2 days ago',
    status: 'completed',
  },
];

// ----------------------------------------------------------------------

export default function WalletView() {
  const theme = useTheme();
  const [filter, setFilter] = useState('all');
  const { balance, isLoading: balanceLoading } = useUserBalance();

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { label: string; icon: string; color: 'success' | 'warning' | 'info' | 'error' | 'primary' }> = {
      deposit: {
        label: 'Deposit',
        icon: 'solar:wallet-money-bold',
        color: 'success',
      },
      withdraw: {
        label: 'Withdraw',
        icon: 'solar:card-send-bold',
        color: 'warning',
      },
      game_win: {
        label: 'Game Win',
        icon: 'solar:cup-star-bold',
        color: 'info',
      },
      game_loss: {
        label: 'Game Fee',
        icon: 'solar:game-controller-old-bold',
        color: 'error',
      },
    };
    return configs[type] || { label: type, icon: 'solar:document-text-bold', color: 'primary' as const };
  };

  const filteredTransactions =
    filter === 'all'
      ? MOCK_TRANSACTIONS
      : MOCK_TRANSACTIONS.filter((t) => t.type.includes(filter));

  return (
    <MobileLayout>
      <Container maxWidth="sm" sx={{ pt: 2, pb: 2 }}>
        <Stack spacing={2.5}>
          {/* Header */}
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Wallet
          </Typography>

          {/* Balance Card */}
          {balanceLoading ? (
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} />
          ) : (
            <BalanceCard
              mainBalance={balance?.mainBalance ?? 0}
              giftPoolBalance={balance?.giftPoolBalance ?? 0}
              onDeposit={() => {}}
              onWithdraw={() => {}}
            />
          )}

          {/* Filters */}
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
            {['all', 'deposit', 'withdraw', 'game'].map((filterType) => (
              <Chip
                key={filterType}
                label={filterType === 'all' ? 'All' : filterType === 'game' ? 'Games' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                onClick={() => setFilter(filterType)}
                color={filter === filterType ? 'primary' : 'default'}
                variant={filter === filterType ? 'filled' : 'outlined'}
                sx={{
                  height: 32,
                  fontWeight: 600,
                  ...(filter !== filterType && {
                    bgcolor: 'transparent',
                    borderColor: alpha(theme.palette.text.disabled, 0.16),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.text.primary, 0.08),
                    },
                  }),
                }}
              />
            ))}
          </Stack>

          {/* Recent Transactions */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Recent Transactions
            </Typography>

            <Stack spacing={1}>
              {filteredTransactions.length === 0 ? (
                <Card sx={{ p: 3 }}>
                  <Stack alignItems="center" spacing={1}>
                    <Iconify icon="solar:document-text-bold" width={48} sx={{ opacity: 0.3 }} />
                    <Typography variant="body2" color="text.secondary">
                      No transactions found
                    </Typography>
                  </Stack>
                </Card>
              ) : (
                filteredTransactions.map((transaction) => {
                  const config = getTypeConfig(transaction.type);
                  const isPositive = transaction.amount > 0;

                  return (
                    <Card key={transaction.id} sx={{ p: 1.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        {/* Icon */}
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette[config.color].main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Iconify
                            icon={config.icon}
                            width={20}
                            sx={{ color: `${config.color}.main` }}
                          />
                        </Box>

                        {/* Details */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {config.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transaction.date}
                          </Typography>
                        </Box>

                        {/* Amount */}
                        <Stack alignItems="flex-end" spacing={0.25}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: isPositive ? 'success.main' : 'error.main',
                            }}
                          >
                            {isPositive ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                          </Typography>
                          <Chip
                            label={transaction.status}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              bgcolor:
                                transaction.status === 'completed'
                                  ? alpha(theme.palette.success.main, 0.1)
                                  : transaction.status === 'pending'
                                    ? alpha(theme.palette.warning.main, 0.1)
                                    : alpha(theme.palette.error.main, 0.1),
                              color:
                                transaction.status === 'completed'
                                  ? 'success.main'
                                  : transaction.status === 'pending'
                                    ? 'warning.main'
                                    : 'error.main',
                            }}
                          />
                        </Stack>
                      </Stack>
                    </Card>
                  );
                })
              )}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </MobileLayout>
  );
}
