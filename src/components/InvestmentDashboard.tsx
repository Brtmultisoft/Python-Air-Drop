import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Diamond,
  Star,
  EmojiEvents,
  Refresh,
  Close,
} from '@mui/icons-material';
import { useInvestment } from '../context/InvestmentContext';
import { useThirdWebMLM } from '../context/ThirdWebMLMContext';

const InvestmentDashboard: React.FC = () => {
  const {
    userInvestmentData,
    userContributions,
    totalPendingRewards,
    packages,
    investInPackage,
    claimReward,
    refreshUserData,
    isLoading,
    isInvesting,
    isClaiming,
  } = useInvestment();

  const { isConnected, isCorrectNetwork } = useThirdWebMLM();

  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [showInvestDialog, setShowInvestDialog] = useState(false);

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
      case 0: return <Star sx={{ color: '#FFA726' }} />;
      case 1: return <AccountBalanceWallet sx={{ color: '#C0C0C0' }} />;
      case 2: return <EmojiEvents sx={{ color: '#FFD700' }} />;
      case 3: return <Diamond sx={{ color: '#E1BEE7' }} />;
      default: return <Star />;
    }
  };

  // Get package color
  const getPackageColor = (packageId: number) => {
    switch (packageId) {
      case 0: return '#FFA726';
      case 1: return '#C0C0C0';
      case 2: return '#FFD700';
      case 3: return '#E1BEE7';
      default: return '#FFA726';
    }
  };

  const handleInvest = async () => {
    if (selectedPackage === null || !investmentAmount) return;

    try {
      await investInPackage(selectedPackage, investmentAmount);
      setShowInvestDialog(false);
      setInvestmentAmount('');
      setSelectedPackage(null);
    } catch (error) {
      console.error('Investment failed:', error);
    }
  };

  const handleClaimReward = async (index: number) => {
    try {
      await claimReward(index);
    } catch (error) {
      console.error('Claim failed:', error);
    }
  };

  if (!isConnected || !isCorrectNetwork) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Alert severity="warning">
            Please connect your wallet and switch to BSC Testnet to view investment data.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* User Investment Summary */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              Investment Dashboard
            </Typography>
            <Tooltip title="Refresh Data">
              <IconButton onClick={refreshUserData} sx={{ color: 'white' }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
          
          {isLoading ? (
            <LinearProgress sx={{ mb: 2 }} />
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {userInvestmentData ? formatAmount(userInvestmentData.totalContribution) : '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Investment (USDT)
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {userInvestmentData ? formatAmount(userInvestmentData.totalClaimedReward) : '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Claimed (USDT)
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {formatAmount(totalPendingRewards)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Pending Rewards (USDT)
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {userInvestmentData ? formatAmount(userInvestmentData.totalLevelIncome) : '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Referral Income (USDT)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Investment Packages */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Investment Packages
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {packages.map((pkg) => (
          <Grid item xs={12} sm={6} md={3} key={pkg.id}>
            <Card 
              sx={{ 
                height: '100%',
                border: `2px solid ${getPackageColor(pkg.id)}`,
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {getPackageIcon(pkg.id)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                    {pkg.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Min: {formatAmount(pkg.minAmount)} USDT
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Max: {formatAmount(pkg.maxAmount)} USDT
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Reward: {formatAmount(pkg.rewardMultiplier)}% per minute
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Raised: {formatAmount(pkg.totalRaised)} USDT
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ 
                    mt: 2,
                    backgroundColor: getPackageColor(pkg.id),
                    '&:hover': {
                      backgroundColor: getPackageColor(pkg.id),
                      opacity: 0.8,
                    }
                  }}
                  onClick={() => {
                    setSelectedPackage(pkg.id);
                    setShowInvestDialog(true);
                  }}
                  disabled={isInvesting}
                >
                  Invest Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* User Contributions */}
      {userContributions.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            My Investments
          </Typography>
          
          <Grid container spacing={2}>
            {userContributions.map((contribution, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Chip 
                        label={packageNames[Number(contribution.planIndex)]}
                        color="primary"
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        #{index + 1}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {formatAmount(contribution.amount)} USDT
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Claimed: {formatAmount(contribution.rewardClaimed)} USDT
                    </Typography>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ mt: 1 }}
                      onClick={() => handleClaimReward(index)}
                      disabled={isClaiming}
                    >
                      Claim Rewards
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Investment Dialog */}
      <Dialog open={showInvestDialog} onClose={() => setShowInvestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Invest in {selectedPackage !== null ? packageNames[selectedPackage] : ''} Package
            <IconButton onClick={() => setShowInvestDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedPackage !== null && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Min Amount: {formatAmount(packages[selectedPackage]?.minAmount || 0n)} USDT
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Max Amount: {formatAmount(packages[selectedPackage]?.maxAmount || 0n)} USDT
              </Typography>
              
              <TextField
                fullWidth
                label="Investment Amount (USDT)"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                sx={{ mt: 2 }}
                helperText="Enter the amount you want to invest"
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowInvestDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleInvest}
            disabled={isInvesting || !investmentAmount}
          >
            {isInvesting ? 'Investing...' : 'Invest'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvestmentDashboard;
