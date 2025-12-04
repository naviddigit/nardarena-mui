'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'src/utils/axios';
import { API_BASE_URL } from 'src/config/api.config';

// ----------------------------------------------------------------------

type ServiceStatus = 'healthy' | 'unhealthy' | 'checking';

interface HealthData {
  frontend: ServiceStatus;
  backend: ServiceStatus;
  database: ServiceStatus;
  backendDetails?: any;
}

export default function HealthCheckPage() {
  const theme = useTheme();
  const [health, setHealth] = useState<HealthData>({
    frontend: 'healthy',
    backend: 'checking',
    database: 'checking',
  });

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setHealth({
        frontend: 'healthy',
        backend: 'healthy',
        database: response.data.services.database.status,
        backendDetails: response.data,
      });
    } catch (error) {
      setHealth({
        frontend: 'healthy',
        backend: 'unhealthy',
        database: 'unhealthy',
      });
    }
  };

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'healthy':
        return theme.palette.success.main;
      case 'unhealthy':
        return theme.palette.error.main;
      case 'checking':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'unhealthy':
        return '❌';
      case 'checking':
        return '🔄';
      default:
        return '❓';
    }
  };

  const services = [
    {
      name: 'Frontend (Next.js)',
      status: health.frontend,
      port: '8083',
      description: 'User Interface',
    },
    {
      name: 'Backend (NestJS)',
      status: health.backend,
      port: '3002',
      description: 'API Server',
    },
    {
      name: 'Database (PostgreSQL)',
      status: health.database,
      port: '5432',
      description: 'Data Storage',
    },
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box textAlign="center">
            <Typography
              variant="h3"
              sx={{
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Brush Script MT, cursive',
              }}
            >
              🎲 Nard Arena
            </Typography>
            <Typography variant="h5" color="text.secondary">
              DevOps Health Check
            </Typography>
          </Box>

          {/* Services Status */}
          <Stack spacing={2}>
            {services.map((service) => (
              <Card
                key={service.name}
                sx={{
                  p: 3,
                  backdropFilter: 'blur(20px)',
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  border: `2px solid ${alpha(getStatusColor(service.status), 0.3)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.customShadows.z24,
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Box
                    sx={{
                      fontSize: 40,
                      animation:
                        service.status === 'checking'
                          ? 'spin 2s linear infinite'
                          : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  >
                    {getStatusIcon(service.status)}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{service.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description} • Port {service.port}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: alpha(getStatusColor(service.status), 0.1),
                      color: getStatusColor(service.status),
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      fontSize: 12,
                    }}
                  >
                    {service.status}
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>

          {/* Backend Details */}
          {health.backendDetails && (
            <Card
              sx={{
                p: 3,
                backdropFilter: 'blur(20px)',
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                📊 Backend Details
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Uptime
                  </Typography>
                  <Typography variant="body1">
                    {Math.floor(health.backendDetails.uptime / 60)} minutes
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Response Time
                  </Typography>
                  <Typography variant="body1">
                    {health.backendDetails.responseTime}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Environment
                  </Typography>
                  <Typography variant="body1">
                    {health.backendDetails.environment}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          )}

          {/* Overall Status */}
          <Card
            sx={{
              p: 3,
              textAlign: 'center',
              backdropFilter: 'blur(20px)',
              backgroundColor: alpha(
                health.backend === 'healthy' && health.database === 'healthy'
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                0.1
              ),
              border: `2px solid ${alpha(
                health.backend === 'healthy' && health.database === 'healthy'
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                0.3
              )}`,
            }}
          >
            <Typography variant="h5">
              {health.backend === 'healthy' && health.database === 'healthy'
                ? '✅ All Systems Operational'
                : '⚠️ Some Services Are Down'}
            </Typography>
          </Card>
        </Stack>
      </Box>
    </Container>
  );
}
