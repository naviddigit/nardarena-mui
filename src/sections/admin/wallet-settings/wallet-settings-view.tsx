'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTheme, alpha } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface SystemSettings {
  // API Configuration
  trongrid_api_key: string;
  bscscan_api_key: string;

  // Network Settings
  use_testnet: boolean;
  balance_check_interval: number;
  min_confirmations: number;

  // Withdraw Limits
  withdraw_min_amount: number;
  withdraw_max_amount: number;
  withdraw_daily_limit: number;

  // Fee Configuration
  trc20_network_fee: number;
  bsc_network_fee: number;
  fee_percent: number;

  // Master Wallet
  trc20_master_wallet: string;
  bsc_master_wallet: string;

  // Auto Processing
  auto_withdraw_enabled: boolean;
  auto_settlement_enabled: boolean;
  settlement_threshold: number;
  settlement_time: string;
}

// ----------------------------------------------------------------------

export function WalletSettingsView() {
  const theme = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock initial data - will be fetched from API
  const [formData, setFormData] = useState<SystemSettings>({
    // API Configuration
    trongrid_api_key: '****-****-****-****',
    bscscan_api_key: '****-****-****-****',

    // Network Settings
    use_testnet: true,
    balance_check_interval: 10,
    min_confirmations: 3,

    // Withdraw Limits
    withdraw_min_amount: 10,
    withdraw_max_amount: 10000,
    withdraw_daily_limit: 5000,

    // Fee Configuration
    trc20_network_fee: 1.0,
    bsc_network_fee: 1.0,
    fee_percent: 0.5,

    // Master Wallet
    trc20_master_wallet: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    bsc_master_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',

    // Auto Processing
    auto_withdraw_enabled: false,
    auto_settlement_enabled: true,
    settlement_threshold: 1000,
    settlement_time: '02:00',
  });

  const handleChange = useCallback((field: keyof SystemSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/settings', {
      //   method: 'PUT',
      //   headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const calculateFeeExample = useCallback(() => {
    const amount = 100;
    const networkFee = formData.trc20_network_fee;
    const serviceFee = networkFee * (formData.fee_percent / 100);
    const totalFee = networkFee + serviceFee;
    const received = amount - totalFee;

    return {
      amount,
      networkFee,
      serviceFee,
      totalFee,
      received,
    };
  }, [formData.trc20_network_fee, formData.fee_percent]);

  const feeExample = calculateFeeExample();

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Wallet Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure wallet system, networks, fees, and limits
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:arrow-left-outline" />}
          onClick={() => router.push(paths.dashboard.root)}
        >
          Back
        </Button>
      </Stack>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSaveSuccess(false)}>
          Settings saved successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* API Configuration */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:key-bold" width={24} sx={{ color: 'primary.main' }} />
                <Typography variant="h6">API Configuration</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="TronGrid API Key"
                    value={formData.trongrid_api_key}
                    onChange={(e) => handleChange('trongrid_api_key', e.target.value)}
                    helperText="Get from https://www.trongrid.io"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="cryptocurrency:trx" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="BSCScan API Key"
                    value={formData.bscscan_api_key}
                    onChange={(e) => handleChange('bscscan_api_key', e.target.value)}
                    helperText="Get from https://bscscan.com/apis"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="cryptocurrency:bnb" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        {/* Network Settings */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:settings-bold" width={24} sx={{ color: 'info.main' }} />
                <Typography variant="h6">Network Settings</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.use_testnet}
                        onChange={(e) => handleChange('use_testnet', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Use Testnet
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Enable testnet for development/testing
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Balance Check Interval (minutes)"
                    value={formData.balance_check_interval}
                    onChange={(e) =>
                      handleChange('balance_check_interval', parseInt(e.target.value, 10))
                    }
                    helperText="How often to check wallet balances"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:clock-circle-outline" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Confirmations"
                    value={formData.min_confirmations}
                    onChange={(e) => handleChange('min_confirmations', parseInt(e.target.value, 10))}
                    helperText="Required confirmations for deposits"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:shield-check-outline" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        {/* Withdraw Limits */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:danger-bold" width={24} sx={{ color: 'warning.main' }} />
                <Typography variant="h6">Withdraw Limits</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Amount (USDT)"
                    value={formData.withdraw_min_amount}
                    onChange={(e) =>
                      handleChange('withdraw_min_amount', parseFloat(e.target.value))
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:dollar-outline" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Amount (USDT)"
                    value={formData.withdraw_max_amount}
                    onChange={(e) =>
                      handleChange('withdraw_max_amount', parseFloat(e.target.value))
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:dollar-outline" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Daily Limit (USDT)"
                    value={formData.withdraw_daily_limit}
                    onChange={(e) =>
                      handleChange('withdraw_daily_limit', parseFloat(e.target.value))
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:calendar-outline" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        {/* Fee Configuration */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:ticket-bold" width={24} sx={{ color: 'error.main' }} />
                <Typography variant="h6">Fee Configuration</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="TRC20 Network Fee (USDT)"
                    value={formData.trc20_network_fee}
                    onChange={(e) => handleChange('trc20_network_fee', parseFloat(e.target.value))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="cryptocurrency:trx" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="BSC Network Fee (USDT)"
                    value={formData.bsc_network_fee}
                    onChange={(e) => handleChange('bsc_network_fee', parseFloat(e.target.value))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="cryptocurrency:bnb" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Service Fee (%)"
                    value={formData.fee_percent}
                    onChange={(e) => handleChange('fee_percent', parseFloat(e.target.value))}
                    helperText="Percentage of network fee"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:percent-outline" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Fee Calculation Example */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Fee Calculation Example (100 USDT withdrawal on TRC20)
                </Typography>
                <Stack spacing={1} mt={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {feeExample.amount.toFixed(2)} USDT
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Network Fee
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      -{feeExample.networkFee.toFixed(2)} USDT
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Service Fee ({formData.fee_percent}%)
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      -{feeExample.serviceFee.toFixed(3)} USDT
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle2">User Receives</Typography>
                    <Typography variant="h6" color="success.main">
                      {feeExample.received.toFixed(2)} USDT
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Master Wallet */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:safe-2-bold" width={24} sx={{ color: 'success.main' }} />
                <Typography variant="h6">Master Wallet Addresses</Typography>
              </Box>
              <Alert severity="warning">
                Master wallet private keys are encrypted and stored securely. Only enter addresses
                here.
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="TRC20 Master Wallet"
                    value={formData.trc20_master_wallet}
                    onChange={(e) => handleChange('trc20_master_wallet', e.target.value)}
                    helperText="Tron wallet for settlements"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="cryptocurrency:trx" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="BSC Master Wallet"
                    value={formData.bsc_master_wallet}
                    onChange={(e) => handleChange('bsc_master_wallet', e.target.value)}
                    helperText="BSC wallet for settlements"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="cryptocurrency:bnb" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        {/* Auto Processing */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:play-bold" width={24} sx={{ color: 'primary.main' }} />
                <Typography variant="h6">Automated Processing</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.auto_withdraw_enabled}
                        onChange={(e) => handleChange('auto_withdraw_enabled', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Auto-Withdraw Processing
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Automatically process pending withdrawals
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.auto_settlement_enabled}
                        onChange={(e) => handleChange('auto_settlement_enabled', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Auto-Settlement
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Automatically move funds to master wallet
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Settlement Threshold (USDT)"
                    value={formData.settlement_threshold}
                    onChange={(e) =>
                      handleChange('settlement_threshold', parseFloat(e.target.value))
                    }
                    helperText="Minimum balance to trigger settlement"
                    disabled={!formData.auto_settlement_enabled}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:dollar-outline" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Settlement Time"
                    value={formData.settlement_time}
                    onChange={(e) => handleChange('settlement_time', e.target.value)}
                    helperText="Daily settlement execution time"
                    disabled={!formData.auto_settlement_enabled}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:clock-circle-outline" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => router.push(paths.dashboard.root)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleSave}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={20} />
              ) : (
                <Iconify icon="solar:diskette-bold" />
              )
            }
          >
            {loading ? 'Saving...' : 'Save All Settings'}
          </Button>
        </Box>
      </Stack>
    </DashboardContent>
  );
}
