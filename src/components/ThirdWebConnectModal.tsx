import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { ConnectButton, useActiveAccount, useConnect } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, bscMainnet } from '../client';
import { useThirdWebMLM } from '../context/ThirdWebMLMContext';
import { useSearchParams } from 'react-router-dom';

interface ThirdWebConnectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  showRegistration?: boolean;
}

const ThirdWebConnectModal: React.FC<ThirdWebConnectModalProps> = ({
  open,
  onClose,
  onSuccess,
  showRegistration = false
}) => {
  const account = useActiveAccount();
  const connect = useConnect();
  const {
    isConnected,
    isCorrectNetwork,
    switchToCorrectNetwork,
    isLoading,
    registerMLM,
    isMLMRegistered,
    checkMLMRegistration
  } = useThirdWebMLM();

  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [referrerAddress, setReferrerAddress] = useState<string>('');
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'registering' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get referrer from URL params
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferrerAddress(refParam);
    }
  }, [searchParams]);

  // Update stepper based on connection status
  useEffect(() => {
    if (!isConnected) {
      setActiveStep(0);
    } else if (!isCorrectNetwork) {
      setActiveStep(1);
    } else if (showRegistration && !isMLMRegistered) {
      setActiveStep(2);
    } else {
      setActiveStep(3);
      if (onSuccess && (isMLMRegistered || !showRegistration)) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    }
  }, [isConnected, isCorrectNetwork, isMLMRegistered, showRegistration, onSuccess, onClose]);

  const handleRegister = async () => {
    if (!isConnected || !isCorrectNetwork) return;

    try {
      setRegistrationStatus('registering');
      setErrorMessage('');

      const success = await registerMLM(referrerAddress || undefined);
      
      if (success) {
        setRegistrationStatus('success');
        // Recheck registration status
        await checkMLMRegistration();
      } else {
        setRegistrationStatus('error');
        setErrorMessage('Registration failed. Please try again.');
      }
    } catch (error: any) {
      setRegistrationStatus('error');
      setErrorMessage(error.message || 'Registration failed. Please try again.');
    }
  };

  // Wallet configurations for ThirdWeb (500+ wallet support)
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.trustwallet.app"),
    createWallet("com.coinbase.wallet"),
    createWallet("walletConnect"),
    createWallet("com.binance"),
    createWallet("com.okex.wallet"),
    createWallet("rainbow"),
    createWallet("zerion"),
    createWallet("phantom"),
    createWallet("brave"),
    createWallet("injected"), // fallback for generic injected wallets
  ];

  const steps = [
    {
      label: 'Connect Wallet',
      description: 'Connect your Web3 wallet using ThirdWeb',
      completed: isConnected,
      icon: <AccountBalanceWalletIcon />
    },
    {
      label: 'Switch Network',
      description: 'Switch to BSC Mainnet for MLM registration',
      completed: isCorrectNetwork,
      action: switchToCorrectNetwork,
      actionText: 'Switch Network',
      icon: <SecurityIcon />
    },
    {
      label: 'Register for MLM',
      description: 'Complete your MLM registration on the blockchain',
      completed: isMLMRegistered,
      action: handleRegister,
      actionText: 'Register Now',
      icon: <PersonAddIcon />
    },
    {
      label: 'Welcome to MLM',
      description: 'Registration complete! Welcome to the network',
      completed: isMLMRegistered,
      icon: <CheckCircleIcon />
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 215, 0, 0.1) 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h5" sx={{ color: '#FFA000', fontWeight: 600 }}>
          {showRegistration ? 'Join MLM Network' : 'Connect Wallet'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 3 }}>
        {/* Referrer Info */}
        {referrerAddress && showRegistration && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1">
              <strong>Referrer:</strong> {referrerAddress}
            </Typography>
            <Typography variant="body2">
              You're being referred by this address. They will earn commissions from your network activity.
            </Typography>
          </Alert>
        )}

        {/* ThirdWeb Connect Button */}
        {!isConnected && (
          <Card sx={{ mb: 3, textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#FFA000' }}>
                Connect Your Wallet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Choose from 500+ supported wallets
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <ConnectButton
                  client={client}
                  wallets={wallets}
                  chain={bscMainnet}
                  connectModal={{
                    size: isMobile ? "compact" : "wide",
                    title: "Connect to MLM Platform",
                    showThirdwebBranding: false,
                  }}
                  switchButton={{
                    label: "Switch to BSC Mainnet",
                  }}
                />
              </Box>

              <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>500+ Wallets Supported:</strong> MetaMask, Trust Wallet, Coinbase, Rainbow, Phantom, and many more through WalletConnect.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Registration Steps */}
        {showRegistration && (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#1b5e20' }}>
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
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Referrer Address (Optional)"
                            value={referrerAddress}
                            onChange={(e) => setReferrerAddress(e.target.value)}
                            placeholder="0x..."
                            helperText="Enter the wallet address of your referrer (optional)"
                            disabled={registrationStatus === 'registering'}
                          />
                        </Box>
                      )}

                      {registrationStatus === 'error' && index === 2 && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {errorMessage}
                        </Alert>
                      )}

                      {registrationStatus === 'success' && index === 2 && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Registration successful! Welcome to the MLM network!
                        </Alert>
                      )}

                      {step.action && (
                        <Box sx={{ mb: 2 }}>
                          <Button
                            variant="contained"
                            onClick={step.action}
                            disabled={
                              step.completed || 
                              (index === 1 && !isConnected) ||
                              (index === 2 && (!isConnected || !isCorrectNetwork)) ||
                              registrationStatus === 'registering' ||
                              isLoading
                            }
                            startIcon={
                              (registrationStatus === 'registering' && index === 2) || isLoading ? 
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
                             (registrationStatus === 'registering' && index === 2) ? 'Registering...' :
                             isLoading ? 'Processing...' :
                             step.actionText}
                          </Button>
                        </Box>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        )}

        {/* Contract Info */}
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Powered by ThirdWeb:</strong> Secure wallet connection with 500+ wallet support including MetaMask, Trust Wallet, Coinbase, and more.
          </Typography>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};

export default ThirdWebConnectModal;
