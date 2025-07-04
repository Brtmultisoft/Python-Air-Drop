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
  Alert,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Collapse,
  Avatar,
  TablePagination
} from '@mui/material';
import { useWallet } from '../context/WalletContext';
import { getDownlineReport, DownlineReport as DownlineReportType } from '../services/reportService';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const DownlineReport: React.FC = () => {
  const { account, isConnected } = useWallet();
  const [report, setReport] = useState<DownlineReportType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const fetchDownlineReport = async () => {
    if (!isConnected || !account) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getDownlineReport(account);
      setReport(data);
    } catch (err: any) {
      console.error('Error fetching downline report:', err);
      setError('Failed to load downline report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownlineReport();
  }, [account, isConnected]);

  const handleRefresh = () => {
    fetchDownlineReport();
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Format address for display
  const formatAddress = (address: string | null) => {
    if (!address) return "Unknown";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

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
          <PeopleIcon sx={{ mr: 1, color: '#fdd835' }} /> Your Downline Report
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
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress sx={{ color: '#fdd835' }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : !report || report.totalUsers === 0 ? (
            <Alert
              severity="info"
              sx={{
                mb: 3,
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              You don't have any downline users yet. Share your referral link to start building your network.
            </Alert>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.9)' }}>
                Below is a summary of your downline network. Track your referrals and build your team.
              </Typography>

              {/* Summary Cards */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 4 }}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    textAlign: 'center',
                    flex: 1
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#fdd835', fontWeight: 600, mb: 1 }}>
                    Total Downline
                  </Typography>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                    {report.totalUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Total users in your network
                  </Typography>
                </Paper>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    textAlign: 'center',
                    flex: 1
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#fdd835', fontWeight: 600, mb: 1 }}>
                    Direct Referrals
                  </Typography>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                    {report.directReferrals}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Level 1 referrals
                  </Typography>
                </Paper>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    textAlign: 'center',
                    flex: 1
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#fdd835', fontWeight: 600, mb: 1 }}>
                    Indirect Referrals
                  </Typography>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                    {report.indirectReferrals}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Level 2+ referrals
                  </Typography>
                </Paper>
              </Box>

              {/* Level Distribution */}
              <Typography variant="h6" sx={{ color: '#fdd835', fontWeight: 600, mb: 2 }}>
                Level Distribution
              </Typography>
              <TableContainer
                component={Paper}
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  mb: 4
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { color: 'white', fontWeight: 'bold', bgcolor: 'rgba(0, 0, 0, 0.2)' } }}>
                      <TableCell>Level</TableCell>
                      <TableCell>Users</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(report.levels).map(([level, count]) => (
                      <TableRow key={level} sx={{ '& td': { color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' } }}>
                        <TableCell>Level {level}</TableCell>
                        <TableCell>{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Users Table */}
              <Typography variant="h6" sx={{ color: '#fdd835', fontWeight: 600, mb: 2 }}>
                Downline Users
              </Typography>
              <TableContainer
                component={Paper}
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  mb: 2
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ '& th': { color: 'white', fontWeight: 'bold', bgcolor: 'rgba(0, 0, 0, 0.2)' } }}>
                      <TableCell>User</TableCell>
                      <TableCell>Level</TableCell>
                      <TableCell>Referrer</TableCell>
                      <TableCell>Direct Referrals</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.users
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((user) => (
                        <TableRow key={user.address} sx={{ '& td': { color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                sx={{
                                  bgcolor: 'rgba(255, 215, 0, 0.2)',
                                  color: '#fdd835',
                                  mr: 1,
                                  width: 32,
                                  height: 32,
                                  border: '2px solid rgba(255, 215, 0, 0.3)'
                                }}
                              >
                                <PersonIcon fontSize="small" />
                              </Avatar>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {formatAddress(user.address)}
                                </Typography>
                                <Tooltip title={copiedAddress === user.address ? "Copied!" : "Copy address"}>
                                  <IconButton
                                    size="small"
                                    onClick={() => copyToClipboard(user.address)}
                                    sx={{
                                      ml: 1,
                                      color: copiedAddress === user.address ? '#4caf50' : '#fdd835',
                                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                                    }}
                                  >
                                    {copiedAddress === user.address ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`Level ${user.level}`}
                              size="small"
                              sx={{
                                bgcolor: user.level === 1 ? 'rgba(76, 175, 80, 0.7)' : 'rgba(33, 150, 243, 0.7)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {user.referrer === account?.toLowerCase() ? (
                              <Chip
                                label="You"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(156, 39, 176, 0.7)',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            ) : (
                              formatAddress(user.referrer)
                            )}
                          </TableCell>
                          <TableCell>{user.referredUsers.length}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={report.users.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  color: 'white',
                  '.MuiTablePagination-selectIcon, .MuiTablePagination-actions': {
                    color: 'white'
                  }
                }}
              />
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default DownlineReport;
