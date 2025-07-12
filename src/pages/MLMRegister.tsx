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
import { client, MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI, bscMainnet } from '../client';
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

  // Get referrer from URL params only - no default address
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferrerAddress(refParam);
    }
    // Remove default address logic - user must enter referral address manually
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
        chain: bscMainnet,
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

    // Validate that user has entered a referral address
    if (!referrerAddress || referrerAddress.trim() === '') {
      setRegistrationStatus('error');
      setErrorMessage('Please enter a valid referral address.');
      return;
    }

    // Basic validation for Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(referrerAddress.trim())) {
      setRegistrationStatus('error');
      setErrorMessage('Please enter a valid Ethereum address (0x followed by 40 hex characters).');
      return;
    }

    try {
      setIsRegistering(true);
      setRegistrationStatus('registering');
      setErrorMessage('');

      const success = await register(referrerAddress.trim());

      if (success) {
        setRegistrationStatus('success');
        
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
    <Container maxWidth="md" sx={{ py: 4, background: { xs: '#f5f5f5', md: 'transparent' }, minHeight: '100vh' }}>
      {/* Header */}
      <Fade in={true} timeout={1000}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
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
        <Paper elevation={3} sx={{ p: 4, mb: 4, background: '#ffffff', border: '1px solid #e0e0e0' }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, color: '#1976d2' }}>
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
                      {/* Referral Address Input - Required */}
                      <Box sx={{
                        mb: 3,
                        p: 2,
                        bgcolor: '#e3f2fd',
                        border: '1px solid #1976d2',
                        borderRadius: 2
                      }}>
                        <Typography variant="subtitle2" sx={{ color: '#1976d2', mb: 1, fontWeight: 'bold' }}>
                          🔗 Referral Address (Required)
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1976d2', mb: 2 }}>
                          You must enter a valid referral address to register. This cannot be left empty.
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <TextField
                          fullWidth
                          required
                          label="Referral Address *"
                          value={referrerAddress}
                          onChange={(e) => setReferrerAddress(e.target.value)}
                          placeholder="Enter the referral address (0x...)"
                          helperText={
                            referrerAddress && /^0x[a-fA-F0-9]{40}$/.test(referrerAddress.trim())
                              ? "✅ Valid referral address format"
                              : referrerAddress && !/^0x[a-fA-F0-9]{40}$/.test(referrerAddress.trim())
                              ? "❌ Invalid address format"
                              : "💡 Enter the address of the person who referred you"
                          }
                          error={referrerAddress && !/^0x[a-fA-F0-9]{40}$/.test(referrerAddress.trim())}
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
        <Card sx={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)', border: '1px solid #bbdefb' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
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
