import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Skeleton,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';

interface MLMSidebarSkeletonProps {
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

const MLMSidebarSkeleton: React.FC<MLMSidebarSkeletonProps> = ({
  mobileOpen,
  onMobileToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Skeleton */}
      <Box sx={{
        p: { xs: 2, sm: 3 },
        background: '#1a1a1a',
        color: 'white',
        borderBottom: '1px solid #333'
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <Skeleton
              variant="circular"
              width={isMobile ? 32 : 40}
              height={isMobile ? 32 : 40}
              sx={{ bgcolor: '#333', mr: { xs: 1, sm: 2 }, border: '2px solid #555' }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Skeleton
                variant="text"
                width={120}
                height={isMobile ? 20 : 24}
                sx={{ bgcolor: '#333' }}
              />
              <Skeleton
                variant="text"
                width={80}
                height={isMobile ? 14 : 16}
                sx={{ bgcolor: '#333', mt: 0.5 }}
              />
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

      {/* Quick Stats Skeleton */}
      <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: '#2d2d2d', borderBottom: '1px solid #333' }}>
        <Skeleton
          variant="text"
          width={120}
          height={isMobile ? 18 : 20}
          sx={{ bgcolor: '#333', mb: { xs: 1.5, sm: 2 } }}
        />

        <Box display="flex" justifyContent="space-between" mb={1}>
          <Skeleton
            variant="text"
            width={100}
            height={isMobile ? 14 : 16}
            sx={{ bgcolor: '#333' }}
          />
          <Skeleton
            variant="text"
            width={60}
            height={isMobile ? 14 : 16}
            sx={{ bgcolor: '#333' }}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Skeleton
            variant="text"
            width={110}
            height={isMobile ? 14 : 16}
            sx={{ bgcolor: '#333' }}
          />
          <Skeleton
            variant="text"
            width={50}
            height={isMobile ? 14 : 16}
            sx={{ bgcolor: '#333' }}
          />
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Skeleton
            variant="text"
            width={80}
            height={isMobile ? 14 : 16}
            sx={{ bgcolor: '#333' }}
          />
          <Skeleton
            variant="text"
            width={20}
            height={isMobile ? 14 : 16}
            sx={{ bgcolor: '#333' }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu Skeleton */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ pt: 1 }}>
          {/* Dashboard Item */}
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                backgroundColor: '#333',
                borderLeft: '4px solid #ff9800',
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: '#555' }} />
              </ListItemIcon>
              <ListItemText>
                <Skeleton variant="text" width={80} height={20} sx={{ bgcolor: '#555' }} />
              </ListItemText>
            </ListItemButton>
          </ListItem>

          {/* Investments Section */}
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: '#333' }} />
              </ListItemIcon>
              <ListItemText>
                <Skeleton variant="text" width={100} height={20} sx={{ bgcolor: '#333' }} />
              </ListItemText>
              <Skeleton variant="circular" width={20} height={20} sx={{ bgcolor: '#333' }} />
            </ListItemButton>
          </ListItem>

          {/* Investment Sub-items */}
          {[1, 2, 3].map((item) => (
            <ListItem key={item} disablePadding sx={{ pl: 2 }}>
              <ListItemButton sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Skeleton variant="circular" width={20} height={20} sx={{ bgcolor: '#333' }} />
                </ListItemIcon>
                <ListItemText>
                  <Skeleton variant="text" width={120} height={18} sx={{ bgcolor: '#333' }} />
                </ListItemText>
              </ListItemButton>
            </ListItem>
          ))}

          {/* Team Management Section */}
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: '#333' }} />
              </ListItemIcon>
              <ListItemText>
                <Skeleton variant="text" width={130} height={20} sx={{ bgcolor: '#333' }} />
              </ListItemText>
              <Skeleton variant="circular" width={20} height={20} sx={{ bgcolor: '#333' }} />
            </ListItemButton>
          </ListItem>

          {/* Team Sub-items */}
          {[1, 2, 3].map((item) => (
            <ListItem key={item} disablePadding sx={{ pl: 2 }}>
              <ListItemButton sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Skeleton variant="circular" width={20} height={20} sx={{ bgcolor: '#333' }} />
                </ListItemIcon>
                <ListItemText>
                  <Skeleton variant="text" width={110} height={18} sx={{ bgcolor: '#333' }} />
                </ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer Skeleton */}
      <Box sx={{ p: 2, borderTop: '1px solid #333', bgcolor: '#1a1a1a' }}>
        <Skeleton variant="text" width={150} height={16} sx={{ bgcolor: '#333', mx: 'auto' }} />
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

export default MLMSidebarSkeleton;
