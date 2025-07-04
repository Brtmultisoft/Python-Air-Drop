import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
} from '@mui/material';
import {
  Settings,
  Code,
  Rocket,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

const SetupInstructions: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
          🚀 Mining Platform Setup
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4 }}>
          Complete these steps to activate your token mining dashboard
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ mb: 4 }}>
        <AlertTitle>Setup Required</AlertTitle>
        Please update the contract addresses in <code>src/client.ts</code> before using the mining platform.
      </Alert>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Settings sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Configuration Steps
            </Typography>
          </Box>

          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle sx={{ color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="1. Deploy Your Smart Contract"
                secondary="Deploy the tokenAirDrop contract you provided to BSC Mainnet"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Code sx={{ color: 'info.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="2. Update Contract Addresses"
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Open <code>src/client.ts</code> and replace these placeholder addresses:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5', fontFamily: 'monospace' }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>MINING_CONTRACT_ADDRESS:</strong> "0x1234567890123456789012345678901234567890"
                      </Typography>
                      <Typography variant="body2">
                        <strong>TOKEN_CONTRACT_ADDRESS:</strong> "0x0987654321098765432109876543210987654321"
                      </Typography>
                    </Paper>
                  </Box>
                }
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Rocket sx={{ color: 'secondary.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="3. Start Mining"
                secondary="Once configured, users can connect wallets, register, and start claiming daily rewards"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            📋 Contract Features
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            <Chip label="Daily Rewards" color="primary" />
            <Chip label="Registration Bonus" color="secondary" />
            <Chip label="10-Level Referral System" color="success" />
            <Chip label="Booster Rewards" color="warning" />
            <Chip label="BSC Mainnet" color="info" />
          </Box>

          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Daily Reward:</strong> 10 USDT (claimable every 24 hours, 2 minutes for testing)
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Registration Reward:</strong> 5 USDT (one-time bonus)
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Referral System:</strong> Multi-level rewards with booster multipliers
          </Typography>
          <Typography variant="body1">
            <strong>Network:</strong> Binance Smart Chain (BSC) Mainnet
          </Typography>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mt: 4 }}>
        <AlertTitle>Development Note</AlertTitle>
        The contract is currently set to 2-minute intervals for testing. Change this to 24 hours (86400 seconds) for production use.
      </Alert>
    </Container>
  );
};

export default SetupInstructions;
