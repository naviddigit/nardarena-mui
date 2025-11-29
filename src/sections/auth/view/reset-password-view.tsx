'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type ResetPasswordSchemaType = zod.infer<typeof ResetPasswordSchema>;

export const ResetPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
});

// ----------------------------------------------------------------------

type Props = {
  onSwitchToLogin: () => void;
};

export function ResetPasswordView({ onSwitchToLogin }: Props) {
  const theme = useTheme();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const defaultValues = {
    email: '',
  };

  const methods = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      // TODO: Implement reset password API call
      console.log('Reset password for:', data.email);
      setSuccessMsg('Password reset link has been sent to your email!');
    } catch (error) {
      console.error('Reset password error:', error);
      setErrorMsg(typeof error === 'string' ? error : 'Failed to send reset link. Please try again.');
    }
  });

  return (
    <Card
      sx={{
        p: 4,
        width: 1,
        maxWidth: 480,
        mx: 'auto',
        backdropFilter: 'blur(20px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
      }}
    >
          <Stack spacing={3} alignItems="center" sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Brush Script MT, cursive',
              }}
            >
              Nard Arena
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Reset Password
            </Typography>
            <Typography variant="body2" textAlign="center" sx={{ color: 'text.secondary' }}>
              Enter your email address and we'll send you a link to reset your password
            </Typography>
          </Stack>

          <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          {successMsg && (
            <Alert severity="success" icon={<Iconify icon="eva:checkmark-circle-2-fill" />}>
              {successMsg}
            </Alert>
          )}

          <Field.Text
            name="email"
            label="Email"
            placeholder="your@email.com"
            InputLabelProps={{ shrink: true }}
          />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
              },
            }}
          >
            Reset Password
          </LoadingButton>

          <Button
            variant="text"
            onClick={onSwitchToLogin}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            sx={{ alignSelf: 'center', color: 'text.secondary' }}
          >
            Back to Login
          </Button>
        </Stack>
      </Form>
    </Card>
  );
}
