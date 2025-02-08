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
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  getFriendRequests, 
  handleFriendRequest, 
  getNotifications,
  markNotificationsRead,
  handleGroupInvite as handleGroupInviteAPI
} from '../services/api';

function NavBar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadFriendRequests();
    loadNotifications();
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

  const handleGroupInvite = async (inviteId, action) => {
    try {
      await handleGroupInviteAPI(inviteId, action);
      // Remove the notification from the list
      setNotifications(prev => 
        prev.filter(n => !(n.type === 'group_invite' && n.id === inviteId))
      );
      // Refresh groups list if accepted
      if (action === 'accept') {
        window.dispatchEvent(new Event('groupsUpdated'));
      }
    } catch (err) {
      console.error('Failed to handle group invite:', err);
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(8px)' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/home')}>
          Roster Royals
        </Typography>

        <Box>
          <IconButton
            color="inherit"
            onClick={handleNotificationsOpen}
          >
            <Badge badgeContent={friendRequests.length + notifications.filter(n => !n.is_read).length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <AccountCircle />
          </IconButton>
        </Box>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={handleNotificationsClose}
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              color: '#f8fafc',
              minWidth: '300px',
              maxHeight: '80vh',
              overflowY: 'auto'
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
                {notifications.map((notification) => (
                  <ListItem 
                    key={notification.id}
                    sx={{
                      backgroundColor: notification.is_read ? 'transparent' : 'rgba(96, 165, 250, 0.1)',
                    }}
                  >
                    <ListItemText 
                      primary={notification.message}
                      secondary={
                        notification.type === 'group_invite' ? (
                          <Box sx={{ mt: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleGroupInvite(notification.id, 'accept')}
                              sx={{ mr: 1 }}
                            >
                              Accept
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleGroupInvite(notification.id, 'reject')}
                            >
                              Reject
                            </Button>
                          </Box>
                        ) : new Date(notification.created_at).toLocaleDateString()
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {friendRequests.length === 0 && notifications.length === 0 && (
            <Typography sx={{ p: 2, textAlign: 'center' }}>
              No new notifications
            </Typography>
          )}
        </Menu>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              color: '#f8fafc',
            }
          }}
        >
          <MenuItem onClick={() => navigate('/profile')}>
            <AccountCircle sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={() => navigate('/settings')}>
            <SettingsIcon sx={{ mr: 1 }} />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar; 