import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Modal,
  Button,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { getParticipatedPools } from '../services/reportService';
import { getPoolCounter, getAppropriateContract } from '../services/contractService';
import CasinoIcon from '@mui/icons-material/Casino';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CloseIcon from '@mui/icons-material/Close';

// Styled components for the gaming interface
const GameCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 0 20px rgba(76, 175, 80, 0.2)',
  background: 'linear-gradient(135deg, #0a1f0a 0%, #0d260d 100%)',
  overflow: 'visible',
  position: 'relative',
  marginBottom: theme.spacing(4),
  border: '2px solid #4caf50',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2), 0 0 30px rgba(76, 175, 80, 0.3)',
  },
  '@keyframes glow': {
    '0%': {
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 0 20px rgba(76, 175, 80, 0.2)',
    },
    '50%': {
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 0 40px rgba(76, 175, 80, 0.4)',
    },
    '100%': {
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 0 20px rgba(76, 175, 80, 0.2)',
    },
  },
  animation: 'glow 3s infinite',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z\' fill=\'%234caf50\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    backgroundSize: '150px',
    opacity: 0.5,
    zIndex: 0,
    borderRadius: '14px',
  }
}));

const GameCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'linear-gradient(135deg, rgba(10, 31, 10, 0.95) 0%, rgba(13, 38, 13, 0.95) 100%)',
  position: 'relative',
  zIndex: 1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(76, 175, 80, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
    zIndex: -1,
  }
}));

const CardHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #1b5e20 0%, #2e7d32 100%)',
  padding: theme.spacing(4, 3),
  borderRadius: '14px 14px 0 0',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    backgroundSize: '180px',
    opacity: 0.5,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #ffeb3b, #ffc107, #ffeb3b)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s infinite linear',
  },
  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '0% 0%',
    },
    '100%': {
      backgroundPosition: '200% 0%',
    },
  },
  // Add a subtle noise texture
  backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c8TV1mAAAAG3RSTlNAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAvEOwtAAAFVklEQVR4XpWWB67c2BUFb3g557T/hRo9/WUMZHlgr4Bg8Z4qQgQJlHI4A8SzFVrapvmTF9O7dmYRFZ60YiBhJRCgh1FYhiLAmdvX0CzTOpNE77ME0Zty/nWWzchDtiqrmQDeuv3powQ5ta2eN0FY0InkqDD73lT9c9lEzwUNqgFHs9VQce3TVClFCQrSTfOiYkVJQBmpbq2L6iZavPnAPcoU0dSw0SUTqz/GtrGuXfbyyBniKykOWQWGqwwMA7QiYAxi+IlPdqo+hYHnUt5ZPfnsHJyNiDtnpJyayNBkF6cWoYGAMY92U2hXHF/C1M8uP/ZtYdiuj26UdAdQQSXQErwSOMzt/XWRWAz5GuSBIkwG1H3FabJ2OsUOUhGC6tK4EMtJO0ttC6IBD3kM0ve0tJwMdSfjZo+EEISaeTr9P3wYrGjXqyC1krcKdhMpxEnt5JetoulscpyzhXN5FRpuPHvbeQaKxFAEB6EN+cYN6xD7RYGpXpNndMmZgM5Dcs3YSNFDHUo2LGfZuukSWyUYirJAdYbF3MfqEKmjM+I2EfhA94iG3L7uKrR+GdWD73ydlIB+6hgref1QTlmgmbM3/LeX5GI1Ux1RWpgxpLuZ2+I+IjzZ8wqE4nilvQdkUdfhzI5QDWy+kw5Wgg2pGpeEVeCCA7b85BO3F9DzxB3cdqvBzWcmzbyMiqhzuYqtHRVG2y4x+KOlnyqla8AoWWpuBoYRxzXrfKuILl6SfiWCbjxoZJUaCBj1CjH7GIaDbc9kqBY3W/Rgjda1iqQcOJu2WW+76pZC9QG7M00dffe9hNnseupFL53r8F7YHSwJWUKP2q+k7RdsxyOB11n0xtOvnW4irMMFNV4H0uqwS5ExsmP9AxbDTc9JwgneAT5vTiUSm1E7BSflSt3bfa1tv8Di3R8n3Af7MNWzs49hmauE2wP+ttrq+AsWpFG2awvsuOqbipWHgtuvuaAE+A1Z/7gC9hesnr+7wqCwG8c5yAg3AL1fm8T9AZtp/bbJGwl1pNrE7RuOX7PeMRUERVaPpEs+yqeoSmuOlokqw49pgomjLeh7icHNlG19yjs6XXOMedYm5xH2YxpV2tc0Ro2jJfxC50ApuxGob7lMsxfTbeUv07TyYxpeLucEH1gNd4IKH2LAg5TdVhlCafZvpskfncCfx8pOhJzd76bJWeYFnFciwcYfubRc12Ip/ppIhA1/mSZ/RxjFDrJC5xifFjJpY2Xl5zXdguFqYyTR1zSp1Y9p+tktDYYSNflcxI0iyO4TPBdlRcpeqjK/piF5bklq77VSEaA+z8qmJTFzIWiitbnzR794USKBUaT0NTEsVjZqLaFVqJoPN9ODG70IPbfBHKK+/q/AWR0tJzYHRULOa4MP+W/HfGadZUbfw177G7j/OGbIs8TahLyynl4X4RinF793Oz+BU0saXtUHrVBFT/DnA3ctNPoGbs4hRIjTok8i+algT1lTHi4SxFvONKNrgQFAq2/gFnWMXgwffgYMJpiKYkmW3tTg3ZQ9Jq+f8XN+A5eeUKHWvJWJ2sgJ1Sop+wwhqFVijqWaJhwtD8MNlSBeWNNWTa5Z5kPZw5+LbVT99wqTdx29lMUH4OIG/D86ruKEauBjvH5xy6um/Sfj7ei6UUVk4AIl3MyD4MSSTOFgSwsH/QJWaQ5as7ZcmgBZkzjjU1UrQ74ci1gWBCSGHtuV1H2mhSnO3Wp/3fEV5a+4wz//6qy8JxjZsmxxy5+4w9CDNJY09T072iKG0EnOS0arEYgXqYnXcYHwjTtUNAcMelOd4xpkoqiTYICWFq0JSiPfPDQdnt+4/wuqcXY47QILbgAAAABJRU5ErkJggg==")',
  backgroundBlendMode: 'overlay',
  backgroundSize: '100px',
}));

const PoolAvatar = styled(Avatar)({
  width: 80,
  height: 80,
  backgroundColor: '#ffeb3b',
  color: '#1b5e20',
  fontWeight: 'bold',
  fontSize: '1.5rem',
  position: 'absolute',
  top: -3,
  right: 30,
  border: '4px solid #4caf50',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 235, 59, 0.5)',
  zIndex: 2,
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 235, 59, 0.7)',
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 235, 59, 0.5)',
    },
    '50%': {
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 235, 59, 0.8)',
    },
    '100%': {
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 235, 59, 0.5)',
    },
  },
  animation: 'pulse 2s infinite',
});

const StatusChip = styled(Chip)({
  fontWeight: 'bold',
  padding: '8px 4px',
  height: 'auto',
  borderRadius: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  '& .MuiChip-label': {
    padding: '0 12px',
  },
  '& .MuiChip-icon': {
    marginLeft: '8px',
  },
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
  },
});

// No unused styled components

// Interface for pool-specific earnings
interface PoolEarningsData {
  poolId: number;
  levelEarnings: string;
  poolEarnings: string;
  totalEarnings: string;
  loading: boolean;
  error: string | null;
}

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
  border: '2px solid rgba(76, 175, 80, 0.3)',
  background: 'linear-gradient(135deg, rgba(13, 38, 13, 0.95) 0%, rgba(10, 31, 10, 0.95) 100%)',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px) scale(1.02)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15), 0 0 15px rgba(76, 175, 80, 0.2)',
    border: '2px solid rgba(76, 175, 80, 0.6)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(0, 0, 0, 0) 50%)',
    zIndex: 0,
  },
  // Add a subtle hexagon pattern
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'49\' viewBox=\'0 0 28 49\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg id=\'hexagons\' fill=\'%234caf50\' fill-opacity=\'0.05\' fill-rule=\'nonzero\'%3E%3Cpath d=\'M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    backgroundSize: '28px',
    opacity: 0.5,
    zIndex: 0,
  }
}));

interface PoolReportProps {
  poolType: string;
  poolName: string;
}

const PoolReport: React.FC<PoolReportProps> = ({ poolType, poolName }) => {
  const { account } = useWallet();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participatedPools, setParticipatedPools] = useState<number[]>([]);
  const [currentPoolId, setCurrentPoolId] = useState<number>(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
  const [poolEarnings, setPoolEarnings] = useState<PoolEarningsData>({
    poolId: 0,
    levelEarnings: '0',
    poolEarnings: '0',
    totalEarnings: '0',
    loading: false,
    error: null
  });

  // Function to fetch pool earnings data
  const fetchPoolEarnings = async (poolId: number) => {
    try {
      const contract = await getAppropriateContract(poolType);

      // Try to get level earnings for this specific pool
      let levelEarnings = '0';
      let poolWinnings = '0';

      // Get level earnings from the totalLevelEarning mapping
      try {
        // Based on the contract, totalLevelEarning is a public mapping(address => uint256)
        const levelEarningsValue = await contract.totalLevelEarning(account);
        levelEarnings = ethers.utils.formatUnits(levelEarningsValue, 18);
      } catch (e) {
        levelEarnings = '0';
      }

      // Get pool earnings from the totalPoolEarning mapping
      try {
        // Based on the contract, totalPoolEarning is a public mapping(address => uint256)
        const poolWinningsValue = await contract.totalPoolEarning(account);
        poolWinnings = ethers.utils.formatUnits(poolWinningsValue, 18);
      } catch (e) {
        poolWinnings = '0';
      }

      // Try to get specific pool reward if available
      try {
        // Based on the contract, poolRecivedReward is a mapping(address => mapping(uint256 => uint256))
        const poolSpecificReward = await contract.poolRecivedReward(account, poolId);
        // If we got a specific pool reward, use it instead
        if (!poolSpecificReward.isZero()) {
          poolWinnings = ethers.utils.formatUnits(poolSpecificReward, 18);
        }
      } catch (e) {
        // Continue with the general pool earnings
      }

      // Calculate total earnings from the sum of level and pool earnings
      const totalEarnings = (parseFloat(levelEarnings) + parseFloat(poolWinnings)).toString();

      // Update state with the earnings data
      setPoolEarnings({
        poolId,
        levelEarnings,
        poolEarnings: poolWinnings,
        totalEarnings,
        loading: false,
        error: null
      });
    } catch (error) {
      setPoolEarnings(prev => ({
        ...prev,
        loading: false,
        error: `Failed to load earnings data`
      }));
    }
  };

  // Handle opening the modal with a specific pool
  const handleOpenModal = (poolId: number) => {
    // Set state for modal first (synchronously)
    setSelectedPoolId(poolId);
    setModalOpen(true);

    // Reset pool earnings data
    setPoolEarnings({
      poolId,
      levelEarnings: '0',
      poolEarnings: '0',
      totalEarnings: '0',
      loading: true,
      error: null
    });

    // Fetch data after modal is open (asynchronously)
    setTimeout(() => {
      fetchPoolEarnings(poolId);
    }, 100);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPoolId(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!account) {
        setError('Please connect your wallet');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get all data in parallel for better performance
        const [poolCounter, pools] = await Promise.all([
          // Get the current pool ID
          getPoolCounter(poolType),

          // Get all pools where the user has participated
          getParticipatedPools(account, poolType)
        ]);

        setCurrentPoolId(Number(poolCounter));
        setParticipatedPools(pools);
      } catch (error) {
        console.error(`Error fetching pool report for ${poolType}:`, error);
        setError(`Failed to load pool report for ${poolName}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [account, poolType, poolName]);

  if (loading) {
    return (
      <GameCard>
        <CardHeader>
          <Box sx={{ color: 'white', position: 'relative', zIndex: 1, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}>
              Loading Report...
            </Typography>
          </Box>
        </CardHeader>
        <GameCardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 6,
              position: 'relative'
            }}
          >
            <CircularProgress
              size={80}
              thickness={4}
              sx={{
                color: '#4caf50',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
                boxShadow: '0 0 20px rgba(76, 175, 80, 0.3)',
                borderRadius: '50%',
                mb: 3
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: '#ffeb3b',
                fontWeight: 'bold',
                textAlign: 'center',
                animation: 'fadeInOut 1.5s infinite ease-in-out',
                '@keyframes fadeInOut': {
                  '0%': { opacity: 0.5 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.5 },
                }
              }}
            >
              Fetching your pool participation data...
            </Typography>
          </Box>
        </GameCardContent>
      </GameCard>
    );
  }

  if (error) {
    return (
      <GameCard>
        <CardHeader>
          <Box sx={{ color: 'white', position: 'relative', zIndex: 1, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}>
              Error Loading Report
            </Typography>
          </Box>
        </CardHeader>
        <GameCardContent>
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: '12px',
              border: '2px solid rgba(244, 67, 54, 0.3)',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, rgba(244, 67, 54, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
                zIndex: 0,
              },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: '#f44336',
                fontWeight: 'bold',
                mb: 2,
                textShadow: '0 0 10px rgba(244, 67, 54, 0.3)'
              }}
            >
              Failed to Load Pool Report
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                maxWidth: '600px',
                mx: 'auto',
                mb: 2
              }}
            >
              {error}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              Please try again later or contact support if the problem persists.
            </Typography>
          </Box>
        </GameCardContent>
      </GameCard>
    );
  }

  // Get the dollar amount from the pool name
  const getDollarAmount = (name: string) => {
    const match = name.match(/\$([0-9,]+)/);
    return match ? match[1] : '1';
  };

  // Get the appropriate icon for the pool status
  const getStatusIcon = (poolId: number) => {
    if (poolId < currentPoolId) {
      return <EmojiEventsIcon />;
    } else if (poolId === currentPoolId) {
      return <SportsScoreIcon />;
    } else {
      return <AccessTimeIcon />;
    }
  };

  return (
    <GameCard>
      <CardHeader>
        <PoolAvatar>
          ${getDollarAmount(poolName)}
        </PoolAvatar>

        <Box sx={{ color: 'white', position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)',
              letterSpacing: '1px',
              fontSize: '2.2rem',
              textTransform: 'uppercase',
              animation: 'textPulse 2s infinite ease-in-out',
              '@keyframes textPulse': {
                '0%': { textShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)' },
                '50%': { textShadow: '0 0 15px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.3)' },
                '100%': { textShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)' },
              }
            }}
          >
            {poolName.replace(/\(\$[0-9,]+ Pool\)/, '')} Report
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              padding: '8px 16px',
              borderRadius: '30px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              width: 'fit-content'
            }}
          >
            <CasinoIcon sx={{
              mr: 1.5,
              color: '#ffeb3b',
              animation: 'spin 3s infinite linear',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              }
            }} />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                fontSize: '1.1rem'
              }}
            >
              Current Pool: <Box component="span" sx={{ color: '#ffeb3b', fontWeight: 'bold' }}>#{currentPoolId}</Box>
            </Typography>
          </Box>
        </Box>
      </CardHeader>

      <GameCardContent>
        {participatedPools.length === 0 ? (
          <Box
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: '12px',
              border: '2px solid rgba(255, 235, 59, 0.3)',
              background: 'linear-gradient(135deg, rgba(10, 31, 10, 0.95) 0%, rgba(13, 38, 13, 0.95) 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, rgba(255, 235, 59, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
                zIndex: 0,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'180\' height=\'180\' viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M81.28 88H68.413l19.298 19.298L81.28 88zm2.107 0h13.226L90 107.838 83.387 88zm15.334 0h12.866l-19.298 19.298L98.72 88zm-32.927-2.207L73.586 78h32.827l.5.5 7.294 7.293L115.414 87l-24.707 24.707-.707.707L64.586 87l1.207-1.207zm2.62.207L74 80.414 79.586 86H68.414l5.586-5.586zm16.706 0L89 80.414 94.586 86H83.414l5.586-5.586zm16.707 0L105 80.414 110.586 86H99.414l5.586-5.586zm-42.12 0L57 80.414 62.586 86H51.414l5.586-5.586zm-16.707 0L41 80.414 46.586 86H35.414l5.586-5.586zM152.305 88H134.87l-2.016-2H114.28l-2.067 2H97.178l-2.016-2H75.59l-2.066 2H57.404l-2.015-2H34.456l-2.014 2H0v-2h32.442l2.014 2h17.875l2.016-2h15.366l2.066 2h17.957l2.016-2h15.366l2.066 2h17.957l2.016-2h17.857l2.016 2h15.366l2.066 2H180v-2h-27.695zM0 92.412v2h180v-2H0zM0 96.824v2h180v-2H0zM0 101.235v2h180v-2H0zM0 105.647v2h180v-2H0z\' fill=\'%23ffeb3b\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                backgroundSize: '180px',
                opacity: 0.5,
                zIndex: 0,
              },
              animation: 'pulse 3s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(255, 235, 59, 0.4)' },
                '70%': { boxShadow: '0 0 0 15px rgba(255, 235, 59, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(255, 235, 59, 0)' },
              }
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '120px',
                height: '120px',
                margin: '0 auto 24px',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  border: '3px solid rgba(255, 235, 59, 0.3)',
                  animation: 'ripple 2s linear infinite',
                  '@keyframes ripple': {
                    '0%': { transform: 'scale(0.8)', opacity: 1 },
                    '100%': { transform: 'scale(1.5)', opacity: 0 },
                  }
                }
              }}
            >
              <CasinoIcon
                sx={{
                  fontSize: '5rem',
                  color: '#ffeb3b',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: 'spin 4s infinite linear, glow 2s infinite ease-in-out',
                  '@keyframes spin': {
                    '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                    '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
                  },
                  '@keyframes glow': {
                    '0%': { textShadow: '0 0 10px rgba(255, 235, 59, 0.5)' },
                    '50%': { textShadow: '0 0 20px rgba(255, 235, 59, 0.8), 0 0 30px rgba(255, 235, 59, 0.5)' },
                    '100%': { textShadow: '0 0 10px rgba(255, 235, 59, 0.5)' },
                  }
                }}
              />
            </Box>
            <Typography
              variant="h4"
              sx={{
                color: '#ffeb3b',
                fontWeight: 'bold',
                mb: 2,
                textShadow: '0 0 10px rgba(255, 235, 59, 0.3)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                animation: 'textPulse 2s infinite ease-in-out',
                '@keyframes textPulse': {
                  '0%': { textShadow: '0 0 10px rgba(255, 235, 59, 0.3)' },
                  '50%': { textShadow: '0 0 15px rgba(255, 235, 59, 0.5), 0 0 25px rgba(255, 235, 59, 0.3)' },
                  '100%': { textShadow: '0 0 10px rgba(255, 235, 59, 0.3)' },
                }
              }}
            >
              No Pools Joined Yet
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: '500px',
                mx: 'auto',
                mb: 3,
                fontSize: '1.1rem',
                lineHeight: 1.6
              }}
            >
              You have not participated in any pools for {poolName}.
            </Typography>
            <Box
              sx={{
                display: 'inline-block',
                padding: '10px 20px',
                borderRadius: '30px',
                backgroundColor: 'rgba(255, 235, 59, 0.1)',
                border: '1px solid rgba(255, 235, 59, 0.3)',
                color: '#ffeb3b',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 235, 59, 0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                },
                cursor: 'pointer'
              }}
            >
              Join a Pool Now
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 5 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: '#ffeb3b',
                  fontWeight: 'bold',
                  mb: 3,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  textShadow: '0 0 10px rgba(255, 235, 59, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  '&::before, &::after': {
                    content: '""',
                    height: '2px',
                    flexGrow: 1,
                    background: 'linear-gradient(90deg, rgba(255, 235, 59, 0), rgba(255, 235, 59, 0.5) 50%, rgba(255, 235, 59, 0))',
                    margin: '0 15px',
                  }
                }}
              >
                Participation Summary
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
                <StatsCard sx={{ flex: 1, position: 'relative' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #4caf50, #8bc34a, #4caf50)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s infinite linear',
                      '@keyframes shimmer': {
                        '0%': { backgroundPosition: '0% 0%' },
                        '100%': { backgroundPosition: '200% 0%' },
                      },
                      borderRadius: '12px 12px 0 0',
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <Avatar sx={{
                      width: 60,
                      height: 60,
                      bgcolor: 'rgba(76, 175, 80, 0.2)',
                      color: '#4caf50',
                      mr: 3,
                      border: '2px solid rgba(76, 175, 80, 0.5)',
                      boxShadow: '0 0 15px rgba(76, 175, 80, 0.3)',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 15px rgba(76, 175, 80, 0.3)' },
                        '50%': { boxShadow: '0 0 25px rgba(76, 175, 80, 0.5)' },
                        '100%': { boxShadow: '0 0 15px rgba(76, 175, 80, 0.3)' },
                      }
                    }}>
                      <CasinoIcon sx={{ fontSize: '2rem' }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 'medium',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontSize: '0.75rem',
                          mb: 0.5
                        }}
                      >
                        Total Pools Joined
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          color: '#4caf50',
                          fontWeight: 'bold',
                          textShadow: '0 0 10px rgba(76, 175, 80, 0.3)',
                          letterSpacing: '1px'
                        }}
                      >
                        {participatedPools.length}
                      </Typography>
                    </Box>
                  </Box>
                </StatsCard>

                <StatsCard sx={{ flex: 1, position: 'relative' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #ffeb3b, #ffc107, #ffeb3b)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s infinite linear',
                      borderRadius: '12px 12px 0 0',
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <Avatar sx={{
                      width: 60,
                      height: 60,
                      bgcolor: 'rgba(255, 235, 59, 0.2)',
                      color: '#ffeb3b',
                      mr: 3,
                      border: '2px solid rgba(255, 235, 59, 0.5)',
                      boxShadow: '0 0 15px rgba(255, 235, 59, 0.3)',
                      animation: 'pulse2 2s infinite',
                      '@keyframes pulse2': {
                        '0%': { boxShadow: '0 0 15px rgba(255, 235, 59, 0.3)' },
                        '50%': { boxShadow: '0 0 25px rgba(255, 235, 59, 0.5)' },
                        '100%': { boxShadow: '0 0 15px rgba(255, 235, 59, 0.3)' },
                      }
                    }}>
                      <AttachMoneyIcon sx={{ fontSize: '2rem' }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 'medium',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontSize: '0.75rem',
                          mb: 0.5
                        }}
                      >
                        Total Investment
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          color: '#ffeb3b',
                          fontWeight: 'bold',
                          textShadow: '0 0 10px rgba(255, 235, 59, 0.3)',
                          letterSpacing: '1px'
                        }}
                      >
                        ${participatedPools.length * parseInt(getDollarAmount(poolName).replace(',', ''))}
                      </Typography>
                    </Box>
                  </Box>
                </StatsCard>
              </Box>


            </Box>

            <Paper sx={{
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), 0 0 15px rgba(76, 175, 80, 0.15)',
              border: '2px solid rgba(76, 175, 80, 0.4)',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(10, 31, 10, 0.98) 0%, rgba(13, 38, 13, 0.98) 100%)',
              position: 'relative',
              backdropFilter: 'blur(10px)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 0%, rgba(76, 175, 80, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
                zIndex: 0,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'49\' viewBox=\'0 0 28 49\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg id=\'hexagons\' fill=\'%234caf50\' fill-opacity=\'0.05\' fill-rule=\'nonzero\'%3E%3Cpath d=\'M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                backgroundSize: '28px',
                opacity: 0.5,
                zIndex: 0,
              },
              '& .MuiTableHead-root': {
                backgroundColor: 'rgba(27, 94, 32, 0.95)',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, rgba(255, 235, 59, 0), rgba(255, 235, 59, 1) 50%, rgba(255, 235, 59, 0))',
                }
              },
              '& .MuiTableCell-head': {
                color: 'white',
                fontWeight: 'bold',
                borderBottom: 'none',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                padding: { xs: '12px 8px', sm: '16px' },
                textShadow: '0 0 10px rgba(255, 255, 255, 0.2)',
              },
              '& .MuiTableRow-root:nth-of-type(even)': {
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              },
              '& .MuiTableRow-root:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                transition: 'all 0.2s ease-in-out',
              },
              '& .MuiTableCell-root': {
                borderColor: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                padding: { xs: '12px 8px', sm: '16px' },
              },
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25), 0 0 20px rgba(76, 175, 80, 0.2)',
              },
              // Add a subtle pulsing shadow
              '@keyframes subtlePulse': {
                '0%': { boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), 0 0 15px rgba(76, 175, 80, 0.15)' },
                '50%': { boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), 0 0 25px rgba(76, 175, 80, 0.25)' },
                '100%': { boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), 0 0 15px rgba(76, 175, 80, 0.15)' },
              },
              animation: 'subtlePulse 4s infinite ease-in-out',
            }}>
              <Box sx={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                <TableContainer sx={{ minWidth: { xs: '100%' } }}>
                  <Table sx={{
                    tableLayout: 'fixed',
                    '& .MuiTableCell-root': {
                      whiteSpace: { xs: 'nowrap', sm: 'normal' }
                    }
                  }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: { xs: '40%', sm: '35%', md: '30%' } }}>Pool ID</TableCell>
                        <TableCell sx={{ width: { xs: '30%', sm: '35%', md: '40%' } }}>Status</TableCell>
                        <TableCell align="right" sx={{ width: { xs: '30%', sm: '30%', md: '30%' } }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {participatedPools.map((poolId) => (
                        <TableRow key={poolId} sx={{
                          // transition: 'all 0.3s ease',
                          // '&:hover': {
                          //   backgroundColor: 'rgba(76, 175, 80, 0.15) !important',
                          //   transform: { xs: 'none', sm: 'scale(1.01)' },
                          //   boxShadow: { xs: 'none', sm: '0 4px 12px rgba(0, 0, 0, 0.15)' },
                          // }
                        }}>
                          <TableCell>
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              flexWrap: { xs: 'nowrap' }
                            }}>
                              <Avatar sx={{
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 },
                                mr: { xs: 1, sm: 2 },
                                backgroundColor: '#ffeb3b',
                                color: '#1b5e20',
                                fontSize: { xs: '0.85rem', sm: '1rem' },
                                fontWeight: 'bold',
                                border: '2px solid #4caf50',
                                // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                // transition: 'all 0.2s ease-in-out',
                                // flexShrink: 0,
                               
                              }}>
                                {poolId}
                              </Avatar>
                              <Typography variant="body1" sx={{
                                fontWeight: 'bold',
                                color: '#4caf50',
                                textShadow: '0 0 5px rgba(76, 175, 80, 0.3)',
                                fontSize: { xs: '0.85rem', sm: '1rem' },
                              }}>
                                Pool #{poolId}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <StatusChip
                              icon={getStatusIcon(poolId)}
                              label={poolId < currentPoolId ? "Completed" : poolId === currentPoolId ? "Active" : "Pending"}
                              color={poolId < currentPoolId ? "success" : poolId === currentPoolId ? "primary" : "default"}
                              size="small"
                              sx={{
                                backgroundColor: poolId < currentPoolId ? 'rgba(76, 175, 80, 0.2)' :
                                                poolId === currentPoolId ? 'rgba(255, 235, 59, 0.2)' :
                                                'rgba(255, 255, 255, 0.1)',
                                color: poolId < currentPoolId ? '#4caf50' :
                                       poolId === currentPoolId ? '#ffeb3b' :
                                       'white',
                                border: poolId < currentPoolId ? '1px solid #4caf50' :
                                        poolId === currentPoolId ? '1px solid #ffeb3b' :
                                        '1px solid rgba(255, 255, 255, 0.2)',
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                height: { xs: '24px', sm: '32px' },
                                '& .MuiChip-label': {
                                  padding: { xs: '0 6px', sm: '0 12px' }
                                },
                                '& .MuiChip-icon': {
                                  fontSize: { xs: '1rem', sm: '1.2rem' },
                                  marginLeft: { xs: '4px', sm: '8px' }
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                position: 'relative',
                                zIndex: 2000,
                                display: 'inline-flex',
                                width: '100%',
                                justifyContent: 'flex-end'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleOpenModal(poolId);
                              }}
                            >
                              <Button
                                variant="contained"
                                disableElevation
                                disableRipple
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleOpenModal(poolId);
                                }}
                                sx={{
                                  background: 'linear-gradient(90deg, rgba(255, 235, 59, 0.9) 0%, rgba(255, 193, 7, 0.9) 100%)',
                                  color: '#1b5e20',
                                  fontWeight: 'bold',
                                  padding: { xs: '4px 8px', sm: '6px 12px', md: '8px 20px' },
                                  borderRadius: '24px',
                                  fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem' },
                                  cursor: 'pointer !important',
                                  border: '1px solid rgba(255, 235, 59, 0.5)',
                                  minWidth: { xs: 'auto', sm: '100px', md: '120px' },
                                  whiteSpace: 'nowrap',
                                  position: 'relative',
                                  zIndex: 2001,
                                  }}
                              >
                                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>View</Box>
                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>View Earnings</Box>
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>

            {/* Pool Details Modal */}
            <Modal
              open={modalOpen}
              onClose={handleCloseModal}
              aria-labelledby="pool-details-modal"
              disablePortal={false}
              disableEnforceFocus={false}
              disableAutoFocus={false}
              disableScrollLock={false}
              keepMounted={true}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                zIndex: 9999,
                p: { xs: 1, sm: 2, md: 3 },
                '& .MuiBackdrop-root': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: '95%', sm: '90%', md: '80%' },
                  maxWidth: '800px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  borderRadius: '20px',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(76, 175, 80, 0.25)',
                  background: 'linear-gradient(135deg, rgba(10, 31, 10, 0.98) 0%, rgba(13, 38, 13, 0.98) 100%)',
                  border: '2px solid rgba(76, 175, 80, 0.5)',
                  padding: 0,
                  position: 'relative',
                  backdropFilter: 'blur(10px)',
                  '&:focus': {
                    outline: 'none',
                  },
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(76, 175, 80, 0.5)',
                    borderRadius: '10px',
                    '&:hover': {
                      background: 'rgba(76, 175, 80, 0.7)',
                    },
                  },
                }}
              >
                {/* Modal Header */}
                <Box
                  sx={{
                    background: 'linear-gradient(90deg, rgba(27, 94, 32, 0.95) 0%, rgba(46, 125, 50, 0.95) 100%)',
                    padding: { xs: '15px', sm: '20px' },
                    borderRadius: '20px 20px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'radial-gradient(circle at right top, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
                      zIndex: 0,
                      pointerEvents: 'none',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #ffeb3b, #ffc107, #ffeb3b)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s infinite linear',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        backgroundColor: '#ffeb3b',
                        color: '#1b5e20',
                        fontWeight: 'bold',
                        fontSize: '1.5rem',
                        marginRight: 2,
                        border: '3px solid #4caf50',
                        boxShadow: '0 0 15px rgba(255, 235, 59, 0.5)',
                      }}
                    >
                      {selectedPoolId}
                    </Avatar>
                    <Typography
                      variant="h5"
                      sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      Earnings Summary
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleCloseModal}
                    sx={{
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>

                {/* Modal Content */}
                <Box sx={{ padding: { xs: '16px', sm: '20px', md: '24px' } }}>
                  {poolEarnings.loading ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 0',
                      }}
                    >
                      <CircularProgress
                        size={60}
                        thickness={4}
                        sx={{
                          color: '#4caf50',
                          mb: 3,
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#ffeb3b',
                          textAlign: 'center',
                        }}
                      >
                        Loading pool earnings data...
                      </Typography>
                    </Box>
                  ) : poolEarnings.error ? (
                    <Box
                      sx={{
                        padding: '24px',
                        textAlign: 'center',
                        borderRadius: '12px',
                        border: '2px solid rgba(244, 67, 54, 0.3)',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#f44336',
                          fontWeight: 'bold',
                          mb: 1,
                        }}
                      >
                        Error Loading Data
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        {poolEarnings.error}
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          color: '#ffeb3b',
                          fontWeight: 'bold',
                          mb: 3,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          textShadow: '0 0 10px rgba(255, 235, 59, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          '&::before, &::after': {
                            content: '""',
                            height: '2px',
                            flexGrow: 1,
                            background: 'linear-gradient(90deg, rgba(255, 235, 59, 0), rgba(255, 235, 59, 0.5) 50%, rgba(255, 235, 59, 0))',
                            margin: '0 15px',
                          },
                        }}
                      >
                        Total Earnings Breakdown
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
                        {/* Level Earnings Card */}
                        <StatsCard sx={{ flex: 1, height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                width: 60,
                                height: 60,
                                bgcolor: 'rgba(156, 39, 176, 0.2)',
                                color: '#9c27b0',
                                mr: 3,
                                border: '2px solid rgba(156, 39, 176, 0.5)',
                                boxShadow: '0 0 15px rgba(156, 39, 176, 0.3)',
                              }}
                            >
                              <PeopleAltIcon sx={{ fontSize: '2rem' }} />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontWeight: 'medium',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  fontSize: '0.75rem',
                                  mb: 0.5,
                                }}
                              >
                                Total Level Earnings (All Pools)
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{
                                  color: '#ba68c8',
                                  fontWeight: 'bold',
                                  textShadow: '0 0 10px rgba(156, 39, 176, 0.3)',
                                }}
                              >
                                ${parseFloat(poolEarnings.levelEarnings).toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        </StatsCard>

                        {/* Pool Earnings Card */}
                        <StatsCard sx={{ flex: 1, height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                width: 60,
                                height: 60,
                                bgcolor: 'rgba(33, 150, 243, 0.2)',
                                color: '#2196f3',
                                mr: 3,
                                border: '2px solid rgba(33, 150, 243, 0.5)',
                                boxShadow: '0 0 15px rgba(33, 150, 243, 0.3)',
                              }}
                            >
                              <EmojiEventsIcon sx={{ fontSize: '2rem' }} />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontWeight: 'medium',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  fontSize: '0.75rem',
                                  mb: 0.5,
                                }}
                              >
                                Total Pool Winnings (All Pools)
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{
                                  color: '#64b5f6',
                                  fontWeight: 'bold',
                                  textShadow: '0 0 10px rgba(33, 150, 243, 0.3)',
                                }}
                              >
                                ${parseFloat(poolEarnings.poolEarnings).toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        </StatsCard>
                      </Box>

                      {/* Total Earnings */}
                      <StatsCard
                        sx={{
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #f44336, #ff8a80, #f44336)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2s infinite linear',
                            borderRadius: '12px 12px 0 0',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                width: 70,
                                height: 70,
                                bgcolor: 'rgba(244, 67, 54, 0.2)',
                                color: '#f44336',
                                mr: 3,
                                border: '2px solid rgba(244, 67, 54, 0.5)',
                                boxShadow: '0 0 15px rgba(244, 67, 54, 0.3)',
                              }}
                            >
                              <AccountBalanceWalletIcon sx={{ fontSize: '2.5rem' }} />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontWeight: 'medium',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  fontSize: '0.85rem',
                                  mb: 0.5,
                                }}
                              >
                                Combined Total Earnings
                              </Typography>
                              <Typography
                                variant="h3"
                                sx={{
                                  color: '#ff8a80',
                                  fontWeight: 'bold',
                                  textShadow: '0 0 10px rgba(244, 67, 54, 0.3)',
                                }}
                              >
                                ${parseFloat(poolEarnings.totalEarnings).toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </StatsCard>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                        <Button
                          variant="contained"
                          onClick={handleCloseModal}
                          sx={{
                            background: 'linear-gradient(90deg, rgba(76, 175, 80, 0.9) 0%, rgba(56, 142, 60, 0.9) 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                            padding: { xs: '8px 20px', sm: '10px 24px' },
                            borderRadius: '30px',
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2), 0 0 10px rgba(76, 175, 80, 0.2)',
                            border: '1px solid rgba(76, 175, 80, 0.5)',
                            '&:hover': {
                              background: 'linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(56, 142, 60, 1) 100%)',
                              boxShadow: '0 6px 15px rgba(0, 0, 0, 0.25), 0 0 15px rgba(76, 175, 80, 0.3)',
                              transform: 'translateY(-2px)',
                            },
                            '&:active': {
                              transform: 'translateY(1px)',
                              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15), 0 0 5px rgba(76, 175, 80, 0.2)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          Close
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            </Modal>
          </>
        )}
      </GameCardContent>
    </GameCard>
  );
};

export default PoolReport;
