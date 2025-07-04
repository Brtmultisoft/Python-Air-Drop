import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Typography,
  Card,
  CardContent,
  Paper,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AccountBalanceWallet,
  People,
  MonetizationOn,
  CheckCircle,
  Refresh,
  Diamond,
  Star,
  EmojiEvents,
  Timeline,
} from '@mui/icons-material';
import { useThirdWebMLM } from '../context/ThirdWebMLMContext';
import { useInvestment } from '../context/InvestmentContext';
import MLMSidebar from '../components/MLMSidebar';

// Import section components
import InvestmentPackages from '../components/sections/InvestmentPackages';
import MyInvestments from '../components/sections/MyInvestments';
import DailyROI from '../components/sections/DailyROI';
// import TeamStructure from '../components/sections/TeamStructure';
import TeamInvestments from '../components/sections/TeamInvestments';
import ReferralIncome from '../components/sections/ReferralIncome';
import DepositHistory from '../components/sections/DepositHistory';
import WithdrawalHistory from '../components/sections/WithdrawalHistory';
import Withdraw from '../components/sections/Withdraw';
import ReferralLinkManager from '../components/sections/ReferralLinkManager';
import ReferralCodeDisplay from '../components/sections/ReferralCodeDisplay';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import MLMSidebarSkeleton from '../components/skeletons/MLMSidebarSkeleton';
import DashboardOverviewSkeleton from '../components/skeletons/DashboardOverviewSkeleton';
import { ConnectButton } from "thirdweb/react";
import { client, bscMainnet } from '../client';
import { createWallet } from "thirdweb/wallets";

const MLMDashboardWorking: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected, isCorrectNetwork, isMLMRegistered, address, connectWallet } = useThirdWebMLM();
  const {
    userInvestmentData,
    totalPendingRewards,
    packages,
    userContributions,
    refreshUserData,
    isLoading
  } = useInvestment();

  // Get section from URL parameters, default to 'dashboard'
  const urlParams = new URLSearchParams(location.search);
  const selectedSection = urlParams.get('section') || 'dashboard';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoConnectTriggered, setAutoConnectTriggered] = useState(false);

  // Define wallets for ThirdWeb
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("com.trustwallet.app"),
    createWallet("walletConnect"),
    createWallet("io.rabby"),
    createWallet("io.zerion.wallet"),
  ];

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionChange = (section: string) => {
    navigate(`/usd/mlm/dashboard?section=${section}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Auto-connect wallet immediately when page loads
  useEffect(() => {
    const triggerAutoConnect = async () => {
      // Only trigger if not connected and not already triggered
      if (!isConnected && !autoConnectTriggered) {
        setAutoConnectTriggered(true);

        console.log('Auto-triggering ThirdWeb wallet connection...');

        // Try different wallet types in order of popularity
        const walletTypes = ['metamask', 'trust', 'coinbase'];
        let connected = false;

        for (const walletType of walletTypes) {
          if (connected) break;

          try {
            console.log(`Attempting to connect with ${walletType}...`);
            await connectWallet(walletType);
            connected = true;
            console.log(`Successfully connected with ${walletType}`);
            break;
          } catch (error) {
            console.log(`Auto-connect with ${walletType} failed:`, error);
            // Continue to next wallet type
          }
        }

        // If all direct connections failed, try the fallback modal
        if (!connected) {
          console.log('All direct connections failed, opening wallet selection modal...');
          setTimeout(() => {
            const connectButton = document.querySelector('#hidden-connect-button button');
            if (connectButton) {
              console.log('Triggering wallet selection modal...');
              (connectButton as HTMLButtonElement).click();
            }
          }, 500);
        }
      }
    };

    // Trigger on mount
    triggerAutoConnect();
  }, [isConnected, autoConnectTriggered, connectWallet]);

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

  // Calculate user rank based on investment
  const getUserRank = () => {
    if (!userInvestmentData || userInvestmentData.totalContribution === 0n) {
      return { rank: 'New Member', icon: '👤', progress: 0, next: 'Start Investing', hasInvested: false };
    }

    const totalInvestment = Number(formatAmount(userInvestmentData.totalContribution));

    if (totalInvestment >= 50000) return { rank: 'Diamond Elite', icon: '💎', progress: 100, next: 'Max Level', hasInvested: true };
    if (totalInvestment >= 10000) return { rank: 'Gold Investor', icon: '🏆', progress: 80, next: 'Diamond Elite', hasInvested: true };
    if (totalInvestment >= 5000) return { rank: 'Silver Member', icon: '🥈', progress: 60, next: 'Gold Investor', hasInvested: true };
    if (totalInvestment >= 1000) return { rank: 'Bronze Member', icon: '🥉', progress: 40, next: 'Silver Member', hasInvested: true };

    return { rank: 'Starter', icon: '⭐', progress: 20, next: 'Bronze Member', hasInvested: true };
  };

  const userRank = getUserRank();

  // Dashboard Overview Component
  const DashboardOverview = () => {
    return (
      <Box>
        {/* Welcome Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderRadius: 2,
          p: { xs: 1.5, sm: 2, md: 2.5 },
          mb: { xs: 1.5, sm: 2 },
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          border: '1px solid #333',
        }}>
          {/* Subtle Background Elements */}
          <Box sx={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.02)',
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.01)',
          }} />

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1, md: 2 }, alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h3" gutterBottom sx={{
                fontWeight: 'bold',
                color: '#ffffff',
                mb: { xs: 0.5, sm: 1 },
                fontSize: { xs: '1.4rem', sm: '1.6rem', md: '2rem' }
              }}>
                {userRank.hasInvested ? `Welcome Back, ${userRank.rank}!` : 'Welcome to Python Air Drop!'}
              </Typography>

              <Typography variant="h6" sx={{
                color: '#b0b0b0',
                mb: { xs: 1.5, sm: 2 },
                fontWeight: 400,
                lineHeight: 1.2,
                fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' }
              }}>
                Manage your investments and track your earnings
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 0.5, sm: 1 }}
                flexWrap="wrap"
                sx={{
                  mb: { xs: 1.5, sm: 2 },
                  '& .MuiChip-root': {
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    height: { xs: 24, sm: 28 }
                  }
                }}
              >
                <Chip
                  icon={<CheckCircle />}
                  label="BSC Mainnet"
                  sx={{
                    bgcolor: '#1e3a1e',
                    color: '#4caf50',
                    fontWeight: 'bold',
                    border: '1px solid #4caf50'
                  }}
                />
                <Chip
                  icon={<CheckCircle />}
                  label={userRank.hasInvested ? "Active Member" : "Platform Member"}
                  sx={{
                    bgcolor: userRank.hasInvested ? '#1e3a1e' : '#2e2e1e',
                    color: userRank.hasInvested ? '#4caf50' : '#ff9800',
                    fontWeight: 'bold',
                    border: `1px solid ${userRank.hasInvested ? '#4caf50' : '#ff9800'}`
                  }}
                />
                <Chip
                  icon={<AccountBalanceWallet />}
                  label={`${userInvestmentData ? formatAmount(userInvestmentData.totalContribution) : '0'} USDT`}
                  sx={{
                    bgcolor: '#2d2d2d',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    border: '1px solid #555'
                  }}
                />
              </Stack>

              <Typography variant="body2" sx={{
                color: '#888',
                fontFamily: 'monospace',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                wordBreak: 'break-all'
              }}>
                Wallet: {address ? `${address.slice(0, isMobile ? 8 : 12)}...${address.slice(isMobile ? -6 : -10)}` : 'Not connected'}
              </Typography>
            </Box>

            <Box sx={{
              minWidth: { xs: '100%', md: 280 },
              width: { xs: '100%', md: 'auto' }
            }}>
              <Paper sx={{
                  p: { xs: 1.5, sm: 2, md: 2.5 },
                  background: '#1e1e1e',
                  borderRadius: 2,
                  textAlign: 'center',
                  border: '1px solid #333',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
                    borderColor: '#444',
                  }
                }}>
                  <Typography variant="h2" sx={{
                    fontWeight: 'bold',
                    mb: 0.5,
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    color: '#ffffff',
                  }}>
                    {userRank.icon}
                  </Typography>

                  <Typography variant="h5" sx={{
                    fontWeight: 'bold',
                    mb: 0.5,
                    color: '#ffffff',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}>
                    {userRank.rank}
                  </Typography>

                  <Typography variant="body2" sx={{
                    mb: { xs: 1.5, sm: 2 },
                    color: '#b0b0b0',
                    fontSize: { xs: '0.75rem', sm: '0.8rem' }
                  }}>
                    {userRank.hasInvested ? 'Your Investment Tier' : 'Ready to Start Investing'}
                  </Typography>

                  {/* <Box sx={{ mb: 3 }}>
                    <LinearProgress
                      variant="determinate"
                      value={userRank.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#333',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#4caf50',
                          borderRadius: 4,
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" sx={{ color: '#888', fontWeight: 'bold' }}>
                        {userRank.progress}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#888', fontWeight: 'bold' }}>
                        Next: {userRank.next}
                      </Typography>
                    </Box>
                  </Box> */}

                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: { xs: 0.5, sm: 1 },
                    pt: { xs: 1, sm: 1.5 },
                    borderTop: '1px solid #333'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{
                        fontWeight: 'bold',
                        color: '#4caf50',
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}>
                        {userContributions.length}
                      </Typography>
                      <Typography variant="caption" sx={{
                        color: '#888',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}>
                        Investments
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{
                        fontWeight: 'bold',
                        color: '#2196f3',
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}>
                        {userInvestmentData && userInvestmentData.totalContribution > 0n
                          ? ((Number(formatAmount(userInvestmentData.totalClaimedReward)) / Number(formatAmount(userInvestmentData.totalContribution))) * 100).toFixed(1)
                          : '0'}%
                      </Typography>
                      <Typography variant="caption" sx={{
                        color: '#888',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}>
                        ROI
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{
                        fontWeight: 'bold',
                        color: '#ff9800',
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}>
                        {formatAmount(totalPendingRewards).slice(0, 6)}
                      </Typography>
                      <Typography variant="caption" sx={{
                        color: '#888',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}>
                        Pending
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
            </Box>
          </Box>

          {/* Refresh Button */}
          <IconButton
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: '#333',
              color: '#ffffff',
              border: '1px solid #555',
              '&:hover': {
                bgcolor: '#444',
              }
            }}
          >
            <Refresh sx={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              }
            }} />
          </IconButton>
        </Box>

        {/* Real-time Stats Cards */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          },
          gap: { xs: 2, sm: 3 },
          mb: 4
        }}>
          <Card sx={{
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid #333',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderColor: '#4caf50'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" color="#ffffff" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Total Investment
                </Typography>
                <AccountBalanceWallet sx={{ color: '#4caf50', fontSize: { xs: 24, sm: 30 } }} />
              </Box>
              <Typography variant="h4" sx={{
                fontWeight: 'bold',
                mb: 1,
                color: '#ffffff',
                fontSize: { xs: '1.5rem', sm: '2.125rem' }
              }}>
                {userInvestmentData ? formatAmount(userInvestmentData.totalContribution) : '0'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>USDT</Typography>
              <Typography variant="caption" sx={{ color: '#888', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Active Investments: {userContributions.length}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid #333',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderColor: '#2196f3'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" color="#ffffff" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Total Claimed
                </Typography>
                <MonetizationOn sx={{ color: '#2196f3', fontSize: { xs: 24, sm: 30 } }} />
              </Box>
              <Typography variant="h4" sx={{
                fontWeight: 'bold',
                mb: 1,
                color: '#ffffff',
                fontSize: { xs: '1.5rem', sm: '2.125rem' }
              }}>
                {userInvestmentData ? formatAmount(userInvestmentData.totalClaimedReward) : '0'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>USDT</Typography>
              <Typography variant="caption" sx={{ color: '#888', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                ROI: {userInvestmentData && userInvestmentData.totalContribution > 0n
                  ? ((Number(formatAmount(userInvestmentData.totalClaimedReward)) / Number(formatAmount(userInvestmentData.totalContribution))) * 100).toFixed(2)
                  : '0'}%
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid #333',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderColor: '#ff9800'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" color="#ffffff" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Pending Rewards
                </Typography>
                <TrendingUp sx={{ color: '#ff9800', fontSize: { xs: 24, sm: 30 } }} />
              </Box>
              <Typography variant="h4" sx={{
                fontWeight: 'bold',
                mb: 1,
                color: '#ffffff',
                fontSize: { xs: '1.5rem', sm: '2.125rem' }
              }}>
                {formatAmount(totalPendingRewards)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>USDT</Typography>
              <Typography variant="caption" sx={{ color: '#888', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Ready to claim
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid #333',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderColor: '#9c27b0'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" color="#ffffff" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Referral Income
                </Typography>
                <People sx={{ color: '#9c27b0', fontSize: { xs: 24, sm: 30 } }} />
              </Box>
              <Typography variant="h4" sx={{
                fontWeight: 'bold',
                mb: 1,
                color: '#ffffff',
                fontSize: { xs: '1.5rem', sm: '2.125rem' }
              }}>
                {userInvestmentData ? formatAmount(userInvestmentData.totalLevelIncome) : '0'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>USDT</Typography>
              <Typography variant="caption" sx={{ color: '#888', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                From team network
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions Section */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: { xs: 2, md: 3 },
          mb: 4
        }}>
          <Card sx={{
            background: '#1e1e1e',
            border: '1px solid #333',
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" gutterBottom sx={{
                fontWeight: 'bold',
                color: '#ffffff',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}>
                ⚡ Quick Actions
              </Typography>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: { xs: 2, sm: 3 }
              }}>
                <Paper
                  sx={{
                    p: { xs: 2, sm: 3 },
                    background: '#2d2d2d',
                    border: '1px solid #444',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#333',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                      borderColor: '#ff9800'
                    }
                  }}
                  onClick={() => handleSectionChange('packages')}
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    <Diamond sx={{ color: '#ff9800', mr: 2, fontSize: { xs: 28, sm: 32 } }} />
                    <Typography variant="h6" sx={{
                      fontWeight: 'bold',
                      color: '#ffffff',
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}>
                      Investment Packages
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{
                    color: '#b0b0b0',
                    mb: 2,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}>
                    Explore 4 different investment packages with daily returns from 1% to 1.5%
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: '#ff9800',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}>
                    {packages.length} packages available
                    <Star sx={{ fontSize: 16 }} />
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    p: { xs: 2, sm: 3 },
                    background: '#2d2d2d',
                    border: '1px solid #444',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#333',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                      borderColor: '#4caf50'
                    }
                  }}
                  onClick={() => handleSectionChange('my-investments')}
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    <AccountBalanceWallet sx={{ color: '#4caf50', mr: 2, fontSize: { xs: 28, sm: 32 } }} />
                    <Typography variant="h6" sx={{
                      fontWeight: 'bold',
                      color: '#ffffff',
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}>
                      My Investments
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{
                    color: '#b0b0b0',
                    mb: 2,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}>
                    Track your active investments and claim daily rewards
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: '#4caf50',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}>
                    {userContributions.length} active investments
                    <EmojiEvents sx={{ fontSize: 16 }} />
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    p: { xs: 2, sm: 3 },
                    background: '#2d2d2d',
                    border: '1px solid #444',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#333',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                      borderColor: '#2196f3'
                    }
                  }}
                  onClick={() => handleSectionChange('team-structure')}
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    <People sx={{ color: '#2196f3', mr: 2, fontSize: { xs: 28, sm: 32 } }} />
                    <Typography variant="h6" sx={{
                      fontWeight: 'bold',
                      color: '#ffffff',
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}>
                      Team Structure
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{
                    color: '#b0b0b0',
                    mb: 2,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}>
                    Build your network and earn referral commissions
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: '#2196f3',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}>
                    Multi-level rewards
                    <Timeline sx={{ fontSize: 16 }} />
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    p: { xs: 2, sm: 3 },
                    background: '#2d2d2d',
                    border: '1px solid #444',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#333',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                      borderColor: '#9c27b0'
                    }
                  }}
                  onClick={() => handleSectionChange('withdraw')}
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    <MonetizationOn sx={{ color: '#9c27b0', mr: 2, fontSize: { xs: 28, sm: 32 } }} />
                    <Typography variant="h6" sx={{
                      fontWeight: 'bold',
                      color: '#ffffff',
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}>
                      Withdraw Funds
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{
                    color: '#b0b0b0',
                    mb: 2,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}>
                    Withdraw your earned rewards instantly to your wallet
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: '#9c27b0',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}>
                    {formatAmount(totalPendingRewards)} USDT available
                    <TrendingUp sx={{ fontSize: 16 }} />
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{
            background: '#1e1e1e',
            border: '1px solid #333',
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={3}>
                {/* Enhanced Account Information */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{
                    fontWeight: 'bold',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}>
                    📊 Account Overview
                  </Typography>

                  <Stack spacing={3}>
                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      background: '#333',
                      border: '1px solid #555'
                    }}>
                      <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                        💳 Wallet Address
                      </Typography>
                      <Typography variant="body1" sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        wordBreak: 'break-all'
                      }}>
                        {address ? `${address.slice(0, 12)}...${address.slice(-10)}` : 'Not connected'}
                      </Typography>
                    </Box>

                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      background: '#333',
                      border: '1px solid #555'
                    }}>
                     
                    </Box>

                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      background: '#333',
                      border: '1px solid #555'
                    }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                          🎯 Platform Status
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                          {!isMLMRegistered ? 'Not Registered' : userRank.hasInvested ? 'Active Member' : 'Registered'}
                        </Typography>
                      </Box>
                      <Chip
                        label={!isMLMRegistered ? 'Pending' : userRank.hasInvested ? 'Active' : 'Ready'}
                        sx={{
                          bgcolor: !isMLMRegistered ? '#3a2e1e' : userRank.hasInvested ? '#1e3a1e' : '#2e2e1e',
                          color: !isMLMRegistered ? '#ff9800' : userRank.hasInvested ? '#4caf50' : '#ff9800',
                          fontWeight: 'bold',
                          border: `1px solid ${!isMLMRegistered ? '#ff9800' : userRank.hasInvested ? '#4caf50' : '#ff9800'}`
                        }}
                      />
                    </Box>

                    {userRank.hasInvested && (
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        background: '#333',
                        border: '1px solid #ff9800'
                      }}>
                        <Box>
                          <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                            🏆 Investment Tier
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                            {userRank.rank}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ color: '#ff9800' }}>
                            {userRank.icon}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {!userRank.hasInvested && (
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                        border: '1px solid #ff9800',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h4" sx={{ color: '#ffffff', mb: 1 }}>
                          🚀
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold', mb: 1 }}>
                          Start Your Investment Journey
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
                          Choose from 4 investment packages and start earning daily returns
                        </Typography>
                        <Box
                          component="button"
                          onClick={() => handleSectionChange('packages')}
                          sx={{
                            background: '#ffffff',
                            color: '#ff9800',
                            border: 'none',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: '#f5f5f5',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          View Packages
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  };

  // Render content based on selected section
  const renderContent = () => {
    // Show skeleton loading for dashboard and data-heavy sections
    if (isLoading && (selectedSection === 'dashboard' || selectedSection === 'my-investments' || selectedSection === 'daily-roi')) {
      return <DashboardSkeleton />;
    }

    switch (selectedSection) {
      case 'dashboard':
        return <DashboardOverview />;
      // case 'packages':
      //   return <InvestmentPackages />;
      // case 'my-investments':
      //   return <MyInvestments />;
      // case 'daily-roi':
      //   return <DailyROI />;
      // case 'team-structure':
      //   return <TeamStructure />;
      // case 'team-investments':
      //   return <TeamInvestments />;
      // case 'referral-income':
      //   return <ReferralIncome />;
      // case 'referral-links':
      //   return <ReferralLinkManager />;
      // case 'referral-codes':
      //   return <ReferralCodeDisplay />;
      // case 'deposit-history':
      //   return <DepositHistory />;
      // case 'withdrawal-history':
      //   return <WithdrawalHistory />;
      // case 'withdraw':
      //   return <Withdraw />;
      default:
        return <DashboardOverview />;
    }
  };

  // Show skeleton UI when not connected or not registered
  if (!isConnected || !isCorrectNetwork || !isMLMRegistered) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Skeleton Sidebar */}
        <MLMSidebarSkeleton
          mobileOpen={mobileOpen}
          onMobileToggle={handleMobileToggle}
        />

        {/* Skeleton Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 0.5, sm: 1, md: 2 },
            ml: isMobile ? 0 : 0,
            mt: isMobile ? 6 : 0,
            mb: isMobile ? 7 : 0, // Add bottom margin for mobile bottom nav
            background: '#121212',
            minHeight: '100vh',
            width: { xs: '100%', md: 'auto' },
            overflow: 'hidden'
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
            <DashboardOverviewSkeleton />
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <MLMSidebar
        selectedSection={selectedSection}
        onSectionChange={handleSectionChange}
        mobileOpen={mobileOpen}
        onMobileToggle={handleMobileToggle}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 0.5, sm: 1, md: 2 },
          ml: isMobile ? 0 : 0,
          mt: isMobile ? 6 : 0,
          mb: isMobile ? 7 : 0, // Add bottom margin for mobile bottom nav
          background: '#121212',
          minHeight: '100vh',
          width: { xs: '100%', md: 'auto' },
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
          {renderContent()}
        </Container>
      </Box>

      {/* Hidden Auto-Connect Button */}
      <Box sx={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
        <div id="hidden-connect-button">
          <ConnectButton
            client={client}
            wallets={wallets}
            chain={bscMainnet}
            connectModal={{
              size: "wide",
              title: "Connect to MLM Platform",
              showThirdwebBranding: false,
            }}
            switchButton={{
              label: "Switch to BSC Mainnet",
            }}
          />
        </div>
      </Box>
    </Box>
  );
};

export default MLMDashboardWorking;
