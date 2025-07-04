import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  Avatar,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  AccessTime,
  MonetizationOn,
  Diamond,
  Star,
  EmojiEvents,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { useInvestment } from '../../context/InvestmentContext';

const MyInvestments: React.FC = () => {
  const {
    userInvestmentData,
    userContributions,
    totalPendingRewards,
    claimReward,
    isLoading,
    isClaiming,
    refreshUserData,
  } = useInvestment();

  // Package names
  const packageNames = ['Starter', 'Silver', 'Gold', 'Diamond'];

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

  // Get package icon
  const getPackageIcon = (packageId: number) => {
    switch (packageId) {
      case 0: return <Star sx={{ color: '#ff9800' }} />;
      case 1: return <AccountBalanceWallet sx={{ color: '#9e9e9e' }} />;
      case 2: return <EmojiEvents sx={{ color: '#ffc107' }} />;
      case 3: return <Diamond sx={{ color: '#9c27b0' }} />;
      default: return <Star />;
    }
  };

  // Get package color
  const getPackageColor = (packageId: number) => {
    switch (packageId) {
      case 0: return '#ff9800';
      case 1: return '#9e9e9e';
      case 2: return '#ffc107';
      case 3: return '#9c27b0';
      default: return '#ff9800';
    }
  };

  // Format timestamp
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleClaimReward = async (index: number) => {
    try {
      const success = await claimReward(index);

      if (success) {
        // Additional refresh to ensure all components are updated
        console.log('🔄 Refreshing data after reward claim...');
        setTimeout(() => {
          refreshUserData();
        }, 2000); // Small delay to ensure transaction is processed
      }
    } catch (error) {
      console.error('Claim failed:', error);
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>Loading Your Investments...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!userInvestmentData || userContributions.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#FF9800' }}>
          My Investments
        </Typography>
        
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>No investments found</Typography>
          <Typography variant="body2">
            You haven't made any investments yet. Start by choosing an investment package to begin earning daily returns.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffff' }}>
        💼 My Investments
      </Typography>

      {/* Investment Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid #333',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderColor: '#4caf50'
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <MonetizationOn sx={{ mr: 1, color: '#4caf50' }} />
                <Typography variant="h6" color="#ffffff">Total Investment</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                {formatAmount(userInvestmentData.totalContribution)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                USDT
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid #333',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderColor: '#2196f3'
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp sx={{ mr: 1, color: '#2196f3' }} />
                <Typography variant="h6" color="#ffffff">Total Claimed</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                {formatAmount(userInvestmentData.totalClaimedReward)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                USDT
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid #333',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderColor: '#ff9800'
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AccessTime sx={{ mr: 1, color: '#ff9800' }} />
                <Typography variant="h6" color="#ffffff">Pending Rewards</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                {formatAmount(totalPendingRewards)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                USDT
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid #333',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderColor: '#9c27b0'
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Diamond sx={{ mr: 1, color: '#9c27b0' }} />
                <Typography variant="h6" color="#ffffff">Active Plans</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                {userContributions.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                Investments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Individual Investments */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}>
        📋 Investment Details
      </Typography>

      <Grid container spacing={3}>
        {userContributions.map((contribution, index) => {
          const packageId = Number(contribution.planIndex);
          const packageName = packageNames[packageId];
          const packageColor = getPackageColor(packageId);
          
          // Calculate ROI percentage
          const roiPercentage = contribution.amount > 0n 
            ? (Number(contribution.rewardClaimed) / Number(contribution.amount)) * 100 
            : 0;

          return (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: '#1e1e1e',
                  border: `2px solid ${packageColor}`,
                  borderRadius: 3,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent>
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: packageColor, mr: 2 }}>
                        {getPackageIcon(packageId)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                          {packageName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                          Investment #{index + 1}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label="Active"
                      sx={{
                        bgcolor: '#1e3a1e',
                        color: '#4caf50',
                        border: '1px solid #4caf50'
                      }}
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ mb: 2, borderColor: '#333' }} />

                  {/* Investment Details */}
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                        Investment Amount
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: packageColor }}>
                        {formatAmount(contribution.amount)} USDT
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                          Claimed Rewards
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                          {formatAmount(contribution.rewardClaimed)} USDT
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                          ROI
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          {roiPercentage.toFixed(2)}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" sx={{ color: '#b0b0b0' }} gutterBottom>
                        Last Claim Time
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        {formatDate(contribution.lastClaimTime)}
                      </Typography>
                    </Box>

                    {/* Progress Bar */}
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                          Progress to 300% ROI
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                          {Math.min(roiPercentage, 300).toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(roiPercentage / 3, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#333',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: packageColor,
                          }
                        }}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleClaimReward(index)}
                      disabled={isClaiming}
                      sx={{
                        backgroundColor: packageColor,
                        '&:hover': {
                          backgroundColor: packageColor,
                          opacity: 0.9,
                        }
                      }}
                    >
                      {isClaiming ? 'Claiming...' : 'Claim Rewards'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MyInvestments;
