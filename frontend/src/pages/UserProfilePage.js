import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, 
  Typography, 
  Avatar, 
  Container, 
  Paper, 
  Grid, 
  Button, 
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LockIcon from '@mui/icons-material/Lock';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import NavBar from '../components/NavBar';
import { getOtherUserProfile, getOtherUserBettingStats } from '../services/api';

function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // State for user profile data
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for betting stats
  const [bettingStats, setBettingStats] = useState({
    total_bets: 0,
    win_rate: 0,
    current_streak: 0,
    lifetime_winnings: 0,
    user_level: 1,
    date_joined: '',
    stats_visible: {
      betting_history: true,
      win_rate: true
    }
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Function to get the proper image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If the URL is already absolute (starts with http or https), return it as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If the URL starts with /media/, prepend the API URL
    if (imageUrl.startsWith('/media/')) {
      return `${process.env.REACT_APP_API_URL}${imageUrl}`;
    }
    // Otherwise, assume it's a relative media path and construct the full URL
    return `${process.env.REACT_APP_API_URL}/media/${imageUrl.replace('media/', '')}`;
  };

  // Function to get user profile image source
  const getUserImageSource = (user) => {
    if (!user) return null;

    // Debug: Log the user object to see all available image-related properties
    console.log("User profile data:", user);
    if (user.profile_image_url) console.log("Profile image URL:", user.profile_image_url);
    if (user.profile_image) console.log("Profile image:", user.profile_image);
    
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    
    // If this is the current user, check for embedded image data
    if (user.id === currentUser.id) {
      // Try embedded image from user object first
      if (currentUser.embeddedImageData) {
        return currentUser.embeddedImageData;
      }
      
      // Then try session storage with user-specific key
      const userSpecificKey = `profileImageDataUrl_${user.id}`;
      const profileImageDataUrl = sessionStorage.getItem(userSpecificKey);
      if (profileImageDataUrl) {
        return profileImageDataUrl;
      }
    }
    
    // Check for profile_image_url (serialized property)
    if (user.profile_image_url) {
      return getImageUrl(user.profile_image_url);
    }
    
    // Check for profile_image (direct field from the view)
    if (user.profile_image) {
      return getImageUrl(user.profile_image);
    }
    
    // Return avatar API URL as fallback
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`;
  };
  
  // Fetch user profile and betting stats
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getOtherUserProfile(userId);
        console.log('Fetched user profile data:', userData);
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchBettingStats = async () => {
      try {
        setLoadingStats(true);
        const stats = await getOtherUserBettingStats(userId);
        setBettingStats(stats);
      } catch (error) {
        console.error('Failed to fetch betting stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    if (userId) {
      fetchUserData();
      fetchBettingStats();
    }
  }, [userId]);
  
  // Show loading state
  if (loading) {
    return (
      <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
        <NavBar />
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
          <CircularProgress sx={{ color: '#8B5CF6' }} />
        </Container>
      </Box>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
        <NavBar />
        <Container sx={{ pt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Container>
      </Box>
    );
  }
  
  // If user is null, show not found
  if (!user) {
    return (
      <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
        <NavBar />
        <Container sx={{ pt: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            User not found
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Container>
      </Box>
    );
  }
  
  // Get the image source for the user
  const userImageSource = getUserImageSource(user);
  console.log("Final user image source:", userImageSource);
  
  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
      <NavBar />
      
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            sx={{ 
              color: '#f8fafc',
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
            {user.username}'s Profile
          </Typography>
        </Box>
        
        {/* User Profile Content */}
        <Grid container spacing={3}>
          {/* Profile Overview */}
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                bgcolor: 'rgba(30, 41, 59, 0.7)', 
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar 
                  src={userImageSource}
                  sx={{ 
                    bgcolor: '#8B5CF6', 
                    width: 140, 
                    height: 140, 
                    fontSize: '56px', 
                    mb: 3,
                    border: '4px solid rgba(139, 92, 246, 0.2)'
                  }}
                >
                  {user.username?.[0]?.toUpperCase()}
                </Avatar>
                
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc', mb: 1 }}>
                  {user.username}
                </Typography>
                
                <Typography variant="body1" sx={{ color: '#94a3b8', mb: 3 }}>
                  Member since {bettingStats.date_joined}
                </Typography>
                
                <Chip 
                  label={`Level ${bettingStats.user_level}`}
                  sx={{ 
                    bgcolor: '#7C3AED', 
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    mb: 2
                  }}
                />
                
                {user.bio && (
                  <Typography variant="body1" sx={{ color: '#f8fafc', mt: 2 }}>
                    {user.bio}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Betting Stats */}
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                p: 4, 
                bgcolor: 'rgba(30, 41, 59, 0.7)', 
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc', mb: 3 }}>
                Betting Statistics
              </Typography>
              
              {loadingStats ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress sx={{ color: '#8B5CF6' }} />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Win Rate */}
                  <Grid item xs={6} sm={3}>
                    <Box 
                      sx={{ 
                        textAlign: 'center',
                        p: 2
                      }}
                    >
                      {bettingStats.stats_visible?.win_rate ? (
                        <>
                          <TrendingUpIcon sx={{ fontSize: 40, color: '#10B981', mb: 1 }} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                            {bettingStats.win_rate}%
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Win Rate
                          </Typography>
                        </>
                      ) : (
                        <>
                          <LockIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Win Rate Hidden
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Grid>
                  
                  {/* Current Streak */}
                  <Grid item xs={6} sm={3}>
                    <Box 
                      sx={{ 
                        textAlign: 'center',
                        p: 2
                      }}
                    >
                      {bettingStats.stats_visible?.betting_history ? (
                        <>
                          <WhatshotIcon sx={{ fontSize: 40, color: '#F59E0B', mb: 1 }} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                            {bettingStats.current_streak > 0 && '+'}
                            {bettingStats.current_streak}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Current Streak
                          </Typography>
                        </>
                      ) : (
                        <>
                          <LockIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Streak Hidden
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Grid>
                  
                  {/* Total Bets */}
                  <Grid item xs={6} sm={3}>
                    <Box 
                      sx={{ 
                        textAlign: 'center',
                        p: 2
                      }}
                    >
                      {bettingStats.stats_visible?.betting_history ? (
                        <>
                          <ScoreboardIcon sx={{ fontSize: 40, color: '#8B5CF6', mb: 1 }} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                            {bettingStats.total_bets}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Total Bets
                          </Typography>
                        </>
                      ) : (
                        <>
                          <LockIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Bets Hidden
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Grid>
                  
                  {/* Lifetime Winnings */}
                  <Grid item xs={6} sm={3}>
                    <Box 
                      sx={{ 
                        textAlign: 'center',
                        p: 2
                      }}
                    >
                      {bettingStats.stats_visible?.betting_history ? (
                        <>
                          <AttachMoneyIcon sx={{ fontSize: 40, color: '#60A5FA', mb: 1 }} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                            {bettingStats.lifetime_winnings}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Lifetime Winnings
                          </Typography>
                        </>
                      ) : (
                        <>
                          <LockIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Winnings Hidden
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default UserProfilePage; 