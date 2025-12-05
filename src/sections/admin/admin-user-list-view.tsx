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
import Chip from '@mui/material/Chip';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  useTable,
  TableNoData,
  TableWithSkeleton,
  TablePaginationCustom,
} from 'src/components/table';

import { AdminUserTableRow } from './admin-user-table-row';
import { AdminUserTableToolbar } from './admin-user-table-toolbar';
import { adminAPI, type AdminUser } from '../../services/admin-api';

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
  { id: 'role', label: 'Role', width: 100 },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'stats', label: 'Win/Loss', width: 100 },
  { id: 'createdAt', label: 'Joined', width: 140 },
  { id: 'actions', label: 'Actions', width: 88 },
];

// ----------------------------------------------------------------------

export function AdminUserListView() {
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [debouncedFilterName, setDebouncedFilterName] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [countryStats, setCountryStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilterName(filterName);
      table.onChangePage(null, 0);
    }, 500);

    return () => clearTimeout(timer);
  }, [filterName]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers(
        table.page + 1,
        table.rowsPerPage,
        debouncedFilterName,
        table.orderBy as string,
        table.order,
        filterCountry || undefined
      );
      setUsers(response.users);
      setTotalUsers(response.pagination.total);
      table.setSelected([]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, debouncedFilterName, table.orderBy, table.order, filterCountry]);

  const fetchCountryStats = useCallback(async () => {
    try {
      const data = await adminAPI.getUsersByCountry();
      setCountryStats(data);
    } catch (error) {
      console.error('Failed to fetch country stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchCountryStats();
  }, [fetchCountryStats]);

  useEffect(() => {
    if (filterCountry !== '') {
      table.onChangePage(null, 0);
    }
  }, [filterCountry]);

  const handleFilterName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  }, []);

  const notFound = !users.length && !!debouncedFilterName;

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant="h4">
          User Management
        </Typography>
        
        <Button
          variant="contained"
          color="warning"
          startIcon={<Iconify icon="solar:cpu-bolt-bold" />}
          onClick={() => router.push(paths.dashboard.admin.botUsers)}
        >
          Bot Users
        </Button>
      </Stack>

      {Object.keys(countryStats).length > 0 && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Users by Country
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip
              label={`All (${totalUsers})`}
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

      <Card>
        <AdminUserTableToolbar filterName={filterName} onFilterName={handleFilterName} />

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
            onSelectAllRows: (checked) =>
              table.onSelectAllRows(
                checked,
                users.map((user) => user.id)
              ),
          }}
          skeletonRows={
            <>
              {[...Array(table.rowsPerPage)].map((_, index) => (
                <TableRow key={`skeleton-${index}`} sx={{ height: table.dense ? 56 : 76 }}>
                  <TableCell padding="checkbox">
                    <Skeleton animation="wave" variant="rectangular" width={18} height={18} />
                  </TableCell>
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
                    <Skeleton animation="wave" variant="rounded" width={100} height={22} />
                  </TableCell>
                  <TableCell>
                    <Skeleton animation="wave" variant="rounded" width={60} height={22} />
                  </TableCell>
                  <TableCell>
                    <Skeleton animation="wave" variant="rounded" width={60} height={22} />
                  </TableCell>
                  <TableCell>
                    <Skeleton animation="wave" variant="rounded" width={70} height={22} />
                  </TableCell>
                  <TableCell>
                    <Skeleton animation="wave" variant="rounded" width={70} height={22} />
                  </TableCell>
                  <TableCell>
                    <Skeleton animation="wave" variant="text" width={60} />
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
            <AdminUserTableRow
              key={row.id}
              row={row}
              selected={table.selected.includes(row.id)}
              onSelectRow={() => table.onSelectRow(row.id)}
              onRefresh={fetchUsers}
            />
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
    </DashboardContent>
  );
}
