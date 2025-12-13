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
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { useTheme, alpha } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { BottomDrawer } from 'src/components/bottom-drawer';

import { MobileLayout } from 'src/layouts/dashboard/mobile-layout';

// ----------------------------------------------------------------------

type Network = 'TRC20' | 'BEP20' | 'ERC20' | 'SOL' | 'POLYGON' | 'TON' | 'AVAX' | 'OP' | 'ARB' | 'OPBNB' | 'CELO' | 'CRO';

interface NetworkOption {
  value: Network;
  label: string;
  icon: string;
  description: string;
  fee: string;
}

const NETWORKS: NetworkOption[] = [
  {
    value: 'TRC20',
    label: 'Tron (TRC20)',
    icon: 'cryptocurrency:trx',
    description: 'Low fee, Fast',
    fee: '1',
  },
  {
    value: 'BEP20',
    label: 'BNB Smart Chain (BEP20)',
    icon: 'cryptocurrency:bnb',
    description: 'Fast, Low cost',
    fee: '0.5',
  },
  {
    value: 'ERC20',
    label: 'Ethereum (ERC20)',
    icon: 'cryptocurrency:eth',
    description: 'Most secure',
    fee: '5',
  },
  {
    value: 'SOL',
    label: 'Solana',
    icon: 'cryptocurrency:sol',
    description: 'Ultra fast',
    fee: '0.1',
  },
  {
    value: 'POLYGON',
    label: 'Polygon POS',
    icon: 'cryptocurrency:matic',
    description: 'Low fees',
    fee: '0.2',
  },
  {
    value: 'TON',
    label: 'The Open Network',
    icon: 'cryptocurrency:ton',
    description: 'Telegram network',
    fee: '0.3',
  },
  {
    value: 'AVAX',
    label: 'AVAX C-Chain',
    icon: 'cryptocurrency:avax',
    description: 'Fast finality',
    fee: '1',
  },
  {
    value: 'OP',
    label: 'OP Mainnet',
    icon: 'cryptocurrency:op',
    description: 'Layer 2',
    fee: '0.5',
  },
  {
    value: 'ARB',
    label: 'Arbitrum One',
    icon: 'cryptocurrency:arb',
    description: 'Ethereum L2',
    fee: '0.5',
  },
  {
    value: 'OPBNB',
    label: 'opBNB',
    icon: 'cryptocurrency:bnb',
    description: 'BSC Layer 2',
    fee: '0.3',
  },
  {
    value: 'CELO',
    label: 'CELO',
    icon: 'cryptocurrency:celo',
    description: 'Mobile first',
    fee: '0.2',
  },
  {
    value: 'CRO',
    label: 'Cronos',
    icon: 'cryptocurrency:cro',
    description: 'Crypto.com chain',
    fee: '0.5',
  },
];

// Mock wallet data
const mockWallets: Record<Network, string> = {
  TRC20: 'TDF6jqSKdQdmSHRu2Fm4qyc3PnTT8Ru2Fm',
  BEP20: '0x1234567890abcdef1234567890abcdef12345678',
  ERC20: '0xabcdef1234567890abcdef1234567890abcdef12',
  SOL: '5Gv8bGxZfZ5YqZqHqZqHqZqHqZqHqZqHqZqHqZqH',
  POLYGON: '0x9876543210fedcba9876543210fedcba98765432',
  TON: 'EQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W4L4BXA3BQZP5mL',
  AVAX: '0xfedcba0987654321fedcba0987654321fedcba09',
  OP: '0x1111111111222222222233333333334444444444',
  ARB: '0x5555555555666666666677777777778888888888',
  OPBNB: '0x9999999999aaaaaaaaaabbbbbbbbbbcccccccccc',
  CELO: '0xddddddddddeeeeeeeeeeffffffffffffgggggggg',
  CRO: '0xhhhhhhhhhhiiiiiiiiiijjjjjjjjjjkkkkkkkkk',
};


// ----------------------------------------------------------------------

export default function DepositView() {
  const router = useRouter();
  const theme = useTheme();

  const [network, setNetwork] = useState<Network>('TRC20');
  const [networkDrawerOpen, setNetworkDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const selectedNetwork = NETWORKS.find((n) => n.value === network);
  const walletAddress = mockWallets[network];

  // Copy address to clipboard
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  // Check balance
  const handleCheckBalance = useCallback(async () => {
    setChecking(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setChecking(false);
  }, []);

  // Select network from drawer
  const handleNetworkSelect = useCallback((selectedNetwork: Network) => {
    setNetwork(selectedNetwork);
    setNetworkDrawerOpen(false);
  }, []);

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
                Deposit
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Add funds to your wallet
              </Typography>
            </Box>
          </Stack>

          {/* Crypto/Fiat Tabs */}
          <Stack direction="row" spacing={1}>
            <Chip
              label="Crypto"
              sx={{
                flex: 1,
                height: 36,
                fontSize: '0.8125rem',
                fontWeight: 600,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            />
            <Chip
              label="Fiat"
              disabled
              sx={{
                flex: 1,
                height: 36,
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            />
          </Stack>

          {/* Currency Selector */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Deposit Currency
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
                  <Typography variant="caption" color="text.secondary">
                    Fee: {selectedNetwork?.fee}
                  </Typography>
                </Box>
                <Iconify icon="solar:alt-arrow-down-outline" width={18} color="text.secondary" />
              </Stack>
            </Card>
          </Box>

          {/* Bonus Alert */}
          <Alert
            severity="success"
            icon={<Iconify icon="solar:gift-bold" width={18} />}
            sx={{
              py: 1,
              bgcolor: alpha(theme.palette.warning.main, 0.08),
              color: 'text.primary',
              '& .MuiAlert-icon': { color: 'warning.main' },
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Get extra <span style={{ color: theme.palette.warning.main }}>180% bonus</span> on
              minimum of <span style={{ color: theme.palette.warning.main }}>5 USDT</span> deposit
            </Typography>
          </Alert>

          {/* QR Code & Address */}
          {loading ? (
            <Card sx={{ p: 3 }}>
              <Stack alignItems="center" spacing={1.5}>
                <CircularProgress size={32} />
                <Typography variant="caption" color="text.secondary">
                  Generating address...
                </Typography>
              </Stack>
            </Card>
          ) : (
            <Card sx={{ p: 1.5 }}>
              <Stack spacing={1.5}>
                {/* QR Code */}
                <Stack alignItems="center">
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: 'white',
                      borderRadius: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      position: 'relative',
                    }}
                  >
                    <Box
                      component="img"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${walletAddress}`}
                      alt="QR Code"
                      sx={{ width: 120, height: 120, display: 'block' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                      }}
                    >
                      <Iconify icon="cryptocurrency:usdt" width={20} sx={{ color: 'white' }} />
                    </Box>
                  </Box>
                </Stack>

                {/* Address */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5, display: 'block' }}
                  >
                    Deposit address
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      p: 1.25,
                      borderRadius: 1.25,
                      bgcolor: 'background.neutral',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        flex: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      {walletAddress}
                    </Typography>
                  </Stack>
                </Box>

                {/* Copy Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="medium"
                  startIcon={
                    <Iconify
                      icon={copied ? 'solar:check-circle-bold' : 'solar:copy-outline'}
                      width={18}
                    />
                  }
                  onClick={handleCopy}
                  sx={{
                    height: 40,
                    bgcolor: copied ? 'success.main' : 'primary.main',
                    '&:hover': {
                      bgcolor: copied ? 'success.dark' : 'primary.dark',
                    },
                  }}
                >
                  {copied ? 'Copied!' : 'Copy Address'}
                </Button>
              </Stack>
            </Card>
          )}

          {/* Warning */}
          <Alert
            severity="info"
            icon={<Iconify icon="solar:info-circle-bold" width={18} />}
            sx={{ py: 1, bgcolor: alpha(theme.palette.info.main, 0.08) }}
          >
            <Stack spacing={0.25}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                ⚠️ Send only USDT to this deposit address.
              </Typography>
              <Typography variant="caption" fontSize="0.7rem">
                Transfers below 1 USDT will not be credited.
              </Typography>
            </Stack>
          </Alert>

          {/* Direct Wallet Connection */}
          <Card
            sx={{
              p: 1.5,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.12)} 100%)`,
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Stack flex={1}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                  Deposit From Your Wallet
                </Typography>
                <Typography variant="caption" fontSize="0.7rem" color="text.secondary">
                  Connect MetaMask, Trust Wallet & more
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5}>
                {['bitcoin', 'ethereum', 'usdc'].map((coin) => (
                  <Box
                    key={coin}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: theme.shadows[1],
                    }}
                  >
                    <Iconify icon={`cryptocurrency:${coin}`} width={16} />
                  </Box>
                ))}
                <Chip label="+300" size="small" sx={{ height: 28, fontSize: '0.7rem', fontWeight: 600 }} />
              </Stack>
            </Stack>
          </Card>

          {/* Check Balance */}
          <LoadingButton
            fullWidth
            variant="outlined"
            size="medium"
            onClick={handleCheckBalance}
            loading={checking}
            startIcon={<Iconify icon="solar:refresh-outline" width={18} />}
            sx={{ height: 40 }}
          >
            Check Balance
          </LoadingButton>
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
                  network === networkOption.value ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
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
