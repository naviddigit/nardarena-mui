'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  useTable,
  TableNoData,
  TableWithSkeleton,
  TablePaginationCustom,
} from 'src/components/table';

import {
  generateBotPreview,
  getBotUsers,
  createBotUser,
  deleteBotUser,
  canDeleteBotUser,
  getBotUsersStats,
  getBotUsersByCountry,
  type BotUserPreview,
  type BotUser,
} from '../../api/bot-users';

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

const TABLE_HEAD = [
  { id: 'displayName', label: 'User', width: 220 },
  { id: 'email', label: 'Email', width: 200 },
  { id: 'country', label: 'Country', width: 140 },
  { id: 'username', label: 'Username', width: 140 },
  { id: 'createdAt', label: 'Created', width: 140 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function BotUserManagementView() {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });
  const previewDialog = useBoolean();
  const confirmDialog = useBoolean();

  const [users, setUsers] = useState<BotUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [preview, setPreview] = useState<BotUserPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [countryStats, setCountryStats] = useState<Record<string, number>>({});

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBotUsers(table.page + 1, table.rowsPerPage, filterCountry || undefined);
      setUsers(response?.botUsers || []);
      setTotalUsers(response?.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch bot users:', error);
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, filterCountry]);

  const fetchStats = useCallback(async () => {
    try {
      const [statsData, countryData] = await Promise.all([
        getBotUsersStats(),
        getBotUsersByCountry(),
      ]);
      setStats(statsData);
      setCountryStats(countryData);
    } catch (error) {
      console.error('Failed to fetch bot stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (filterCountry !== '') {
      table.onChangePage(null, 0);
    }
  }, [filterCountry]);

  const handleCountryChange = (event: SelectChangeEvent) => {
    setSelectedCountry(event.target.value);
  };

  const handleGeneratePreview = async () => {
    try {
      setLoadingPreview(true);
      const data = await generateBotPreview(selectedCountry);
      setPreview(data);
      previewDialog.onTrue();
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleRegeneratePreview = async () => {
    try {
      setLoadingPreview(true);
      const data = await generateBotPreview(selectedCountry);
      setPreview(data);
    } catch (error) {
      console.error('Failed to regenerate preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCreateBot = async () => {
    if (!preview) return;

    try {
      setCreating(true);
      await createBotUser(preview);
      previewDialog.onFalse();
      setPreview(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to create bot user:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = async (bot: BotUser) => {
    try {
      const checkResult = await canDeleteBotUser(bot.id);
      setDeleteTarget(checkResult);
      confirmDialog.onTrue();
    } catch (error) {
      console.error('Failed to check bot user:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.user?.id) return;

    try {
      setDeleting(true);
      await deleteBotUser(deleteTarget.user.id);
      confirmDialog.onFalse();
      setDeleteTarget(null);
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      console.error('Failed to delete bot user:', error);
      alert(error.message || 'Failed to delete bot user');
    } finally {
      setDeleting(false);
    }
  };

  const notFound = !users.length;

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Bot User Management</Typography>
        </Stack>

        {stats && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Total Bots
                </Typography>
                <Typography variant="h4">{stats.totalBots}</Typography>
              </Stack>
            </Card>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Active Bots
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.activeBots}
                </Typography>
              </Stack>
            </Card>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Total Games
                </Typography>
                <Typography variant="h4">{stats.totalGames}</Typography>
              </Stack>
            </Card>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Win Rate
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {stats.winRate.toFixed(1)}%
                </Typography>
              </Stack>
            </Card>
          </Box>
        )}

        {Object.keys(countryStats).length > 0 && (
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Bots by Country
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Chip
                label={`All (${stats?.totalBots || 0})`}
                onClick={() => setFilterCountry('')}
                color={filterCountry === '' ? 'primary' : 'default'}
                variant={filterCountry === '' ? 'filled' : 'outlined'}
              />
              {COUNTRIES.map((country) => {
                const count = countryStats[country.code] || 0;
                if (count === 0) return null;
                return (
                  <Chip
                    key={country.code}
                    label={`${country.flag} ${country.name} (${count})`}
                    onClick={() => setFilterCountry(country.code)}
                    color={filterCountry === country.code ? 'primary' : 'default'}
                    variant={filterCountry === country.code ? 'filled' : 'outlined'}
                  />
                );
              })}
            </Stack>
          </Card>
        )}

        <Card sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Select
              value={selectedCountry}
              onChange={handleCountryChange}
              size="small"
              sx={{ minWidth: 200 }}
            >
              {COUNTRIES.map((country) => (
                <MenuItem key={country.code} value={country.code}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>

            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:eye-bold" />}
              onClick={handleGeneratePreview}
              disabled={loadingPreview}
            >
              Generate Preview
            </Button>
          </Stack>
        </Card>

        <Card>
          <TableWithSkeleton
            loading={loading}
            headLabel={TABLE_HEAD}
            tableSize={table.dense ? 'small' : 'medium'}
            rowsPerPage={table.rowsPerPage}
            tableHeadProps={{
              order: table.order,
              orderBy: table.orderBy,
              rowCount: totalUsers,
              numSelected: table.selected.length,
              onSort: table.onSort,
            }}
            skeletonRows={
              <>
                {[...Array(table.rowsPerPage)].map((_, index) => (
                  <TableRow key={`skeleton-${index}`} sx={{ height: table.dense ? 56 : 76 }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton animation="wave" variant="circular" width={40} height={40} />
                        <Skeleton animation="wave" variant="text" width={120} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Skeleton animation="wave" variant="text" width="80%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton animation="wave" variant="text" width={100} />
                    </TableCell>
                    <TableCell>
                      <Skeleton animation="wave" variant="text" width={80} />
                    </TableCell>
                    <TableCell>
                      <Skeleton animation="wave" variant="text" width={100} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton animation="wave" variant="circular" width={32} height={32} />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            }
          >
            {users.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={row.avatar} alt={row.displayName} />
                    <Typography variant="subtitle2">{row.displayName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.email}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${COUNTRIES.find((c) => c.code === row.country)?.flag || ''} ${row.country}`}
                    size="small"
                    variant="soft"
                    color="default"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">@{row.username}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Delete Bot">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(row)}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            <TableNoData notFound={notFound} />
          </TableWithSkeleton>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={totalUsers}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </Stack>

      <Dialog
        open={previewDialog.value}
        onClose={previewDialog.onFalse}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:user-id-bold" width={24} />
            <span>Bot User Preview</span>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {preview && (
            <Stack spacing={3} sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar
                  src={preview.avatar}
                  alt={preview.displayName}
                  sx={{ width: 120, height: 120 }}
                />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Display Name
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {preview.displayName}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Username
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  @{preview.username}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {preview.email}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Password
                </Typography>
                <Typography variant="body1" fontWeight="medium" fontFamily="monospace">
                  {preview.password}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Country
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {COUNTRIES.find((c) => c.code === preview.country)?.flag}{' '}
                  {preview.country}
                </Typography>
              </Box>

              <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
                This bot user will behave like a real player but will be AI-controlled. You can
                regenerate to get a different user.
              </Alert>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={previewDialog.onFalse} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleRegeneratePreview}
            disabled={loadingPreview}
            startIcon={<Iconify icon="solar:refresh-bold" />}
          >
            Regenerate
          </Button>
          <Button
            onClick={handleCreateBot}
            variant="contained"
            disabled={creating}
            startIcon={<Iconify icon="solar:user-plus-bold" />}
          >
            Create Bot User
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:danger-bold" width={24} color="error.main" />
            <span>Confirm Delete Bot User</span>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {deleteTarget && (
            <Stack spacing={3} sx={{ pt: 2 }}>
              {deleteTarget.user && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={deleteTarget.user.avatar} alt={deleteTarget.user.displayName} />
                  <Box>
                    <Typography variant="subtitle1">{deleteTarget.user.displayName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{deleteTarget.user.username}
                    </Typography>
                  </Box>
                </Box>
              )}

              {deleteTarget.canDelete ? (
                <Alert severity="warning" icon={<Iconify icon="solar:info-circle-bold" />}>
                  Are you sure you want to delete this bot user? This action cannot be undone.
                </Alert>
              ) : (
                <Box>
                  <Alert severity="error" icon={<Iconify icon="solar:danger-bold" />} sx={{ mb: 2 }}>
                    Cannot delete this bot user because it has game history.
                  </Alert>
                  
                  <Card sx={{ p: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Game Statistics:
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Games Played:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {deleteTarget.gameHistory.gamesPlayed}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Games Won:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="success.main">
                          {deleteTarget.gameHistory.gamesWon}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Games Lost:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="error.main">
                          {deleteTarget.gameHistory.gamesLost}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={confirmDialog.onFalse} color="inherit">
            Cancel
          </Button>
          {deleteTarget?.canDelete && (
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              disabled={deleting}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            >
              {deleting ? 'Deleting...' : 'Delete Bot User'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
