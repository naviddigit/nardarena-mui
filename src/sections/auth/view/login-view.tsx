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
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';
import { signInWithPassword } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

type Props = {
  onSwitchToRegister: () => void;
  onSwitchToReset: () => void;
};

export function LoginView({ onSwitchToRegister, onSwitchToReset }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { checkUserSession } = useAuthContext();
  const [errorMsg, setErrorMsg] = useState('');
  const password = useBoolean();

  const defaultValues = {
    email: 'admin@nardarena.com',
    password: 'Admin123!',
  };

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      const user = await signInWithPassword({ email: data.email, password: data.password });
      console.log('Login user data:', user);
      await checkUserSession?.();
      
      // Route based on user role
      if (user?.role === 'ADMIN') {
        console.log('Redirecting to admin panel');
        router.push(CONFIG.auth.adminRedirectPath);
      } else {
        console.log('Redirecting to user dashboard');
        router.push(CONFIG.auth.redirectPath);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMsg(typeof error === 'string' ? error : 'Login failed. Please check your credentials.');
    }
  });

  return (
    <Card
      sx={{
        p: isMobile ? 2 : 4,
        width: 1,
        maxWidth: isMobile ? '100%' : 420,
        mx: 'auto',
        ...(isMobile
          ? {
              boxShadow: 'none',
              bgcolor: 'transparent',
              backgroundImage: 'none',
            }
          : {
              backdropFilter: 'blur(20px)',
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
            }),
      }}
    >
      <Stack spacing={isMobile ? 2 : 3} alignItems="center" sx={{ mb: isMobile ? 2 : 4 }}>
        {!isMobile && (
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
        )}
        <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ color: 'text.secondary' }}>
          Login
        </Typography>
      </Stack>

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={isMobile ? 2 : 3}>
          {errorMsg && (
            <Alert severity="error" sx={{ py: isMobile ? 0.5 : 1 }}>
              <Typography variant={isMobile ? 'caption' : 'body2'}>{errorMsg}</Typography>
            </Alert>
          )}

          <Field.Text
            name="email"
            label="Email"
            placeholder="your@email.com"
            InputLabelProps={{ shrink: true }}
            size={isMobile ? 'small' : 'medium'}
          />

          <Field.Text
            name="password"
            label="Password"
            placeholder="6+ characters"
            type={password.value ? 'text' : 'password'}
            InputLabelProps={{ shrink: true }}
            size={isMobile ? 'small' : 'medium'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={password.onToggle} edge="end" size={isMobile ? 'small' : 'medium'}>
                    <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={isMobile ? 18 : 22} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <LoadingButton
            fullWidth
            size={isMobile ? 'medium' : 'large'}
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
            Login
          </LoadingButton>

          <Divider sx={{ my: isMobile ? 1 : 2 }}>
            <Typography variant={isMobile ? 'caption' : 'body2'} sx={{ color: 'text.secondary' }}>
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            size={isMobile ? 'medium' : 'large'}
            variant="outlined"
            startIcon={<Iconify icon="flat-color-icons:google" width={isMobile ? 18 : 20} />}
            sx={{
              borderColor: alpha(theme.palette.grey[500], 0.2),
              '&:hover': {
                borderColor: theme.palette.grey[500],
                bgcolor: alpha(theme.palette.grey[500], 0.08),
              },
            }}
          >
            <Typography variant={isMobile ? 'body2' : 'body1'}>Sign in with Google</Typography>
          </Button>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              variant="text"
              size="small"
              onClick={onSwitchToReset}
              sx={{ color: 'text.secondary', fontSize: isMobile ? '0.75rem' : '0.875rem' }}
            >
              Forgot Password?
            </Button>
            <Button 
              variant="text" 
              size="small" 
              onClick={onSwitchToRegister}
              sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
            >
              Register
            </Button>
          </Stack>
        </Stack>
      </Form>
    </Card>
  );
}
