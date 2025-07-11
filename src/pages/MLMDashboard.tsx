import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Card,
  CardContent,
  Stack,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMining } from '../context/MiningContext';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ShareIcon from '@mui/icons-material/Share';
import DiamondIcon from '@mui/icons-material/Diamond';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import BuildIcon from '@mui/icons-material/Build';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import * as QRCode from 'qrcode';

// Add mining animation styles
const miningAnimationStyles = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }

  @keyframes mining {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-2px); }
    100% { transform: translateY(0px); }
  }

  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.5); }
    50% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.8); }
    100% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.5); }
  }

  @keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes miningProgress {
    0% { width: 0%; }
    100% { width: 100%; }
  }

  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
    50% { opacity: 1; transform: scale(1) rotate(180deg); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-8px) rotate(120deg); }
    66% { transform: translateY(4px) rotate(240deg); }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .mining-animation {
    animation: mining 2s ease-in-out infinite;
  }

  .mining-glow {
    animation: glow 3s ease-in-out infinite;
  }

  .mining-rotate {
    animation: rotate 4s linear infinite;
  }

  .mining-progress {
    animation: miningProgress 6s ease-in-out infinite;
  }

  .mining-sparkle {
    animation: sparkle 3s ease-in-out infinite;
  }

  .mining-float {
    animation: float 8s ease-in-out infinite;
  }

  .continuous-mining {
    position: relative;
    overflow: hidden;
  }

  .continuous-mining::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.4), transparent);
    animation: shimmer 4s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = miningAnimationStyles;
  document.head.appendChild(styleSheet);
}

function formatTimeHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

const MLMDashboard: React.FC = () => {
  const {
    isConnected,
    isRegistered,
    address,
    userRecord,
    dailyReward,
    regReward,
    directReferrals,
    directReferralCount,
    referrer,
    totalRegistered,
    canClaim,
    timeUntilNextClaim,
    claimDailyReward,
    refreshData,
    isCorrectNetwork
  } = useMining();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Animation states
  const [showContent, setShowContent] = useState<boolean>(false);

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    totalMinted: 0,
    dailyReward: 0,
    regReward: 0,
    teamSize: 0,
    directReferrals: 0,
    level: 'Bronze',
    nextLevelProgress: 0,
    recentReferrals: [] as Array<{ address: string; date: string; earnings: number }>
  });

  const [loading, setLoading] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(false);

  // Snackbar state for referral link copy feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // QR Code dialog state
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!isConnected || !isRegistered) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshData();
      } catch (error) {
        console.error('Auto-refresh error:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [isConnected, isRegistered, refreshData]);

  // Check registration status and redirect if needed
  useEffect(() => {
    const checkRegistrationAndRedirect = async () => {
      if (isConnected && isCorrectNetwork) {
        try {
          setCheckingRegistration(true);
          // If user is not registered, redirect to registration
          if (!isRegistered) {
            console.log('User is not registered, redirecting to registration');
            navigate('/register', { replace: true });
          }
        } catch (error) {
          console.error('Error checking registration status:', error);
        } finally {
          setCheckingRegistration(false);
        }
      }
    };

    checkRegistrationAndRedirect();
  }, [isConnected, isCorrectNetwork, isRegistered, navigate]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isConnected || !isRegistered || !address) return;

      try {
        setLoading(true);

        // Calculate level based on referral count
        let level = 'Bronze';
        let nextLevelProgress = 0;

        if (directReferralCount >= 20) {
          level = 'Diamond';
          nextLevelProgress = 100;
        } else if (directReferralCount >= 10) {
          level = 'Gold';
          nextLevelProgress = Math.min(100, (directReferralCount / 20) * 100);
        } else if (directReferralCount >= 5) {
          level = 'Silver';
          nextLevelProgress = Math.min(100, (directReferralCount / 10) * 100);
        } else {
          level = 'Bronze';
          nextLevelProgress = Math.min(100, (directReferralCount / 5) * 100);
        }

        // Convert BigInt values to numbers for display
        const totalMinted = userRecord ? Number(userRecord.totalMinted) / 1e18 : 0;
        const dailyRewardValue = Number(dailyReward) / 1e18;
        const regRewardValue = Number(regReward) / 1e18;

        setDashboardData({
          totalMinted,
          dailyReward: dailyRewardValue,
          regReward: regRewardValue,
          teamSize: directReferralCount, // For simplicity, using direct referrals as team size
          directReferrals: directReferralCount,
          level,
          nextLevelProgress,
          recentReferrals: directReferrals.slice(0, 3).map((addr, index) => ({
            address: `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`,
            date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            earnings: regRewardValue // Use registration reward as earnings
          }))
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isConnected, isRegistered, address, directReferralCount, directReferrals, userRecord, dailyReward, regReward]);

  // Removed problematic redirect useEffect to prevent infinite loop

  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    }
  };

  // Handle referral link sharing with QR code
  const handleShareReferralLink = async () => {
    if (!address) return;

    try {
      const link = `${window.location.origin}/register?ref=${address}`;
      setReferralLink(link);

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(link, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1b5e20',
          light: '#ffffff'
        }
      });
      setQrCodeDataUrl(qrDataUrl);

      // Open QR dialog
      setQrDialogOpen(true);

    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setSnackbarMessage('Failed to generate QR code. Please try again.');
      setSnackbarOpen(true);
    }
  };

  // Handle copying referral link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setSnackbarMessage('Referral link copied to clipboard!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to copy referral link:', error);
      setSnackbarMessage('Failed to copy link. Please try again.');
      setSnackbarOpen(true);
    }
  };

  // Handle downloading QR code
  const handleDownloadQR = () => {
    if (!qrCodeDataUrl || !address) return;

    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = `USDStack-Referral-QR-${address.slice(0, 8)}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbarMessage('QR code downloaded successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      setSnackbarMessage('Failed to download QR code. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Bronze': return '#CD7F32';
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#FFD700';
      case 'Diamond': return '#B9F2FF';
      default: return '#C0C0C0';
    }
  };

  // Show connection prompt if not connected
  if (!isConnected) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h4" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Please connect your wallet to access the mining dashboard.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              backgroundColor: '#1b5e20',
              '&:hover': { backgroundColor: '#2e7d32' }
            }}
          >
            Go to Registration
          </Button>
        </Box>
      </Container>
    );
  }

  // Show registration prompt if connected but not registered
  if (isConnected && !isRegistered) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h4" gutterBottom>
            Register for Mining
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You need to register to start mining. Click below to register.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              backgroundColor: '#1b5e20',
              '&:hover': { backgroundColor: '#2e7d32' }
            }}
          >
            Register Now
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in={showContent} timeout={1000}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#1b5e20', fontWeight: 600 }}>
            Mining Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Welcome back! Here's your mining overview.
          </Typography>
          
          {/* Show loading indicator when checking registration */}
          {checkingRegistration && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Checking registration status...
              </Typography>
            </Box>
          )}
        </Box>
      </Fade>

      {/* Continuous Mining Animation Banner */}
      <Fade in={showContent} timeout={1500}>
        <Card sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }} className="continuous-mining">
          <CardContent sx={{ py: 3 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 2
            }}>
              {/* Mining Status */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <BuildIcon
                    sx={{
                      fontSize: 40,
                      color: '#fff'
                    }}
                    className="mining-rotate"
                  />
                  <FlashOnIcon
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      fontSize: 20,
                      color: '#ffeb3b'
                    }}
                    className="mining-sparkle"
                  />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    ⛏️ Mining Active
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Your mining rig is working 24/7 to earn rewards
                  </Typography>
                </Box>
              </Box>

              {/* Mining Progress Indicator */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    🔥 MINING
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Generating Rewards...
                  </Typography>
                </Box>
                <AutorenewIcon
                  sx={{
                    fontSize: 35,
                    color: '#4fc3f7'
                  }}
                  className="mining-rotate"
                />
              </Box>
            </Box>

            {/* Animated Progress Bar */}
            <Box sx={{
              mt: 2,
              height: 6,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <Box sx={{
                height: '100%',
                background: 'linear-gradient(90deg, #4fc3f7, #81c784, #4fc3f7)',
                borderRadius: 3,
                width: '100%'
              }} className="mining-progress" />
            </Box>

            {/* Floating Mining Particles */}
            <Box sx={{ position: 'absolute', top: 10, left: '20%', zIndex: 1 }}>
              <Typography sx={{ fontSize: 20, opacity: 0.6 }} className="mining-float">
                ⚡
              </Typography>
            </Box>
            <Box sx={{ position: 'absolute', top: 20, right: '30%', zIndex: 1 }}>
              <Typography sx={{ fontSize: 16, opacity: 0.5 }} className="mining-sparkle">
                💎
              </Typography>
            </Box>
            <Box sx={{ position: 'absolute', bottom: 15, left: '60%', zIndex: 1 }}>
              <Typography sx={{ fontSize: 18, opacity: 0.7 }} className="mining-float">
                🔧
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Minted */}
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={showContent} timeout={1000} style={{ transitionDelay: '100ms' }}>
            <Card sx={{
              ...cardStyle,
              background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.05) 0%, rgba(46, 125, 50, 0.1) 100%)',
              border: '2px solid rgba(46, 125, 50, 0.2)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MonetizationOnIcon sx={{ color: '#1b5e20', mr: 1 }} className="mining-animation" />
                  <Typography variant="h6" sx={{ color: '#1b5e20' }}>Total Minted</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1b5e20' }}>
                  {dashboardData.totalMinted.toFixed(4)} Tokens
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All-time minted tokens
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        {/* Daily Reward */}
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={showContent} timeout={1000} style={{ transitionDelay: '200ms' }}>
            <Card sx={{
              ...cardStyle,
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 215, 0, 0.1) 100%)',
              border: '2px solid rgba(255, 193, 7, 0.2)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ color: '#FFA000', mr: 1 }} className="mining-animation" />
                  <Typography variant="h6" sx={{ color: '#FFA000' }}>Daily Reward</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FFA000' }}>
                  {dashboardData.dailyReward.toFixed(4)} Tokens
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Daily mining reward
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        {/* Booster Income */}
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={showContent} timeout={1000} style={{ transitionDelay: '250ms' }}>
            <Card sx={{
              ...cardStyle,
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(142, 36, 170, 0.1) 100%)',
              border: '2px solid rgba(156, 39, 176, 0.2)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DiamondIcon sx={{ color: '#9C27B0', mr: 1 }} className="mining-animation" />
                  <Typography variant="h6" sx={{ color: '#9C27B0' }}>Booster Income</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9C27B0' }}>
                  {userRecord ? (Number(userRecord.boosterIncome) / 1e18).toFixed(4) : '0.0000'} Tokens
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Referral booster rewards
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        {/* Mining Status */}
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={showContent} timeout={1000} style={{ transitionDelay: '350ms' }}>
            <Card sx={{
              ...cardStyle,
              background: canClaim
                ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(139, 195, 74, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(103, 58, 183, 0.05) 0%, rgba(63, 81, 181, 0.1) 100%)',
              border: canClaim
                ? '2px solid rgba(76, 175, 80, 0.2)'
                : '2px solid rgba(103, 58, 183, 0.2)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTimeIcon sx={{ color: canClaim ? '#4CAF50' : '#673AB7', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: canClaim ? '#4CAF50' : '#673AB7' }}>
                    Mining Status
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: canClaim ? '#4CAF50' : '#673AB7' }}>
                  {canClaim ? 'Ready!' : formatTimeHMS(timeUntilNextClaim)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {canClaim ? 'Claim available' : 'Next claim in'}
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        {/* Direct Referrals */}
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={showContent} timeout={1000} style={{ transitionDelay: '400ms' }}>
            <Card sx={{
              ...cardStyle,
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(3, 169, 244, 0.1) 100%)',
              border: '2px solid rgba(0, 188, 212, 0.2)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonAddIcon sx={{ color: '#00BCD4', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: '#00BCD4' }}>Direct Referrals</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#00BCD4' }}>
                  {dashboardData.directReferrals}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your direct referrals
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Mining Progress */}
        <Grid item xs={12} md={6}>
          <Fade in={showContent} timeout={1500}>
            <Card sx={cardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <DiamondIcon sx={{ color: getLevelColor(dashboardData.level), mr: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Mining Level
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={dashboardData.level}
                    sx={{
                      backgroundColor: getLevelColor(dashboardData.level),
                      color: 'white',
                      fontWeight: 'bold',
                      mr: 2
                    }}
                  />
                  <Typography variant="body1">
                    Progress to next level: {dashboardData.nextLevelProgress.toFixed(1)}%
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={dashboardData.nextLevelProgress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getLevelColor(dashboardData.level),
                      animation: 'pulse 2s infinite'
                    }
                  }}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {dashboardData.level === 'Diamond'
                    ? 'Maximum level reached!'
                    : `Refer ${dashboardData.level === 'Bronze' ? 5 - dashboardData.directReferrals :
                        dashboardData.level === 'Silver' ? 10 - dashboardData.directReferrals :
                        20 - dashboardData.directReferrals} more miners to advance`}
                </Typography>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Fade in={showContent} timeout={1500}>
            <Card sx={cardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                  Mining Actions
                </Typography>

                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PlayArrowIcon className={canClaim ? 'mining-animation' : ''} />}
                    disabled={!canClaim || loading}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await claimDailyReward();
                        await refreshData();
                      } catch (error) {
                        console.error('Error claiming reward:', error);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className={canClaim ? 'mining-glow' : ''}
                    sx={{
                      py: 1.5,
                      backgroundColor: canClaim ? '#4CAF50' : '#9E9E9E',
                      '&:hover': { backgroundColor: canClaim ? '#66BB6A' : '#9E9E9E' },
                      '&:disabled': { backgroundColor: '#9E9E9E' },
                      transition: 'all 0.3s ease',
                      ...(canClaim && {
                        boxShadow: '0 0 20px rgba(76, 175, 80, 0.6)',
                        '&:hover': {
                          boxShadow: '0 0 30px rgba(76, 175, 80, 0.8)',
                          transform: 'translateY(-2px)'
                        }
                      })
                    }}
                  >
                    {canClaim ? 'Claim Daily Reward' : `Next Claim: ${formatTimeHMS(timeUntilNextClaim)}`}
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<QrCodeIcon />}
                    onClick={handleShareReferralLink}
                    sx={{
                      py: 1.5,
                      borderColor: '#1b5e20',
                      color: '#1b5e20',
                      '&:hover': {
                        borderColor: '#2e7d32',
                        backgroundColor: 'rgba(27, 94, 32, 0.1)'
                      }
                    }}
                  >
                    Share Referral QR Code
                  </Button>

                  {/* <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AccountTreeIcon />}
                    sx={{
                      py: 1.5,
                      borderColor: '#673AB7',
                      color: '#673AB7',
                      '&:hover': {
                        borderColor: '#7E57C2',
                        backgroundColor: 'rgba(103, 58, 183, 0.1)'
                      }
                    }}
                  >
                    View Referral Network
                  </Button> */}
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Fade in={showContent} timeout={2000}>
            <Card sx={cardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                  Recent Mining Activity
                </Typography>

                {dashboardData.recentReferrals.length > 0 ? (
                  dashboardData.recentReferrals.map((referral, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: '#1b5e20', mr: 2 }}>
                            <PersonAddIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              New Referral: {referral.address}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {referral.date}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={`+${referral.earnings.toFixed(2)} Tokens`}
                          color="success"
                          variant="outlined"
                        />
                      </Box>
                      {index < dashboardData.recentReferrals.length - 1 && <Divider />}
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No recent activity. Start mining and referring to see activity here!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeIcon />
            <Typography variant="h6">Share Referral Link</Typography>
          </Box>
          <IconButton
            onClick={() => setQrDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          {/* QR Code */}
          {qrCodeDataUrl && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1b5e20' }}>
                Scan QR Code
              </Typography>
              <Box sx={{
                display: 'inline-block',
                p: 2,
                border: '2px solid #1b5e20',
                borderRadius: 2,
                backgroundColor: '#f5f5f5'
              }}>
                <img
                  src={qrCodeDataUrl}
                  alt="Referral QR Code"
                  style={{ display: 'block', maxWidth: '100%' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Anyone who scans this QR code will open your referral link
              </Typography>

              {/* Download QR Code Button */}
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadQR}
                sx={{
                  mt: 2,
                  borderColor: '#1b5e20',
                  color: '#1b5e20',
                  '&:hover': {
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(27, 94, 32, 0.1)'
                  }
                }}
              >
                Download QR Code
              </Button>
            </Box>
          )}

          {/* Referral Link */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1b5e20' }}>
              Or Copy Link
            </Typography>
            <TextField
              fullWidth
              value={referralLink}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopyLink} edge="end">
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setQrDialogOpen(false)}
            variant="outlined"
            sx={{ borderColor: '#1b5e20', color: '#1b5e20' }}
          >
            Close
          </Button>
          <Button
            onClick={handleDownloadQR}
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{
              borderColor: '#1b5e20',
              color: '#1b5e20',
              '&:hover': {
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(27, 94, 32, 0.1)'
              }
            }}
          >
            Download QR
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="contained"
            startIcon={<ContentCopyIcon />}
            sx={{
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)'
              }
            }}
          >
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for referral link copy feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MLMDashboard;
