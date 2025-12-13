import type { AdminUser } from 'src/services/admin-api';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { adminAPI } from 'src/services/admin-api';

// ----------------------------------------------------------------------

type Props = {
  user: AdminUser;
  open: boolean;
  onClose: () => void;
};

interface UserDetails {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  country: string | null;
  
  // Registration metadata
  registrationIp: string | null;
  registrationCountry: string | null;
  registrationDevice: string | null;
  registrationOs: string | null;
  registrationBrowser: string | null;
  
  // Timestamps
  createdAt: string;
  lastLoginAt: string | null;
  
  // Recent logins
  recentLogins: Array<{
    id: string;
    ipAddress: string;
    country: string | null;
    city: string | null;
    device: string | null;
    os: string | null;
    browser: string | null;
    success: boolean;
    failReason: string | null;
    createdAt: string;
  }>;
  
  // Login stats
  loginStats: {
    totalLogins: number;
    uniqueIps: number;
    uniqueCountries: number;
    countries: string[];
  };
}

export function AdminUserDetailsDialog({ user, open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user.id) {
      fetchUserDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user.id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getUserDetails(user.id);
      setDetails(data);
    } catch (err: any) {
      console.error('Failed to fetch user details:', err);
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const renderRegistrationInfo = () => {
    if (!details) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:user-plus-bold" />
          Registration Information
        </Typography>
        
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <InfoRow
            label="Registration Date"
            value={fDateTime(details.createdAt)}
            icon="solar:calendar-bold"
          />
          
          {details.registrationIp && (
            <InfoRow
              label="Registration IP"
              value={details.registrationIp}
              icon="solar:server-bold"
            />
          )}
          
          {details.registrationCountry && (
            <InfoRow
              label="Registration Country"
              value={details.registrationCountry}
              icon="solar:map-point-bold"
            />
          )}
          
          {details.registrationDevice && (
            <InfoRow
              label="Device"
              value={details.registrationDevice}
              icon="solar:smartphone-bold"
            />
          )}
          
          {details.registrationOs && (
            <InfoRow
              label="Operating System"
              value={details.registrationOs}
              icon="solar:display-bold"
            />
          )}
          
          {details.registrationBrowser && (
            <InfoRow
              label="Browser"
              value={details.registrationBrowser}
              icon="solar:browser-bold"
            />
          )}
        </Stack>
      </Box>
    );
  };

  const renderLoginStats = () => {
    if (!details) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:chart-2-bold" />
          Login Statistics
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<Iconify icon="solar:login-3-bold" />}
            label={`Total Logins: ${details.loginStats.totalLogins}`}
            color="primary"
            variant="outlined"
          />
          
          <Chip
            icon={<Iconify icon="solar:server-bold" />}
            label={`Unique IPs: ${details.loginStats.uniqueIps}`}
            color="info"
            variant="outlined"
          />
          
          <Chip
            icon={<Iconify icon="solar:map-point-bold" />}
            label={`Countries: ${details.loginStats.uniqueCountries}`}
            color="success"
            variant="outlined"
          />
        </Stack>

        {details.loginStats.countries.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Countries Used:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {details.loginStats.countries.map((country) => (
                <Chip key={country} label={country} size="small" />
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    );
  };

  const renderLoginHistory = () => {
    if (!details || !details.recentLogins.length) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Login History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No login records found
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:history-3-bold" />
          Recent Logins
        </Typography>
        
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Country/City</TableCell>
                <TableCell>Device</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {details.recentLogins.map((login) => (
                <TableRow key={login.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {fDateTime(login.createdAt)}
                  </TableCell>
                  
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {login.ipAddress}
                  </TableCell>
                  
                  <TableCell>
                    {login.country && login.city 
                      ? `${login.city}, ${login.country}`
                      : login.country || '-'
                    }
                  </TableCell>
                  
                  <TableCell>
                    <Stack spacing={0.5}>
                      {login.device && (
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Iconify icon="solar:smartphone-bold" width={14} />
                          {login.device}
                        </Typography>
                      )}
                      {login.os && (
                        <Typography variant="caption" color="text.secondary">
                          {login.os}
                        </Typography>
                      )}
                      {login.browser && (
                        <Typography variant="caption" color="text.secondary">
                          {login.browser}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={login.success ? 'Success' : 'Failed'}
                      color={login.success ? 'success' : 'error'}
                      size="small"
                      variant="soft"
                    />
                    {!login.success && login.failReason && (
                      <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                        {login.failReason}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="solar:document-text-bold" />
        User Report: {user.displayName || user.username}
      </DialogTitle>

      <Divider />

      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && details && (
          <Stack spacing={3}>
            {renderRegistrationInfo()}
            <Divider />
            {renderLoginStats()}
            <Divider />
            {renderLoginHistory()}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 150 }}>
        <Iconify icon={icon} sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          {label}:
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Stack>
  );
}
