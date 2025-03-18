import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getNotifications, getFriendRequests } from '../services/api';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';

function NavBar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [notifications, setNotifications] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const handleNotificationsOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotifAnchorEl(null);
  };

  const handleProfileOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfile = () => {
    handleProfileClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleProfileClose();
    navigate('/settings');
  };

  const loadNotifications = async () => {
    try {
      // Safer way to handle potential API errors
      const [notifResponse, requestsResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/notifications/`, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${process.env.REACT_APP_API_URL}/friend-requests/`, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      // Check responses individually
      if (notifResponse.ok) {
        const notifData = await notifResponse.json();
        setNotifications(Array.isArray(notifData) ? notifData : []);
      } else {
        console.error('Failed to load notifications');
        setNotifications([]);
      }

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setFriendRequests(Array.isArray(requestsData) ? requestsData : []);
      } else {
        console.error('Failed to load friend requests');
        setFriendRequests([]);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      // Ensure we at least have empty arrays
      setNotifications([]);
      setFriendRequests([]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleAcceptFriend = async (requestId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/friends/accept/${requestId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      loadNotifications();
    } catch (err) {
      console.error('Failed to accept friend request:', err);
    }
  };

  const handleRejectFriend = async (requestId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/friends/reject/${requestId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      loadNotifications();
    } catch (err) {
      console.error('Failed to reject friend request:', err);
    }
  };

  return (
    <AppBar 
      position="relative"
      elevation={0}
      sx={{ 
        backgroundColor: '#171717',
        borderBottom: 'none',
        boxShadow: 'none',
        zIndex: 1300,
      }}
    >
      <Toolbar>
        {/* Logo */}
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: '800',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            fontFamily: "'Montserrat', sans-serif",
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }} 
          onClick={() => navigate('/home')}
        >
          <Box 
            component="span" 
            sx={{ 
              color: '#8b5cf6', 
              mr: 1,
              display: 'inline-flex'
            }}
          >
            🏆
          </Box>
          Roster Royals
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Notifications Button */}
          <IconButton
            color="inherit"
            onClick={handleNotificationsOpen}
            sx={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
            }}
          >
            <Badge 
              badgeContent={
                ((friendRequests && friendRequests.length) || 0) + 
                ((notifications && notifications.filter(n => !n.is_read).length) || 0)
              } 
              color="error"
              sx={{ 
                '& .MuiBadge-badge': {
                  display: ((friendRequests && friendRequests.length) || 0) + 
                          ((notifications && notifications.filter(n => !n.is_read).length) || 0) > 0 
                          ? 'flex' : 'none'
                }
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          {/* User Profile Button */}
          <Box
            onClick={handleProfileOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
              padding: '6px 12px',
              borderRadius: 2,
              transition: 'all 0.2s',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: '#8b5cf6',
                width: 32,
                height: 32,
              }}
            >
              {user?.username ? user.username[0].toUpperCase() : 'U'}
            </Avatar>
            <Typography variant="body1" sx={{ color: 'white', fontWeight: '500' }}>
              {user?.username || 'Profile'}
            </Typography>
          </Box>
        </Box>
        
        {/* Notifications Menu */}
        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={handleNotificationsClose}
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(25, 25, 35, 0.98)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              minWidth: '320px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderRadius: 2,
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* Friend Requests Section */}
          {friendRequests && friendRequests.length > 0 && (
            <>
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Friend Requests
                </Typography>
                <Box 
                  sx={{ 
                    backgroundColor: '#ef4444', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: 20, 
                    height: 20, 
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {friendRequests.length}
                </Box>
              </Box>
              
              {friendRequests.map((request) => (
                <Box 
                  key={request.id}
                  sx={{ 
                    p: 2, 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar 
                      sx={{ 
                        mr: 1.5, 
                        bgcolor: '#8b5cf6',
                        width: 36,
                        height: 36,
                      }}
                    >
                      {request.from_user.username[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: '500' }}>
                        {request.from_user.username}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Sent you a friend request
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAcceptFriend(request.id)}
                      sx={{
                        backgroundColor: '#10b981',
                        '&:hover': { backgroundColor: '#059669' },
                        borderRadius: 1,
                        fontWeight: '500',
                        fontSize: '0.75rem',
                        boxShadow: 'none',
                        py: 0.5,
                      }}
                    >
                      Accept
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleRejectFriend(request.id)}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        borderRadius: 1,
                        fontWeight: '500',
                        fontSize: '0.75rem',
                        py: 0.5,
                      }}
                    >
                      Decline
                    </Button>
                  </Box>
                </Box>
              ))}
            </>
          )}

          {/* Notifications Section */}
          {notifications && notifications.length > 0 ? (
            <>
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                borderTop: friendRequests && friendRequests.length > 0 ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Notifications
                </Typography>
                <Box 
                  sx={{ 
                    backgroundColor: notifications.filter(n => !n.is_read).length ? '#ef4444' : 'rgba(255, 255, 255, 0.2)', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: 20, 
                    height: 20, 
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {notifications.filter(n => !n.is_read).length || 0}
                </Box>
              </Box>

              {notifications.map((notification) => (
                <Box 
                  key={notification.id}
                  sx={{ 
                    p: 2, 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: notification.is_read ? 'transparent' : 'rgba(139, 92, 246, 0.05)',
                    '&:hover': { backgroundColor: notification.is_read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(139, 92, 246, 0.08)' }
                  }}
                >
                  <Typography variant="body1">
                    {notification.message}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
                    {new Date(notification.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              ))}
            </>
          ) : null}

          {/* Empty State */}
          {(!notifications || notifications.length === 0) && (!friendRequests || friendRequests.length === 0) && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <NotificationsIcon sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 30 }} />
              </Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                No new notifications
              </Typography>
            </Box>
          )}
        </Menu>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={handleProfileClose}
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(25, 25, 35, 0.98)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              minWidth: '200px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              borderRadius: 2,
              mt: 1.5,
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {user?.username || 'User'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {user?.points || 0} points
            </Typography>
          </Box>
          
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
          
          <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
            <PersonIcon sx={{ mr: 1.5, fontSize: 20, color: 'rgba(255, 255, 255, 0.7)' }} />
            <Typography>Profile</Typography>
          </MenuItem>
          
          <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
            <SettingsIcon sx={{ mr: 1.5, fontSize: 20, color: 'rgba(255, 255, 255, 0.7)' }} />
            <Typography>Settings</Typography>
          </MenuItem>
          
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
          
          <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#ef4444' }}>
            <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
            <Typography>Logout</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar; 