'use client';

import { useState, useCallback, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import type { GameSetting } from 'src/api/game-settings';
import { useGameSettings, useUpdateGameSettings } from 'src/hooks/use-game-settings';

// ----------------------------------------------------------------------

export default function GameSettingsView() {
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Fetch settings from API
  const { settings: apiSettings = [], loading: fetchLoading, refetch } = useGameSettings();
  const { updateBulk, resetToDefaults, loading: updateLoading } = useUpdateGameSettings();

  // Local state for editing
  const [localSettings, setLocalSettings] = useState<GameSetting[]>([]);
  
  // Bet amounts management
  const [betAmounts, setBetAmounts] = useState<number[]>([5, 10, 25, 50, 100, 250, 500]);
  const [newBetAmount, setNewBetAmount] = useState('');

  // Sync local state with fetched settings whenever apiSettings changes
  useEffect(() => {
    if (apiSettings && apiSettings.length > 0) {
      setLocalSettings(apiSettings);
      
      // Parse bet amounts from settings
      const betSetting = apiSettings.find((s) => s.key === 'game.allowed_bet_amounts');
      if (betSetting) {
        try {
          const amounts = JSON.parse(betSetting.value);
          setBetAmounts(amounts);
        } catch (e) {
          console.error('Failed to parse bet amounts:', e);
        }
      }
    } else if (apiSettings.length === 0 && !fetchLoading) {
      // If API returns empty and not loading, show message
      console.warn('No game settings found in database. Please run seed command.');
    }
  }, [apiSettings, fetchLoading]);

  // Handle setting change
  const handleSettingChange = useCallback((id: string, newValue: string) => {
    setLocalSettings((prev) =>
      prev.map((setting) => (setting.id === id ? { ...setting, value: newValue } : setting))
    );
    setSaveSuccess(false);
  }, []);

  // Handle boolean setting change
  const handleBooleanChange = useCallback((id: string, checked: boolean) => {
    setLocalSettings((prev) =>
      prev.map((setting) => (setting.id === id ? { ...setting, value: String(checked) } : setting))
    );
    setSaveSuccess(false);
  }, []);

  // Add new bet amount
  const handleAddBetAmount = useCallback(() => {
    const amount = parseFloat(newBetAmount);
    if (!amount || amount <= 0 || betAmounts.includes(amount)) {
      return;
    }
    
    const newAmounts = [...betAmounts, amount].sort((a, b) => a - b);
    setBetAmounts(newAmounts);
    setNewBetAmount('');
    setSaveSuccess(false);
  }, [newBetAmount, betAmounts]);

  // Remove bet amount
  const handleRemoveBetAmount = useCallback((amount: number) => {
    setBetAmounts((prev) => prev.filter((a) => a !== amount));
    setSaveSuccess(false);
  }, []);

  // Save settings to backend
  const handleSave = useCallback(async () => {
    try {
      // Only update settings that exist in API (not mock data)
      // Filter by checking if setting exists in apiSettings
      const realSettings = localSettings.filter((s) => 
        apiSettings.some((api) => api.key === s.key)
      );
      
      const updates = realSettings.map((s) => ({ key: s.key, value: s.value }));
      
      // Only add bet amounts if it exists in apiSettings
      if (apiSettings.some((s) => s.key === 'game.allowed_bet_amounts')) {
        updates.push({
          key: 'game.allowed_bet_amounts',
          value: JSON.stringify(betAmounts),
        });
      }
      
      if (updates.length === 0) {
        console.warn('No real settings to update');
        return;
      }
      
      await updateBulk(updates);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Refresh from server
      await refetch();
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [localSettings, apiSettings, betAmounts, updateBulk, refetch]);

  // Reset to defaults
  const handleReset = useCallback(async () => {
    try {
      const defaults = await resetToDefaults();
      setLocalSettings(defaults);
      setSaveSuccess(false);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }, [resetToDefaults]);

  // Render text field settings
  const renderTextField = (setting: GameSetting) => (
    <TextField
      key={setting.id}
      label={setting.description}
      value={setting.value}
      onChange={(e) => handleSettingChange(setting.id, e.target.value)}
      fullWidth
      type={setting.dataType === 'number' ? 'number' : 'text'}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="solar:settings-bold-duotone" width={20} />
          </InputAdornment>
        ),
      }}
    />
  );

  // Render boolean switch settings
  const renderSwitch = (setting: GameSetting) => (
    <FormControlLabel
      key={setting.id}
      control={
        <Switch
          checked={setting.value === 'true'}
          onChange={(e) => handleBooleanChange(setting.id, e.target.checked)}
        />
      }
      label={setting.description}
    />
  );

  // Filter settings by category (case-insensitive to match backend uppercase)
  const timingSettings = (localSettings || []).filter((s) => s.category?.toLowerCase() === 'timing');
  const scoringSettings = (localSettings || []).filter((s) => s.category?.toLowerCase() === 'scoring');
  const rulesSettings = (localSettings || []).filter((s) => s.category?.toLowerCase() === 'rules');
  const aiSettings = (localSettings || []).filter((s) => s.category?.toLowerCase() === 'ai');

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <div>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            Game Settings
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage game rules, timing and scoring configuration
          </Typography>
        </div>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:restart-bold" />}
            onClick={handleReset}
            disabled={updateLoading}
          >
            Reset to Defaults
          </Button>

          <LoadingButton
            variant="contained"
            color={saveSuccess ? 'success' : 'primary'}
            startIcon={
              <Iconify icon={saveSuccess ? 'eva:checkmark-fill' : 'eva:save-fill'} width={20} />
            }
            onClick={handleSave}
            loading={updateLoading}
          >
            {saveSuccess ? 'Saved' : 'Save Changes'}
          </LoadingButton>
        </Stack>
      </Stack>

      {/* Success Message */}
      {saveSuccess && (
        <Card
          sx={{
            p: 2,
            mb: 3,
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
            border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.16)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:checkmark-circle-2-fill" width={24} color="success.main" />
            <Typography variant="body2" color="success.dark">
              Settings saved successfully
            </Typography>
          </Stack>
        </Card>
      )}

      <Stack spacing={3}>
        {/* Timing Settings */}
        {timingSettings.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
              <Iconify icon="solar:clock-circle-bold-duotone" width={28} />
              <Typography variant="h6">Timing Settings</Typography>
            </Stack>
            <Stack spacing={2.5}>
              {timingSettings.map((setting) => renderTextField(setting))}
            </Stack>
          </Card>
        )}

        {/* Scoring Settings */}
        {scoringSettings.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
              <Iconify icon="solar:medal-star-bold-duotone" width={28} />
              <Typography variant="h6">Scoring Settings</Typography>
            </Stack>
            <Stack spacing={2.5}>
              {scoringSettings.map((setting) =>
                setting.dataType === 'boolean' ? renderSwitch(setting) : renderTextField(setting)
              )}
            </Stack>
          </Card>
        )}

        {/* AI Behavior Settings */}
        {aiSettings.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
              <Iconify icon="solar:cpu-bolt-bold-duotone" width={28} />
              <Typography variant="h6">AI Behavior</Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Control AI move delays to simulate human-like gameplay
            </Typography>
            <Stack spacing={2.5}>
              {aiSettings.map((setting) => renderTextField(setting))}
            </Stack>
          </Card>
        )}

        {/* Rules Settings */}
        {rulesSettings.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
              <Iconify icon="solar:book-bold-duotone" width={28} />
              <Typography variant="h6">Game Rules</Typography>
            </Stack>
            <Stack spacing={2.5}>
              {rulesSettings.map((setting) =>
                setting.dataType === 'boolean' ? renderSwitch(setting) : renderTextField(setting)
              )}
            </Stack>
          </Card>
        )}

        {/* Bet Amounts Settings */}
        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
            <Iconify icon="solar:shield-check-bold-duotone" width={28} />
            <Typography variant="h6">Allowed Bet Amounts (USDT)</Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Players can only bet these specific amounts
          </Typography>

          {/* Current amounts */}
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            {betAmounts.map((amount) => (
              <Chip
                key={amount}
                label={`${amount} USDT`}
                onDelete={() => handleRemoveBetAmount(amount)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>

          {/* Add new amount */}
          <Stack direction="row" spacing={1}>
            <TextField
              label="New Amount (USDT)"
              value={newBetAmount}
              onChange={(e) => setNewBetAmount(e.target.value)}
              type="number"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:dollar-bold" width={20} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleAddBetAmount}
              disabled={!newBetAmount}
            >
              Add
            </Button>
          </Stack>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
