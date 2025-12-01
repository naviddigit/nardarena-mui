'use client';

import { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';

import QRCode from 'qrcode';

// ----------------------------------------------------------------------

interface QRCodeDisplayProps {
  address: string;
  network: 'TRC20' | 'BSC';
}

export function QRCodeDisplay({ address, network }: QRCodeDisplayProps) {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !address) return;

    QRCode.toCanvas(
      canvasRef.current,
      address,
      {
        width: 200,
        margin: 2,
        color: {
          dark: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
          light: theme.palette.mode === 'dark' ? '#161C24' : '#FFFFFF',
        },
      },
      (error) => {
        if (error) console.error('QR Code generation failed:', error);
      }
    );
  }, [address, theme.palette.mode]);

  return (
    <Stack alignItems="center" spacing={2}>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.grey[500], 0.08),
          border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
        }}
      >
        <canvas ref={canvasRef} />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Scan QR code to send USDT on {network} network
      </Typography>
    </Stack>
  );
}
