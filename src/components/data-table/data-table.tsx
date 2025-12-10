'use client';

import { ReactNode } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Skeleton from '@mui/material/Skeleton';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// ----------------------------------------------------------------------

export interface DataTableColumn<T> {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  render?: (row: T, index: number) => ReactNode;
  hideOnMobile?: boolean; // پنهان کردن ستون در موبایل
}

interface DataTableProps<T> {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  columns: DataTableColumn<T>[];
  rows: T[];
  loading?: boolean;
  skeletonRows?: number;
  page?: number;
  rowsPerPage?: number;
  totalRows?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  emptyMessage?: string;
  rowsPerPageOptions?: number[];
}

export function DataTable<T>({
  title,
  subtitle,
  action,
  columns,
  rows,
  loading = false,
  skeletonRows = 5,
  page = 0,
  rowsPerPage = 10,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  emptyMessage = 'No data available',
  rowsPerPageOptions = [5, 10, 25, 50],
}: DataTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange?.(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10));
  };

  const showPagination = totalRows !== undefined && onPageChange && onRowsPerPageChange;

  // فیلتر ستون‌های قابل نمایش در موبایل
  const visibleColumns = isMobile ? columns.filter((col) => !col.hideOnMobile) : columns;

  // رندر موبایل - Card Layout
  if (isMobile) {
    return (
      <Card>
        {(title || subtitle || action) && (
          <CardHeader title={title} subheader={subtitle} action={action} />
        )}

        <Box sx={{ p: 2 }}>
          {loading ? (
            <Stack spacing={2}>
              {Array.from({ length: skeletonRows }).map((_, index) => (
                <Card key={`skeleton-${index}`} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    {visibleColumns.map((column) => (
                      <Box key={column.id}>
                        <Skeleton variant="text" width="40%" height={16} sx={{ mb: 0.5 }} />
                        <Skeleton variant="text" width="80%" height={20} />
                      </Box>
                    ))}
                  </Stack>
                </Card>
              ))}
            </Stack>
          ) : rows.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {emptyMessage}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {rows.map((row, rowIndex) => (
                <Card key={rowIndex} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1.5} divider={<Divider />}>
                    {visibleColumns.map((column) => (
                      <Box key={column.id}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}
                        >
                          {column.label}
                        </Typography>
                        <Box>
                          {column.render ? column.render(row, rowIndex) : (row as any)[column.id]}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Box>

        {showPagination && !loading && (
          <TablePagination
            component="div"
            count={totalRows}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
          />
        )}
      </Card>
    );
  }

  // رندر دسکتاپ - Table Layout
  return (
    <Card>
      {(title || subtitle || action) && (
        <CardHeader title={title} subheader={subtitle} action={action} sx={{ mb: 2 }} />
      )}

      <TableContainer sx={{ position: 'relative', overflow: 'auto' }}>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  width={column.width}
                  sx={{ fontWeight: 600 }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ minHeight: skeletonRows * 73 }}>
            {loading ? (
              // Fixed skeleton rows with proper height
              Array.from({ length: skeletonRows }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} sx={{ height: 73 }}>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || 'left'}>
                      <Skeleton variant="text" width="80%" height={24} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8, height: skeletonRows * 73 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIndex) => (
                <TableRow key={rowIndex} hover>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || 'left'}>
                      {column.render ? column.render(row, rowIndex) : (row as any)[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && !loading && (
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      )}
    </Card>
  );
}
