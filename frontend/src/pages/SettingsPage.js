import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, 
  Typography, 
  Container,
  Paper,
  Button,
  IconButton,
  Switch,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import NavBar from '../components/NavBar';
import { updatePassword, deleteAccount } from '../services/auth';
import { updateUserSettings } from '../services/api';

function SettingsPage() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user')) || { username: 'user' };
  
  // State for switches 
  const [settings, setSettings] = useState({
    showHistory: true,
    showWinRate: true,
    showStats: true,
    showAchievements: true
  });
  
  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // State for password change
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Load user settings on component mount
  useEffect(() => {
    // Get settings from user object if they exist
    if (storedUser && storedUser.settings) {
      setSettings({
        showHistory: storedUser.settings.showHistory !== false,
        showWinRate: storedUser.settings.showWinRate !== false,
        showStats: storedUser.settings.showStats !== false,
        showAchievements: storedUser.settings.showAchievements !== false
      });
    }
  }, []);

  // Handle switch changes
  const handleSwitchChange = async (setting) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting]
    };
    
    setSettings(newSettings);
    
    try {
      // Save settings to backend
      const response = await updateUserSettings({ settings: newSettings });
      
      // Update user in localStorage with new settings
      const updatedUser = { ...storedUser, settings: newSettings };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSnackbar({
        open: true,
        message: 'Settings updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update settings',
        severity: 'error'
      });
      
      // Revert the setting if update failed
      setSettings(settings);
    }
  };
  
  // Handle password dialog open/close
  const handleOpenPasswordDialog = () => {
    setPasswordDialog(true);
    setPasswordError('');
    setPasswordSuccess('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  const handleClosePasswordDialog = () => {
    setPasswordDialog(false);
  };
  
  // Handle password change
  const handlePasswordChange = async () => {
    // Validate inputs
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (!confirmPassword) {
      setPasswordError('Please confirm your new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      console.log('Attempting to update password...');
      await updatePassword(currentPassword, newPassword);
      console.log('Password updated successfully');
      setPasswordSuccess('Password updated successfully');
      
      // Reset fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      
      // Close dialog after a delay to show success message
      setTimeout(() => {
        setPasswordDialog(false);
        setPasswordSuccess('');
      }, 1500);
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError(error.message || 'Failed to update password');
    }
  };
  
  // Handle delete account dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialog(true);
    setDeleteError('');
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      // Redirect to login page
      navigate('/');
    } catch (error) {
      console.error('Account deletion error:', error);
      setDeleteError(error.message);
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
      {/* Use NavBar component */}
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
            Settings
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {/* Account Security */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.7)', 
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LockIcon sx={{ color: '#8B5CF6', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                  Account Security
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                sx={{
                  mb: 3,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }
                }}
                onClick={handleOpenPasswordDialog}
              >
                Change Password
              </Button>
              
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#f8fafc', mt: 4, mb: 2 }}>
                Danger Zone
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                sx={{
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  color: '#EF4444',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    borderColor: 'rgba(239, 68, 68, 0.8)',
                  }
                }}
                onClick={handleOpenDeleteDialog}
              >
                Delete Account
              </Button>
            </Paper>
          </Grid>
          
          {/* Privacy Settings */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.7)', 
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <VisibilityIcon sx={{ color: '#60A5FA', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                  Privacy
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#f8fafc' }}>
                      Show Betting Statistics
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Show your betting statistics to other users
                    </Typography>
                  </Box>
                  <Switch 
                    checked={settings.showStats}
                    onChange={() => handleSwitchChange('showStats')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8B5CF6',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8B5CF6',
                      },
                    }}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', my: 2 }} />
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#f8fafc' }}>
                      Show Achievements
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Share your achievements with other users
                    </Typography>
                  </Box>
                  <Switch 
                    checked={settings.showAchievements}
                    onChange={() => handleSwitchChange('showAchievements')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8B5CF6',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8B5CF6',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Password Change Dialog */}
      <Dialog 
        open={passwordDialog} 
        onClose={handleClosePasswordDialog}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ color: '#f8fafc' }}>Change Password</DialogTitle>
        <DialogContent>
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {passwordSuccess}
            </Alert>
          )}
          
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                label="Current Password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f8fafc',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  },
                }}
              />
              <IconButton
                sx={{ position: 'absolute', right: 8, top: 8, color: '#94a3b8' }}
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Box>
            
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f8fafc',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  },
                }}
              />
              <IconButton
                sx={{ position: 'absolute', right: 8, top: 8, color: '#94a3b8' }}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Box>
            
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f8fafc',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  },
                }}
              />
              <IconButton
                sx={{ position: 'absolute', right: 8, top: 8, color: '#94a3b8' }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleClosePasswordDialog}
            sx={{ color: '#94a3b8' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordChange}
            variant="contained"
            sx={{ 
              bgcolor: '#8B5CF6',
              '&:hover': {
                bgcolor: '#7C3AED'
              } 
            }}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog 
        open={deleteDialog} 
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ color: '#f8fafc' }}>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. Your account will be permanently deleted.
          </Alert>
          
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
          
          <Typography variant="body1" sx={{ color: '#f8fafc', mt: 2 }}>
            Are you sure you want to delete your account?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            sx={{ color: '#94a3b8' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount}
            variant="contained"
            sx={{ 
              bgcolor: '#EF4444',
              '&:hover': {
                bgcolor: '#DC2626'
              } 
            }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SettingsPage;