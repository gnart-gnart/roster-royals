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
import { getLeagues, getFriends, removeFriend, getFriendRequests, getNotifications, handleFriendRequest, handleLeagueInvite, markNotificationsRead, getUserBettingStats } from '../services/api';
import LeagueCard from '../components/LeagueCard';
import FriendsList from '../components/FriendsList';
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

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
  const [bettingStats, setBettingStats] = useState({
    total_bets: 0,
    win_rate: 0,
    current_streak: 0,
    lifetime_winnings: 0
  });
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

  const loadBettingStats = async () => {
    try {
      const stats = await getUserBettingStats();
      setBettingStats(stats);
    } catch (err) {
      console.error('Failed to load betting stats:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [leaguesData, friendsData, statsData] = await Promise.all([
          getLeagues(),
          getFriends(),
          getUserBettingStats()
        ]);
        setLeagues(leaguesData);
        setFriends(friendsData);
        setBettingStats(statsData);
        
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
      { 
        label: "Active Leagues", 
        value: leagues.length, 
        icon: <EmojiEventsOutlinedIcon />, 
        color: '#8B5CF6',
        tooltip: "Leagues you're currently participating in"
      },
      { 
        label: "Friends", 
        value: friends.length, 
        icon: <PeopleOutlineIcon />, 
        color: '#3B82F6',
        tooltip: "Your connected friends" 
      },
      { 
        label: "Notifications", 
        value: notifications.filter(n => !n.is_read).length, 
        icon: <NotificationsNoneIcon />, 
        color: '#F59E0B',
        tooltip: "Unread notifications awaiting your attention",
        onClick: handleNotificationsOpen,
      },
      { 
        label: "Win Rate", 
        value: bettingStats.win_rate ? `${bettingStats.win_rate}%` : "0%", 
        icon: <ShowChartIcon />, 
        color: '#10B981',
        tooltip: "Your prediction win rate" 
      },
    ];

    // Function to format the display value for better presentation
    const formatValue = (value) => {
      if (value === 0) return "0";
      if (value === "0%") return "0%";
      return value || "0";
    };

    return (
      <Box 
        sx={{ 
          background: 'linear-gradient(to right, rgba(17, 24, 39, 0.8), rgba(32, 39, 55, 0.8))',
          borderRadius: '12px',
          p: 3,
          mb: 4,
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
            opacity: 0.8,
            animation: 'pulse 15s infinite',
          },
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' },
            '100%': { transform: 'scale(1)' },
          },
        }}
      >
        <Grid container spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
          {features.map((feature, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Tooltip title={feature.tooltip} arrow placement="top">
                <Box 
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 2,
                    px: { xs: 1, sm: 2 },
                    height: '100%',
                    transition: 'transform 0.3s ease, filter 0.3s ease',
                    cursor: feature.onClick ? 'pointer' : 'default',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      filter: 'brightness(1.1)',
                    },
                    animation: `fadeIn 0.6s ease ${index * 0.2}s both`,
                    '@keyframes fadeIn': {
                      '0%': { opacity: 0, transform: 'translateY(10px)' },
                      '100%': { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                  onClick={feature.onClick}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5,
                      width: { xs: 46, sm: 50, md: 56 },
                      height: { xs: 46, sm: 50, md: 56 },
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${feature.color}80, ${feature.color})`,
                      color: '#ffffff',
                      boxShadow: `0 4px 12px ${feature.color}50`,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '-4px',
                        left: '-4px',
                        right: '-4px',
                        bottom: '-4px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${feature.color}30 0%, transparent 70%)`,
                        opacity: 0.6,
                        zIndex: -1,
                      },
                      '&:hover': {
                        transform: 'scale(1.15) rotate(5deg)',
                        boxShadow: `0 8px 20px ${feature.color}70`,
                      }
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: formatValue(feature.value) === "0" ? `${feature.color}90` : '#f8fafc', 
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                      mb: 0.5,
                      fontSize: { xs: '1.4rem', sm: '1.5rem', md: '1.8rem' },
                    }}
                  >
                    {formatValue(feature.value)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: feature.color, 
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                      textAlign: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                    }}
                  >
                    {feature.label}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
      <NavBar />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Enhanced Welcome Section with gradients and animations */}
        <Box sx={{ 
          p: 4, 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'rgba(30, 41, 59, 0.8)', 
          borderRadius: 3,
          border: '1px solid rgba(139, 92, 246, 0.1)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Decorative gradient elements */}
          <Box sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(30, 41, 59, 0) 70%)',
            filter: 'blur(40px)',
            zIndex: 0
          }} />
          
          <Box sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(30, 41, 59, 0) 70%)',
            filter: 'blur(30px)',
            zIndex: 0
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              color: '#f8fafc',
              textShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
              mb: 1,
              animation: 'fadeIn 0.6s ease'
            }}>
              Welcome back, {user.username}!
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#CBD5E1', 
              maxWidth: '80%',
              animation: 'fadeIn 0.8s ease'
            }}>
              Ready to make your predictions and win with friends?
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            onClick={() => navigate('/create-league')}
            sx={{ 
              bgcolor: 'rgba(139, 92, 246, 0.8)',
              color: '#ffffff',
              borderRadius: 2,
              px: 3,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 'bold',
              position: 'relative',
              zIndex: 1,
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
              '&:hover': {
                bgcolor: 'rgba(139, 92, 246, 1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
              },
              transition: 'all 0.3s ease',
              animation: 'fadeIn 1s ease'
            }}
          >
            Create League
          </Button>
        </Box>
        
        {/* Feature Highlights - Already well styled, keep it */}
        {renderFeatureHighlights()}
        
        {/* Main Content with enhanced styling */}
        <Grid container spacing={3}>
          {/* Leagues Section with improved card styling */}
          <Grid item xs={12} md={8}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: '60px',
                height: '3px',
                background: 'linear-gradient(90deg, #8B5CF6, #4F46E5)',
                borderRadius: '2px'
              }
            }}>
              <Typography variant="h6" sx={{ 
                color: '#f8fafc', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                  content: '""',
                  width: '6px',
                  height: '24px',
                  background: 'linear-gradient(180deg, #8B5CF6, #4F46E5)',
                  borderRadius: '3px',
                  marginRight: '10px',
                  display: 'inline-block'
                }
              }}>
                Your Leagues
              </Typography>
              <Button
                startIcon={<AddIcon />}
                size="small"
                onClick={() => navigate('/create-league')}
                sx={{
                  bgcolor: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#f8fafc',
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 2,
                  '&:hover': {
                    bgcolor: 'rgba(139, 92, 246, 0.2)',
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Create League
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ 
                textAlign: 'center', 
                mt: 4, 
                color: '#CBD5E1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px'
              }}>
                <Box sx={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '3px solid rgba(139, 92, 246, 0.2)',
                  borderTop: '3px solid #8B5CF6',
                  borderRadius: '50%',
                  mb: 2,
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
                Loading leagues...
              </Box>
            ) : error ? (
              <Box sx={{ 
                color: '#ef4444', 
                mt: 4, 
                p: 3, 
                bgcolor: 'rgba(239, 68, 68, 0.1)', 
                borderRadius: 2,
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                {error}
              </Box>
            ) : leagues.length === 0 ? (
              <Box sx={{
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                borderRadius: 3,
                border: '1px solid rgba(139, 92, 246, 0.1)',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                height: '200px',
                backdropFilter: 'blur(10px)'
              }}>
                <Box sx={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  bgcolor: 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <EmojiEventsOutlinedIcon sx={{ color: '#8B5CF6', fontSize: 30 }} />
                </Box>
                <Typography sx={{ 
                  color: '#CBD5E1', 
                  mb: 2, 
                  fontWeight: 'medium' 
                }}>
                  No leagues yet. Create one to get started!
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/create-league')}
                  sx={{
                    bgcolor: 'rgba(139, 92, 246, 0.8)',
                    color: '#ffffff',
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 3,
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                    '&:hover': {
                      bgcolor: 'rgba(139, 92, 246, 1)',
                    }
                  }}
                >
                  Create League
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {leagues.map((league, index) => (
                  <Grid 
                    item 
                    xs={12} 
                    key={league.id}
                    sx={{ 
                      animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
                      '@keyframes fadeInUp': {
                        '0%': { 
                          opacity: 0,
                          transform: 'translateY(20px)'
                        },
                        '100%': { 
                          opacity: 1,
                          transform: 'translateY(0)'
                        }
                      }
                    }}
                  >
                    <LeagueCard league={league} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
          
          {/* Friends Section with enhanced styling */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              bgcolor: 'rgba(30, 41, 59, 0.8)', 
              borderRadius: 3,
              border: '1px solid rgba(139, 92, 246, 0.1)',
              p: 0,
              overflow: 'hidden',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
              backdropFilter: 'blur(10px)',
              position: 'relative'
            }}>
              {/* Decorative gradient element */}
              <Box sx={{
                position: 'absolute',
                top: -80,
                right: -80,
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(30, 41, 59, 0) 70%)',
                filter: 'blur(30px)',
                zIndex: 0
              }} />
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 2,
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'relative',
                zIndex: 1
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#f8fafc', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    width: '4px',
                    height: '20px',
                    background: 'linear-gradient(180deg, #3B82F6, #2563EB)',
                    borderRadius: '2px',
                    marginRight: '8px',
                    display: 'inline-block'
                  }
                }}>
                  Friends
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/add-friend')}
                  sx={{
                    color: '#3B82F6',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    },
                  }}
                >
                  Add Friend
                </Button>
              </Box>
              
              {loading ? (
                <Box sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  color: '#CBD5E1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Box sx={{ 
                    width: '30px', 
                    height: '30px', 
                    border: '3px solid rgba(59, 130, 246, 0.2)',
                    borderTop: '3px solid #3B82F6',
                    borderRadius: '50%',
                    mb: 2,
                    animation: 'spin 1s linear infinite'
                  }} />
                  Loading friends...
                </Box>
              ) : error ? (
                <Box sx={{ 
                  p: 3, 
                  color: '#ef4444',
                  bgcolor: 'rgba(239, 68, 68, 0.1)', 
                  m: 2,
                  borderRadius: 2
                }}>
                  {error}
                </Box>
              ) : friends.length === 0 ? (
                <Box sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  color: '#CBD5E1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Box sx={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}>
                    <PeopleOutlineIcon sx={{ color: '#3B82F6', fontSize: 24 }} />
                  </Box>
                  <Typography sx={{ mb: 2 }}>
                    No friends yet. Add some!
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/add-friend')}
                    sx={{
                      color: '#3B82F6',
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: 'rgba(59, 130, 246, 0.6)',
                        bgcolor: 'rgba(59, 130, 246, 0.05)'
                      }
                    }}
                  >
                    Add Friend
                  </Button>
                </Box>
              ) : (
                <Box sx={{ 
                  maxHeight: 'calc(100vh - 400px)', 
                  overflowY: 'auto',
                  position: 'relative',
                  zIndex: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(59, 130, 246, 0.5)',
                    borderRadius: '10px',
                  }
                }}>
                  <FriendsList 
                    friends={friends} 
                    leagues={leagues}
                    onFriendRemoved={(friendId) => {
                      setFriends(prev => prev.filter(f => f.id !== friendId));
                    }}
                  />
                </Box>
              )}
            </Box>
            
            {/* Stats Section with enhanced styling */}
            <Box sx={{ 
              mt: 3,
              bgcolor: 'rgba(30, 41, 59, 0.8)', 
              borderRadius: 3,
              border: '1px solid rgba(139, 92, 246, 0.1)',
              p: 0,
              overflow: 'hidden',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
              backdropFilter: 'blur(10px)',
              position: 'relative'
            }}>
              {/* Decorative gradient element */}
              <Box sx={{
                position: 'absolute',
                bottom: -80,
                left: -80,
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(30, 41, 59, 0) 70%)',
                filter: 'blur(30px)',
                zIndex: 0
              }} />
              
              <Box sx={{ 
                p: 2,
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'relative',
                zIndex: 1
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#f8fafc', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    width: '4px',
                    height: '20px',
                    background: 'linear-gradient(180deg, #10B981, #059669)',
                    borderRadius: '2px',
                    marginRight: '8px',
                    display: 'inline-block'
                  }
                }}>
                  Your Stats
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 3, 
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(16, 185, 129, 0.05)'
                }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      mr: 2
                    }}>
                      <ShowChartIcon sx={{ color: '#10B981' }} />
                    </Box>
                    <Typography sx={{ color: '#CBD5E1', fontWeight: 'medium' }}>Total Bets</Typography>
                  </Box>
                  <Typography sx={{ 
                    color: '#10B981', 
                    fontWeight: 'bold',
                    fontSize: '1.25rem' 
                  }}>
                    {bettingStats.total_bets || 0}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                p: 3, 
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(16, 185, 129, 0.05)'
                }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      mr: 2
                    }}>
                      <TrendingUpIcon sx={{ color: '#10B981' }} />
                    </Box>
                    <Typography sx={{ color: '#CBD5E1', fontWeight: 'medium' }}>Win Rate</Typography>
                  </Box>
                  <Typography sx={{ 
                    color: '#10B981', 
                    fontWeight: 'bold',
                    fontSize: '1.25rem'
                  }}>
                    {bettingStats.win_rate ? `${bettingStats.win_rate}%` : '0%'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                p: 3,
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(16, 185, 129, 0.05)'
                }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      mr: 2
                    }}>
                      <AttachMoneyIcon sx={{ color: '#10B981' }} />
                    </Box>
                    <Typography sx={{ color: '#CBD5E1', fontWeight: 'medium' }}>Balance</Typography>
                  </Box>
                  <Typography sx={{ 
                    color: '#10B981', 
                    fontWeight: 'bold',
                    fontSize: '1.25rem'
                  }}>
                    ${user.money || 0}
                  </Typography>
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