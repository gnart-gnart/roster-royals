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
  InputAdornment,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import NavBar from '../components/NavBar';
import { getLeague, getLeagueEvents, placeBet } from '../services/api';

function PlaceBetPage() {
  const { leagueId, eventId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

  // State for the bet
  const [amount, setAmount] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [eventDetails, setEventDetails] = useState(null);
  const [league, setLeague] = useState(null);

  // Fetch event details from the league events
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingEvent(true);
        
        // Get league details
        const leagueData = await getLeague(leagueId);
        setLeague(leagueData);

        // Get events from the league
        const eventsData = await getLeagueEvents(leagueId);
        console.log("League events:", eventsData); // Debug log
        console.log("Current event ID from URL:", eventId); // Debug log
        
        if (eventsData && Array.isArray(eventsData)) {
          // First try to find the event by id (which is what's typically in the URL)
          // Then fall back to event_key if not found
          const event = eventsData.find(e => String(e.id) === eventId) || 
                         eventsData.find(e => e.event_key === eventId);
          
          if (event) {
            console.log("Found event:", event); // Debug log
            
            // Check if the event has user_bets and the current user has a bet
            if (event.user_bets && event.user_bets.some(bet => bet.user_id === user.id)) {
              // User already has a bet on this event
              setErrorMsg('You have already placed a bet on this event.');
            }
            
            setEventDetails({
              id: event.id,
              key: event.event_key,
              eventId: event.event_id,
              name: event.event_name,
              sport: event.sport,
              commenceTime: event.commence_time,
              homeTeam: event.home_team,
              awayTeam: event.away_team,
              marketKey: event.market_data?.key || 'h2h',
              // Get the outcomes from market_data if available
              outcomes: event.market_data?.outcomes || [],
              // Set a default odds value based on market_data
              odds: event.market_data?.odds || 2.0,
              status: event.completed ? 'COMPLETED' : 'ACTIVE',
              created_at: event.created_at
            });
          } else {
            console.error("Event not found. eventId:", eventId);
            console.error("Available events:", eventsData.map(e => ({ id: e.id, key: e.event_key })));
            setErrorMsg('Event not found in this league');
          }
        }
      } catch (err) {
        console.error('Failed to fetch event details:', err);
        setErrorMsg('Failed to load event details. Please try again later.');
      } finally {
        setFetchingEvent(false);
      }
    };

    fetchData();
    
    // Always reload the latest user data from local storage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, [leagueId, eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    
    try {
      // Ensure we have valid numeric values
      const betAmount = parseFloat(amount);
      const currentMoney = parseFloat(user.money || 0);
      
      if (isNaN(betAmount) || betAmount <= 0) {
        throw new Error('Please enter a valid bet amount greater than zero');
      }
      
      // Check if the event is completed
      if (eventDetails.status === 'COMPLETED') {
        throw new Error('This event has already completed. You cannot place a bet.');
      }
      
      // Check if user has enough money
      if (betAmount > currentMoney) {
        throw new Error(`Insufficient funds. Your balance is $${currentMoney.toFixed(2)}`);
      }

      // Find the selected outcome odds
      let selectedOdds = eventDetails.odds;
      if (eventDetails?.outcomes && eventDetails.outcomes.length > 0) {
        const selectedOutcomeData = eventDetails.outcomes.find(
          outcome => outcome.name === selectedOutcome
        );
        if (selectedOutcomeData) {
          selectedOdds = selectedOutcomeData.price;
        }
      }

      // Call the API to place the bet
      await placeBet({
        leagueId: leagueId,
        eventKey: eventDetails.key,
        eventId: eventDetails.eventId,
        eventName: eventDetails.name,
        sport: eventDetails.sport,
        commenceTime: eventDetails.commenceTime,
        homeTeam: eventDetails.homeTeam,
        awayTeam: eventDetails.awayTeam,
        marketKey: eventDetails.marketKey,
        outcomeKey: selectedOutcome,
        odds: selectedOdds,
        amount: betAmount
      });
      
      // Update user's money locally - the server will have updated the actual amount
      const updatedMoney = currentMoney - betAmount;
      const updatedUser = { 
        ...user, 
        money: parseFloat(updatedMoney.toFixed(2))
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSuccessMsg('Your bet has been placed successfully!');
      
      // After successful bet placement, clear form
      setAmount('');
      
      // Navigate to league page after short delay
      setTimeout(() => {
        navigate(`/league/${leagueId}`);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place bet.');
    }
    
    setLoading(false);
  };

  // Generate outcome options based on the market type
  const getOutcomeOptions = () => {
    // If we have outcomes in market_data, use those
    if (eventDetails?.outcomes && eventDetails.outcomes.length > 0) {
      return eventDetails.outcomes.map(outcome => ({
        value: outcome.name,
        label: outcome.name === 'home' ? `${eventDetails.homeTeam || 'Home'} (${outcome.price})` :
               outcome.name === 'away' ? `${eventDetails.awayTeam || 'Away'} (${outcome.price})` :
               outcome.name === 'draw' ? `Draw (${outcome.price})` :
               outcome.name === 'over' ? `Over ${outcome.point} (${outcome.price})` :
               outcome.name === 'under' ? `Under ${outcome.point} (${outcome.price})` :
               `${outcome.name} (${outcome.price})`
      }));
    }

    // Default options based on market type
    const marketKey = eventDetails?.marketKey || 'h2h';
    
    switch(marketKey) {
      case 'h2h':
        return [
          { value: 'home', label: `${eventDetails?.homeTeam || 'Home Team'}` },
          { value: 'away', label: `${eventDetails?.awayTeam || 'Away Team'}` },
          { value: 'draw', label: 'Draw' }
        ];
      case 'spreads':
        return [
          { value: 'home', label: `${eventDetails?.homeTeam || 'Home Team'} (with spread)` },
          { value: 'away', label: `${eventDetails?.awayTeam || 'Away Team'} (with spread)` }
        ];
      case 'totals':
        return [
          { value: 'over', label: 'Over' },
          { value: 'under', label: 'Under' }
        ];
      default:
        return [
          { value: 'home', label: `${eventDetails?.homeTeam || 'Home Team'}` },
          { value: 'away', label: `${eventDetails?.awayTeam || 'Away Team'}` }
        ];
    }
  };

  // Calculate potential winnings
  const calculatePotentialWinnings = () => {
    if (!amount || !selectedOutcome) return '0.00';
    
    try {
      const betAmount = parseFloat(amount);
      let oddsValue = 0;
      
      // Find the odds for the selected outcome
      if (eventDetails?.outcomes && eventDetails.outcomes.length > 0) {
        const selectedOutcomeData = eventDetails.outcomes.find(
          outcome => outcome.name === selectedOutcome
        );
        if (selectedOutcomeData) {
          oddsValue = parseFloat(selectedOutcomeData.price);
        } else {
          oddsValue = parseFloat(eventDetails.odds || 2.0);
        }
      } else {
        oddsValue = parseFloat(eventDetails?.odds || 2.0);
      }
      
      if (isNaN(betAmount) || isNaN(oddsValue)) return '0.00';
      
      return (betAmount * oddsValue).toFixed(2);
    } catch (error) {
      console.error('Error calculating winnings:', error);
      return '0.00';
    }
  };

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
      <NavBar />
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Button
            variant="text"
            onClick={() => navigate(-1)}
            sx={{
              color: '#f8fafc',
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
            Place Your Bet
          </Typography>
        </Box>

        {/* User Money Display */}
        <Card sx={{ 
          bgcolor: 'rgba(22, 28, 36, 0.6)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          mb: 3 
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 2 }}>
              Your Balance
            </Typography>
            <Typography variant="h4" sx={{ color: '#10B981', fontWeight: 'bold', mb: 1 }}>
              ${parseFloat(user.money || 0).toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
              Available for betting
            </Typography>
          </CardContent>
        </Card>

        {/* Event Details Card */}
        <Card sx={{ 
          bgcolor: 'rgba(22, 28, 36, 0.6)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          mb: 3 
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 2 }}>
              Bet Details
            </Typography>
            
            {fetchingEvent ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} sx={{ color: '#8B5CF6' }} />
              </Box>
            ) : !eventDetails ? (
              <Typography variant="body1" sx={{ color: '#CBD5E1' }}>
                Event not found
              </Typography>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                    {eventDetails.name}
                  </Typography>
                  <Chip 
                    label={eventDetails.status === 'COMPLETED' ? 'Completed' : 'Active'} 
                    size="small"
                    color={eventDetails.status === 'COMPLETED' ? 'error' : 'success'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <Typography variant="body1" sx={{ color: '#CBD5E1', mb: 1 }}>
                  <strong>Sport:</strong> {eventDetails.sport}
                </Typography>
                
                <Typography variant="body1" sx={{ color: '#CBD5E1', mb: 1 }}>
                  <strong>Home Team:</strong> {eventDetails.homeTeam || 'Unknown'}
                </Typography>
                
                <Typography variant="body1" sx={{ color: '#CBD5E1', mb: 1 }}>
                  <strong>Away Team:</strong> {eventDetails.awayTeam || 'Unknown'}
                </Typography>
                
                {eventDetails.commenceTime && (
                  <Typography variant="body1" sx={{ color: '#CBD5E1', mb: 1 }}>
                    <strong>Start Time:</strong> {new Date(eventDetails.commenceTime).toLocaleString()}
                  </Typography>
                )}
                
                <Typography variant="body1" sx={{ color: '#CBD5E1', mb: 1 }}>
                  <strong>Market:</strong> {eventDetails.marketKey === 'moneyline' ? 'Moneyline' : 
                                   eventDetails.marketKey === 'spread' ? 'Spread' : 
                                   eventDetails.marketKey === 'total' ? 'Total Points' : 
                                   eventDetails.marketKey}
                </Typography>
                
                <Typography variant="body1" sx={{ color: '#CBD5E1', mb: 1 }}>
                  <strong>Odds:</strong> {eventDetails.odds}
                </Typography>
                
                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                  <strong>League:</strong> {league?.name || leagueId}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        {/* Place Bet Form */}
        <Card sx={{ 
          bgcolor: 'rgba(22, 28, 36, 0.6)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 3 }}>
              Place Your Bet
            </Typography>

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="outcome-select-label">Choose Outcome</InputLabel>
                <Select
                  labelId="outcome-select-label"
                  value={selectedOutcome}
                  onChange={(e) => setSelectedOutcome(e.target.value)}
                  label="Choose Outcome"
                  disabled={fetchingEvent || !eventDetails}
                >
                  {getOutcomeOptions().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Amount to Bet (USD)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                disabled={fetchingEvent || !eventDetails}
                sx={{ mb: 3 }}
              />

              <Box sx={{ 
                bgcolor: 'rgba(16, 185, 129, 0.1)', 
                p: 2, 
                borderRadius: '8px',
                mb: 3,
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 'medium', mb: 1 }}>
                  Potential Winnings
                </Typography>
                <Typography variant="h5" sx={{ color: '#10B981', fontWeight: 'bold' }}>
                  ${calculatePotentialWinnings()}
                </Typography>
              </Box>

              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={loading || !amount || !selectedOutcome || fetchingEvent || !eventDetails}
                sx={{
                  bgcolor: '#8B5CF6',
                  color: 'white',
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 'medium',
                  '&:hover': {
                    backgroundColor: '#7C3AED',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(139, 92, 246, 0.3)',
                  },
                }}
              >
                {loading ? 'Processing...' : 'Place Bet'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default PlaceBetPage; 