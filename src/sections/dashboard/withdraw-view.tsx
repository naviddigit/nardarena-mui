'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { useTheme, alpha } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { BottomDrawer } from 'src/components/bottom-drawer';

import { MobileLayout } from 'src/layouts/dashboard/mobile-layout';

// ----------------------------------------------------------------------

type Network = 'TRC20' | 'BEP20';

interface NetworkOption {
  value: Network;
  label: string;
  fullName: string;
  icon: string;
  description: string;
  fee: string;
  minWithdraw: number;
}

const NETWORKS: NetworkOption[] = [
  {
    value: 'TRC20',
    label: 'Tron (TRC20)',
    fullName: 'Tron Network',
    icon: 'cryptocurrency:trx',
    description: 'Low fee, Fast confirmation',
    fee: '1',
    minWithdraw: 5,
  },
  {
    value: 'BEP20',
    label: 'BNB Smart Chain (BEP20)',
    fullName: 'Binance Smart Chain',
    icon: 'cryptocurrency:bnb',
    description: 'Fast, Low cost',
    fee: '0.5',
    minWithdraw: 5,
  },
];

// ----------------------------------------------------------------------

export default function WithdrawView() {
  const router = useRouter();
  const theme = useTheme();

  const [network, setNetwork] = useState<Network>('TRC20');
  const [networkDrawerOpen, setNetworkDrawerOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const selectedNetwork = NETWORKS.find((n) => n.value === network);
  const availableBalance = 1250.0; // Mock data
  const networkFee = parseFloat(selectedNetwork?.fee || '0');
  const serviceFee = 0; // No service fee
  const withdrawAmount = parseFloat(amount) || 0;
  const receiveAmount = Math.max(0, withdrawAmount - networkFee - serviceFee);
  const isValidAmount = withdrawAmount >= (selectedNetwork?.minWithdraw || 5);

  // Select network from drawer
  const handleNetworkSelect = useCallback((selectedNetwork: Network) => {
    setNetwork(selectedNetwork);
    setNetworkDrawerOpen(false);
  }, []);

  // Set max amount
  const handleMaxAmount = useCallback(() => {
    setAmount(availableBalance.toString());
  }, [availableBalance]);

  // Withdraw
  const handleWithdraw = useCallback(async () => {
    if (!isValidAmount || !address) return;

    setWithdrawing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setWithdrawing(false);

    // Success: Reset form or show success message
    setAmount('');
    setAddress('');
  }, [isValidAmount, address]);

  return (
    <MobileLayout>
      <Container maxWidth="sm" sx={{ pt: 1.5, pb: 1.5 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => router.back()} size="small">
              <Iconify icon="solar:arrow-left-outline" width={20} />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Withdraw
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Transfer funds to external wallet
              </Typography>
            </Box>
          </Stack>

          {/* Balance Card */}
          <Card
            sx={{
              p: 1.5,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
            }}
          >
            <Stack spacing={0.75}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Available Balance
                </Typography>
                <Iconify icon="solar:wallet-bold" width={18} sx={{ opacity: 0.8 }} />
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                ${availableBalance.toFixed(2)}
              </Typography>
              <Typography variant="caption" fontSize="0.7rem" sx={{ opacity: 0.8 }}>
                USDT
              </Typography>
            </Stack>
          </Card>

          {/* Currency Selector */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Withdraw Currency
            </Typography>
            <Card
              sx={{
                p: 1.25,
                cursor: 'pointer',
                bgcolor: 'background.neutral',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="cryptocurrency:usdt" width={18} />
                </Box>
                <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
                  USDT
                </Typography>
                <Iconify icon="solar:alt-arrow-down-outline" width={18} color="text.secondary" />
              </Stack>
            </Card>
          </Box>

          {/* Network Selector */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Choose Coin Network
            </Typography>
            <Card
              onClick={() => setNetworkDrawerOpen(true)}
              sx={{
                p: 1.25,
                cursor: 'pointer',
                bgcolor: 'background.neutral',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={selectedNetwork?.icon || 'cryptocurrency:trx'} width={18} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedNetwork?.label}
                  </Typography>
                  <Typography variant="caption" fontSize="0.7rem" color="text.secondary">
                    Fee: {selectedNetwork?.fee} USDT • Min: {selectedNetwork?.minWithdraw} USDT
                  </Typography>
                </Box>
                <Iconify icon="solar:alt-arrow-down-outline" width={18} color="text.secondary" />
              </Stack>
            </Card>
          </Box>

          {/* Amount Input */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Withdraw Amount
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min ${selectedNetwork?.minWithdraw} USDT`}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      USDT
                    </Typography>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Chip
                      label="MAX"
                      size="small"
                      onClick={handleMaxAmount}
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.125rem',
                  fontWeight: 600,
                },
              }}
            />
          </Box>

          {/* Address Input */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Withdrawal Address
            </Typography>
            <TextField
              fullWidth
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`Enter ${selectedNetwork?.label} address`}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          setAddress(text);
                        } catch (err) {
                          console.error('Failed to paste:', err);
                        }
                      }}
                    >
                      <Iconify icon="solar:clipboard-outline" width={18} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                },
              }}
            />
          </Box>

          {/* Fee Breakdown */}
          {withdrawAmount > 0 && (
            <Card sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {withdrawAmount.toFixed(2)} USDT
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Network Fee
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    -{networkFee.toFixed(2)} USDT
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Service Fee
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                    FREE
                  </Typography>
                </Stack>

                <Box sx={{ height: 1, bgcolor: 'divider' }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    You will receive
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: 'primary.main' }}
                  >
                    {receiveAmount.toFixed(2)} USDT
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          )}

          {/* Warning */}
          <Alert
            severity="warning"
            icon={<Iconify icon="solar:danger-triangle-bold" width={18} />}
            sx={{ py: 1, bgcolor: alpha(theme.palette.warning.main, 0.08) }}
          >
            <Stack spacing={0.25}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                ⚠️ Double-check the withdrawal address
              </Typography>
              <Typography variant="caption" fontSize="0.7rem">
                Sending to wrong address may result in permanent loss of funds.
              </Typography>
            </Stack>
          </Alert>

          {/* Withdraw Button */}
          <LoadingButton
            fullWidth
            variant="contained"
            size="medium"
            onClick={handleWithdraw}
            loading={withdrawing}
            disabled={!isValidAmount || !address}
            sx={{
              height: 44,
              fontSize: '0.9375rem',
              fontWeight: 700,
            }}
          >
            {!isValidAmount
              ? `Minimum ${selectedNetwork?.minWithdraw} USDT`
              : !address
                ? 'Enter Address'
                : `Withdraw ${receiveAmount.toFixed(2)} USDT`}
          </LoadingButton>

          {/* Info */}
          <Alert
            severity="info"
            icon={<Iconify icon="solar:info-circle-bold" width={18} />}
            sx={{ py: 1, bgcolor: alpha(theme.palette.info.main, 0.08) }}
          >
            <Stack spacing={0.25}>
              <Typography variant="caption" fontSize="0.7rem">
                • Withdrawals typically processed within 5-30 minutes
              </Typography>
              <Typography variant="caption" fontSize="0.7rem">
                • Network confirmations may take additional time
              </Typography>
              <Typography variant="caption" fontSize="0.7rem">
                • Contact support if withdrawal is delayed over 1 hour
              </Typography>
            </Stack>
          </Alert>
        </Stack>
      </Container>

      {/* Network Selection Drawer */}
      <BottomDrawer
        open={networkDrawerOpen}
        onClose={() => setNetworkDrawerOpen(false)}
        title="Select Network"
        heightPercentage={70}
      >
        <Stack spacing={0.75} sx={{ p: 1.5 }}>
          {NETWORKS.map((networkOption) => (
            <Card
              key={networkOption.value}
              onClick={() => handleNetworkSelect(networkOption.value)}
              sx={{
                p: 1.25,
                cursor: 'pointer',
                bgcolor:
                  network === networkOption.value
                    ? alpha(theme.palette.primary.main, 0.08)
                    : 'background.paper',
                border: `1px solid ${network === networkOption.value ? theme.palette.primary.main : theme.palette.divider}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={networkOption.icon} width={20} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {networkOption.label}
                  </Typography>
                  <Typography variant="caption" fontSize="0.7rem" color="text.secondary">
                    {networkOption.description}
                  </Typography>
                  <Typography variant="caption" fontSize="0.7rem" color="text.secondary" sx={{ display: 'block' }}>
                    Fee: {networkOption.fee} USDT • Min: {networkOption.minWithdraw} USDT
                  </Typography>
                </Box>
                {network === networkOption.value && (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: 'white' }} />
                  </Box>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      </BottomDrawer>
    </MobileLayout>
  );
}
