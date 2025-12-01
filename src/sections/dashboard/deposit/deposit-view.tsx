'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import { useTheme, alpha } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useMockedUser } from 'src/auth/hooks';

import { useWallet } from 'src/hooks/use-wallet';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { NetworkIcon } from 'src/components/network-icon';

import { QRCodeDisplay } from './qr-code-display';

// ----------------------------------------------------------------------

type Network = 'TRC20' | 'BSC';

interface WalletData {
  address: string;
  balance: string;
  network: Network;
}

// ----------------------------------------------------------------------

export function DepositView() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useMockedUser();

  const [network, setNetwork] = useState<Network>('TRC20');
  const [copied, setCopied] = useState(false);

  // Use wallet hook to fetch data from API
  const { wallet, loading, error, checking, checkBalance } = useWallet(network);

  // Copy address to clipboard
  const handleCopy = useCallback(() => {
    if (!wallet?.address) return;

    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [wallet?.address]);

  // Network change handler
  const handleNetworkChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newNetwork: Network | null) => {
      if (newNetwork) {
        setNetwork(newNetwork);
      }
    },
    []
  );

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Deposit USDT
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Send USDT to your wallet address to add funds
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

      {/* Network Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
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
                  <NetworkIcon network="TRC20" size="medium" />
                  <Box textAlign="left">
                    <Typography variant="subtitle2">USDT (TRC20)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tron Network • Low Fee
                    </Typography>
                  </Box>
                </Stack>
              </ToggleButton>
              <ToggleButton value="BSC" sx={{ py: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <NetworkIcon network="BSC" size="medium" />
                  <Box textAlign="left">
                    <Typography variant="subtitle2">USDT (BEP20)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      BSC Network • Fast
                    </Typography>
                  </Box>
                </Stack>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </CardContent>
      </Card>

      {/* Wallet Address */}
      {loading ? (
        <Card>
          <CardContent>
            <Stack alignItems="center" justifyContent="center" py={5} spacing={2}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading wallet...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : wallet ? (
        <Card>
          <CardContent>
            <Stack spacing={3}>
              {/* QR Code */}
              <QRCodeDisplay address={wallet.address} network={network} />

              {/* Address Display */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Your {network} Wallet Address
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    sx={{ flex: 1, wordBreak: 'break-all' }}
                  >
                    {wallet.address}
                  </Typography>
                  <Tooltip title={copied ? 'Copied!' : 'Copy address'}>
                    <IconButton onClick={handleCopy} size="small" color="primary">
                      <Iconify
                        icon={copied ? 'solar:check-circle-bold' : 'solar:copy-outline'}
                        width={20}
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              {/* Balance */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.16)}`,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Current Balance
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {wallet.balance} USDT
                  </Typography>
                </Box>
                <LoadingButton
                  variant="outlined"
                  size="small"
                  onClick={checkBalance}
                  loading={checking}
                  loadingPosition="start"
                  startIcon={<Iconify icon="solar:refresh-outline" />}
                >
                  Check Now
                </LoadingButton>


                
              </Stack>

              {/* Important Notes */}
              <Alert severity="warning" icon={<Iconify icon="solar:info-circle-bold" />}>
                <Typography variant="subtitle2" gutterBottom>
                  Important Notes:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Only send <strong>USDT</strong> on <strong>{network}</strong> network
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Minimum deposit: <strong>5 USDT</strong>
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Deposits are credited after network confirmations
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Sending other tokens may result in permanent loss
                    </Typography>
                  </li>
                </Box>
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      ) : null}
    </DashboardContent>
  );
}
