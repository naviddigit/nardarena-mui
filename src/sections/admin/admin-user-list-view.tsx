'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableWithSkeleton,
  TablePaginationCustom,
} from 'src/components/table';

import { AdminUserTableRow } from './admin-user-table-row';
import { AdminUserTableToolbar } from './admin-user-table-toolbar';
import { adminAPI, type AdminUser } from '../../services/admin-api';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'displayName', label: 'User', width: 220 },
  { id: 'email', label: 'Email', width: 200 },
  { id: 'phoneNumber', label: 'Phone', width: 140 },
  { id: 'role', label: 'Role', width: 100 },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'createdAt', label: 'Joined', width: 140 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function AdminUserListView() {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [debouncedFilterName, setDebouncedFilterName] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);

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
        table.order
      );
      setUsers(response.users);
      setTotalUsers(response.pagination.total);
      table.setSelected([]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, debouncedFilterName, table.orderBy, table.order]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  }, []);

  const notFound = !users.length && !!debouncedFilterName;

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        User Management
      </Typography>

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
                    <Skeleton animation="wave" variant="text" width={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton animation="wave" variant="rounded" width={60} height={22} />
                  </TableCell>
                  <TableCell>
                    <Skeleton animation="wave" variant="rounded" width={70} height={22} />
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

          <TableEmptyRows
            height={table.dense ? 56 : 76}
            emptyRows={emptyRows(table.page, table.rowsPerPage, totalUsers)}
          />

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
