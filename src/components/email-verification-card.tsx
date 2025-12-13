'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Warning } from '@mui/icons-material';
import EmailVerificationDialog from '@/components/email-verification-dialog';

export default function EmailVerificationCard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user from API
    const fetchUser = async () => {
      try {
        const token = sessionStorage.getItem('jwt_access_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:3002/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">Please login to view email verification status</Alert>
        </CardContent>
      </Card>
    );
  }

  const isVerified = user.emailVerified;

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              {isVerified ? (
                <CheckCircle sx={{ color: 'success.main', fontSize: 40 }} />
              ) : (
                <Warning sx={{ color: 'warning.main', fontSize: 40 }} />
              )}
              
              <Box>
                <Typography variant="h6" gutterBottom>
                  Email Verification
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              {isVerified ? (
                <Chip
                  label="Verified"
                  color="success"
                  icon={<CheckCircle />}
                />
              ) : (
                <>
                  <Chip
                    label="Not Verified"
                    color="warning"
                    icon={<Warning />}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setDialogOpen(true)}
                  >
                    Verify Email
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {!isVerified && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Please verify your email to unlock all features and secure your account.
            </Alert>
          )}

          {isVerified && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Your email is verified. You have full access to all features! ✅
            </Alert>
          )}
        </CardContent>
      </Card>

      <EmailVerificationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        email={user.email}
      />
    </>
  );
}
