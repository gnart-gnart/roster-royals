import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getEventDetails, getLeague, completeLeagueEvent } from '../services/api';
import NavBar from '../components/NavBar';
import { format } from 'date-fns';

function CompleteEventPage() {
  const { leagueId, eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState(null);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [winningOutcome, setWinningOutcome] = useState('');

  // Check if user is the league captain
  const [isCaptain, setIsCaptain] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch league details
        const leagueData = await getLeague(leagueId);
        setLeague(leagueData);
        
        // Check if current user is the captain
        if (leagueData.captain.id === currentUser.id) {
          setIsCaptain(true);
        } else {
          setError('Only league captains can complete events');
        }
        
        // Fetch event details
        const eventData = await getEventDetails(eventId);
        console.log('Event details received:', eventData);
        console.log('Market data structure:', eventData.market_data);
        setEvent(eventData);
        
        // Initialize a default selection
        // We'll handle setting winningOutcome after event is set, in a separate useEffect
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId, eventId, currentUser.id]);

  // Separate useEffect to set winningOutcome after event is available
  useEffect(() => {
    if (event && event.market_data) {
      // For custom events with marketKey/outcomeKey structure
      if (event.market_data.outcomeKey) {
        console.log('Setting outcome from market_data.outcomeKey:', event.market_data.outcomeKey);
        setWinningOutcome(event.market_data.outcomeKey);
      } 
      // For other structures, default to "home"
      else {
        console.log('Setting default outcome to: "home"');
        setWinningOutcome("home");
      }
    }
  }, [event]);

  const handleOutcomeChange = (e) => {
    console.log('Selected outcome:', e.target.value);
    setWinningOutcome(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    console.log('Form submitted with outcome:', winningOutcome);

    // Validate selection
    if (!winningOutcome) {
      setError('Please select a winning outcome');
      return;
    }

    try {
      console.log('Sending API request to complete event with outcome:', winningOutcome);
      const response = await completeLeagueEvent(eventId, winningOutcome);
      console.log('API response:', response);
      setSuccess('Event completed successfully! Payouts have been processed.');
      
      // Redirect to league page after a short delay
      setTimeout(() => {
        navigate(`/league/${leagueId}`);
      }, 2000);
    } catch (err) {
      console.error('Error completing event:', err);
      setError(err.message || 'Failed to complete the event');
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  if (!isCaptain) {
    return (
      <>
        <NavBar />
        <Container sx={{ mt: 4 }}>
          <Alert severity="error">
            {error || 'Only league captains can complete events'}
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/league/${leagueId}`)}
              variant="outlined"
            >
              Back to League
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  if (event?.completed) {
    return (
      <>
        <NavBar />
        <Container sx={{ mt: 4 }}>
          <Alert severity="info">
            This event has already been completed.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/league/${leagueId}`)}
              variant="outlined"
            >
              Back to League
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/league/${leagueId}`)}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Back to League
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom>
            Complete Event
          </Typography>
          
          {league && (
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              League: {league.name}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent>
            {event && (
              <>
                <Typography variant="h5" gutterBottom>
                  {event.event_name}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Sport:</strong> {event.sport}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Start Time:</strong> {event.commence_time ? format(new Date(event.commence_time), 'PPp') : 'Unknown'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Home Team:</strong> {event.home_team || 'Unknown'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Away Team:</strong> {event.away_team || 'Unknown'}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <form onSubmit={handleSubmit}>
                  <Typography variant="h6" gutterBottom>
                    Select Winning Outcome
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="outcome-select-label">Winning Outcome</InputLabel>
                    <Select
                      labelId="outcome-select-label"
                      value={winningOutcome || ''}
                      onChange={handleOutcomeChange}
                      label="Winning Outcome"
                      required
                    >
                      {console.log('Current winningOutcome:', winningOutcome)}
                      
                      {/* Always provide these two basic options for any event */}
                      <MenuItem value="home">
                        Home Team ({event.home_team || 'Home'})
                        {event.market_data && event.market_data.odds && ` - Odds: ${event.market_data.odds}`}
                      </MenuItem>
                      <MenuItem value="away">
                        Away Team ({event.away_team || 'Away'})
                        {event.market_data && event.market_data.odds && ` - Odds: ${event.market_data.odds}`}
                      </MenuItem>
                      
                      {/* Add any additional outcome options for external API events */}
                      {(event.markets && event.markets.length > 0 && event.markets[0].outcomes) ?
                        event.markets[0].outcomes
                          .filter(outcome => outcome.name !== 'home' && outcome.name !== 'away')
                          .map(outcome => (
                            <MenuItem key={outcome.name} value={outcome.name}>
                              {outcome.name.charAt(0).toUpperCase() + outcome.name.slice(1)} - Odds: {outcome.price}
                            </MenuItem>
                          ))
                        : null
                      }
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="error">
                      This action cannot be undone. All bets will be settled based on your selection.
                    </Typography>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Complete Event
                    </Button>
                  </Box>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

export default CompleteEventPage; 