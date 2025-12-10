'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';
import Chip from '@mui/material/Chip';

import { useTransactions } from 'src/hooks/use-wallet';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { NetworkIcon } from 'src/components/network-icon';
import { DataTable, type DataTableColumn } from 'src/components/data-table';

// ----------------------------------------------------------------------

type TransactionStatus = 'pending' | 'confirmed' | 'completed' | 'failed' | 'processing';

interface WalletHistoryTableProps {
  loading?: boolean;
}

// ----------------------------------------------------------------------

export function WalletHistoryTable({ loading: externalLoading }: WalletHistoryTableProps) {
  const theme = useTheme();
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Use transactions hook - Real API
  const { allTransactions, loading, page, total, setPage } = useTransactions();

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'confirmed':
        return 'info';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getExplorerUrl = (network: string, txHash: string) => {
    if (network === 'TRC20') {
      return `https://tronscan.org/#/transaction/${txHash}`;
    }
    return `https://bscscan.com/tx/${txHash}`;
  };

  const formatAddress = (address: string) => {
    if (!address) return '-';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const columns: DataTableColumn<any>[] = [
    {
      id: 'type',
      label: 'Type',
      render: (transaction) => {
        const isDeposit = transaction.type === 'deposit';
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isDeposit
                  ? alpha(theme.palette.success.main, 0.16)
                  : alpha(theme.palette.error.main, 0.16),
              }}
            >
              <Iconify
                icon={
                  isDeposit
                    ? 'solar:download-minimalistic-bold'
                    : 'solar:upload-minimalistic-bold'
                }
                width={20}
                sx={{
                  color: isDeposit ? 'success.main' : 'error.main',
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
              {transaction.type}
            </Typography>
          </Stack>
        );
      },
    },
    {
      id: 'network',
      label: 'Network',
      render: (transaction) => (
        <Chip
          label={transaction.network}
          size="small"
          icon={<NetworkIcon network={transaction.network} size="small" />}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      id: 'amount',
      label: 'Amount',
      align: 'right',
      render: (transaction) => {
        const isDeposit = transaction.type === 'deposit';
        const amount = parseFloat(transaction.amount);
        return (
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              color: isDeposit ? 'success.main' : 'error.main',
            }}
          >
            {isDeposit ? '+' : '-'}
            {amount.toFixed(2)} USDT
          </Typography>
        );
      },
    },
    {
      id: 'fee',
      label: 'Fee',
      align: 'right',
      hideOnMobile: true,
      render: (transaction) => {
        const fee = transaction.totalFee ? parseFloat(transaction.totalFee) : 0;
        return (
          <Typography variant="body2" color="text.secondary">
            {fee > 0 ? `${fee.toFixed(3)} USDT` : '-'}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (transaction) => (
        <Label color={getStatusColor(transaction.status)}>{transaction.status}</Label>
      ),
    },
    {
      id: 'date',
      label: 'Date',
      hideOnMobile: true,
      render: (transaction) => (
        <Typography variant="body2" color="text.secondary">
          {fDateTime(transaction.createdAt)}
        </Typography>
      ),
    },
    {
      id: 'txHash',
      label: 'TX Hash',
      hideOnMobile: true,
      render: (transaction) =>
        transaction.txHash ? (
          <Tooltip title={transaction.txHash}>
            <Typography variant="body2" fontFamily="monospace" sx={{ cursor: 'pointer' }}>
              {formatAddress(transaction.txHash)}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.disabled">
            Pending...
          </Typography>
        ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      hideOnMobile: true,
      render: (transaction) =>
        transaction.txHash ? (
          <Tooltip title="View on Explorer">
            <IconButton
              size="small"
              onClick={() =>
                window.open(getExplorerUrl(transaction.network, transaction.txHash!), '_blank')
              }
            >
              <Iconify icon="solar:link-minimalistic-2-outline" width={20} />
            </IconButton>
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <DataTable
      title="Transaction History"
      columns={columns}
      rows={allTransactions || []}
      loading={loading || externalLoading}
      skeletonRows={5}
      page={page - 1}
      rowsPerPage={rowsPerPage}
      totalRows={total}
      onPageChange={(newPage) => setPage(newPage + 1)}
      onRowsPerPageChange={setRowsPerPage}
      emptyMessage="No transactions yet"
    />
  );
}
