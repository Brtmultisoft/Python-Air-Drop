import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Fade,
  Zoom,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { OWNER_ADDRESS, DEFAULT_REFERRAL_ADDRESS } from '../config';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SecurityIcon from '@mui/icons-material/Security';
import { useMining } from '../context/MiningContext';
import { getContract, readContract } from "thirdweb";
import { client, MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI } from '../client';
import { approveUSDT, getUSDTAllowance } from '../services/contractService';
import { ethers } from 'ethers';

const MLMRegister: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    address,
    isConnected,
    connectWallet,
    isRegistered,
    register,
    isLoading,
    isCorrectNetwork,
    switchToCorrectNetwork,
    refreshData
  } = useMining();

  const [referrerAddress, setReferrerAddress] = useState<string>('');
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'registering' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeStep, setActiveStep] = useState(0);
  const [checkingRegistration, setCheckingRegistration] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Get referrer from URL params or use owner address as default
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferrerAddress(refParam);
    } else {
      // Always use owner address as default referrer when no referrer provided
      setReferrerAddress(OWNER_ADDRESS);
    }
  }, [searchParams]);

  // Immediate redirect if already registered
  useEffect(() => {
    if (isConnected && isCorrectNetwork && isRegistered) {
      console.log('User is already registered (from context), redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isConnected, isCorrectNetwork, isRegistered, navigate]);

  // Check registration status and redirect if already registered
  useEffect(() => {
    const checkAndRedirect = async () => {
      // Don't check if we're currently registering or if registration was just successful
      // Also don't check if user is already registered according to context
      if (isConnected && isCorrectNetwork && address && !isRegistering && !isRegistered && registrationStatus !== 'registering' && registrationStatus !== 'success') {
        try {
          setCheckingRegistration(true);
          // Check if user is already registered
          const registered = await checkRegistration();
          if (registered) {
            // User is already registered, redirect to dashboard
            console.log('User is already registered, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Error checking registration status:', error);
        } finally {
          setCheckingRegistration(false);
        }
      }
    };

    // Add a small delay to ensure wallet connection is fully established
    const timeoutId = setTimeout(checkAndRedirect, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [isConnected, isCorrectNetwork, address, navigate, registrationStatus, isRegistering, isRegistered]);

  // Helper function to check registration status
  const checkRegistration = async (): Promise<boolean> => {
    if (!address || !isCorrectNetwork) return false;

    try {
      const contract = getContract({
        client,
        address: MINING_CONTRACT_ADDRESS,
        abi: MINING_CONTRACT_ABI as any,
      }) as any;

      const registered = await readContract({
        contract,
        method: "checkIfRegistered",
        params: [address as `0x${string}`],
      });
      
      return registered;
    } catch (error) {
      console.error('Error checking registration:', error);
      return false;
    }
  };

  // Update stepper based on connection status
  useEffect(() => {
    if (!isConnected) {
      setActiveStep(0);
    } else if (!isCorrectNetwork) {
      setActiveStep(1);
    } else if (!isRegistered) {
      setActiveStep(2);
    } else {
      setActiveStep(3);
    }
  }, [isConnected, isCorrectNetwork, isRegistered]);

  const handleRegister = async () => {
    if (!isConnected || !isCorrectNetwork) return;

    try {
      setIsRegistering(true);
      setRegistrationStatus('registering');
      setErrorMessage('');

      const success = await register(referrerAddress || undefined);

      if (success) {
        setRegistrationStatus('success');
        // Approve unlimited USDT for mining contract after registration, only if not already approved
        try {
          if (address) {
            const currentAllowance = await getUSDTAllowance(address, MINING_CONTRACT_ADDRESS);
            if (currentAllowance.lt(ethers.constants.MaxUint256.div(2))) {
              await approveUSDT(MINING_CONTRACT_ADDRESS, ethers.constants.MaxUint256);
            } else {
              setErrorMessage('USDT is already approved for the mining contract.');
            }
          }
        } catch (approvalError) {
          setErrorMessage('Registration succeeded, but USDT approval failed. Please approve manually in your wallet.');
        }
        // Don't call refreshData here as it might interfere with navigation
        // The context will handle the state update
        console.log('Registration successful, redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      } else {
        setRegistrationStatus('error');
        setErrorMessage('Registration failed. Please try again.');
      }
    } catch (error: any) {
      setRegistrationStatus('error');
      setErrorMessage(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const steps = [
    {
      label: 'Connect Wallet',
      description: 'Connect your Web3 wallet to get started',
      completed: isConnected,
      action: () => connectWallet(),
      actionText: 'Connect Wallet',
      icon: <AccountBalanceWalletIcon />
    },
    {
      label: 'Switch Network',
      description: 'Switch to BSC Testnet for mining platform',
      completed: isCorrectNetwork,
      action: () => switchToCorrectNetwork(),
      actionText: 'Switch Network',
      icon: <SecurityIcon />
    },
    {
      label: 'Register for Mining',
      description: 'Complete your mining platform registration',
      completed: isRegistered,
      action: handleRegister,
      actionText: 'Register Now',
      icon: <PersonAddIcon />
    },
    {
      label: 'Welcome to Mining Platform',
      description: 'Registration complete! Welcome to the mining platform',
      completed: isRegistered,
      action: () => navigate('/dashboard'),
      actionText: 'Go to Dashboard',
      icon: <CheckCircleIcon />
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in={true} timeout={1000}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#1b5e20', fontWeight: 600 }}>
            Join Mining Platform
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Register to start mining and earning rewards
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

      {/* Referrer Info */}
      <Zoom in={true} timeout={1500}>
        <Alert severity="info" sx={{ mb: 4 }}>
          {referrerAddress ? (
            <>
              <Typography variant="body1">
                <strong>Referrer:</strong> {referrerAddress}
              </Typography>
              <Typography variant="body2">
                You're being referred by this address. They will earn referral rewards from your mining activity.
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body1">
                <strong>Owner Referrer:</strong> {OWNER_ADDRESS.slice(0, 12)}...{OWNER_ADDRESS.slice(-10)}
              </Typography>
              <Typography variant="body2">
                No referrer link provided. The platform owner address will be used as your referrer.
              </Typography>
            </>
          )}
        </Alert>
      </Zoom>

      {/* Registration Steps */}
      <Fade in={true} timeout={2000}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, color: '#1b5e20' }}>
            Registration Process
          </Typography>

          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  optional={
                    step.completed ? (
                      <Typography variant="caption" color="success.main">
                        Completed
                      </Typography>
                    ) : null
                  }
                  StepIconComponent={() => (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: step.completed ? '#4caf50' : activeStep === index ? '#FFA000' : '#e0e0e0',
                      color: 'white'
                    }}>
                      {step.icon}
                    </Box>
                  )}
                >
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>
                  
                  {index === 2 && (
                    <>
                      {/* Default Referral Address Display */}
                      <Box sx={{
                        mb: 3,
                        p: 2,
                        bgcolor: '#1a3a3a',
                        border: '1px solid #4fc3f7',
                        borderRadius: 2
                      }}>
                        <Typography variant="subtitle2" sx={{ color: '#4fc3f7', mb: 1, fontWeight: 'bold' }}>
                          🔗 Default USDStack Referrer
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#ffffff',
                            fontFamily: 'monospace',
                            bgcolor: '#2d2d2d',
                            p: 1,
                            borderRadius: 1,
                            wordBreak: 'break-all'
                          }}
                        >
                          {OWNER_ADDRESS}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#b0b0b0', mt: 1, display: 'block' }}>
                          Platform owner address will be used as your referrer if no custom referrer is provided below.
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <TextField
                          fullWidth
                          label="Custom Referrer Address (Optional)"
                          value={referrerAddress}
                          onChange={(e) => setReferrerAddress(e.target.value)}
                          placeholder="Enter custom referrer address or leave empty to use default"
                          helperText={
                            referrerAddress && referrerAddress !== OWNER_ADDRESS
                              ? "✅ Custom referrer address will be used"
                              : "💡 Leave empty to use the platform owner as your referrer"
                          }
                          disabled={registrationStatus === 'registering'}
                          InputProps={{
                            sx: {
                              fontFamily: 'monospace',
                              fontSize: '0.9rem',
                            }
                          }}
                        />
                      </Box>
                    </>
                  )}

                  {registrationStatus === 'error' && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errorMessage}
                    </Alert>
                  )}

                  {registrationStatus === 'success' && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Registration successful! Redirecting to dashboard...
                    </Alert>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={step.action}
                      disabled={
                        step.completed || 
                        (index === 1 && !isConnected) ||
                        (index === 2 && (!isConnected || !isCorrectNetwork)) ||
                        registrationStatus === 'registering'
                      }
                      startIcon={
                        registrationStatus === 'registering' && index === 2 ? 
                        <CircularProgress size={20} /> : 
                        step.icon
                      }
                      sx={{
                        backgroundColor: step.completed ? '#4caf50' : '#FFA000',
                        '&:hover': {
                          backgroundColor: step.completed ? '#45a049' : '#FF8F00'
                        }
                      }}
                    >
                      {step.completed ? 'Completed' : 
                       registrationStatus === 'registering' && index === 2 ? 'Registering...' : 
                       step.actionText}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Fade>

      {/* Platform Benefits */}
      <Fade in={true} timeout={2500}>
        <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 215, 0, 0.1) 100%)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#FFA000', fontWeight: 600 }}>
              Why Join Our Investment Platform?
            </Typography>
            
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountTreeIcon sx={{ color: '#1b5e20', mr: 2 }} />
                <Typography variant="body1">
                  <strong>Build Your Network:</strong> Invite friends and family to create multiple income streams
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ color: '#1b5e20', mr: 2 }} />
                <Typography variant="body1">
                  <strong>Earn Commissions:</strong> Get rewarded for every person in your downline network
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ color: '#1b5e20', mr: 2 }} />
                <Typography variant="body1">
                  <strong>Blockchain Security:</strong> All transactions are transparent and secure on the blockchain
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/mlm')}
                sx={{
                  borderColor: '#FFA000',
                  color: '#FFA000',
                  '&:hover': {
                    borderColor: '#FF8F00',
                    backgroundColor: 'rgba(255, 160, 0, 0.1)'
                  }
                }}
              >
                Learn More About Platform
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
};

export default MLMRegister;
