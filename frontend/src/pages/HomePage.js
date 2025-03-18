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

function HomePage() {
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            borderRadius: 2,
            p: 3,
            mb: 4,
            border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#f8fafc' }}>
              Welcome back, {user?.username || 'Player'}!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Ready to make your predictions and win with friends?
            </Typography>
          </Box>
          <Box>
            <Button 
              variant="contained"
              onClick={() => navigate('/create-group')}
              sx={{ 
                backgroundColor: '#8b5cf6',
                '&:hover': {
                  backgroundColor: '#7c3aed',
                },
                borderRadius: 1,
                fontWeight: 'bold',
                px: 3,
                py: 1.5
              }}
            >
              Create Group
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Your Groups Section */}
          <Grid item xs={12} md={8}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3 
            }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                Your Groups
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
            ) : groups.length === 0 ? (
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
                  No Groups Yet
                </Typography>
                <Typography sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Create a group and invite your friends to start competing!
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
                  Create Your First Group
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {groups.map((group) => (
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
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              borderRadius: 2,
              p: 3,
              mb: 4,
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
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
              
              {/* Friends list would go here */}
              <Box sx={{ 
                textAlign: 'center', 
                py: 2, 
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                No friends added yet.
              </Box>
            </Box>

            {/* Stats/Leaderboard Teaser */}
            <Box sx={{ 
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderRadius: 2,
              p: 3,
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc', mb: 2 }}>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 1
                }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Total Bets
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#10b981' }}>
                    0
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  p: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 1
                }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Win Rate
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#10b981' }}>
                    0%
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