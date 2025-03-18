import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Collapse,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import GroupIcon from '@mui/icons-material/Group';
import { getGroups, getFriends, removeFriend } from '../services/api';
import GroupCard from '../components/GroupCard';
import NavBar from '../components/NavBar';

// Sport icons - import these at the top of your file
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsHockeyIcon from '@mui/icons-material/SportsHockey';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';

// Define sport categories with their icons and colors
const SPORTS_CATEGORIES = [
  { key: 'all', name: 'All Sports', icon: AllInclusiveIcon, color: '#8b5cf6' },
  { key: 'nba', name: 'NBA', icon: SportsBasketballIcon, color: '#8b5cf6' },
  { key: 'nfl', name: 'NFL', icon: SportsFootballIcon, color: '#2563eb' },
  { key: 'mlb', name: 'MLB', icon: SportsBaseballIcon, color: '#ef4444' },
  { key: 'soccer', name: 'Soccer', icon: SportsSoccerIcon, color: '#10b981' },
  { key: 'nhl', name: 'NHL', icon: SportsHockeyIcon, color: '#60a5fa' },
  { key: 'ufc', name: 'UFC', icon: SportsMmaIcon, color: '#f59e0b' },
];

function HomePage() {
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const FRIENDS_DISPLAY_LIMIT = 5;
  const navigate = useNavigate();

  // Load user data from localStorage when component mounts
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Load groups data
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const data = await getGroups();
        setGroups(data);
        setFilteredGroups(data); // Initially show all groups
      } catch (err) {
        console.error('Failed to load groups:', err);
        setError('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };
    
    loadGroups();
    
    // Add event listener for group updates
    const handleGroupsUpdated = () => {
      loadGroups();
    };
    
    window.addEventListener('groupsUpdated', handleGroupsUpdated);
    
    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('groupsUpdated', handleGroupsUpdated);
    };
  }, []);

  // Load friends data
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const data = await getFriends();
        setFriends(data);
      } catch (err) {
        console.error('Failed to load friends:', err);
      }
    };
    
    loadFriends();
  }, []);

  // Filter groups when selected sport changes
  useEffect(() => {
    if (selectedSport === 'all') {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(group => {
        // Get the sports array, handling both data structures
        const sports = group.sports && Array.isArray(group.sports) 
          ? group.sports 
          : (group.sport ? [group.sport] : []);
        
        // Check if the selected sport is in the sports array
        return sports.some(sport => sport.toLowerCase() === selectedSport.toLowerCase());
      });
      setFilteredGroups(filtered);
    }
  }, [selectedSport, groups]);

  // Handle sport tab change
  const handleSportChange = (event, newValue) => {
    setSelectedSport(newValue);
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await removeFriend(friendId);
      // Update friends list after removal
      setFriends(prevFriends => prevFriends.filter(friend => friend.id !== friendId));
    } catch (err) {
      console.error('Failed to remove friend:', err);
    }
  };

  const displayedFriends = showAllFriends 
    ? friends 
    : friends.slice(0, FRIENDS_DISPLAY_LIMIT);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#0f0f13',
    }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
        {/* Welcome Banner */}
        <Box 
          sx={{ 
            backgroundColor: 'rgba(25, 25, 35, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: 3,
            mb: 4,
            border: '1px solid rgba(139, 92, 246, 0.2)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 70%)' }} />
          <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0) 70%)' }} />
          
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#f8fafc' }}>
              Welcome back, {user?.username || 'Player'}!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Ready to make your predictions and win with friends?
            </Typography>
          </Box>
          <Button 
            variant="contained"
            onClick={() => navigate('/create-group')}
            sx={{ 
              backgroundColor: '#8b5cf6',
              '&:hover': {
                backgroundColor: '#7c3aed',
              },
              borderRadius: '12px',
              fontWeight: 'bold',
              px: 3,
              py: 1.5,
              boxShadow: '0 6px 15px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            Create Group
          </Button>
        </Box>

        {/* Sports Tabs Section */}
        <Box sx={{ 
          mb: 4, 
          borderRadius: '12px',
          backgroundColor: 'rgba(25, 25, 35, 0.6)',
          p: 1,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
        }}>
          <Tabs
            value={selectedSport}
            onChange={handleSportChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="sports tabs"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#8b5cf6',
                height: 3,
                borderRadius: '3px',
              },
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 2.5,
                py: 1.5,
                mx: 0.5,
                borderRadius: '10px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: '500',
                textTransform: 'none',
                fontSize: '0.95rem',
                '&.Mui-selected': {
                  color: '#ffffff',
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                },
                transition: 'all 0.2s ease',
              }
            }}
          >
            {SPORTS_CATEGORIES.map((sport) => {
              const SportIcon = sport.icon;
              const groupCount = sport.key === 'all' 
                ? groups.length 
                : groups.filter(g => {
                    const sports = g.sports && Array.isArray(g.sports) 
                      ? g.sports 
                      : (g.sport ? [g.sport] : []);
                    return sports.some(s => s.toLowerCase() === sport.key.toLowerCase());
                  }).length;
              
              return (
                <Tab 
                  key={sport.key}
                  value={sport.key}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{ 
                          mr: 1,
                          color: sport.color,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <SportIcon fontSize="small" />
                      </Box>
                      {sport.name}
                      {groupCount > 0 && (
                        <Box
                          component="span"
                          sx={{
                            ml: 1,
                            px: 1,
                            py: 0.25,
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            backgroundColor: 'rgba(139, 92, 246, 0.2)',
                            color: '#a78bfa',
                          }}
                        >
                          {groupCount}
                        </Box>
                      )}
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </Box>

        <Grid container spacing={4}>
          {/* Groups Section */}
          <Grid item xs={12} md={8}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3 
            }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                {selectedSport === 'all' ? 'Your Groups' : `${SPORTS_CATEGORIES.find(s => s.key === selectedSport)?.name} Groups`}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/create-group')}
                sx={{
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#f8fafc',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.6)',
                  },
                  borderRadius: 1,
                }}
              >
                Create Group
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ 
                textAlign: 'center', 
                p: 4, 
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <CircularProgress size={40} sx={{ color: '#8b5cf6' }} />
                <Typography sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Loading your groups...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ 
                p: 4,
                backgroundColor: 'rgba(220, 38, 38, 0.1)', 
                color: '#ef4444', 
                borderRadius: 2,
                border: '1px solid rgba(220, 38, 38, 0.3)'
              }}>
                {error}
              </Box>
            ) : filteredGroups.length === 0 ? (
              <Box sx={{ 
                p: 4,
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: 2,
                border: '1px solid rgba(139, 92, 246, 0.2)',
                textAlign: 'center'
              }}>
                <Box sx={{ 
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: '50%',
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <GroupIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, color: '#f8fafc' }}>
                  {selectedSport === 'all' ? 'No Groups Yet' : `No ${SPORTS_CATEGORIES.find(s => s.key === selectedSport)?.name} Groups`}
                </Typography>
                <Typography sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
                  {selectedSport === 'all' 
                    ? 'Create a group and invite your friends to start competing!' 
                    : `Create a group with ${SPORTS_CATEGORIES.find(s => s.key === selectedSport)?.name} to get started!`}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/create-group')}
                  sx={{
                    backgroundColor: '#8b5cf6',
                    '&:hover': {
                      backgroundColor: '#7c3aed',
                    },
                    borderRadius: 1,
                    px: 3,
                    py: 1.5
                  }}
                >
                  Create Group
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredGroups.map((group) => (
                  <Grid item xs={12} sm={6} key={group.id}>
                    <GroupCard
                      group={group}
                      onClick={() => navigate(`/group/${group.id}`)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          {/* Right Sidebar - Friends and Stats */}
          <Grid item xs={12} md={4}>
            {/* Friends Section */}
            <Box sx={{ 
              backgroundColor: 'rgba(25, 25, 35, 0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: 3,
              p: 3,
              mb: 4,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                  Friends
                </Typography>
                <Button
                  variant="text"
                  onClick={() => navigate('/add-friend')}
                  sx={{
                    color: '#8b5cf6',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    },
                    textTransform: 'none',
                    fontWeight: 'medium'
                  }}
                >
                  Add Friend
                </Button>
              </Box>
              
              {friends.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 3,
                  backgroundColor: 'rgba(0, 0, 0, 0.15)',
                  borderRadius: 2,
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  No friends added yet.
                </Box>
              ) : (
                <Box>
                  {friends.slice(0, 5).map((friend, index) => (
                    <Box 
                      key={friend.id || index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        mb: index < Math.min(friends.length, 5) - 1 ? 1 : 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.15)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Avatar sx={{ 
                        bgcolor: '#8b5cf6',
                        width: 36,
                        height: 36,
                        fontSize: '0.9rem',
                        mr: 2,
                        border: '2px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        {friend.username ? friend.username[0].toUpperCase() : 'U'}
                      </Avatar>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 'medium', color: '#f8fafc' }}>
                          {friend.username}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          {friend.points} points
                        </Typography>
                      </Box>
                      
                      <Chip
                        label="Online"
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          fontSize: '0.7rem',
                          height: 24,
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}
                      />
                    </Box>
                  ))}
                  
                  {friends.length > 5 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => navigate('/friends')}
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          },
                          textTransform: 'none',
                        }}
                      >
                        View all ({friends.length})
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Stats/Leaderboard Teaser */}
            <Box sx={{ 
              backgroundColor: 'rgba(25, 25, 35, 0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: 3,
              p: 3,
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ position: 'absolute', bottom: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 70%)' }} />
              
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc', mb: 3 }}>
                Your Stats
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  p: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' }}>
                    Total Bets
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#10b981' }}>
                    {user?.total_bets || 0}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  p: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' }}>
                    Win Rate
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#10b981' }}>
                    {user?.win_rate || '0%'}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  p: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' }}>
                    Current Points
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#10b981' }}>
                    {user?.points || 0}
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