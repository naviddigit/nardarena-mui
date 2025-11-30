import type { AdminGame } from 'src/services/admin-api';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import { fDate, fTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

type Props = {
  row: AdminGame;
  selected: boolean;
  onSelectRow: () => void;
};

export function AdminGameTableRow({ row, selected, onSelectRow }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'info';
      case 'COMPLETED': return 'success';
      case 'ABANDONED': return 'error';
      case 'WAITING': return 'warning';
      default: return 'default';
    }
  };

  const getGameTypeColor = (type: string) => {
    switch (type) {
      case 'AI': return 'primary';
      case 'ONLINE': return 'secondary';
      case 'TOURNAMENT': return 'warning';
      default: return 'default';
    }
  };

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell>
        <Chip label={row.gameType} color={getGameTypeColor(row.gameType) as any} size="small" />
      </TableCell>

      <TableCell>
        <Chip label={row.status} color={getStatusColor(row.status) as any} size="small" />
      </TableCell>

      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar src={row.whitePlayer.avatar || undefined} sx={{ width: 32, height: 32 }}>
            {row.whitePlayer.displayName?.[0] || row.whitePlayer.username[0]}
          </Avatar>
          <Typography variant="body2" noWrap>
            {row.whitePlayer.displayName || row.whitePlayer.username}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar src={row.blackPlayer.avatar || undefined} sx={{ width: 32, height: 32 }}>
            {row.blackPlayer.displayName?.[0] || row.blackPlayer.username[0]}
          </Avatar>
          <Typography variant="body2" noWrap>
            {row.blackPlayer.displayName || row.blackPlayer.username}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="center">
        <Typography variant="body2">
          {row.whiteSetsWon} - {row.blackSetsWon}
        </Typography>
      </TableCell>

      <TableCell align="center">
        {row.winner ? (
          <Chip 
            label={row.winner === 'WHITE' ? 'White' : 'Black'} 
            color={row.winner === 'WHITE' ? 'primary' : 'secondary'}
            size="small"
          />
        ) : (
          <Typography variant="body2" color="text.disabled">-</Typography>
        )}
      </TableCell>

      <TableCell align="center">
        <Typography variant="body2">{row.moveCount}</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {fDate(row.createdAt)}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {fTime(row.createdAt)}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
