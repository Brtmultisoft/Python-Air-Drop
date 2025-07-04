import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
  getPoolStrength
} from '../services/contractService';
import { RAFFLE_CONTRACT_ADDRESS } from '../config';
import CasinoIcon from '@mui/icons-material/Casino';
import GroupIcon from '@mui/icons-material/Group';
import PaidIcon from '@mui/icons-material/Paid';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const Pool: React.FC = () => {
  const { account, isConnected, isRegistered, connectWallet } = useWallet();
  const navigate = useNavigate();
  const theme = useTheme();
  // Media query for responsive design
  useMediaQuery(theme.breakpoints.down('md'));

  // Pool state
  const [poolCounter, setPoolCounter] = useState<number>(0);
  const [uniqueUsers, setUniqueUsers] = useState<number>(0);
  const [entryFee, setEntryFee] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [poolStrength, setPoolStrength] = useState<number>(0);

  // User state
  const [usdtBalance, setUsdtBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  // Allowance is set but not directly used in the UI
  const [, setAllowance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const [participating, setParticipating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  // Fetch pool data
  const fetchPoolData = async () => {
    if (!isConnected || !account) return;

    try {
      setLoading(true);
      setError(null);

      // Check if Raffle contract is deployed
      if (!RAFFLE_CONTRACT_ADDRESS ) {
        console.log('Raffle contract not yet deployed');
        setError('The Raffle contract is not yet deployed. Please check back later.');
        setIsPaused(true);
        return;
      }

      try {
        // Get pool data
        const counter = await getPoolCounter();
        setPoolCounter(Number(counter));

        try {
          const users = await getPoolUniqueUsers(Number(counter));
          setUniqueUsers(Number(users));
        } catch (error) {
          console.error('Error fetching unique users:', error);
          setUniqueUsers(0);
        }

        try {
          const fee = await getEntryFee();
          setEntryFee(fee);
        } catch (error) {
          console.error('Error fetching entry fee:', error);
          setEntryFee(ethers.BigNumber.from(0));
        }

        try {
          const paused = await isRafflePaused();
          setIsPaused(paused);
        } catch (error) {
          console.error('Error checking if raffle is paused:', error);
          setIsPaused(true); // Assume paused if there's an error
        }

        try {
          const strength = await getPoolStrength(Number(counter));
          setPoolStrength(Number(strength));
        } catch (error) {
          console.error('Error fetching pool strength:', error);
          setPoolStrength(0);
        }
      } catch (error) {
        console.error('Error fetching pool counter:', error);
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
        const allow = await getUSDTAllowance(account, RAFFLE_CONTRACT_ADDRESS);
        setAllowance(allow);
      } catch (error) {
        console.error('Error fetching USDT allowance:', error);
        setAllowance(ethers.BigNumber.from(0));
      }

    } catch (err: any) {
      console.error('Error fetching pool data:', err);
      setError('Failed to load pool data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Approve USDT spending
  const handleApproveUSDT = async () => {
    if (!isConnected || !account) {
      await connectWallet();
      return;
    }

    // Check if Raffle contract is deployed
    if (!RAFFLE_CONTRACT_ADDRESS ) {
      console.log('Raffle contract not yet deployed');
      setError('The Raffle contract is not yet deployed. Please check back later.');
      return;
    }

    try {
      setApproving(true);
      setError(null);

      // Approve a large amount to avoid multiple approvals
      const approvalAmount = ethers.utils.parseUnits('100000', 18); // 1000 USDT
      console.log(`Approving ${ethers.utils.formatUnits(approvalAmount, 18)} USDT for ${RAFFLE_CONTRACT_ADDRESS}...`);

      await approveUSDT(RAFFLE_CONTRACT_ADDRESS, approvalAmount);
      
      // Update allowance after approval
      const newAllowance = await getUSDTAllowance(account, RAFFLE_CONTRACT_ADDRESS);
      setAllowance(newAllowance);

      setSuccess('USDT approved successfully! You can now participate in the pool.');
      console.log('USDT approval successful');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err: any) {
      console.error('Error approving USDT:', err);
      let errorMessage = 'Failed to approve USDT. Please try again.';

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
      await connectWallet();
      return;
    }

    if (!isRegistered) {
      console.log('User not registered, redirecting to register page');
      navigate('/register');
      return;
    }

    // Check if Raffle contract is deployed
    if (!RAFFLE_CONTRACT_ADDRESS ) {
      console.log('Raffle contract not yet deployed');
      setError('The Raffle contract is not yet deployed. Please check back later.');
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
      const currentAllowance = await getUSDTAllowance(account, RAFFLE_CONTRACT_ADDRESS);
      setAllowance(currentAllowance);

      if (currentAllowance.lt(entryFee)) {
        console.log('Insufficient allowance, opening approval dialog');
        setOpenDialog(true);
        return;
      }

      setParticipating(true);
      setError(null);

      console.log('Attempting to participate in pool...');
      await participateInPool();

      setSuccess('Successfully participated in the pool!');
      console.log('Participation successful, refreshing pool data');

      // Refresh pool data
      await fetchPoolData();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err: any) {
      console.error('Error participating in pool:', err);
      let errorMessage = 'Failed to participate in pool. Please try again.';

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

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Fetch data on component mount and when connection status changes
  useEffect(() => {
    if (isConnected && account) {
      fetchPoolData();
    }
  }, [isConnected, account, isRegistered]);

  // Redirect to register page if not registered
  useEffect(() => {
    if (isConnected && !isRegistered) {
      console.log('User not registered, redirecting to register page');
      navigate('/register');
    } else if (isConnected && isRegistered) {
      console.log('User is registered, fetching pool data');
      fetchPoolData();
    }
  }, [isConnected, isRegistered, navigate]);

  if (!isConnected) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Raffle Pool
          </Typography>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(98, 0, 234, 0.03) 0%, rgba(0, 188, 212, 0.03) 100%)',
              border: '1px solid rgba(98, 0, 234, 0.1)',
            }}
          >
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(98, 0, 234, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please connect your wallet to view and participate in the raffle pool.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={connectWallet}
                size="large"
                startIcon={<AccountBalanceWalletIcon />}
              >
                Connect Wallet
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: { xs: 4, md: 6 } }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(90deg, #6200ea, #00bcd4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4
          }}
        >
          Raffle Pool
        </Typography>

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

        {/* Pool Status Card */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)'
            },
            mb: 4
          }}
        >
          <Box sx={{
            p: 3,
            background: 'linear-gradient(135deg, #6200ea 0%, #3f51b5 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <CasinoIcon sx={{ mr: 1 }} />
              {!RAFFLE_CONTRACT_ADDRESS 
                ? 'Raffle Coming Soon'
                : `Current Pool #${poolCounter}`}
            </Typography>
            <Chip
              label={isPaused ? 'Paused' : 'Active'}
              color={isPaused ? "error" : "success"}
              sx={{
                bgcolor: isPaused ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                color: 'white',
                fontWeight: 500,
                '& .MuiChip-label': { px: 2 }
              }}
              icon={isPaused ? <ErrorIcon /> : <CheckCircleIcon />}
            />
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Stack spacing={4}>
              {/* Pool Progress */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pool Progress
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {uniqueUsers}/10 Users
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(uniqueUsers / 10) * 100}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'rgba(0, 0, 0, 0.05)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      background: 'linear-gradient(90deg, #6200ea, #00bcd4)'
                    }
                  }}
                />
              </Box>

              {/* Pool Stats */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, mx: 'auto', mb: 1 }}>
                    <GroupIcon />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {uniqueUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unique Users
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main, mx: 'auto', mb: 1 }}>
                    <PaidIcon />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {entryFee ? ethers.utils.formatUnits(entryFee, 18) : '0'} USDT
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Entry Fee
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.error.main, mx: 'auto', mb: 1 }}>
                    <HourglassEmptyIcon />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {poolStrength}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Entries
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.success.main, mx: 'auto', mb: 1 }}>
                    <AccountBalanceWalletIcon />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {usdtBalance ? ethers.utils.formatUnits(usdtBalance, 18) : '0'} USDT
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your Balance
                  </Typography>
                </Box>
              </Stack>

              {/* Participation Button */}
              <Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleParticipate}
                    disabled={
                      isPaused ||
                      participating ||
                      loading ||
                      uniqueUsers >= 10 ||
                      !RAFFLE_CONTRACT_ADDRESS 
                    }
                    startIcon={participating ? <CircularProgress size={24} color="inherit" /> : <CasinoIcon />}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    {participating ? 'Participating...' : 'Participate in Pool'}
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                  {!RAFFLE_CONTRACT_ADDRESS 
                    ? 'The Raffle contract is not yet deployed. Please check back later.' :
                    isPaused
                      ? 'The raffle is currently paused.' :
                      uniqueUsers >= 10
                        ? 'This pool is full. Please wait for the next pool.' :
                        'Participate in the current pool for a chance to win rewards!'}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* How It Works Card */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Box sx={{
            p: 3,
            background: 'linear-gradient(135deg, #00bcd4 0%, #3f51b5 100%)',
            color: 'white'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              How It Works
            </Typography>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ p: 2, flex: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                  1. Participate
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pay the entry fee of {entryFee ? ethers.utils.formatUnits(entryFee, 18) : '0'} USDT to join the current pool. Each pool requires 10 unique participants.
                </Typography>
              </Box>

              <Box sx={{ p: 2, flex: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                  2. Random Selection
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  When the pool is full, 3 participants are randomly selected as "losers". The remaining participants get their entry fee refunded.
                </Typography>
              </Box>

              <Box sx={{ p: 2, flex: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                  3. Rewards
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Referrers of participants receive rewards based on their level in the referral chain. The more people you refer, the more rewards you can earn!
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Approval Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="approval-dialog-title"
        aria-describedby="approval-dialog-description"
      >
        <DialogTitle id="approval-dialog-title">
          USDT Approval Required
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="approval-dialog-description">
            You need to approve the raffle contract to spend your USDT before you can participate. Would you like to approve now?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleCloseDialog();
              handleApproveUSDT();
            }}
            color="primary"
            variant="contained"
            autoFocus
            disabled={approving}
            startIcon={approving ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {approving ? 'Approving...' : 'Approve USDT'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Pool;
