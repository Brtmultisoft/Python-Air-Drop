import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { useActiveAccount } from "thirdweb/react";
import { client, bscMainnet } from '../client';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get active account from ThirdWeb
  const account = useActiveAccount();

  // Animation states
  const [showContent, setShowContent] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  // Trigger animations after component mounts
  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
  }, []);

  // Redirect to mining dashboard when wallet is connected
  useEffect(() => {
    if (account?.address) {
      setIsRedirecting(true);
      // Small delay to ensure connection is fully established
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [account?.address, navigate]);

  // ThirdWeb wallets for connect button (500+ wallet support)
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

  // Gradient background styles
  const gradientBg = {
    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
    color: 'white',
    padding: { xs: '3rem 1rem', md: '5rem 2rem' },
    borderRadius: '0 0 30% 30% / 10%',
    marginBottom: '3rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    position: 'relative',
    overflow: 'hidden'
  };

  // Card styles
  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: '2px solid transparent'
  };

  return (
    <Box>
      {/* Add CSS animation for spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      {/* Hero Section */}
      <Box sx={gradientBg}>
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%)',
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
          animation: 'pulse 3s infinite'
        }} />

        <Box sx={{
          position: 'absolute',
          bottom: 40,
          right: 40,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0) 70%)',
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
          animation: 'pulse 4s infinite'
        }} />

        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative' }}>
            <Zoom in={showContent} timeout={1000}>
              <Typography
                variant="h1"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '3rem', md: '4.5rem' },
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                  color: '#FFD700',
                  mb: 2
                }}
              >
                Python Air Drop
              </Typography>
            </Zoom>

            <Fade in={showContent} timeout={1500}>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 400,
                  mb: 6,
                  opacity: 0.9,
                  maxWidth: '900px',
                  mx: 'auto',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                Choose Your Path to Success
              </Typography>
            </Fade>

            <Fade in={showContent} timeout={2000}>
              <Typography
                variant="h6"
                component="p"
                sx={{
                  mb: 4,
                  opacity: 0.8,
                  maxWidth: '700px',
                  mx: 'auto',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                Experience blockchain-powered gaming or build your network with our MLM platform
              </Typography>
            </Fade>
          </Box>
        </Container>
      </Box>

      {/* Main Options Section */}
      <Container maxWidth="lg">
        <Zoom in={showContent} timeout={1000}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 600,
              mb: 6,
              color: '#1b5e20',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}
          >
            Choose Your Platform
          </Typography>
        </Zoom>

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          mb: 8
        }}>
          {/* Gaming Platform Card */}
          
          {/* MLM Platform Card */}
          <Box sx={{ flex: 1 }}>
            <Zoom in={showContent} timeout={1200} style={{ transitionDelay: '400ms' }}>
              <Card
                sx={{
                  ...cardStyle,
                  background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 215, 0, 0.1) 100%)',
                  border: '2px solid rgba(255, 193, 7, 0.2)',
                  minHeight: '400px'
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4, textAlign: 'center' }}>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 3,
                    color: '#FFA000'
                  }}>
                    <Box sx={{
                      p: 2,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      border: '2px solid rgba(255, 193, 7, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 100,
                      height: 100,
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                    }}>
                      <AccountTreeIcon sx={{ fontSize: 50 }} />
                    </Box>
                  </Box>
                  
                  <Typography variant="h4" component="h3" gutterBottom sx={{ color: '#FFA000', fontWeight: 600 }}>
                    Python Air Drop
                  </Typography>

                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Build your network and earn through our multi-level marketing platform. Create passive income streams through team building and referrals.
                  </Typography>

                  <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GroupsIcon sx={{ color: '#1b5e20', mr: 1 }} />
                      <Typography variant="body2">Team Building</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ color: '#1b5e20', mr: 1 }} />
                      <Typography variant="body2">Passive Income</Typography>
                    </Box>
                  </Stack>

                  {/* Direct ThirdWeb Connect Button or Redirect Message */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                    {isRedirecting ? (
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#4caf50', mb: 2, fontWeight: 'bold' }}>
                          ✅ Wallet Connected!
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                          Redirecting to MLM Dashboard...
                        </Typography>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          border: '4px solid #f3f3f3',
                          borderTop: '4px solid #FFA000',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          margin: '0 auto'
                        }} />
                      </Box>
                    ) : (
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
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
