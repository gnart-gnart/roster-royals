import React from 'react';
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
  Chip
} from '@mui/material';
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

function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'user' };
  
  // Mock data for the betting history
  const recentBets = [
    { id: 1, date: '2023-11-20', event: 'Lakers vs Warriors', pick: 'Lakers', amount: 100, result: 'Won', payout: 180 },
    { id: 2, date: '2023-11-18', event: 'Chiefs vs Eagles', pick: 'Chiefs', amount: 150, result: 'Won', payout: 270 },
    { id: 3, date: '2023-11-15', event: 'Yankees vs Red Sox', pick: 'Yankees', amount: 75, result: 'Lost', payout: 0 },
    { id: 4, date: '2023-11-10', event: 'Celtics vs Bucks', pick: 'Celtics', amount: 120, result: 'Won', payout: 216 },
  ];
  
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
                textAlign: 'center'
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: '#8B5CF6', 
                  width: 80, 
                  height: 80, 
                  fontSize: '36px', 
                  mb: 2
                }}
              >
                {user.username[0].toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc', mb: 1 }}>
                {user.username}
              </Typography>
              
              <Chip 
                label="Level 4" 
                sx={{ 
                  bgcolor: 'rgba(139, 92, 246, 0.2)', 
                  color: '#8B5CF6',
                  mb: 2
                }} 
              />
              
              <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
                Member since Oct 2023
              </Typography>
              
              {/* Points Display */}
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
                  {user.points || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  Available Points
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
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ bgcolor: 'rgba(22, 28, 36, 0.7)', p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      42
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Bets
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ bgcolor: 'rgba(22, 28, 36, 0.7)', p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      68%
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Win Rate
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ bgcolor: 'rgba(22, 28, 36, 0.7)', p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      5
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
                    {recentBets.map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>{bet.date}</TableCell>
                        <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>{bet.event}</TableCell>
                        <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>{bet.pick}</TableCell>
                        <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>{bet.amount}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <Chip
                            label={bet.result}
                            size="small"
                            sx={{
                              bgcolor: bet.result === 'Won' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: bet.result === 'Won' ? '#10B981' : '#EF4444',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>{bet.payout}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                >
                  View Full History
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ProfilePage; 