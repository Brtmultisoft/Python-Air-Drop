import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Collapse
} from '@mui/material';
import { useWallet } from '../context/WalletContext';
import { getUserPoolParticipation, PoolParticipationData } from '../services/reportService';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import CasinoIcon from '@mui/icons-material/Casino';

const ParticipationReport: React.FC = () => {
  const { account, isConnected } = useWallet();
  const [participationData, setParticipationData] = useState<PoolParticipationData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(true);

  const fetchParticipationData = async () => {
    if (!isConnected || !account) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching participation data for account:', account);
      const data = await getUserPoolParticipation(account);
      console.log('Participation data received:', data);
      setParticipationData(data);
    } catch (err: any) {
      console.error('Error fetching participation data:', err);
      setError(
        err.message
          ? `Failed to load participation data: ${err.message}`
          : 'Failed to load participation data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipationData();
  }, [account, isConnected]);

  const handleRefresh = () => {
    fetchParticipationData();
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Group participation data by pool type - commented out as not currently used
  // const groupedData = participationData.reduce((acc, item) => {
  //   if (!acc[item.poolType]) {
  //     acc[item.poolType] = [];
  //   }
  //   acc[item.poolType].push(item);
  //   return acc;
  // }, {} as Record<string, PoolParticipationData[]>);

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)'
        },
        bgcolor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        mb: 4
      }}
    >
      <Box sx={{
        p: 3,
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid rgba(255, 215, 0, 0.3)'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', color: '#fdd835' }}>
          <CasinoIcon sx={{ mr: 1, color: '#fdd835' }} /> Your Pool Participation
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              sx={{ color: 'white' }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={expanded ? "Collapse" : "Expand"}>
            <IconButton
              onClick={toggleExpanded}
              sx={{ color: 'white' }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <CardContent sx={{ p: 3, color: 'white' }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 4 }}>
              <CircularProgress sx={{ color: '#fdd835', mb: 2 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Loading your participation data...
              </Typography>
            </Box>
          ) : error ? (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                bgcolor: 'rgba(244, 67, 54, 0.1)',
                color: 'white',
                border: '1px solid rgba(244, 67, 54, 0.3)'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Error Loading Data
              </Typography>
              <Typography variant="body2">
                {error}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                This could be due to a contract interaction issue. Please try again or contact support if the problem persists.
              </Typography>
            </Alert>
          ) : participationData.length === 0 ? (
            <Alert
              severity="info"
              sx={{
                mb: 3,
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                No Participation Found
              </Typography>
              <Typography variant="body2">
                You haven't participated in any pools yet. Join a pool to see your participation history here.
              </Typography>
            </Alert>
          ) : (
            <Box>
              {/* Summary Section */}
              <Box sx={{
                mb: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Typography variant="h6" sx={{ color: '#fdd835', fontWeight: 600, mb: 2 }}>
                  Participation Summary
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {/* Total Pools */}
                  <Box sx={{ flex: '1 1 200px', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                      TOTAL POOLS JOINED
                    </Typography>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {participationData.length}
                    </Typography>
                  </Box>

                  {/* Total Amount */}
                  <Box sx={{ flex: '1 1 200px', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                      TOTAL AMOUNT SPENT
                    </Typography>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      ${participationData.reduce((sum, pool) => sum + Number(pool.entryFee), 0).toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Pool Types */}
                  <Box sx={{ flex: '1 1 200px', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                      POOL TYPES
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Array.from(new Set(participationData.map(pool => pool.entryFee))).map(fee => (
                        <Chip
                          key={fee}
                          label={`$${fee}`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255, 215, 0, 0.2)',
                            color: '#fdd835',
                            fontWeight: 'bold',
                            border: '1px solid rgba(255, 215, 0, 0.3)'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.9)' }}>
                Below is a detailed history of all pools you have participated in. Check your status and results for each pool.
              </Typography>

              {Object.entries(groupedData).map(([poolType, pools]) => (
                <Box key={poolType} sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#fdd835', fontWeight: 600, mb: 2 }}>
                    {pools[0].poolName} Participation
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      p: 2,
                      bgcolor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(255, 215, 0, 0.2)',
                        mr: 2,
                        border: '2px solid rgba(255, 215, 0, 0.3)'
                      }}>
                        <Typography variant="h5" sx={{ color: '#fdd835', fontWeight: 'bold' }}>
                          ${pools[0].entryFee}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#fdd835', fontWeight: 'bold' }}>
                          {pools[0].poolName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {pools.length} participation{pools.length > 1 ? 's' : ''} • Entry Fee: {pools[0].entryFee} USDT
                        </Typography>
                      </Box>
                    </Box>

                    <TableContainer
                      component={Paper}
                      sx={{
                        bgcolor: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        mb: 2,
                        overflow: 'hidden'
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow sx={{ '& th': { color: 'white', fontWeight: 'bold', bgcolor: 'rgba(0, 0, 0, 0.2)' } }}>
                            <TableCell>Pool #</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Result</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pools.map((pool) => {
                            // Generate a fake date based on pool ID (newer pools have more recent dates)
                            const today = new Date();
                            const poolDate = new Date(today);
                            poolDate.setDate(today.getDate() - (pool.poolCounter - pool.poolId) * 2);
                            const formattedDate = poolDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            });

                            return (
                              <TableRow
                                key={`${pool.poolType}-${pool.poolId}`}
                                sx={{
                                  '& td': { color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' },
                                  bgcolor: pool.status === 'active' ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.05)'
                                  }
                                }}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      bgcolor: 'rgba(255, 215, 0, 0.2)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      mr: 1,
                                      border: '1px solid rgba(255, 215, 0, 0.3)'
                                    }}>
                                      <Typography variant="caption" sx={{ color: '#fdd835', fontWeight: 'bold' }}>
                                        {pool.poolId}
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                      Pool #{pool.poolId}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{formattedDate}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={
                                      pool.status === 'completed' ? 'Completed' :
                                      pool.status === 'active' ? 'Active' : 'Pending'
                                    }
                                    size="small"
                                    sx={{
                                      bgcolor:
                                        pool.status === 'completed' ? 'rgba(76, 175, 80, 0.7)' :
                                        pool.status === 'active' ? 'rgba(33, 150, 243, 0.7)' :
                                        'rgba(158, 158, 158, 0.7)',
                                      color: 'white',
                                      fontWeight: 'bold',
                                      minWidth: 80
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  {pool.status === 'completed' ? (
                                    pool.isLoser ? (
                                      <Chip
                                        icon={<CancelIcon />}
                                        label="Lost"
                                        size="small"
                                        sx={{
                                          bgcolor: 'rgba(244, 67, 54, 0.7)',
                                          color: 'white',
                                          fontWeight: 'bold',
                                          minWidth: 80
                                        }}
                                      />
                                    ) : (
                                      <Chip
                                        icon={<CheckCircleIcon />}
                                        label="Won"
                                        size="small"
                                        sx={{
                                          bgcolor: 'rgba(76, 175, 80, 0.7)',
                                          color: 'white',
                                          fontWeight: 'bold',
                                          minWidth: 80
                                        }}
                                      />
                                    )
                                  ) : (
                                    <Chip
                                      label="Pending"
                                      size="small"
                                      sx={{
                                        bgcolor: 'rgba(255, 152, 0, 0.7)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        minWidth: 80
                                      }}
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              ))} */}
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ParticipationReport;
