'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
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

  if (!allTransactions || (allTransactions.length === 0 && !loading && !externalLoading)) {
    return (
      <Card>
        <CardContent>
          <Stack alignItems="center" justifyContent="center" py={5} spacing={2}>
            <Iconify
              icon="solar:wallet-outline"
              width={64}
              sx={{ color: 'text.disabled', opacity: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              No transactions yet
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Network</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Fee</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>TX Hash</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(allTransactions || []).map((transaction: any) => {
                const isDeposit = transaction.type === 'deposit';
                const amount = parseFloat(transaction.amount);
                const fee = transaction.totalFee ? parseFloat(transaction.totalFee) : 0;

                return (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
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
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={transaction.network}
                        size="small"
                        icon={<NetworkIcon network={transaction.network} size="small" />}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>

                    <TableCell align="right">
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
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {fee > 0 ? `${fee.toFixed(3)} USDT` : '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Label color={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Label>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {fDateTime(transaction.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {transaction.txHash ? (
                        <Tooltip title={transaction.txHash}>
                          <Typography
                            variant="body2"
                            fontFamily="monospace"
                            sx={{ cursor: 'pointer' }}
                          >
                            {formatAddress(transaction.txHash)}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          Pending...
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="right">
                      {transaction.txHash && (
                        <Tooltip title="View on Explorer">
                          <IconButton
                            size="small"
                            onClick={() =>
                              window.open(
                                getExplorerUrl(transaction.network, transaction.txHash!),
                                '_blank'
                              )
                            }
                          >
                            <Iconify icon="solar:link-minimalistic-2-outline" width={20} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </CardContent>
    </Card>
  );
}

