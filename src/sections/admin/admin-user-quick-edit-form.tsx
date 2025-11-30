import type { AdminUser } from 'src/services/admin-api';

import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { adminAPI } from 'src/services/admin-api';

// ----------------------------------------------------------------------

export type AdminUserQuickEditSchemaType = zod.infer<typeof AdminUserQuickEditSchema>;

export const AdminUserQuickEditSchema = zod.object({
  displayName: zod.string().min(1, { message: 'Display name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  role: zod.enum(['USER', 'ADMIN']),
  status: zod.enum(['ACTIVE', 'SUSPENDED', 'BANNED']),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
  currentUser: AdminUser;
};

export function AdminUserQuickEditForm({ currentUser, open, onClose, onRefresh }: Props) {
  const defaultValues = useMemo(
    () => ({
      displayName: currentUser?.displayName || currentUser?.username || '',
      email: currentUser?.email || '',
      role: currentUser?.role || 'USER',
      status: currentUser?.status || 'ACTIVE',
    }),
    [currentUser]
  );

  const methods = useForm<AdminUserQuickEditSchemaType>({
    mode: 'all',
    resolver: zodResolver(AdminUserQuickEditSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Update role if changed
      if (data.role !== currentUser.role) {
        await adminAPI.updateUserRole(currentUser.id, data.role as 'USER' | 'ADMIN');
      }

      // Update status if changed
      if (data.status !== currentUser.status) {
        await adminAPI.updateUserStatus(currentUser.id, data.status as 'ACTIVE' | 'SUSPENDED' | 'BANNED');
      }

      toast.success('User updated successfully!');
      reset();
      onClose();
      onRefresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to update user');
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { maxWidth: 720 } }}
    >
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Update</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            sx={{ pt: 1 }}
          >
            <Field.Text name="displayName" label="Display Name" disabled />
            <Field.Text name="email" label="Email Address" disabled />

            <Field.Select name="role" label="Role" disabled>
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Field.Select>

            <Field.Select name="status" label="Status">
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="SUSPENDED" disabled={currentUser.role === 'ADMIN'}>Suspended</MenuItem>
              <MenuItem value="BANNED" disabled={currentUser.role === 'ADMIN'}>Banned</MenuItem>
            </Field.Select>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Update
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
