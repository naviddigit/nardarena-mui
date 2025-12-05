'use client';

import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Skeleton,
  Typography,
  Box,
  CardHeader,
} from '@mui/material';
import { ReactNode } from 'react';

// ----------------------------------------------------------------------

export interface DataTableColumn<T> {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  render?: (row: T, index: number) => ReactNode;
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
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange?.(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10));
  };

  const showPagination = totalRows !== undefined && onPageChange && onRowsPerPageChange;

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
