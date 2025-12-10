'use client';

import { m } from 'framer-motion';
import { z as zod } from 'zod';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
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
import { _mock } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { varFade } from 'src/components/animate';

import { useAuthContext } from 'src/auth/hooks';
import { signUp } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export type SignUpSchemaType = zod.infer<typeof SignUpSchema>;

export const SignUpSchema = zod.object({
  username: zod.string()
    .min(3, { message: 'Username must be at least 3 characters!' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
  displayName: zod.string().optional(),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(8, { message: 'Password must be at least 8 characters!' }),
  confirmPassword: zod.string().min(1, { message: 'Confirm password is required!' }),
  country: zod.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ----------------------------------------------------------------------

type Props = {
  onSwitchToLogin: () => void;
};

const AVATAR_OPTIONS = Array.from({ length: 25 }, (_, i) => _mock.image.avatar(i));

export function RegisterView({ onSwitchToLogin }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const { checkUserSession } = useAuthContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [step, setStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const password = useBoolean();
  const confirmPassword = useBoolean();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle horizontal scroll with mouse wheel
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        scrollElement.scrollLeft += e.deltaY;
      }
    };

    scrollElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => scrollElement.removeEventListener('wheel', handleWheel);
  }, []);

  const defaultValues = {
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
  };

  const methods = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onNext = async () => {
    // Clear previous errors
    setErrorMsg('');
    
    // Trigger validation for step 1 fields
    const isValid = await methods.trigger(['email', 'password', 'confirmPassword']);
    
    if (isValid) {
      setStep(2);
    } else {
      setErrorMsg('Please fill all required fields correctly');
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      
      // Validate step 2 fields
      const isValid = await methods.trigger(['username', 'displayName', 'country']);
      if (!isValid) {
        setErrorMsg('Please fill all required fields correctly');
        return;
      }
      
      const registerData = {
        email: data.email,
        password: data.password,
        username: data.username,
        displayName: data.displayName || data.username, // Use username as displayName if not provided
        avatar: selectedAvatar || undefined,
        country: data.country || undefined,
      };
      
      console.log('Sending registration data:', registerData);
      
      await signUp(registerData);
      await checkUserSession?.();
      router.push(CONFIG.auth.redirectPath);
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed. Please try again.';
      setErrorMsg(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
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
          Create Account
        </Typography>
        <Stack direction="row" spacing={1}>
          {[1, 2].map((s) => (
            <Box
              key={s}
              sx={{
                width: isMobile ? 6 : 8,
                height: isMobile ? 6 : 8,
                borderRadius: '50%',
                bgcolor: s === step ? 'primary.main' : 'grey.300',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </Stack>
      </Stack>

      <Form methods={methods} onSubmit={onSubmit}>
        {step === 1 && (
          <m.div {...varFade().inRight}>
            <Stack spacing={3}>
            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

            <Field.Text
              name="email"
              label="Email"
              placeholder="your@email.com"
              InputLabelProps={{ shrink: true }}
            />

            <Field.Text
              name="password"
              label="Password"
              placeholder="At least 8 characters"
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

            <Field.Text
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
              type={confirmPassword.value ? 'text' : 'password'}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={confirmPassword.onToggle} edge="end">
                      <Iconify icon={confirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              size="large"
              variant="contained"
              onClick={onNext}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }}
            >
              Next
            </Button>

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
            >
              Sign up with Google
            </Button>

            <Button variant="text" onClick={onSwitchToLogin} sx={{ alignSelf: 'center' }}>
              Already have an account? Login here
            </Button>
          </Stack>
          </m.div>
        )}

        {step === 2 && (
          <m.div {...varFade().inLeft}>
            <Stack spacing={3}>
            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            
            <Typography variant="subtitle1" textAlign="center">
              Complete Your Profile
            </Typography>

            <Stack direction="row" spacing={2}>
              <Field.Text
                name="username"
                label="Username *"
                placeholder="username"
                InputLabelProps={{ shrink: true }}
              />
              <Field.Text
                name="displayName"
                label="Display Name"
                placeholder="Your Name (optional)"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Field.CountrySelect
              name="country"
              label="Country (Optional)"
              placeholder="Choose a country"
              getValue="code"
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Choose Your Avatar (Optional)
              </Typography>
              <Box
                ref={scrollRef}
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  py: 1,
                  px: 0.5,
                  scrollBehavior: 'smooth',
                  cursor: 'grab',
                  '&:active': {
                    cursor: 'grabbing',
                  },
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    borderRadius: 1,
                    bgcolor: 'divider',
                  },
                }}
              >
                {AVATAR_OPTIONS.map((avatar, index) => (
                  <Tooltip key={index} title={`Avatar ${index + 1}`} arrow>
                    <Box
                      onClick={() => setSelectedAvatar(avatar)}
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <Avatar
                        alt={`Avatar ${index + 1}`}
                        src={avatar}
                        sx={{
                          width: 56,
                          height: 56,
                          border: 3,
                          borderColor: selectedAvatar === avatar ? 'primary.main' : 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.light',
                            transform: 'scale(1.1)',
                          },
                        }}
                      />
                      {selectedAvatar === avatar && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 2,
                            borderColor: 'background.paper',
                          }}
                        >
                          <Iconify icon="eva:checkmark-fill" width={16} sx={{ color: 'white' }} />
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                size="large"
                variant="outlined"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                }}
              >
                Register
              </LoadingButton>
            </Stack>
          </Stack>
        </m.div>
        )}
      </Form>
    </Card>
  );
}
