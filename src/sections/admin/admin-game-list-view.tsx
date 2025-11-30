'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { adminAPI, type AdminGame } from 'src/services/admin-api';

import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableWithSkeleton,
  TablePaginationCustom,
} from 'src/components/table';

import { AdminGameTableRow } from './admin-game-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'gameType', label: 'Type', width: 100 },
  { id: 'status', label: 'Status', width: 120 },
  { id: 'whitePlayer', label: 'White Player', width: 200 },
  { id: 'blackPlayer', label: 'Black Player', width: 200 },
  { id: 'score', label: 'Score', width: 100, align: 'center' },
  { id: 'winner', label: 'Winner', width: 100, align: 'center' },
  { id: 'moveCount', label: 'Moves', width: 80, align: 'center' },
  { id: 'createdAt', label: 'Created', width: 140 },
];

// ----------------------------------------------------------------------

export function AdminGameListView() {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const [games, setGames] = useState<AdminGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalGames, setTotalGames] = useState(0);

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getGames(
        table.page + 1,
        table.rowsPerPage
      );
      setGames(response.games);
      setTotalGames(response.pagination.total);
      table.setSelected([]);
    } catch (err: any) {
      console.error('Failed to fetch games:', err);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const notFound = !games.length && !loading;

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Game Management
      </Typography>

      <Card>
        <TableWithSkeleton
          loading={loading}
          headLabel={TABLE_HEAD}
          tableSize={table.dense ? 'small' : 'medium'}
          rowsPerPage={table.rowsPerPage}
          tableHeadProps={{
            order: table.order,
            orderBy: table.orderBy,
            rowCount: totalGames,
            numSelected: table.selected.length,
            onSelectAllRows: (checked) =>
              table.onSelectAllRows(
                checked,
                games.map((game) => game.id)
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
                    <Skeleton animation="wave" variant="rounded" width={60} height={22} />
                  </TableCell>
                  <TableCell>
                    <Skeleton animation="wave" variant="rounded" width={70} height={22} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Skeleton animation="wave" variant="circular" width={32} height={32} />
                      <Skeleton animation="wave" variant="text" width={100} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Skeleton animation="wave" variant="circular" width={32} height={32} />
                      <Skeleton animation="wave" variant="text" width={100} />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton animation="wave" variant="text" width={40} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton animation="wave" variant="rounded" width={60} height={22} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton animation="wave" variant="text" width={50} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell>
                    <Skeleton animation="wave" variant="text" width={100} />
                  </TableCell>
                </TableRow>
              ))}
            </>
          }
        >
          {games.map((row) => (
            <AdminGameTableRow
              key={row.id}
              row={row}
              selected={table.selected.includes(row.id)}
              onSelectRow={() => table.onSelectRow(row.id)}
            />
          ))}

          <TableEmptyRows
            height={table.dense ? 56 : 76}
            emptyRows={emptyRows(table.page, table.rowsPerPage, totalGames)}
          />

          <TableNoData notFound={notFound} />
        </TableWithSkeleton>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={totalGames}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}
