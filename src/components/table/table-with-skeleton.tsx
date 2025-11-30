import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import CircularProgress from '@mui/material/CircularProgress';

import { Scrollbar } from '../scrollbar';
import { TableHeadCustom, type TableHeadCustomProps } from './table-head-custom';

// ----------------------------------------------------------------------

export type TableWithSkeletonProps = {
  loading: boolean;
  headLabel: TableHeadCustomProps['headLabel'];
  skeletonRows: React.ReactNode;
  children: React.ReactNode;
  tableSize?: 'small' | 'medium';
  minWidth?: number;
  rowsPerPage: number;
  sx?: SxProps<Theme>;
  tableHeadProps?: Omit<TableHeadCustomProps, 'headLabel'>;
};

// ----------------------------------------------------------------------

export function TableWithSkeleton({
  loading,
  headLabel,
  skeletonRows,
  children,
  tableSize = 'medium',
  minWidth = 960,
  rowsPerPage,
  sx,
  tableHeadProps,
}: TableWithSkeletonProps) {
  const rowHeight = tableSize === 'small' ? 56 : 76;

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <Scrollbar>
        <Table size={tableSize} sx={{ minWidth }}>
          <TableHeadCustom headLabel={headLabel} {...tableHeadProps} />

          <TableBody sx={{ minHeight: rowHeight * rowsPerPage }}>
            {loading ? (
              // Show skeleton rows during loading
              skeletonRows
            ) : (
              // Show actual data when not loading
              <>
                {children}
              </>
            )}
          </TableBody>
        </Table>
      </Scrollbar>

      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            opacity: 0.3,
            zIndex: 9,
            pointerEvents: 'none',
          }}
        >
          <CircularProgress size={32} thickness={4} />
        </Box>
      )}
    </Box>
  );
}
