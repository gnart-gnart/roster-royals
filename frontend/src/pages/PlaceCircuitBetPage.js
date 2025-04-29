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
import { getCircuitDetail, getEventDetails, getLeague, placeBet, getCircuitCompletedBets } from '../services/api';

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
          
          // Check if user is a participant in the circuit
          const isParticipant = circuitData.participants?.some(p => p.user.id === user.id);
          
          if (isParticipant) {
            // Check if user already has a bet on this event in this circuit
            try {
              console.log(`[fetchData] Checking if user has completed bet for event ${eventId} in circuit ${circuitId}`);
              const completedBets = await getCircuitCompletedBets(circuitId);
              
              if (completedBets.includes(parseInt(eventId)) || completedBets.includes(eventId)) {
                console.log(`[fetchData] User has already placed a bet on event ${eventId}`);
                setErrorMsg('You have already placed a prediction on this event for this circuit.');
                
                // Create a placeholder bet object to indicate the bet exists
                setUserBet({
                  user_id: user.id,
                  circuit_id: parseInt(circuitId),
                  event_id: parseInt(eventId),
                  exists: true
                });
              } else {
                console.log(`[fetchData] User has not yet placed a bet on event ${eventId}`);
              }
            } catch (err) {
              console.error('Error checking completed bets:', err);
              // Continue without failing if we can't fetch completed bets
            }
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
      
      console.log(`[handleSubmit] Placing bet with value: ${betValue}`);
      console.log(`[handleSubmit] Event type:`, componentEvent.market_data?.custom ? 'custom' : 'standard');
      
      // Format the bet data according to the event type
      let outcomeKey = betValue;
      let odds = 1.0; // Default odds value for custom events
      let numericValue = null;
      
      // For tiebreaker events - parse numeric value
      if (componentEvent.betting_type === 'tiebreaker_closest' || componentEvent.betting_type === 'tiebreaker_unique') {
        // Convert betValue to number for tiebreaker events
        try {
          numericValue = parseFloat(betValue);
          if (isNaN(numericValue)) {
            throw new Error('Please enter a valid number for the tiebreaker prediction');
          }
          // Set outcomeKey to string version for consistency
          // This is critical - the backend extracts the numeric value from outcomeKey
          outcomeKey = String(numericValue); // Ensure it's a valid string
          console.log(`[handleSubmit] Tiebreaker event - parsed numeric value: ${numericValue}, using as outcomeKey: ${outcomeKey}`);
        } catch (err) {
          console.error('Error parsing numeric value:', err);
          throw new Error('Please enter a valid number for your prediction');
        }
      }
      // For number type custom events
      else if (componentEvent.market_data?.custom && 
               componentEvent.market_data?.answerType?.toLowerCase() === 'number') {
        // Convert betValue to number
        try {
          numericValue = parseFloat(betValue);
          if (isNaN(numericValue)) {
            throw new Error('Please enter a valid number');
          }
          // Set outcomeKey to string version for consistency
          outcomeKey = String(numericValue); // Ensure it's a valid string
          console.log(`[handleSubmit] Custom number event - parsed numeric value: ${numericValue}, using as outcomeKey: ${outcomeKey}`);
        } catch (err) {
          console.error('Error parsing numeric value:', err);
          throw new Error('Please enter a valid number for your prediction');
        }
      }
      // For market events, get odds from the market data
      else if (!componentEvent.market_data?.custom) {
        console.log('[handleSubmit] Standard event - looking for odds');
        const selectedOutcome = eventDetails.outcomes?.find(
          o => o.name === betValue
        );
        if (selectedOutcome) {
          odds = selectedOutcome.price;
          console.log(`[handleSubmit] Found odds ${odds} for outcome ${betValue}`);
        }
      } else {
        console.log('[handleSubmit] Custom event - using default odds 1.0');
      }
      
      // Call API to place the bet with circuit-specific data
      const response = await placeBet({
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
        weight: weight, // Include the weight of this event in the circuit
        numericValue: numericValue // Add the numeric value if this is a tiebreaker or number-type event
      });
      
      console.log('[handleSubmit] Bet placed successfully:', response);
      setSuccessMsg('Your prediction has been recorded!');
      
      // Set the user bet locally to prevent multiple submissions
      setUserBet({
        user_id: user.id,
        circuit_id: parseInt(circuitId),
        outcome: outcomeKey,
        numeric_value: numericValue,
        created_at: new Date().toISOString()
      });
      
      // Navigate back to circuit page after short delay
      setTimeout(() => {
        navigate(`/league/${leagueId}/circuit/${circuitId}`);
      }, 2000);
    } catch (err) {
      console.error('[handleSubmit] Error:', err);
      setErrorMsg(err.message || 'Failed to place prediction.');
    }
    
    setSubmitting(false);
  };

  // Render bet input based on event type
  const renderBetInput = () => {
    if (!componentEvent) return null;
    
    // Log all relevant data for debugging
    console.log('Rendering input for event:', componentEvent.event_name);
    console.log('Event data:', {
      id: componentEvent.id,
      betting_type: componentEvent.betting_type,
      is_tiebreaker: isTiebreaker,
      market_data: componentEvent.market_data,
      home_team: componentEvent.home_team,
      away_team: componentEvent.away_team
    });
    
    // Check for tiebreaker events first (highest priority)
    if (componentEvent.betting_type === 'tiebreaker_closest' || componentEvent.betting_type === 'tiebreaker_unique') {
      console.log('Rendering number input for tiebreaker event with value:', betValue);
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
    }
    
    // Then check if this is a custom event
    const isCustomEvent = componentEvent.market_data?.custom === true;
    console.log('Is custom event?', isCustomEvent);
    
    if (isCustomEvent) {
      // Get the answer type, ensuring case-insensitive comparison
      const rawAnswerType = componentEvent.market_data?.answerType || '';
      const answerType = rawAnswerType.toLowerCase().trim();
      
      console.log('Raw answer type:', rawAnswerType);
      console.log('Normalized answer type:', answerType);
      
      if (answerType === 'number') {
        console.log('Rendering number input field for custom event with value:', betValue);
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
      } else if (answerType === 'yesno') {
        console.log('Rendering yes/no radio buttons');
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
      } else if (answerType === 'multiplechoice') {
        console.log('Rendering multiple choice options:', componentEvent.market_data?.answerOptions);
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
      } else {
        console.log('Unknown answer type:', answerType);
        return (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Unknown answer type: {rawAnswerType}. Fallback to text input.
            </Alert>
            <TextField
              label="Your Prediction"
              value={betValue}
              onChange={(e) => setBetValue(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
          </>
        );
      }
    } else {
      // This is a standard market event (typically sports)
      console.log('Rendering standard market event input');
      console.log('Outcomes:', eventDetails?.outcomes);
      
      // Check if outcomes exist in eventDetails
      if (!eventDetails?.outcomes || eventDetails.outcomes.length === 0) {
        console.log('No outcomes available, showing home/away options');
        // Make sure home/away teams exist before showing them
        if (componentEvent.home_team || componentEvent.away_team) {
          return (
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Outcome</InputLabel>
              <Select
                value={betValue}
                onChange={(e) => setBetValue(e.target.value)}
                label="Select Outcome"
              >
                {componentEvent.home_team && <MenuItem value="home">{componentEvent.home_team}</MenuItem>}
                {componentEvent.away_team && <MenuItem value="away">{componentEvent.away_team}</MenuItem>}
              </Select>
            </FormControl>
          );
        } else {
          // If no teams, check if there are options in market_data
          const options = componentEvent.market_data?.options || [];
          if (options.length > 0) {
            return (
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Option</InputLabel>
                <Select
                  value={betValue}
                  onChange={(e) => setBetValue(e.target.value)}
                  label="Select Option"
                >
                  {options.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else {
            // Fallback to text input if no structured options are available
            return (
              <TextField
                label="Your Prediction"
                value={betValue}
                onChange={(e) => setBetValue(e.target.value)}
                fullWidth
                required
                margin="normal"
              />
            );
          }
        }
      }
      
      console.log('Showing outcomes with odds');
      // Handle outcomes with available odds
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

  // Helper function to format prediction display based on event type
  const formatPredictionDisplay = () => {
    if (!componentEvent || !userBet || !userBet.outcome) return 'Unknown';
    
    const isCustomEvent = componentEvent.market_data?.custom;
    if (isCustomEvent) {
      // For custom events, just show the outcome directly
      return userBet.outcome;
    } else {
      // For standard events with teams, format the outcome
      if (userBet.outcome === 'home') {
        return componentEvent.home_team || 'Home';
      } else if (userBet.outcome === 'away') {
        return componentEvent.away_team || 'Away';
      } else if (userBet.outcome === 'draw') {
        return 'Draw';
      } else {
        return userBet.outcome;
      }
    }
  };

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
              ) : componentEvent.betting_type === 'tiebreaker_closest' || componentEvent.betting_type === 'tiebreaker_unique' ? (
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'rgba(20, 30, 48, 0.5)' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tiebreaker Event: Numerical prediction required
                  </Typography>
                </Paper>
              ) : componentEvent.home_team || componentEvent.away_team ? (
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'rgba(20, 30, 48, 0.5)' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Teams: <strong>{componentEvent.home_team || ''}</strong> {componentEvent.home_team && componentEvent.away_team ? 'vs' : ''} <strong>{componentEvent.away_team || ''}</strong>
                  </Typography>
                </Paper>
              ) : null}
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
                  You predicted: <strong>{formatPredictionDisplay()}</strong>
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