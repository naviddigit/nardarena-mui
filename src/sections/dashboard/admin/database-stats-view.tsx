'use client';

import { useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Card,
  Stack,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { adminApi } from 'src/api/admin';

// Types
interface TableStats {
  name: string;
  rowCount: number;
  sizeBytes: number;
  sizeFormatted: string;
}

interface DatabaseStats {
  totalSize: string;
  tables: TableStats[];
  oldGamesCount: number;
  oldMovesCount: number;
  archivableGamesCount: number;
  deletableMovesCount: number;
}

interface Recommendation {
  action: string;
  description: string;
  estimatedSpaceSaved: string;
  risk: 'low' | 'medium' | 'high';
}

interface CleanupResult {
  gamesArchived?: number;
  movesDeleted?: number;
  spaceSaved?: string;
  deleted?: number;
  message?: string;
}

export function DatabaseStatsView() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cleanupDialog, setCleanupDialog] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [optimizeDialog, setOptimizeDialog] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(10);
  const [archiveMonths, setArchiveMonths] = useState(6);
  const [deleteMonths, setDeleteMonths] = useState(12);
  const [dryRun, setDryRun] = useState(true);

  // Fetch stats and recommendations
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, recsData] = await Promise.all([
        adminApi.getDatabaseStats(),
        adminApi.getCleanupRecommendations(),
      ]);
      setStats(statsData);
      setRecommendations(recsData.recommendations || []);
    } catch (err: any) {
      console.error('Database API Error:', err);
      // Show mock data if backend not ready
      setStats({
        totalSize: 'Backend Not Ready',
        tables: [],
        oldGamesCount: 0,
        oldMovesCount: 0,
        archivableGamesCount: 0,
        deletableMovesCount: 0,
      });
      setError('Backend database service not available yet. Please restart backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cleanup actions
  const handleCleanupMoves = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result: CleanupResult = await adminApi.cleanupOldGameMoves(cleanupDays, dryRun);
      setSuccess(
        dryRun
          ? result.spaceSaved || 'Dry run completed'
          : `Cleaned up ${result.movesDeleted} moves, saved ${result.spaceSaved}`
      );
      if (!dryRun) {
        await fetchData();
      }
      setCleanupDialog(false);
    } catch (err: any) {
      setError(err.message || 'Cleanup failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchiveGames = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result: CleanupResult = await adminApi.archiveOldGames(archiveMonths, dryRun);
      setSuccess(
        dryRun
          ? result.spaceSaved || 'Dry run completed'
          : `Archived ${result.gamesArchived} games, saved ${result.spaceSaved}`
      );
      if (!dryRun) {
        await fetchData();
      }
      setArchiveDialog(false);
    } catch (err: any) {
      setError(err.message || 'Archive failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOldGames = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result: CleanupResult = await adminApi.deleteVeryOldGames(deleteMonths, dryRun);
      setSuccess(
        dryRun
          ? result.spaceSaved || 'Dry run completed'
          : `Deleted ${result.deleted} games, saved ${result.spaceSaved}`
      );
      if (!dryRun) {
        await fetchData();
      }
      setDeleteDialog(false);
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOptimize = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result: CleanupResult = await adminApi.optimizeDatabase();
      setSuccess(result.message || 'Database optimized successfully');
      await fetchData();
      setOptimizeDialog(false);
    } catch (err: any) {
      setError(err.message || 'Optimization failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'low') return 'success';
    if (risk === 'medium') return 'warning';
    return 'error';
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Database Management
      </Typography>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Iconify icon="solar:database-bold-duotone" width={48} sx={{ color: 'primary.main' }} />
              <Typography variant="h3">{stats?.totalSize || '0 MB'}</Typography>
              <Typography variant="body2" color="text.secondary">Database Size</Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Iconify icon="solar:archive-bold-duotone" width={48} sx={{ color: 'warning.main' }} />
              <Typography variant="h3">{stats?.archivableGamesCount || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Archivable Games</Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Iconify icon="solar:trash-bin-trash-bold-duotone" width={48} sx={{ color: 'error.main' }} />
              <Typography variant="h3">{stats?.deletableMovesCount || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Deletable Moves</Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Iconify icon="solar:history-bold-duotone" width={48} sx={{ color: 'info.main' }} />
              <Typography variant="h3">{stats?.oldGamesCount || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Old Games</Typography>
            </Stack>
          </Card>
        </Grid>

        {recommendations.length > 0 && (
          <Grid xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Cleanup Recommendations</Typography>
              <Stack spacing={2}>
                {recommendations.map((rec, i) => (
                  <Alert key={i} severity={rec.risk === 'low' ? 'info' : rec.risk === 'medium' ? 'warning' : 'error'}>
                    <Typography variant="subtitle2">{rec.description}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip label={`Risk: ${rec.risk}`} size="small" color={getRiskColor(rec.risk)} />
                      <Chip label={`Save: ${rec.estimatedSpaceSaved}`} size="small" color="success" variant="outlined" />
                    </Stack>
                  </Alert>
                ))}
              </Stack>
            </Card>
          </Grid>
        )}

        <Grid xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Actions</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="outlined" color="warning" startIcon={<Iconify icon="solar:broom-outline" />} onClick={() => setCleanupDialog(true)}>
                Cleanup Moves
              </Button>
              <Button variant="outlined" color="info" startIcon={<Iconify icon="solar:archive-outline" />} onClick={() => setArchiveDialog(true)}>
                Archive Games
              </Button>
              <Button variant="outlined" color="error" startIcon={<Iconify icon="solar:trash-bin-trash-outline" />} onClick={() => setDeleteDialog(true)}>
                Delete Old
              </Button>
              <Button variant="outlined" color="success" startIcon={<Iconify icon="solar:settings-outline" />} onClick={() => setOptimizeDialog(true)}>
                Optimize
              </Button>
              <Button variant="outlined" startIcon={<Iconify icon="solar:refresh-outline" />} onClick={fetchData} disabled={loading}>
                Refresh
              </Button>
            </Stack>
          </Card>
        </Grid>

        <Grid xs={12}>
          <Card>
            <Stack sx={{ p: 3, pb: 2 }}>
              <Typography variant="h6">Table Statistics</Typography>
            </Stack>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Table</TableCell>
                  <TableCell align="right">Rows</TableCell>
                  <TableCell align="right">Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.tables.map((t) => (
                  <TableRow key={t.name}>
                    <TableCell><Typography variant="body2" fontFamily="monospace">{t.name}</Typography></TableCell>
                    <TableCell align="right">{t.rowCount.toLocaleString()}</TableCell>
                    <TableCell align="right"><Chip label={t.sizeFormatted} size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={cleanupDialog} onClose={() => setCleanupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cleanup Old Game Moves</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Older Than (Days)" type="number" value={cleanupDays} onChange={(e) => setCleanupDays(Number(e.target.value))} inputProps={{ min: 1, max: 90 }} fullWidth />
            <FormControlLabel control={<Checkbox checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />} label="Dry Run (Preview only)" />
            <Alert severity="info">Deletes detailed GameMove records. moveHistory JSON preserved.</Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCleanupDialog(false)}>Cancel</Button>
          <LoadingButton variant="contained" color="warning" onClick={handleCleanupMoves} loading={actionLoading}>{dryRun ? 'Preview' : 'Cleanup'}</LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={archiveDialog} onClose={() => setArchiveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Archive Old Games</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Older Than (Months)" type="number" value={archiveMonths} onChange={(e) => setArchiveMonths(Number(e.target.value))} inputProps={{ min: 1, max: 24 }} fullWidth />
            <FormControlLabel control={<Checkbox checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />} label="Dry Run (Preview only)" />
            <Alert severity="warning">Removes detailed move data. Game summaries preserved.</Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveDialog(false)}>Cancel</Button>
          <LoadingButton variant="contained" color="info" onClick={handleArchiveGames} loading={actionLoading}>{dryRun ? 'Preview' : 'Archive'}</LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Very Old Games</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Older Than (Months)" type="number" value={deleteMonths} onChange={(e) => setDeleteMonths(Number(e.target.value))} inputProps={{ min: 6, max: 36 }} fullWidth />
            <FormControlLabel control={<Checkbox checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />} label="Dry Run (Preview only)" />
            <Alert severity="error">⚠️ PERMANENT deletion. Cannot be undone!</Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <LoadingButton variant="contained" color="error" onClick={handleDeleteOldGames} loading={actionLoading}>{dryRun ? 'Preview' : 'Delete'}</LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={optimizeDialog} onClose={() => setOptimizeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Optimize Database</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>Runs VACUUM, ANALYZE, REINDEX. May take a few minutes.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOptimizeDialog(false)}>Cancel</Button>
          <LoadingButton variant="contained" color="success" onClick={handleOptimize} loading={actionLoading}>Optimize</LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
