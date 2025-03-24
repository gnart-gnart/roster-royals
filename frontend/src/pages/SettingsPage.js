import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, 
  Typography, 
  Avatar, 
  Container,
  Paper,
  Button,
  IconButton,
  Switch,
  Grid,
  Divider,
  FormControl,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  InputLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import LanguageIcon from '@mui/icons-material/Language';
import DeleteIcon from '@mui/icons-material/Delete';

function SettingsPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'user' };
  
  // State for switches 
  const [settings, setSettings] = useState({
    showHistory: true,
    showWinRate: true,
    emailNotifications: true,
    pushNotifications: true,
    friendRequests: true,
    gameReminders: true,
    specialOffers: false,
    darkMode: true,
    compactView: false
  });
  
  // Handle switch changes
  const handleSwitchChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2, 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        bgcolor: '#161821'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/home')}>
          <EmojiEventsOutlinedIcon sx={{ color: '#FFD700', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
            ROSTER ROYALS
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton sx={{ color: '#f8fafc' }}>
            <NotificationsIcon />
          </IconButton>
          <Avatar 
            sx={{ 
              bgcolor: '#8B5CF6', 
              width: 32, 
              height: 32, 
              fontSize: '14px', 
              fontWeight: 'bold' 
            }}
          >
            {user.username[0].toUpperCase()}
          </Avatar>
        </Box>
      </Box>
      
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
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#f8fafc', mb: 1 }}>
                  Profile Visibility
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
                  Who can see your profile information
                </Typography>
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <Select
                    value="friends"
                    sx={{ 
                      bgcolor: 'rgba(22, 28, 36, 0.7)',
                      color: '#f8fafc',
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    <MenuItem value="public">Everyone</MenuItem>
                    <MenuItem value="friends">Friends Only</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
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
          
          {/* Notifications */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.7)', 
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotificationsIcon sx={{ color: '#F59E0B', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                  Notifications
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#f8fafc' }}>
                      Email Notifications
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Receive updates via email
                    </Typography>
                  </Box>
                  <Switch 
                    checked={settings.emailNotifications}
                    onChange={() => handleSwitchChange('emailNotifications')}
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
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#f8fafc' }}>
                      Push Notifications
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Receive alerts on your device
                    </Typography>
                  </Box>
                  <Switch 
                    checked={settings.pushNotifications}
                    onChange={() => handleSwitchChange('pushNotifications')}
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
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#f8fafc' }}>
                      Friend Requests
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Get notified about new friend requests
                    </Typography>
                  </Box>
                  <Switch 
                    checked={settings.friendRequests}
                    onChange={() => handleSwitchChange('friendRequests')}
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
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#f8fafc' }}>
                      Game Reminders
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Get reminded about upcoming games you've bet on
                    </Typography>
                  </Box>
                  <Switch 
                    checked={settings.gameReminders}
                    onChange={() => handleSwitchChange('gameReminders')}
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
                      Special Offers
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Receive updates about bonuses and promotions
                    </Typography>
                  </Box>
                  <Switch 
                    checked={settings.specialOffers}
                    onChange={() => handleSwitchChange('specialOffers')}
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
          
          {/* Display Settings */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.7)', 
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DisplaySettingsIcon sx={{ color: '#10B981', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                  Display
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#f8fafc' }}>
                      Dark Mode
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Use dark theme throughout the app
                    </Typography>
                  </Box>
                  <Switch 
                    checked={settings.darkMode}
                    onChange={() => handleSwitchChange('darkMode')}
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
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#f8fafc' }}>
                      Compact View
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Display more content with less spacing
                    </Typography>
                  </Box>
                  <Switch 
                    checked={settings.compactView}
                    onChange={() => handleSwitchChange('compactView')}
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
                <Typography variant="subtitle1" sx={{ color: '#f8fafc', mb: 2 }}>
                  Theme Color
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
                  Choose your preferred accent color
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* Purple (default) */}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#8B5CF6',
                      cursor: 'pointer',
                      border: '2px solid white',
                    }}
                  />
                  
                  {/* Blue */}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#60A5FA',
                      cursor: 'pointer',
                    }}
                  />
                  
                  {/* Green */}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#10B981',
                      cursor: 'pointer',
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* Regional Settings */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.7)', 
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LanguageIcon sx={{ color: '#F59E0B', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                  Regional Settings
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#f8fafc', mb: 1 }}>
                  Language
                </Typography>
                <FormControl fullWidth variant="outlined">
                  <Select
                    value="en-US"
                    sx={{ 
                      bgcolor: 'rgba(22, 28, 36, 0.7)',
                      color: '#f8fafc',
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    <MenuItem value="en-US">English (United States)</MenuItem>
                    <MenuItem value="en-GB">English (United Kingdom)</MenuItem>
                    <MenuItem value="es-ES">Español (España)</MenuItem>
                    <MenuItem value="fr-FR">Français (France)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#f8fafc', mb: 1 }}>
                  Time Zone
                </Typography>
                <FormControl fullWidth variant="outlined">
                  <Select
                    value="America/New_York"
                    sx={{ 
                      bgcolor: 'rgba(22, 28, 36, 0.7)',
                      color: '#f8fafc',
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    <MenuItem value="America/New_York">Eastern Time (US & Canada)</MenuItem>
                    <MenuItem value="America/Chicago">Central Time (US & Canada)</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time (US & Canada)</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time (US & Canada)</MenuItem>
                    <MenuItem value="Europe/London">London</MenuItem>
                    <MenuItem value="Europe/Paris">Paris</MenuItem>
                    <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default SettingsPage;