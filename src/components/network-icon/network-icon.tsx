'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type NetworkType = 'TRC20' | 'BSC' | 'TRON' | 'BINANCE';

type NetworkIconSize = 'small' | 'medium' | 'large';

interface NetworkIconProps {
  network: NetworkType;
  size?: NetworkIconSize | number;
  sx?: SxProps<Theme>;
}

// ----------------------------------------------------------------------

const NETWORK_CONFIG = {
  TRC20: {
    icon: 'cryptocurrency:trx',
    color: '#FF060A',
    label: 'Tron',
  },
  TRON: {
    icon: 'cryptocurrency:trx',
    color: '#FF060A',
    label: 'Tron',
  },
  BSC: {
    icon: 'cryptocurrency:bnb',
    color: '#F3BA2F',
    label: 'BNB',
  },
  BINANCE: {
    icon: 'cryptocurrency:bnb',
    color: '#F3BA2F',
    label: 'BNB',
  },
};

const SIZE_MAP = {
  small: 16,
  medium: 24,
  large: 32,
};

// ----------------------------------------------------------------------

export function NetworkIcon({ network, size = 'medium', sx }: NetworkIconProps) {
  const config = NETWORK_CONFIG[network];

  if (!config) {
    console.warn(`Unknown network type: ${network}`);
    return null;
  }

  const iconSize = typeof size === 'number' ? size : SIZE_MAP[size];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <Iconify icon={config.icon} width={iconSize} sx={{ color: config.color }} />
    </Box>
  );
}

// Export config for other components that need network info
export const getNetworkConfig = (network: NetworkType) => NETWORK_CONFIG[network];
