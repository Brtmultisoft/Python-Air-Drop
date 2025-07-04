import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Collapse,
  IconButton,
  Paper,
  Stack,
} from '@mui/material';
import {
  AccountTree,
  People,
  ExpandMore,
  ExpandLess,
  Person,
  Group,
  TrendingUp,
  MonetizationOn,
  Share,
  ContentCopy,
} from '@mui/icons-material';
import { useThirdWebMLM } from '../../context/ThirdWebMLMContext';
import { useInvestment } from '../../context/InvestmentContext';
import { DEFAULT_REFERRAL_ADDRESS } from '../../config';

interface TeamMember {
  address: string;
  level: number;
  joinDate: string;
  isActive: boolean;
  hasInvested: boolean;
  totalInvestment: string;
  contributionCount: number;
}

const TeamStructure: React.FC = () => {
  const { 
    address, 
    getDirectReferrals, 
    getDirectReferralCount, 
    getReferrer,
    isConnected,
    isCorrectNetwork 
  } = useThirdWebMLM();

  const [directReferrals, setDirectReferrals] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [referralCount, setReferralCount] = useState<number>(0);
  const [activeReferralCount, setActiveReferralCount] = useState<number>(0);
  const [teamVolume, setTeamVolume] = useState<number>(0);
  const [referrer, setReferrer] = useState<string>('');
  const [expandedLevels, setExpandedLevels] = useState<{ [key: number]: boolean }>({
    1: true,
    2: false,
    3: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Get detailed user investment data
  const getUserInvestmentData = async (userAddress: string): Promise<TeamMember> => {
    try {
      // Import the contract and client here to avoid circular dependencies
      const { getContract, readContract } = await import("thirdweb");
      const { client, bscTestnet } = await import('../../client');
      const { INVESTMENT_CONTRACT_ADDRESS, INVESTMENT_CONTRACT_ABI } = await import('../../client');

      const investmentContract = getContract({
        client,
        chain: bscTestnet,
        address: INVESTMENT_CONTRACT_ADDRESS,
        abi: INVESTMENT_CONTRACT_ABI,
      });

      const userData = await readContract({
        contract: investmentContract,
        method: "getUserData",
        params: [userAddress],
      });

      // Format BigInt to readable string
      const formatAmount = (amount: bigint, decimals: number = 18): string => {
        const divisor = BigInt(10 ** decimals);
        const quotient = amount / divisor;
        const remainder = amount % divisor;

        if (remainder === 0n) {
          return quotient.toString();
        }

        const remainderStr = remainder.toString().padStart(decimals, '0');
        const trimmedRemainder = remainderStr.replace(/0+$/, '');

        if (trimmedRemainder === '') {
          return quotient.toString();
        }

        return `${quotient}.${trimmedRemainder.substring(0, 4)}`;
      };

      // userData structure: [totalContribution, isExists, contributionCount, totalClaimedReward, totalLevelIncome]
      const totalContribution = userData[0];
      const contributionCount = userData[2];
      const hasInvested = contributionCount > 0n;

      return {
        address: userAddress,
        level: 1,
        joinDate: new Date().toISOString().split('T')[0], // Placeholder
        isActive: hasInvested,
        hasInvested,
        totalInvestment: formatAmount(totalContribution),
        contributionCount: Number(contributionCount),
      };
    } catch (error) {
      console.error('Error getting user investment data:', error);
      return {
        address: userAddress,
        level: 1,
        joinDate: new Date().toISOString().split('T')[0],
        isActive: false,
        hasInvested: false,
        totalInvestment: '0',
        contributionCount: 0,
      };
    }
  };

  // Load team data
  const loadTeamData = async () => {
    if (!address || !isConnected || !isCorrectNetwork) return;

    try {
      setIsLoading(true);

      // Get direct referrals
      const referrals = await getDirectReferrals();
      setDirectReferrals(Array.from(referrals));

      // Get referral count
      const count = await getDirectReferralCount();
      setReferralCount(count);

      // Get detailed data for each referral
      const memberPromises = referrals.map(referralAddress =>
        getUserInvestmentData(referralAddress)
      );
      const members = await Promise.all(memberPromises);
      setTeamMembers(members);

      // Count active members (those who have invested)
      const activeCount = members.filter(member => member.hasInvested).length;
      setActiveReferralCount(activeCount);

      // Calculate total team volume
      const totalVolume = members.reduce((sum, member) => {
        return sum + parseFloat(member.totalInvestment || '0');
      }, 0);
      setTeamVolume(totalVolume);

      // Get referrer
      const referrerAddress = await getReferrer();
      setReferrer(referrerAddress);

    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [address, isConnected, isCorrectNetwork]);

  const handleExpandLevel = (level: number) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/usd/mlm/register?ref=${address}`;
    navigator.clipboard.writeText(referralLink);
    // You could add a toast notification here
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}/usd/mlm/register?ref=${address}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join Python Air Drop MLM Platform',
        text: 'Join me on Python Air Drop - the amazing MLM investment platform!',
        url: referralLink,
      });
    } else {
      copyReferralLink();
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected || !isCorrectNetwork) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#FF9800' }}>
          Team Structure
        </Typography>
        <Alert severity="warning">
          Please connect your wallet and switch to BSC Testnet to view your team structure.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffff' }}>
        👥 Team Structure
      </Typography>

      {/* Team Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid #333',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderColor: '#4caf50'
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <People sx={{ mr: 1, color: '#4caf50' }} />
                <Typography variant="h6" color="#ffffff">Direct Referrals</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                {referralCount}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                Level 1 Team
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid #333',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderColor: '#2196f3'
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Group sx={{ mr: 1, color: '#2196f3' }} />
                <Typography variant="h6" color="#ffffff">Total Team</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                {referralCount}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                All Levels
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid #333',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderColor: '#ff9800'
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp sx={{ mr: 1, color: '#ff9800' }} />
                <Typography variant="h6" color="#ffffff">Active Members</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                {activeReferralCount}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                With Investments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid #333',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderColor: '#9c27b0'
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <MonetizationOn sx={{ mr: 1, color: '#9c27b0' }} />
                <Typography variant="h6" color="#ffffff">Team Volume</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                {teamVolume.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                USDT
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Referral Tools */}
      <Card sx={{ mb: 4, background: '#1e1e1e', border: '1px solid #333' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffff' }}>
            🔗 Referral Tools
          </Typography>
          <Divider sx={{ mb: 2, borderColor: '#333' }} />

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Paper sx={{
                p: 2,
                bgcolor: '#333',
                border: '1px solid #555',
                borderRadius: 2
              }}>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }} gutterBottom>
                  📋 Your Referral Link:
                </Typography>
                <Typography variant="body1" sx={{
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  color: '#ffffff',
                  bgcolor: '#2d2d2d',
                  p: 1,
                  borderRadius: 1,
                  border: '1px solid #444'
                }}>
                  {`${window.location.origin}/usd/mlm/register?ref=${address}`}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<ContentCopy />}
                  onClick={copyReferralLink}
                  sx={{
                    backgroundColor: '#4caf50',
                    '&:hover': {
                      backgroundColor: '#45a049'
                    }
                  }}
                >
                  Copy Link
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={shareReferralLink}
                  sx={{
                    borderColor: '#2196f3',
                    color: '#2196f3',
                    '&:hover': {
                      borderColor: '#1976d2',
                      bgcolor: 'rgba(33, 150, 243, 0.1)'
                    }
                  }}
                >
                  Share
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Team Hierarchy */}
      <Card sx={{ background: '#1e1e1e', border: '1px solid #333' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffff' }}>
            🌳 Team Hierarchy
          </Typography>
          <Divider sx={{ mb: 2, borderColor: '#333' }} />

          {/* Your Position */}
          <Box sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{
                bgcolor: '#ff9800',
                mr: 2,
                border: '2px solid #333'
              }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                  You ({formatAddress(address || '')})
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  👑 Team Leader
                </Typography>
              </Box>
            </Box>

            {/* Referrer */}
            {referrer && referrer !== '0x0000000000000000000000000000000000000000' && (
              <Box sx={{ ml: 4, mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }} gutterBottom>
                  Referred by:
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{
                    bgcolor: referrer === DEFAULT_REFERRAL_ADDRESS ? '#ff9800' : '#555',
                    mr: 1,
                    width: 32,
                    height: 32,
                    border: referrer === DEFAULT_REFERRAL_ADDRESS ? '1px solid #ff9800' : '1px solid #777'
                  }}>
                    <Person sx={{ fontSize: 20, color: referrer === DEFAULT_REFERRAL_ADDRESS ? '#ffffff' : '#b0b0b0' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#ffffff', fontFamily: 'monospace' }}>
                      {formatAddress(referrer)}
                    </Typography>
                    {referrer === DEFAULT_REFERRAL_ADDRESS && (
                      <Typography variant="caption" sx={{ color: '#ff9800' }}>
                        🔗 Default USDStack Referrer
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Level 1 - Direct Referrals */}
          <Box>
            <Box 
              display="flex" 
              alignItems="center" 
              sx={{ cursor: 'pointer', mb: 1 }}
              onClick={() => handleExpandLevel(1)}
            >
              <IconButton size="small" sx={{ color: '#ffffff' }}>
                {expandedLevels[1] ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
              <Box sx={{ ml: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                  📊 Level 1 - Direct Referrals ({referralCount})
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  {activeReferralCount} Active • {referralCount - activeReferralCount} Inactive
                </Typography>
              </Box>
            </Box>

            <Collapse in={expandedLevels[1]}>
              {isLoading ? (
                <Box sx={{ ml: 4, p: 2 }}>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    🔄 Loading team member investment data...
                  </Typography>
                </Box>
              ) : teamMembers.length > 0 ? (
                <List sx={{ ml: 4 }}>
                  {teamMembers.map((member, index) => (
                    <ListItem key={index} sx={{
                      py: 1,
                      bgcolor: '#2d2d2d',
                      borderRadius: 2,
                      mb: 1,
                      border: member.hasInvested ? '1px solid #4caf50' : '1px solid #444'
                    }}>
                      <ListItemAvatar>
                        <Avatar sx={{
                          bgcolor: member.hasInvested ? '#4caf50' : '#666',
                          width: 32,
                          height: 32,
                          border: '1px solid #333'
                        }}>
                          <Person sx={{ fontSize: 20 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                              {formatAddress(member.address)}
                            </Typography>
                            {member.hasInvested && (
                              <Chip
                                label="Active"
                                sx={{
                                  bgcolor: '#1e3a1e',
                                  color: '#4caf50',
                                  border: '1px solid #4caf50'
                                }}
                                size="small"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            {member.hasInvested ? (
                              <>
                                <Typography variant="caption" sx={{ color: '#4caf50' }}>
                                  💰 Invested: {member.totalInvestment} USDT
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                                  • {member.contributionCount} investment{member.contributionCount !== 1 ? 's' : ''}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="caption" sx={{ color: '#ff9800' }}>
                                ⏳ Registered but not invested yet
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ ml: 4, p: 2 }}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      No direct referrals yet. Share your referral link to start building your team!
                    </Typography>
                  </Alert>
                </Box>
              )}
            </Collapse>
          </Box>

          {/* Level 2 - Indirect Referrals */}
          <Box sx={{ mt: 2 }}>
            <Box 
              display="flex" 
              alignItems="center" 
              sx={{ cursor: 'pointer', mb: 1 }}
              onClick={() => handleExpandLevel(2)}
            >
              <IconButton size="small">
                {expandedLevels[2] ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
                Level 2 - Indirect Referrals (0)
              </Typography>
            </Box>

            <Collapse in={expandedLevels[2]}>
              <Box sx={{ ml: 4, p: 2 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Level 2 referrals will appear here when your direct referrals start referring others.
                  </Typography>
                </Alert>
              </Box>
            </Collapse>
          </Box>

          {/* Level 3+ */}
          <Box sx={{ mt: 2 }}>
            <Box 
              display="flex" 
              alignItems="center" 
              sx={{ cursor: 'pointer', mb: 1 }}
              onClick={() => handleExpandLevel(3)}
            >
              <IconButton size="small">
                {expandedLevels[3] ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
                Level 3+ - Deep Network (0)
              </Typography>
            </Box>

            <Collapse in={expandedLevels[3]}>
              <Box sx={{ ml: 4, p: 2 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Deeper level referrals will appear here as your network grows.
                  </Typography>
                </Alert>
              </Box>
            </Collapse>
          </Box>
        </CardContent>
      </Card>

      {/* Team Building Tips */}
      <Alert severity="success" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Team Building Tips:</strong> Share your referral link on social media, 
          with friends and family, or in crypto communities. The more active your team, 
          the higher your referral commissions!
        </Typography>
      </Alert>
    </Box>
  );
};

export default TeamStructure;
