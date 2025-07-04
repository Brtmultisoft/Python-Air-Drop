import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PoolTable from '../components/PoolTable';
import PoolsTableView from '../components/PoolsTableView';

const MultiPools: React.FC = () => {
  const { isConnected, isRegistered, connectWallet } = useWallet();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const poolParam = searchParams.get('pool');

  // Redirect to register page if not registered
  useEffect(() => {
    if (isConnected && !isRegistered) {
      console.log('User not registered, redirecting to register page');
      navigate('/register');
    }
  }, [isConnected, isRegistered, navigate]);

  // If a specific pool is selected, show the pool details
  if (poolParam) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          pt: 4,
          pb: 8,
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
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              fontWeight: 700,
              color: '#fdd835', // Yellow color
              mb: 1
            }}
          >
            Universal Bet
          </Typography>

          <Typography
            variant="h4"
            align="center"
            sx={{
              color: 'white',
              mb: 4,
              fontWeight: 600
            }}
          >
            Raffle Pool Details
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate('/pools')}
            sx={{
              mb: 3,
              bgcolor: 'rgba(0,0,0,0.3)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.5)'
              }
            }}
            startIcon={<Box>←</Box>}
          >
            Back to All Pools
          </Button>

          <Box sx={{
            bgcolor: 'rgba(0,0,0,0.2)',
            borderRadius: 8,
            p: 4,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            mb: 4
          }}>
            <PoolTable poolType={poolParam} />
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
  }

  if (!isConnected) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          pt: 4,
          pb: 8,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Background circles/bubbles */}
        <Box
          sx={{
            position: 'absolute',
            top: '5%',
            left: '5%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }}
        />

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              align="center"
              sx={{
                fontWeight: 700,
                color: '#fdd835', // Yellow color
                mb: 1
              }}
            >
             Python Air Drop
            </Typography>

            <Typography
              variant="h6"
              align="center"
              sx={{
                color: 'white',
                mb: 6,
                opacity: 0.9
              }}
            >
              A blockchain-powered gaming platform with referral rewards
            </Typography>
          </Box>

          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white'
            }}
          >
            <Box sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 215, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.2)'
            }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 50, color: '#fdd835' }} />
            </Box>
            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 600, color: '#fdd835' }}>
              Connect Your Wallet
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'rgba(255,255,255,0.9)' }}>
              Please connect your wallet to view and participate in the raffle pools.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={connectWallet}
                size="large"
                startIcon={<AccountBalanceWalletIcon />}
                sx={{
                  bgcolor: '#fdd835',
                  color: '#000',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderRadius: 50,
                  '&:hover': {
                    bgcolor: '#ffeb3b'
                  }
                }}
              >
                Connect Wallet
              </Button>
            </Box>
          </Paper>
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
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
        pt: 4,
        pb: 8,
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
          width: 60,
          height: 60,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 700,
            color: '#fdd835', // Yellow color
            mb: 1
          }}
        >
        Python Air Drop
        </Typography>

        <Typography
          variant="h6"
          align="center"
          sx={{
            color: 'white',
            mb: 6,
            opacity: 0.9
          }}
        >
          A blockchain-powered gaming platform with referral rewards
        </Typography>

        {/* Display the pool tables view */}
        <Box sx={{
          bgcolor: 'rgba(0,0,0,0.2)',
          borderRadius: 8,
          p: 4,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          mb: 4
        }}>
          <PoolsTableView />
        </Box>

        {/* Enter Game Lobby Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Box component="span" sx={{ mr: 1 }}>🎮</Box>}
            sx={{
              bgcolor: '#fdd835',
              color: '#000',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              borderRadius: 50,
              '&:hover': {
                bgcolor: '#ffeb3b'
              }
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Enter Game Lobby
          </Button>
        </Box>

        {/* How It Works Card */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: 'rgba(0,0,0,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
            p: 3
          }}
        >
          <Box sx={{
            p: 2,
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 2,
            mb: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#fdd835' }}>
              How It Works
            </Typography>
          </Box>

          <Box sx={{ p: 2 }}>
            <Typography variant="body1" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
              <strong style={{ color: '#fdd835' }}>1. Choose a Pool:</strong> Select from different pools with varying entry fees. Higher entry fee pools offer larger potential rewards.
            </Typography>

            <Typography variant="body1" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
              <strong style={{ color: '#fdd835' }}>2. Participate:</strong> Pay the entry fee in USDT to join your chosen pool. Each pool requires 10 unique participants.
            </Typography>

            <Typography variant="body1" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
              <strong style={{ color: '#fdd835' }}>3. Random Selection:</strong> When a pool is full, 3 participants are randomly selected as "losers". The remaining participants get their entry fee refunded.
            </Typography>

            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              <strong style={{ color: '#fdd835' }}>4. Rewards:</strong> Referrers of participants receive rewards based on their level in the referral chain. The more people you refer, the more rewards you can earn!
            </Typography>
          </Box>
        </Paper>
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

export default MultiPools;
