import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
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
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { getLeagues, getFriends, removeFriend, getFriendRequests, getNotifications, handleFriendRequest, handleLeagueInvite, markNotificationsRead } from '../services/api';
import LeagueCard from '../components/LeagueCard';
import NavBar from '../components/NavBar';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

function HomePage() {
  const [leagues, setLeagues] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const profileMenuOpen = Boolean(profileAnchorEl);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: '' };

  const loadLeagues = async () => {
    try {
      const data = await getLeagues();
      setLeagues(data);
    } catch (err) {
      console.error('Failed to load leagues:', err);
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
        const [leaguesData, friendsData] = await Promise.all([
          getLeagues(),
          getFriends()
        ]);
        setLeagues(leaguesData);
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

    // Listen for league updates
    window.addEventListener('leaguesUpdated', loadLeagues);

    // Cleanup
    return () => {
      window.removeEventListener('friendsUpdated', handleFriendsUpdate);
      window.removeEventListener('leaguesUpdated', loadLeagues);
    };
  }, []);

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

  const handleLeagueInviteAction = async (inviteId, action) => {
    try {
      await handleLeagueInvite(inviteId, action);
      loadNotifications();
      if (action === 'accept') {
        window.dispatchEvent(new Event('leaguesUpdated'));
      }
    } catch (err) {
      console.error(`Failed to ${action} league invite:`, err);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const renderFeatureHighlights = () => {
    const features = [
      { label: "Active Leagues", value: leagues.length, icon: <EmojiEventsOutlinedIcon /> },
      { label: "Friends", value: friends.length, icon: <PeopleOutlineIcon /> },
      { label: "Notifications", value: notifications.filter(n => !n.is_read).length, icon: <NotificationsNoneIcon /> },
      { label: "Success Rate", value: "87%", icon: <ShowChartIcon /> },
    ];

    return (
      <Box 
        sx={{ 
          backgroundColor: 'rgba(22, 28, 36, 0.8)', 
          borderRadius: '8px',
          p: 2,
          mb: 4,
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
        }}
      >
        {features.map((feature, index) => (
          <Box 
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              px: 3,
              py: 1,
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                color: '#f8fafc',
              }}
            >
              {feature.icon}
            </Box>
            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
              {feature.value}
            </Typography>
            <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
              {feature.label}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
      <NavBar />
      
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
            onClick={() => navigate('/create-league')}
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
            Create League
          </Button>
        </Box>
        
        {/* Feature Highlights (replacing Sports Navigation Tabs) */}
        {renderFeatureHighlights()}
        
        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Leagues Section */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                Your Leagues
              </Typography>
              <Button
                startIcon={<AddIcon />}
                size="small"
                onClick={() => navigate('/create-league')}
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
                Create League
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ textAlign: 'center', mt: 4, color: '#CBD5E1' }}>Loading leagues...</Box>
            ) : error ? (
              <Box sx={{ color: 'error.main', mt: 4 }}>{error}</Box>
            ) : leagues.length === 0 ? (
              <Card sx={{
                backgroundColor: 'rgba(22, 28, 36, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: 'none',
              }}>
                <Box sx={{ p: 2, textAlign: 'center', color: '#CBD5E1' }}>No leagues yet. Create one!</Box>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {leagues.map((league) => (
                  <Grid item xs={12} key={league.id}>
                    <LeagueCard league={league} />
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