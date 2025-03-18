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
  Toolbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import NavBar from '../components/NavBar';
import { getAvailableSportEvents, getCompetitionEvents } from '../services/api';
import { styled } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const DRAWER_WIDTH = 240;

// Create a styled component for the betting card
const BetCard = styled(Card)(({ theme, active }) => ({
  backgroundColor: 'rgba(30, 41, 59, 0.7)',
  backdropFilter: 'blur(8px)',
  borderRadius: theme.shape.borderRadius * 2,
  border: active 
    ? '1px solid rgba(139, 92, 246, 0.4)' 
    : '1px solid rgba(255, 255, 255, 0.1)',
  marginBottom: theme.spacing(2),
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.6)',
  },
  ...(active && {
    boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.6)',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  }),
}));

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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [filterLoading, setFilterLoading] = useState(true);
  const [filters, setFilters] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);

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

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setFilterLoading(true);
        const response = await getAvailableSportEvents(sportKey);
        if (response && response.filters) {
          setFilters(response.filters);
          setSelectedFilter(response.filters[0].id);
        }
      } catch (err) {
        console.error('Error fetching filters:', err);
        setError('Failed to load filters. Please try again later.');
      } finally {
        setFilterLoading(false);
      }
    };

    fetchFilters();
  }, [sportKey]);

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

  const handleFilterClick = (filterId) => {
    setSelectedFilter(filterId);
  };

  const handleOutcomeSelect = (market, outcome) => {
    setSelectedOutcome(outcome);
  };

  const handlePlaceBet = (event) => {
    // Implement the logic to place a bet
    console.log('Placing bet on event:', event);
  };

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

  const formatEventDate = (date) => {
    if (!date) return 'TBD';
    try {
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return formattedDate;
    } catch (err) {
      console.error('Error formatting event date:', err);
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
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#0f0f13',
    }}>
      <NavBar />
      
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: DRAWER_WIDTH, 
            boxSizing: 'border-box',
            backgroundColor: 'rgba(20, 30, 49, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          },
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              px: 3, 
              mb: 1, 
              color: 'rgba(255, 255, 255, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '0.75rem',
            }}
          >
            Filter Events
          </Typography>
          
          {filterLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress size={24} sx={{ color: '#8b5cf6' }} />
            </Box>
          ) : (
            <List>
              {filters.map((filter) => (
                <ListItem 
                  key={filter.id} 
                  disablePadding
                  onClick={() => handleFilterClick(filter.id)}
                  sx={{ 
                    mb: 0.5,
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                  }}
                >
                  <ListItemButton 
                    selected={selectedFilter === filter.id}
                    sx={{ 
                      py: 1,
                      px: 3,
                      borderRadius: 1,
                      mx: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        '&:hover': {
                          backgroundColor: 'rgba(139, 92, 246, 0.25)',
                        },
                      },
                    }}
                  >
                    <ListItemText 
                      primary={
                        <Typography sx={{ 
                          fontSize: '0.95rem',
                          fontWeight: selectedFilter === filter.id ? '600' : '400',
                          color: selectedFilter === filter.id ? '#8b5cf6' : '#f8fafc',
                        }}>
                          {filter.name}
                        </Typography>
                      }
                    />
                    <Box 
                      component="span" 
                      sx={{ 
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        color: '#8b5cf6',
                        borderRadius: '4px',
                        px: 1,
                        py: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}
                    >
                      {filter.count}
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          backgroundColor: '#0f0f13',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/group/${groupId}/choose-bets`)}
              sx={{
                mr: 2,
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: '#f8fafc',
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.6)',
                },
                borderRadius: 1,
              }}
            >
              Back
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
              {sportName} Events
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '60vh'
            }}>
              <CircularProgress sx={{ color: '#8b5cf6', mb: 2 }} />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Loading events...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ 
              p: 4,
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: 2,
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171'
            }}>
              {error}
            </Box>
          ) : events.length === 0 ? (
            <Box sx={{ 
              p: 6,
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <Typography variant="h6" sx={{ color: '#f8fafc', mb: 1 }}>
                No Events Available
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                There are no upcoming events for this selection.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 3, 
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CalendarTodayIcon fontSize="small" />
                Showing {events.length} upcoming events
              </Typography>
              
              {events.map((event, index) => (
                <BetCard 
                  key={event.id || index}
                  active={selectedEvent?.id === event.id}
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2
                    }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc', mb: 0.5 }}>
                          {event.name || `${event.home_team} vs ${event.away_team}`}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {formatEventDate(event.commence_time || event.date)}
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={event.status || 'Upcoming'} 
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          color: '#10b981',
                          fontWeight: 'medium',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                    
                    <Grid container spacing={2}>
                      {/* Display the betting odds/options */}
                      {event.markets?.map((market, mIndex) => (
                        <Grid item xs={12} md={6} key={mIndex}>
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 1,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                mb: 1, 
                                color: '#8b5cf6',
                                fontWeight: 'bold' 
                              }}
                            >
                              {market.name || 'Market'}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {market.outcomes?.map((outcome, oIndex) => (
                                <Chip
                                  key={oIndex}
                                  label={`${outcome.name}: ${outcome.price}`}
                                  onClick={() => handleOutcomeSelect(market, outcome)}
                                  sx={{
                                    backgroundColor: selectedOutcome?.id === outcome.id 
                                      ? 'rgba(139, 92, 246, 0.3)'
                                      : 'rgba(255, 255, 255, 0.1)',
                                    color: selectedOutcome?.id === outcome.id 
                                      ? '#8b5cf6'
                                      : '#f8fafc',
                                    fontWeight: selectedOutcome?.id === outcome.id ? 'bold' : 'normal',
                                    '&:hover': {
                                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                                    },
                                    cursor: 'pointer',
                                    borderRadius: 1,
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    
                    {selectedEvent?.id === event.id && (
                      <Box sx={{ mt: 3, textAlign: 'right' }}>
                        <Button
                          variant="contained"
                          onClick={() => handlePlaceBet(event)}
                          sx={{
                            backgroundColor: '#8b5cf6',
                            '&:hover': {
                              backgroundColor: '#7c3aed',
                            },
                            borderRadius: 1,
                            px: 3,
                          }}
                        >
                          Place Bet
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </BetCard>
              ))}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default SportEventsPage;