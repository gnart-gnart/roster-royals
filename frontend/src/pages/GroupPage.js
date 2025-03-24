import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  TextField,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  Divider,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import { 
  inviteToGroup, 
  getFriends, 
  getGroups, 
  getGroup, 
  getFriendRequests, 
  getNotifications, 
  handleFriendRequest, 
  handleGroupInvite, 
  markNotificationsRead 
} from '../services/api';

function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user')) || { username: '' };
  const isPresident = group?.president?.id === user?.id;
  const [members, setMembers] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  // Navbar state
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Profile menu state
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const profileMenuOpen = Boolean(profileAnchorEl);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load group data
        const groupData = await getGroup(id);
        setGroup(groupData);
        setMembers(groupData.members || []);
        
        // Load friends for invite functionality
        const friendsData = await getFriends();
        setFriends(friendsData);
        
        // Load notifications and friend requests for navbar
        loadFriendRequests();
        loadNotifications();
      } catch (err) {
        setError('Failed to load group data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

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

  const handleNotificationsOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotifAnchorEl(null);
    // Mark notifications as read when closing
    if (notifications.some(n => !n.is_read)) {
      markNotificationsRead();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAcceptFriend = async (requestId) => {
    try {
      await handleFriendRequest(requestId, 'accept');
      loadFriendRequests();
      // Trigger friends update
      window.dispatchEvent(new Event('friendsUpdated'));
    } catch (err) {
      console.error('Failed to accept friend request:', err);
    }
  };

  const handleRejectFriend = async (requestId) => {
    try {
      await handleFriendRequest(requestId, 'reject');
      loadFriendRequests();
    } catch (err) {
      console.error('Failed to reject friend request:', err);
    }
  };

  const handleGroupInviteAction = async (notificationId, inviteId, action) => {
    try {
      await handleGroupInvite(inviteId, action);
      
      // Remove the notification from the list
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      
      // Refresh groups list if accepted
      if (action === 'accept') {
        // Dispatch event before loading groups to ensure all listeners are notified
        window.dispatchEvent(new Event('groupsUpdated'));
        navigate('/home');
      }
    } catch (err) {
      console.error('Failed to handle group invite:', err);
    }
  };

  const handleInvite = async () => {
    if (selectedFriends.length === 0) return;
    
    try {
      const invitePromises = selectedFriends.map(friendId => 
        inviteToGroup(id, friendId)
      );
      
      await Promise.all(invitePromises);
      setInviteDialogOpen(false);
      setSelectedFriends([]);
    } catch (err) {
      console.error('Failed to invite friends:', err);
    }
  };

  const handleFriendSelect = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(prev => prev.filter(id => id !== friendId));
    } else {
      setSelectedFriends(prev => [...prev, friendId]);
    }
  };

  const handleSelectAllToggle = () => {
    if (selectAll) {
      setSelectedFriends([]);
    } else {
      const availableFriends = friends
        .filter(friend => !members.some(member => member.id === friend.id))
        .map(friend => friend.id);
      setSelectedFriends(availableFriends);
    }
    setSelectAll(!selectAll);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter friends based on search query
  const filteredFriends = friends
    .filter(friend => !members.some(member => member.id === friend.id))
    .filter(friend => 
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Profile menu handlers
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
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
              {user.username ? user.username[0].toUpperCase() : 'U'}
            </Avatar>
            <Typography variant="body2" sx={{ color: '#f8fafc' }}>
              {user.username}
            </Typography>
          </Box>
          
          {/* Logout */}
          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              sx={{ color: '#f8fafc' }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchorEl}
        open={profileMenuOpen}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            bgcolor: '#1E293B',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <MenuItem onClick={() => {
          navigate('/profile');
          handleProfileMenuClose();
        }}
        sx={{ 
          color: '#f8fafc',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
        }}>
          <ListItemIcon>
            <PersonIcon sx={{ color: '#f8fafc' }} />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => {
          navigate('/settings');
          handleProfileMenuClose();
        }}
        sx={{ 
          color: '#f8fafc',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
        }}>
          <ListItemIcon>
            <SettingsIcon sx={{ color: '#f8fafc' }} />
          </ListItemIcon>
          Settings
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(22, 28, 36, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
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
            <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 'bold' }}>
              Friend Requests
            </Typography>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            <List sx={{ p: 0 }}>
              {friendRequests.map((request) => (
                <React.Fragment key={request.id}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: '#8B5CF6' }}>
                        {request.from_user.username[0].toUpperCase()}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${request.from_user.username} wants to be friends`}
                      sx={{ color: '#f8fafc' }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        onClick={() => handleAcceptFriend(request.id)}
                        sx={{ 
                          minWidth: 'auto', 
                          bgcolor: '#8B5CF6',
                          color: 'white',
                          '&:hover': {
                            bgcolor: '#7C3AED',
                          }
                        }}
                      >
                        Accept
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => handleRejectFriend(request.id)}
                        sx={{ 
                          minWidth: 'auto',
                          color: '#f8fafc',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                          }
                        }}
                        variant="outlined"
                      >
                        Reject
                      </Button>
                    </Box>
                  </ListItem>
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                </React.Fragment>
              ))}
            </List>
          </>
        )}
        
        {/* Other Notifications */}
        {notifications.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 'bold' }}>
              Notifications
            </Typography>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem sx={{ 
                    py: 2,
                    bgcolor: notification.is_read ? 'transparent' : 'rgba(139, 92, 246, 0.1)'
                  }}>
                    <ListItemText 
                      primary={notification.message}
                      secondary={
                        notification.type === 'group_invite' ? (
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button 
                              size="small" 
                              onClick={() => handleGroupInviteAction(notification.id, notification.reference_id, 'accept')}
                              sx={{ 
                                minWidth: 'auto', 
                                bgcolor: '#8B5CF6',
                                color: 'white',
                                '&:hover': {
                                  bgcolor: '#7C3AED',
                                }
                              }}
                            >
                              Join
                            </Button>
                            <Button 
                              size="small" 
                              onClick={() => handleGroupInviteAction(notification.id, notification.reference_id, 'reject')}
                              sx={{ 
                                minWidth: 'auto',
                                color: '#f8fafc',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                '&:hover': {
                                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                                }
                              }}
                              variant="outlined"
                            >
                              Decline
                            </Button>
                          </Box>
                        ) : null
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                      sx={{ color: '#f8fafc' }}
                    />
                  </ListItem>
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                </React.Fragment>
              ))}
            </List>
          </>
        )}
        
        {friendRequests.length === 0 && notifications.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No notifications</Typography>
          </Box>
        )}
      </Menu>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        {/* Group Header with Back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/home')}
            sx={{
              color: '#f8fafc',
              textTransform: 'none',
              fontWeight: 'medium',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            Back
          </Button>
          
          <Typography variant="h4" sx={{ ml: 1, color: '#f8fafc', fontWeight: 'bold', flexGrow: 1 }}>
            {loading ? 'Loading...' : group?.name}
          </Typography>
        </Box>

        {/* Group description */}
        {!loading && group && (
          <Box 
            sx={{ 
              px: 2, 
              py: 3, 
              mb: 3,
              backgroundColor: 'rgba(22, 28, 36, 0.4)', 
              borderRadius: '8px',
              border: '1px solid rgba(30, 41, 59, 0.8)',
            }}
          >
            <Typography variant="body1" sx={{ color: '#CBD5E1' }}>
              {group.description || 'A group for testing various sports betting'}
          </Typography>
          </Box>
        )}

        {/* Main content area - split into two sections */}
        <Grid container spacing={3}>
          {/* Left side - Active Bets */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                Active Bets
              </Typography>
        {isPresident && (
            <Button
              variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/group/${id}/choose-bets`)}
                  sx={{
                    bgcolor: '#8B5CF6',
                    color: 'white',
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 'medium',
                    px: 2,
                    '&:hover': {
                      backgroundColor: '#7C3AED',
                    },
                  }}
                >
                  Place Bet
            </Button>
              )}
            </Box>
            
            {/* Empty state for bets */}
            <Box sx={{ p: 3, textAlign: 'center', color: '#6B7280', bgcolor: 'rgba(22, 28, 36, 0.4)', borderRadius: '8px', border: '1px solid rgba(30, 41, 59, 0.8)' }}>
              No bets available yet.
            </Box>
          </Grid>
          
          {/* Right side - Leaderboard */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                Leaderboard
              </Typography>
              {isPresident && (
            <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setInviteDialogOpen(true)}
              sx={{
                    borderColor: '#8B5CF6',
                    color: '#8B5CF6',
                    borderRadius: '20px',
                    textTransform: 'none',
                '&:hover': {
                      borderColor: '#7C3AED',
                      backgroundColor: 'rgba(139, 92, 246, 0.08)',
                },
              }}
            >
                  Invite
            </Button>
              )}
            </Box>
            
            <Box sx={{ 
              bgcolor: 'rgba(22, 28, 36, 0.4)', 
              borderRadius: '8px',
              border: '1px solid rgba(30, 41, 59, 0.8)',
              overflow: 'hidden'
            }}>
              {loading ? (
                <Box sx={{ p: 3, textAlign: 'center', color: '#6B7280' }}>
                  Loading members...
                </Box>
              ) : members.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', color: '#6B7280' }}>
                  No members yet
          </Box>
              ) : (
                <List disablePadding>
                  {members
                    .sort((a, b) => (b.points || 1500) - (a.points || 1500))
                    .map((member, index) => (
                      <ListItem 
                        key={member.id}
                        sx={{ 
                          py: 2, 
                          borderBottom: index === members.length - 1 ? 'none' : '1px solid rgba(30, 41, 59, 0.8)',
                        }}
                      >
                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                          <Typography 
                            sx={{ 
                              width: 30, 
                              fontWeight: 'bold', 
                              color: index < 3 ? '#FFD700' : '#CBD5E1',
                              textAlign: 'center' 
                            }}
                          >
                            {index + 1}
                          </Typography>
                          
                          <Avatar 
                            sx={{ 
                              bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#8B5CF6',
                              width: 36, 
                              height: 36, 
                              mx: 1,
                              fontSize: '16px',
                              color: index < 3 ? '#111827' : '#FFFFFF',
                            }}
                          >
                            {member.username ? member.username[0].toUpperCase() : 'U'}
                          </Avatar>
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography sx={{ color: '#f8fafc', fontWeight: 'medium' }}>
                                {member.username}
                              </Typography>
                              {group?.president?.id === member.id && (
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    ml: 1, 
                                    color: '#8B5CF6',
                                    bgcolor: 'rgba(139, 92, 246, 0.1)',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: '4px',
                                  }}
                                >
                                  President
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                              Win Rate: {Math.floor(Math.random() * 30) + 50}%
                            </Typography>
                          </Box>
                          
                          <Typography sx={{ color: '#10B981', fontWeight: 'bold' }}>
                            {member.points || (2500 - index * 150)}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                </List>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Invite Dialog */}
        <Dialog
          open={inviteDialogOpen}
          onClose={() => setInviteDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(22, 28, 36, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            color: '#f8fafc',
            maxWidth: '500px',
            width: '100%',
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Invite Friends to Join
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
              <TextField
            placeholder="Search friends"
                fullWidth
                value={searchQuery}
            onChange={handleSearch}
                InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#CBD5E1', mr: 1 }} />,
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#8B5CF6',
                  borderWidth: '2px',
                },
              }
            }}
          />
          
          {filteredFriends.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 2, color: '#CBD5E1' }}>
              {searchQuery ? 'No matching friends found' : 'No friends available to invite'}
            </Box>
          ) : (
            <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAll}
                    onChange={handleSelectAllToggle}
                    sx={{
                      color: '#CBD5E1',
                      '&.Mui-checked': {
                        color: '#8B5CF6',
                      },
                    }}
                />
              }
              label="Select All"
                sx={{ mb: 1, color: '#f8fafc' }}
              />
              <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
                {filteredFriends.map((friend) => (
                  <ListItem key={friend.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Checkbox
                      checked={selectedFriends.includes(friend.id)}
                        onChange={() => handleFriendSelect(friend.id)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked': {
                            color: '#8B5CF6',
                          },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: '#8B5CF6', 
                              width: 32, 
                              height: 32, 
                              mr: 1,
                              fontSize: '14px',
                            }}
                          >
                            {friend.username[0].toUpperCase()}
                          </Avatar>
                          <Typography sx={{ color: '#f8fafc' }}>
                            {friend.username}
                          </Typography>
                        </Box>
                      }
                    />
                </ListItem>
              ))}
              </List>
            </>
          )}
          </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
          <Button 
            onClick={() => setInviteDialogOpen(false)}
            sx={{ 
              color: '#CBD5E1',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
              Cancel
            </Button>
            <Button 
            onClick={handleInvite}
              disabled={selectedFriends.length === 0}
            sx={{
              backgroundColor: '#8B5CF6',
              color: 'white',
              '&:hover': {
                backgroundColor: '#7C3AED',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(139, 92, 246, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)',
              }
            }}
          >
            Send Invites
            </Button>
          </DialogActions>
        </Dialog>
              </Box>
  );
}

export default GroupPage; 