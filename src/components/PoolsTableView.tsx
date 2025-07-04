import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Avatar,
  Alert,
  Tooltip,
  Button
} from '@mui/material';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import {
  getPoolCounter,
  getPoolUniqueUsers,
  isRafflePaused,
  getEntryFee,
  getPoolStrength,
  getUSDTBalance,
} from '../services/contractService';
import { POOL_CONTRACTS } from '../config';
import CasinoIcon from '@mui/icons-material/Casino';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

interface PoolData {
  poolType: string;
  name: string;
  counter: number;
  uniqueUsers: number;
  entryFee: ethers.BigNumber;
  isPaused: boolean;
  poolStrength: number;
  isDeployed: boolean;
  previousPoolWinners: string[];
  previousPoolLosers: string[];
}

const PoolsTableView: React.FC = () => {
  const { account, isConnected, isRegistered } = useWallet();
  const navigate = useNavigate();

  const [poolsData, setPoolsData] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));

  // Fetch data for all pools
  const fetchAllPoolsData = async () => {
    if (!isConnected || !account) return;

    try {
      setLoading(true);
      setError(null);

      const poolsDataPromises = Object.entries(POOL_CONTRACTS).map(async ([poolType, poolInfo]) => {
        try {
          // Check if pool contract is deployed
          const isDeployed = !!poolInfo.address;

          if (!isDeployed) {
            return {
              poolType,
              name: poolInfo.name,
              counter: 0,
              uniqueUsers: 0,
              entryFee: ethers.BigNumber.from(0),
              isPaused: true,
              poolStrength: 0,
              isDeployed: false
            };
          }

          // Get pool data
          const counter = await getPoolCounter(poolType);
          const counterNum = Number(counter);

          let uniqueUsers = 0;
          try {
            const users = await getPoolUniqueUsers(counterNum, poolType);
            uniqueUsers = Number(users);
          } catch (error) {
            console.error(`Error fetching unique users for ${poolInfo.name}:`, error);
          }

          let entryFee = ethers.BigNumber.from(0);
          try {
            entryFee = await getEntryFee(poolType);
          } catch (error) {
            console.error(`Error fetching entry fee for ${poolInfo.name}:`, error);
          }

          let isPaused = true;
          try {
            isPaused = await isRafflePaused(poolType);
          } catch (error) {
            console.error(`Error checking if ${poolInfo.name} is paused:`, error);
          }

          let poolStrength = 0;
          try {
            const strength = await getPoolStrength(counterNum, poolType);
            poolStrength = Number(strength);
          } catch (error) {
            console.error(`Error fetching pool strength for ${poolInfo.name}:`, error);
          }

          return {
            poolType,
            name: poolInfo.name,
            counter: counterNum,
            uniqueUsers,
            entryFee,
            isPaused,
            poolStrength,
            isDeployed: true
          };
        } catch (error) {
          console.error(`Error fetching data for ${poolInfo.name}:`, error);
          return {
            poolType,
            name: poolInfo.name,
            counter: 0,
            uniqueUsers: 0,
            entryFee: ethers.BigNumber.from(0),
            isPaused: true,
            poolStrength: 0,
            isDeployed: false,
            previousPoolWinners: [],
            previousPoolLosers: []
          };
        }
      });

      // Get user USDT balance
      try {
        const balance = await getUSDTBalance(account);
        setUsdtBalance(balance);
      } catch (error) {
        console.error('Error fetching USDT balance:', error);
        setUsdtBalance(ethers.BigNumber.from(0));
      }

      const results = await Promise.all(poolsDataPromises);
      // Add type assertion to fix TypeScript error
      setPoolsData(results as PoolData[]);
    } catch (err: any) {
      console.error('Error fetching pools data:', err);
      setError('Failed to load pools data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle pool selection - navigate to the specific pool page
  const handlePoolSelect = (poolType: string) => {
    if (!isConnected || !account) {
      // If not connected, prompt to connect wallet first
      alert('Please connect your wallet first');
      return;
    }

    if (!isRegistered) {
      // If not registered, redirect to register page
      alert('Please register first');
      navigate('/register');
      return;
    }

    // Get the pool config
    const poolConfig = POOL_CONTRACTS[poolType as keyof typeof POOL_CONTRACTS];

    if (!poolConfig) {
      alert('Invalid pool selected');
      return;
    }

    // Navigate to the specific pool page
    navigate(`/pools?pool=${poolType}`);
    console.log(`Joining ${poolConfig.name}`);
  };

  // Fetch data on component mount and when connection status changes
  useEffect(() => {
    if (isConnected && account) {
      fetchAllPoolsData();
    }
  }, [isConnected, account, isRegistered]);

  // Function to generate different colors for avatars
  const getAvatarColor = (index: number): string => {
    // Array of vibrant colors for avatars
    const colors = [
      '#f44336', // Red
      '#e91e63', // Pink
      '#9c27b0', // Purple
      '#673ab7', // Deep Purple
      '#3f51b5', // Indigo
      '#2196f3', // Blue
      '#03a9f4', // Light Blue
      '#00bcd4', // Cyan
      '#009688', // Teal
      '#4caf50', // Green
    ];

    // Return a color based on the index
    return colors[index % colors.length];
  };

  // Function to get random avatar image URL
  const getAvatarImage = (index: number, poolType: string, poolCounter: number): string => {
    // Array of avatar image URLs (using DiceBear API for random avatars)
    // These are free-to-use avatar APIs that generate random character avatars
    const avatarStyles = [
      'avataaars', 'bottts', 'micah',
      'adventurer', 'adventurer-neutral', 'big-ears',
      'big-smile', 'fun-emoji'
    ];

    // Select a style based on the index
    const style = avatarStyles[index % avatarStyles.length];

    // Generate a seed based on the index to ensure consistency
    const seed = `player-${index}-${poolType}-${poolCounter}`;

    // Return the avatar URL from DiceBear API
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=${getAvatarColor(index).replace('#', '')}&radius=50`;
  };

  // Helper function to render player seats in a circle inside the table
  const renderPlayerSeats = (pool: PoolData) => {
    const totalSeats = 10;
    const filledSeats = pool.uniqueUsers;
    const emptySeats = totalSeats - filledSeats;

    // Create arrays for filled and empty seats
    const filled = Array(filledSeats).fill(0);
    const empty = Array(emptySeats).fill(0);

    // Combine filled and empty seats
    const allSeats = [...filled.map(() => true), ...empty.map(() => false)];

    // Responsive seat size
    const seatSize = { xs: 36, sm: 42, md: 50 };

    // Calculate positions in a circle
    return (
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5
      }}>
        {allSeats.map((isFilled, index) => {
          // Calculate position in a circle
          const angle = (index * (360 / totalSeats)) * (Math.PI / 180);
          // Responsive radius based on screen size
          const radius = { xs: 100, sm: 120, md: 140 };

          // Dynamic positioning based on screen size
          const left = {
            xs: `calc(50% + ${Math.sin(angle) * radius.xs}px - ${seatSize.xs/2}px)`,
            sm: `calc(50% + ${Math.sin(angle) * radius.sm}px - ${seatSize.sm/2}px)`,
            md: `calc(50% + ${Math.sin(angle) * radius.md}px - ${seatSize.md/2}px)`
          };

          const top = {
            xs: `calc(50% - ${Math.cos(angle) * radius.xs}px - ${seatSize.xs/2}px)`,
            sm: `calc(50% - ${Math.cos(angle) * radius.sm}px - ${seatSize.sm/2}px)`,
            md: `calc(50% - ${Math.cos(angle) * radius.md}px - ${seatSize.md/2}px)`
          };

          return (
            <Tooltip
              key={`seat-${index}`}
              title={
                isFilled
                  ? "Seat taken"
                  : "Click to join this pool"
              }
              arrow
            >
              <Box
                sx={{
                  position: 'absolute',
                  left,
                  top,
                  width: { xs: seatSize.xs, sm: seatSize.sm, md: seatSize.md },
                  height: { xs: seatSize.xs, sm: seatSize.sm, md: seatSize.md },
                  borderRadius: '50%',
                  bgcolor: isFilled ? 'rgba(158, 158, 158, 0.8)' : '#fdd835', // Gray for filled, yellow for empty
                  border: { xs: '1px solid rgba(255,255,255,0.7)', sm: '2px solid rgba(255,255,255,0.7)' },
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                  cursor: isFilled ? 'default' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: !isFilled ? 'scale(1.1)' : 'none',
                    boxShadow: !isFilled ? '0 6px 15px rgba(0,0,0,0.6)' : '0 4px 10px rgba(0,0,0,0.5)',
                    filter: !isFilled ? 'brightness(1.1)' : 'none'
                  },
                  zIndex: 10,
                  opacity: 1
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isFilled && !pool.isPaused && pool.isDeployed) {
                    handlePoolSelect(pool.poolType);
                  }
                }}
              >
                {/* Avatar icon */}
                {isFilled ? (
                  <Box sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Avatar
                      src={getAvatarImage(index, pool.poolType, pool.counter)}
                      alt={`Player ${index + 1}`}
                      sx={{
                        width: '80%',
                        height: '80%',
                        border: { xs: `1px solid ${getAvatarColor(index)}`, sm: `2px solid ${getAvatarColor(index)}` },
                        bgcolor: 'white',
                        color: 'white',
                        fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem' },
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        boxShadow: `0 0 10px ${getAvatarColor(index)}80`,
                        '&:hover': {
                          transform: 'scale(1.1) rotate(5deg)',
                          boxShadow: `0 0 15px ${getAvatarColor(index)}`
                        }
                      }}
                    />
                  </Box>
                ) : (
                  // Empty seat with pulsing effect
                  <Box sx={{
                    width: '85%',
                    height: '85%',
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 235, 59, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    border: { xs: '1px dashed rgba(255, 235, 59, 0.4)', sm: '2px dashed rgba(255, 235, 59, 0.4)' },
                    boxShadow: '0 0 15px rgba(255, 235, 59, 0.2)',
                    transition: 'all 0.3s ease',
                    animation: 'pulse-empty 2s infinite ease-in-out',
                    '@keyframes pulse-empty': {
                      '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 235, 59, 0.4)' },
                      '50%': { transform: 'scale(1.05)', boxShadow: '0 0 10px 5px rgba(255, 235, 59, 0.2)' },
                      '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 235, 59, 0.4)' }
                    },
                    '&:hover': {
                      transform: 'scale(1.1)',
                      bgcolor: 'rgba(255, 235, 59, 0.2)',
                      border: '2px solid rgba(255, 235, 59, 0.6)',
                      boxShadow: '0 0 20px rgba(255, 235, 59, 0.4)'
                    }
                  }}>
                    <Box
                      sx={{
                        width: '70%',
                        height: '70%',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(255, 235, 59, 0.2) 0%, rgba(255, 193, 7, 0.2) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: { xs: '1px solid rgba(255, 235, 59, 0.5)', sm: '2px solid rgba(255, 235, 59, 0.5)' },
                        boxShadow: '0 0 15px rgba(255, 235, 59, 0.3)',
                        mb: 0.5,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '-50%',
                          left: '-50%',
                          width: '200%',
                          height: '200%',
                          background: 'radial-gradient(circle, rgba(255, 235, 59, 0.3) 0%, transparent 70%)',
                          opacity: 0.7,
                          animation: 'rotate 10s linear infinite',
                        },
                        '@keyframes rotate': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }}
                    >
                      <PersonIcon
                        sx={{
                          color: '#fdd835',
                          fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                          filter: 'drop-shadow(0 0 5px rgba(255, 235, 59, 0.5))',
                          position: 'relative',
                          zIndex: 2
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        background: 'linear-gradient(90deg, rgba(255, 235, 59, 0.7) 0%, rgba(255, 193, 7, 0.7) 100%)',
                        borderRadius: '12px',
                        padding: { xs: '2px 6px', sm: '3px 8px', md: '4px 8px' },
                        border: '1px solid rgba(255, 235, 59, 0.8)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                        transform: 'translateY(0)',
                        transition: 'all 0.3s ease',
                        animation: 'float 2s ease-in-out infinite',
                        '@keyframes float': {
                          '0%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-3px)' },
                          '100%': { transform: 'translateY(0px)' }
                        }
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#1b5e20',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.7rem' },
                          textAlign: 'center',
                          lineHeight: 1,
                          textShadow: '0 1px 1px hsla(0, 0.00%, 100.00%, 0.30)'
                        }}
                      >
                        Join Now
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    );
  };


  

  // Helper function to render the center of the table
  const renderTableCenter = (pool: PoolData) => {
    // Get the pool value for display directly from the contract's entry fee
    const chipValue = pool.entryFee ? `$${Number(ethers.utils.formatUnits(pool.entryFee, 18))}` : '$0';

    return (
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: 80, sm: 100, md: 120 },
        height: { xs: 80, sm: 100, md: 120 },
        borderRadius: '50%',
        bgcolor: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: { xs: '1px solid rgba(255, 215, 0, 0.3)', sm: '2px solid rgba(255, 215, 0, 0.3)' },
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.2)',
        zIndex: 5
      }}>
        {/* Pool price */}
        <Typography
          variant="h6"
          sx={{
            color: '#fdd835',
            fontWeight: 'bold',
            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
            mb: { xs: 0.2, sm: 0.5 },
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {chipValue}
        </Typography>

        {/* Pool status */}
        <Box sx={{
          px: { xs: 1, sm: 1.5, md: 2 },
          py: { xs: 0.3, sm: 0.4, md: 0.5 },
          borderRadius: 10,
          bgcolor: pool.isPaused
            ? 'rgba(244, 67, 54, 0.7)' // Red for paused
            : pool.uniqueUsers >= 10
              ? 'rgba(158, 158, 158, 0.7)' // Gray for full
              : 'rgba(76, 175, 80, 0.7)', // Green for open
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.7rem' },
              textTransform: 'uppercase',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}
          >
            {pool.isPaused ? 'Paused' : pool.uniqueUsers >= 10 ? 'Full' : 'Open'}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `,
        opacity: 0.97,
        zIndex: -100
      }
    }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Casino Header */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.5, sm: 2 },
        background: 'linear-gradient(to right, #1b5e20, #2e7d32, #1b5e20)',
        borderRadius: { xs: '8px', sm: '10px' },
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Casino logo and title */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          mb: { xs: 2, sm: 0 }
        }}>
          <Box sx={{
            width: { xs: 40, sm: 50 },
            height: { xs: 40, sm: 50 },
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fdd835 0%, #f57f17 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
            mr: { xs: 1.5, sm: 2 },
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.7)' },
              '70%': { boxShadow: '0 0 0 10px rgba(255, 215, 0, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0)' }
            }
          }}>
            <CasinoIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: '#1b5e20' }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{
              fontWeight: 800,
              color: '#fdd835',
              textShadow: '0 0 10px rgba(0, 0, 0, 0.7)',
              letterSpacing: '1px',
              lineHeight: 1,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
            }}>
              UNIVERSAL BET
            </Typography>
            <Typography variant="subtitle2" sx={{
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: { xs: '1px', sm: '2px' },
              textTransform: 'uppercase',
              fontWeight: 300,
              fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' }
            }}>
              Blockchain Gaming Platform
            </Typography>
          </Box>
        </Box>

        {/* Balance chip */}
        <Box sx={{
          position: 'relative',
          zIndex: 5,
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Chip
            avatar={
              <Avatar sx={{
                bgcolor: '#fdd835 !important',
                color: '#1b5e20 !important',
                boxShadow: '0 0 10px rgba(255,215,0,0.5)',
                width: { xs: 24, sm: 32 },
                height: { xs: 24, sm: 32 }
              }}>
                <LocalAtmIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
              </Avatar>
            }
            label={`Balance: ${usdtBalance ? ethers.utils.formatUnits(usdtBalance, 18) : '0'} USDT`}
            sx={{
              bgcolor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(5px)',
              color: 'white',
              fontWeight: 700,
              py: { xs: 1.5, sm: 2.5 },
              border: '1px solid rgba(255,215,0,0.5)',
              boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
              width: { xs: '100%', sm: 'auto' },
              '& .MuiChip-label': {
                px: { xs: 1, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
              }
            }}
          />
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {poolsData.map((pool) => (
            <Box
              key={pool.poolType}
              sx={{
                width: { xs: '100%', md: 'calc(50% - 16px)' },
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Rummy Table */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 600,
                  mx: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.5s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                {/* Pool name at the top */}
                <Typography
                  variant="h6"
                  sx={{
                    color: '#fdd835', // Yellow color
                    fontWeight: 'bold',
                    textAlign: 'center',
                    mb: { xs: 0.5, sm: 1 },
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                  }}
                >
                  {pool.name}
                </Typography>

                {/* Status badges */}
                <Box sx={{
                  display: 'flex',
                  gap: { xs: 0.5, sm: 1 },
                  mb: { xs: 0.5, sm: 1 },
                  position: 'relative',
                  zIndex: 5,
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
                  {/* Status badge */}
                  <Box sx={{
                    bgcolor: !pool.isDeployed
                      ? 'rgba(158, 158, 158, 0.7)' // Gray for not deployed
                      : pool.isPaused
                        ? 'rgba(244, 67, 54, 0.7)' // Red for paused
                        : 'rgba(76, 175, 80, 0.7)', // Green for active
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                    px: { xs: 1, sm: 1.5 },
                    py: { xs: 0.3, sm: 0.5 },
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    mb: { xs: 0.5, sm: 0 }
                  }}>
                    <Box sx={{
                      width: { xs: 6, sm: 8 },
                      height: { xs: 6, sm: 8 },
                      borderRadius: '50%',
                      bgcolor: 'white',
                      boxShadow: '0 0 5px rgba(255,255,255,0.5)',
                      animation: !pool.isDeployed || pool.isPaused
                        ? 'none'
                        : 'blink 1.5s infinite',
                      '@keyframes blink': {
                        '0%': { opacity: 0.5 },
                        '50%': { opacity: 1 },
                        '100%': { opacity: 0.5 }
                      }
                    }} />
                    {!pool.isDeployed
                      ? 'COMING SOON'
                      : pool.isPaused
                        ? 'PAUSED'
                        : 'ACTIVE'}
                  </Box>

                  {/* Players count badge */}
                  <Box sx={{
                    bgcolor: 'rgba(33, 150, 243, 0.7)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                    px: { xs: 1, sm: 1.5 },
                    py: { xs: 0.3, sm: 0.5 },
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    {pool.uniqueUsers}/10 PLAYERS
                  </Box>
                </Box>

                {/* Game table */}
                <Paper
                  elevation={5}
                  sx={{
                    position: 'relative',
                    height: { xs: 280, sm: 320, md: 350 },
                    width: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    // Green felt background
                    bgcolor: '#1b5e20',
                    border: { xs: '3px solid', sm: '4px solid', md: '5px solid' },
                    borderColor: '#fdd835 !important',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: `
                      radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%),
                      url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")
                    `,
                    mx: 'auto', // Center the table on mobile
                    maxWidth: { xs: '280px', sm: '320px', md: '100%' } // Limit width on mobile
                  }}
                >
                  {/* Game area */}
                  <Box sx={{
                    position: 'relative',
                    width: '90%',
                    height: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'visible'
                  }}>
                    {/* Center game icon */}
                    <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: { xs: 60, sm: 70, md: 80 },
                      height: { xs: 60, sm: 70, md: 80 },
                      borderRadius: '50%',
                      bgcolor: pool.uniqueUsers >= 10
                        ? 'rgba(76, 175, 80, 0.2)'
                        : 'rgba(255, 215, 0, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: pool.uniqueUsers >= 10
                        ? { xs: '1px solid rgba(76, 175, 80, 0.3)', sm: '2px solid rgba(76, 175, 80, 0.3)' }
                        : { xs: '1px solid rgba(255, 215, 0, 0.3)', sm: '2px solid rgba(255, 215, 0, 0.3)' },
                      boxShadow: pool.uniqueUsers >= 10
                        ? '0 0 20px rgba(76, 175, 80, 0.2)'
                        : '0 0 20px rgba(255, 215, 0, 0.2)',
                      zIndex: 1,
                      animation: pool.uniqueUsers >= 10 ? 'pulse 1.5s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                      }
                    }}>
                      <Typography sx={{
                        color: pool.uniqueUsers >= 10 ? '#4caf50' : '#fdd835',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' },
                        textAlign: 'center'
                      }}>
                        {pool.uniqueUsers >= 10 ? 'Run Pool' : 'Join'}
                      </Typography>
                    </Box>

                    {/* Player seats positioned in a circle */}
                    {renderPlayerSeats(pool)}

                    {/* Center of the table */}
                    {renderTableCenter(pool)}

                  </Box>
                </Paper>

                {/* Participate or View Pool button */}
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 20,
                    display: 'inline-block',
                    mt: { xs: 1, sm: 1.5, md: 2 },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!(pool.isPaused || !pool.isDeployed)) {
                      handlePoolSelect(pool.poolType);
                    }
                  }}
                >
                  <Button
                    variant="contained"
                    disabled={pool.isPaused || !pool.isDeployed}
                    fullWidth={window.innerWidth < 600}
                    size={window.innerWidth < 600 ? "medium" : "large"}
                    sx={{
                      bgcolor: pool.uniqueUsers >= 10 ? '#4caf50' : '#fdd835',
                      color: pool.uniqueUsers >= 10 ? 'white' : 'black',
                      fontWeight: 'bold',
                      borderRadius: '50px',
                      px: { xs: 2, sm: 2.5, md: 3 },
                      py: { xs: 0.75, sm: 1 },
                      cursor: 'pointer !important',
                      pointerEvents: 'auto',
                      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                      '&:hover': {
                        bgcolor: pool.uniqueUsers >= 10 ? '#388e3c' : '#ffeb3b'
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.5)'
                      },
                      animation: pool.uniqueUsers >= 10 ? 'pulse 1.5s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                      }
                    }}
                  >
                    {!pool.isDeployed
                      ? 'Coming Soon'
                      : pool.isPaused
                        ? 'Pool Paused'
                        : pool.uniqueUsers >= 10
                          ? 'Run Pool Now'
                          : 'Participate Now'}
                  </Button>
                </Box>
              </Box>

              {/* Table status text */}
              <Box
                sx={{
                  mt: { xs: 2, sm: 2.5, md: 3 },
                  p: { xs: 1, sm: 1.5 },
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  maxWidth: '95%',
                  mx: 'auto',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Background glow effect */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '30%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    animation: 'shimmer 2s infinite',
                    '@keyframes shimmer': {
                      '0%': { transform: 'translateX(-100%)' },
                      '100%': { transform: 'translateX(400%)' }
                    },
                    zIndex: 0
                  }}
                />

                <Typography
                  variant="body2"
                  align="center"
                  sx={{
                    color: 'white',
                    fontWeight: 500,
                    position: 'relative',
                    zIndex: 1,
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                    px: { xs: 0.5, sm: 1 }
                  }}
                >
                  {!pool.isDeployed
                    ? `The ${pool.name} table is not yet available.`
                    : pool.isPaused
                      ? `The ${pool.name} table is currently closed.`
                      : pool.uniqueUsers >= 10
                        ? `This ${pool.name} table is full with 10 participants. Click "Run Pool Now" to execute the pool!`
                        : `Join the ${pool.name} table for a chance to win rewards! (${pool.uniqueUsers}/10 participants)`}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PoolsTableView;
