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
  Zoom
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CasinoIcon from '@mui/icons-material/Casino';
import DiamondIcon from '@mui/icons-material/Diamond';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SecurityIcon from '@mui/icons-material/Security';

const Home: React.FC = () => {
  const { isConnected, connectWallet, isRegistered } = useWallet();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Animation states
  const [showCards, setShowCards] = useState<boolean>(false);
  const [showGameTable, setShowGameTable] = useState<boolean>(false);

  // Trigger animations after component mounts
  useEffect(() => {
    // Stagger animations
    setTimeout(() => setShowGameTable(true), 300);
    setTimeout(() => setShowCards(true), 800);
  }, []);

  // Gradient background styles
  const gradientBg = {
    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
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
      border: '2px solid rgba(255, 215, 0, 0.5)'
    }
  };

  return (
    <Box>
      {/* Hero Section - Game Table */}
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
            <Zoom in={showGameTable} timeout={1000}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                  color: '#FFD700', // Gold color
                  mb: 2
                }}
              >
                Universal Bet
              </Typography>
            </Zoom>

            <Fade in={showGameTable} timeout={1500}>
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
                A blockchain-powered gaming platform with referral rewards
              </Typography>
            </Fade>

            {/* Game Table */}
            <Fade in={showGameTable} timeout={2000}>
              <Box sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 600,
                height: 300,
                mx: 'auto',
                mb: 5,
                borderRadius: 8,
                bgcolor: 'rgba(0, 0, 0, 0.2)',
                border: '3px solid rgba(255, 215, 0, 0.3)',
                boxShadow: 'inset 0 0 50px rgba(255, 215, 0, 0.1), 0 10px 30px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                {/* Center Table */}
                <Box sx={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: 'inset 0 0 30px rgba(255, 215, 0, 0.2)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  zIndex: 2
                }}>
                  <SportsEsportsIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                    Join the Game
                  </Typography>
                </Box>

                {/* Player Positions */}
                <Avatar sx={{
                  position: 'absolute',
                  bottom: '15%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.main',
                  border: '2px solid gold',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)',
                }}>
                  <PersonIcon />
                </Avatar>

                <Avatar sx={{
                  position: 'absolute',
                  bottom: '25%',
                  left: '20%',
                  width: 56,
                  height: 56,
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  opacity: 0.7
                }}>
                  <PersonIcon sx={{ opacity: 0.5 }} />
                </Avatar>

                <Avatar sx={{
                  position: 'absolute',
                  bottom: '25%',
                  right: '20%',
                  width: 56,
                  height: 56,
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  opacity: 0.7
                }}>
                  <PersonIcon sx={{ opacity: 0.5 }} />
                </Avatar>

                <Avatar sx={{
                  position: 'absolute',
                  top: '25%',
                  left: '20%',
                  width: 56,
                  height: 56,
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  opacity: 0.7
                }}>
                  <PersonIcon sx={{ opacity: 0.5 }} />
                </Avatar>

                <Avatar sx={{
                  position: 'absolute',
                  top: '25%',
                  right: '20%',
                  width: 56,
                  height: 56,
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  opacity: 0.7
                }}>
                  <PersonIcon sx={{ opacity: 0.5 }} />
                </Avatar>

                {/* Chips */}
                <Box sx={{
                  position: 'absolute',
                  bottom: '40%',
                  left: '30%',
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  bgcolor: '#FFD700',
                  border: '2px solid #FFA000',
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.7)',
                  zIndex: 1
                }} />

                <Box sx={{
                  position: 'absolute',
                  top: '40%',
                  right: '35%',
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  bgcolor: '#FFD700',
                  border: '2px solid #FFA000',
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.7)',
                  zIndex: 1
                }} />
              </Box>
            </Fade>

            <Fade in={true} timeout={2500}>
              <Box>
                {!isConnected ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={connectWallet}
                    startIcon={<AccountBalanceWalletIcon />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      backgroundColor: '#FFD700',
                      color: '#212121',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 20px rgba(255, 215, 0, 0.5)',
                      '&:hover': {
                        backgroundColor: '#FFC107',
                        boxShadow: '0 6px 25px rgba(255, 215, 0, 0.6)',
                      }
                    }}
                  >
                    Connect Wallet to Play
                  </Button>
                ) : !isRegistered ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      onClick={() => navigate('/usd/gaming/register')}
                      startIcon={<PersonAddIcon />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        backgroundColor: '#FFD700',
                        color: '#212121',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.5)',
                        '&:hover': {
                          backgroundColor: '#FFC107',
                          boxShadow: '0 6px 25px rgba(255, 215, 0, 0.6)',
                        }
                      }}
                    >
                      Register to Play
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/usd/gaming/dashboard')}
                      startIcon={<LoginIcon />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        borderColor: '#FFD700',
                        color: '#FFD700',
                        '&:hover': {
                          borderColor: '#FFC107',
                          backgroundColor: 'rgba(255, 215, 0, 0.1)'
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
                    onClick={() => navigate('/usd/gaming/dashboard')}
                    startIcon={<SportsEsportsIcon />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      backgroundColor: '#FFD700',
                      color: '#212121',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 20px rgba(255, 215, 0, 0.5)',
                      '&:hover': {
                        backgroundColor: '#FFC107',
                        boxShadow: '0 6px 25px rgba(255, 215, 0, 0.6)',
                      }
                    }}
                  >
                    Enter Game Lobby
                  </Button>
                )}
              </Box>
            </Fade>
          </Box>
        </Container>
      </Box>

      {/* Game Features Section */}
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
                color: '#1b5e20',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              Game Features
            </Typography>
          </Zoom>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} flexWrap="wrap">
            {/* Feature 1 */}
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 16px)' } }}>
              <Zoom in={showCards} timeout={1000} style={{ transitionDelay: '200ms' }}>
                <Card sx={{
                  ...cardStyle,
                  background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.05) 0%, rgba(46, 125, 50, 0.1) 100%)',
                  border: '2px solid rgba(46, 125, 50, 0.2)',
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
                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                        border: '2px solid rgba(46, 125, 50, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 70,
                        height: 70,
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                      }}>
                        <SportsEsportsIcon sx={{ fontSize: 40 }} />
                      </Box>
                    </Box>
                    <Typography variant="h5" component="h3" align="center" gutterBottom>
                      Game Mechanics
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center">
                      Join pools with up to 10 players. When full, 3 players are randomly selected as "losers" while others get refunded.
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
                        <DiamondIcon sx={{ fontSize: 40 }} />
                      </Box>
                    </Box>
                    <Typography variant="h5" component="h3" align="center" gutterBottom>
                      Blockchain Rewards
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center">
                      All transactions and rewards are handled on the blockchain, ensuring transparency and fairness for all players.
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
                        <GroupsIcon sx={{ fontSize: 40 }} />
                      </Box>
                    </Box>
                    <Typography variant="h5" component="h3" align="center" gutterBottom>
                      Referral System
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center">
                      Invite friends to join and earn rewards when they participate in pools. Build your network and maximize your earnings.
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
                      Secure Gaming
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center">
                      No database is used - all game data is stored securely on the blockchain, ensuring complete transparency and security.
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>
          </Stack>
        </Box>

        {/* Game CTA Section */}
        <Paper
          elevation={5}
          sx={{
            p: { xs: 3, md: 5 },
            mt: 4,
            mb: 8,
            background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.05) 0%, rgba(46, 125, 50, 0.1) 100%)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
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
            background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0) 70%)',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.2)',
          }} />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
            <Box sx={{ flex: { xs: '1 1 100%', md: '2 1 0' } }}>
              <Fade in={true} timeout={1000}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#1b5e20', fontWeight: 600 }}>
                  Ready to Join the Game?
                </Typography>
              </Fade>
              <Fade in={true} timeout={1500}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Join our blockchain-powered gaming platform today. Connect your wallet, register, and start playing to win rewards!
                </Typography>
              </Fade>
              <Fade in={true} timeout={2000}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 2,
                  border: '1px solid rgba(46, 125, 50, 0.2)'
                }}>
                  <EmojiEventsIcon sx={{ color: '#FFC107', mr: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Invite friends to earn more rewards! The more referrals you have, the more you can earn.
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
                      onClick={connectWallet}
                      startIcon={<AccountBalanceWalletIcon />}
                      fullWidth={isMobile}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        backgroundColor: '#1b5e20',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 20px rgba(27, 94, 32, 0.3)',
                        '&:hover': {
                          backgroundColor: '#2e7d32',
                          boxShadow: '0 6px 25px rgba(27, 94, 32, 0.4)',
                        }
                      }}
                    >
                      Connect Wallet to Play
                    </Button>
                  ) : !isRegistered ? (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'center', md: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/usd/gaming/register')}
                        startIcon={<PersonAddIcon />}
                        fullWidth={isMobile}
                        sx={{
                          py: 1.5,
                          px: 4,
                          fontSize: '1.1rem',
                          backgroundColor: '#1b5e20',
                          color: 'white',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 20px rgba(27, 94, 32, 0.3)',
                          '&:hover': {
                            backgroundColor: '#2e7d32',
                            boxShadow: '0 6px 25px rgba(27, 94, 32, 0.4)',
                          }
                        }}
                      >
                        Register to Play
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/usd/gaming/dashboard')}
                        startIcon={<LoginIcon />}
                        fullWidth={isMobile}
                        sx={{
                          py: 1.5,
                          px: 4,
                          fontSize: '1.1rem',
                          borderColor: '#1b5e20',
                          color: '#1b5e20',
                          '&:hover': {
                            borderColor: '#2e7d32',
                            backgroundColor: 'rgba(46, 125, 50, 0.1)'
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
                        onClick={() => navigate('/usd/gaming/dashboard')}
                        startIcon={<SportsEsportsIcon />}
                        fullWidth={isMobile}
                        sx={{
                          py: 1.5,
                          px: 4,
                          fontSize: '1.1rem',
                          backgroundColor: '#1b5e20',
                          color: 'white',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 20px rgba(27, 94, 32, 0.3)',
                          '&:hover': {
                            backgroundColor: '#2e7d32',
                            boxShadow: '0 6px 25px rgba(27, 94, 32, 0.4)',
                          }
                        }}
                      >
                        Game Dashboard
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/usd/gaming/pool')}
                        startIcon={<CasinoIcon />}
                        fullWidth={isMobile}
                        sx={{
                          py: 1.5,
                          px: 4,
                          fontSize: '1.1rem',
                          borderColor: '#1b5e20',
                          color: '#1b5e20',
                          '&:hover': {
                            borderColor: '#2e7d32',
                            backgroundColor: 'rgba(46, 125, 50, 0.1)'
                          }
                        }}
                      >
                        Join Pool
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Zoom>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
