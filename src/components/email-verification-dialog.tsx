'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { emailVerificationService } from '@/services/email-verification.service';

interface EmailVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
}

export default function EmailVerificationDialog({
  open,
  onClose,
  email,
}: EmailVerificationDialogProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Auto-format code as 6 digits
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError(null);
  };

  // Send verification code
  const handleSendCode = async () => {
    if (countdown > 0) return;

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      await emailVerificationService.sendVerificationCode(email);
      setSuccess('Verification code sent to your email!');
      
      // Start 60 second countdown
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setSending(false);
    }
  };

  // Verify email with code
  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await emailVerificationService.verifyEmail(email, code);
      setSuccess('Email verified successfully! 🎉');
      
      // Close dialog and redirect after 2 seconds
      setTimeout(() => {
        onClose();
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6 && !loading) {
      handleVerify();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <span>📧</span>
          <span>Verify Your Email</span>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          <Typography variant="body2" color="text.secondary">
            We've sent a 6-digit verification code to:
          </Typography>
          
          <Typography variant="body1" fontWeight="bold" textAlign="center">
            {email}
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Verification Code"
            placeholder="000000"
            value={code}
            onChange={handleCodeChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            inputProps={{
              maxLength: 6,
              style: {
                fontSize: '24px',
                textAlign: 'center',
                letterSpacing: '8px',
                fontFamily: 'monospace',
              },
            }}
            helperText="Enter the 6-digit code from your email"
          />

          <Button
            variant="outlined"
            onClick={handleSendCode}
            disabled={sending || countdown > 0}
            fullWidth
          >
            {sending ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend Code in ${countdown}s`
            ) : (
              'Resend Code'
            )}
          </Button>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            ⏰ Code expires in 15 minutes
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={code.length !== 6 || loading}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
