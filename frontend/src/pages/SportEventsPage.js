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
  IconButton
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import NavBar from '../components/NavBar';
import { getAvailableSportEvents, getCompetitionEvents } from '../services/api';

const DRAWER_WIDTH = 240;

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

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <Box
          component="nav"
          sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        >
          {isMobile ? (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
              }}
            >
              {drawer}
            </Drawer>
          ) : (
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', md: 'block' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
              }}
              open
            >
              {drawer}
            </Drawer>
          )}
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/group/${groupId}/choose-bets`)}
                sx={{
                  mr: 2,
                  backgroundColor: 'rgba(96, 165, 250, 0.1)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  color: '#f8fafc',
                  '&:hover': {
                    backgroundColor: 'rgba(96, 165, 250, 0.2)',
                    border: '1px solid rgba(96, 165, 250, 0.6)',
                  },
                }}
              >
                Back
              </Button>
              <Typography variant="h4">
                {sportName} Events
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : selectedCompetition ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <IconButton onClick={handleBackToCompetitions} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                  </IconButton>
                  <Typography variant="h5" sx={{ flexGrow: 1 }}>
                    {selectedCompetition.name}
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Search events..."
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                    sx={{ width: 300 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Grid container spacing={2}>
                  {filteredEvents.map((event) => (
                    <Grid item xs={12} md={6} key={event.key}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 3,
                            border: '1px solid rgba(96, 165, 250, 0.5)',
                          },
                        }}
                        onClick={() => handleEventSelect(event)}
                      >
                        <CardContent>
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
                  <Grid item xs={12} md={6} key={competition.key}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3,
                          border: '1px solid rgba(96, 165, 250, 0.5)',
                        },
                      }}
                      onClick={() => handleCompetitionSelect(competition)}
                    >
                      <CardContent>
                        <Typography variant="h6">
                          {competition.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {competition.eventCount} events available
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Container>
        </Box>
      </Box>
    </>
  );
}

export default SportEventsPage;