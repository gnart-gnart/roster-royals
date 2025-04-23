import React, { useState } from 'react';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import NavBar from '../components/NavBar';
import { updatePassword, deleteAccount } from '../services/auth';

function SettingsPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'user' };
  
  // State for switches 
  const [settings, setSettings] = useState({
    showHistory: true,
    showWinRate: true,
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

  // Handle switch changes
  const handleSwitchChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
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
                      Show Betting History
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Allow friends to see your betting history
                    </Typography>
                  </Box>
                  <Switch 
                    checked={settings.showHistory}
                    onChange={() => handleSwitchChange('showHistory')}
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
                      Show Win Rate
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Display your win percentage to others
                    </Typography>
                  </Box>
                  <Switch 
                    checked={settings.showWinRate}
                    onChange={() => handleSwitchChange('showWinRate')}
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
            bgcolor: 'rgba(30, 41, 59, 0.95)',
            borderRadius: 2,
            width: '100%',
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          Change Password
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
              {passwordError}
            </Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
              {passwordSuccess}
            </Alert>
          )}
          <TextField
            margin="dense"
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              )
            }}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
              '& .MuiOutlinedInput-root': {
                color: '#f8fafc',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#8B5CF6' },
              }
            }}
          />
          <TextField
            margin="dense"
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              )
            }}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
              '& .MuiOutlinedInput-root': {
                color: '#f8fafc',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#8B5CF6' },
              }
            }}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              )
            }}
            variant="outlined"
            sx={{
              mb: 1,
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
              '& .MuiOutlinedInput-root': {
                color: '#f8fafc',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#8B5CF6' },
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
          <Button 
            onClick={handleClosePasswordDialog}
            sx={{ 
              color: '#9CA3AF',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordChange}
            variant="contained"
            sx={{ 
              bgcolor: '#8B5CF6',
              '&:hover': { bgcolor: '#7C3AED' }
            }}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Account Confirmation Dialog */}
      <Dialog 
        open={deleteDialog} 
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(30, 41, 59, 0.95)',
            borderRadius: 2,
            width: '100%',
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          Delete Account
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
              {deleteError}
            </Alert>
          )}
          <Typography sx={{ color: '#f8fafc' }}>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
          <Typography sx={{ color: '#f8fafc', mt: 2, fontWeight: 'bold' }}>
            All your data, including:
          </Typography>
          <Box component="ul" sx={{ color: '#9CA3AF', mt: 1, pl: 2 }}>
            <li>Betting history</li>
            <li>League participation</li>
            <li>Friend connections</li>
            <li>All other personal data</li>
          </Box>
          <Typography sx={{ color: '#f8fafc', mt: 2 }}>
            will be permanently deleted from our systems.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            sx={{ 
              color: '#9CA3AF',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount}
            variant="contained"
            sx={{ 
              bgcolor: '#EF4444',
              '&:hover': { bgcolor: '#DC2626' }
            }}
          >
            Confirm Deletion
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SettingsPage;