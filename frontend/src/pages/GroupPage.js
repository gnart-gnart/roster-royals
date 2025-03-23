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
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
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
          
          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton
              color="inherit"
              onClick={() => navigate('/settings')}
              sx={{ color: '#f8fafc' }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          {/* Profile */}
          <Box
            onClick={() => navigate('/profile')}
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
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Back button and group title */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/home')}
            sx={{
              mr: 2,
              backgroundColor: 'rgba(22, 28, 36, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(22, 28, 36, 0.8)',
              },
            }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
            {loading ? 'Loading...' : group?.name}
          </Typography>
        </Box>

        {/* Group description */}
        {!loading && group && (
          <Box 
            sx={{ 
              p: 3, 
              mb: 4, 
              backgroundColor: 'rgba(22, 28, 36, 0.6)', 
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography variant="body1" sx={{ color: '#CBD5E1' }}>
              {group.description || 'A group for testing various sports betting'}
          </Typography>
          </Box>
        )}

        {/* Action buttons */}
        {isPresident && (
          <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => setInviteDialogOpen(true)}
              sx={{
                backgroundColor: '#8B5CF6',
                color: 'white',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'medium',
                '&:hover': {
                  backgroundColor: '#7C3AED',
                },
              }}
            >
              Invite Members
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate(`/group/${id}/choose-bets`)}
              sx={{
                backgroundColor: 'rgba(22, 28, 36, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'medium',
                '&:hover': {
                  backgroundColor: 'rgba(22, 28, 36, 0.8)',
                },
              }}
            >
              Choose Bets
            </Button>
          </Box>
        )}

        {/* Leaderboard section */}
        <Typography variant="h5" sx={{ mb: 3, color: '#f8fafc', fontWeight: 'bold' }}>
              Leaderboard
            </Typography>
        <Box sx={{ mb: 4 }}>
          <Card sx={{
            backgroundColor: 'rgba(22, 28, 36, 0.6)', 
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'none',
            overflow: 'hidden',
          }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                Group Leaderboard
              </Typography>
            </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                    <TableCell 
                      sx={{ 
                        color: '#CBD5E1', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
                        paddingLeft: 3 
                      }}
                    >
                      Rank
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        color: '#CBD5E1', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
                      }}
                    >
                      Member
                    </TableCell>
                    <TableCell 
                      align="right" 
                      sx={{ 
                        color: '#CBD5E1', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
                        paddingRight: 3 
                      }}
                    >
                      Points
                    </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ color: '#CBD5E1' }}>
                        Loading members...
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ color: '#CBD5E1' }}>
                        No members yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member, index) => (
                      <TableRow key={member.id}>
                        <TableCell 
                          sx={{ 
                            color: '#f8fafc', 
                            borderBottom: index === members.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                            paddingLeft: 3
                          }}
                        >
                          {index + 1}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            borderBottom: index === members.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
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
                              {member.username ? member.username[0].toUpperCase() : 'U'}
                            </Avatar>
                            <Box>
                              <Typography sx={{ color: '#f8fafc' }}>
                            {member.username}
                              </Typography>
                              {group?.president?.id === member.id && (
                                <Typography variant="caption" sx={{ color: '#CBD5E1' }}>
                                (President)
                              </Typography>
                            )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell 
                          align="right" 
                          sx={{ 
                            color: '#10B981', 
                            fontWeight: 'bold',
                            borderBottom: index === members.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                            paddingRight: 3
                          }}
                        >
                          {member.points || 1500}
                        </TableCell>
                      </TableRow>
                    ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
          </Card>
        </Box>

        {/* Available Bets section */}
        <Typography variant="h5" sx={{ mb: 3, color: '#f8fafc', fontWeight: 'bold' }}>
              Available Bets
            </Typography>
            <Card sx={{
          backgroundColor: 'rgba(22, 28, 36, 0.6)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
        }}>
          <Box sx={{ p: 3, textAlign: 'center', color: '#CBD5E1' }}>
                No bets available yet.
              </Box>
            </Card>
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