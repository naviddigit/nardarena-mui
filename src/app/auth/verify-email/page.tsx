'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

const emailVerificationService = {
  async sendVerificationCode(email: string) {
    const response = await axios.post(`${API_URL}/auth/send-verification-code`, { email });
    return response.data;
  },
  async verifyEmail(email: string, code: string) {
    const response = await axios.post(`${API_URL}/auth/verify-email`, { email, code });
    return response.data;
  },
};

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [email, setEmail] = useState(emailParam || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Auto-send code on mount if email provided
  useEffect(() => {
    if (emailParam && !countdown) {
      handleSendCode();
    }
  }, [emailParam]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError(null);
  };

  const handleSendCode = async () => {
    if (!email || countdown > 0) return;

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      await emailVerificationService.sendVerificationCode(email);
      setSuccess('Verification code sent to your email! Check your inbox.');

      // 60 second countdown
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

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await emailVerificationService.verifyEmail(email, code);
      setSuccess('Email verified successfully! Redirecting to dashboard...');

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        py={4}
      >
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
              {/* Icon */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                }}
              >
                📧
              </Box>

              {/* Title */}
              <Typography variant="h4" fontWeight="bold" textAlign="center">
                Verify Your Email
              </Typography>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Enter the 6-digit code sent to your email
              </Typography>

              {/* Email Input */}
              <TextField
                fullWidth
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!emailParam || sending}
              />

              {/* Alerts */}
              {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" onClose={() => setSuccess(null)} sx={{ width: '100%' }}>
                  {success}
                </Alert>
              )}

              {/* Code Input */}
              <TextField
                fullWidth
                label="Verification Code"
                placeholder="000000"
                value={code}
                onChange={handleCodeChange}
                disabled={loading}
                inputProps={{
                  maxLength: 6,
                  style: {
                    fontSize: '28px',
                    textAlign: 'center',
                    letterSpacing: '10px',
                    fontFamily: 'monospace',
                  },
                }}
                helperText="⏰ Code expires in 15 minutes"
              />

              {/* Verify Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleVerify}
                disabled={code.length !== 6 || loading}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                  },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>

              {/* Resend Button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={handleSendCode}
                disabled={!email || sending || countdown > 0}
              >
                {sending ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend Code in ${countdown}s`
                ) : (
                  'Resend Verification Code'
                )}
              </Button>

              {/* Back to Login */}
              <Button
                variant="text"
                onClick={() => router.push('/auth/login')}
                disabled={loading}
              >
                ← Back to Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
