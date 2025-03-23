import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Badge,
  Avatar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import NavBar from '../components/NavBar';
import { getAvailableSportEvents, getCompetitionEvents } from '../services/api';

const DRAWER_WIDTH = 240;
const sportIcons = {
  'american-football': '🏈',
  'baseball': '⚾',
  'basketball': '🏀',
  'soccer': '⚽',
  'ice-hockey': '🏒',
  'mlb': '⚾',
  'nba': '🏀',
  'nfl': '🏈',
  'nhl': '🏒',
};

function SportEventsPage() {
  const { groupId, sportKey } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [sportName, setSportName] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [competitionEvents, setCompetitionEvents] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')) || { username: '' };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Get competitions for the selected sport
        const response = await getAvailableSportEvents(sportKey);
        console.log('API Response:', response); // Debug log
        
        // Set categories and select the first one by default
        if (response && response.categories && response.categories.length > 0) {
          setCategories(response.categories);
          setSelectedCategory(response.categories[0].key);
        }
        
        // Set the sport name
        if (response && response.name) {
          setSportName(response.name);
        } else {
          setSportName(sportKey.charAt(0).toUpperCase() + sportKey.slice(1).replace(/-/g, ' '));
        }
        
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [sportKey]);

  useEffect(() => {
    const fetchCategoryEvents = async () => {
      if (!selectedCategory) return;
      
      try {
        setLoading(true);
        let extractedEvents = [];
        
        const category = categories.find(cat => cat.key === selectedCategory);
        if (category && category.competitions) {
          for (const competition of category.competitions) {
            try {
              const competitionEvents = await getCompetitionEvents(competition.key);
              if (competitionEvents && competitionEvents.events) {
                const eventsWithDetails = competitionEvents.events.map(event => ({
                  ...event,
                  categoryName: category.name,
                  competitionName: competition.name || 'Other'
                }));
                extractedEvents.push(...eventsWithDetails);
              }
            } catch (err) {
              console.error(`Error fetching events for competition ${competition.key}:`, err);
            }
          }
        }
        
        setEvents(extractedEvents);
      } catch (err) {
        console.error('Error fetching category events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryEvents();
  }, [selectedCategory, categories]);

  useEffect(() => {
    const fetchCompetitionEvents = async () => {
      if (!selectedCompetition) return;
      
      try {
        setLoading(true);
        const events = await getCompetitionEvents(selectedCompetition.key);
        if (events && events.events) {
          setCompetitionEvents(events.events);
        }
      } catch (err) {
        console.error('Error fetching competition events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitionEvents();
  }, [selectedCompetition]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCategorySelect = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setSelectedCompetition(null);
    setCompetitionEvents([]);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleCompetitionSelect = (competition) => {
    setSelectedCompetition(competition);
  };

  const handleBackToCompetitions = () => {
    setSelectedCompetition(null);
    setCompetitionEvents([]);
  };

  const handleEventSelect = (event) => {
    navigate(`/group/${groupId}/event/${event.key}`);
  };

  const filteredCompetitions = categories
    .find(cat => cat.key === selectedCategory)
    ?.competitions.filter(comp => 
      comp.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredEvents = competitionEvents.filter(event => 
    // Only include events with both home and away teams
    event.home && event.away &&
    // Apply search filter
    (event.name.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
    event.home.name.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
    event.away.name.toLowerCase().includes(eventSearchQuery.toLowerCase()))
  );

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'TBD';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'TBD';
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'TBD';
    }
  };

  const drawer = (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ px: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search competitions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <List>
        {categories.map((category) => (
          <ListItem key={category.key} disablePadding>
            <ListItemButton
              selected={selectedCategory === category.key}
              onClick={() => handleCategorySelect(category.key)}
            >
              <ListItemText primary={category.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

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
            onClick={() => navigate(`/group/${groupId}/choose-bets`)}
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
          <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            {sportName} Events
            <Box sx={{ fontSize: '2rem' }}>
              {sportIcons[sportKey] || sportIcons[sportName.toLowerCase()] || ''}
            </Box>
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#8B5CF6' }} />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : selectedCompetition ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => setSelectedCompetition(null)}
                sx={{
                  color: '#f8fafc',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  },
                }}
              >
                Back to competitions
              </Button>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                {selectedCompetition.name}
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {filteredEvents.map((event) => (
                <Grid item xs={12} md={6} key={event.key}>
                  <Card
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
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          {event.home.name} vs {event.away.name}
                        </Typography>
                        <Chip 
                          label={event.status === 'TRADING_LIVE' ? 'Live' : event.status} 
                          color={event.status === 'TRADING_LIVE' ? 'error' : event.status === 'TRADING' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ textAlign: 'center', flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {event.home.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.home.abbreviation}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ mx: 2 }}>VS</Typography>
                        <Box sx={{ textAlign: 'center', flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {event.away.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.away.abbreviation}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {event.markets && event.markets['basketball.moneyline'] && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Moneyline Odds
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            {event.markets['basketball.moneyline'].submarkets['period=ot&period=ft'].selections.map((selection, index) => (
                              <Box key={index} sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  {selection.outcome === 'home' ? event.home.name : event.away.name}
                                </Typography>
                                <Typography variant="h6" color="primary">
                                  {selection.price.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {(selection.probability * 100).toFixed(1)}% chance
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Cutoff Time: {formatDateTime(event.cutoffTime)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Markets: {Object.keys(event.markets || {}).length}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredCompetitions.map((competition) => (
              <Grid item xs={12} sm={6} md={4} key={competition.key}>
                <Card
                  onClick={() => handleCompetitionSelect(competition)}
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
                        {competition.name}
                      </Typography>
                      {/* Add icons based on competition name */}
                      {competition.name.includes('MLB') && <Box sx={{ fontSize: '1.8rem' }}>⚾</Box>}
                      {competition.name.includes('NCAA') && <Box sx={{ fontSize: '1.8rem' }}>🏛️</Box>}
                      {competition.name.includes('NFL') && <Box sx={{ fontSize: '1.8rem' }}>🏈</Box>}
                      {competition.name.includes('NBA') && <Box sx={{ fontSize: '1.8rem' }}>🏀</Box>}
                      {competition.name.includes('NHL') && <Box sx={{ fontSize: '1.8rem' }}>🏒</Box>}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1 }}>
                      {competition.eventCount} events available
                    </Typography>
                    
                    {/* Live Betting indicator just like on the ChooseBetsPage */}
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

export default SportEventsPage;