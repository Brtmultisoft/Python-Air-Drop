import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import PoolReport from '../components/PoolReport';
import { useWallet } from '../context/WalletContext';
import CasinoIcon from '@mui/icons-material/Casino';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Styled components for the game-like interface
const PageHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
  padding: theme.spacing(4, 0),
  marginBottom: theme.spacing(4),
  borderRadius: '0 0 20px 20px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 235, 59, 0.3)',
    transition: 'all 0.3s ease',
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 235, 59, 0.6)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#ffeb3b',
      borderWidth: '2px',
      boxShadow: '0 0 15px rgba(255, 235, 59, 0.3)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#ffeb3b',
  },
  '& .MuiSelect-select': {
    padding: theme.spacing(1.5, 2),
  },
  '& .MuiSvgIcon-root': {
    color: 'rgba(255, 235, 59, 0.7)',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 235, 59, 0.3)',
  },
  '& .MuiMenuItem-root': {
    '&.Mui-selected': {
      backgroundColor: 'rgba(76, 175, 80, 0.15)',
    },
  },
}));

const SelectPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '20px',
  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25), 0 0 20px rgba(76, 175, 80, 0.2)',
  background: 'linear-gradient(135deg, rgba(10, 31, 10, 0.95) 0%, rgba(13, 38, 13, 0.95) 100%)',
  overflow: 'hidden',
  border: '2px solid rgba(76, 175, 80, 0.5)',
  padding: theme.spacing(3),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 50% 0%, rgba(76, 175, 80, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'49\' viewBox=\'0 0 28 49\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg id=\'hexagons\' fill=\'%234caf50\' fill-opacity=\'0.05\' fill-rule=\'nonzero\'%3E%3Cpath d=\'M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    backgroundSize: '28px',
    opacity: 0.5,
    zIndex: 0,
    pointerEvents: 'none',
  },
}));

interface LocationState {
  selectedPool?: string;
}

const PoolReports: React.FC = () => {
  const { isConnected, isRegistered } = useWallet();
  const location = useLocation();
  const [selectedPool, setSelectedPool] = useState<string>('POOL_1_DOLLAR');

  // Check if a pool was selected from the navbar dropdown
  useEffect(() => {
    const state = location.state as LocationState;
    if (state && state.selectedPool) {
      setSelectedPool(state.selectedPool);
    }
  }, [location.state]);

  const handlePoolChange = (event: SelectChangeEvent) => {
    setSelectedPool(event.target.value as string);
  };

  // Pool options
  const poolOptions = [
    { value: 'POOL_1_DOLLAR', label: 'Raffle 1 ($1 Pool)' },
    { value: 'POOL_2_DOLLAR', label: 'Raffle 2 ($10 Pool)' },
    { value: 'POOL_5_DOLLAR', label: 'Raffle 3 ($100 Pool)' },
    { value: 'POOL_10_DOLLAR', label: 'Raffle 4 ($1,000 Pool)' },
    { value: 'POOL_20_DOLLAR', label: 'Raffle 5 ($10,000 Pool)' },
    { value: 'POOL_50_DOLLAR', label: 'Raffle 6 ($100,000 Pool)' }
  ];

  // Get the pool name based on the selected pool value
  const getPoolName = (poolValue: string): string => {
    const pool = poolOptions.find(option => option.value === poolValue);
    return pool ? pool.label : 'Unknown Pool';
  };

  if (!isConnected) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: '16px',
          border: '2px solid #4caf50',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            Please connect your wallet to view pool reports
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (!isRegistered) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: '16px',
          border: '2px solid #4caf50',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            Please register to view pool reports
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <PageHeader>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AssessmentIcon sx={{ color: 'white', mr: 2, fontSize: '2rem' }} />
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
              Pool Reports
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'medium' }}>
            View your participation history across all raffle pools
          </Typography>
        </Container>
      </PageHeader>

      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <SelectPaper elevation={3}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: { xs: 'flex-start', md: 'center' } }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    width: { xs: 50, sm: 60 },
                    height: { xs: 50, sm: 60 },
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 235, 59, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    border: '2px solid rgba(255, 235, 59, 0.4)',
                    boxShadow: '0 0 15px rgba(255, 235, 59, 0.2)',
                    animation: 'pulse 2s infinite ease-in-out',
                    '@keyframes pulse': {
                      '0%': { boxShadow: '0 0 0 0 rgba(255, 235, 59, 0.4)' },
                      '70%': { boxShadow: '0 0 0 10px rgba(255, 235, 59, 0)' },
                      '100%': { boxShadow: '0 0 0 0 rgba(255, 235, 59, 0)' }
                    }
                  }}
                >
                  <CasinoIcon sx={{ color: '#ffeb3b', fontSize: { xs: '2rem', sm: '2.5rem' } }} />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#ffeb3b',
                      fontWeight: 'bold',
                      mb: 0.5,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      textShadow: '0 0 10px rgba(255, 235, 59, 0.3)'
                    }}
                  >
                    Select Raffle Pool
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: { xs: '0.8rem', sm: '0.9rem' }
                    }}
                  >
                    Choose a pool to view your participation history
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ flex: 1, width: '100%', mt: { xs: 2, md: 0 } }}>
              <StyledFormControl fullWidth>
                <InputLabel id="pool-select-label">Select Pool</InputLabel>
                <Select
                  labelId="pool-select-label"
                  id="pool-select"
                  value={selectedPool}
                  label="Select Pool"
                  onChange={handlePoolChange}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: 'rgba(10, 31, 10, 0.95)',
                        border: '2px solid rgba(76, 175, 80, 0.3)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), 0 0 15px rgba(76, 175, 80, 0.2)',
                        '& .MuiMenuItem-root': {
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                          },
                          '&.Mui-selected': {
                            bgcolor: 'rgba(76, 175, 80, 0.2)',
                            color: '#ffeb3b',
                            fontWeight: 'bold',
                            '&:hover': {
                              bgcolor: 'rgba(76, 175, 80, 0.3)',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  {poolOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
            </Box>
          </Box>
        </SelectPaper>

        <Box sx={{ mt: 4 }}>
          <PoolReport
            poolType={selectedPool}
            poolName={getPoolName(selectedPool)}
          />
        </Box>
      </Container>
    </>
  );
};

export default PoolReports;
