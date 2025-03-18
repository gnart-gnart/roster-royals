import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LanguageIcon from '@mui/icons-material/Language';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NavBar from '../components/NavBar';

function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Delete account dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    friendRequests: true,
    gameReminders: true,
    specialOffers: false,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'friends', // 'friends', 'public', 'private'
    showBettingHistory: true,
    showWinRate: true,
  });

  // Display settings
  const [displaySettings, setDisplaySettings] = useState({
    darkMode: true,
    compactView: false,
    theme: 'purple', // 'purple', 'blue', 'green'
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success
      setSuccessMessage('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (err) {
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user.username) {
      setError('Please type your username correctly to confirm');
      return;
    }

    setDeleteLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Log out and clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Navigate to login
      navigate('/login');
    } catch (err) {
      setError('Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    });
  };

  const handlePrivacyChange = (setting) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: !privacySettings[setting],
    });
  };

  const handleDisplayChange = (setting) => {
    setDisplaySettings({
      ...displaySettings,
      [setting]: !displaySettings[setting],
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0f0f13' }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            onClick={() => navigate('/profile')}
            startIcon={<ArrowBackIcon />}
            sx={{
              mr: 2,
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#f8fafc',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.6)',
              },
              borderRadius: 2,
            }}
          >
            Back to Profile
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
            Settings
          </Typography>
        </Box>

        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 2,
            }}
            onClose={() => setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 2,
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Account Settings */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              backgroundColor: 'rgba(25, 25, 35, 0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              mb: 4,
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LockIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                    Account Security
                  </Typography>
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }} />
                
                {!showPasswordForm ? (
                  <Button
                    variant="outlined"
                    onClick={() => setShowPasswordForm(true)}
                    sx={{
                      borderColor: 'rgba(139, 92, 246, 0.3)',
                      color: '#f8fafc',
                      '&:hover': {
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderColor: 'rgba(139, 92, 246, 0.6)',
                      },
                      borderRadius: 2,
                      mb: 2,
                    }}
                  >
                    Change Password
                  </Button>
                ) : (
                  <Box component="form" onSubmit={handlePasswordChange} sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          borderRadius: 2,
                        }
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          borderRadius: 2,
                        }
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required
                      sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          borderRadius: 2,
                        }
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                          backgroundColor: '#8b5cf6',
                          '&:hover': {
                            backgroundColor: '#7c3aed',
                          },
                          borderRadius: 2,
                          px: 3,
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={20} sx={{ ml: 1, color: '#8b5cf6' }} />
                        ) : 'Save Changes'}
                      </Button>
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => setShowPasswordForm(false)}
                        disabled={loading}
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          },
                          borderRadius: 2,
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                )}
                
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 3 }} />
                
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#f8fafc' }}>
                    Danger Zone
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                    startIcon={<DeleteForeverIcon />}
                    sx={{
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderColor: 'rgba(239, 68, 68, 0.6)',
                      },
                      borderRadius: 2,
                    }}
                  >
                    Delete Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
            
            <Card sx={{
              backgroundColor: 'rgba(25, 25, 35, 0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <NotificationsIcon sx={{ color: '#f59e0b', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                    Notifications
                  </Typography>
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }} />
                
                <List sx={{ py: 0 }}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Email Notifications" 
                      secondary="Receive updates via email"
                      primaryTypographyProps={{ color: '#f8fafc' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    />
                    <ListItemSecondaryAction>
                      <Switch 
                        checked={notificationSettings.emailNotifications}
                        onChange={() => handleNotificationChange('emailNotifications')}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'rgba(139, 92, 246, 0.5)',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Push Notifications" 
                      secondary="Receive alerts on your device"
                      primaryTypographyProps={{ color: '#f8fafc' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    />
                    <ListItemSecondaryAction>
                      <Switch 
                        checked={notificationSettings.pushNotifications}
                        onChange={() => handleNotificationChange('pushNotifications')}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'rgba(139, 92, 246, 0.5)',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Friend Requests" 
                      secondary="Get notified about new friend requests"
                      primaryTypographyProps={{ color: '#f8fafc' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    />
                    <ListItemSecondaryAction>
                      <Switch 
                        checked={notificationSettings.friendRequests}
                        onChange={() => handleNotificationChange('friendRequests')}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'rgba(139, 92, 246, 0.5)',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Game Reminders" 
                      secondary="Get reminded about upcoming games you've bet on"
                      primaryTypographyProps={{ color: '#f8fafc' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    />
                    <ListItemSecondaryAction>
                      <Switch 
                        checked={notificationSettings.gameReminders}
                        onChange={() => handleNotificationChange('gameReminders')}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'rgba(139, 92, 246, 0.5)',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Special Offers" 
                      secondary="Receive updates about bonuses and promotions"
                      primaryTypographyProps={{ color: '#f8fafc' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    />
                    <ListItemSecondaryAction>
                      <Switch 
                        checked={notificationSettings.specialOffers}
                        onChange={() => handleNotificationChange('specialOffers')}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'rgba(139, 92, 246, 0.5)',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Display & Privacy Settings */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              backgroundColor: 'rgba(25, 25, 35, 0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              mb: 4,
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VisibilityIcon sx={{ color: '#60a5fa', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                    Privacy
                  </Typography>
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }} />
                
                <List sx={{ py: 0 }}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Profile Visibility" 
                      secondary="Who can see your profile information"
                      primaryTypographyProps={{ color: '#f8fafc' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    />
                    <Box sx={{ minWidth: 120 }}>
                      <Button
                        sx={{
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#f8fafc',
                          borderRadius: 2,
                          textTransform: 'capitalize',
                        }}
                      >
                        {privacySettings.profileVisibility}
                      </Button>
                    </Box>
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Show Betting History" 
                      secondary="Allow friends to see your betting history"
                      primaryTypographyProps={{ color: '#f8fafc' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    />
                    <ListItemSecondaryAction>
                      <Switch 
                        checked={privacySettings.showBettingHistory}
                        onChange={() => handlePrivacyChange('showBettingHistory')}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'rgba(139, 92, 246, 0.5)',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Show Win Rate" 
                      secondary="Display your win percentage to others"
                      primaryTypographyProps={{ color: '#f8fafc' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    />
                    <ListItemSecondaryAction>
                      <Switch 
                        checked={privacySettings.showWinRate}
                        onChange={() => handlePrivacyChange('showWinRate')}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'rgba(139, 92, 246, 0.5)',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
            
            <Card sx={{
              backgroundColor: 'rgba(25, 25, 35, 0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              mb: 4,
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ColorLensIcon sx={{ color: '#10b981', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                    Display
                  </Typography>
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }} />
                
                <List sx={{ py: 0 }}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Dark Mode" 
                      secondary="Use dark theme throughout the app"
                      primaryTypographyProps={{ color: '#f8fafc' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    />
                    <ListItemSecondaryAction>
                      <Switch 
                        checked={displaySettings.darkMode}
                        onChange={() => handleDisplayChange('darkMode')}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'rgba(139, 92, 246, 0.5)',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Compact View" 
                      secondary="Display more content with less spacing"
                      primaryTypographyProps={{ color: '#f8fafc' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    />
                    <ListItemSecondaryAction>
                      <Switch 
                        checked={displaySettings.compactView}
                        onChange={() => handleDisplayChange('compactView')}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'rgba(139, 92, 246, 0.5)',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Theme Color" 
                      secondary="Choose your preferred accent color"
                      primaryTypographyProps={{ color: '#f8fafc' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box
                        onClick={() => setDisplaySettings({...displaySettings, theme: 'purple'})}
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: '#8b5cf6',
                          cursor: 'pointer',
                          border: displaySettings.theme === 'purple' ? '2px solid white' : 'none',
                        }}
                      />
                      <Box
                        onClick={() => setDisplaySettings({...displaySettings, theme: 'blue'})}
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: '#60a5fa',
                          cursor: 'pointer',
                          border: displaySettings.theme === 'blue' ? '2px solid white' : 'none',
                        }}
                      />
                      <Box
                        onClick={() => setDisplaySettings({...displaySettings, theme: 'green'})}
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          cursor: 'pointer',
                          border: displaySettings.theme === 'green' ? '2px solid white' : 'none',
                        }}
                      />
                    </Box>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
            
            <Card sx={{
              backgroundColor: 'rgba(25, 25, 35, 0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LanguageIcon sx={{ color: '#f59e0b', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                    Regional Settings
                  </Typography>
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                    Language
                  </Typography>
                  <Button
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc',
                      borderRadius: 2,
                      textTransform: 'none',
                      width: '100%',
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      English (United States)
                    </Box>
                  </Button>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                    Time Zone
                  </Typography>
                  <Button
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc',
                      borderRadius: 2,
                      textTransform: 'none',
                      width: '100%',
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      (UTC-05:00) Eastern Time (US & Canada)
                    </Box>
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Delete Account Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }
          }}
        >
          <DialogTitle sx={{ color: '#ef4444', fontWeight: 'bold' }}>
            Delete Account?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
              This action cannot be undone. All your data, including betting history, group memberships, and points will be permanently deleted.
            </DialogContentText>
            <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
              To confirm, please type your username: <strong>{user.username}</strong>
            </DialogContentText>
            <TextField
              fullWidth
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Enter your username"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2,
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
                borderRadius: 2,
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== user.username || deleteLoading}
              sx={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.3)',
                },
                borderRadius: 2,
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              {deleteLoading ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1, color: '#ef4444' }} />
                  Deleting...
                </>
              ) : 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default SettingsPage;