import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HistoryIcon from '@mui/icons-material/History';
import NavBar from '../components/NavBar';

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [stats, setStats] = useState({
    totalBets: 0,
    winRate: 0,
    streak: 0,
    level: 1,
    recentBets: [],
    achievements: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user stats
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    const fetchUserStats = async () => {
      try {
        // Simulate API call
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        setStats({
          totalBets: 42,
          winRate: 68,
          streak: 5,
          level: Math.floor(user.points / 500) + 1,
          recentBets: [
            { id: 1, date: '2023-11-20', event: 'Lakers vs Warriors', pick: 'Lakers', result: 'won', amount: 100, payout: 180 },
            { id: 2, date: '2023-11-18', event: 'Chiefs vs Eagles', pick: 'Chiefs', result: 'won', amount: 150, payout: 270 },
            { id: 3, date: '2023-11-15', event: 'Yankees vs Red Sox', pick: 'Yankees', result: 'lost', amount: 75, payout: 0 },
            { id: 4, date: '2023-11-10', event: 'Celtics vs Bucks', pick: 'Celtics', result: 'won', amount: 120, payout: 216 },
          ],
          achievements: [
            { id: 1, name: 'First Win', description: 'Win your first bet', date: '2023-10-15', icon: '🏆' },
            { id: 2, name: 'Hot Streak', description: 'Win 5 bets in a row', date: '2023-11-18', icon: '🔥' },
            { id: 3, name: 'Big Spender', description: 'Place a bet of 500 points or more', date: '2023-11-01', icon: '💰' },
          ]
        });
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user.points]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0f0f13' }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              onClick={() => navigate('/home')}
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
              Back
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
              My Profile
            </Typography>
          </Box>
          
          <Button
            onClick={() => navigate('/settings')}
            startIcon={<SettingsIcon />}
            sx={{
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
            Settings
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: '#f87171'
              }
            }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress sx={{ color: '#8b5cf6' }} />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {/* Left Column - Profile Overview */}
            <Grid item xs={12} md={4}>
              <Card sx={{
                backgroundColor: 'rgba(25, 25, 35, 0.8)',
                backdropFilter: 'blur(8px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                mb: 4,
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      bgcolor: '#8b5cf6',
                      fontSize: '3rem',
                      border: '4px solid rgba(139, 92, 246, 0.3)',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {user?.username ? user.username[0].toUpperCase() : 'U'}
                  </Avatar>
                  
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc', mb: 0.5 }}>
                    {user?.username || 'User'}
                  </Typography>
                  
                  <Chip 
                    label={`Level ${stats.level}`} 
                    sx={{ 
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      color: '#8b5cf6',
                      fontWeight: 'bold',
                      mb: 2,
                    }} 
                  />
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                    Member since {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Oct 2023'}
                  </Typography>
                  
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 2,
                    mb: 3,
                  }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#10b981', mb: 1 }}>
                      {user.points || 1500}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Available Points
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2} sx={{ textAlign: 'center' }}>
                    <Grid item xs={4}>
                      <Box sx={{ 
                        p: 2, 
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: 2,
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                          {stats.totalBets}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Bets
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ 
                        p: 2, 
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: 2,
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                          {stats.winRate}%
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Win Rate
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ 
                        p: 2, 
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: 2,
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                          {stats.streak}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Streak
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
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
                    <EmojiEventsIcon sx={{ color: '#f59e0b', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      Achievements
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 2 }} />
                  
                  {stats.achievements.map((achievement) => (
                    <Box 
                      key={achievement.id}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        p: 1.5,
                        mb: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        fontSize: '1.5rem',
                      }}>
                        {achievement.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 'medium', color: '#f8fafc' }}>
                          {achievement.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {achievement.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Unlocked: {achievement.date}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Right Column - Betting History and Stats */}
            <Grid item xs={12} md={8}>
              {/* Betting Stats */}
              <Card sx={{
                backgroundColor: 'rgba(25, 25, 35, 0.8)',
                backdropFilter: 'blur(8px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                mb: 4,
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ color: '#10b981', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      Performance Overview
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    {/* Insert performance charts/graphics here */}
                    <Grid item xs={12}>
                      <Box sx={{ 
                        height: 200, 
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: 2,
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Performance chart would go here
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              {/* Recent Betting History */}
              <Card sx={{
                backgroundColor: 'rgba(25, 25, 35, 0.8)',
                backdropFilter: 'blur(8px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HistoryIcon sx={{ color: '#60a5fa', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      Recent Betting Activity
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }} />
                  
                  {stats.recentBets.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 3, 
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}>
                      No betting activity yet
                    </Box>
                  ) : (
                    <TableContainer component={Paper} sx={{ 
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    }}>
                      <Table sx={{ 
                        '& .MuiTableCell-root': { 
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#f8fafc',
                        },
                      }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Event</TableCell>
                            <TableCell>Pick</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Result</TableCell>
                            <TableCell align="right">Payout</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.recentBets.map((bet) => (
                            <TableRow 
                              key={bet.id}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                }
                              }}
                            >
                              <TableCell>{bet.date}</TableCell>
                              <TableCell>{bet.event}</TableCell>
                              <TableCell>{bet.pick}</TableCell>
                              <TableCell>{bet.amount}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={bet.result} 
                                  size="small"
                                  sx={{ 
                                    backgroundColor: bet.result === 'won' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: bet.result === 'won' ? '#10b981' : '#ef4444',
                                    fontWeight: 'medium',
                                    textTransform: 'capitalize',
                                  }} 
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                color: bet.result === 'won' ? '#10b981' : 'rgba(255, 255, 255, 0.7)',
                                fontWeight: bet.result === 'won' ? 'bold' : 'normal',
                              }}>
                                {bet.payout}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        borderRadius: 2,
                      }}
                    >
                      View Full History
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default ProfilePage; 