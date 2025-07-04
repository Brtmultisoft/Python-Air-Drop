import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  useTheme,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  IconButton,
  Tooltip
} from '@mui/material';
import { useWallet } from '../context/WalletContext';
import { getAllRegisteredUsers, getTotalRegistered, getReferrer } from '../services/contractService';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface UserWithReferrer {
  address: string;
  referrer: string | null;
}

const Users: React.FC = () => {
  const { isConnected, connectWallet } = useWallet();
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Commented out as not currently used

  // const [users, setUsers] = useState<string[]>([]); // Commented out as not currently used
  const [usersWithReferrers, setUsersWithReferrers] = useState<UserWithReferrer[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Copy address to clipboard
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);

    // Reset copied state after 3 seconds
    setTimeout(() => {
      setCopiedAddress(null);
    }, 3000);
  };

  // Handle page change
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isConnected) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get all registered users
        const registeredUsers = await getAllRegisteredUsers();
        // No need to set users state as we're using usersWithReferrers instead

        // Get total number of registered users
        const total = await getTotalRegistered();
        setTotalUsers(Number(total));

        // Get referrers for each user
        const usersWithReferrerData: UserWithReferrer[] = [];

        for (const userAddress of registeredUsers) {
          try {
            const referrerAddress = await getReferrer(userAddress);
            usersWithReferrerData.push({
              address: userAddress,
              referrer: referrerAddress === '0x0000000000000000000000000000000000000000' ? null : referrerAddress
            });
          } catch (error) {
            console.error(`Error fetching referrer for ${userAddress}:`, error);
            usersWithReferrerData.push({
              address: userAddress,
              referrer: null
            });
          }
        }

        setUsersWithReferrers(usersWithReferrerData);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError('Failed to load registered users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isConnected]);

  if (!isConnected) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Registered Users
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
              Please connect your wallet to view registered users.
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: { xs: 4, md: 6 } }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(90deg, #6200ea, #00bcd4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4
          }}
        >
          Registered Users
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Box sx={{
            p: 3,
            background: 'linear-gradient(135deg, #6200ea 0%, #3f51b5 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ mr: 1 }} /> All Registered Users
            </Typography>
            <Chip
              label={`Total: ${loading ? '...' : totalUsers}`}
              color="secondary"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 500,
                '& .MuiChip-label': { px: 2 }
              }}
            />
          </Box>

          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>
                  Loading users...
                </Typography>
              </Box>
            ) : usersWithReferrers.length === 0 ? (
              <Box sx={{ p: 8, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  No registered users found.
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                        <TableCell sx={{ fontWeight: 600 }}>No.</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>User Address</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Referrer</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usersWithReferrers
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((user, index) => (
                          <TableRow
                            key={user.address}
                            sx={{
                              '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.02)'
                              }
                            }}
                          >
                            <TableCell>
                              {page * rowsPerPage + index + 1}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  sx={{
                                    bgcolor: theme.palette.primary.main,
                                    width: 32,
                                    height: 32,
                                    mr: 1
                                  }}
                                >
                                  <PersonIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.85rem',
                                    display: { xs: 'none', md: 'block' }
                                  }}
                                >
                                  {user.address}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.85rem',
                                    display: { xs: 'block', md: 'none' }
                                  }}
                                >
                                  {`${user.address.substring(0, 6)}...${user.address.substring(user.address.length - 4)}`}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {user.referrer ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{
                                      bgcolor: theme.palette.secondary.main,
                                      width: 32,
                                      height: 32,
                                      mr: 1
                                    }}
                                  >
                                    <PersonIcon sx={{ fontSize: 18 }} />
                                  </Avatar>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontFamily: 'monospace',
                                      fontSize: '0.85rem',
                                      display: { xs: 'none', md: 'block' }
                                    }}
                                  >
                                    {user.referrer}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontFamily: 'monospace',
                                      fontSize: '0.85rem',
                                      display: { xs: 'block', md: 'none' }
                                    }}
                                  >
                                    {`${user.referrer.substring(0, 6)}...${user.referrer.substring(user.referrer.length - 4)}`}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                  No referrer
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Tooltip title={copiedAddress === user.address ? "Copied!" : "Copy address"}>
                                <IconButton
                                  size="small"
                                  onClick={() => copyAddress(user.address)}
                                  color={copiedAddress === user.address ? "success" : "primary"}
                                >
                                  {copiedAddress === user.address ? <CheckCircleIcon /> : <ContentCopyIcon />}
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={usersWithReferrers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Users;
