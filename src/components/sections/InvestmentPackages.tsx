import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Diamond,
  Star,
  EmojiEvents,
  AccountBalanceWallet,
  Close,
  TrendingUp,
} from '@mui/icons-material';
import { useInvestment } from '../../context/InvestmentContext';

const InvestmentPackages: React.FC = () => {
  const {
    packages,
    investInPackage,
    isLoading,
    isInvesting,
    isApproving,
    approveUSDT,
    refreshUserData,
  } = useInvestment();

  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [showInvestDialog, setShowInvestDialog] = useState(false);

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
      case 0: return <Star sx={{ color: '#ff9800', fontSize: 40 }} />;
      case 1: return <AccountBalanceWallet sx={{ color: '#9e9e9e', fontSize: 40 }} />;
      case 2: return <EmojiEvents sx={{ color: '#ffc107', fontSize: 40 }} />;
      case 3: return <Diamond sx={{ color: '#9c27b0', fontSize: 40 }} />;
      default: return <Star sx={{ fontSize: 40 }} />;
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

  // Get package features
  const getPackageFeatures = (packageId: number) => {
    switch (packageId) {
      case 0:
        return [
          'Entry level package',
          '1% daily returns',
          'Basic referral rewards',
          'Minimum risk'
        ];
      case 1:
        return [
          'Silver tier benefits',
          '1.2% daily returns',
          'Enhanced referral rewards',
          'Medium investment range'
        ];
      case 2:
        return [
          'Gold tier privileges',
          '1.35% daily returns',
          'Premium referral rewards',
          'High investment potential'
        ];
      case 3:
        return [
          'Diamond elite status',
          '1.5% daily returns',
          'Maximum referral rewards',
          'Unlimited earning potential'
        ];
      default:
        return [];
    }
  };

  const handleInvest = async () => {
    if (selectedPackage === null || !investmentAmount) return;

    try {
      console.log('Starting investment:', { selectedPackage, investmentAmount });
      const success = await investInPackage(selectedPackage, investmentAmount);

      if (success) {
        setShowInvestDialog(false);
        setInvestmentAmount('');
        setSelectedPackage(null);

        // Additional refresh to ensure all components are updated
        console.log('🔄 Refreshing data after investment...');
        setTimeout(() => {
          refreshUserData();
        }, 2000); // Small delay to ensure transaction is processed
      }
    } catch (error) {
      console.error('Investment failed:', error);
    }
  };

  // Test function to check contract connectivity and package details
  const testContract = async () => {
    try {
      console.log('Testing contract connectivity...');
      console.log('Packages loaded:', packages);

      if (packages.length > 0) {
        console.log('✅ Contract is accessible - packages loaded successfully');

        // Show package details
        const packageDetails = packages.map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          minAmount: formatAmount(pkg.minAmount),
          maxAmount: formatAmount(pkg.maxAmount),
          rewardMultiplier: Number(pkg.rewardMultiplier),
        }));

        console.log('📦 Package Details:', packageDetails);

        const detailsText = packageDetails.map(pkg =>
          `${pkg.name}: ${pkg.minAmount} - ${pkg.maxAmount} USDT (${pkg.rewardMultiplier}% per minute)`
        ).join('\n');

        // Also show detailed calculation for $10 investment
        const tenDollarCalculation = packageDetails.map(pkg => {
          const rewardPerMinute = (10 * pkg.rewardMultiplier) / 10000;
          const rewardPerHour = rewardPerMinute * 60;
          const rewardPerDay = rewardPerHour * 24;
          return `${pkg.name}: $10 investment = ${rewardPerMinute.toFixed(4)} USDT/min, ${rewardPerHour.toFixed(2)} USDT/hour, ${rewardPerDay.toFixed(2)} USDT/day`;
        }).join('\n');

        alert(`✅ Contract is working! Package Details:\n\n${detailsText}\n\n📊 $10 Investment Examples:\n${tenDollarCalculation}`);
      } else {
        console.log('❌ No packages loaded');
        alert('❌ Contract issue - no packages loaded');
      }
    } catch (error) {
      console.error('Contract test failed:', error);
      alert('❌ Contract test failed: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>Loading Investment Packages...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
          💎 Investment Packages
        </Typography>
        <Button
          variant="outlined"
          onClick={testContract}
          sx={{
            borderColor: '#4caf50',
            color: '#4caf50',
            '&:hover': {
              borderColor: '#45a049',
              bgcolor: 'rgba(76, 175, 80, 0.1)'
            }
          }}
        >
          Test Contract
        </Button>
      </Box>

      <Typography variant="body1" sx={{ color: '#b0b0b0', mb: 4 }}>
        Choose from our carefully designed investment packages to start earning daily returns.
        Each package offers different reward rates and investment ranges.
      </Typography>

      <Grid container spacing={3}>
        {packages.map((pkg) => (
          <Grid item xs={12} sm={6} lg={3} key={pkg.id}>
            <Card
              sx={{
                height: '100%',
                background: '#1e1e1e',
                border: `2px solid ${getPackageColor(pkg.id)}`,
                borderRadius: 3,
                position: 'relative',
                overflow: 'visible',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px rgba(0, 0, 0, 0.4)`,
                  borderColor: getPackageColor(pkg.id),
                },
                transition: 'all 0.3s ease',
              }}
            >
              {/* Package Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: 20,
                  bgcolor: getPackageColor(pkg.id),
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              >
                {pkg.name}
              </Box>

              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" justifyContent="center" mb={2}>
                  {getPackageIcon(pkg.id)}
                </Box>
                
                <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                  {pkg.name} Package
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }} gutterBottom>
                    <strong>Investment Range:</strong>
                  </Typography>
                  <Typography variant="h6" color={getPackageColor(pkg.id)} gutterBottom>
                    {formatAmount(pkg.minAmount)} - {formatAmount(pkg.maxAmount)} USDT
                  </Typography>

                  {/* <Typography variant="body2" sx={{ color: '#b0b0b0' }} gutterBottom>
                    <strong>Daily Returns:</strong>
                  </Typography>
                  <Chip
                    label={`${formatAmount(pkg.rewardMultiplier)}% per minute`}
        49542ef5:10711:13)          mb: 2,
                      bgcolor: '#1e3a1e',
                      color: '#4caf50',
                      border: '1px solid #4caf50'
                    }}
                  /> */}
                </Box>

                <Divider sx={{ mb: 2, borderColor: '#333' }} />

                {/* Package Features */}
                <Box sx={{ mb: 3, flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }} gutterBottom>
                    <strong>Features:</strong>
                  </Typography>
                  {getPackageFeatures(pkg.id).map((feature, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', color: '#ffffff' }}>
                      <TrendingUp sx={{ fontSize: 16, mr: 1, color: getPackageColor(pkg.id) }} />
                      {feature}
                    </Typography>
                  ))}
                </Box>

                <Divider sx={{ mb: 2, borderColor: '#333' }} />

                <Typography variant="body2" sx={{ color: '#b0b0b0' }} gutterBottom>
                  <strong>Total Raised:</strong> {formatAmount(pkg.totalRaised)} USDT
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ 
                    mt: 2,
                    backgroundColor: getPackageColor(pkg.id),
                    color: 'white',
                    fontWeight: 'bold',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: getPackageColor(pkg.id),
                      opacity: 0.9,
                    }
                  }}
                  onClick={() => {
                    setSelectedPackage(pkg.id);
                    setShowInvestDialog(true);
                  }}
                  disabled={isInvesting}
                >
                  {isInvesting ? 'Processing...' : 'Invest Now'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Investment Dialog */}
      <Dialog
        open={showInvestDialog}
        onClose={() => setShowInvestDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1e1e1e',
            border: '1px solid #333',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', borderBottom: '1px solid #333' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ color: '#ffffff' }}>
              💎 Invest in {selectedPackage !== null ? packages[selectedPackage]?.name : ''} Package
            </Typography>
            <IconButton onClick={() => setShowInvestDialog(false)} sx={{ color: '#ffffff' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: '#1e1e1e' }}>
          {selectedPackage !== null && packages[selectedPackage] && (
            <Box>
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  bgcolor: '#1a3a3a',
                  color: '#4fc3f7',
                  border: '1px solid #4fc3f7',
                  '& .MuiAlert-icon': {
                    color: '#4fc3f7'
                  }
                }}
              >
                <Typography variant="body2">
                  You are about to invest in the <strong>{packages[selectedPackage].name}</strong> package.
                  This will generate daily returns based on your investment amount.
                </Typography>
              </Alert>

              <Box sx={{ mb: 2, p: 2, bgcolor: '#333', border: '1px solid #555', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }} gutterBottom>
                  <strong>📋 Package Details:</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: '#ffffff' }} gutterBottom>
                  Min Amount: {formatAmount(packages[selectedPackage]?.minAmount || 0n)} USDT
                </Typography>
                <Typography variant="body2" sx={{ color: '#ffffff' }} gutterBottom>
                  Max Amount: {formatAmount(packages[selectedPackage]?.maxAmount || 0n)} USDT
                </Typography>
                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                  Daily Returns: {formatAmount(packages[selectedPackage]?.rewardMultiplier || 0n)}% per minute
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Investment Amount (USDT)"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                helperText="Enter the amount you want to invest"
                inputProps={{
                  min: formatAmount(packages[selectedPackage]?.minAmount || 0n),
                  max: formatAmount(packages[selectedPackage]?.maxAmount || 0n),
                  step: "0.01"
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#333',
                    color: '#ffffff',
                    '& fieldset': {
                      borderColor: '#555',
                    },
                    '&:hover fieldset': {
                      borderColor: '#777',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: getPackageColor(selectedPackage),
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#b0b0b0',
                    '&.Mui-focused': {
                      color: getPackageColor(selectedPackage),
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#888',
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, bgcolor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button
            onClick={() => setShowInvestDialog(false)}
            size="large"
            sx={{
              color: '#b0b0b0',
              '&:hover': {
                bgcolor: '#333'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleInvest}
            disabled={isInvesting || isApproving || !investmentAmount}
            size="large"
            sx={{
              backgroundColor: selectedPackage !== null ? getPackageColor(selectedPackage) : '#ff9800',
              minWidth: 120,
              '&:hover': {
                backgroundColor: selectedPackage !== null ? getPackageColor(selectedPackage) : '#ff9800',
                opacity: 0.9,
              },
              '&:disabled': {
                backgroundColor: '#555',
                color: '#888'
              }
            }}
          >
            {isApproving ? 'Approving USDT...' : isInvesting ? 'Investing...' : 'Confirm Investment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvestmentPackages;
