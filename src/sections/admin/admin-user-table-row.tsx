import type { AdminUser } from 'src/services/admin-api';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';

import { useBoolean } from 'src/hooks/use-boolean';
import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { adminAPI } from 'src/services/admin-api';

import { AdminUserQuickEditForm } from './admin-user-quick-edit-form';
import { AdminResetPasswordForm } from './admin-reset-password-form';

// ----------------------------------------------------------------------

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
];

type Props = {
  row: AdminUser;
  selected: boolean;
  onSelectRow: () => void;
  onRefresh: () => void;
};

export function AdminUserTableRow({ row, selected, onSelectRow, onRefresh }: Props) {
  const confirm = useBoolean();
  const popover = usePopover();
  const quickEdit = useBoolean();
  const resetPassword = useBoolean();

  const handleDelete = async () => {
    try {
      await adminAPI.updateUserStatus(row.id, 'BANNED');
      toast.success('User banned successfully');
      confirm.onFalse();
      popover.onClose();
      onRefresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to ban user');
    }
  };

  const handleToggleRole = async () => {
    try {
      const newRole = row.role === 'ADMIN' ? 'USER' : 'ADMIN';
      await adminAPI.updateUserRole(row.id, newRole);
      toast.success(`User role changed to ${newRole}`);
      popover.onClose();
      onRefresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to update role');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = row.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await adminAPI.updateUserStatus(row.id, newStatus);
      toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'}`);
      popover.onClose();
      onRefresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleResetPassword = () => {
    resetPassword.onTrue();
    popover.onClose();
  };

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell padding="checkbox">
          <Checkbox id={row.id} checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Stack spacing={2} direction="row" alignItems="center">
            <Box sx={{ position: 'relative' }}>
              <Avatar alt={row.displayName || row.username} src={row.avatar || undefined} />
              {row.isBot && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    bgcolor: 'warning.main',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid',
                    borderColor: 'background.paper',
                  }}
                >
                  <Iconify icon="solar:cpu-bolt-bold" width={12} sx={{ color: 'warning.darker' }} />
                </Box>
              )}
            </Box>

            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Link color="inherit" sx={{ cursor: 'pointer' }}>
                  {row.displayName || row.username}
                </Link>
                {row.isBot && (
                  <Label variant="soft" color="warning" sx={{ ml: 0.5 }}>
                    BOT
                  </Label>
                )}
              </Stack>
              <Box component="span" sx={{ color: 'text.disabled' }}>
                @{row.username}
              </Box>
            </Stack>
          </Stack>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.email}</TableCell>

        <TableCell>
          {row.country && (
            <Chip
              label={`${COUNTRIES.find((c) => c.code === row.country)?.flag || ''} ${row.country}`}
              size="small"
              variant="soft"
              color="default"
            />
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Label
            variant="soft"
            color={row.role === 'ADMIN' ? 'error' : 'default'}
          >
            {row.role}
          </Label>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (row.status === 'ACTIVE' && 'success') ||
              (row.status === 'SUSPENDED' && 'warning') ||
              (row.status === 'BANNED' && 'error') ||
              'default'
            }
          >
            {row.status}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.stats?.gamesWon || 0} / {row.stats?.gamesPlayed || 0}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.createdAt)}</TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center">
            <Tooltip title="Quick Edit" placement="top" arrow>
              <IconButton
                color={quickEdit.value ? 'inherit' : 'default'}
                onClick={quickEdit.onTrue}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>

            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      <AdminUserQuickEditForm
        currentUser={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        onRefresh={onRefresh}
      />

      <AdminResetPasswordForm
        currentUser={row}
        open={resetPassword.value}
        onClose={resetPassword.onFalse}
      />

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              quickEdit.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleToggleStatus} disabled={row.role === 'ADMIN'}>
            <Iconify icon={row.status === 'ACTIVE' ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
            {row.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
          </MenuItem>

          <MenuItem onClick={handleResetPassword}>
            <Iconify icon="solar:lock-password-bold" />
            Reset Password
          </MenuItem>

          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Ban
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Ban User"
        content={`Are you sure you want to ban ${row.displayName || row.username}?`}
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Ban
          </Button>
        }
      />
    </>
  );
}
