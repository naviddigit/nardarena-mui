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
          Login
        </Typography>
      </Stack>

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          {errorMsg && (
            <Alert severity="error">{errorMsg}</Alert>
          )}

          <Field.Text
            name="email"
            label="Email"
            placeholder="your@email.com"
            InputLabelProps={{ shrink: true }}
          />

          <Field.Text
            name="password"
            label="Password"
            placeholder="6+ characters"
            type={password.value ? 'text' : 'password'}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={password.onToggle} edge="end">
                    <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
            Login
          </LoadingButton>

          <Divider>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            size="large"
            variant="outlined"
            startIcon={<Iconify icon="flat-color-icons:google" />}
            sx={{
              borderColor: alpha(theme.palette.grey[500], 0.2),
              '&:hover': {
                borderColor: theme.palette.grey[500],
                bgcolor: alpha(theme.palette.grey[500], 0.08),
              },
            }}
          >
            Sign in with Google
          </Button>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              variant="text"
              size="small"
              onClick={onSwitchToReset}
              sx={{ color: 'text.secondary' }}
            >
              Forgot Password?
            </Button>
            <Button variant="text" size="small" onClick={onSwitchToRegister}>
              Register
            </Button>
          </Stack>
        </Stack>
      </Form>
    </Card>
  );
}
