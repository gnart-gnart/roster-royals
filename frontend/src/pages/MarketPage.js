import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardContent, Box, Button,
  CircularProgress, Divider, List, ListItem, ListItemText,
  Accordion, AccordionSummary, AccordionDetails, Chip,
  Paper, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsHockeyIcon from '@mui/icons-material/SportsHockey';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import { browseMarket, getAvailableSportEvents, getEventDetails, placeBet } from '../services/api';
import NavBar from '../components/NavBar';

const getSportIcon = (sportGroup) => {
  switch (sportGroup.toLowerCase()) {
    case 'soccer':
      return <SportsSoccerIcon />;
    case 'basketball':
      return <SportsBasketballIcon />;
    case 'american football':
      return <SportsFootballIcon />;
    case 'baseball':
      return <SportsBaseballIcon />;
    case 'hockey':
      return <SportsHockeyIcon />;
    default:
      return null;
  }
};

function MarketPage() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [sportsGroups, setSportsGroups] = useState({});
  const [allSports, setAllSports] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewState, setViewState] = useState('groups'); // 'groups', 'sports', 'events', 'event-details'
  const user = JSON.parse(localStorage.getItem('user')) || { username: '' };

  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoading(true);
        const data = await browseMarket();
        
        if (data && data.data && data.data.grouped_sports) {
          setSportsGroups(data.data.grouped_sports);
          setAllSports(data.data.sports || []);
        } else {
          setError('Failed to load sports data.');
        }
      } catch (err) {
        console.error('Error fetching sports:', err);
        setError('Failed to load sports. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setViewState('sports');
  };

  const handleSportSelect = async (sport) => {
    try {
      setLoading(true);
      setSelectedSport(sport);
      setViewState('events');

      const eventsData = await getAvailableSportEvents(sport.key);
      if (Array.isArray(eventsData)) {
        setEvents(eventsData);
      } else {
        setEvents([]);
        setError('No events found for this sport.');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = async (event) => {
    try {
      setLoading(true);
      const eventDetails = await getEventDetails(event.id);
      setSelectedEvent(eventDetails);
      setViewState('event-details');
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEventToLeague = async (event) => {
    try {
      setLoading(true);
      
      // Format the event data for our backend
      const eventData = {
        leagueId: leagueId,
        eventKey: event.id,
        eventName: `${event.away_team} @ ${event.home_team}`,
        sport: event.sport_key,
        // Include basic market data if available
        marketData: event.bookmakers && event.bookmakers.length > 0 
          ? { bookmaker: event.bookmakers[0].key, markets: event.bookmakers[0].markets }
          : {}
      };
      
      // Call the API to add this event to the league
      await placeBet(eventData);
      
      // Navigate back to the league page
      navigate(`/league/${leagueId}`);
    } catch (err) {
      console.error('Error adding event to league:', err);
      setError('Failed to add event to league. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSportsGroups = () => {
    return (
      <Grid container spacing={3}>
        {Object.keys(sportsGroups).map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group}>
            <Card 
              onClick={() => handleGroupSelect(group)}
              sx={{
                cursor: 'pointer',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9))',
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  {getSportIcon(group)}
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {group}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {sportsGroups[group].length} sports available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderSports = () => {
    if (!selectedGroup || !sportsGroups[selectedGroup]) return null;
    
    return (
      <>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => setViewState('groups')}
            sx={{ mr: 2 }}
          >
            Back to Categories
          </Button>
          <Typography variant="h5" component="div">
            Sports in {selectedGroup}
          </Typography>
        </Box>
        
        <List component={Paper} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', borderRadius: '12px' }}>
          {sportsGroups[selectedGroup].map((sport) => (
            <ListItem 
              key={sport.key} 
              button 
              onClick={() => handleSportSelect(sport)}
              divider
              sx={{ 
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(51, 65, 85, 0.8)' }
              }}
            >
              <ListItemText 
                primary={sport.title} 
                secondary={sport.description} 
              />
              {sport.active && (
                <Chip 
                  label="Active" 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                  sx={{ ml: 1 }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </>
    );
  };

  const renderEvents = () => {
    if (!selectedSport) return null;
    
    const formatDate = (dateString) => {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
      <>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => setViewState('sports')}
            sx={{ mr: 2 }}
          >
            Back to Sports
          </Button>
          <Typography variant="h5" component="div">
            Events for {selectedSport.title}
          </Typography>
        </Box>
        
        {events.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 3, textAlign: 'center' }}>
            No events found for this sport.
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', borderRadius: '12px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow 
                    key={event.id}
                    sx={{ 
                      '&:hover': { bgcolor: 'rgba(51, 65, 85, 0.8)' },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleEventSelect(event)}
                  >
                    <TableCell>{event.away_team} @ {event.home_team}</TableCell>
                    <TableCell>{formatDate(event.commence_time)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddEventToLeague(event);
                        }}
                      >
                        Add to League
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </>
    );
  };

  const renderEventDetails = () => {
    if (!selectedEvent) return null;
    
    const formatDate = (dateString) => {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
      <>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => setViewState('events')}
            sx={{ mr: 2 }}
          >
            Back to Events
          </Button>
          <Typography variant="h5" component="div">
            Event Details
          </Typography>
        </Box>
        
        <Card sx={{ mb: 4, bgcolor: 'rgba(30, 41, 59, 0.8)', borderRadius: '12px' }}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              {selectedEvent.away_team} @ {selectedEvent.home_team}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {formatDate(selectedEvent.commence_time)}
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1">
                Sport: {selectedEvent.sport_key}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleAddEventToLeague(selectedEvent)}
              >
                Add to League
              </Button>
            </Box>
            
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Available Markets
            </Typography>
            
            {selectedEvent.bookmakers && selectedEvent.bookmakers.length > 0 ? (
              selectedEvent.bookmakers.map((bookmaker) => (
                <Accordion 
                  key={bookmaker.key}
                  sx={{ 
                    bgcolor: 'rgba(51, 65, 85, 0.8)', 
                    mb: 2,
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{bookmaker.title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {bookmaker.markets.map((market) => (
                      <Box key={market.key} sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {market.key === 'h2h' ? 'Moneyline' : 
                           market.key === 'spreads' ? 'Point Spread' : 
                           market.key === 'totals' ? 'Over/Under' : market.key}
                        </Typography>
                        <Grid container spacing={2}>
                          {market.outcomes.map((outcome) => (
                            <Grid item xs={12} sm={6} md={4} key={outcome.name}>
                              <Paper 
                                elevation={2}
                                sx={{ 
                                  p: 2, 
                                  textAlign: 'center',
                                  bgcolor: 'rgba(30, 41, 59, 0.9)', 
                                }}
                              >
                                <Typography variant="body1" gutterBottom>
                                  {outcome.name}
                                </Typography>
                                <Typography variant="h6" color="primary">
                                  {outcome.price}
                                </Typography>
                                {market.key === 'spreads' && (
                                  <Typography variant="body2" color="text.secondary">
                                    Spread: {outcome.point}
                                  </Typography>
                                )}
                                {market.key === 'totals' && (
                                  <Typography variant="body2" color="text.secondary">
                                    Total: {outcome.point}
                                  </Typography>
                                )}
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography>No odds available for this event</Typography>
            )}
          </CardContent>
        </Card>
      </>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography color="error" variant="body1">{error}</Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={() => navigate(`/league/${leagueId}`)}
          >
            Back to League
          </Button>
        </Box>
      );
    }

    switch (viewState) {
      case 'sports':
        return renderSports();
      case 'events':
        return renderEvents();
      case 'event-details':
        return renderEventDetails();
      case 'groups':
      default:
        return renderSportsGroups();
    }
  };

  return (
    <Box sx={{ bgcolor: '#0f172a', minHeight: '100vh', pb: 4 }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          {viewState === 'groups' && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/league/${leagueId}`)}
              sx={{ mr: 2 }}
            >
              Back to League
            </Button>
          )}
          <Typography variant="h4" component="h1">
            Browse Market
          </Typography>
        </Box>

        {renderContent()}
      </Container>
    </Box>
  );
}

export default MarketPage; 