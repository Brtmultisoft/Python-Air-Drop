import React from 'react';
import Logo from './common/Logo';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Tooltip,
  Container,
  useTheme,
  useMediaQuery,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
// Using MiningContext for wallet connections
import { useMining } from '../context/MiningContext';
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, bscTestnet } from '../client';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';

const Navbar: React.FC = () => {
  // Use MiningContext for wallet connections
  const {
    address,
    isConnected,
    connectWallet,
    disconnectWallet,
    isRegistered,
    isCorrectNetwork,
    switchToCorrectNetwork,
    isLoading
  } = useMining();

  const navigate = useNavigate();

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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  // Check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Use MiningContext for all wallet operations
  const currentWallet = {
    account: address,
    isConnected: isConnected,
    connectWallet: connectWallet,
    disconnectWallet: disconnectWallet,
    loading: isLoading,
    isRegistered: isRegistered,
    isCorrectNetwork: isCorrectNetwork,
    switchToCorrectNetwork: switchToCorrectNetwork
  };

  // Gradient background for AppBar - mining theme
  const appBarStyle = {
    background: 'linear-gradient(90deg, #1b5e20 0%, #2e7d32 100%)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  };

  // Get page title based on current section
  const getPageTitle = () => {
    return 'Python Air Drop';
  };



  return (
    <>
      <AppBar position="sticky" sx={appBarStyle} elevation={0}>
        <Container maxWidth="lg" sx={{ px: { xs: 0.25, sm: 0.5, md: 1 } }}>
          <Toolbar disableGutters sx={{ minHeight: { xs: 44, sm: 52 } }}>
            {/* Logo */}
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '0.9rem', sm: '1.1rem' }
              }}
            >
              <Logo
                size="navbar"
                sx={{ mr: { xs: 0.2, sm: 0.3 } }}
              />
              <Box component="span" sx={{
                ml: { xs: 0.2, sm: 0.3 },
                display: { xs: 'none', sm: 'block' }
              }}>
                {getPageTitle()}
              </Box>
              {isMobile && (
                <Box component="span" sx={{ ml: 0.2, fontSize: '0.8rem' }}>
                  Python Air Drop
                </Box>
              )}
            </Typography>

            {/* Navigation - Show only essential items on mobile */}
            {!isMobile && (
              <Box sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center'
              }}>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/"
                  sx={{
                    borderRadius: '20px',
                    px: 2,
                    backgroundColor: isActive('/') ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                  }}
                  startIcon={<HomeIcon />}
                >
                  Home
                </Button>

                {currentWallet.isConnected && (
                  <>
                    {!currentWallet.isRegistered && (
                      <Button
                        color="inherit"
                        component={RouterLink}
                        to="/register"
                        sx={{
                          borderRadius: '20px',
                          px: 2,
                          backgroundColor: isActive('/register') ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                        }}
                        startIcon={<PersonAddIcon />}
                      >
                        Register
                      </Button>
                    )}

                    {currentWallet.isRegistered && (
                      <Button
                        color="inherit"
                        component={RouterLink}
                        to="/dashboard"
                        sx={{
                          borderRadius: '20px',
                          px: 2,
                          backgroundColor: isActive('/dashboard') || isActive('/') ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                        }}
                        startIcon={<DashboardIcon />}
                      >
                        Mining Dashboard
                      </Button>
                    )}
                  </>
                )}
              </Box>
            )}

            {/* Wallet Connection */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.3, sm: 0.5, md: 1 },
              ml: { xs: 0.3, sm: 0.5, md: 1 }
            }}>
              {currentWallet.isConnected && (
                <>
                  {!currentWallet.isCorrectNetwork && (
                    <Tooltip title="Click to switch to the correct network">
                      <Chip
                        label={isMobile ? "Wrong Net" : "Wrong Network"}
                        color="error"
                        variant="outlined"
                        onClick={currentWallet.switchToCorrectNetwork}
                        clickable
                        sx={{
                          borderColor: 'white',
                          color: 'white',
                          '& .MuiChip-label': { px: { xs: 0.5, sm: 1 } },
                          backgroundColor: 'rgba(244, 67, 54, 0.2)',
                          fontSize: { xs: '0.7rem', sm: '0.875rem' }
                        }}
                      />
                    </Tooltip>
                  )}
                  {!isMobile && (
                    <Chip
                      avatar={<Avatar sx={{
                        bgcolor: currentWallet.isRegistered ? theme.palette.success.main : theme.palette.grey[500],
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem'
                      }}>
                        U
                      </Avatar>}
                      label={`${currentWallet.account?.substring(0, 6)}...${currentWallet.account?.substring(currentWallet.account.length - 4)}`}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '& .MuiChip-label': { px: 1 },
                        fontSize: '0.875rem'
                      }}
                      variant="outlined"
                    />
                  )}
                </>
              )}

              {currentWallet.isConnected ? (
                <Button
                  color="inherit"
                  variant="outlined"
                  onClick={async () => {
                    try {
                      await currentWallet.disconnectWallet();
                      // Force page reload to ensure clean state
                      window.location.reload();
                    } catch (error) {
                      console.error('Error disconnecting wallet:', error);
                      // Even if there's an error, try to reload to reset state
                      window.location.reload();
                    }
                  }}
                  disabled={currentWallet.loading}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                    px: { xs: 1, sm: 2 },
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    minWidth: 'auto'
                  }}
                  startIcon={!isMobile ? <LogoutIcon /> : undefined}
                >
                  {isMobile ? 'Exit' : currentWallet.loading ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              ) : (
                <Box sx={{
                  '& > div': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }
                }}>
                  <ConnectButton
                    client={client}
                    wallets={wallets}
                    chain={bscTestnet}
                    connectModal={{
                      size: isMobile ? "compact" : "wide",
                      title: "Connect to Python Air Drop",
                      showThirdwebBranding: false,
                    }}
                    switchButton={{
                      label: "Switch to BSC Testnet",
                    }}
                  />
                </Box>
              )}

            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Bottom Navigation - Mining Dashboard */}
      {isMobile && currentWallet.isConnected && currentWallet.isRegistered && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderTop: '1px solid #333'
          }}
          elevation={3}
        >
          <BottomNavigation
            value={location.pathname}
            sx={{
              bgcolor: '#1b5e20',
              '& .MuiBottomNavigationAction-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: '#ffffff'
                }
              }
            }}
          >
            <BottomNavigationAction
              label="Mining"
              value="/"
              icon={<DashboardIcon />}
              component={RouterLink}
              to="/"
            />
            <BottomNavigationAction
              label="Referrals"
              value="/referrals"
              icon={<PeopleIcon />}
              component={RouterLink}
              to="/"
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* Mobile Bottom Navigation - General/Registration */}
      {isMobile && (!currentWallet.isConnected || !currentWallet.isRegistered) && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderTop: '1px solid #333'
          }}
          elevation={3}
        >
          <BottomNavigation
            value={location.pathname}
            sx={{
              bgcolor: '#1b5e20',
              '& .MuiBottomNavigationAction-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: '#ffffff'
                }
              }
            }}
          >
            <BottomNavigationAction
              label="Home"
              value="/"
              icon={<HomeIcon />}
              component={RouterLink}
              to="/"
            />

            {currentWallet.isConnected && !currentWallet.isRegistered && (
              <BottomNavigationAction
                label="Register"
                value="/register"
                icon={<PersonAddIcon />}
                component={RouterLink}
                to="/register"
              />
            )}

            {!currentWallet.isConnected && (
              <BottomNavigationAction
                label="Connect"
                value="/connect"
                icon={<LogoutIcon />}
                onClick={() => {
                  // Trigger wallet connection
                  const connectButton = document.querySelector('[data-testid="connect-wallet-button"]');
                  if (connectButton) {
                    (connectButton as HTMLElement).click();
                  }
                }}
              />
            )}
          </BottomNavigation>
        </Paper>
      )}
    </>
  );
};

export default Navbar;
