import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  Avatar,
  Fade,
  Zoom,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useThirdWebMLM } from '../context/ThirdWebMLMContext';
import ThirdWebConnectModal from '../components/ThirdWebConnectModal';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SecurityIcon from '@mui/icons-material/Security';
import DiamondIcon from '@mui/icons-material/Diamond';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import Star from '@mui/icons-material/Star';

const MLMHome: React.FC = () => {
  const { isConnected, isMLMRegistered, checkMLMRegistration, isCorrectNetwork } = useThirdWebMLM();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Animation states
  const [showCards, setShowCards] = useState<boolean>(false);
  const [showMLMTree, setShowMLMTree] = useState<boolean>(false);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  // Trigger animations after component mounts
  useEffect(() => {
    setTimeout(() => setShowMLMTree(true), 300);
    setTimeout(() => setShowCards(true), 800);
  }, []);

  // Handle successful wallet connection
  const handleWalletSuccess = async () => {
    try {
      // Check registration status after successful connection
      if (isConnected && isCorrectNetwork) {
        const isRegistered = await checkMLMRegistration();

        if (isRegistered) {
          navigate('/usd/mlm/dashboard');
        } else {
          navigate('/usd/mlm/register');
        }
      }
    } catch (error) {
      console.error('Error checking registration after wallet connection:', error);
    }
  };

  // Gradient background styles
  const gradientBg = {
    background: 'linear-gradient(135deg, #FFA000 0%, #FF8F00 100%)',
    color: 'white',
    padding: { xs: '2rem 1rem', md: '4rem 2rem' },
    borderRadius: '0 0 30% 30% / 10%',
    marginBottom: '2rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    position: 'relative',
    overflow: 'hidden'
  };

  // Card styles
  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s, box-shadow 0.3s',
    border: '2px solid transparent',
    '&:hover': {
      transform: 'translateY(-10px) scale(1.03)',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
      border: '2px solid rgba(27, 94, 32, 0.5)'
    }
  };

  return (
    <Box>
      {/* Hero Section - MLM Tree */}
      <Box sx={gradientBg}>
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(27,94,32,0.3) 0%, rgba(27,94,32,0) 70%)',
          boxShadow: '0 0 20px rgba(27, 94, 32, 0.5)',
          animation: 'pulse 3s infinite'
        }} />

        <Box sx={{
          position: 'absolute',
          bottom: 40,
          right: 40,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(27,94,32,0.2) 0%, rgba(27,94,32,0) 70%)',
          boxShadow: '0 0 30px rgba(27, 94, 32, 0.3)',
          animation: 'pulse 4s infinite'
        }} />

        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative' }}>
            <Zoom in={showMLMTree} timeout={1000}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                  color: '#1b5e20',
                  mb: 2
                }}
              >
                MLM Network Platform
              </Typography>
            </Zoom>

            <Fade in={showMLMTree} timeout={1500}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 400,
                  mb: 4,
                  opacity: 0.9,
                  maxWidth: '800px',
                  mx: 'auto',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                Build Your Network, Grow Your Income
              </Typography>
            </Fade>

            {/* MLM Tree Visualization */}
            <Fade in={showMLMTree} timeout={2000}>
              <Box sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 600,
                height: 300,
                mx: 'auto',
                mb: 5,
                borderRadius: 8,
                bgcolor: 'rgba(0, 0, 0, 0.2)',
                border: '3px solid rgba(27, 94, 32, 0.3)',
                boxShadow: 'inset 0 0 50px rgba(27, 94, 32, 0.1), 0 10px 30px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                {/* Top Level - You */}
                <Avatar sx={{
                  position: 'absolute',
                  top: '15%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 60,
                  height: 60,
                  bgcolor: '#1b5e20',
                  border: '3px solid #FFD700',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.7)',
                  zIndex: 3
                }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>YOU</Typography>
                </Avatar>

                {/* Level 1 */}
                <Avatar sx={{
                  position: 'absolute',
                  top: '45%',
                  left: '30%',
                  width: 50,
                  height: 50,
                  bgcolor: '#2e7d32',
                  border: '2px solid #FFD700',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)',
                  zIndex: 2
                }}>
                  <GroupsIcon sx={{ fontSize: 24 }} />
                </Avatar>

                <Avatar sx={{
                  position: 'absolute',
                  top: '45%',
                  right: '30%',
                  width: 50,
                  height: 50,
                  bgcolor: '#2e7d32',
                  border: '2px solid #FFD700',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)',
                  zIndex: 2
                }}>
                  <GroupsIcon sx={{ fontSize: 24 }} />
                </Avatar>

                {/* Level 2 */}
                <Avatar sx={{
                  position: 'absolute',
                  bottom: '15%',
                  left: '15%',
                  width: 40,
                  height: 40,
                  bgcolor: '#388e3c',
                  border: '2px solid #FFC107',
                  opacity: 0.8
                }}>
                  <GroupsIcon sx={{ fontSize: 20 }} />
                </Avatar>

                <Avatar sx={{
                  position: 'absolute',
                  bottom: '15%',
                  left: '35%',
                  width: 40,
                  height: 40,
                  bgcolor: '#388e3c',
                  border: '2px solid #FFC107',
                  opacity: 0.8
                }}>
                  <GroupsIcon sx={{ fontSize: 20 }} />
                </Avatar>

                <Avatar sx={{
                  position: 'absolute',
                  bottom: '15%',
                  right: '35%',
                  width: 40,
                  height: 40,
                  bgcolor: '#388e3c',
                  border: '2px solid #FFC107',
                  opacity: 0.8
                }}>
                  <GroupsIcon sx={{ fontSize: 20 }} />
                </Avatar>

                <Avatar sx={{
                  position: 'absolute',
                  bottom: '15%',
                  right: '15%',
                  width: 40,
                  height: 40,
                  bgcolor: '#388e3c',
                  border: '2px solid #FFC107',
                  opacity: 0.8
                }}>
                  <GroupsIcon sx={{ fontSize: 20 }} />
                </Avatar>

                {/* Connection Lines */}
                <Box sx={{
                  position: 'absolute',
                  top: '35%',
                  left: '45%',
                  width: '10%',
                  height: '2px',
                  bgcolor: '#FFD700',
                  transform: 'rotate(-30deg)',
                  transformOrigin: 'left center'
                }} />

                <Box sx={{
                  position: 'absolute',
                  top: '35%',
                  right: '45%',
                  width: '10%',
                  height: '2px',
                  bgcolor: '#FFD700',
                  transform: 'rotate(30deg)',
                  transformOrigin: 'right center'
                }} />

                {/* Center Icon */}
                <Box sx={{
                  position: 'absolute',
                  bottom: '35%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#FFD700',
                  zIndex: 1
                }}>
                  <AccountTreeIcon sx={{ fontSize: 40 }} />
                </Box>
              </Box>
            </Fade>

            <Fade in={true} timeout={2500}>
              <Box>
                {!isConnected ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={() => setShowWalletModal(true)}
                    startIcon={<AccountBalanceWalletIcon />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      backgroundColor: '#1b5e20',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 20px rgba(27, 94, 32, 0.5)',
                      '&:hover': {
                        backgroundColor: '#2e7d32',
                        boxShadow: '0 6px 25px rgba(27, 94, 32, 0.6)',
                      }
                    }}
                  >
                    Connect Wallet to Start
                  </Button>
                ) : !isMLMRegistered ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      onClick={() => navigate('/usd/mlm/register')}
                      startIcon={<PersonAddIcon />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        backgroundColor: '#1b5e20',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 20px rgba(27, 94, 32, 0.5)',
                        '&:hover': {
                          backgroundColor: '#2e7d32',
                          boxShadow: '0 6px 25px rgba(27, 94, 32, 0.6)',
                        }
                      }}
                    >
                      Join MLM Network
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/usd/mlm/dashboard')}
                      startIcon={<LoginIcon />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        borderColor: '#1b5e20',
                        color: '#1b5e20',
                        '&:hover': {
                          borderColor: '#2e7d32',
                          backgroundColor: 'rgba(27, 94, 32, 0.1)'
                        }
                      }}
                    >
                      Login
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={() => navigate('/usd/mlm/dashboard')}
                    startIcon={<AccountTreeIcon />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      backgroundColor: '#1b5e20',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 20px rgba(27, 94, 32, 0.5)',
                      '&:hover': {
                        backgroundColor: '#2e7d32',
                        boxShadow: '0 6px 25px rgba(27, 94, 32, 0.6)',
                      }
                    }}
                  >
                    Enter MLM Dashboard
                  </Button>
                )}
              </Box>
            </Fade>
          </Box>
        </Container>
      </Box>

      {/* MLM Features Section */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 8 }}>
          <Zoom in={showCards} timeout={1000}>
            <Typography
              variant="h4"
              component="h2"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 600,
                mb: 6,
                color: '#FFA000',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              MLM Features
            </Typography>
          </Zoom>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} flexWrap="wrap">
            {/* Feature 1 */}
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 16px)' } }}>
              <Zoom in={showCards} timeout={1000} style={{ transitionDelay: '200ms' }}>
                <Card sx={{
                  ...cardStyle,
                  background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 215, 0, 0.1) 100%)',
                  border: '2px solid rgba(255, 193, 7, 0.2)',
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                      color: '#FFA000'
                    }}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        border: '2px solid rgba(255, 193, 7, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 70,
                        height: 70,
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                      }}>
                        <AccountTreeIcon sx={{ fontSize: 40 }} />
                      </Box>
                    </Box>
                    <Typography variant="h5" component="h3" align="center" gutterBottom>
                      Network Building
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center">
                      Build your downline network by inviting friends and family. Create multiple levels of referrals for maximum earning potential.
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>

            {/* Feature 2 */}
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 16px)' } }}>
              <Zoom in={showCards} timeout={1000} style={{ transitionDelay: '400ms' }}>
                <Card sx={{
                  ...cardStyle,
                  background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.05) 0%, rgba(46, 125, 50, 0.1) 100%)',
                  border: '2px solid rgba(27, 94, 32, 0.2)',
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                      color: '#1b5e20'
                    }}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(27, 94, 32, 0.1)',
                        border: '2px solid rgba(27, 94, 32, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 70,
                        height: 70,
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                      }}>
                        <MonetizationOnIcon sx={{ fontSize: 40 }} />
                      </Box>
                    </Box>
                    <Typography variant="h5" component="h3" align="center" gutterBottom>
                      Passive Income
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center">
                      Earn commissions from your network's activities. Generate passive income through multiple levels of referral rewards.
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>

            {/* Feature 3 */}
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 16px)' } }}>
              <Zoom in={showCards} timeout={1000} style={{ transitionDelay: '600ms' }}>
                <Card sx={{
                  ...cardStyle,
                  background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.05) 0%, rgba(63, 81, 181, 0.1) 100%)',
                  border: '2px solid rgba(103, 58, 183, 0.2)',
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                      color: '#673AB7'
                    }}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(103, 58, 183, 0.1)',
                        border: '2px solid rgba(103, 58, 183, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 70,
                        height: 70,
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                      }}>
                        <TrendingUpIcon sx={{ fontSize: 40 }} />
                      </Box>
                    </Box>
                    <Typography variant="h5" component="h3" align="center" gutterBottom>
                      Level Progression
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center">
                      Advance through Bronze, Silver, Gold, and Diamond levels. Higher levels unlock better commission rates and bonuses.
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>

            {/* Feature 4 */}
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 16px)' } }}>
              <Zoom in={showCards} timeout={1000} style={{ transitionDelay: '800ms' }}>
                <Card sx={{
                  ...cardStyle,
                  background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(3, 169, 244, 0.1) 100%)',
                  border: '2px solid rgba(0, 188, 212, 0.2)',
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                      color: '#00BCD4'
                    }}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 188, 212, 0.1)',
                        border: '2px solid rgba(0, 188, 212, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 70,
                        height: 70,
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                      }}>
                        <SecurityIcon sx={{ fontSize: 40 }} />
                      </Box>
                    </Box>
                    <Typography variant="h5" component="h3" align="center" gutterBottom>
                      Blockchain Security
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center">
                      All transactions and commissions are recorded on the blockchain, ensuring transparency and security for all network members.
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>
          </Stack>
        </Box>

        {/* MLM CTA Section */}
        <Paper
          elevation={5}
          sx={{
            p: { xs: 3, md: 5 },
            mt: 4,
            mb: 8,
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 215, 0, 0.1) 100%)',
            border: '2px solid rgba(27, 94, 32, 0.3)',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative elements */}
          <Box sx={{
            position: 'absolute',
            bottom: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(27,94,32,0.1) 0%, rgba(27,94,32,0) 70%)',
            boxShadow: '0 0 30px rgba(27, 94, 32, 0.2)',
          }} />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
            <Box sx={{ flex: { xs: '1 1 100%', md: '2 1 0' } }}>
              <Fade in={true} timeout={1000}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#FFA000', fontWeight: 600 }}>
                  Ready to Build Your Network?
                </Typography>
              </Fade>
              <Fade in={true} timeout={1500}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Join Python Air Drop's MLM platform today and start building your passive income stream. Connect your wallet, register, and begin inviting your network!
                </Typography>
              </Fade>
              <Fade in={true} timeout={2000}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 193, 7, 0.2)'
                }}>
                  <EmojiEventsIcon sx={{ color: '#FFA000', mr: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    The more you build your network, the more passive income you can generate!
                  </Typography>
                </Box>
              </Fade>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 0' }, textAlign: { xs: 'center', md: 'right' } }}>
              <Zoom in={true} timeout={2500}>
                <Box>
                  {!isConnected ? (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => setShowWalletModal(true)}
                      startIcon={<AccountBalanceWalletIcon />}
                      fullWidth={isMobile}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        backgroundColor: '#FFA000',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 20px rgba(255, 160, 0, 0.3)',
                        '&:hover': {
                          backgroundColor: '#FF8F00',
                          boxShadow: '0 6px 25px rgba(255, 160, 0, 0.4)',
                        }
                      }}
                    >
                      Connect Wallet to Start
                    </Button>
                  ) : !isMLMRegistered ? (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'center', md: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/usd/mlm/register')}
                        startIcon={<PersonAddIcon />}
                        fullWidth={isMobile}
                        sx={{
                          py: 1.5,
                          px: 4,
                          fontSize: '1.1rem',
                          backgroundColor: '#FFA000',
                          color: 'white',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 20px rgba(255, 160, 0, 0.3)',
                          '&:hover': {
                            backgroundColor: '#FF8F00',
                            boxShadow: '0 6px 25px rgba(255, 160, 0, 0.4)',
                          }
                        }}
                      >
                        Join MLM Network
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/usd/mlm/dashboard')}
                        startIcon={<LoginIcon />}
                        fullWidth={isMobile}
                        sx={{
                          py: 1.5,
                          px: 4,
                          fontSize: '1.1rem',
                          borderColor: '#FFA000',
                          color: '#FFA000',
                          '&:hover': {
                            borderColor: '#FF8F00',
                            backgroundColor: 'rgba(255, 160, 0, 0.1)'
                          }
                        }}
                      >
                        Login
                      </Button>
                    </Stack>
                  ) : (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'center', md: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/usd/mlm/dashboard')}
                        startIcon={<AccountTreeIcon />}
                        fullWidth={isMobile}
                        sx={{
                          py: 1.5,
                          px: 4,
                          fontSize: '1.1rem',
                          backgroundColor: '#FFA000',
                          color: 'white',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 20px rgba(255, 160, 0, 0.3)',
                          '&:hover': {
                            backgroundColor: '#FF8F00',
                            boxShadow: '0 6px 25px rgba(255, 160, 0, 0.4)',
                          }
                        }}
                      >
                        MLM Dashboard
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/gaming')}
                        startIcon={<SportsEsportsIcon />}
                        fullWidth={isMobile}
                        sx={{
                          py: 1.5,
                          px: 4,
                          fontSize: '1.1rem',
                          borderColor: '#FFA000',
                          color: '#FFA000',
                          '&:hover': {
                            borderColor: '#FF8F00',
                            backgroundColor: 'rgba(255, 160, 0, 0.1)'
                          }
                        }}
                      >
                        Try Gaming
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Zoom>
            </Box>
          </Stack>
        </Paper>
      </Container>

      {/* Investment Packages Preview Section */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 4 }}>
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 6,
            color: '#FFA000',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
        >
          Investment Packages
        </Typography>

        <Grid container spacing={4}>
          {/* Starter Package */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              border: '2px solid #FFA726',
              borderRadius: 3,
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(255, 167, 38, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Star sx={{ fontSize: 50, color: '#FFA726', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Starter Package
                </Typography>
                <Typography variant="h6" color="#FFA726" sx={{ mb: 2 }}>
                  10 - 900 USDT
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  1% daily returns
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  Perfect for beginners to start their investment journey
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#FFA726',
                    '&:hover': { backgroundColor: '#FF9800' }
                  }}
                  onClick={() => navigate('/usd/mlm/dashboard')}
                >
                  Start Investing
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Silver Package */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              border: '2px solid #C0C0C0',
              borderRadius: 3,
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(192, 192, 192, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 50, color: '#C0C0C0', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Silver Package
                </Typography>
                <Typography variant="h6" color="#C0C0C0" sx={{ mb: 2 }}>
                  1,000 - 4,000 USDT
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  1.2% daily returns
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  Enhanced returns for serious investors
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#C0C0C0',
                    color: 'black',
                    '&:hover': { backgroundColor: '#B0B0B0' }
                  }}
                  onClick={() => navigate('/usd/mlm/dashboard')}
                >
                  Invest Now
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Gold Package */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              border: '2px solid #FFD700',
              borderRadius: 3,
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(255, 215, 0, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <EmojiEventsIcon sx={{ fontSize: 50, color: '#FFD700', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Gold Package
                </Typography>
                <Typography variant="h6" color="#FFD700" sx={{ mb: 2 }}>
                  5,000 - 9,000 USDT
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  1.35% daily returns
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  Premium package for high-yield returns
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#FFD700',
                    color: 'black',
                    '&:hover': { backgroundColor: '#FFC107' }
                  }}
                  onClick={() => navigate('/usd/mlm/dashboard')}
                >
                  Go Premium
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Diamond Package */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              border: '2px solid #E1BEE7',
              borderRadius: 3,
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(225, 190, 231, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <DiamondIcon sx={{ fontSize: 50, color: '#E1BEE7', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Diamond Package
                </Typography>
                <Typography variant="h6" color="#E1BEE7" sx={{ mb: 2 }}>
                  10,000 - 50,000 USDT
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  1.5% daily returns
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  Elite package for maximum earnings
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#E1BEE7',
                    color: 'black',
                    '&:hover': { backgroundColor: '#D1AED7' }
                  }}
                  onClick={() => navigate('/usd/mlm/dashboard')}
                >
                  Elite Access
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ThirdWeb Wallet Modal */}
      {showWalletModal && (
        <ThirdWebConnectModal
          open={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onSuccess={handleWalletSuccess}
        />
      )}
    </Box>
  );
};

export default MLMHome;
