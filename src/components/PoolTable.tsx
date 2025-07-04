import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import {
  getPoolCounter,
  getPoolUniqueUsers,
  getEntryFee,
  isRafflePaused,
  participateInPool,
  getUSDTBalance,
  approveUSDT,
  getUSDTAllowance,
  getPoolStrength,
  getPoolContractAddress,
  runPool,
  getPoolWinnersArr,
  getPoolLosersArr
} from '../services/contractService';
import CasinoIcon from '@mui/icons-material/Casino';
import GroupIcon from '@mui/icons-material/Group';
import PaidIcon from '@mui/icons-material/Paid';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link } from '@mui/material';
import { POOL_CONTRACTS } from '../config';

interface PoolTableProps {
  poolType: string;
}

const PoolTable: React.FC<PoolTableProps> = ({ poolType }) => {
  const { account, isConnected, isRegistered } = useWallet();

  // Pool state
  const [poolCounter, setPoolCounter] = useState<number>(0);
  const [uniqueUsers, setUniqueUsers] = useState<number>(0);
  const [entryFee, setEntryFee] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [poolStrength, setPoolStrength] = useState<number>(0);

  // User state
  const [usdtBalance, setUsdtBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  // Allowance is used for checking if user has approved enough USDT (used in handleParticipate)
  const [, setAllowance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const [participating, setParticipating] = useState<boolean>(false);
  const [runningPool, setRunningPool] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  // Previous pool results
  const [previousPoolWinners, setPreviousPoolWinners] = useState<string[]>([]);
  const [previousPoolLosers, setPreviousPoolLosers] = useState<string[]>([]);

  // Get pool name and info
  const poolInfo = POOL_CONTRACTS[poolType as keyof typeof POOL_CONTRACTS];
  const poolName = poolInfo?.name || poolType;

  // Fetch pool data
  const fetchPoolData = async () => {
    if (!isConnected || !account) return;

    try {
      setLoading(true);
      setError(null);

      // Check if pool contract is deployed
      const poolAddress = poolInfo?.address;
      if (!poolAddress) {
        console.log(`Pool contract for ${poolType} not yet deployed`);
        setError(`The ${poolName} contract is not yet deployed. Please check back later.`);
        setIsPaused(true);
        return;
      }

      try {
        // Get pool data
        const counter = await getPoolCounter(poolType);
        const counterNum = Number(counter);
        setPoolCounter(counterNum);

        try {
          const users = await getPoolUniqueUsers(counterNum, poolType);
          setUniqueUsers(Number(users));
        } catch (error) {
          console.error(`Error fetching unique users for ${poolName}:`, error);
          setUniqueUsers(0);
        }

        try {
          const fee = await getEntryFee(poolType);
          setEntryFee(fee);
        } catch (error) {
          console.error(`Error fetching entry fee for ${poolName}:`, error);
          setEntryFee(ethers.BigNumber.from(0));
        }

        try {
          const paused = await isRafflePaused(poolType);
          setIsPaused(paused);
        } catch (error) {
          console.error(`Error checking if ${poolName} is paused:`, error);
          setIsPaused(true); // Assume paused if there's an error
        }

        try {
          const strength = await getPoolStrength(counterNum, poolType);
          setPoolStrength(Number(strength));
        } catch (error) {
          console.error(`Error fetching pool strength for ${poolName}:`, error);
          setPoolStrength(0);
        }

        // Get winners and losers from the previous pool (if any)
        if (counterNum > 0) {
          // There is a previous pool (current pool counter - 1)
          const previousPoolId = counterNum - 1;

          try {
            const winners = await getPoolWinnersArr(previousPoolId, poolType);
            setPreviousPoolWinners(winners);
            console.log(`Previous pool (${previousPoolId}) winners for ${poolName}:`, winners);
          } catch (error) {
            console.error(`Error fetching winners for previous pool ${previousPoolId} of ${poolName}:`, error);
            setPreviousPoolWinners([]);
          }

          try {
            const losers = await getPoolLosersArr(previousPoolId, poolType);
            setPreviousPoolLosers(losers);
            console.log(`Previous pool (${previousPoolId}) losers for ${poolName}:`, losers);
          } catch (error) {
            console.error(`Error fetching losers for previous pool ${previousPoolId} of ${poolName}:`, error);
            setPreviousPoolLosers([]);
          }
        } else {
          // No previous pool
          setPreviousPoolWinners([]);
          setPreviousPoolLosers([]);
        }
      } catch (error) {
        console.error(`Error fetching pool counter for ${poolName}:`, error);
        setPoolCounter(0);
      }

      // Get user data
      try {
        const balance = await getUSDTBalance(account);
        setUsdtBalance(balance);
      } catch (error) {
        console.error('Error fetching USDT balance:', error);
        setUsdtBalance(ethers.BigNumber.from(0));
      }

      try {
        const poolAddress = getPoolContractAddress(poolType);
        const allow = await getUSDTAllowance(account, poolAddress);
        setAllowance(allow);
      } catch (error) {
        console.error(`Error fetching USDT allowance for ${poolName}:`, error);
        setAllowance(ethers.BigNumber.from(0));
      }

    } catch (err: any) {
      console.error(`Error fetching pool data for ${poolName}:`, err);
      setError(`Failed to load ${poolName} data. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Approve USDT spending
  const handleApproveUSDT = async () => {
    if (!isConnected || !account) {
      return;
    }

    // Check if pool contract is deployed
    const poolAddress = poolInfo?.address;
    if (!poolAddress) {
      console.log(`Pool contract for ${poolType} not yet deployed`);
      setError(`The ${poolName} contract is not yet deployed. Please check back later.`);
      return;
    }

    try {
      setApproving(true);
      setError(null);

      // Approve a large amount to avoid multiple approvals
      const approvalAmount = ethers.utils.parseUnits('100000', 18); // 1000 USDT
      console.log(`Approving ${ethers.utils.formatUnits(approvalAmount, 18)} USDT for ${poolAddress}...`);

      await approveUSDT(poolAddress, approvalAmount);

      // Update allowance after approval
      const newAllowance = await getUSDTAllowance(account, poolAddress);
      setAllowance(newAllowance);

      setSuccess(`USDT approved successfully! You can now participate in the ${poolName}.`);
      console.log('USDT approval successful');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err: any) {
      console.error(`Error approving USDT for ${poolName}:`, err);
      let errorMessage = `Failed to approve USDT for ${poolName}. Please try again.`;

      // Extract more specific error message if available
      if (err.message) {
        if (err.message.includes('user rejected transaction')) {
          errorMessage = 'Transaction was rejected. Please try again.';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient ETH for gas fees. Please add more ETH to your wallet.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setApproving(false);
    }
  };

  // Participate in pool
  const handleParticipate = async () => {
    if (!isConnected || !account) {
      return;
    }

    if (!isRegistered) {
      console.log('User not registered, cannot participate');
      setError('You need to register before participating in pools.');
      return;
    }

    // Check if pool contract is deployed
    const poolAddress = poolInfo?.address;
    if (!poolAddress) {
      console.log(`Pool contract for ${poolType} not yet deployed`);
      setError(`The ${poolName} contract is not yet deployed. Please check back later.`);
      return;
    }

    try {
      // Check if user has enough USDT
      const balance = await getUSDTBalance(account);
      setUsdtBalance(balance);

      if (balance.lt(entryFee)) {
        setError(`Insufficient USDT balance. You have ${ethers.utils.formatUnits(balance, 18)} USDT but need ${ethers.utils.formatUnits(entryFee, 18)} USDT.`);
        return;
      }

      // Check if user has approved enough USDT
      const currentAllowance = await getUSDTAllowance(account, poolAddress);
      setAllowance(currentAllowance);

      if (currentAllowance.lt(entryFee)) {
        console.log('Insufficient allowance, opening approval dialog');
        setOpenDialog(true);
        return;
      }

      setParticipating(true);
      setError(null);

      console.log(`Attempting to participate in ${poolName}...`);
      await participateInPool(poolType);

      setSuccess(`Successfully participated in the ${poolName}!`);
      console.log('Participation successful, refreshing pool data');

      // Refresh pool data
      await fetchPoolData();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err: any) {
      console.error(`Error participating in ${poolName}:`, err);
      let errorMessage = `Failed to participate in ${poolName}. Please try again.`;

      // Extract more specific error message if available
      if (err.message) {
        if (err.message.includes('User not registered')) {
          errorMessage = 'You are not registered. Please register first.';
        } else if (err.message.includes('User Already Exists')) {
          errorMessage = 'You have already participated in this pool.';
        } else if (err.message.includes('Enough Users Already')) {
          errorMessage = 'This pool is already full. Please wait for the next pool.';
        } else if (err.message.includes('Raffle is paused')) {
          errorMessage = 'The raffle is currently paused by the admin.';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient USDT balance. Please add more USDT to your wallet.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setParticipating(false);
    }
  };

  // Handle running the pool
  const handleRunPool = async () => {
    if (!isConnected || !account) {
      return;
    }

    // Check if pool contract is deployed
    const poolAddress = poolInfo?.address;
    if (!poolAddress) {
      console.log(`Pool contract for ${poolType} not yet deployed`);
      setError(`The ${poolName} contract is not yet deployed. Please check back later.`);
      return;
    }

    // Check if pool is full (10 participants)
    if (uniqueUsers < 10) {
      setError(`Cannot run the pool until it has 10 participants. Current participants: ${uniqueUsers}`);
      return;
    }

    try {
      setRunningPool(true);
      setError(null);

      console.log(`Attempting to run the ${poolName} pool...`);
      await runPool(poolType);

      setSuccess(`Successfully ran the ${poolName} pool! Winners and losers have been determined.`);
      console.log('Pool run successful, refreshing pool data');

      // Refresh pool data
      await fetchPoolData();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);

    } catch (err: any) {
      console.error(`Error running ${poolName} pool:`, err);
      let errorMessage = `Failed to run the ${poolName} pool. Please try again.`;

      // Extract more specific error message if available
      if (err.message) {
        if (err.message.includes('Not much User')) {
          errorMessage = 'Not enough users in the pool. Need 10 participants.';
        } else if (err.message.includes('Raffle is paused')) {
          errorMessage = 'The raffle is currently paused by the admin.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setRunningPool(false);
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Helper function to format address for display
  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Helper function to get BscScan URL for an address
  const getBscScanUrl = (address: string): string => {
    return `https://bscscan.com/address/${address}`;
  };

  // Fetch data on component mount and when connection status changes
  useEffect(() => {
    if (isConnected && account) {
      fetchPoolData();
    }
  }, [isConnected, account, isRegistered, poolType]);

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)'
        },
        mb: 4,
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Box sx={{
        p: 3,
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        borderBottom: '2px solid rgba(255, 215, 0, 0.3)'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', color: '#fdd835' }}>
          <CasinoIcon sx={{ mr: 1, color: '#fdd835' }} />
          {!poolInfo?.address
            ? `${poolName} Coming Soon`
            : `${poolName} - Pool #${poolCounter}`}
        </Typography>
        <Chip
          label={isPaused ? 'Paused' : 'Active'}
          color={isPaused ? "error" : "success"}
          sx={{
            bgcolor: isPaused ? 'rgba(244, 67, 54, 0.7)' : 'rgba(76, 175, 80, 0.7)',
            color: 'white',
            fontWeight: 600,
            '& .MuiChip-label': { px: 2 }
          }}
          icon={isPaused ? <ErrorIcon /> : <CheckCircleIcon />}
        />
      </Box>

      <CardContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Stack spacing={4}>
          {/* Pool Progress */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                Pool Progress
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#fdd835', fontWeight: 600 }}>
                {uniqueUsers}/10 Users
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(uniqueUsers / 10) * 100}
              sx={{
                height: 12,
                borderRadius: 6,
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #fdd835, #f57f17)'
                }
              }}
            />
          </Box>

          {/* Pool Stats */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{
              flex: 1,
              textAlign: 'center',
              p: 2,
              bgcolor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <Avatar sx={{
                bgcolor: 'rgba(255, 215, 0, 0.2)',
                mx: 'auto',
                mb: 1,
                border: '2px solid rgba(255, 215, 0, 0.3)',
                color: '#fdd835'
              }}>
                <GroupIcon />
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                {uniqueUsers}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Unique Users
              </Typography>
            </Box>

            <Box sx={{
              flex: 1,
              textAlign: 'center',
              p: 2,
              bgcolor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <Avatar sx={{
                bgcolor: 'rgba(255, 215, 0, 0.2)',
                mx: 'auto',
                mb: 1,
                border: '2px solid rgba(255, 215, 0, 0.3)',
                color: '#fdd835'
              }}>
                <PaidIcon />
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                {entryFee ? ethers.utils.formatUnits(entryFee, 18) : '0'} USDT
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Entry Fee
              </Typography>
            </Box>

            <Box sx={{
              flex: 1,
              textAlign: 'center',
              p: 2,
              bgcolor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <Avatar sx={{
                bgcolor: 'rgba(255, 215, 0, 0.2)',
                mx: 'auto',
                mb: 1,
                border: '2px solid rgba(255, 215, 0, 0.3)',
                color: '#fdd835'
              }}>
                <HourglassEmptyIcon />
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                {poolStrength}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Entries
              </Typography>
            </Box>

            <Box sx={{
              flex: 1,
              textAlign: 'center',
              p: 2,
              bgcolor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <Avatar sx={{
                bgcolor: 'rgba(255, 215, 0, 0.2)',
                mx: 'auto',
                mb: 1,
                border: '2px solid rgba(255, 215, 0, 0.3)',
                color: '#fdd835'
              }}>
                <AccountBalanceWalletIcon />
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                {usdtBalance ? ethers.utils.formatUnits(usdtBalance, 18) : '0'} USDT
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Your Balance
              </Typography>
            </Box>
          </Stack>

          {/* Previous Pool Results - Gaming Style */}
          {poolCounter > 0 && (previousPoolWinners.length > 0 || previousPoolLosers.length > 0) && (
            <Box sx={{
              mt: 4,
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                opacity: 0.1,
                zIndex: 0
              }
            }}>
              {/* Header with glowing effect */}
              <Box sx={{
                position: 'relative',
                p: 2,
                background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
                borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                {/* Animated background light */}
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
                  animation: 'pulse 3s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 0.3 },
                    '50%': { opacity: 0.7 },
                    '100%': { opacity: 0.3 }
                  }
                }} />

                <CasinoIcon sx={{
                  color: '#fdd835',
                  mr: 1.5,
                  fontSize: '2rem',
                  animation: 'spin 10s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />

                <Typography variant="h5" sx={{
                  color: '#fdd835',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  textShadow: '0 0 10px rgba(255, 215, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.5)',
                  position: 'relative',
                  zIndex: 2
                }}>
                  Pool #{poolCounter - 1} Results
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                position: 'relative',
                zIndex: 1
              }}>
                {/* Winners Section */}
                {previousPoolWinners.length > 0 && (
                  <Box sx={{
                    flex: 1,
                    p: 3,
                    position: 'relative',
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                    borderRight: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.1)' },
                    borderBottom: { xs: '1px solid rgba(255, 255, 255, 0.1)', sm: 'none' },
                    overflow: 'hidden'
                  }}>
                    {/* Animated background */}
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'radial-gradient(circle at 30% 30%, rgba(76, 175, 80, 0.1) 0%, transparent 70%)',
                      zIndex: 0
                    }} />

                    {/* Winners Header */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      position: 'relative',
                      zIndex: 1
                    }}>
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #fdd835 0%, #f57f17 100%)',
                        boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                        mr: 2,
                        animation: 'winner-pulse 2s infinite',
                        '@keyframes winner-pulse': {
                          '0%': { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.7)' },
                          '70%': { boxShadow: '0 0 0 10px rgba(255, 215, 0, 0)' },
                          '100%': { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0)' }
                        }
                      }}>
                        <EmojiEventsIcon sx={{
                          color: '#1b5e20',
                          fontSize: '2rem',
                          filter: 'drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))'
                        }} />
                      </Box>

                      <Box>
                        <Typography variant="h6" sx={{
                          color: '#fdd835',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                          lineHeight: 1.2
                        }}>
                          Winners
                        </Typography>
                        <Typography variant="caption" sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          display: 'block'
                        }}>
                          {previousPoolWinners.length} lucky players
                        </Typography>
                      </Box>
                    </Box>

                    {/* Winners List */}
                    <Box sx={{
                      maxHeight: '250px',
                      overflowY: 'auto',
                      pr: 1,
                      position: 'relative',
                      zIndex: 1,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'linear-gradient(to bottom, #fdd835, #f57f17)',
                        borderRadius: '3px',
                        border: '1px solid rgba(0, 0, 0, 0.2)'
                      },
                    }}>
                      {previousPoolWinners.map((winner, index) => (
                        <Box
                          key={`winner-${index}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            borderRadius: 2,
                            mb: 1,
                            background: 'linear-gradient(90deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                            border: '1px solid rgba(76, 175, 80, 0.2)',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                              background: 'linear-gradient(90deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.1) 100%)',
                              borderColor: 'rgba(76, 175, 80, 0.3)'
                            },
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Winner badge for top 3 */}
                          {index < 3 && (
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: 0,
                              height: 0,
                              borderStyle: 'solid',
                              borderWidth: '20px 20px 0 0',
                              borderColor: index === 0 ? '#ffd700 transparent transparent transparent' :
                                          index === 1 ? '#c0c0c0 transparent transparent transparent' :
                                          '#cd7f32 transparent transparent transparent',
                              zIndex: 1
                            }} />
                          )}

                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'rgba(76, 175, 80, 0.2)',
                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                color: '#4caf50',
                                mr: 1.5,
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {index + 1}
                            </Avatar>
                            <Typography variant="body2" sx={{
                              color: 'white',
                              fontWeight: 500,
                              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                            }}>
                              {formatAddress(winner)}
                            </Typography>
                          </Box>

                          <Link
                            href={getBscScanUrl(winner)}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              p: 0.5,
                              borderRadius: '50%',
                              bgcolor: 'rgba(0, 0, 0, 0.2)',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                color: '#fdd835',
                                bgcolor: 'rgba(0, 0, 0, 0.4)',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </Link>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Losers Section */}
                {previousPoolLosers.length > 0 && (
                  <Box sx={{
                    flex: 1,
                    p: 3,
                    position: 'relative',
                    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
                    overflow: 'hidden'
                  }}>
                    {/* Animated background */}
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'radial-gradient(circle at 70% 30%, rgba(244, 67, 54, 0.1) 0%, transparent 70%)',
                      zIndex: 0
                    }} />

                    {/* Losers Header */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      position: 'relative',
                      zIndex: 1
                    }}>
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        boxShadow: '0 0 20px rgba(244, 67, 54, 0.5)',
                        mr: 2,
                        animation: 'loser-pulse 2s infinite',
                        '@keyframes loser-pulse': {
                          '0%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)' },
                          '70%': { boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)' },
                          '100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' }
                        }
                      }}>
                        <SentimentVeryDissatisfiedIcon sx={{
                          color: 'white',
                          fontSize: '2rem',
                          filter: 'drop-shadow(0 0 5px rgba(244, 67, 54, 0.5))'
                        }} />
                      </Box>

                      <Box>
                        <Typography variant="h6" sx={{
                          color: '#f44336',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          textShadow: '0 0 10px rgba(244, 67, 54, 0.5)',
                          lineHeight: 1.2
                        }}>
                          Losers
                        </Typography>
                        <Typography variant="caption" sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          display: 'block'
                        }}>
                          Better luck next time
                        </Typography>
                      </Box>
                    </Box>

                    {/* Losers List */}
                    <Box sx={{
                      maxHeight: '250px',
                      overflowY: 'auto',
                      pr: 1,
                      position: 'relative',
                      zIndex: 1,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'linear-gradient(to bottom, #f44336, #d32f2f)',
                        borderRadius: '3px',
                        border: '1px solid rgba(0, 0, 0, 0.2)'
                      },
                    }}>
                      {previousPoolLosers.map((loser, index) => (
                        <Box
                          key={`loser-${index}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            borderRadius: 2,
                            mb: 1,
                            background: 'linear-gradient(90deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
                            border: '1px solid rgba(244, 67, 54, 0.2)',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                              background: 'linear-gradient(90deg, rgba(244, 67, 54, 0.15) 0%, rgba(244, 67, 54, 0.1) 100%)',
                              borderColor: 'rgba(244, 67, 54, 0.3)'
                            },
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'rgba(244, 67, 54, 0.2)',
                                border: '1px solid rgba(244, 67, 54, 0.3)',
                                color: '#f44336',
                                mr: 1.5,
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {index + 1}
                            </Avatar>
                            <Typography variant="body2" sx={{
                              color: 'white',
                              fontWeight: 500,
                              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                            }}>
                              {formatAddress(loser)}
                            </Typography>
                          </Box>

                          <Link
                            href={getBscScanUrl(loser)}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              p: 0.5,
                              borderRadius: '50%',
                              bgcolor: 'rgba(0, 0, 0, 0.2)',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                color: '#f44336',
                                bgcolor: 'rgba(0, 0, 0, 0.4)',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </Link>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Participation and Run Pool Buttons */}
          <Box>
            <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: 'center'
            }}>
              {/* Participate Button - Show only when pool is not full */}
              {uniqueUsers < 10 && (
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 20,
                    display: 'inline-block',
                    width: { xs: '100%', sm: 'auto' }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!(isPaused || participating || loading || !poolInfo?.address)) {
                      handleParticipate();
                    }
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    disabled={
                      isPaused ||
                      participating ||
                      loading ||
                      !poolInfo?.address
                    }
                    startIcon={participating ? <CircularProgress size={24} color="inherit" /> : <CasinoIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      bgcolor: '#fdd835',
                      color: '#000',
                      fontWeight: 'bold',
                      borderRadius: 50,
                      width: '100%',
                      cursor: 'pointer !important',
                      pointerEvents: 'auto',
                      '&:hover': {
                        bgcolor: '#ffeb3b'
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.5)'
                      }
                    }}
                  >
                    {participating ? 'Participating...' : `Participate in ${poolName}`}
                  </Button>
                </Box>
              )}

              {/* Run Pool Button - Show only when pool is full */}
              {uniqueUsers >= 10 && (
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 20,
                    display: 'inline-block',
                    width: { xs: '100%', sm: 'auto' }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!(isPaused || runningPool || loading || uniqueUsers < 10 || !poolInfo?.address)) {
                      handleRunPool();
                    }
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    disabled={
                      isPaused ||
                      runningPool ||
                      loading ||
                      uniqueUsers < 10 ||
                      !poolInfo?.address
                    }
                    startIcon={runningPool ? <CircularProgress size={24} color="inherit" /> : <CasinoIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      bgcolor: '#4caf50',
                      color: 'white',
                      fontWeight: 'bold',
                      borderRadius: 50,
                      width: '100%',
                      cursor: 'pointer !important',
                      pointerEvents: 'auto',
                      '&:hover': {
                        bgcolor: '#388e3c'
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.5)'
                      },
                      animation: uniqueUsers >= 10 ? 'pulse 1.5s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                      }
                    }}
                  >
                    {runningPool ? 'Running Pool...' : 'Run Pool Now'}
                  </Button>
                </Box>
              )}
            </Box>
            <Typography variant="body2" align="center" sx={{ mt: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
              {!poolInfo?.address
                ? `The ${poolName} contract is not yet deployed. Please check back later.` :
                isPaused
                  ? `The ${poolName} is currently paused.` :
                  uniqueUsers >= 10
                    ? `This ${poolName} is full with 10 participants. You can now run the pool to determine winners and losers!` :
                    `Participate in the current ${poolName} for a chance to win rewards! (${uniqueUsers}/10 participants)`}
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      {/* Approval Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="approval-dialog-title"
        aria-describedby="approval-dialog-description"
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#1b5e20',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px'
            }
          }
        }}
      >
        <DialogTitle id="approval-dialog-title" sx={{ color: '#fdd835', fontWeight: 600 }}>
          USDT Approval Required
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="approval-dialog-description" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            You need to approve the {poolName} contract to spend your USDT before you can participate. Would you like to approve now?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                borderColor: 'white'
              }
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleCloseDialog();
              handleApproveUSDT();
            }}
            autoFocus
            disabled={approving}
            startIcon={approving ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: '#fdd835',
              color: '#000',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#ffeb3b'
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }}
            variant="contained"
          >
            {approving ? 'Approving...' : 'Approve USDT'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default PoolTable;
