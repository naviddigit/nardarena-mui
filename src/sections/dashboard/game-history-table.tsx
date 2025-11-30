'use client';

// ⚠️ DO NOT MODIFY - Compact game history table for player dashboard
// Shows recent games with filters, opponent, result, and USDT rewards

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import { Stack, Chip, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type GameHistoryItem = {
  id: string;
  date: string;
  opponent: string;
  gameType: 'AI' | 'Online';
  result: 'win' | 'loss';
  score: string;
  reward: number;
};

// ⚠️ MOCK DATA - Will be replaced with API calls
const MOCK_HISTORY: GameHistoryItem[] = [
  {
    id: '1',
    date: '2025-11-30 14:30',
    opponent: 'AI Level 3',
    gameType: 'AI',
    result: 'win',
    score: '15-12',
    reward: 2.5,
  },
  {
    id: '2',
    date: '2025-11-30 13:15',
    opponent: 'Player_123',
    gameType: 'Online',
    result: 'loss',
    score: '10-15',
    reward: 0,
  },
  {
    id: '3',
    date: '2025-11-29 20:45',
    opponent: 'AI Level 2',
    gameType: 'AI',
    result: 'win',
    score: '15-8',
    reward: 1.8,
  },
];

export function GameHistoryTable() {
  const [filter, setFilter] = useState<'all' | 'AI' | 'Online'>('all');

  const filteredHistory =
    filter === 'all' ? MOCK_HISTORY : MOCK_HISTORY.filter((item) => item.gameType === filter);

  return (
    <Card>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 3, pb: 2 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:history-bold" width={24} sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Recent Games</Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            size="small"
            variant={filter === 'AI' ? 'contained' : 'outlined'}
            onClick={() => setFilter('AI')}
          >
            AI
          </Button>
          <Button
            size="small"
            variant={filter === 'Online' ? 'contained' : 'outlined'}
            onClick={() => setFilter('Online')}
          >
            Online
          </Button>
        </Stack>
      </Stack>

      <Scrollbar>
        <TableContainer sx={{ minWidth: 720 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Opponent</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Result</TableCell>
                <TableCell align="right">Reward (USDT)</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredHistory.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant="body2">{row.date}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.opponent}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={row.gameType}
                      size="small"
                      color={row.gameType === 'AI' ? 'primary' : 'info'}
                      sx={{ minWidth: 64 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {row.score}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={row.result.toUpperCase()}
                      size="small"
                      color={row.result === 'win' ? 'success' : 'error'}
                      sx={{ minWidth: 64 }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    {row.reward > 0 ? (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        +${row.reward.toFixed(2)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        -
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <IconButton size="small" color="primary">
                      <Iconify icon="solar:eye-bold" width={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Card>
  );
}

