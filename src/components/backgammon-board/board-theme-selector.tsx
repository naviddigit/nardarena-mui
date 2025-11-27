import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from 'src/components/iconify';
import { useBoardTheme } from 'src/hooks/use-board-theme';

// ----------------------------------------------------------------------

export function BoardThemeSelector() {
  const { 
    currentTheme, 
    freeThemes, 
    premiumThemes, 
    changeTheme, 
    purchaseTheme,
    hasAccessToTheme,
    loading 
  } = useBoardTheme(false); // false = Mock Data | true = API
  
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedThemeForPurchase, setSelectedThemeForPurchase] = useState<string | null>(null);

  const handleThemeClick = async (themeId: string, isPremium: boolean) => {
    if (isPremium) {
      const hasAccess = await hasAccessToTheme(themeId);
      if (!hasAccess) {
        setSelectedThemeForPurchase(themeId);
        setPurchaseDialogOpen(true);
        return;
      }
    }
    
    try {
      await changeTheme(themeId);
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedThemeForPurchase) return;
    
    try {
      const success = await purchaseTheme(selectedThemeForPurchase);
      if (success) {
        await changeTheme(selectedThemeForPurchase);
        setPurchaseDialogOpen(false);
        setSelectedThemeForPurchase(null);
      }
    } catch (error) {
      console.error('Failed to purchase theme:', error);
    }
  };

  const renderThemeCard = (theme: any) => {
    const isActive = theme.id === currentTheme.id;
    
    return (
      <Grid item xs={12} sm={6} md={4} key={theme.id}>
        <Card
          sx={{
            position: 'relative',
            cursor: 'pointer',
            border: isActive ? 2 : 1,
            borderColor: isActive ? 'primary.main' : 'divider',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: 8,
              transform: 'translateY(-4px)',
            },
          }}
          onClick={() => handleThemeClick(theme.id, theme.isPremium)}
        >
          {/* تم پیش‌نمایش */}
          <Box
            sx={{
              height: 120,
              bgcolor: theme.colors.background,
              display: 'flex',
              gap: 1,
              p: 2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* پیش‌نمایش نقاط */}
            <Box sx={{ width: 40, height: 80, bgcolor: theme.colors.darkPoint, borderRadius: 1 }} />
            <Box sx={{ width: 40, height: 80, bgcolor: theme.colors.lightPoint, borderRadius: 1 }} />
            <Box sx={{ width: 20, height: 80, bgcolor: theme.colors.barBackground, borderRadius: 1 }} />
          </Box>
          
          <Box sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Typography variant="subtitle2">{theme.name}</Typography>
              {theme.isPremium && (
                <Chip 
                  label="پریمیوم" 
                  size="small" 
                  color="warning" 
                  icon={<Iconify icon="solar:star-bold" />}
                />
              )}
            </Stack>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {theme.nameEn}
            </Typography>
            
            {isActive && (
              <Chip 
                label="فعال" 
                size="small" 
                color="success" 
                icon={<Iconify icon="solar:check-circle-bold" />}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Card>
      </Grid>
    );
  };

  return (
    <Box>
      <Stack spacing={4}>
        {/* تم‌های رایگان */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            تم‌های رایگان
          </Typography>
          <Grid container spacing={2}>
            {freeThemes.map(renderThemeCard)}
          </Grid>
        </Box>

        {/* تم‌های پریمیوم */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6">
              تم‌های پریمیوم
            </Typography>
            <Iconify icon="solar:star-bold" color="warning.main" />
          </Stack>
          <Grid container spacing={2}>
            {premiumThemes.map(renderThemeCard)}
          </Grid>
        </Box>
      </Stack>

      {/* دیالوگ خرید */}
      <Dialog 
        open={purchaseDialogOpen} 
        onClose={() => setPurchaseDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>خرید تم پریمیوم</DialogTitle>
        <DialogContent>
          <Typography>
            آیا می‌خواهید این تم پریمیوم را خریداری کنید؟
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Typography variant="h6" color="primary">
              قیمت: 50,000 تومان
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)}>
            انصراف
          </Button>
          <Button 
            variant="contained" 
            onClick={handlePurchase}
            disabled={loading}
          >
            خرید
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
