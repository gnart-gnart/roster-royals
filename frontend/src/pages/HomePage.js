import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Chip,
  IconButton,
  Menu,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { getGroups, getFriends, removeFriend, getFriendRequests, getNotifications, handleFriendRequest, handleGroupInvite, markNotificationsRead } from '../services/api';
import GroupCard from '../components/GroupCard';
import NavBar from '../components/NavBar';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import InfiniteIcon from '@mui/icons-material/AllInclusiveOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

function HomePage() {
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: '' };

  const loadGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  };

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [groupsData, friendsData] = await Promise.all([
          getGroups(),
          getFriends()
        ]);
        setGroups(groupsData);
        setFriends(friendsData);
        
        // Also load notifications and friend requests
        loadFriendRequests();
        loadNotifications();
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Add event listener for friend updates
    const handleFriendsUpdate = () => {
      getFriends().then(friendsData => setFriends(friendsData));
    };

    window.addEventListener('friendsUpdated', handleFriendsUpdate);

    // Listen for group updates
    window.addEventListener('groupsUpdated', loadGroups);

    // Cleanup
    return () => {
      window.removeEventListener('friendsUpdated', handleFriendsUpdate);
      window.removeEventListener('groupsUpdated', loadGroups);
    };
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
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

  const handleGroupInviteAction = async (inviteId, action) => {
    try {
      await handleGroupInvite(inviteId, action);
      loadNotifications();
      if (action === 'accept') {
        window.dispatchEvent(new Event('groupsUpdated'));
      }
    } catch (err) {
      console.error(`Failed to ${action} group invite:`, err);
    }
  };

  const renderSportTabs = () => {
    const sportTabs = [
      { label: "All Sports", icon: <InfiniteIcon />, count: "1" },
      { label: "NBA", icon: "🏀", count: "1" },
      { label: "NFL", icon: "🏈", count: "1" },
      { label: "MLB", icon: "⚾", count: null },
      { label: "Soccer", icon: "⚽", count: null },
      { label: "NHL", icon: "🏒", count: null },
      { label: "UFC", icon: "🥊", count: null },
    ];

    return (
      <Box 
        sx={{ 
          backgroundColor: 'rgba(22, 28, 36, 0.8)', 
          borderRadius: '8px',
          p: 1,
          mb: 4,
          overflowX: 'auto',
          display: 'flex',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}
      >
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{
            style: { display: 'none' }
          }}
          sx={{ 
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              minHeight: '36px',
              borderRadius: '18px',
              mr: 1,
              color: '#CBD5E1',
              '&.Mui-selected': {
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                color: '#f8fafc',
              }
            }
          }}
        >
          {sportTabs.map((tab, index) => (
            <Tab 
              key={index} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{typeof tab.icon === 'string' ? tab.icon : tab.icon}</span>
                  {tab.label}
                  {tab.count && 
                    <Badge 
                      badgeContent={tab.count} 
                      color="primary"
                      sx={{ 
                        '& .MuiBadge-badge': {
                          fontSize: '10px',
                          height: '18px',
                          minWidth: '18px',
                          borderRadius: '9px',
                          backgroundColor: 'rgba(139, 92, 246, 0.8)',
                        }
                      }}
                    />
                  }
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>
    );
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
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#8B5CF6' }}>
                          {request.from_user.username[0].toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
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
                                onClick={() => handleGroupInviteAction(notification.reference_id, 'accept')}
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
                                onClick={() => handleGroupInviteAction(notification.reference_id, 'reject')}
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
        {/* Welcome Section */}
        <Box sx={{ 
          p: 3, 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'rgba(22, 28, 36, 0.6)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
              Welcome back, {user.username}!
            </Typography>
            <Typography variant="body1" sx={{ color: '#CBD5E1', mt: 1 }}>
              Ready to make your predictions and win with friends?
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            onClick={() => navigate('/create-group')}
            sx={{ 
              bgcolor: '#8B5CF6', 
              borderRadius: '8px',
              px: 3,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#7C3AED',
              }
            }}
          >
            Create Group
          </Button>
        </Box>
        
        {/* Sports Navigation Tabs */}
        {renderSportTabs()}
        
        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Groups Section */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                Your Groups
              </Typography>
              <Button
                startIcon={<AddIcon />}
                size="small"
                onClick={() => navigate('/create-group')}
                sx={{
                  backgroundColor: 'rgba(22, 28, 36, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  borderRadius: '20px',
                  textTransform: 'none',
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(22, 28, 36, 0.9)',
                  },
                }}
              >
                Create Group
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ textAlign: 'center', mt: 4, color: '#CBD5E1' }}>Loading groups...</Box>
            ) : error ? (
              <Box sx={{ color: 'error.main', mt: 4 }}>{error}</Box>
            ) : groups.length === 0 ? (
              <Card sx={{
                backgroundColor: 'rgba(22, 28, 36, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: 'none',
              }}>
                <Box sx={{ p: 2, textAlign: 'center', color: '#CBD5E1' }}>No groups yet. Create one!</Box>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {groups.map((group) => (
                  <Grid item xs={12} key={group.id}>
                    <Card 
                      onClick={() => navigate(`/group/${group.id}`)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: 'rgba(22, 28, 36, 0.6)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: 'none',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(22, 28, 36, 0.8)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 1 }}>
                              {group.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                              {group.sports && group.sports.length > 0 ? (
                                group.sports.map(sport => (
                                  <Chip
                                    key={sport}
                                    label={sport.toUpperCase()}
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(251, 191, 36, 0.1)',
                                      border: '1px solid rgba(251, 191, 36, 0.2)',
                                      color: '#FBBF24',
                                      fontSize: '12px',
                                      height: '24px',
                                      fontWeight: 'medium',
                                    }}
                                  />
                                ))
                              ) : (
                                <>
                                  <Chip
                                    label="NFL"
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(251, 191, 36, 0.1)',
                                      border: '1px solid rgba(251, 191, 36, 0.2)',
                                      color: '#FBBF24',
                                      fontSize: '12px',
                                      height: '24px',
                                      fontWeight: 'medium',
                                    }}
                                  />
                                  <Chip
                                    label="NBA"
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(251, 191, 36, 0.1)',
                                      border: '1px solid rgba(251, 191, 36, 0.2)',
                                      color: '#FBBF24',
                                      fontSize: '12px',
                                      height: '24px',
                                      fontWeight: 'medium',
                                    }}
                                  />
                                </>
                              )}
                            </Box>
                          </Box>
                          <Chip
                            label="No active bets"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(100, 100, 100, 0.15)',
                              color: 'rgba(255, 255, 255, 0.5)',
                              fontSize: '12px',
                              height: '24px',
                            }}
                            icon={<Box sx={{ width: 6, height: 6, bgcolor: '#777', borderRadius: '50%', ml: 1 }} />}
                          />
                        </Box>

                        {/* Divider line */}
                        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                        
                        {/* Bottom section with members and avatar */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#CBD5E1', mr: 2 }}>
                              {group.members?.length || 1} member{(group.members?.length || 1) !== 1 ? 's' : ''}
                            </Typography>
                            
                            {/* Member avatars - shown in an overlapping stack */}
                            <Box sx={{ display: 'flex' }}>
                              {/* First show the president avatar */}
                              <Avatar 
                                sx={{ 
                                  bgcolor: '#8B5CF6', 
                                  width: 28, 
                                  height: 28, 
                                  fontSize: '14px',
                                  border: '2px solid #161E2E',
                                }}
                              >
                                {/* Use first letter of president's username if available */}
                                {group.president?.username?.[0]?.toUpperCase() || 'G'}
                              </Avatar>
                              
                              {/* Add additional avatars if there are more members */}
                              {group.members && group.members.length > 1 && (
                                <Avatar 
                                  sx={{ 
                                    bgcolor: '#60A5FA', 
                                    width: 28, 
                                    height: 28, 
                                    fontSize: '14px',
                                    border: '2px solid #161E2E',
                                    ml: -1,
                                  }}
                                >
                                  {/* Just use a generic letter for other members */}
                                  B
                                </Avatar>
                              )}
                              
                              {/* Show a count avatar if there are more than 2 members */}
                              {group.members && group.members.length > 2 && (
                                <Avatar 
                                  sx={{ 
                                    bgcolor: 'rgba(255, 255, 255, 0.1)', 
                                    color: '#CBD5E1',
                                    width: 28, 
                                    height: 28, 
                                    fontSize: '12px',
                                    ml: -1,
                                    border: '2px solid #161E2E',
                                  }}
                                >
                                  +{group.members.length - 2}
                                </Avatar>
                              )}
                            </Box>
                          </Box>
                          
                          {/* Add a circular icon for the user's avatar like in your mockup - changed to yellow/gold */}
                          <Avatar 
                            sx={{ 
                              bgcolor: '#FBBF24', 
                              width: 32, 
                              height: 32, 
                              fontSize: '16px', 
                              fontWeight: 'bold',
                            }}
                          >
                            G
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
          
          {/* Friends Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              bgcolor: 'rgba(22, 28, 36, 0.6)', 
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              p: 0,
              overflow: 'hidden',
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 2,
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                Friends
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/add-friend')}
                sx={{
                    color: '#8B5CF6',
                    textTransform: 'none',
                    fontWeight: 'bold',
                  '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.08)',
                  },
                }}
              >
                Add Friend
              </Button>
            </Box>
              
              {loading ? (
                <Box sx={{ p: 2, textAlign: 'center', color: '#CBD5E1' }}>Loading friends...</Box>
              ) : error ? (
                <Box sx={{ p: 2, color: 'error.main' }}>{error}</Box>
              ) : friends.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center', color: '#CBD5E1' }}>No friends yet. Add some!</Box>
              ) : (
                <Box sx={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
                  {friends.map((friend) => (
                    <Box 
                      key={friend.id}
                              sx={{
                        p: 2, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        '&:last-child': {
                          borderBottom: 'none',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: '#8B5CF6', 
                            width: 36, 
                            height: 36, 
                            fontSize: '16px',
                            mr: 2,
                          }}
                        >
                          {friend.username ? friend.username[0].toUpperCase() : 'U'}
                        </Avatar>
                        <Box>
                          <Typography sx={{ color: '#f8fafc', fontWeight: 'medium' }}>
                            {friend.username}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                            {friend.points || 1200} points
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label="Online" 
                        size="small"
                        sx={{
                          bgcolor: 'rgba(16, 185, 129, 0.1)', 
                          color: '#10B981',
                          fontSize: '12px',
                          height: '24px',
                          borderRadius: '12px',
                        }} 
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            
            {/* Stats Section */}
            <Box sx={{ 
              mt: 3,
              bgcolor: 'rgba(22, 28, 36, 0.6)', 
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              p: 0,
              overflow: 'hidden',
            }}>
              <Box sx={{ 
                p: 2,
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                  Your Stats
                </Typography>
              </Box>
              
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: '#CBD5E1' }}>Total Bets</Typography>
                  <Typography sx={{ color: '#10B981', fontWeight: 'bold' }}>0</Typography>
                </Box>
              </Box>
              
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: '#CBD5E1' }}>Win Rate</Typography>
                  <Typography sx={{ color: '#10B981', fontWeight: 'bold' }}>0%</Typography>
                </Box>
              </Box>
              
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: '#CBD5E1' }}>Current Points</Typography>
                  <Typography sx={{ color: '#10B981', fontWeight: 'bold' }}>1500</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage; 