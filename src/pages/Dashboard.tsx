import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  CardActions,
  useTheme,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import { useWallet } from '../context/WalletContext';
import { getReferrer, getPoolCounter, getPoolUniqueUsers } from '../services/contractService';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import LinkIcon from '@mui/icons-material/Link';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CasinoIcon from '@mui/icons-material/Casino';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TwitterIcon from '@mui/icons-material/Twitter';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import ParticipationReport from '../components/ParticipationReport';
import DownlineReport from '../components/DownlineReport';

const Dashboard: React.FC = () => {
  const { account, isConnected, isRegistered, connectWallet } = useWallet();
  const navigate = useNavigate();
  const theme = useTheme();

  const [referrer, setReferrer] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);

  // Game-related states
  const [poolCounter, setPoolCounter] = useState<number>(0);
  const [uniqueUsers, setUniqueUsers] = useState<number>(0);
  const [loadingPool, setLoadingPool] = useState<boolean>(false);

  // Fetch pool data
  const fetchPoolData = async () => {
    if (!isConnected || !isRegistered) return;

    setLoadingPool(true);
    try {
      const counter = await getPoolCounter();
      setPoolCounter(counter.toNumber());

      if (counter.toNumber() > 0) {
        const users = await getPoolUniqueUsers(counter.toNumber());
        setUniqueUsers(users.toNumber());
      }
    } catch (err) {
      console.error('Error fetching pool data:', err);
    } finally {
      setLoadingPool(false);
    }
  };

  useEffect(() => {
    const fetchReferrer = async () => {
      if (!isConnected || !account || !isRegistered) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const referrerAddress = await getReferrer(account);

        // If referrer is zero address, set to null
        if (referrerAddress === ethers.constants.AddressZero) {
          setReferrer(null);
        } else {
          setReferrer(referrerAddress);
        }
      } catch (err: any) {
        console.error('Error fetching referrer:', err);
        setError('Failed to load referrer information');
      } finally {
        setLoading(false);
      }
    };

    fetchReferrer();
    fetchPoolData(); // Fetch pool data when component mounts
  }, [account, isConnected, isRegistered]);

  // Copy referral link to clipboard
  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?referrer=${account}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);

    // Reset copied state after 3 seconds
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Share on WhatsApp
  const shareOnWhatsApp = (link: string) => {
    const encodedLink = encodeURIComponent(link);
    const message = encodeURIComponent('Join Universal Bet and earn rewards! Use my referral link:');
    window.open(`https://wa.me/?text=${message}%20${encodedLink}`, '_blank');
  };

  // Share on Twitter
  const shareOnTwitter = (link: string) => {
    const encodedLink = encodeURIComponent(link);
    const message = encodeURIComponent('Join Universal Bet and earn rewards! Use my referral link:');
    window.open(`https://twitter.com/intent/tweet?text=${message}&url=${encodedLink}`, '_blank');
  };

  // Redirect to register page if not registered
  useEffect(() => {
    if (isConnected && !isRegistered) {
      navigate('/register');
    }
  }, [isConnected, isRegistered, navigate]);

  if (!isConnected) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            User Dashboard
          </Typography>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(98, 0, 234, 0.03) 0%, rgba(0, 188, 212, 0.03) 100%)',
              border: '1px solid rgba(98, 0, 234, 0.1)',
            }}
          >
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(98, 0, 234, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please connect your wallet to view your dashboard.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={connectWallet}
                size="large"
                startIcon={<AccountBalanceWalletIcon />}
              >
                Connect Wallet
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  // Function to render player positions on the game table
  const renderPlayerPositions = () => {
    // Create an array of 10 positions (max players in a pool)
    const positions = Array(10).fill(null);

    // Fill with actual players up to uniqueUsers
    return positions.map((_, index) => {
      const isActive = index < uniqueUsers;
      return (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            ...(index === 0 && { bottom: '10%', left: '50%', transform: 'translateX(-50%)' }), // Bottom center (you)
            ...(index === 1 && { bottom: '20%', left: '20%' }), // Bottom left
            ...(index === 2 && { bottom: '20%', right: '20%' }), // Bottom right
            ...(index === 3 && { top: '50%', left: '5%', transform: 'translateY(-50%)' }), // Left middle
            ...(index === 4 && { top: '50%', right: '5%', transform: 'translateY(-50%)' }), // Right middle
            ...(index === 5 && { top: '20%', left: '20%' }), // Top left
            ...(index === 6 && { top: '20%', right: '20%' }), // Top right
            ...(index === 7 && { top: '10%', left: '50%', transform: 'translateX(-50%)' }), // Top center
            ...(index === 8 && { top: '30%', left: '35%' }), // Middle left
            ...(index === 9 && { top: '30%', right: '35%' }), // Middle right
          }}
        >
          <Badge
            overlap="circular"
            badgeContent={index === 0 ? 'YOU' : ''}
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: '#fdd835',
                color: '#000',
                fontWeight: 'bold',
                fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' },
                padding: { xs: '0 4px', sm: '0 6px' }
              }
            }}
          >
            <Avatar
              sx={{
                width: { xs: 36, sm: 46, md: 56 },
                height: { xs: 36, sm: 46, md: 56 },
                bgcolor: isActive ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                border: isActive ? '2px solid #fdd835' : '2px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 0 15px rgba(255, 215, 0, 0.5)' : 'none',
                opacity: isActive ? 1 : 0.5,
                color: isActive ? '#fdd835' : 'rgba(255, 255, 255, 0.3)'
              }}
            >
              {isActive ? <PersonIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' } }} /> : <PersonIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' } }} />}
            </Avatar>
          </Badge>
        </Box>
      );
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
        pt: { xs: 2, sm: 3, md: 4 },
        pb: { xs: 6, sm: 7, md: 8 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background circles/bubbles */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          width: { xs: 40, sm: 60 },
          height: { xs: 40, sm: 60 },
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.1)',
          zIndex: 0,
          display: { xs: 'none', sm: 'block' }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: { xs: 60, sm: 100 },
          height: { xs: 60, sm: 100 },
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.1)',
          zIndex: 0,
          display: { xs: 'none', sm: 'block' }
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ my: { xs: 4, md: 6 } }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 700,
            color: '#fdd835', // Yellow color
            mb: 1,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3.75rem' }
          }}
        >
          Universal Bet
        </Typography>

        <Typography
          variant="h4"
          align="center"
          sx={{
            color: 'white',
            mb: { xs: 2, sm: 3, md: 4 },
            fontWeight: 600,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
          }}
        >
          Game Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Game Table Section */}
        <Paper
          elevation={5}
          sx={{
            position: 'relative',
            height: { xs: 300, sm: 350, md: 400 },
            mb: { xs: 3, sm: 4 },
            borderRadius: { xs: 3, sm: 4 },
            background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
            border: { xs: '8px solid', sm: '10px solid', md: '12px solid' },
            borderColor: '#337038 !important',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
            backgroundImage: `
              radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%),
              url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")
            `,
          }}
        >
          {/* Game Table Header */}
          <Box sx={{
            p: { xs: 1, sm: 2 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography
              variant="h6"
              sx={{
                color: '#fdd835',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
              }}
            >
              <CasinoIcon sx={{ mr: 1, color: '#fdd835', fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' } }} />
              Current Pool #{poolCounter} - {uniqueUsers}/10 Players
            </Typography>
            <Chip
              label={loadingPool ? "Refreshing..." : `${10 - uniqueUsers} seats available`}
              color={uniqueUsers >= 10 ? "error" : "success"}
              size="small"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                bgcolor: uniqueUsers >= 10 ? 'rgba(244, 67, 54, 0.7)' : 'rgba(76, 175, 80, 0.7)',
                '& .MuiChip-label': { px: { xs: 1, sm: 2 } },
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}
            />
          </Box>

          {/* Game Table Content */}
          <Box sx={{
            position: 'relative',
            height: 'calc(100% - 60px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* Center Table */}
            <Box sx={{
              width: { xs: 140, sm: 180, md: 200 },
              height: { xs: 140, sm: 180, md: 200 },
              borderRadius: '50%',
              bgcolor: 'rgba(0, 0, 0, 0.3)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.2)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column'
            }}>
              <SportsEsportsIcon sx={{ fontSize: { xs: 24, sm: 32, md: 40 }, color: '#fdd835', mb: 1 }} />
              <Typography
                variant="h6"
                sx={{
                  color: '#fdd835',
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                  textAlign: 'center',
                  px: 1
                }}
              >
                Universal Bet
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                }}
              >
                Pool #{poolCounter}
              </Typography>
            </Box>

            {/* Player Positions - Hide on very small screens */}
            <Box sx={{ display: { xs: 'none', sm: 'block' }, width: '100%', height: '100%', position: 'absolute' }}>
              {renderPlayerPositions()}
            </Box>

            {/* Action Buttons */}
            <Box sx={{
              position: 'absolute',
              bottom: { xs: 10, sm: 20 },
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 2
            }}>
              <Button
                variant="contained"
                size={window.innerWidth < 600 ? "medium" : "large"}
                onClick={() => navigate('/pools')}
                startIcon={<CasinoIcon />}
                sx={{
                  px: { xs: 2, sm: 3, md: 4 },
                  py: { xs: 1, sm: 1.25, md: 1.5 },
                  bgcolor: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: 50,
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.5)'
                  }
                }}
              >
                All Pools
              </Button>
            </Box>
          </Box>
        </Paper>

        <Stack spacing={{ xs: 3, sm: 4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, sm: 4 }}>
            {/* Account Information Card */}
            <Card
              elevation={3}
              sx={{
                flex: 1,
                borderRadius: { xs: 3, sm: 4 },
                overflow: 'hidden',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-5px)' },
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)'
                },
                bgcolor: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Box sx={{
                p: { xs: 2, sm: 3 },
                background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                color: 'white',
                borderBottom: '2px solid rgba(255, 215, 0, 0.3)'
              }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    color: '#fdd835',
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                  }}
                >
                  <AccountBalanceWalletIcon sx={{ mr: 1, color: '#fdd835', fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }} />
                  Player Information
                </Typography>
              </Box>

              <CardContent sx={{ p: { xs: 2, sm: 3 }, color: 'white' }}>
                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#fdd835',
                      fontWeight: 600,
                      mb: 1,
                      fontSize: { xs: '0.7rem', sm: '0.8rem' }
                    }}
                  >
                    YOUR WALLET ADDRESS
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 2,
                    wordBreak: 'break-all',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 215, 0, 0.2)',
                        color: '#fdd835',
                        mr: { xs: 0, sm: 2 },
                        border: '2px solid rgba(255, 215, 0, 0.3)',
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 }
                      }}
                    >
                      <PersonIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />
                    </Avatar>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                        color: 'rgba(255, 255, 255, 0.9)',
                        textAlign: { xs: 'center', sm: 'left' },
                        width: '100%'
                      }}
                    >
                      {account}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#fdd835',
                      fontWeight: 600,
                      mb: 1,
                      fontSize: { xs: '0.7rem', sm: '0.8rem' }
                    }}
                  >
                    PLAYER STATUS
                  </Typography>
                  <Chip
                    label={isRegistered ? "Active Player" : "Not Registered"}
                    color={isRegistered ? "success" : "error"}
                    icon={isRegistered ? <CheckCircleIcon sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} /> : undefined}
                    size="small"
                    sx={{
                      borderRadius: '20px',
                      px: 1,
                      fontWeight: 600,
                      bgcolor: isRegistered ? 'rgba(76, 175, 80, 0.7)' : 'rgba(244, 67, 54, 0.7)',
                      color: 'white',
                      fontSize: { xs: '0.7rem', sm: '0.8rem' }
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#fdd835',
                      fontWeight: 600,
                      mb: 1,
                      fontSize: { xs: '0.7rem', sm: '0.8rem' }
                    }}
                  >
                    YOUR REFERRER
                  </Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={16} sx={{ mr: 1, color: '#fdd835' }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: { xs: '0.7rem', sm: '0.8rem' }
                        }}
                      >
                        Loading referrer information...
                      </Typography>
                    </Box>
                  ) : referrer ? (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: { xs: 1.5, sm: 2 },
                      bgcolor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: 2,
                      wordBreak: 'break-all',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Avatar
                        sx={{
                          bgcolor: 'rgba(255, 215, 0, 0.2)',
                          color: '#fdd835',
                          mr: { xs: 0, sm: 2 },
                          border: '2px solid rgba(255, 215, 0, 0.3)',
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 }
                        }}
                      >
                        <PersonIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />
                      </Avatar>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                          color: 'rgba(255, 255, 255, 0.9)',
                          textAlign: { xs: 'center', sm: 'left' },
                          width: '100%'
                        }}
                      >
                        {referrer}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: 'italic',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: { xs: '0.7rem', sm: '0.8rem' }
                      }}
                    >
                      No referrer
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Referral Link Card */}
            <Card
              elevation={3}
              sx={{
                flex: 1,
                borderRadius: { xs: 3, sm: 4 },
                overflow: 'hidden',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-5px)' },
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)'
                },
                bgcolor: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Box sx={{
                p: { xs: 2, sm: 3 },
                background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                color: 'white',
                borderBottom: '2px solid rgba(255, 215, 0, 0.3)'
              }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    color: '#fdd835',
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                  }}
                >
                  <LinkIcon sx={{ mr: 1, color: '#fdd835', fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }} />
                  Invite Friends
                </Typography>
              </Box>

              <CardContent sx={{ p: { xs: 2, sm: 3 }, color: 'white' }}>
                <Typography
                  variant="body1"
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
                  }}
                >
                  Share this link with friends to invite them to the game. When they register using your link, you'll earn rewards when they participate in pools!
                </Typography>

                <Box sx={{
                  p: { xs: 2, sm: 3 },
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 2,
                  mb: { xs: 2, sm: 3 },
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#fdd835',
                      fontWeight: 600,
                      mb: 1,
                      fontSize: { xs: '0.7rem', sm: '0.8rem' }
                    }}
                  >
                    YOUR INVITATION LINK
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    wordBreak: 'break-all',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                        mr: { xs: 0, sm: 1 },
                        color: '#fdd835',
                        textAlign: { xs: 'center', sm: 'left' },
                        width: '100%'
                      }}
                    >
                      {`${window.location.origin}/register?referrer=${account}`}
                    </Typography>
                    <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                      <IconButton
                        onClick={copyReferralLink}
                        sx={{
                          color: copied ? '#4caf50' : '#fdd835',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)'
                          },
                          flexShrink: 0
                        }}
                        size="small"
                      >
                        {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: { xs: '0.7rem', sm: '0.8rem' }
                  }}
                >
                  The more friends you invite, the more rewards you can earn! Invite them to join the game now.
                </Typography>
              </CardContent>

              <CardActions sx={{ p: { xs: 2, sm: 3 }, pt: 0, flexDirection: 'column', gap: { xs: 1, sm: 2 } }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={copyReferralLink}
                  startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                  size={window.innerWidth < 600 ? "small" : "medium"}
                  sx={{
                    bgcolor: '#fdd835',
                    color: '#000',
                    fontWeight: 'bold',
                    borderRadius: 50,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    '&:hover': {
                      bgcolor: '#ffeb3b'
                    }
                  }}
                >
                  {copied ? "Copied to Clipboard!" : "Copy Invitation Link"}
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, sm: 2 }, width: '100%' }}>
                  <Button
                    variant="contained"
                    onClick={() => shareOnWhatsApp(`${window.location.origin}/register?referrer=${account}`)}
                    startIcon={<WhatsAppIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                    size={window.innerWidth < 600 ? "small" : "medium"}
                    sx={{
                      bgcolor: '#25D366',
                      color: 'white',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      '&:hover': {
                        bgcolor: '#128C7E'
                      },
                      flex: 1
                    }}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => shareOnTwitter(`${window.location.origin}/register?referrer=${account}`)}
                    startIcon={<TwitterIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                    size={window.innerWidth < 600 ? "small" : "medium"}
                    sx={{
                      bgcolor: '#1DA1F2',
                      color: 'white',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      '&:hover': {
                        bgcolor: '#0c85d0'
                      },
                      flex: 1
                    }}
                  >
                    Twitter
                  </Button>
                </Box>
              </CardActions>
            </Card>
          </Stack>

          {/* Tabs for Reports */}
          <Box sx={{ mb: { xs: 3, sm: 4 } }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                mb: { xs: 1.5, sm: 2 },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#fdd835',
                },
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                  minHeight: { xs: '48px', sm: '56px' },
                  padding: { xs: '6px 12px', sm: '12px 16px' },
                  '&.Mui-selected': {
                    color: '#fdd835',
                    fontWeight: 'bold',
                  },
                },
                bgcolor: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
              }}
            >
              <Tab
                label="Participation Report"
                icon={<AssessmentIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' } }} />}
                iconPosition="start"
              />
              <Tab
                label="Downline Report"
                icon={<PeopleIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' } }} />}
                iconPosition="start"
              />
            </Tabs>

            {tabValue === 0 && (
              <ParticipationReport />
            )}

            {tabValue === 1 && (
              <DownlineReport />
            )}
          </Box>

          {/* Game Rules Card */}
          <Card
            elevation={3}
            sx={{
              borderRadius: { xs: 3, sm: 4 },
              overflow: 'hidden',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-5px)' },
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)'
              },
              bgcolor: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Box sx={{
              p: { xs: 2, sm: 3 },
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              color: 'white',
              borderBottom: '2px solid rgba(255, 215, 0, 0.3)'
            }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  color: '#fdd835',
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                }}
              >
                <EmojiEventsIcon sx={{ mr: 1, color: '#fdd835', fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }} />
                Game Rules & Rewards
              </Typography>
            </Box>

            <CardContent sx={{ p: { xs: 2, sm: 3 }, color: 'white' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, sm: 3 }} alignItems={{ md: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: '#fdd835',
                      fontWeight: 600,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    How to Play and Win
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: { xs: 1, sm: 2 },
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
                    }}
                  >
                    Join our raffle pools to win rewards! Each pool requires 10 unique participants, and when the pool is full, 3 participants are randomly selected as "losers". The remaining participants get their entry fee refunded.
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
                    }}
                  >
                    As a referrer, you'll earn rewards when your referrals participate in pools. The more people you refer, the more rewards you can earn!
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 2 } }}>
                  <Button
                    variant="contained"
                    size={window.innerWidth < 600 ? "medium" : "large"}
                    onClick={() => navigate('/pool')}
                    startIcon={<CasinoIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                    sx={{
                      px: { xs: 2, sm: 3, md: 4 },
                      py: { xs: 1, sm: 1.25, md: 1.5 },
                      bgcolor: '#fdd835',
                      color: '#000',
                      fontWeight: 'bold',
                      borderRadius: 50,
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      '&:hover': {
                        bgcolor: '#ffeb3b'
                      }
                    }}
                  >
                    Join $1 Pool
                  </Button>
                  <Button
                    variant="outlined"
                    size={window.innerWidth < 600 ? "medium" : "large"}
                    onClick={() => navigate('/pools')}
                    startIcon={<CasinoIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                    endIcon={<ArrowForwardIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                    sx={{
                      px: { xs: 2, sm: 3, md: 4 },
                      py: { xs: 1, sm: 1.25, md: 1.5 },
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      borderRadius: 50,
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    View All Pools
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>

      {/* Bottom curved shape */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: 0,
          right: 0,
          height: 200,
          borderRadius: '50% 50% 0 0',
          bgcolor: 'white',
          zIndex: 0
        }}
      />
    </Box>
  );
};

export default Dashboard;
