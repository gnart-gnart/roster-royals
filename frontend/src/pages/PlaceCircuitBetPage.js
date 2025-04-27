import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  Chip,
  Paper,
  Grid,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import FunctionsIcon from '@mui/icons-material/Functions';
import GavelIcon from '@mui/icons-material/Gavel';
import { format } from 'date-fns';
import NavBar from '../components/NavBar';
import { getCircuitDetail, getEventDetails, getLeague, placeBet, getCircuitUserBets } from '../services/api';

function PlaceCircuitBetPage() {
  const { leagueId, circuitId, eventId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

  // State for circuit and event data
  const [circuit, setCircuit] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [componentEvent, setComponentEvent] = useState(null);
  const [weight, setWeight] = useState(1);
  
  // State for user bet
  const [userBet, setUserBet] = useState(null);
  const [betValue, setBetValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isTiebreaker, setIsTiebreaker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get circuit details
        const circuitData = await getCircuitDetail(circuitId);
        console.log('Circuit data:', circuitData);
        setCircuit(circuitData);
        
        // Find the specific component event
        const foundEvent = circuitData.component_events?.find(
          e => e.league_event.id.toString() === eventId
        );
        
        if (foundEvent) {
          console.log('Found component event:', foundEvent);
          setComponentEvent(foundEvent.league_event);
          setWeight(foundEvent.weight);
          setIsTiebreaker(circuitData.tiebreaker_event?.id === foundEvent.league_event.id);
          
          // Get detailed event information
          const detailedEvent = await getEventDetails(eventId);
          console.log('Detailed event data:', detailedEvent);
          setEventDetails(detailedEvent);
          
          // Check if user already has a bet on this event in this circuit
          try {
            const existingBets = await getCircuitUserBets(circuitId, eventId);
            console.log('Existing bets for this event in circuit:', existingBets);
            
            const currentUserBet = existingBets.find(bet => bet.user_id === user.id);
            if (currentUserBet) {
              console.log('User already has a bet:', currentUserBet);
              setUserBet(currentUserBet);
              setErrorMsg('You have already placed a prediction on this event for this circuit.');
              
              // Pre-fill the form with their existing bet value
              if (currentUserBet.outcome) {
                setBetValue(currentUserBet.outcome);
              }
            }
          } catch (err) {
            console.error('Error fetching existing bets:', err);
            // Continue without failing if we can't fetch bets
          }
        } else {
          setErrorMsg('Event not found in this circuit');
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setErrorMsg('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [circuitId, eventId, user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);
    
    try {
      // Check if user already has a bet
      if (userBet) {
        throw new Error('You have already placed a prediction for this event in this circuit.');
      }
      
      if (!betValue) {
        throw new Error('Please select a prediction value');
      }
      
      // Format the bet data according to the event type
      let outcomeKey = betValue;
      let odds = 1.0; // Default odds value for custom events
      
      // For market events, get odds from the market data
      if (!componentEvent.market_data?.custom) {
        const selectedOutcome = eventDetails.outcomes?.find(
          o => o.name === betValue
        );
        if (selectedOutcome) {
          odds = selectedOutcome.price;
        }
      }
      
      // Call API to place the bet with circuit-specific data
      await placeBet({
        leagueId: leagueId,
        eventKey: componentEvent.event_key,
        eventId: componentEvent.id,
        eventName: componentEvent.event_name,
        sport: componentEvent.sport,
        commenceTime: componentEvent.commence_time,
        homeTeam: componentEvent.home_team || '',
        awayTeam: componentEvent.away_team || '',
        marketKey: componentEvent.market_data?.marketKey || 'h2h',
        outcomeKey: outcomeKey,
        odds: odds,
        amount: 0, // No money is placed on circuit bets
        circuitId: circuitId, // Add circuit ID for backend to know this is a circuit bet
        isCircuitBet: true, // Flag to indicate this is a circuit bet
        weight: weight // Include the weight of this event in the circuit
      });
      
      setSuccessMsg('Your prediction has been recorded!');
      
      // Set the user bet locally to prevent multiple submissions
      setUserBet({
        user_id: user.id,
        outcome: outcomeKey,
        created_at: new Date().toISOString()
      });
      
      // Navigate back to circuit page after short delay
      setTimeout(() => {
        navigate(`/league/${leagueId}/circuit/${circuitId}`);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place prediction.');
    }
    
    setSubmitting(false);
  };

  // Render bet input based on event type
  const renderBetInput = () => {
    if (!componentEvent) return null;
    
    // Check if this is a custom event
    const isCustomEvent = componentEvent.market_data?.custom;
    
    if (isCustomEvent) {
      const answerType = componentEvent.market_data?.answerType;
      
      switch (answerType) {
        case 'number':
          return (
            <TextField
              label="Your Prediction"
              type="number"
              value={betValue}
              onChange={(e) => setBetValue(e.target.value)}
              fullWidth
              required
              margin="normal"
              InputProps={{
                inputProps: { step: 'any' }
              }}
            />
          );
        case 'yesNo':
          return (
            <FormControl component="fieldset" fullWidth margin="normal">
              <RadioGroup
                value={betValue}
                onChange={(e) => setBetValue(e.target.value)}
              >
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          );
        case 'multipleChoice':
          const options = componentEvent.market_data?.answerOptions || [];
          return (
            <FormControl fullWidth margin="normal">
              <InputLabel>Select an Option</InputLabel>
              <Select
                value={betValue}
                onChange={(e) => setBetValue(e.target.value)}
                label="Select an Option"
              >
                {options.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        default:
          return <Alert severity="error">Unknown answer type</Alert>;
      }
    } else {
      // This is a market event (typically sports)
      // Debug logs to check outcome data
      console.log('Rendering market event input with outcomes:', eventDetails?.outcomes);
      console.log('Market data from component event:', componentEvent.market_data);
      
      // Check if outcomes exist in eventDetails
      if (!eventDetails?.outcomes || eventDetails.outcomes.length === 0) {
        // Fallback to using basic home/away options if no outcomes are available
        const fallbackOptions = [
          { name: 'home', price: 1.0 },
          { name: 'away', price: 1.0 }
        ];
        
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Outcome</InputLabel>
            <Select
              value={betValue}
              onChange={(e) => setBetValue(e.target.value)}
              label="Select Outcome"
            >
              <MenuItem value="home">{componentEvent.home_team || 'Home'} (1.0)</MenuItem>
              <MenuItem value="away">{componentEvent.away_team || 'Away'} (1.0)</MenuItem>
            </Select>
          </FormControl>
        );
      }
      
      // Handle home/away team selection with available outcomes
      return (
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Outcome</InputLabel>
          <Select
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            label="Select Outcome"
          >
            {eventDetails?.outcomes?.map((outcome, index) => (
              <MenuItem key={index} value={outcome.name}>
                {outcome.name === 'home' ? `${componentEvent.home_team || 'Home'} (${outcome.price})` :
                 outcome.name === 'away' ? `${componentEvent.away_team || 'Away'} (${outcome.price})` :
                 outcome.name === 'draw' ? `Draw (${outcome.price})` :
                 `${outcome.name} (${outcome.price})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
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

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh', pb: 4 }}>
      <NavBar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={() => navigate(`/league/${leagueId}/circuit/${circuitId}`)} 
          sx={{ mb: 3 }}
        >
          Back to Circuit
        </Button>

        <Typography variant="h4" gutterBottom>
          {userBet ? 'Your Prediction' : 'Place Prediction'}
        </Typography>

        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

        {componentEvent && (
          <Card sx={{ mb: 3, bgcolor: 'rgba(30, 41, 59, 0.7)' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {componentEvent.event_name}
                    {isTiebreaker && (
                      <Chip 
                        icon={<GavelIcon />} 
                        label="Tiebreaker" 
                        color="secondary" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box display="flex" alignItems="center">
                    <SportsSoccerIcon sx={{ mr: 1, opacity: 0.7 }} />
                    <Typography variant="body2">
                      Sport: <strong>{componentEvent.sport}</strong>
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box display="flex" alignItems="center">
                    <EventIcon sx={{ mr: 1, opacity: 0.7 }} />
                    <Typography variant="body2">
                      Date: <strong>
                        {componentEvent.commence_time 
                          ? format(new Date(componentEvent.commence_time), 'PPp') 
                          : 'N/A'}
                      </strong>
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box display="flex" alignItems="center">
                    <FunctionsIcon sx={{ mr: 1, opacity: 0.7 }} />
                    <Typography variant="body2">
                      Weight: <strong>x{weight}</strong>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {componentEvent.market_data?.custom ? (
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'rgba(20, 30, 48, 0.5)' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Custom Event: {componentEvent.market_data.answerType} answer required
                  </Typography>
                </Paper>
              ) : (
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'rgba(20, 30, 48, 0.5)' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Teams: <strong>{componentEvent.home_team}</strong> vs <strong>{componentEvent.away_team}</strong>
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        )}

        {userBet ? (
          // Display existing bet information if the user already has a bet
          <Paper sx={{ p: 3, bgcolor: 'rgba(30, 41, 59, 0.7)' }}>
            <Typography variant="h6" gutterBottom>
              Your Current Prediction
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  You predicted: <strong>{userBet.outcome}</strong>
                </Typography>
              </Grid>
              {userBet.created_at && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Submitted on {format(new Date(userBet.created_at), 'PPp')}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/league/${leagueId}/circuit/${circuitId}`)}
                  fullWidth
                >
                  Return to Circuit
                </Button>
              </Grid>
            </Grid>
          </Paper>
        ) : (
          // Show the prediction form if the user doesn't have a bet yet
          <Paper sx={{ p: 3, bgcolor: 'rgba(30, 41, 59, 0.7)' }}>
            <Typography variant="h6" gutterBottom>
              Your Prediction
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <form onSubmit={handleSubmit}>
              {renderBetInput()}
              
              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={submitting || !!errorMsg}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Submit Prediction'}
                </Button>
              </Box>
            </form>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default PlaceCircuitBetPage; 