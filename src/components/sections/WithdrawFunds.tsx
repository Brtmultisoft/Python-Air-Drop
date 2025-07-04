import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Alert,
  Divider,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  AccountBalanceWallet,
  MonetizationOn,
  Security,
  Close,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useInvestment } from '../../context/InvestmentContext';
import { useThirdWebMLM } from '../../context/ThirdWebMLMContext';

const WithdrawFunds: React.FC = () => {
  const { totalPendingRewards, userInvestmentData } = useInvestment();
  const { address } = useThirdWebMLM();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

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

  const availableBalance = formatAmount(totalPendingRewards);
  const withdrawAmountNum = parseFloat(withdrawAmount) || 0;
  const availableBalanceNum = parseFloat(availableBalance);

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmountNum <= 0) return;

    try {
      setIsWithdrawing(true);
      // Here you would implement the actual withdrawal logic
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowConfirmDialog(false);
      setWithdrawAmount('');
      // Show success message
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleMaxClick = () => {
    setWithdrawAmount(availableBalance);
  };

  const isValidAmount = withdrawAmountNum > 0 && withdrawAmountNum <= availableBalanceNum;
  const minWithdrawAmount = 1; // Minimum 1 USDT

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffff' }}>
        💰 Withdraw Funds
      </Typography>

      <Typography variant="body1" sx={{ color: '#b0b0b0', mb: 4 }}>
        Withdraw your earned rewards to your wallet. Minimum withdrawal amount is {minWithdrawAmount} USDT.
      </Typography>

      {/* Balance Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
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
                <Typography variant="h6" color="#ffffff">Available Balance</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                {availableBalance}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                USDT
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
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
                <AccountBalanceWallet sx={{ mr: 1, color: '#2196f3' }} />
                <Typography variant="h6" color="#ffffff">Total Earned</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                {userInvestmentData ? formatAmount(userInvestmentData.totalClaimedReward) : '0'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                USDT
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
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
                <Security sx={{ mr: 1, color: '#9c27b0' }} />
                <Typography variant="h6" color="#ffffff">Referral Income</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                {userInvestmentData ? formatAmount(userInvestmentData.totalLevelIncome) : '0'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                USDT
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Withdrawal Form */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ background: '#1e1e1e', border: '1px solid #333' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                💸 Withdrawal Request
              </Typography>
              <Divider sx={{ mb: 3, borderColor: '#333' }} />

              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }} gutterBottom>
                    💵 Withdrawal Amount (USDT)
                  </Typography>
                  <Box display="flex" gap={2}>
                    <TextField
                      fullWidth
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount to withdraw"
                      inputProps={{
                        min: minWithdrawAmount,
                        max: availableBalance,
                        step: "0.01"
                      }}
                      error={withdrawAmount !== '' && !isValidAmount}
                      helperText={
                        withdrawAmount !== '' && !isValidAmount
                          ? withdrawAmountNum > availableBalanceNum
                            ? 'Amount exceeds available balance'
                            : 'Amount must be greater than 0'
                          : `Available: ${availableBalance} USDT`
                      }
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
                            borderColor: '#4caf50',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#b0b0b0',
                          '&.Mui-focused': {
                            color: '#4caf50',
                          },
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#888',
                        },
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleMaxClick}
                      sx={{
                        minWidth: 80,
                        borderColor: '#4caf50',
                        color: '#4caf50',
                        '&:hover': {
                          borderColor: '#45a049',
                          bgcolor: 'rgba(76, 175, 80, 0.1)'
                        }
                      }}
                    >
                      MAX
                    </Button>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }} gutterBottom>
                    📍 Withdrawal Address
                  </Typography>
                  <TextField
                    fullWidth
                    value={address || ''}
                    disabled
                    helperText="Funds will be sent to your connected wallet address"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#2d2d2d',
                        color: '#ffffff',
                        '& fieldset': {
                          borderColor: '#555',
                        },
                      },
                      '& .MuiFormHelperText-root': {
                        color: '#888',
                      },
                    }}
                  />
                </Box>

                {/* Withdrawal Info */}
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Withdrawal Information:</strong>
                    <br />• Minimum withdrawal: {minWithdrawAmount} USDT
                    <br />• Processing time: Instant
                    <br />• Network: BSC Testnet
                    <br />• No withdrawal fees
                  </Typography>
                </Alert>

                {withdrawAmountNum >= minWithdrawAmount && isValidAmount && (
                  <Alert severity="success">
                    <Typography variant="body2">
                      <strong>Withdrawal Summary:</strong>
                      <br />• Amount: {withdrawAmount} USDT
                      <br />• You will receive: {withdrawAmount} USDT
                      <br />• Remaining balance: {(availableBalanceNum - withdrawAmountNum).toFixed(4)} USDT
                    </Typography>
                  </Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={!isValidAmount || withdrawAmountNum < minWithdrawAmount || availableBalanceNum === 0}
                  sx={{
                    backgroundColor: '#FF9800',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#F57C00',
                    }
                  }}
                >
                  {availableBalanceNum === 0 ? 'No Funds Available' : 'Request Withdrawal'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Withdrawal Guidelines
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box display="flex" alignItems="flex-start">
                  <CheckCircle sx={{ color: 'success.main', mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Instant Processing
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Withdrawals are processed immediately
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="flex-start">
                  <CheckCircle sx={{ color: 'success.main', mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      No Fees
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Zero withdrawal fees on all transactions
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="flex-start">
                  <CheckCircle sx={{ color: 'success.main', mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Secure Transfer
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Direct transfer to your wallet
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="flex-start">
                  <Warning sx={{ color: 'warning.main', mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Minimum Amount
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Minimum withdrawal is {minWithdrawAmount} USDT
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }} gutterBottom>
                  Need Help?
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Contact support if you experience any issues with withdrawals.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Confirm Withdrawal</Typography>
            <IconButton onClick={() => setShowConfirmDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Please review your withdrawal details carefully. This action cannot be undone.
            </Typography>
          </Alert>

          <Box sx={{ p: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Withdrawal Details:</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              Amount: <strong>{withdrawAmount} USDT</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              To Address: <strong>{address ? `${address.slice(0, 10)}...${address.slice(-8)}` : ''}</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              Network: <strong>BSC Testnet</strong>
            </Typography>
            <Typography variant="body2">
              Processing Time: <strong>Instant</strong>
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowConfirmDialog(false)} size="large">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            size="large"
            sx={{
              backgroundColor: '#FF9800',
              minWidth: 120,
              '&:hover': {
                backgroundColor: '#F57C00',
              }
            }}
          >
            {isWithdrawing ? 'Processing...' : 'Confirm Withdrawal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WithdrawFunds;
