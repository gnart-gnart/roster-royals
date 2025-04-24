import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, 
  Typography, 
  Avatar, 
  Container, 
  Paper, 
  Grid, 
  Button, 
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/History';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NavBar from '../components/NavBar';
import CircularImageCropper from '../components/CircularImageCropper';
import { getUserProfile, updateUserProfile, getUserBettingStats, getUserBetHistory } from '../services/api';

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { username: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    bio: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Add betting stats state
  const [bettingStats, setBettingStats] = useState({
    total_bets: 0,
    win_rate: 0,
    current_streak: 0,
    lifetime_winnings: 0,
    user_level: 1,
    date_joined: ''
  });
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Replace mock data with real betting history state
  const [betHistory, setBetHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [selectedBet, setSelectedBet] = useState(null);
  const [betDetailsOpen, setBetDetailsOpen] = useState(false);
  
  // Mock data for achievements
  const achievements = [
    { 
      id: 1, 
      name: 'First Win', 
      description: 'Win your first bet', 
      icon: '🏆', 
      unlocked: true, 
      unlockedDate: '2023-10-15' 
    },
    { 
      id: 2, 
      name: 'Hot Streak', 
      description: 'Win 5 bets in a row', 
      icon: '🔥', 
      unlocked: true, 
      unlockedDate: '2023-11-18'
    },
    { 
      id: 3, 
      name: 'Big Spender', 
      description: 'Place a bet of 500 points or more', 
      icon: '💰', 
      unlocked: false
    },
  ];

  // Function to debug the profile image URL
  const validateProfileImageUrl = (url) => {
    if (!url) {
      console.warn("Profile image URL is empty");
      return false;
    }
    
    console.log(`Validating profile image URL: ${url}`);
    
    // Check if URL starts with /media/
    if (!url.includes('/media/')) {
      console.warn("Profile image URL doesn't include '/media/'");
    }
    
    // Log full URL for debugging
    console.log(`Full URL that would be used: ${url}?nocache=${Math.random()}`);
    
    return true;
  };

  // Add a function to fetch betting stats
  const fetchBettingStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const stats = await getUserBettingStats();
      setBettingStats(stats);
    } catch (error) {
      console.error('Failed to fetch betting stats:', error);
      setError('Failed to load betting statistics. Please try again later.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Add a function to fetch bet history
  const fetchBetHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const history = await getUserBetHistory();
      setBetHistory(history);
    } catch (error) {
      console.error('Failed to fetch bet history:', error);
      setError('Failed to load betting history. Please try again later.');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Update useEffect to also fetch betting history
  useEffect(() => {
    // Attempt to load user data if not already present
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile();
        setUser(userData);
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set form data with current values
        setEditFormData({
          username: userData.username || '',
          bio: userData.bio || ''
        });
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    // Execute fetch operations
    fetchUserData();
    fetchBettingStats();
    fetchBetHistory();
  }, [fetchBettingStats, fetchBetHistory]);

  // Function to toggle showing all bet history
  const handleToggleHistory = () => {
    setShowAllHistory(!showAllHistory);
  };

  // Format date from ISO to readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Get the bets to display based on showAllHistory state
  const getDisplayedBets = () => {
    if (showAllHistory) {
      return betHistory;
    } else {
      return betHistory.slice(0, 4); // Show only the first 4 bets
    }
  };

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setShowCropper(true);
    }
  };

  const handleCropComplete = (croppedImage) => {
    // Create FormData for image upload
    const formData = new FormData();
    formData.append('profile_image', croppedImage);
    
    // Read the file as a data URL to store directly
    const reader = new FileReader();
    reader.onloadend = () => {
      // Store the data URL
      const imageDataUrl = reader.result;
      console.log("Image converted to data URL");
      
      // Update the user object with the embedded image
      const updatedUser = {...user};
      updatedUser.embeddedImageData = imageDataUrl;
      
      // Update state and localStorage
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Store in session storage with user-specific key
      const userSpecificKey = `profileImageDataUrl_${user.id}`;
      sessionStorage.setItem(userSpecificKey, imageDataUrl);
      console.log(`Stored image in session storage with key: ${userSpecificKey}`);
      
      // Close the cropper
      setShowCropper(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Profile image updated successfully',
        severity: 'success'
      });
      
      // Notify other components
      window.dispatchEvent(new Event('userUpdated'));
      
      // Still proceed with the backend update
      updateUserProfile(formData)
        .then(response => {
          console.log("Profile updated on backend, response:", response);
        })
        .catch(err => {
          console.error("Backend profile update failed, but image is still displayed", err);
        });
    };
    reader.onerror = () => {
      setError('Failed to process image');
      console.error('Error reading file');
    };
    reader.readAsDataURL(croppedImage);
  };

  const handleCropCancel = () => {
    setSelectedImage(null);
    setShowCropper(false);
  };

  const handleSubmitProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!editFormData.username.trim()) {
      setError('Username is required');
      return;
    }
    
    try {
      const response = await updateUserProfile(editFormData);
      setUser(response);
      localStorage.setItem('user', JSON.stringify(response));
      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      
      // Dispatch an event to notify that user data has been updated
      window.dispatchEvent(new Event('userUpdated'));
    } catch (err) {
      setError('Failed to update profile');
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
      console.error(err);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Function to handle clicking on a bet
  const handleBetClick = (bet) => {
    setSelectedBet(bet);
    setBetDetailsOpen(true);
  };
  
  // Function to close bet details dialog
  const handleCloseBetDetails = () => {
    setBetDetailsOpen(false);
  };

  // Function to navigate to event details
  const handleViewEvent = () => {
    if (selectedBet && selectedBet.event_id && selectedBet.league_id) {
      navigate(`/league/${selectedBet.league_id}/event/${selectedBet.event_id}`);
      setBetDetailsOpen(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
      {/* Replace the custom navigation with the NavBar component */}
      <NavBar />
      
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              My Profile
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/settings')}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            Settings
          </Button>
        </Box>
        
        {/* Profile Content */}
        <Grid container spacing={3}>
          {/* Left Column - Profile Information */}
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.7)', 
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              {/* Edit button for profile */}
              <IconButton 
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10,
                  color: '#f8fafc'
                }}
                onClick={handleEditProfile}
              >
                <EditIcon />
              </IconButton>
              
              <Box sx={{ position: 'relative' }}>
                {/* Add direct image debugging info */}
                {console.log('Current user data:', user)}
                
                {/* Use direct image data if available */}
                <Avatar 
                  src={user.embeddedImageData || (user.id ? sessionStorage.getItem(`profileImageDataUrl_${user.id}`) : null)}
                  sx={{ 
                    bgcolor: '#8B5CF6', 
                    width: 140, 
                    height: 140, 
                    fontSize: '56px', 
                    mb: 3,
                    border: '4px solid rgba(139, 92, 246, 0.2)'
                  }}
                  imgProps={{
                    style: { objectFit: 'cover' },
                    onError: (e) => {
                      console.error('Error loading profile image:', e);
                      e.target.src = ''; // Clear src to show fallback
                    }
                  }}
                >
                  {user.username?.[0]?.toUpperCase()}
                </Avatar>
                
                <IconButton 
                  component="label"
                  sx={{ 
                    position: 'absolute',
                    bottom: 20,
                    right: -10,
                    bgcolor: 'rgba(139, 92, 246, 0.8)',
                    color: 'white',
                    width: 40,
                    height: 40,
                    '&:hover': {
                      bgcolor: 'rgba(139, 92, 246, 1)',
                    }
                  }}
                >
                  <EditIcon sx={{ fontSize: 20 }} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </IconButton>
              </Box>
              
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc', mb: 1 }}>
                {user.username}
              </Typography>
              
              {user.bio && (
                <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
                  {user.bio}
                </Typography>
              )}
              
              {/* Use actual level from API */}
              <Chip 
                label={`Level ${loadingStats ? '...' : bettingStats.user_level}`}
                sx={{ 
                  bgcolor: 'rgba(139, 92, 246, 0.2)', 
                  color: '#8B5CF6',
                  mb: 2
                }} 
              />
              
              {/* Use actual date joined from API */}
              <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
                Member since {loadingStats ? '...' : bettingStats.date_joined}
              </Typography>
              
              {/* Replace Points Display with Lifetime Winnings */}
              <Paper 
                sx={{ 
                  bgcolor: 'rgba(22, 28, 36, 0.7)', 
                  p: 2, 
                  width: '100%',
                  borderRadius: 2,
                  mb: 2
                }}
              >
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#10B981', mb: 1 }}>
                  {loadingStats ? (
                    <CircularProgress size={30} sx={{ color: '#10B981' }} />
                  ) : (
                    `$${bettingStats.lifetime_winnings?.toFixed(2) || '0.00'}`
                  )}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  Lifetime Winnings
                </Typography>
              </Paper>

              {/* Money Display */}
              <Paper 
                sx={{ 
                  bgcolor: 'rgba(22, 28, 36, 0.7)', 
                  p: 2, 
                  width: '100%',
                  borderRadius: 2,
                  mb: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon sx={{ color: '#FFD700', fontSize: '2rem', mr: 1 }} />
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#FFD700', mb: 1 }}>
                    {typeof user.money === 'number' ? user.money.toFixed(2) : (user.money || '0.00')}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  Betting Balance
                </Typography>
              </Paper>
              
              {/* Stats Grid */}
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ bgcolor: 'rgba(22, 28, 36, 0.7)', p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      {loadingStats ? (
                        <CircularProgress size={20} sx={{ color: '#f8fafc' }} />
                      ) : (
                        bettingStats.total_bets
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Bets
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ bgcolor: 'rgba(22, 28, 36, 0.7)', p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      {loadingStats ? (
                        <CircularProgress size={20} sx={{ color: '#f8fafc' }} />
                      ) : (
                        `${bettingStats.win_rate}%`
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Win Rate
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ bgcolor: 'rgba(22, 28, 36, 0.7)', p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: loadingStats 
                        ? '#f8fafc' 
                        : bettingStats.current_streak > 0 
                          ? '#10B981' // green for positive streak
                          : bettingStats.current_streak < 0 
                            ? '#EF4444' // red for negative streak
                            : '#f8fafc' // default color for zero
                    }}>
                      {loadingStats ? (
                        <CircularProgress size={20} sx={{ color: '#f8fafc' }} />
                      ) : (
                        bettingStats.current_streak > 0 
                          ? `+${bettingStats.current_streak}` // add plus sign for positive streak
                          : bettingStats.current_streak
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Streak
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Achievements */}
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.7)', 
                borderRadius: 2,
                mt: 3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EmojiEventsIcon sx={{ color: '#FFD700', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                  Achievements
                </Typography>
              </Box>
              
              {achievements.map(achievement => (
                <Box 
                  key={achievement.id} 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'rgba(22, 28, 36, 0.7)'
                  }}
                >
                  <Box 
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      mr: 2,
                      background: achievement.unlocked ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 'rgba(100, 100, 100, 0.2)',
                    }}
                  >
                    {achievement.icon}
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      {achievement.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      {achievement.description}
                    </Typography>
                    {achievement.unlocked && (
                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                        Unlocked: {achievement.unlockedDate}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>
          
          {/* Right Column - Performance and Betting History */}
          <Grid item xs={12} md={8}>
            {/* Performance Overview */}
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.7)', 
                borderRadius: 2,
                mb: 3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUpIcon sx={{ color: '#10B981', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                  Performance Overview
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  width: '100%', 
                  height: 200, 
                  bgcolor: 'rgba(22, 28, 36, 0.7)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2
                }}
              >
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  Performance chart would go here
                </Typography>
              </Box>
            </Paper>
            
            {/* Recent Betting Activity */}
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.7)', 
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <HistoryIcon sx={{ color: '#60A5FA', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                  Recent Betting Activity
                </Typography>
              </Box>
              
              {loadingHistory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress size={24} sx={{ color: '#8B5CF6' }} />
                </Box>
              ) : betHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
                    No betting history found. Place your first bet to see it here!
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ bgcolor: 'transparent' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Date</TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Event</TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Pick</TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Amount</TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Result</TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Payout</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getDisplayedBets().map((bet) => (
                        <TableRow key={bet.id} 
                          onClick={() => handleBetClick(bet)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.03)'
                            }
                          }}
                        >
                          <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            {formatDate(bet.date)}
                          </TableCell>
                          <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            {bet.event}
                          </TableCell>
                          <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            {bet.pick}
                          </TableCell>
                          <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            {bet.amount}
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <Chip
                              label={bet.result}
                              size="small"
                              sx={{
                                bgcolor: bet.result.toLowerCase() === 'won' ? 'rgba(16, 185, 129, 0.1)' : 
                                        bet.result.toLowerCase() === 'lost' ? 'rgba(239, 68, 68, 0.1)' : 
                                        'rgba(107, 114, 128, 0.1)',
                                color: bet.result.toLowerCase() === 'won' ? '#10B981' : 
                                      bet.result.toLowerCase() === 'lost' ? '#EF4444' : 
                                      '#6B7280',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            {bet.payout}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {betHistory.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleToggleHistory}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      }
                    }}
                  >
                    {showAllHistory ? 'Show Less' : 'View Full History'}
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(30, 41, 59, 0.95)',
            color: '#f8fafc',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmitProfileUpdate}>
            <TextField
              margin="dense"
              label="Username"
              name="username"
              value={editFormData.username}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              required
              error={error.includes('Username')}
              helperText={error.includes('Username') ? error : ''}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { color: '#f8fafc' }
              }}
              InputLabelProps={{
                sx: { color: '#9CA3AF' }
              }}
            />
            
            <TextField
              margin="dense"
              label="Bio"
              name="bio"
              value={editFormData.bio}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              placeholder="Tell us about yourself..."
              InputProps={{
                sx: { color: '#f8fafc' }
              }}
              InputLabelProps={{
                sx: { color: '#9CA3AF' }
              }}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitProfileUpdate} 
            variant="contained"
            sx={{ 
              bgcolor: '#8B5CF6',
              '&:hover': {
                bgcolor: '#7C3AED'
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Image Cropper Dialog */}
      {showCropper && selectedImage && (
        <CircularImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      
      {/* Bet Details Dialog */}
      <Dialog 
        open={betDetailsOpen} 
        onClose={handleCloseBetDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(30, 41, 59, 0.95)',
            color: '#f8fafc',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        {selectedBet && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              Bet Details
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: '#9CA3AF' }}>Event</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedBet.event}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: '#9CA3AF' }}>Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{formatDate(selectedBet.date)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: '#9CA3AF' }}>Pick</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedBet.pick}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: '#9CA3AF' }}>Amount Wagered</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedBet.amount}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: '#9CA3AF' }}>Result</Typography>
                  <Chip
                    label={selectedBet.result}
                    size="small"
                    sx={{
                      mb: 2,
                      bgcolor: selectedBet.result.toLowerCase() === 'won' ? 'rgba(16, 185, 129, 0.1)' : 
                              selectedBet.result.toLowerCase() === 'lost' ? 'rgba(239, 68, 68, 0.1)' : 
                              'rgba(107, 114, 128, 0.1)',
                      color: selectedBet.result.toLowerCase() === 'won' ? '#10B981' : 
                            selectedBet.result.toLowerCase() === 'lost' ? '#EF4444' : 
                            '#6B7280',
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: '#9CA3AF' }}>Payout</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedBet.payout}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
              <Button onClick={handleCloseBetDetails} sx={{ color: '#9CA3AF' }}>
                Close
              </Button>
              {selectedBet.event_id && selectedBet.league_id && (
                <Button 
                  onClick={handleViewEvent} 
                  variant="contained"
                  sx={{ 
                    bgcolor: '#8B5CF6',
                    '&:hover': {
                      bgcolor: '#7C3AED'
                    }
                  }}
                >
                  View Event
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProfilePage; 