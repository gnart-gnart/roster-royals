import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardContent, Box, Button,
  IconButton, Tooltip, Badge, Avatar, Menu, MenuItem, ListItemIcon,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { getAvailableSports, getAvailableSportEvents, getCompetitionEvents } from '../services/api';
import NavBar from '../components/NavBar';

function ChooseBetsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [sports, setSports] = useState([]);
  const [filteredSports, setFilteredSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')) || { username: '' };
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const profileMenuOpen = Boolean(profileAnchorEl);
  
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoading(true);
        const data = await getAvailableSports();
        setSports(data);
        
        // Now fetch events for each sport to determine which ones have valid events
        let sportsWithValidEvents = [];
        // Track valid event counts for all sports
        const sportValidCounts = {};
        
        for (const sport of data) {
          try {
            // Skip sports with no events
            if (!sport.eventCount || sport.eventCount === 0) {
              sportValidCounts[sport.key] = 0;
              continue;
            }
            
            // Get detailed sport data to check for valid events
            const sportData = await getAvailableSportEvents(sport.key);
            
            // Track if this sport has any valid events
            let hasValidEvents = false;
            let validEventCount = 0;
            
            // Check categories and competitions for valid events
            if (sportData && sportData.categories) {
              for (const category of sportData.categories) {
                if (category.competitions) {
                  // For each competition, check if it has events that meet our betting criteria
                  for (const competition of category.competitions) {
                    if (competition.eventCount > 0) {
                      try {
                        // Actually fetch the events to check if they're valid for betting
                        const compEvents = await getCompetitionEvents(competition.key);
                        if (compEvents && compEvents.events) {
                          // Check if any events have home and away teams and TRADING status
                          const validBettingEvents = compEvents.events.filter(event => 
                            event.home && 
                            event.away && 
                            event.status === 'TRADING'
                          );
                          
                          validEventCount += validBettingEvents.length;
                          
                          if (validBettingEvents.length > 0) {
                            hasValidEvents = true;
                          }
                        }
                      } catch (err) {
                        console.error(`Error checking events for competition ${competition.key}:`, err);
                      }
                    }
                  }
                }
              }
            }
            
            // Store the valid event count for this sport
            sportValidCounts[sport.key] = validEventCount;
            
            // Only add sports with valid events to the filtered list
            if (hasValidEvents) {
              const sportWithCount = {
                ...sport,
                validEventCount: validEventCount
              };
              sportsWithValidEvents.push(sportWithCount);
            }
          } catch (err) {
            console.error(`Error checking events for sport ${sport.key}:`, err);
            sportValidCounts[sport.key] = 0;
          }
        }
        
        // Add validEventCount property to all sports
        const allSportsWithCounts = data.map(sport => ({
          ...sport,
          validEventCount: sportValidCounts[sport.key] || 0
        }));
        
        setSports(allSportsWithCounts);
        setFilteredSports(sportsWithValidEvents);
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
      {/* Replace the custom navigation with the NavBar component */}
      <NavBar />
      
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress sx={{ color: '#8B5CF6' }} />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : sports.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#CBD5E1' }}>
              No sports with available betting events found.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {sports.map((sport) => {
              const hasValidEvents = sport.validEventCount > 0;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={sport.key}>
                  <Card
                    onClick={() => hasValidEvents ? navigate(`/group/${groupId}/choose-bets/${sport.key}`) : null}
                    sx={{
                      cursor: hasValidEvents ? 'pointer' : 'default',
                      backgroundColor: hasValidEvents ? 'rgba(22, 28, 36, 0.6)' : 'rgba(22, 28, 36, 0.3)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: hasValidEvents ? 1 : 0.6,
                      '&:hover': hasValidEvents ? {
                        backgroundColor: 'rgba(22, 28, 36, 0.8)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.3s ease',
                        '&::before': {
                          opacity: 0.15,
                        },
                      } : {},
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                        opacity: hasValidEvents ? 0.05 : 0.02,
                        transition: 'opacity 0.3s ease',
                      },
                    }}
                  >
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: hasValidEvents ? '#f8fafc' : '#a0aec0', fontWeight: 'bold' }}>
                          {sport.name}
                        </Typography>
                        {/* Sport Icon based on name */}
                        {sport.name === 'American Football' && <Box sx={{ fontSize: '1.8rem', opacity: hasValidEvents ? 1 : 0.6 }}>🏈</Box>}
                        {sport.name === 'Baseball' && <Box sx={{ fontSize: '1.8rem', opacity: hasValidEvents ? 1 : 0.6 }}>⚾</Box>}
                        {sport.name === 'Basketball' && <Box sx={{ fontSize: '1.8rem', opacity: hasValidEvents ? 1 : 0.6 }}>🏀</Box>}
                        {sport.name === 'Soccer' && <Box sx={{ fontSize: '1.8rem', opacity: hasValidEvents ? 1 : 0.6 }}>⚽</Box>}
                        {sport.name === 'Ice Hockey' && <Box sx={{ fontSize: '1.8rem', opacity: hasValidEvents ? 1 : 0.6 }}>🏒</Box>}
                        {sport.name === 'Tennis' && <Box sx={{ fontSize: '1.8rem', opacity: hasValidEvents ? 1 : 0.6 }}>🎾</Box>}
                      </Box>
                      <Typography variant="body2" sx={{ color: hasValidEvents ? '#cbd5e1' : '#94a3b8', mb: 1 }}>
                        {sport.validEventCount} betting events available
                      </Typography>
                      {!hasValidEvents && (
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
                          No events available for betting
                        </Typography>
                      )}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 1, 
                          backgroundColor: hasValidEvents ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)', 
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
                            bgcolor: hasValidEvents ? '#8B5CF6' : '#a78aca', 
                            mr: 1, 
                            boxShadow: hasValidEvents ? '0 0 0 2px rgba(139, 92, 246, 0.2)' : 'none'
                          }} 
                        />
                        <Typography variant="caption" sx={{ color: hasValidEvents ? '#8B5CF6' : '#a78aca', fontWeight: 'medium' }}>
                          {hasValidEvents ? 'Live Betting' : 'No Active Events'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default ChooseBetsPage; 