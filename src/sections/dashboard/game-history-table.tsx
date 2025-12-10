'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Box, Stack, Button, Chip, Avatar, Typography, IconButton } from '@mui/material';

import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { DataTable, type DataTableColumn } from 'src/components/data-table';
import { API_BASE_URL } from 'src/config/api.config';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

type GameHistoryItem = {
  id: string;
  date: string;
  opponent: string;
  gameType: 'AI' | 'Online';
  result: 'win' | 'loss' | 'draw';
  score: string;
  reward: number;
};

interface GameHistoryTableProps {
  limit?: number;
  showViewAll?: boolean;
}

// ----------------------------------------------------------------------

export function GameHistoryTable({ limit = 5, showViewAll = true }: GameHistoryTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'AI' | 'Online'>('all');
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token =
          sessionStorage.getItem('jwt_access_token') || localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/game/history/me?limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          const transformedGames = data.games.map((game: any) => {
            const isWhitePlayer = game.whitePlayer?.id === game.whitePlayerId;
            const userWon = game.winner === (isWhitePlayer ? 'WHITE' : 'BLACK');
            const opponent =
              game.gameType === 'AI'
                ? `AI ${game.gameState?.aiDifficulty || 'Medium'}`
                : (isWhitePlayer
                    ? game.blackPlayer?.displayName
                    : game.whitePlayer?.displayName) || 'Unknown';

            return {
              id: game.id,
              date: new Date(game.createdAt).toLocaleString('en-US', {
                timeZone: 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }),
              opponent,
              gameType: game.gameType as 'AI' | 'Online',
              result: !game.winner ? 'draw' : userWon ? 'win' : 'loss',
              score: `${game.whiteSetsWon || 0}-${game.blackSetsWon || 0}`,
              reward: 0,
            };
          });

          setHistory(transformedGames);
        }
      } catch (error) {
        console.error('Failed to fetch game history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [limit]);

  const filteredHistory =
    filter === 'all' ? history : history.filter((item) => item.gameType === filter);

  const columns: DataTableColumn<GameHistoryItem>[] = [
    {
      id: 'date',
      label: 'Date & Time',
      render: (row) => (
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          {row.date}
        </Typography>
      ),
    },
    {
      id: 'opponent',
      label: 'Opponent',
      render: (row) => (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: (theme) =>
                row.gameType === 'AI'
                  ? alpha(theme.palette.primary.main, 0.16)
                  : alpha(theme.palette.info.main, 0.16),
              color: row.gameType === 'AI' ? 'primary.main' : 'info.main',
            }}
          >
            <Iconify
              icon={row.gameType === 'AI' ? 'solar:cpu-bolt-bold' : 'solar:user-bold'}
              width={24}
            />
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{row.opponent}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {row.gameType === 'AI' ? 'Computer' : 'Online Player'}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: 'gameType',
      label: 'Game Type',
      align: 'center',
      hideOnMobile: true,
      render: (row) => (
        <Chip
          label={row.gameType}
          size="small"
          variant="soft"
          color={row.gameType === 'AI' ? 'primary' : 'info'}
          sx={{ minWidth: 70, fontWeight: 600 }}
        />
      ),
    },
    {
      id: 'score',
      label: 'Score',
      align: 'center',
      hideOnMobile: true,
      render: (row) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {row.score}
        </Typography>
      ),
    },
    {
      id: 'result',
      label: 'Result',
      align: 'center',
      render: (row) => (
        <Chip
          label={row.result.toUpperCase()}
          size="small"
          variant="soft"
          color={row.result === 'win' ? 'success' : row.result === 'loss' ? 'error' : 'default'}
          sx={{ minWidth: 70, fontWeight: 600 }}
        />
      ),
    },
    {
      id: 'reward',
      label: 'Reward (USDT)',
      align: 'right',
      render: (row) =>
        row.reward > 0 ? (
          <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
            +${row.reward.toFixed(2)}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            -
          </Typography>
        ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      hideOnMobile: true,
      render: () => (
        <IconButton
          size="small"
          color="primary"
          sx={{
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <Iconify icon="solar:eye-bold" width={20} />
        </IconButton>
      ),
    },
  ];

  const filterButtons = (
    <Stack direction="row" spacing={1} alignItems="center">
      <Button
        size="small"
        variant={filter === 'all' ? 'contained' : 'outlined'}
        color="primary"
        onClick={() => setFilter('all')}
      >
        All
      </Button>
      <Button
        size="small"
        variant={filter === 'AI' ? 'contained' : 'outlined'}
        color="primary"
        onClick={() => setFilter('AI')}
      >
        AI
      </Button>
      <Button
        size="small"
        variant={filter === 'Online' ? 'contained' : 'outlined'}
        color="primary"
        onClick={() => setFilter('Online')}
      >
        Online
      </Button>
      {showViewAll && (
        <Button
          size="small"
          variant="text"
          color="primary"
          endIcon={<Iconify icon="solar:alt-arrow-right-linear" />}
          onClick={() => router.push(paths.dashboard.gameHistory)}
        >
          View All
        </Button>
      )}
    </Stack>
  );

  return (
    <DataTable
      title="Recent Games"
      action={filterButtons}
      columns={columns}
      rows={filteredHistory}
      loading={loading}
      skeletonRows={limit}
      emptyMessage="No game history available"
    />
  );
}
