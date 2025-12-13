'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type BalanceCardProps = {
  mainBalance: number;
  giftPoolBalance: number;
  currency?: string;
  onDeposit?: () => void;
  onWithdraw?: () => void;
};

export function BalanceCard({
  mainBalance,
  giftPoolBalance,
  currency = 'USDT',
  onDeposit,
  onWithdraw,
}: BalanceCardProps) {
  const theme = useTheme();

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalBalance = mainBalance + giftPoolBalance;

  return (
    <Card
      sx={{
        p: 2.5,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.primary.dark, 0.95)} 100%)`,
        color: 'common.white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Wallet Icon - Top Right */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.common.white, 0.15),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon="solar:wallet-bold" width={22} sx={{ opacity: 0.8 }} />
      </Box>

      <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Total Balance */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'common.white',
              opacity: 0.7,
              mb: 0.5,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Balance
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={0.5}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: '1.75rem',
                lineHeight: 1,
              }}
            >
              ${formatNumber(totalBalance)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'common.white',
                opacity: 0.8,
                fontWeight: 500,
              }}
            >
              {currency}
            </Typography>
          </Stack>
        </Box>

        {/* Sub Balances */}
        <Stack
          direction="row"
          spacing={2}
          divider={
            <Box
              sx={{
                width: 1,
                height: 30,
                bgcolor: alpha(theme.palette.common.white, 0.2),
              }}
            />
          }
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'common.white',
                opacity: 0.6,
                display: 'block',
                mb: 0.3,
                fontSize: '0.65rem',
              }}
            >
              Main Wallet
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              ${formatNumber(mainBalance)}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'common.white',
                opacity: 0.6,
                display: 'block',
                mb: 0.3,
                fontSize: '0.65rem',
              }}
            >
              Gift Pool
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              ${formatNumber(giftPoolBalance)}
            </Typography>
          </Box>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="contained"
            onClick={onDeposit}
            startIcon={<Iconify icon="solar:add-circle-bold" width={18} />}
            sx={{
              bgcolor: 'common.white',
              color: 'primary.main',
              fontWeight: 600,
              py: 1,
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.9),
              },
            }}
          >
            Deposit
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={onWithdraw}
            startIcon={<Iconify icon="solar:minus-circle-bold" width={18} />}
            sx={{
              borderColor: 'common.white',
              color: 'common.white',
              fontWeight: 600,
              py: 1,
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: 'common.white',
                bgcolor: alpha(theme.palette.common.white, 0.1),
              },
            }}
          >
            Withdraw
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
