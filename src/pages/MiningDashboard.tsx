import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Grid,
  Fade,
  Zoom,
} from '@mui/material';
import {
  AccountBalanceWallet,
  People,
  MonetizationOn,
  Refresh,
  CheckCircle,
  PlayArrow,
  Pause,
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material';
import { ConnectButton } from "thirdweb/react";
import { client, bscTestnet, MINING_CONTRACT_ADDRESS } from '../client';
import { createWallet } from "thirdweb/wallets";
import { useMining } from '../context/MiningContext';
import SetupInstructions from '../components/SetupInstructions';
import { useNavigate, useLocation } from 'react-router-dom';

const MiningDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const {
    address,
    isConnected,
    isRegistered,
    isLoading,
    userRecord,
    dailyReward,
    regReward,
    directReferralCount,
    totalRegistered,
    canClaim,
    timeUntilNextClaim,
    register,
    claimDailyReward,
    refreshData,
    isCorrectNetwork,
    switchToCorrectNetwork,
  } = useMining();

  const [refreshing, setRefreshing] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [miningAnimation, setMiningAnimation] = useState(false);

  // Define wallets for ThirdWeb
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("com.trustwallet.app"),
    createWallet("walletConnect"),
    createWallet("io.rabby"),
    createWallet("io.zerion.wallet"),
  ];

  // Format BigInt to readable string
  const formatAmount = (amount: bigint, decimals: number = 18): string => {
    const divisor = BigInt(10 ** decimals);
    const quotient = amount / divisor;
    const remainder = amount % divisor;

    if (remainder === 0n) {
      return quotient.toString();
    }

    const remainderStr = remainder.toString().padStart(decimals, '0');
    const trimmedRemainder = remainderStr.replace(/0+$/, '');

    if (trimmedRemainder === '') {
      return quotient.toString();
    }

    return `${quotient}.${trimmedRemainder}`;
  };

  // Format time countdown
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Calculate user mining rank based on total mined
  const getUserMiningRank = () => {
    if (!userRecord || userRecord.totalMinted === 0n) {
      return { rank: 'New Miner', icon: '⛏️', progress: 0, next: 'Start Mining', hasMined: false };
    }

    const totalMined = Number(formatAmount(userRecord.totalMinted));

    if (totalMined >= 1000) return { rank: 'Diamond Miner', icon: '💎', progress: 100, next: 'Max Level', hasMined: true };
    if (totalMined >= 500) return { rank: 'Gold Miner', icon: '🏆', progress: 80, next: 'Diamond Miner', hasMined: true };
    if (totalMined >= 100) return { rank: 'Silver Miner', icon: '🥈', progress: 60, next: 'Gold Miner', hasMined: true };
    if (totalMined >= 50) return { rank: 'Bronze Miner', icon: '🥉', progress: 40, next: 'Silver Miner', hasMined: true };

    return { rank: 'Starter Miner', icon: '⭐', progress: 20, next: 'Bronze Miner', hasMined: true };
  };

  const userMiningRank = getUserMiningRank();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const success = await register();
      if (success) {
        console.log('Registration successful!');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setRegistering(false);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    setMiningAnimation(true);
    try {
      const success = await claimDailyReward();
      if (success) {
        console.log('Claim successful!');
      }
    } catch (error) {
      console.error('Claim failed:', error);
    } finally {
      setClaiming(false);
      setTimeout(() => setMiningAnimation(false), 2000);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToCorrectNetwork();
    } catch (error) {
      console.error('Network switch failed:', error);
    }
  };

  // Check if contract addresses are properly configured
  // const isContractConfigured = MINING_CONTRACT_ADDRESS !== "0x1234567890123456789012345678901234567890";

  // Mining animation effect
  useEffect(() => {
    if (isRegistered && canClaim) {
      const interval = setInterval(() => {
        setMiningAnimation(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isRegistered, canClaim]);

  // Redirect to registration if not registered and not already on /register
  useEffect(() => {
    if (!isRegistered && location.pathname !== '/register') {
      navigate('/register');
    }
  }, [isRegistered, navigate, location.pathname]);

  if (!isRegistered && location.pathname !== '/register') {
    return null;
  }

  // Show setup instructions if contract not configured
  if (!isContractConfigured) {
    return <SetupInstructions />;
  }

  // Show connection UI if not connected
  if (!isConnected) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Card sx={{ p: 4, background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              🚀 Token Mining Platform
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: '#b0b0b0' }}>
              Connect your wallet to start mining tokens daily
            </Typography>
            <ConnectButton
              client={client}
              wallets={wallets}
              chain={bscTestnet}
              connectModal={{
                size: "wide",
                title: "Connect to Mining Platform",
                showThirdwebBranding: false,
              }}
            />
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Show network switch UI if wrong network
  if (!isCorrectNetwork) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Card sx={{ p: 4, background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              ⚠️ Wrong Network
            </Typography>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Please switch to BSC Testnet to continue
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleSwitchNetwork}
              sx={{ bgcolor: 'white', color: '#ff9800', '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              Switch to BSC Testnet
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in={true} timeout={1000}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#1b5e20', fontWeight: 600 }}>
            Mining Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Welcome back! Here's your mining overview.
          </Typography>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Mined */}
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={1000} style={{ transitionDelay: '100ms' }}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.05) 0%, rgba(46, 125, 50, 0.1) 100%)',
              border: '2px solid rgba(46, 125, 50, 0.2)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MonetizationOn sx={{ color: '#1b5e20', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: '#1b5e20' }}>Total Mined</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1b5e20' }}>
                  {userRecord ? formatAmount(userRecord.totalMinted) : '0'} Tokens
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All-time mined tokens
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        {/* Daily Reward */}
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={1000} style={{ transitionDelay: '200ms' }}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 235, 59, 0.1) 100%)',
              border: '2px solid rgba(255, 193, 7, 0.2)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ color: '#ff9800', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: '#ff9800' }}>Daily Reward</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                  {formatAmount(dailyReward)} Tokens
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Claimable every 24 hours
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        {/* Direct Referrals */}
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={1000} style={{ transitionDelay: '300ms' }}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(3, 169, 244, 0.1) 100%)',
              border: '2px solid rgba(33, 150, 243, 0.2)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ color: '#2196f3', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: '#2196f3' }}>Direct Referrals</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                  {directReferralCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  People you referred
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        {/* Mining Rank */}
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={1000} style={{ transitionDelay: '400ms' }}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(103, 58, 183, 0.1) 100%)',
              border: '2px solid rgba(156, 39, 176, 0.2)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmojiEvents sx={{ color: '#9c27b0', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: '#9c27b0' }}>Mining Rank</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                  {userMiningRank.rank}
                </Typography>
                <LinearProgress variant="determinate" value={userMiningRank.progress} sx={{ height: 8, borderRadius: 5, mt: 2, mb: 1, background: '#eee' }} />
                <Typography variant="body2" color="text.secondary">
                  Next: {userMiningRank.next}
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Actions Section (Claim, Refresh, etc.) */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Claim Your Daily Reward
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can claim your daily mining reward once every 24 hours.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleClaim}
              disabled={!canClaim || claiming}
              sx={{ fontWeight: 600, px: 4 }}
            >
              {claiming ? <CircularProgress size={24} /> : 'Claim Now'}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ fontWeight: 600 }}
              startIcon={<Refresh />}
            >
              {refreshing ? <CircularProgress size={20} /> : 'Refresh'}
            </Button>
          </Stack>
        </Stack>
        {!canClaim && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
            Next claim available in: {formatTime(timeUntilNextClaim)}
          </Typography>
        )}
      </Paper>

      {/* Additional mining info, team, etc. can be added here as more cards/sections */}
    </Container>
  );
};

export default MiningDashboard;
