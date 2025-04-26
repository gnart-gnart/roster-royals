import React, { useState, useEffect, useCallback } from 'react';
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
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NavBar from '../components/NavBar';
import { getOtherUserProfile, getOtherUserBettingStats, getOtherUserBetHistory } from '../services/api';

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
      win_rate: true,
      stats: true,
      achievements: true
    }
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // State for user bet history
  const [betHistory, setBetHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorHistory, setErrorHistory] = useState('');
  
  // State for achievements
  const [achievements, setAchievements] = useState([]);
  
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
        
        // Set visibility flags based on server response
        const statsVisibility = {
          betting_history: stats.stats_visible !== false,  // Default to true if not specified
          win_rate: stats.stats_visible !== false,         // Default to true if not specified
          stats: stats.stats_visible !== false,            // Default to true if not specified
          achievements: stats.stats_visible !== false      // Default to true if not specified
        };
        
        // If user has specific settings that were returned from server
        if (stats.settings) {
          // Update visibility based on user settings from the server
          statsVisibility.betting_history = stats.settings.showHistory !== false;
          statsVisibility.win_rate = stats.settings.showWinRate !== false;
          statsVisibility.stats = stats.settings.showStats !== false;
          statsVisibility.achievements = stats.settings.showAchievements !== false;
        }
        
        setBettingStats({
          ...stats,
          stats_visible: statsVisibility
        });
      } catch (error) {
        console.error('Failed to fetch betting stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    const fetchBetHistory = async () => {
      try {
        setLoadingHistory(true);
        const history = await getOtherUserBetHistory(userId);
        setBetHistory(history);
      } catch (error) {
        console.error('Failed to fetch bet history:', error);
        setErrorHistory('Failed to load betting history');
      } finally {
        setLoadingHistory(false);
      }
    };
    
    if (userId) {
      fetchUserData();
      fetchBettingStats();
      fetchBetHistory();
    }
  }, [userId]);
  
  // Calculate achievements based on bet history and user stats
  const calculateAchievements = useCallback(() => {
    // Helper function to safely format dates
    const safeFormatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      } catch (e) {
        console.error('Error formatting date:', e);
        return '';
      }
    };

    // Default achievements with unlocked state
    const achievementsList = [
      { 
        id: 1, 
        name: 'First Win', 
        description: 'Win your first bet', 
        icon: '🏆', 
        unlocked: false,
        unlockedDate: null
      },
      { 
        id: 2, 
        name: 'Hot Streak', 
        description: 'Win 5 bets in a row', 
        icon: '🔥', 
        unlocked: false,
        unlockedDate: null
      },
      { 
        id: 3, 
        name: 'Big Spender', 
        description: 'Place a bet of 500 points or more', 
        icon: '💰', 
        unlocked: false,
        unlockedDate: null
      },
      {
        id: 4,
        name: 'Big Winner',
        description: 'Accumulate $1000 in lifetime winnings',
        icon: '💵',
        unlocked: false,
        unlockedDate: null
      },
      {
        id: 5,
        name: 'High Roller',
        description: 'Win a bet with payout over 1000',
        icon: '💎',
        unlocked: false,
        unlockedDate: null
      }
    ];

    // If history is hidden or not available, return default achievements
    if (!bettingStats.stats_visible?.betting_history || !betHistory || betHistory.length === 0) {
      return achievementsList;
    }

    // 1. First Win achievement
    const hasWin = betHistory.some(bet => bet.result.toLowerCase() === 'won');
    if (hasWin) {
      const firstWin = betHistory
        .filter(bet => bet.result.toLowerCase() === 'won')
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      
      achievementsList[0].unlocked = true;
      achievementsList[0].unlockedDate = safeFormatDate(firstWin.date);
    }

    // 2. Hot Streak achievement
    // Find consecutive wins
    let maxStreak = 0;
    let currentStreak = 0;
    let streakEndDate = null;

    // Sort bets by date
    const sortedBets = [...betHistory].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedBets.forEach(bet => {
      if (bet.result.toLowerCase() === 'won') {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          streakEndDate = bet.date;
        }
      } else {
        currentStreak = 0;
      }
    });

    if (maxStreak >= 5) {
      achievementsList[1].unlocked = true;
      achievementsList[1].unlockedDate = safeFormatDate(streakEndDate);
    }

    // 3. Big Spender achievement
    const bigBet = betHistory.some(bet => {
      const amount = parseFloat(typeof bet.amount === 'string' ? bet.amount.replace(/[^0-9.-]+/g, '') : bet.amount || 0);
      return amount >= 500;
    });

    if (bigBet) {
      const firstBigBet = betHistory
        .filter(bet => {
          const amount = parseFloat(typeof bet.amount === 'string' ? bet.amount.replace(/[^0-9.-]+/g, '') : bet.amount || 0);
          return amount >= 500;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      
      achievementsList[2].unlocked = true;
      achievementsList[2].unlockedDate = safeFormatDate(firstBigBet.date);
    }

    // 4. Big Winner achievement
    if (bettingStats.lifetime_winnings >= 1000) {
      // For unlocked date, use the date of the most recent bet as an approximation
      const latestBet = betHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      achievementsList[3].unlocked = true;
      achievementsList[3].unlockedDate = safeFormatDate(latestBet?.date);
    }

    // 5. High Roller achievement
    const highPayoutBet = betHistory.some(bet => {
      if (bet.result.toLowerCase() !== 'won') return false;
      const payout = parseFloat(typeof bet.payout === 'string' ? bet.payout.replace(/[^0-9.-]+/g, '') : bet.payout || 0);
      return payout >= 1000;
    });

    if (highPayoutBet) {
      const firstHighPayout = betHistory
        .filter(bet => {
          if (bet.result.toLowerCase() !== 'won') return false;
          const payout = parseFloat(typeof bet.payout === 'string' ? bet.payout.replace(/[^0-9.-]+/g, '') : bet.payout || 0);
          return payout >= 1000;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      
      achievementsList[4].unlocked = true;
      achievementsList[4].unlockedDate = safeFormatDate(firstHighPayout.date);
    }

    return achievementsList;
  }, [betHistory, bettingStats]);

  // Update achievements when bet history changes
  useEffect(() => {
    setAchievements(calculateAchievements());
  }, [betHistory, calculateAchievements]);
  
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
          <IconButton 
            sx={{ 
              color: '#f8fafc',
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
            {user.username}'s Profile
          </Typography>
        </Box>
        
        {/* Profile Overview and Stats */}
        <Grid container spacing={3}>
          {/* Left Column - Profile Info */}
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                bgcolor: 'rgba(30, 41, 59, 0.7)', 
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                mb: 3
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                position: 'relative'
              }}>
                <Avatar 
                  src={userImageSource}
                  sx={{ 
                    bgcolor: '#8B5CF6', 
                    width: 120, 
                    height: 120, 
                    fontSize: '48px', 
                    mb: 3,
                    border: '4px solid rgba(139, 92, 246, 0.3)',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  {user.username?.[0]?.toUpperCase()}
                </Avatar>
                
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc', mb: 1 }}>
                  {user.username}
                </Typography>
                
                <Typography variant="body1" sx={{ color: '#94a3b8', mb: 2 }}>
                  Member since {bettingStats.date_joined}
                </Typography>
                
                <Chip 
                  label={`Level ${bettingStats.user_level}`}
                  sx={{ 
                    bgcolor: '#7C3AED', 
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    py: 0.5,
                    mb: 2
                  }}
                />
                
                {user.bio && (
                  <Typography variant="body1" sx={{ color: '#f8fafc', mt: 1, mx: 'auto', maxWidth: '90%' }}>
                    {user.bio}
                  </Typography>
                )}
              </Box>
            </Paper>
            
            {/* Betting Stats - Vertical Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {loadingStats ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress sx={{ color: '#8B5CF6' }} />
                </Box>
              ) : !bettingStats.stats_visible?.stats ? (
                <Paper sx={{ 
                  p: 3, 
                  bgcolor: 'rgba(30, 41, 59, 0.7)', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <LockIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Betting Statistics Hidden
                  </Typography>
                </Paper>
              ) : (
                <>
                  {/* Win Rate */}
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(30, 41, 59, 0.7)', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                      {bettingStats.stats_visible?.win_rate ? (
                        <>
                        <Box sx={{ 
                          bgcolor: 'rgba(16, 185, 129, 0.15)', 
                          borderRadius: '50%', 
                          p: 1.5,
                          mr: 2
                        }}>
                          <TrendingUpIcon sx={{ fontSize: 32, color: '#10B981' }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                            {bettingStats.win_rate}%
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Win Rate
                          </Typography>
                        </Box>
                        </>
                      ) : (
                        <>
                        <Box sx={{ 
                          bgcolor: 'rgba(148, 163, 184, 0.15)', 
                          borderRadius: '50%', 
                          p: 1.5,
                          mr: 2
                        }}>
                          <LockIcon sx={{ fontSize: 32, color: '#94a3b8' }} />
                        </Box>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Win Rate Hidden
                          </Typography>
                        </>
                      )}
                  </Paper>
                  
                  {/* Current Streak */}
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(30, 41, 59, 0.7)', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                      {bettingStats.stats_visible?.betting_history ? (
                        <>
                        <Box sx={{ 
                          bgcolor: 'rgba(245, 158, 11, 0.15)', 
                          borderRadius: '50%', 
                          p: 1.5,
                          mr: 2
                        }}>
                          <WhatshotIcon sx={{ fontSize: 32, color: '#F59E0B' }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                            {bettingStats.current_streak > 0 && '+'}
                            {bettingStats.current_streak}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Current Streak
                          </Typography>
                        </Box>
                        </>
                      ) : (
                        <>
                        <Box sx={{ 
                          bgcolor: 'rgba(148, 163, 184, 0.15)', 
                          borderRadius: '50%', 
                          p: 1.5,
                          mr: 2
                        }}>
                          <LockIcon sx={{ fontSize: 32, color: '#94a3b8' }} />
                        </Box>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Streak Hidden
                          </Typography>
                        </>
                      )}
                  </Paper>
                  
                  {/* Total Bets */}
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(30, 41, 59, 0.7)', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                      {bettingStats.stats_visible?.betting_history ? (
                        <>
                        <Box sx={{ 
                          bgcolor: 'rgba(139, 92, 246, 0.15)', 
                          borderRadius: '50%', 
                          p: 1.5,
                          mr: 2
                        }}>
                          <ScoreboardIcon sx={{ fontSize: 32, color: '#8B5CF6' }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                            {bettingStats.total_bets}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Total Bets
                          </Typography>
                        </Box>
                        </>
                      ) : (
                        <>
                        <Box sx={{ 
                          bgcolor: 'rgba(148, 163, 184, 0.15)', 
                          borderRadius: '50%', 
                          p: 1.5,
                          mr: 2
                        }}>
                          <LockIcon sx={{ fontSize: 32, color: '#94a3b8' }} />
                        </Box>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Bets Hidden
                          </Typography>
                        </>
                      )}
                  </Paper>
                  
                  {/* Lifetime Winnings */}
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(30, 41, 59, 0.7)', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                      {bettingStats.stats_visible?.betting_history ? (
                        <>
                        <Box sx={{ 
                          bgcolor: 'rgba(96, 165, 250, 0.15)', 
                          borderRadius: '50%', 
                          p: 1.5,
                          mr: 2
                        }}>
                          <AttachMoneyIcon sx={{ fontSize: 32, color: '#60A5FA' }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                            {bettingStats.lifetime_winnings}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Lifetime Winnings
                          </Typography>
                        </Box>
                        </>
                      ) : (
                        <>
                        <Box sx={{ 
                          bgcolor: 'rgba(148, 163, 184, 0.15)', 
                          borderRadius: '50%', 
                          p: 1.5,
                          mr: 2
                        }}>
                          <LockIcon sx={{ fontSize: 32, color: '#94a3b8' }} />
                        </Box>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Winnings Hidden
                          </Typography>
                      </>
                    )}
                  </Paper>
                        </>
                      )}
                    </Box>
                  </Grid>
          
          {/* Right Column - Achievements */}
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.7)', 
                borderRadius: 2,
                mb: { xs: 2, md: 0 },
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                overflow: 'hidden',
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Add a decorative gradient top border */}
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #FFD700, #8B5CF6, #10B981)'
                }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EmojiEventsIcon sx={{ color: '#FFD700', mr: 1.5, fontSize: '1.75rem' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                  Achievements
                </Typography>
              </Box>
              
              {/* Show loading state or hidden message if applicable */}
              {loadingHistory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, flex: 1 }}>
                  <CircularProgress sx={{ color: '#8B5CF6' }} />
                </Box>
              ) : !bettingStats.stats_visible?.achievements ? (
                <Box sx={{ textAlign: 'center', p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <LockIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: '#94a3b8' }}>
                    Achievements are private
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2,
                  flex: 1,
                  overflowY: 'auto',
                  pr: 1,
                  mr: -1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(139, 92, 246, 0.5)',
                    borderRadius: '10px',
                  }
                }}>
                  {/* Achievement Items with improved styling */}
                  {achievements.map(achievement => (
                    <Paper 
                      key={achievement.id} 
                      elevation={0}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: achievement.unlocked 
                          ? 'rgba(25, 32, 45, 0.9)' 
                          : 'rgba(22, 28, 36, 0.7)',
                        transition: 'all 0.3s ease',
                        border: '1px solid',
                        borderColor: achievement.unlocked ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.03)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: achievement.unlocked ? '0 8px 16px rgba(255, 215, 0, 0.15)' : '0 4px 8px rgba(0, 0, 0, 0.1)',
                        }
                      }}
                    >
                      {achievement.unlocked && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'radial-gradient(circle at top right, rgba(255, 215, 0, 0.1), transparent 70%)',
                            opacity: 0.6,
                            zIndex: 0
                          }}
                        />
                      )}
                      
                      {/* Achievement icon with animated background for unlocked achievements */}
                      <Box 
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '28px',
                          mr: 2.5,
                          position: 'relative',
                          background: achievement.unlocked 
                            ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                            : 'rgba(100, 100, 100, 0.2)',
                          boxShadow: achievement.unlocked 
                            ? '0 0 15px rgba(255, 215, 0, 0.5)' 
                            : 'none',
                          zIndex: 1
                        }}
                      >
                        {achievement.unlocked && (
                          <Box 
                            sx={{
                              position: 'absolute',
                              inset: '-4px',
                              borderRadius: '50%',
                              background: 'conic-gradient(#FFD700, transparent, #FFD700, transparent, #FFD700)',
                              animation: 'spin 4s linear infinite',
                              opacity: 0.7,
                              '@keyframes spin': {
                                '0%': {
                                  transform: 'rotate(0deg)',
                                },
                                '100%': {
                                  transform: 'rotate(360deg)',
                                },
                              },
                              zIndex: -1
                            }}
                          />
                        )}
                        {achievement.icon}
                      </Box>
                      
                      <Box sx={{ zIndex: 1, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, justifyContent: 'space-between' }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold', 
                              fontSize: '1.05rem',
                              color: achievement.unlocked ? '#FFD700' : '#f8fafc',
                              textShadow: achievement.unlocked ? '0 0 10px rgba(255, 215, 0, 0.3)' : 'none'
                            }}
                          >
                            {achievement.name}
                          </Typography>
                          
                          {achievement.unlocked && (
                            <Chip
                              label="Unlocked"
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: 'rgba(255, 215, 0, 0.15)',
                                color: '#FFD700',
                                fontWeight: 'bold',
                                fontSize: '0.65rem',
                                height: 20
                              }}
                            />
                          )}
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#9CA3AF', 
                            mb: 0.5,
                            fontSize: '0.9rem' 
                          }}
                        >
                          {achievement.description}
                        </Typography>
                        
                        {achievement.unlocked ? (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(255, 215, 0, 0.7)', 
                              display: 'block',
                              fontSize: '0.7rem'
                            }}
                          >
                            Unlocked: {achievement.unlockedDate}
                          </Typography>
                        ) : (
                          <Box 
                            sx={{
                              mt: 1,
                              width: '100%',
                              height: 4,
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: 5,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                width: '30%', // This could be dynamic based on progress toward achievement
                                height: '100%',
                                bgcolor: 'rgba(139, 92, 246, 0.4)',
                                borderRadius: 5
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default UserProfilePage; 