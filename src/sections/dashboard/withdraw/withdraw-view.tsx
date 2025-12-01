'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CardContent from '@mui/material/CardContent';
import { useTheme, alpha } from '@mui/material/styles';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useMockedUser } from 'src/auth/hooks';

import { useAllWallets, useWithdraw } from 'src/hooks/use-wallet';
import * as walletApi from 'src/api/wallet';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

type Network = 'TRC20' | 'BSC';

interface FeeCalculation {
  amount: number;
  networkFee: number;
  serviceFee: number;
  totalFee: number;
  youReceive: number;
}

interface WithdrawLimits {
  min: number;
  max: number;
  dailyLimit: number;
  dailyUsed: number;
  remainingToday: number;
}

// ----------------------------------------------------------------------

export function WithdrawView() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useMockedUser();

  const [network, setNetwork] = useState<Network>('TRC20');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Use wallet hooks - Real API
  const { totalBalance: balance, loading: balanceLoading } = useAllWallets();
  const { withdraw: apiWithdraw, loading, error } = useWithdraw();

  // Mock data - will be replaced with API calls
  const [emailVerified] = useState(true);
  const [limits] = useState<WithdrawLimits>({
    min: 10,
    max: 10000,
    dailyLimit: 5000,
    dailyUsed: 500,
    remainingToday: 4500,
  });

  const [feeData, setFeeData] = useState<FeeCalculation>({
    amount: 0,
    networkFee: 1.0,
    serviceFee: 0.005,
    totalFee: 1.005,
    youReceive: 0,
  });
  const [loadingFees, setLoadingFees] = useState(false);

  // Validate address format
  const validateAddress = useCallback(
    (addr: string) => {
      if (!addr) {
        setAddressError(null);
        return false;
      }

      if (network === 'TRC20') {
        if (!addr.startsWith('T') || addr.length !== 34) {
          setAddressError('Invalid TRC20 address. Must start with T and be 34 characters.');
          return false;
        }
      } else if (network === 'BSC') {
        if (!addr.startsWith('0x') || addr.length !== 42) {
          setAddressError('Invalid BSC address. Must start with 0x and be 42 characters.');
          return false;
        }
      }

      setAddressError(null);
      return true;
    },
    [network]
  );

  // Fetch fee calculation from API
  const fetchFees = useCallback(async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setFeeData({
        amount: 0,
        networkFee: 1.0,
        serviceFee: 0.005,
        totalFee: 1.005,
        youReceive: 0,
      });
      return;
    }

    setLoadingFees(true);
    try {
      const data = await walletApi.getFeeCalculation(network, amountNum);
      setFeeData({
        amount: Number(data?.amount) || amountNum,
        networkFee: Number(data?.networkFee) || 1.0,
        serviceFee: Number(data?.serviceFee) || amountNum * 0.005,
        totalFee: Number(data?.totalFee) || 1.005,
        youReceive: Number(data?.youReceive) || amountNum - 1.005,
      });
    } catch (err) {
      console.error('Failed to fetch fees:', err);
      // Set default fee calculation on error
      const defaultNetworkFee = 1.0;
      const defaultServiceFee = amountNum * 0.005;
      const defaultTotalFee = defaultNetworkFee + defaultServiceFee;
      setFeeData({
        amount: amountNum,
        networkFee: defaultNetworkFee,
        serviceFee: defaultServiceFee,
        totalFee: defaultTotalFee,
        youReceive: amountNum - defaultTotalFee,
      });
    } finally {
      setLoadingFees(false);
    }
  }, [amount, network]);

  // Fetch fees when amount or network changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFees();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchFees]);

  // Validate address when it changes
  useEffect(() => {
    if (address) {
      validateAddress(address);
    }
  }, [address, validateAddress]);

  // Handle network change
  const handleNetworkChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newNetwork: Network | null) => {
      if (newNetwork) {
        setNetwork(newNetwork);
        setAddress('');
        setAddressError(null);
      }
    },
    []
  );

  // Handle withdraw
  const handleWithdraw = useCallback(async () => {
    setError(null);

    // Validations
    if (!address) {
      setError('Please enter destination address');
      return;
    }

    if (!validateAddress(address)) {
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setError('Please enter valid amount');
      return;
    }

    if (amountNum < limits.min) {
      setError(`Minimum withdrawal amount is ${limits.min} USDT`);
      return;
    }

    if (amountNum > limits.max) {
      setError(`Maximum withdrawal amount is ${limits.max} USDT`);
      return;
    }

    if (amountNum > balance) {
      setError('Insufficient balance');
      return;
    }

    if (amountNum > limits.remainingToday) {
      setError(
        `Daily limit exceeded. You can withdraw up to ${limits.remainingToday} USDT today`
      );
      return;
    }

    if (!emailVerified) {
      setError('Please verify your email before withdrawing');
      return;
    }

    setConfirmOpen(true);
  }, [address, amount, balance, limits, emailVerified, validateAddress]);

  // Confirm and submit withdrawal
  const handleConfirmWithdraw = useCallback(async () => {
    try {
      await apiWithdraw({
        network,
        toAddress: address,
        amount: parseFloat(amount),
      });

      setConfirmOpen(false);
      router.push(paths.dashboard.root);
    } catch (err) {
      console.error('Withdrawal failed:', err);
    }
  }, [network, address, amount, apiWithdraw, router]);

  const amountNum = parseFloat(amount) || 0;
  const canWithdraw =
    address &&
    !addressError &&
    amountNum >= limits.min &&
    amountNum <= limits.max &&
    amountNum <= balance &&
    amountNum <= limits.remainingToday &&
    emailVerified;

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Withdraw USDT
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Send USDT to your external wallet address
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:arrow-left-outline" />}
          onClick={() => router.push(paths.dashboard.root)}
        >
          Back to Dashboard
        </Button>
      </Stack>

      {/* Email Verification Warning */}
      {!emailVerified && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Email Verification Required
          </Typography>
          <Typography variant="body2">
            You must verify your email address before making withdrawals. Please check your inbox
            for the verification link.
          </Typography>
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Balance Card */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Available Balance
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {balance?.toFixed(2) || '0.00'} USDT
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  Daily Limit Remaining
                </Typography>
                <Typography variant="h6" color="success.main">
                  {limits?.remainingToday?.toFixed(2) || '0.00'} USDT
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Withdraw Form */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
              {/* Network Selector */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Select Network
                </Typography>
                <ToggleButtonGroup
                  value={network}
                  exclusive
                  onChange={handleNetworkChange}
                  fullWidth
                  color="primary"
                >
                  <ToggleButton value="TRC20" sx={{ py: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="cryptocurrency:trx" width={24} />
                      <Box textAlign="left">
                        <Typography variant="subtitle2">TRC20 (Tron)</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Fee: ~1 USDT
                        </Typography>
                      </Box>
                    </Stack>
                  </ToggleButton>
                  <ToggleButton value="BSC" sx={{ py: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="cryptocurrency:bnb" width={24} />
                      <Box textAlign="left">
                        <Typography variant="subtitle2">BSC (Binance)</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Fee: ~1 USDT
                        </Typography>
                      </Box>
                    </Stack>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Destination Address */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Destination Address
                </Typography>
                <TextField
                  fullWidth
                  placeholder={
                    network === 'TRC20'
                      ? 'Enter TRC20 address (starts with T)'
                      : 'Enter BSC address (starts with 0x)'
                  }
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  error={!!addressError}
                  helperText={addressError || `Enter your ${network} wallet address`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:wallet-outline" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={async () => {
                            const text = await navigator.clipboard.readText();
                            setAddress(text);
                          }}
                        >
                          Paste
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Amount */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Amount
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  error={
                    amountNum > 0 &&
                    (amountNum < limits.min ||
                      amountNum > limits.max ||
                      amountNum > balance ||
                      amountNum > limits.remainingToday)
                  }
                  helperText={
                    amountNum > balance
                      ? `Insufficient balance (Available: ${balance?.toFixed(2) || '0.00'} USDT)`
                      : amountNum > limits.remainingToday
                        ? `Exceeds daily limit (Remaining: ${limits.remainingToday?.toFixed(2) || '0.00'} USDT)`
                        : amountNum > 0 && amountNum < limits.min
                          ? `Minimum amount is ${limits.min} USDT`
                          : amountNum > limits.max
                            ? `Maximum amount is ${limits.max} USDT`
                            : `Min: ${limits.min} USDT • Max: ${limits.max} USDT`
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:dollar-outline" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={() => setAmount(balance.toString())}
                          disabled={!balance}
                        >
                          MAX
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Fee Breakdown */}
              {amountNum > 0 && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.info.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Fee Breakdown
                  </Typography>
                  <Stack spacing={1.5} mt={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Amount
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {feeData?.amount?.toFixed(2) || '0.00'} USDT
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Network Fee
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        -{feeData?.networkFee?.toFixed(2) || '0.00'} USDT
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Service Fee (0.5%)
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        -{feeData?.serviceFee?.toFixed(3) || '0.000'} USDT
                      </Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle2">You Will Receive</Typography>
                      <Typography variant="h6" color="success.main">
                        {feeData?.youReceive?.toFixed(2) || '0.00'} USDT
                      </Typography>
                    </Stack>
                  </Stack>
                  {loadingFees && (
                    <Box display="flex" justifyContent="center" mt={1}>
                      <CircularProgress size={16} />
                    </Box>
                  )}
                </Box>
              )}

              {/* Error Message */}
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                fullWidth
                size="large"
                variant="contained"
                color="error"
                disabled={!canWithdraw || loading}
                onClick={handleWithdraw}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <Iconify icon="solar:upload-outline" />
                }
              >
                {loading ? 'Processing...' : 'Withdraw USDT'}
              </Button>

              {/* Important Notes */}
              <Alert severity="warning" icon={<Iconify icon="solar:info-circle-bold" />}>
                <Typography variant="subtitle2" gutterBottom>
                  Important:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Double-check the address. Transactions are irreversible
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Only send to <strong>{network}</strong> compatible addresses
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Withdrawals are processed within 5-30 minutes
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Daily limit: {limits.dailyLimit} USDT (Used: {limits.dailyUsed} USDT)
                    </Typography>
                  </li>
                </Box>
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Withdrawal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning">Please verify all details before confirming</Alert>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Network
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {network}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Destination Address
              </Typography>
              <Typography
                variant="body2"
                fontFamily="monospace"
                sx={{
                  wordBreak: 'break-all',
                  p: 1,
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                  borderRadius: 1,
                }}
              >
                {address}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Amount</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {feeData?.amount?.toFixed(2) || '0.00'} USDT
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Total Fee</Typography>
                  <Typography variant="body2" color="error.main">
                    -{feeData?.totalFee?.toFixed(3) || '0.000'} USDT
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2">You Will Receive</Typography>
                  <Typography variant="h6" color="success.main">
                    {feeData?.youReceive?.toFixed(2) || '0.00'} USDT
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmWithdraw}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            {loading ? 'Processing...' : 'Confirm Withdrawal'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
