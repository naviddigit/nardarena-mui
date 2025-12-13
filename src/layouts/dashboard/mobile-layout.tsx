'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type NavItem = {
  value: string;
  label: string;
  icon: string;
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    value: 'home',
    label: 'Home',
    icon: 'solar:home-2-bold',
    path: '/dashboard',
  },
  {
    value: 'play',
    label: 'Play',
    icon: 'solar:gameboy-bold',
    path: '/dashboard/play',
  },
  {
    value: 'wallet',
    label: 'Wallet',
    icon: 'solar:wallet-bold',
    path: '/dashboard/wallet',
  },
  {
    value: 'friends',
    label: 'Friends',
    icon: 'solar:users-group-rounded-bold',
    path: '/dashboard/friends',
  },
  {
    value: 'profile',
    label: 'Me',
    icon: 'solar:user-bold',
    path: '/dashboard/profile',
  },
];

// ----------------------------------------------------------------------

type MobileLayoutProps = {
  children: React.ReactNode;
};

export function MobileLayout({ children }: MobileLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // تشخیص تب فعلی از URL
  const getCurrentTab = () => {
    const currentNav = NAV_ITEMS.find((item) => pathname === item.path);
    return currentNav?.value || 'home';
  };

  const [value, setValue] = useState(getCurrentTab());

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    const navItem = NAV_ITEMS.find((item) => item.value === newValue);
    if (navItem) {
      router.push(navItem.path);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          pb: 8, // فاصله برای Bottom Navigation
          overflow: 'auto',
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar,
          borderTop: `1px solid ${theme.palette.divider}`,
          borderRadius: 0,
        }}
        elevation={8}
      >
        <BottomNavigation
          value={value}
          onChange={handleChange}
          showLabels
          sx={{
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 12px 8px',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              marginTop: '4px',
              '&.Mui-selected': {
                fontSize: '0.75rem',
              },
            },
          }}
        >
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              value={item.value}
              icon={<Iconify icon={item.icon} width={24} />}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
