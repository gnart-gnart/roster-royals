import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardContent, Box, Button,
  IconButton, Tooltip, Badge, Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { getAvailableSports } from '../services/api';

function ChooseBetsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')) || { username: '' };

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const data = await getAvailableSports();
        setSports(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load sports. Please try again.');
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
      {/* Custom Navigation Bar to match HomePage */}
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
          {/* Notifications */}
          <IconButton
            color="inherit"
            sx={{ color: '#f8fafc' }}
          >
            <Badge badgeContent={0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton
              color="inherit"
              onClick={() => navigate('/settings')}
              sx={{ color: '#f8fafc' }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          {/* Profile */}
          <Box
            onClick={() => navigate('/profile')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: '#8B5CF6', 
                width: 32, 
                height: 32, 
                fontSize: '14px', 
                fontWeight: 'bold' 
              }}
            >
              {user.username ? user.username[0].toUpperCase() : 'U'}
            </Avatar>
            <Typography variant="body2" sx={{ color: '#f8fafc' }}>
              {user.username}
            </Typography>
          </Box>
          
          {/* Logout */}
          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              sx={{ color: '#f8fafc' }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/group/${groupId}`)}
            sx={{
              mr: 2,
              color: '#f8fafc',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
              },
            }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Choose Bets
          </Typography>
        </Box>

        {loading ? (
          <Typography>Loading sports...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={2}>
            {sports.map((sport) => (
              <Grid item xs={12} sm={6} md={4} key={sport.key}>
                <Card
                  onClick={() => navigate(`/group/${groupId}/choose-bets/${sport.key}`)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: 'rgba(22, 28, 36, 0.6)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: 'rgba(22, 28, 36, 0.8)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease',
                      '&::before': {
                        opacity: 0.15,
                      },
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                      opacity: 0.05,
                      transition: 'opacity 0.3s ease',
                    },
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                        {sport.name}
                      </Typography>
                      {/* Sport Icon based on name */}
                      {sport.name === 'American Football' && <Box sx={{ fontSize: '1.8rem' }}>🏈</Box>}
                      {sport.name === 'Baseball' && <Box sx={{ fontSize: '1.8rem' }}>⚾</Box>}
                      {sport.name === 'Basketball' && <Box sx={{ fontSize: '1.8rem' }}>🏀</Box>}
                      {sport.name === 'Soccer' && <Box sx={{ fontSize: '1.8rem' }}>⚽</Box>}
                      {sport.name === 'Ice Hockey' && <Box sx={{ fontSize: '1.8rem' }}>🏒</Box>}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1 }}>
                      {sport.eventCount} events available
                    </Typography>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mt: 1, 
                        backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                        borderRadius: '16px',
                        px: 1.5,
                        py: 0.5,
                        width: 'fit-content',
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: '50%', 
                          bgcolor: '#8B5CF6', 
                          mr: 1, 
                          boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)'
                        }} 
                      />
                      <Typography variant="caption" sx={{ color: '#8B5CF6', fontWeight: 'medium' }}>
                        Live Betting
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default ChooseBetsPage; 