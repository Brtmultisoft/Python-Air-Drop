import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Divider,
  useTheme,
  Avatar
} from '@mui/material';
import { useMining } from '../context/MiningContext';
import { getReferrerFromUrl } from '../utils/urlUtils';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';

const Register: React.FC = () => {
  const { isConnected, connectWallet, address, isRegistered, register, refreshData } = useMining();
  const navigate = useNavigate();
  const theme = useTheme();
  const [referrerAddress, setReferrerAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Steps for the registration process
  const steps = ['Connect Wallet', 'Enter Referrer', 'Complete Registration'];

  // Always show referral input, pre-fill if present in URL, but allow editing
  useEffect(() => {
    const referrerFromUrl = getReferrerFromUrl();
    if (referrerFromUrl && ethers.utils.isAddress(referrerFromUrl)) {
      setReferrerAddress(referrerFromUrl);
    } else {
      setReferrerAddress('');
    }
  }, []);

  // Update active step based on connection status
  useEffect(() => {
    if (!isConnected) {
      setActiveStep(0);
    } else if (!loading && !success) {
      setActiveStep(1);
    } else if (success) {
      setActiveStep(2);
    }
  }, [isConnected, loading, success]);

  // Redirect to dashboard if already registered
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (isConnected) {
        if (isRegistered) {
          // If already marked as registered, redirect immediately
          navigate('/dashboard');
        } else if (address) {
          // Double-check registration status to be sure
          await refreshData();
          if (isRegistered) {
            navigate('/dashboard');
          }
        }
      }
    };

    checkAndRedirect();
  }, [isConnected, isRegistered, account, navigate, refreshRegistrationStatus]);

  const handleRegister = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate referrer address
      let referrer = referrerAddress.trim();
      if (!referrer || !ethers.utils.isAddress(referrer)) {
        throw new Error('A valid referral address is required to register.');
      }

      // Call the register function
      await register(referrer);

      // Immediately refresh registration status
      const isNowRegistered = await refreshRegistrationStatus();
      console.log('Registration status after registration:', isNowRegistered);

      setSuccess(true);
      setActiveStep(2);

      // Redirect to dashboard immediately if registration status is updated
      if (isNowRegistered) {
        navigate('/dashboard');
      } else {
        // Fallback: redirect after a delay if the status wasn't updated immediately
        console.log('Registration status not updated immediately, using fallback redirect');
        setTimeout(() => {
          refreshRegistrationStatus().then(status => {
            if (status) {
              navigate('/dashboard');
            }
          });
        }, 2000);
      }

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ color: '#FFA000', fontWeight: 600 }}
        >
          Join Mining Platform
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Register to start mining and earning daily rewards
        </Typography>
      </Box>

      {/* Referrer Info */}
      <Alert severity={referrerAddress ? 'info' : 'warning'} sx={{ mb: 4 }}>
        <Typography variant="body1">
          <strong>Referral Address:</strong>
        </Typography>
        <TextField
          fullWidth
          label="Referral Address"
          variant="outlined"
          value={referrerAddress}
          onChange={e => setReferrerAddress(e.target.value)}
          margin="normal"
          placeholder="0x..."
          disabled={loading}
          sx={{ mt: 1, mb: 1 }}
          error={!!referrerAddress && !ethers.utils.isAddress(referrerAddress)}
          helperText={
            referrerAddress
              ? ethers.utils.isAddress(referrerAddress)
                ? 'Valid address'
                : 'Invalid address'
              : 'Enter the address of the person who referred you.'
          }
        />
        <Typography variant="body2">
          You must provide a valid referral address to register for mining.
        </Typography>
      </Alert>

      {/* Registration Steps */}
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step>
            <StepLabel icon={<AccountBalanceWalletIcon />}>
              Connect Wallet
            </StepLabel>
          </Step>
          <Step>
            <StepLabel icon={<LinkIcon />}>
              Referral Address
            </StepLabel>
          </Step>
          <Step>
            <StepLabel icon={<PersonAddIcon />}>
              Register
            </StepLabel>
          </Step>
          <Step>
            <StepLabel icon={<CheckCircleIcon />}>
              Complete
            </StepLabel>
          </Step>
        </Stepper>
      </Box>

      <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ p: 3, background: 'linear-gradient(135deg, #FFA000 0%, #FFD54F 100%)', color: 'white' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <PersonAddIcon sx={{ mr: 1 }} /> {success ? 'Registration Complete' : 'Register Now'}
          </Typography>
        </Box>
        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {!isConnected && (
            <Button variant="contained" color="primary" onClick={connectWallet} fullWidth sx={{ mb: 2 }}>
              Connect Wallet
            </Button>
          )}
          {isConnected && (
            <Button
              variant="contained"
              color="success"
              onClick={handleRegister}
              fullWidth
              disabled={loading || !referrerAddress || !ethers.utils.isAddress(referrerAddress)}
              sx={{ fontWeight: 600, py: 1.5, fontSize: '1.1rem' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Register Now'}
            </Button>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Registration successful! Redirecting to dashboard...
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;
