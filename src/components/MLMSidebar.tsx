import React, { useState } from 'react';
import Logo from './common/Logo';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
  IconButton,
  Badge,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as InvestmentIcon,
  People as TeamIcon,
  History as HistoryIcon,
  MonetizationOn as ROIIcon,
  AccountTree as StructureIcon,
  GetApp as WithdrawIcon,
  Publish as DepositIcon,
  ExpandLess,
  ExpandMore,

  Close as CloseIcon,
  Diamond as DiamondIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Groups as GroupsIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useThirdWebMLM } from '../context/ThirdWebMLMContext';
import { useInvestment } from '../context/InvestmentContext';

interface MLMSidebarProps {
  selectedSection: string;
  onSectionChange: (section: string) => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

const MLMSidebar: React.FC<MLMSidebarProps> = ({
  selectedSection,
  onSectionChange,
  mobileOpen,
  onMobileToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { address, isMLMRegistered } = useThirdWebMLM();
  const { userInvestmentData, userContributions, totalPendingRewards } = useInvestment();

  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({
    investments: true,
    team: false,
    history: false,
  });

  const handleExpandClick = (item: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

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

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      section: 'dashboard'
    },
    {
      id: 'investments',
      label: 'Investments',
      icon: <InvestmentIcon />,
      expandable: true,
      children: [
        { id: 'packages', label: 'Investment Packages', icon: <DiamondIcon />, section: 'packages' },
        { id: 'my-investments', label: 'My Investments', icon: <WalletIcon />, section: 'my-investments' },
        { id: 'daily-roi', label: 'Daily ROI', icon: <ROIIcon />, section: 'daily-roi' },
      ]
    },
    {
      id: 'team',
      label: 'Team Management',
      icon: <TeamIcon />,
      expandable: true,
      children: [
        { id: 'team-structure', label: 'Team Structure', icon: <StructureIcon />, section: 'team-structure' },
        { id: 'referral-links', label: 'Referral Links', icon: <LinkIcon />, section: 'referral-links' },
      ]
    },
   
  ];

  const renderMenuItem = (item: any, depth = 0) => {
    const isSelected = selectedSection === item.section;
    const isExpanded = expandedItems[item.id];

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ pl: depth * 2 }}>
          <ListItemButton
            selected={isSelected}
            onClick={() => {
              if (item.expandable) {
                handleExpandClick(item.id);
              } else if (item.section) {
                navigate(`/usd/mlm/dashboard?section=${item.section}`);
                if (isMobile) {
                  onMobileToggle();
                }
              }
            }}
            sx={{
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: '#333',
                borderLeft: '4px solid #ff9800',
                '&:hover': {
                  backgroundColor: '#444',
                },
              },
              '&:hover': {
                backgroundColor: '#2d2d2d',
              },
            }}
          >
            <ListItemIcon sx={{
              color: isSelected ? '#ff9800' : '#b0b0b0',
              minWidth: { xs: 36, sm: 40 }
            }}>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error" max={999}>
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{
                  fontSize: depth > 0 ? { xs: '0.8rem', sm: '0.875rem' } : { xs: '0.9rem', sm: '1rem' },
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? '#ff9800' : '#ffffff'
                }}>
                  {item.label}
                </Typography>
              }
            />
            {item.expandable && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        
        {item.expandable && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child: any) => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        p: { xs: 2, sm: 3 },
        background: '#1a1a1a',
        color: 'white',
        borderBottom: '1px solid #333'
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <Logo
              size="sidebar"
              sx={{
                mr: { xs: 1, sm: 2 },
                border: '2px solid #555',
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 }
              }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h6" sx={{
                fontWeight: 'bold',
                color: '#ffffff',
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}>
                Python Air Drop
              </Typography>
              <Typography variant="caption" sx={{
                color: '#b0b0b0',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                wordBreak: 'break-all'
              }}>
                {address ? `${address.slice(0, isMobile ? 4 : 6)}...${address.slice(isMobile ? -3 : -4)}` : 'Not Connected'}
              </Typography>
            </Box>
          </Box>
          {isMobile && (
            <IconButton
              onClick={onMobileToggle}
              sx={{
                color: '#ffffff',
                ml: 1,
                flexShrink: 0
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Quick Stats */}
      {isMLMRegistered && userInvestmentData && (
        <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: '#2d2d2d', borderBottom: '1px solid #333' }}>
          <Typography variant="subtitle2" sx={{
            color: '#b0b0b0',
            mb: { xs: 1.5, sm: 2 },
            fontWeight: 'bold',
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }}>
            📊 Quick Overview
          </Typography>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" sx={{
              color: '#888',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}>
              Total Investment:
            </Typography>
            <Typography variant="body2" sx={{
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}>
              {formatAmount(userInvestmentData.totalContribution)} USDT
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" sx={{
              color: '#888',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}>
              Pending Rewards:
            </Typography>
            <Typography variant="body2" sx={{
              fontWeight: 'bold',
              color: '#4caf50',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}>
              {formatAmount(totalPendingRewards)} USDT
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" sx={{
              color: '#888',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}>
              Active Plans:
            </Typography>
            <Typography variant="body2" sx={{
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}>
              {userContributions.length}
            </Typography>
          </Box>
        </Box>
      )}

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ pt: 1 }}>
          {menuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #333', bgcolor: '#1a1a1a' }}>
        <Typography variant="caption" sx={{ color: '#888' }} align="center" display="block">
          Python Air Drop Platform v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Drawer Only */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              borderRight: '1px solid #333',
              bgcolor: '#1e1e1e',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default MLMSidebar;
