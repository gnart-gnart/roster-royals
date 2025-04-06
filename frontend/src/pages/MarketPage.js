import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardContent, Box, Button,
  CircularProgress, Divider, List, ListItem, ListItemText,
  Accordion, AccordionSummary, AccordionDetails, Chip,
  Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, SvgIcon
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsHockeyIcon from '@mui/icons-material/SportsHockey';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import SportsRugbyIcon from '@mui/icons-material/SportsRugby';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AddIcon from '@mui/icons-material/Add';
import { browseMarket, getAvailableSportEvents, getEventDetails, placeBet } from '../services/api';
import NavBar from '../components/NavBar';

// Custom cricket icon in Material style
const CricketIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M14.73,2C14.92,2 15.07,2 15.2,2C15.38,2.1 15.47,2.28 15.47,2.54C15.5,2.79 15.39,2.95 15.14,3.05C14.89,3.14 14.67,3.3 14.42,3.5C13.77,4.06 13.22,4.73 12.75,5.5C11.97,6.94 11.47,8.5 11.25,10.19C11.25,10.38 11.27,10.59 11.28,10.75C11.31,11.04 11.22,11.19 10.91,11.25C10.57,11.33 10.22,11.5 9.83,11.75C9.39,12.04 9,12.36 8.61,12.75C7.97,13.36 7.35,13.97 6.75,14.59C6.69,14.67 6.61,14.75 6.55,14.82L17.25,14.75C17.39,14.75 17.55,14.78 17.68,14.84C17.92,14.94 18,15.14 17.93,15.39C17.84,15.67 17.61,15.75 17.22,15.75C15.27,15.75 13.33,15.75 11.38,15.75C10.94,15.75 10.5,15.75 10.05,15.75C9.59,15.75 9.13,15.75 8.66,15.75C7.77,15.75 6.89,15.75 6,15.75C5.23,15.75 4.53,15.75 3.8,15.75C3.68,15.75 3.56,15.72 3.44,15.66C3.2,15.55 3.11,15.38 3.19,15.12C3.25,14.88 3.42,14.77 3.78,14.75C4.64,14.73 5.5,14.63 6.34,14.48C6.71,14.42 7.04,14.25 7.34,14C7.81,13.62 8.25,13.23 8.67,12.81C9.09,12.39 9.5,11.95 9.91,11.52C10.19,11.23 10.53,11.04 10.94,10.97C11.07,10.94 11.16,10.85 11.22,10.72C11.27,10.54 11.3,10.34 11.33,10.12C11.54,8.42 12.04,6.86 12.84,5.44C13.33,4.55 13.94,3.75 14.73,3.05C14.73,3.04 14.74,3.02 14.75,3C14.96,2.81 15.13,2.61 15.28,2.38C15.34,2.28 15.31,2.19 15.19,2.12C15.05,2.04 14.9,2 14.75,2L14.73,2M19.5,7.5C20.33,7.5 21,8.17 21,9C21,9.83 20.33,10.5 19.5,10.5C18.67,10.5 18,9.83 18,9C18,8.17 18.67,7.5 19.5,7.5M19.5,13.5C20.33,13.5 21,14.17 21,15C21,15.83 20.33,16.5 19.5,16.5C18.67,16.5 18,15.83 18,15C18,14.17 18.67,13.5 19.5,13.5M16.5,10.5C17.33,10.5 18,11.17 18,12C18,12.83 17.33,13.5 16.5,13.5C15.67,13.5 15,12.83 15,12C15,11.17 15.67,10.5 16.5,10.5Z" />
  </SvgIcon>
);

// Custom boxing icon in Material style
const BoxingIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M12,2C9,7 4,9 4,14C4,16 6,18 8,18C9,18 10,18 11,17C11,17 11.32,19 9,22H15C14,22 13,21 13,20C14,21 15,22 17,22C18,22 19,21 19,20C19,19 19,17 17,15C15,13 13,13 13,12C13,11 15,9 15,7C15,5 14,2 12,2Z" />
  </SvgIcon>
);

// Custom lacrosse icon in Material style
const LacrosseIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M20.87,12.5C20.87,16 17.93,18.75 14.39,18.75C13.14,18.75 11.97,18.38 11,17.75V20.5H5V14L9.33,14V16.29C10.26,16.94 12.14,17.25 13.21,17.25C15.63,17.25 17.57,15.38 17.57,12.5C17.57,9.62 15.63,7.75 13.21,7.75C12.14,7.75 10.26,8.07 9.33,8.71V11H5V4.5H11V7.25C11.97,6.63 13.14,6.25 14.39,6.25C17.93,6.25 20.87,9 20.87,12.5Z" />
  </SvgIcon>
);

const getSportIcon = (sportGroup) => {
  // Define icon and use consistent purple color for all sports
  let icon;
  const color = '#8B5CF6'; // Purple for all sports

  switch (sportGroup.toLowerCase()) {
    case 'soccer':
      icon = <SportsSoccerIcon />;
      break;
    case 'basketball':
      icon = <SportsBasketballIcon />;
      break;
    case 'american football':
      icon = <SportsFootballIcon />;
      break;
    case 'baseball':
      icon = <SportsBaseballIcon />;
      break;
    case 'hockey':
    case 'ice hockey':
      icon = <SportsHockeyIcon />;
      break;
    case 'tennis':
      icon = <SportsTennisIcon />;
      break;
    case 'golf':
      icon = <SportsGolfIcon />;
      break;
    case 'mixed martial arts':
    case 'boxing':
      icon = <SportsMmaIcon />;
      break;
    case 'rugby league':
      icon = <SportsRugbyIcon />;
      break;
    case 'aussie rules':
      icon = <SportsKabaddiIcon />;
      break;
    case 'cricket':
      icon = <CricketIcon />;
      break;
    case 'lacrosse':
      icon = <LacrosseIcon />;
      break;
    case 'politics':
      icon = <HowToVoteIcon />;
      break;
    default:
      icon = <SportsBaseballIcon />;
      break;
  }

  return { icon, color };
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
        eventId: event.id, // Include the event ID from the API
        eventName: `${event.away_team} @ ${event.home_team}`,
        sport: event.sport_key,
        commenceTime: event.commence_time,
        homeTeam: event.home_team,
        awayTeam: event.away_team,
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
                borderTop: '3px solid #8B5CF6',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(139, 92, 246, 0.2)',
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9))',
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      color: '#8B5CF6',
                      '& > *': { fontSize: '1.8rem' },
                    }}
                  >
                    {getSportIcon(group).icon}
                  </Box>
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