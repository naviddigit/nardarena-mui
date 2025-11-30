import type { AdminUser } from 'src/services/admin-api';

import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { adminAPI } from 'src/services/admin-api';

// ----------------------------------------------------------------------

export type AdminResetPasswordSchemaType = zod.infer<typeof AdminResetPasswordSchema>;

export const AdminResetPasswordSchema = zod
  .object({
    password: zod
      .string()
      .min(6, { message: 'Password must be at least 6 characters!' })
      .max(100, { message: 'Password is too long!' }),
    confirmPassword: zod.string().min(1, { message: 'Confirm password is required!' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match!",
    path: ['confirmPassword'],
  });

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  currentUser: AdminUser;
};

export function AdminResetPasswordForm({ currentUser, open, onClose }: Props) {
  const defaultValues = useMemo(
    () => ({
      password: '',
      confirmPassword: '',
    }),
    []
  );

  const methods = useForm<AdminResetPasswordSchemaType>({
    mode: 'all',
    resolver: zodResolver(AdminResetPasswordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await adminAPI.resetUserPassword(currentUser.id, data.password);
      
      toast.success('Password reset successfully!');
      reset();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to reset password');
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { maxWidth: 500 } }}
    >
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Reset Password</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            display="grid"
            sx={{ pt: 1 }}
          >
            <Box>
              <Box sx={{ mb: 2, color: 'text.secondary' }}>
                Reset password for: <strong>{currentUser.displayName || currentUser.username}</strong>
              </Box>
            </Box>

            <Field.Text
              name="password"
              label="New Password"
              type="password"
              placeholder="Enter new password"
            />

            <Field.Text
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Reset Password
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
