import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Tooltip,
  ListItemIcon,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  EmojiEvents as EmojiEventsOutlinedIcon,
  Person as PersonIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HighlightOff as HighlightOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  getFriendRequests, 
  handleFriendRequest, 
  getNotifications,
  markNotificationsRead,
  handleLeagueInvite as processLeagueInvite,
  getLeagues,
} from '../services/api';

function NavBar() {
  const navigate = useNavigate();
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  // Add leagues state and loading function
  const [leagues, setLeagues] = useState([]);

  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const loadLeagues = async () => {
    try {
      const data = await getLeagues();
      setLeagues(data);
    } catch (err) {
      console.error('Failed to load leagues:', err);
    }
  };

  useEffect(() => {
    loadFriendRequests();
    loadNotifications();
    loadLeagues();  // Initial load

    // Listen for leagues update events
    window.addEventListener('leaguesUpdated', loadLeagues);

    return () => {
      window.removeEventListener('leaguesUpdated', loadLeagues);
    };
  }, []);

  const loadFriendRequests = async () => {
    try {
      const data = await getFriendRequests();
      setFriendRequests(data.requests);
    } catch (err) {
      console.error('Failed to load friend requests:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleAcceptFriend = async (requestId) => {
    try {
      await handleFriendRequest(requestId, 'accept');
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      loadNotifications();
      window.dispatchEvent(new Event('friendsUpdated'));
    } catch (err) {
      console.error('Failed to accept friend request:', err);
    }
  };

  const handleRejectFriend = async (requestId) => {
    try {
      await handleFriendRequest(requestId, 'reject');
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      console.error('Failed to reject friend request:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleNotificationsOpen = async (event) => {
    setNotifAnchorEl(event.currentTarget);
    
    // Log notification types for debugging
    if (notifications.length > 0) {
      console.log('Current notifications:');
      notifications.forEach(notif => {
        console.log(`ID: ${notif.id}, Type: ${notif.type}, Message: ${notif.message}`);
      });
    }
    
    if (notifications.some(n => !n.is_read)) {
      try {
        await markNotificationsRead();
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
      } catch (err) {
        console.error('Failed to mark notifications as read:', err);
      }
    }
  };

  const handleNotificationsClose = () => {
    setNotifAnchorEl(null);
    loadNotifications();
  };

  const handleLeagueInvite = async (notificationId, inviteId, action) => {
    try {
      await processLeagueInvite(inviteId, action);
      
      // Remove the notification from the list
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      
      // Refresh leagues list if accepted
      if (action === 'accept') {
        // Dispatch event before loading leagues to ensure all listeners are notified
        window.dispatchEvent(new Event('leaguesUpdated'));
        await loadLeagues();
        
        // Navigate to home page to see updated leagues
        navigate('/home');
      }
    } catch (err) {
      console.error('Failed to handle league invite:', err);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      p: 2, 
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      bgcolor: '#161821'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/home')}>
        <EmojiEventsOutlinedIcon sx={{ color: '#FFD700', mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
          ROSTER ROYALS
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Notifications */}
        <IconButton
          color="inherit"
          onClick={handleNotificationsOpen}
          sx={{ color: '#f8fafc' }}
        >
          <Badge badgeContent={friendRequests.length + notifications.filter(n => !n.is_read).length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        
        {/* Profile dropdown that combines Profile and Settings */}
        <Box
          onClick={handleProfileMenuOpen}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: '#8B5CF6',
              width: 32, 
              height: 32, 
              fontSize: '14px', 
              fontWeight: 'bold' 
            }}
          >
            {user?.username ? user.username[0].toUpperCase() : 'U'}
          </Avatar>
          <Typography variant="body2" sx={{ color: '#f8fafc' }}>
            {user?.username || 'Profile'}
          </Typography>
        </Box>
        
        {/* Logout Button */}
        <Tooltip title="Logout">
          <IconButton
            color="inherit"
            onClick={handleLogout}
            sx={{
              color: '#f8fafc',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(17, 24, 39, 0.98)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(55, 65, 81, 0.5)',
            color: '#f8fafc',
            minWidth: '200px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }
        }}
      >
        <MenuItem onClick={() => {
          handleProfileMenuClose();
          navigate('/profile');
        }}>
          <ListItemIcon>
            <PersonIcon sx={{ color: '#f8fafc' }} />
          </ListItemIcon>
          <Typography>Profile</Typography>
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleProfileMenuClose();
          navigate('/settings');
        }}>
          <ListItemIcon>
            <SettingsIcon sx={{ color: '#f8fafc' }} />
          </ListItemIcon>
          <Typography>Settings</Typography>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(17, 24, 39, 0.98)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(55, 65, 81, 0.5)',
            color: '#f8fafc',
            minWidth: '300px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }
        }}
      >
        {/* Friend Requests Section */}
        {friendRequests.length > 0 && (
          <>
            <Typography sx={{ p: 2, fontWeight: 'bold' }}>
              Friend Requests
            </Typography>
            <Divider />
            <List>
              {friendRequests.map((request) => (
                <ListItem key={request.id}>
                  <ListItemAvatar>
                    <Avatar>{request.from_user.username[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={request.from_user.username}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleAcceptFriend(request.id)}
                          sx={{ mr: 1 }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleRejectFriend(request.id)}
                        >
                          Reject
                        </Button>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Notifications Section */}
        {notifications.length > 0 && (
          <>
            <Typography sx={{ p: 2, fontWeight: 'bold' }}>
              Notifications
            </Typography>
            <Divider />
            <List>
              {notifications.map((notification) => {
                // Debug logging for each notification
                console.log(`Rendering notification ${notification.id}:`);
                console.log(`- Type:`, notification.type || notification.notification_type);
                console.log(`- Reference ID: ${notification.reference_id}`);
                console.log(`- Full notification:`, notification);
                
                // Get notification type from either type or notification_type field
                const notificationType = notification.type || notification.notification_type;
                
                // Check if this is a betting result notification by looking for win/loss keywords
                const isWinNotification = notification.message && 
                  (notification.message.toLowerCase().includes('won') || 
                   notification.message.toLowerCase().includes('win'));
                   
                const isLossNotification = notification.message && 
                  (notification.message.toLowerCase().includes('lost') || 
                   notification.message.toLowerCase().includes('loss'));
                
                return (
                <ListItem 
                  key={notification.id}
                  sx={{
                    backgroundColor: notification.is_read ? 'transparent' : 'rgba(96, 165, 250, 0.1)',
                    borderLeft: notificationType === 'league_invite' 
                      ? '4px solid #8B5CF6' 
                      : isWinNotification 
                        ? '4px solid #10B981' // Green for wins
                        : isLossNotification 
                          ? '4px solid #EF4444' // Red for losses
                          : 'none',
                    padding: '12px 16px', // More padding for better readability
                    marginBottom: '4px', // Add spacing between items
                  }}
                >
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {notificationType === 'league_invite' && (
                          <EmojiEventsOutlinedIcon sx={{ color: '#8B5CF6', mr: 1, fontSize: '1.1rem' }} />
                        )}
                        {isWinNotification && (
                          <CheckCircleOutlineIcon sx={{ color: '#10B981', mr: 1, fontSize: '1.1rem' }} />
                        )}
                        {isLossNotification && (
                          <HighlightOffIcon sx={{ color: '#EF4444', mr: 1, fontSize: '1.1rem' }} />
                        )}
                        <Typography sx={{ 
                          fontWeight: notificationType === 'league_invite' || isWinNotification || isLossNotification 
                            ? 'bold' 
                            : 'normal',
                          color: isWinNotification 
                            ? '#10B981' 
                            : isLossNotification 
                              ? '#EF4444'
                              : 'inherit',
                          fontSize: isWinNotification || isLossNotification ? '0.95rem' : 'inherit'
                        }}>
                          {notification.message}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      (notificationType === 'league_invite' || notification.requires_action) ? (
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleLeagueInvite(notification.id, notification.reference_id, 'accept')}
                            sx={{ 
                              mr: 1, 
                              bgcolor: '#8B5CF6',
                              '&:hover': {
                                bgcolor: '#7C3AED'
                              }
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleLeagueInvite(notification.id, notification.reference_id, 'reject')}
                            sx={{ 
                              borderColor: '#EF4444',
                              color: '#EF4444',
                              '&:hover': {
                                borderColor: '#DC2626',
                                bgcolor: 'rgba(239, 68, 68, 0.04)'
                              }
                            }}
                          >
                            Decline
                          </Button>
                        </Box>
                      ) : new Date(notification.created_at).toLocaleDateString()
                    }
                  />
                </ListItem>
              )})}
            </List>
          </>
        )}

        {friendRequests.length === 0 && notifications.length === 0 && (
          <Typography sx={{ p: 2, textAlign: 'center' }}>
            No new notifications
          </Typography>
        )}
      </Menu>
    </Box>
  );
}

export default NavBar; 