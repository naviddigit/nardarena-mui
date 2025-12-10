'use client';

import { ReactNode, useState, useEffect } from 'react';

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
  Stack,
  Divider,
  Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export interface ResponsiveTableColumn<T> {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  render?: (row: T, index: number) => ReactNode;
  mobileLabel?: string; // Custom label for mobile view
  hiddenOnMobile?: boolean; // Hide this column on mobile
  mobileOrder?: number; // Order in mobile card (lower = higher priority)
}

interface ResponsiveDataTableProps<T> {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  columns: ResponsiveTableColumn<T>[];
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
  mobileBreakpoint?: 'xs' | 'sm' | 'md'; // When to switch to mobile view
}

// ----------------------------------------------------------------------

export function ResponsiveDataTable<T>({
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
  mobileBreakpoint = 'md',
}: ResponsiveDataTableProps<T>) {
  // ✅ SSR-safe: Check mobile on client-side only
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const breakpoints = {
        xs: 600,
        sm: 900,
        md: 1200,
      };
      const width = breakpoints[mobileBreakpoint];
      setIsMobile(window.innerWidth < width);
    };

    // Check on mount
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange?.(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10));
  };

  const showPagination = totalRows !== undefined && onPageChange && onRowsPerPageChange;

  // Sort columns by mobileOrder for mobile view
  const mobileColumns = columns
    .filter((col) => !col.hiddenOnMobile)
    .sort((a, b) => (a.mobileOrder || 999) - (b.mobileOrder || 999));

  // Mobile Card View
  const renderMobileView = () => (
    <Card>
      {(title || subtitle || action) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={action}
          sx={{ mb: 1, pb: 2 }}
        />
      )}

      <Box sx={{ px: 2, pb: 2 }}>
        {loading ? (
          // Mobile skeleton cards
          <Stack spacing={2}>
            {Array.from({ length: skeletonRows }).map((_, index) => (
              <Paper
                key={`skeleton-${index}`}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.4),
                }}
              >
                <Stack spacing={1.5}>
                  {mobileColumns.slice(0, 4).map((column) => (
                    <Box key={column.id}>
                      <Skeleton variant="text" width="40%" height={16} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width="70%" height={24} />
                    </Box>
                  ))}
                </Stack>
              </Paper>
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
              <Paper
                key={rowIndex}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.4),
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    borderColor: 'primary.main',
                    boxShadow: (theme) => `0 0 0 1px ${alpha(theme.palette.primary.main, 0.16)}`,
                  },
                }}
              >
                <Stack spacing={1.5}>
                  {mobileColumns.map((column, colIndex) => (
                    <Box key={column.id}>
                      {colIndex > 0 && (
                        <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                      )}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            flexShrink: 0,
                            minWidth: 80,
                          }}
                        >
                          {column.mobileLabel || column.label}
                        </Typography>
                        <Box sx={{ flex: 1, textAlign: column.align || 'left' }}>
                          {column.render ? column.render(row, rowIndex) : (row as any)[column.id]}
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Paper>
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
          sx={{
            borderTop: 1,
            borderColor: 'divider',
          }}
        />
      )}
    </Card>
  );

  // Desktop Table View
  const renderDesktopView = () => (
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
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 8, height: skeletonRows * 73 }}
                >
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

  return isMobile ? renderMobileView() : renderDesktopView();
}
